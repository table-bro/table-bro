# The page scroll in WebKit

The page scroll of the table is smooth in Chromium and Firefox and less so in Safari. This note records what the
measurements found, what is fixed and what is left: moving the scroll to the compositor and the cost of the clipped
cells, which grows with the number of rows in WebKit. Both change the architecture of the scroll and wait for a
release of their own.

## How the scroll works

All the animations of an instance run in one `requestAnimationFrame` loop, `BroMotion` in
`packages/core/shared/motion.ts`. A change of the page starts `animateKinetic('pagination')` in `renderScroll()` of
`packages/core/controller/body.controller.ts`: an exponential decay with the time constant `--bro-kinetic-time-constant`
(280 ms), which ends when less than half a pixel of the distance remains. A scroll of 400 px takes about
`280 × ln(800) ≈ 1.9 s`.

Each frame:

- takes the target again from the model (`rowHeights.calcTableHeight()`), since details may change the heights of the
  rows while the page scrolls;
- writes `transform: translate3d(0, Ypx, 0)` to the scrolling container, which holds **all** the loaded rows
  (`table-body-scrolling-container.view.ts`, `setTop()`);
- calls `layout.windowMoved()`. Without Island Details it does nothing; with it, it writes the heights of the shadows
  and the corner radii, a layout and a paint at every frame.

No layout is forced inside the frame: a trace of Chromium shows 1 Layout, 2 Paint and 125 Commit over a scroll of
1.9 s with 2000 rows.

## What the measurements found

The numbers come from Playwright WebKit 26.6 (headless and headed), Chromium and Firefox on a MacBook Pro M2 Pro with a
120 Hz display, on the stand built for development. The time of a frame is measured from the callback of
`requestAnimationFrame` to the next task of a `MessageChannel`: a proxy of the main thread work, not the time the frame
reaches the display. Safari itself was not measured.

1. **The dimming of a refresh rewrote a `<style>` at every frame.** In the server mode a new page loads, and the fade of
   the dimming ran during the fastest part of the scroll. A new text of a `<style>` makes WebKit match the rules of the
   whole document again: the first frames took 9–18 ms in WebKit, 1–3 ms in Chromium. Fixed: the rule is written once
   and the frames change a custom property, 4 ms per frame.
2. **The frame times of WebKit are uneven.** WebKit rounds them to 1 ms and gives 16, 17 and 18 ms at 60 Hz, 10–12 ms
   at the start. A position computed from that time moves by steps that differ by up to 20 %, and a run that started
   at the call moved by 3–5 px at its first frame and by 12–21 px at the next ones. Fixed: `BroMotion` puts the frame
   times on the grid of the frame period and starts a run one period before its first frame. Uneven frames went from
   9–19 of 65 to none in WebKit, from 4–15 of 105 to none in Chromium at 120 Hz.
3. **WebKit runs `requestAnimationFrame` at 60 Hz on a 120 Hz display**, Chromium at 120 Hz. A scroll drawn from the
   main thread has half the frames in Safari. Only an animation on the compositor can lift the limit, see below.
4. **The cost of a frame grows with the number of rows in WebKit.** Each `.bro-cell_component` and each ellipsis
   container has `overflow: hidden`, and in `nv` WebKit gets `overflow-x: clip` on the link of every details button and
   `will-change: transform` on its icon. WebKit seems to walk these layers at every frame; the mechanism is a guess, the
   cost is measured:

   | Rows | Table | WebKit, ms | Chromium, ms |
   | --- | --- | --- | --- |
   | 500 | `nv` with details | 4–5 | 0.9 |
   | 2000 | `nv` with details | 10–11 | 1 |
   | 2000 | without details | 6 | not measured |
   | 10000 | without details | 21 | 0.9 |
   | 10000 | `nv` with details | 64 (about 15 fps) | 1 |
   | 10000 | `nv`, no `will-change` on the icon | 37 | not measured |
   | 10000 | `nv`, no `will-change`, no `overflow-x: clip` | 27 | not measured |
   | 10000 | without details, no `overflow` on the cells | 2 | not measured |
   | 10000 | `overflow: clip` instead of `hidden` | 21 | not measured |

   Tried and dropped: `content-visibility: auto` on `td` (34 ms), the scroll by `scrollTop` instead of `transform`
   (6 ms, but 14 ms at the 95th percentile and no curve of our own), `scrollTo({behavior: 'smooth'})` (1 ms, but the
   browser chooses the curve and the duration).

## Left: the layers of the details buttons in `nv`

The layers of the details buttons can be limited to the rows of the current page:

```scss
// packages/skins/native/styles/skin/vanilla-js/native/table-bro/_button.scss, in @supports (font: -apple-system-body)
tr:not([aria-hidden]) & {
  overflow-x: clip;

  > .bro-button-toggle {
    will-change: transform;
  }
}
```

It takes a frame of 10000 rows from 64 to 37 ms, and to 27 ms without `overflow-x: clip` on the hidden rows. Below
2000 rows the gain is small. The risk: `will-change` keeps the icon in a layer of its own because Safari once painted the
old icon next to the new one in a shared layer. The rows of the target page get `aria-hidden` removed only in
`renderPage()` at the end of the scroll, so during the scroll they have no layer; whether the artifact comes back for
them is to be checked in Safari. The change is a special case of the clip of the visible rows below and is best made
with it.

## Left: the scroll on the compositor

The scroll would run as a Web Animation of `transform` on the scrolling container, with the kinetic curve as a
`linear()` easing. The compositor draws it without the main thread, so neither the cost of the frame on the main thread
nor, probably, the 60 Hz of `requestAnimationFrame` in Safari limits it.

The curve of the decay up to the remaining half pixel, normalized to end at 1:

```ts
// τ: the time constant, d: the distance in px
const duration = tau * Math.log(2 * Math.abs(d));
const norm = 1 - Math.exp(-duration / tau);
const points = Array.from({length: 41}, (_, i) =>
  `${((1 - Math.exp(-(i / 40) * duration / tau)) / norm).toFixed(4)} ${(i * 2.5).toFixed(1)}%`);

this.el.style.transform = `translate3d(0, ${to}px, 0)`;
this.el.animate(
  [{transform: `translate3d(0, ${from}px, 0)`}, {transform: `translate3d(0, ${to}px, 0)`}],
  {duration, easing: `linear(${points.join(', ')})`}
);
```

What the prototype showed, and what it needs:

- **The main thread at the start and at the end.** With the layers of the cells as they are, WebKit spends 75 ms at the
  start of the animation for 2000 rows with details, 90–310 ms at the start and 40–130 ms at the end for 10000 rows.
  Without the `overflow` of the cells there is no such delay. So the scroll on the compositor needs the clip of the
  visible rows below, or a body with fewer rows in the DOM.
- **The target changes during the scroll.** Details that open or close change the heights of the rows, and the frame of
  the loop takes the target again. A Web Animation has a fixed end: a new target needs a new animation that starts from
  the current position, computed from the curve (`from + (to − from) × curve(elapsed)`), not read from the DOM, which
  would force a style recalculation.
- **Island Details** writes the shadows and the corners of its rows at every frame (`windowMoved()`). Its tables keep
  the scroll in the loop, or Island Details draws its shadows with the same Web Animation.
- **The body height and the details** keep running in the loop; they start in the same batch as the scroll and must end
  with it, as the kinetic group of `BroMotion` makes them now.
- **Browser support.** `linear()` exists from Safari 17.2, Chrome 113 and Firefox 112; the core supports Safari 16. Older
  browsers keep the scroll of the loop.
- **Debugging.** `durationScale`, `pause()`, `step()` and `tracks()` of `BroMotion` see only the loop. The animation of the
  compositor follows them through `Animation.playbackRate`, `pause()` and `currentTime`.
- **`prefers-reduced-motion`** gives a duration of 0, which ends the scroll at once without an animation.

Not checked: whether Safari draws such an animation at 120 Hz, and whether a start delayed by the main thread shows as
a jump.

## Left: the clipped cells

`overflow: hidden` of `.bro-cell_component` (`packages/core/styles/components/material-based/_table.scss`) and of the
ellipsis container is the main reason why the cost of a frame grows with the rows in WebKit. It cannot simply go: the
clip of a value wider than its column and `-webkit-line-clamp: 1` of the plain values depend on it, and
`overflow: clip` costs the same. The options:

1. **Clip only the rows that the scroll passes.** At the start of a scroll the controller marks the rows from the
   current page to the target page with an attribute, the rule of the clip takes `[data-bro-visible]` (or the reverse:
   the hidden rows lose the clip), and the end of the scroll removes the marks from the rows that leave the window. The
   hidden rows keep their size, since the row height is fixed and the column widths come from the aux table. To check:
   the measurement of the widths, which reads the components of the body; a row that becomes visible without its clip
   for one frame; the focus ring, which already turns the clip off for a control in focus.
2. **A virtual body.** Only the current page and N pages around it stay in the DOM, the rest is replaced by a spacer of
   their height. This removes the cost of the hidden rows for every browser and every style, also outside the scroll,
   but touches the model of the rows, the heights of the details, Island Details, the search of the browser in the
   page and the accessibility tree.
3. **The scroll on the compositor with option 1**: the clip of the visible rows removes the delays at the start and the
   end, and the compositor removes the work of each frame.

Option 1 is the smallest step and includes the change of the details buttons above. Option 3 gives the most to Safari
and depends on option 1 anyway.

## How to measure

Build the stand, open a table with many rows, and record in each browser the time of each frame of a page change:
`performance.now()` in the callback of `requestAnimationFrame`, then again in the next task of a `MessageChannel`, and
the offset of the scrolling container from its `transform`. Compare the steps of the offset between frames and the work
per frame for 500, 2000 and 10000 rows, with and without details, in `mat`, `bs` and `nv`, in the server mode as well.
Safari itself is driven by `safaridriver` after **Develop › Allow Remote Automation** in its settings.

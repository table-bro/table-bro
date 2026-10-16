import {describe, expect, it, vi} from 'vitest';

import {easeInOutSine} from '../view/shared/animation';
import type {BroClock} from './clock';
import {BroMotion}     from './motion';

/**
 * Frames on demand. Like the browser, a frame runs the callbacks requested before it, so a callback that requests
 * again runs at the next frame, and an error in one callback does not stop the others.
 */
class FakeClock implements BroClock {
  readonly errors: unknown[] = [];
  private time: number = 0;
  private callbacks: ((time: number) => void)[] = [];

  now(): number {
    return this.time;
  }

  request(callback: (time: number) => void): void {
    this.callbacks.push(callback);
  }

  /** Moves the time without a frame, for example to start a run later. */
  set(time: number): void {
    this.time = time;
  }

  frame(time: number): void {
    this.time = time;

    for (const callback of this.callbacks.splice(0)) {
      try {
        callback(time);
      } catch (error) {
        this.errors.push(error);
      }
    }
  }

  get pending(): number {
    return this.callbacks.length;
  }
}

function setup(): {clock: FakeClock; motion: BroMotion; abort: () => void} {
  const clock: FakeClock = new FakeClock();
  const lifecycle: AbortController = new AbortController();

  return {clock, motion: new BroMotion(lifecycle.signal, false, clock), abort: () => lifecycle.abort()};
}

/** The time after which a kinetic run reaches its end: 1 - e^(-t / 350) > 0.9999. */
const kineticEnd: number = 350 * Math.log(1e4);

describe('BroMotion.animate', () => {
  it('draws the eased progress of each frame and ends on exactly 1', () => {
    const {clock, motion} = setup();
    const drawn: number[] = [];

    motion.animate('k', {duration: 350, timing: easeInOutSine, draw: progress => drawn.push(progress)});

    clock.frame(100);
    clock.frame(350);
    clock.frame(400);

    expect(drawn).toEqual([easeInOutSine(100 / 350), 1]);
    expect(clock.pending).toBe(0);
  });

  it('passes a frame time before the start to the easing as it is', () => {
    const {clock, motion} = setup();
    const drawn: number[] = [];

    clock.set(100);
    motion.animate('k', {duration: 350, timing: easeInOutSine, draw: progress => drawn.push(progress)});
    clock.frame(90);

    expect(drawn).toEqual([easeInOutSine(-10 / 350)]);
  });
});

describe('BroMotion.animateKinetic', () => {
  it('decays exponentially, starts at 0 at the latest and snaps to 1 at the end', () => {
    const {clock, motion} = setup();
    const drawn: number[] = [];

    clock.set(100);
    motion.animateKinetic('k', {duration: 350, draw: progress => drawn.push(progress)});

    clock.frame(90);
    clock.frame(100 + 350);
    clock.frame(100 + Math.floor(kineticEnd));
    clock.frame(100 + Math.ceil(kineticEnd));
    clock.frame(100 + 4000);

    expect(drawn.length).toBe(4);
    expect(drawn[0]).toBe(0);
    expect(drawn[1]).toBeCloseTo(1 - Math.exp(-1), 10);
    expect(drawn[2]).toBeLessThan(1);
    expect(drawn[3]).toBe(1);
  });
});

describe('BroMotion.animateKinetic with a distance', () => {
  it('ends when less than half a pixel of the distance remains', () => {
    const {clock, motion} = setup();
    const drawn: number[] = [];
    // 200 * e^(-t / 350) < 0.5 from t = 350 * ln(400), about 2097 ms
    const end: number = 350 * Math.log(400);

    motion.animateKinetic('k', {duration: 350, distance: -200, draw: progress => drawn.push(progress)});

    clock.frame(Math.floor(end));
    clock.frame(Math.ceil(end));

    expect(drawn[0]).toBeLessThan(1);
    expect(200 * (1 - drawn[0])).toBeGreaterThanOrEqual(0.5);
    expect(drawn[1]).toBe(1);
    expect(clock.pending).toBe(0);
  });

  it('ends the runs started before the same frame together, when the longest has less than half a pixel left', () => {
    const {clock, motion} = setup();
    const drawn: {[label: string]: number[]} = {scroll: [], height: []};

    // The page scroll and the body height of a page size change move as one
    motion.animateKinetic('pagination', {duration: 350, distance: 20, draw: progress => drawn.scroll.push(progress)});
    clock.set(1);
    motion.animateKinetic('body-height', {duration: 350, distance: 200, draw: progress => drawn.height.push(progress)});

    const end: number = 350 * Math.log(400);

    clock.frame(500);
    clock.frame(Math.floor(end));
    clock.frame(Math.ceil(end));

    expect(drawn.scroll).toEqual(drawn.height);
    expect(drawn.scroll[1]).toBeLessThan(1);
    expect(drawn.scroll[2]).toBe(1);

    // A run started after a frame forms its own group
    motion.animateKinetic('pagination', {duration: 350, distance: 20, draw: () => undefined});
    clock.frame(Math.ceil(end) + Math.ceil(350 * Math.log(40)));
    expect(motion.tracks()).toEqual([]);
  });

  it('ends at once for no distance', () => {
    const {clock, motion} = setup();
    const drawn: number[] = [];

    motion.animateKinetic('k', {duration: 350, distance: 0, draw: progress => drawn.push(progress)});
    clock.frame(16);

    expect(drawn).toEqual([1]);
  });
});

describe('BroMotion cancellation', () => {
  it('lets a run with the same key replace the previous one', () => {
    const {clock, motion} = setup();
    const drawn: string[] = [];

    motion.animate('k', {duration: 350, timing: easeInOutSine, draw: () => drawn.push('first')});
    motion.animate('k', {duration: 350, timing: easeInOutSine, draw: () => drawn.push('second')});
    clock.frame(16);

    expect(drawn).toEqual(['second']);
  });

  it('runs null keys side by side', () => {
    const {clock, motion} = setup();
    const drawn: string[] = [];

    motion.animate(null, {duration: 350, timing: easeInOutSine, draw: () => drawn.push('a')});
    motion.animate(null, {duration: 350, timing: easeInOutSine, draw: () => drawn.push('b')});
    clock.frame(16);

    expect(drawn).toEqual(['a', 'b']);
  });

  it('stops a run on cancel(), cancelAll() and the abort of the element', () => {
    const {clock, motion, abort} = setup();
    const drawn: string[] = [];

    motion.animate('a', {duration: 350, timing: easeInOutSine, draw: () => drawn.push('a')});
    motion.animate('b', {duration: 350, timing: easeInOutSine, draw: () => drawn.push('b')});
    motion.animate('c', {duration: 350, timing: easeInOutSine, draw: () => drawn.push('c')});
    motion.cancel('a');
    clock.frame(16);

    motion.cancelAll();
    clock.frame(32);

    motion.animate('d', {duration: 350, timing: easeInOutSine, draw: () => drawn.push('d')});
    abort();
    clock.frame(48);

    expect(drawn).toEqual(['b', 'c']);
  });

  it('asks the skip of the caller before each draw and stops when it says so', () => {
    const {clock, motion} = setup();
    const calls: string[] = [];
    let skipped: boolean = false;

    motion.animate(null, {
      duration: 350,
      timing: easeInOutSine,
      skip: () => {
        calls.push('skip');

        return skipped;
      },
      draw: () => calls.push('draw')
    });

    clock.frame(16);
    skipped = true;
    clock.frame(32);
    clock.frame(48);

    expect(calls).toEqual(['skip', 'draw', 'skip']);
  });
});

describe('BroMotion frames', () => {
  it('draws the runs of a frame in the order they started', () => {
    const {clock, motion} = setup();
    const drawn: string[] = [];

    motion.animateKinetic('pagination', {duration: 350, draw: () => drawn.push('pagination')});
    motion.animate('body-height', {duration: 350, timing: easeInOutSine, draw: () => drawn.push('body-height')});
    motion.animate(null, {duration: 350, timing: easeInOutSine, draw: () => drawn.push('details')});

    clock.frame(16);
    clock.frame(32);

    expect(drawn).toEqual(['pagination', 'body-height', 'details', 'pagination', 'body-height', 'details']);
  });

  it('stops only the run whose draw throws and reports the error as an uncaught one', () => {
    const {clock, motion} = setup();
    const drawn: string[] = [];
    const reported = vi.spyOn(globalThis, 'reportError').mockImplementation(() => undefined);

    motion.animate('bad', {
      duration: 350,
      timing: easeInOutSine,
      draw: () => {
        throw new Error('draw failed');
      }
    });
    motion.animate('good', {duration: 350, timing: easeInOutSine, draw: () => drawn.push('good')});

    clock.frame(16);
    clock.frame(32);

    const calls: number = reported.mock.calls.length;

    reported.mockRestore();

    expect(drawn).toEqual(['good', 'good']);
    expect(calls).toBe(1);
    expect(clock.errors).toEqual([]);
  });

  it('requests one frame for all the runs and none when they end', () => {
    const {clock, motion} = setup();

    motion.animate('a', {duration: 350, timing: easeInOutSine, draw: () => undefined});
    motion.animateKinetic('b', {duration: 350, draw: () => undefined});
    motion.animate(null, {duration: 350, timing: easeInOutSine, draw: () => undefined});

    expect(clock.pending).toBe(1);

    clock.frame(16);
    expect(clock.pending).toBe(1);

    clock.frame(4000);
    expect(clock.pending).toBe(0);
  });

  it('does not draw a run that a draw earlier in the same frame cancelled', () => {
    const {clock, motion} = setup();
    const drawn: string[] = [];

    motion.animate('first', {duration: 350, timing: easeInOutSine, draw: () => {
      drawn.push('first');
      motion.cancel('second');
    }});
    motion.animate('second', {duration: 350, timing: easeInOutSine, draw: () => drawn.push('second')});

    clock.frame(16);
    clock.frame(32);

    expect(drawn).toEqual(['first', 'first']);
  });

  it('draws a run started in a draw from the next frame', () => {
    const {clock, motion} = setup();
    const drawn: string[] = [];
    let started: boolean = false;

    motion.animate('outer', {duration: 350, timing: easeInOutSine, draw: () => {
      drawn.push('outer');

      if (!started) {
        started = true;
        motion.animate('inner', {duration: 350, timing: easeInOutSine, draw: () => drawn.push('inner')});
      }
    }});

    clock.frame(16);
    clock.frame(32);

    expect(drawn).toEqual(['outer', 'outer', 'inner']);
  });
});

describe('BroMotion debugging', () => {
  it('shows the running tracks with their labels and progress', () => {
    const {clock, motion} = setup();

    motion.animateKinetic('pagination', {duration: 350, draw: () => undefined});
    motion.animate(null, {label: 'details-progress', duration: 350, timing: easeInOutSine, draw: () => undefined});
    motion.animate(null, {duration: 350, timing: easeInOutSine, draw: () => undefined});

    expect(motion.tracks()).toEqual([
      {key: 'pagination', label: 'pagination', kind: 'kinetic', elapsed: 0, progress: null},
      {key: null, label: 'details-progress', kind: 'eased', elapsed: 0, progress: null},
      {key: null, label: 'animation', kind: 'eased', elapsed: 0, progress: null}
    ]);

    clock.frame(175);

    expect(motion.tracks().map(track => [track.elapsed, track.progress])).toEqual([
      [175, 1 - Math.exp(-0.5)],
      [175, easeInOutSine(0.5)],
      [175, easeInOutSine(0.5)]
    ]);
  });

  it('records why each track ended', () => {
    const {clock, motion, abort} = setup();

    motion.animate('done', {duration: 100, timing: easeInOutSine, draw: () => undefined});
    motion.animate('replaced', {duration: 350, timing: easeInOutSine, draw: () => undefined});
    motion.animate('replaced', {duration: 350, timing: easeInOutSine, draw: () => undefined});
    motion.animate('cancel', {duration: 350, timing: easeInOutSine, draw: () => undefined});
    motion.cancel('cancel');
    motion.animate(null, {label: 'skip', duration: 350, timing: easeInOutSine, skip: () => true, draw: () => undefined});
    clock.frame(100);

    motion.cancelAll();

    motion.animate('aborted', {duration: 350, timing: easeInOutSine, draw: () => undefined});
    abort();
    clock.frame(200);

    expect(motion.history.map(({label, reason}) => `${label}: ${reason}`)).toEqual([
      'replaced: replaced',
      'cancel: cancel',
      'done: done',
      'skip: skip',
      'replaced: cancelAll',
      'aborted: aborted'
    ]);
    expect(motion.history[2].duration).toBe(100);
  });

  it('keeps the last 50 ended tracks', () => {
    const {motion} = setup();

    for (let i = 0; i < 60; i++) {
      motion.animate('k', {label: `run ${i}`, duration: 350, timing: easeInOutSine, draw: () => undefined});
    }

    expect(motion.history.length).toBe(50);
    expect(motion.history[49].label).toBe('run 58');
  });

  it('resolves idle() when the last track ends', async () => {
    const {clock, motion} = setup();
    let idle: boolean = false;

    await motion.idle();

    motion.animate('k', {duration: 350, timing: easeInOutSine, draw: () => undefined});
    motion.idle().then(() => idle = true);

    clock.frame(100);
    await Promise.resolve();
    expect(idle).toBe(false);

    clock.frame(350);
    await Promise.resolve();
    expect(idle).toBe(true);
  });
});

describe('BroMotion.durationScale', () => {
  it('stretches the eased and the kinetic runs that start after it changes, with the same curves', () => {
    const {clock, motion} = setup();
    const eased: number[] = [];
    const kinetics: number[] = [];

    motion.durationScale = 6;
    motion.animate('eased', {duration: 350, timing: easeInOutSine, draw: progress => eased.push(progress)});
    motion.animateKinetic('kinetic', {duration: 350, draw: progress => kinetics.push(progress)});

    clock.frame(6 * 175);
    clock.frame(6 * 350);

    expect(eased).toEqual([easeInOutSine(0.5), 1]);
    expect(kinetics[0]).toBeCloseTo(1 - Math.exp(-0.5), 10);
  });

  it('slows the animations down for config.debugAnimation', () => {
    const debug: BroMotion = new BroMotion(new AbortController().signal, true, new FakeClock());

    expect(debug.durationScale).toBe(6);
  });

  it('draws the end at the first frame of a run without a duration', () => {
    const {clock, motion} = setup();
    const drawn: number[] = [];

    motion.durationScale = 0;
    motion.animate('eased', {duration: 350, timing: easeInOutSine, draw: progress => drawn.push(progress)});
    motion.animateKinetic('kinetic', {duration: 350, draw: progress => drawn.push(progress)});
    clock.frame(0);

    expect(drawn).toEqual([1, 1]);
    expect(motion.tracks()).toEqual([]);
  });
});

describe('BroMotion onEnd', () => {
  it('tells each run once why it ended, also when it is cancelled', () => {
    const {clock, motion} = setup();
    const ends: string[] = [];
    const run = (key: string, label: string): void => motion.animate(key, {
      label,
      duration: 100,
      timing: easeInOutSine,
      draw: () => undefined,
      onEnd: reason => ends.push(`${label}: ${reason}`)
    });

    run('a', 'done');
    run('b', 'first');
    run('b', 'second');
    run('c', 'cancelled');
    motion.cancel('c');
    clock.frame(100);
    clock.frame(200);

    expect(ends).toEqual(['first: replaced', 'cancelled: cancel', 'done: done', 'second: done']);
  });

  it('reports an error of onEnd and still ends the run', () => {
    const {motion} = setup();
    const reported = vi.spyOn(globalThis, 'reportError').mockImplementation(() => undefined);

    motion.animate('k', {
      duration: 100,
      timing: easeInOutSine,
      draw: () => undefined,
      onEnd: () => {
        throw new Error('cleanup failed');
      }
    });
    motion.cancel('k');

    const calls: number = reported.mock.calls.length;

    reported.mockRestore();

    expect(calls).toBe(1);
    expect(motion.tracks()).toEqual([]);
  });
});

describe('BroMotion.pause', () => {
  it('stops the time of the animations, steps it frame by frame and goes on without a jump', () => {
    const {clock, motion} = setup();
    const drawn: number[] = [];

    motion.animate('k', {duration: 1000, timing: x => x, draw: progress => drawn.push(progress)});

    clock.frame(100);
    motion.pause();
    expect(motion.paused).toBe(true);

    // The clock goes on, the animations do not
    clock.frame(5000);
    expect(drawn).toEqual([0.1]);
    expect(motion.tracks()[0].elapsed).toBe(100);

    motion.step(50);
    motion.step(50);
    expect(drawn).toEqual([0.1, 0.15, 0.2]);

    // A run started during the pause waits for the time of the animations too
    motion.animate('other', {duration: 1000, timing: x => x, draw: () => undefined});
    expect(clock.pending).toBe(0);

    clock.set(6000);
    motion.resume();
    clock.frame(6100);

    expect(drawn).toEqual([0.1, 0.15, 0.2, 0.3]);
    expect(motion.paused).toBe(false);
  });

  it('keeps the kinetic runs of one batch together across a pause', () => {
    const {clock, motion} = setup();
    const drawn: {[label: string]: number[]} = {scroll: [], height: []};

    motion.animateKinetic('pagination', {duration: 350, distance: 200, draw: progress => drawn.scroll.push(progress)});
    motion.animateKinetic('body-height', {duration: 350, distance: 50, draw: progress => drawn.height.push(progress)});

    clock.frame(100);
    motion.pause();
    clock.frame(3000);
    motion.step(100);

    expect(drawn.scroll).toEqual(drawn.height);
    expect(drawn.scroll[1]).toBeCloseTo(1 - Math.exp(-200 / 350), 10);
  });
});

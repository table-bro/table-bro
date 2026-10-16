import {type BroAnimateParams, type BroAnimateParamsBase, type BroKineticParams, type BroMotionEndReason, kinetic} from '../view/shared/animation';
import {type BroClock, browserClock}                                                                               from './clock';

/** A running track, as tracks() shows it. */
export interface BroMotionTrackInfo {
  /** The key of the run, null for a run without shared cancellation. */
  key: string | null;
  /** The name of the run in the debug output. */
  label: string;
  /** An eased run of animate() or a kinetic run of animateKinetic(). */
  kind: 'eased' | 'kinetic';
  /** ms since the start. */
  elapsed: number;
  /** The progress of the last frame; null before the first one. */
  progress: number | null;
}

/** An ended track, as history shows it. */
export interface BroMotionEnd {
  /** The name of the run in the debug output. */
  label: string;
  /** Why the run ended. */
  reason: BroMotionEndReason;
  /** ms from the start to the end. */
  duration: number;
}

/** One running animation. */
interface BroTrack {
  readonly key: string | null;
  readonly label: string;
  readonly kind: BroMotionTrackInfo['kind'];
  /** The start on the time of the animations, which stands still during a pause; see now(). */
  readonly start: number;
  /** The start on the clock, for the performance timeline. */
  readonly clockStart: number;
  readonly params: BroAnimateParamsBase;
  /** The progress at a frame time: 1 at the end of the track. */
  readonly progress: (time: number) => number;
  /** The progress of the last frame. */
  drawn: number | null;
  /** Removed from the tracks: a draw earlier in the same frame may cancel a track that the frame still holds. */
  ended?: boolean;
}

/**
 * The kinetic runs started before the same frame: the page scroll with the body height and the details.
 * They share the start and the end, so they move as one: the page scroll takes its target from the heights
 * that the other tracks change in the same frame.
 */
interface BroKineticGroup {
  /** The frame count when the runs started. */
  readonly frame: number;
  readonly start: number;
  /** The share of the distance that may remain at the end; the smallest of the runs wins. */
  endShare: number;
}

/** How many ended tracks history keeps. */
const historySize: number = 50;

/** How much config.debugAnimation slows the animations down: 350 ms take about 2 s. */
export const debugDurationScale: number = 6;

/**
 * All view animations of one instance, drawn in one frame loop. The loop runs while there are tracks:
 * each frame draws them in the order they started, with the same frame time, and a track started in a draw
 * first draws at the next frame.
 *
 * The key names the purpose of an animation within the table: a run with the same key cancels the previous one.
 * A null key means an animation without shared cancellation; only the skip of the caller cancels it.
 * A Custom Element, of the core or of a skin, runs its animations on its own instance and calls cancelAll() when
 * it is disconnected.
 * @group Rendering helpers
 */
export class BroMotion {
  /** The last ended tracks, oldest first: el[Symbol.for('table-bro:debug')].motion.history with config.debug. */
  readonly history: BroMotionEnd[] = [];

  /**
   * The factor of the durations of the runs that start from now on, with the real curves: 6 is six times slower,
   * 0 draws the end at the next frame. Set it in the console to look at the animations in slow motion.
   */
  durationScale: number;

  /** The running tracks in the order they started. */
  private running: BroTrack[] = [];
  /** A frame is requested for the tracks. */
  private scheduled: boolean = false;
  /** The promises of idle(). */
  private idleResolvers: (() => void)[] = [];
  /** The frames drawn so far; the runs started between two frames belong to one batch. */
  private frames: number = 0;
  /** The kinetic runs of the current batch. */
  private kineticGroup: BroKineticGroup | null = null;
  /** The clock time of pause(), or null when the animations run. */
  private pausedAt: number | null = null;
  /** How far the time of the animations lags behind the clock: the pauses minus the steps. */
  private lag: number = 0;

  private readonly frame = (time: number): void => {
    this.scheduled = false;

    // A frame requested before pause() draws nothing
    if (this.pausedAt === null) {
      this.draw(time - this.lag);
      this.schedule();
    }
  };

  /**
   * @param signal - the lifecycle of the element: after its abort no frame writes to the DOM
   * @param debug - slows the animations down (debugDurationScale), logs every ended track with its reason
   * and adds it to the performance timeline
   * @param clock - the time source; unit specs pass a fake one
   */
  constructor(private readonly signal: AbortSignal,
              private readonly debug?: boolean,
              private readonly clock: BroClock = browserClock) {
    this.durationScale = debug ? debugDurationScale : 1;
  }

  /** Whether pause() stopped the time of the animations. */
  get paused(): boolean {
    return this.pausedAt !== null;
  }

  /**
   * An animation with easing. A run with the same key cancels the previous run.
   * @param key - the purpose of the run, or null for a run without shared cancellation
   * @param params - the duration, the curve and the draw of the run
   */
  animate(key: string | null, params: BroAnimateParams): void {
    const start = this.now();
    const duration = params.duration * this.durationScale;

    this.startTrack({
      key,
      label: params.label || key || 'animation',
      kind: 'eased',
      start,
      clockStart: this.clock.now(),
      params,
      drawn: null,
      progress: (time: number): number => {
        // A run without a duration ends at its first frame
        if (duration <= 0) {
          return 1;
        }

        const timeFraction = Math.min((time - start) / duration, 1);

        return (timeFraction === 1) ? 1 : params.timing(timeFraction);
      }
    });
  }

  /**
   * A kinetic animation (exponential decay).
   * @param key - the purpose of the run, or null for a run without shared cancellation
   * @param params - the time constant, the distance and the draw of the run
   */
  animateKinetic(key: string | null, params: BroKineticParams): void {
    const timeConstant = params.duration * this.durationScale;
    // The share of the distance that may remain at the end: half a pixel, or 0.0001 without a distance
    const endShare = (params.distance !== undefined) ? 0.5 / Math.max(Math.abs(params.distance), 0.5) : 0.0001;
    const group = this.joinKineticGroup(endShare);

    this.startTrack({
      key,
      label: params.label || key || 'animation',
      kind: 'kinetic',
      start: group.start,
      clockStart: this.clock.now(),
      params,
      drawn: null,
      progress: (time: number): number => {
        if (timeConstant <= 0) {
          return 1;
        }

        const progress = kinetic((time - group.start) / timeConstant);

        if (progress < 0) {
          return 0;
        }

        return (1 - progress < group.endShare) ? 1 : progress;
      }
    });
  }

  /**
   * Ends the runs of the key without their end frame.
   * @param key - the purpose of the runs
   */
  cancel(key: string): void {
    this.removeTracks(key, 'cancel');
  }

  /** Called when the element is disconnected; after the signal aborts, frames do not write to the DOM either. */
  cancelAll(): void {
    this.running.slice().forEach(track => this.endTrack(track, 'cancelAll'));
  }

  /** Stops the time of the animations: the tracks keep their progress until resume() or step(). */
  pause(): void {
    this.pausedAt ??= this.clock.now();
  }

  /** Lets the time of the animations go on from where pause() stopped it. */
  resume(): void {
    if (this.pausedAt !== null) {
      this.lag += this.clock.now() - this.pausedAt;
      this.pausedAt = null;
      this.schedule();
    }
  }

  /**
   * Pauses, moves the time of the animations by the given ms and draws one frame: a look at the animations frame by frame.
   * @param ms - how far the time of the animations moves
   */
  step(ms: number = 16): void {
    this.pause();
    this.lag -= ms;
    this.draw(this.now());
  }

  /** The running tracks in the order they started. */
  tracks(): BroMotionTrackInfo[] {
    const now = this.now();

    return this.running.map(({key, label, kind, start, drawn}) => ({key, label, kind, elapsed: now - start, progress: drawn}));
  }

  /** Resolves when no track runs, at once when none does. */
  idle(): Promise<void> {
    return this.running.length
      ? new Promise<void>(resolve => this.idleResolvers.push(resolve))
      : Promise.resolve();
  }

  /** The group of the kinetic runs started before the next frame, with the smallest end share among them. */
  private joinKineticGroup(endShare: number): BroKineticGroup {
    if (this.kineticGroup?.frame !== this.frames) {
      this.kineticGroup = {frame: this.frames, start: this.now(), endShare};
    }

    this.kineticGroup.endShare = Math.min(this.kineticGroup.endShare, endShare);

    return this.kineticGroup;
  }

  private startTrack(track: BroTrack): void {
    if (track.key !== null) {
      this.removeTracks(track.key, 'replaced');
    }

    this.running.push(track);
    this.schedule();
  }

  private removeTracks(key: string, reason: BroMotionEndReason): void {
    this.running.filter(track => track.key === key).forEach(track => this.endTrack(track, reason));
  }

  private endTrack(track: BroTrack, reason: BroMotionEndReason): void {
    track.ended = true;
    this.running = this.running.filter(running => running !== track);

    const duration = this.now() - track.start;

    this.history.push({label: track.label, reason, duration});
    this.history.splice(0, this.history.length - historySize);

    if (this.debug) {
      console.debug('[table-bro] animation', track.label, reason, `${Math.round(duration)} ms`);

      // The timeline of the browser shows the track in the Performance panel; a fake clock has other times
      if (this.clock === browserClock) {
        performance.measure(`table-bro ${track.label}`, {start: track.clockStart, end: this.clock.now(), detail: {reason}});
      }
    }

    try {
      track.params.onEnd?.(reason);
    } catch (error) {
      report(error);
    }

    if (!this.running.length) {
      this.idleResolvers.splice(0).forEach(resolve => resolve());
    }
  }

  /** The time of the animations: the clock without the pauses. */
  private now(): number {
    return (this.pausedAt ?? this.clock.now()) - this.lag;
  }

  private schedule(): void {
    if (!this.scheduled && this.pausedAt === null && this.running.length) {
      this.scheduled = true;
      this.clock.request(this.frame);
    }
  }

  /** Draws the running tracks at the given time of the animations. */
  private draw(time: number): void {
    this.frames++;

    for (const track of this.running.slice()) {
      if (track.ended) {
        continue;
      }

      if (this.signal.aborted) {
        this.running.slice().forEach(running => this.endTrack(running, 'aborted'));

        return;
      }

      if (track.params.skip?.()) {
        this.endTrack(track, 'skip');
        continue;
      }

      let progress: number;

      try {
        progress = track.progress(time);
        track.drawn = progress;
        track.params.draw(progress);
      } catch (error) {
        // The error ends only its own track; the page sees it as an uncaught error, as before the shared loop
        this.endTrack(track, 'error');
        report(error);
        continue;
      }

      if (progress === 1) {
        this.endTrack(track, 'done');
      }
    }
  }
}

/** Reports an error the way the browser reports an uncaught one: on the console and as the error event of the window. */
function report(error: unknown): void {
  if (typeof reportError === 'function') {
    reportError(error);
  } else {
    setTimeout(() => {
      throw error;
    });
  }
}

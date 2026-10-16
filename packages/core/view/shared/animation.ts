/**
 * A helper of the animations of the views: the curves of the motion and the types of its parameters.
 */

/**
 * Why a track ended: it reached 1, a run with its key replaced it, cancel() or cancelAll() stopped it,
 * the element was disconnected, the skip of the caller said so, or its draw threw.
 */
export declare type BroMotionEndReason = 'done' | 'replaced' | 'cancel' | 'cancelAll' | 'aborted' | 'skip' | 'error';

/** The parameters of a run of BroMotion. */
export declare interface BroAnimateParamsBase {
  /**
   * The curve of the run: the progress at a fraction of the time.
   * @param timeFraction - the share of the duration that has passed, from 0 to 1
   */
  timing?(timeFraction: number): number;

  /**
   * Writes one frame of the run; draw(1) is its end.
   * @param progress - the progress of the run at the frame, 1 at the end
   */
  draw(progress: number): void;

  /** The duration in ms, or the time constant of a kinetic run; BroMotion.durationScale multiplies it. */
  duration: number;

  /** Ends the run before the next frame when it returns true. */
  skip?(): boolean;

  /** The name of the animation in the debug output; the key when it is not given. */
  label?: string;

  /**
   * Called once when the run ends, whatever the reason: the cleanup that must happen also when the run is
   * cancelled goes here, the cleanup of the end stays in draw(1).
   * @param reason - why the run ended
   */
  onEnd?(reason: BroMotionEndReason): void;
}

/** The parameters of an eased run of BroMotion: the curve is required. */
export declare interface BroAnimateParams extends BroAnimateParamsBase {
  /**
   * The curve of the run: the progress at a fraction of the time.
   * @param timeFraction - the share of the duration that has passed, from 0 to 1
   */
  timing(timeFraction: number): number;
}

/** The parameters of a kinetic run of BroMotion: the duration is the time constant of the exponential decay. */
export declare interface BroKineticParams extends BroAnimateParamsBase {
  /**
   * The distance of the movement in px: the run ends when less than half a pixel remains. Without it the run
   * ends when 0.0001 of the distance remains, after about 9.2 time constants.
   */
  distance?: number;
}

export function easeInOutSine(x: number): number {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

/**
 * The curve cubic-bezier(x1, y1, x2, y2) of CSS as a timing of the motion: the progress at a fraction of the time.
 * Newton's method finds the parameter of the fraction, and a bisection where the curve is too flat for it.
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (x: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number): number => {
    if (x <= 0 || x >= 1) {
      return (x <= 0) ? 0 : 1;
    }

    let t = x;

    for (let i = 0; i < 8; i++) {
      const error = sampleX(t) - x;
      const slope = slopeX(t);

      if (Math.abs(error) < 1e-7) {
        return sampleY(t);
      }

      if (Math.abs(slope) < 1e-6) {
        break;
      }

      t -= error / slope;
    }

    let low = 0;
    let high = 1;

    t = x;

    while (high - low > 1e-7) {
      if (sampleX(t) < x) {
        low = t;
      } else {
        high = t;
      }

      t = (low + high) / 2;
    }

    return sampleY(t);
  };
}

/** The progress of a kinetic animation: exponential decay with the duration as its time constant. */
export function kinetic(x: number): number {
  return 1 - Math.exp(-x);
}

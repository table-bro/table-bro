/**
 * The time source of the animations: the frames of the browser in the table, a fake clock in unit specs.
 */
export interface BroClock {
  /** The current time in ms, on the scale of the frame times. */
  now(): number;

  /** Calls the callback once, at the next frame, with the time of that frame. */
  request(callback: (time: number) => void): void;
}

/** performance.now() and requestAnimationFrame(). It reads the globals only when called, so the import needs no DOM. */
export const browserClock: BroClock = {
  now: (): number => performance.now(),
  request: (callback: (time: number) => void): void => {
    requestAnimationFrame(callback);
  }
};

/**
 * One change of the table for update(): its state, then its writes, then its events. Each method of the controller
 * names its part in update() with the tag @phase:
 * - input: an entry of the controller. The element, an action of a view, an observer or a timer calls it outside
 *   update(), and it runs the updates;
 * - state: phase 1. It changes ctx.state only, without the views, the models of ctx.model and the DOM;
 * - render: phase 2. It writes the regions through the views and changes the models; its reads of the layout, the
 *   writes that depend on them and its animations go into the frame;
 * - events: phase 6, the events to the application.
 */
export interface BroUpdate {
  /**
   * Phase 1: computes the new state and only then sets it. Nothing changes before the last step that may throw,
   * so an exception leaves the table as it was and reaches the caller.
   */
  state?(): void;
  /** Phase 2: the writes of the regions. A region queues its reads, the writes that depend on them and its animations in the frame. */
  render?(frame: BroFrame): void;
  /** Phase 6: the events to the application, in their order. */
  events?(): void;
}

/** Runs one change of the table in its phases: BroController.update. */
export type BroUpdater = (reason: string, update: BroUpdate) => void;

/**
 * The last phases of one update of the table (BroController.update), after its state and its writes. The writes queue
 * here their reads of the layout, the writes that depend on those reads, and their animations. flush() runs every read
 * first, so the browser lays the table out once, then the dependent writes, then starts the animations.
 */
export class BroFrame {
  /** How many reads the update made. */
  reads: number = 0;
  /** How many dependent writes the update made. */
  writes: number = 0;
  /** How many animations the update started. */
  animations: number = 0;

  private readTasks: (() => void)[] = [];
  private writeTasks: (() => void)[] = [];
  private animationTasks: (() => void)[] = [];

  /** Phase 3: a read of the layout after all the writes of phase 2. */
  read(task: () => void): void {
    this.readTasks.push(task);
  }

  /** Phase 4: a write that depends on a read of phase 3. */
  write(task: () => void): void {
    this.writeTasks.push(task);
  }

  /** Phase 5: the start of an animation, after the dependent writes. */
  animate(task: () => void): void {
    this.animationTasks.push(task);
  }

  /**
   * Runs the queued reads, then the dependent writes, then starts the animations. A task that queues more tasks, such as
   * a dependent write that needs a read or an animation that follows another one, starts one more round.
   */
  flush(): void {
    while (this.readTasks.length || this.writeTasks.length || this.animationTasks.length) {
      const reads = this.readTasks.splice(0);

      this.reads += reads.length;
      reads.forEach(task => task());

      const writes = this.writeTasks.splice(0);

      this.writes += writes.length;
      writes.forEach(task => task());

      const animations = this.animationTasks.splice(0);

      this.animations += animations.length;
      animations.forEach(task => task());
    }
  }
}

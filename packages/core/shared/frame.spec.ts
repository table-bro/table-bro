import {describe, expect, it} from 'vitest';

import {BroFrame} from './frame';

describe('BroFrame', () => {
  it('runs every read before the dependent writes and starts the animations last, whatever the order of the queue', () => {
    const frame = new BroFrame();
    const order: string[] = [];

    frame.animate(() => order.push('animation 1'));
    frame.write(() => order.push('write 1'));
    frame.read(() => order.push('read 1'));
    frame.write(() => order.push('write 2'));
    frame.read(() => order.push('read 2'));

    frame.flush();

    expect(order).toEqual(['read 1', 'read 2', 'write 1', 'write 2', 'animation 1']);
    expect({reads: frame.reads, writes: frame.writes, animations: frame.animations}).toEqual({reads: 2, writes: 2, animations: 1});
  });

  it('runs one more round for a task that queues more tasks', () => {
    const frame = new BroFrame();
    const order: string[] = [];

    frame.write(() => {
      order.push('write');
      frame.read(() => order.push('read of the second round'));
    });
    frame.animate(() => {
      order.push('animation');
      frame.animate(() => order.push('animation of the second round'));
    });

    frame.flush();

    expect(order).toEqual(['write', 'animation', 'read of the second round', 'animation of the second round']);
  });

  it('runs nothing twice', () => {
    const frame = new BroFrame();
    let reads = 0;

    frame.read(() => reads++);
    frame.flush();
    frame.flush();

    expect(reads).toBe(1);
  });
});

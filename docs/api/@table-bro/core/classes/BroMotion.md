# Class: BroMotion

All view animations of one instance, drawn in one frame loop. The loop runs while there are tracks:
each frame draws them in the order they started, with the same frame time, and a track started in a draw
first draws at the next frame.

The key names the purpose of an animation within the table: a run with the same key cancels the previous one.
A null key means an animation without shared cancellation; only the skip of the caller cancels it.
A Custom Element, of the core or of a skin, runs its animations on its own instance and calls cancelAll() when
it is disconnected.

## Accessors

### paused

#### Get Signature

> **get** **paused**(): `boolean`

Whether pause() stopped the time of the animations.

##### Returns

`boolean`

## Constructors

### Constructor

> **new BroMotion**(`signal`, `debug?`, `clock?`): `BroMotion`

#### Parameters

##### signal

`AbortSignal`

the lifecycle of the element: after its abort no frame writes to the DOM

##### debug?

`boolean`

slows the animations down (debugDurationScale), logs every ended track with its reason
and adds it to the performance timeline

##### clock?

`BroClock` = `browserClock`

the time source; unit specs pass a fake one

#### Returns

`BroMotion`

## Methods

### animate()

> **animate**(`key`, `params`): `void`

An animation with easing. A run with the same key cancels the previous run.

#### Parameters

##### key

`string` \| `null`

the purpose of the run, or null for a run without shared cancellation

##### params

`BroAnimateParams`

the duration, the curve and the draw of the run

#### Returns

`void`

***

### animateKinetic()

> **animateKinetic**(`key`, `params`): `void`

A kinetic animation (exponential decay).

#### Parameters

##### key

`string` \| `null`

the purpose of the run, or null for a run without shared cancellation

##### params

`BroKineticParams`

the time constant, the distance and the draw of the run

#### Returns

`void`

***

### cancel()

> **cancel**(`key`): `void`

Ends the runs of the key without their end frame.

#### Parameters

##### key

`string`

the purpose of the runs

#### Returns

`void`

***

### cancelAll()

> **cancelAll**(): `void`

Called when the element is disconnected; after the signal aborts, frames do not write to the DOM either.

#### Returns

`void`

***

### idle()

> **idle**(): `Promise`\<`void`\>

Resolves when no track runs, at once when none does.

#### Returns

`Promise`\<`void`\>

***

### pause()

> **pause**(): `void`

Stops the time of the animations: the tracks keep their progress until resume() or step().

#### Returns

`void`

***

### resume()

> **resume**(): `void`

Lets the time of the animations go on from where pause() stopped it.

#### Returns

`void`

***

### step()

> **step**(`ms?`): `void`

Pauses, moves the time of the animations by the given ms and draws one frame: a look at the animations frame by frame.

#### Parameters

##### ms?

`number` = `16`

how far the time of the animations moves

#### Returns

`void`

***

### tracks()

> **tracks**(): `BroMotionTrackInfo`[]

The running tracks in the order they started.

#### Returns

`BroMotionTrackInfo`[]

## Properties

### durationScale

> **durationScale**: `number`

The factor of the durations of the runs that start from now on, with the real curves: 6 is six times slower,
0 draws the end at the next frame. Set it in the console to look at the animations in slow motion.

***

### history

> `readonly` **history**: `BroMotionEnd`[] = `[]`

The last ended tracks, oldest first: el[Symbol.for('table-bro:debug')].motion.history with config.debug.

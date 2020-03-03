<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Redux Egg 🥚](#redux-egg-)
  - [First egg](#first-egg)
    - [combineReducer](#combinereducer)
    - [actions pattern](#actions-pattern)
    - [selectors patterns](#selectors-patterns)
  - [Interceptors](#interceptors)
    - [filterAction](#filteraction)
    - [decorateActions](#decorateactions)
    - [afterAction](#afteraction)
  - [Middleware](#middleware)
    - [addMiddleware](#addmiddleware)
  - [Why are eggs better than ducks?](#why-are-eggs-better-than-ducks)
    - [REASON 1: Combine eggs and solve dependencies](#reason-1-combine-eggs-and-solve-dependencies)
    - [REASON 2: Thunks sucks](#reason-2-thunks-sucks)
    - [REASON 3: They are still ducks](#reason-3-they-are-still-ducks)
  - [Learn deeper](#learn-deeper)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Redux Egg 🥚

> 🥚 Eggs are the new 🦆 ducks.

```javascript
import hatch from 'egg-hatchery';
import storeEgg from 'store-egg';
import counterEgg, { increment, getCount } from '@my/counter-egg';

test('counter egg increments in one', () => {
  const { store } = hatch(storeEgg, counterEgg);
  store.dispatch(increment());
  expect(getCount(store.getState())).toBe(1);
});
```

## First egg

An egg is function that receives an object with tools.
Export by default that function, and also export your action types and constructors.

```javascript
export const INCREMENT = `${PREFIX}/INCREMENT`;
export const increment = (value = 1) => ({ type: INCREMENT, value });
export const REPLACE_COUNT = `${PREFIX}/REPLACE_COUNT`;
export const replaceCount = value => ({ type: REPLACE_COUNT, value });

function counterReducer(state = 0, action) {
  switch (action.type) {
    case INCREMENT:
      return state + action.value;

    case REPLACE_COUNT:
      return action.value;

    default:
      return state;
  }
}

export default ({ combineReducer }) => {
  combineReducer('@my/counter', counterReducer);
};
```

### combineReducer

It combines your reducer with the other reducers from other eggs. It receives two arguments. The first argument is a unique name for your reducer, and the second argument is the reducer itself.

```typescript
function combineReducer(name: string, reducer: ReduxReducer): void;
```

Obtain the `combineReducer` from the tools that the egg receives.

```javascript
function counterReducer(state = 0, action) {
  // ...
}

export default ({ combineReducer }) => {
  combineReducer('@my/counter', counterReducer);
};
```

As a good practice, use your package name as a prefix for the reducer name.

An egg doesn't need to combine a reducer, but it must export an egg by default, although it does nothing.

```javascript
const emptyEgg = [];
export default emptyEgg;
```

### actions pattern

Eggs export action types. Names of action types are in capitals and separate words by underline. The value of the action includes a prefix, which should match with the one used in combineReducer.

```javascript
export const INCREMENT = `${PREFIX}/INCREMENT`;
export const REPLACE_COUNT = `${PREFIX}/REPLACE_COUNT`;
```

Eggs export action creators. They are functions that receive parameters and creates a new action object.

```javascript
export const increment = (value = 1) => ({ type: INCREMENT, value });
export const replaceCount = value => ({ type: REPLACE_COUNT, value });
```

Do not use action creators to dispatch something different from action. Use interceptors instead.

### selectors patterns

Eggs export selectors. They are functions that receive at most two arguments: the first is the current state, the second is props object with possible parameters. See [Redux](https://redux.js.org/introduction/learning-resources#selectors) to learn more.

```javascript
export function getCount(state) {
  return state[PREFIX];
}
```

## Interceptors

The first problem that you find when you use redux is how to perform asynchronous operations. For example, how you can load data from a server? The problem is because all redux is synchronous.

There lots of solutions, from redux-thunk (see [thunks sucks](#reason-2-thunks-sucks) later) to [redux saga](https://redux-saga.js.org/). Some solutions are too simple and do not allow good application scalability, like thunks, other solutions are far too complex and require their language.

This egg presents a new way of operating with asynchronous code and other side effects. It simplifies most of the operations in three concepts: filterAction, decorateAction, and afterAction.

```javascript
const afterPingDispatchPong = async ({ store }, action) => {
  await new Promise(r => setTimeout(r, 1000));
  store.dispatch(pong(action.value));
};

const afterPongDispatchPing = async ({ store }, action) => {
  await new Promise(r => setTimeout(r, 1000));
  store.dispatch(pong(action.value + 1));
};

export default ({ afterAction }) => {
  afterAction(PING, afterPingDispatchPong);
  afterAction(PONG, afterPongDispatchPing);
};
```

### filterAction

Some times you want to avoid one action to be reduced. If it is your case, use the tool `filterAction` to manage it. It receives two arguments, the action type that you want to filter, and a filter function to evaluate if the action reduces. This filter function receives as the first argument is all the breeds, including the redux store, and a second one, which is the action itself. Return a boolean true or false to say if you let pass this action or you want to stop it.

```javascript
export function filterAction(
  actionType: string,
  filterFn: (breeds: Breeds, action: ReduxAction) => boolean
) {
  return state[PREFIX];
}
```

Use `filterAction` in the egg.

```javascript
const filterPairIncrements = (_, action) => action.value % 2 === 0;
const filterMaxCount10 = ({ store }, action) => {
  const count = getCount(store.getState());
  return count + action.value <= 10;
};

export default ({ filterAction }) => {
  filterAction(INCREMENT, filterPairIncrements);
  filterAction(INCREMENT, filterMaxCount10);
};
```

### decorateActions

Some times you do not have enough information in actions, and you want to decorate it and add new details before the reducer. Some other times you want to make sure that data is inside some bounds. Use `decorateAction` to transform actions before the reducer.
It receives two arguments, the action type that you want to decorate, and a decorate function to mutate the action. This decorate function receives as the first argument is all the breeds, including the redux store, and a second one, which is the action itself.

```javascript
export function decorateAction(
  actionType: string,
  decorateFn: (breeds: Breeds, action: ReduxAction) => void
) {
  return state[PREFIX];
}
```

Use `decorateAction` in the egg.

```javascript
let seqNumber = 0;
const decorateIncrementHasSeqNumber = (_, action) => {
  action.seqNumber = seqNumber;
  seqNumber += 1;
};
const decorateIncrementAvoidsOverflow = ({ store }, action) => {
  const count = getCount(store.getState());
  const remaining = 10 - count;

  if (action.value > remaining) {
    action.value = remaining;
  }
};

export default ({ decorateAction }) => {
  decorateAction(INCREMENT, decorateIncrementHasSeqNumber);
  decorateAction(INCREMENT, decorateIncrementAvoidsOverflow);
};
```

### afterAction

Probably this is the function that you want to call. The `afterAction` executes after an action reduces. It is the final step. And here is where you want to do your asynchronous operations.

Think in `afterAction` as a cause and effect. Something has happened, some action has been dispatched and executed, and now you want to create an effect. It is usually to dispatch another action.

The `afterAction` works like the two previous functions. It receives two arguments, the action type that you want to react, and an after function to mutate the action. This after function receives as the first argument is all the breeds, including the redux store, and a second one, which is the action itself.

```javascript
export function afterAction(
  actionType: string,
  afterFn: (breeds: Breeds, action: ReduxAction) => void
) {
  return state[PREFIX];
}
```

Use `afterAction` in the egg.

```javascript
const afterFetchCounterReplaceTheCounter = async ({ store }, action) => {
  const { counterId } = action;
  const count = await fetchCounter(counterId);
  store.dispatch(replaceCount(count));
};
const afterIncrementOverflowsResetTheCounter = ({ store }) => {
  const count = getCount(store.getState());
  if (count > 0) store.dispatch(replaceCount(0));
};

export default ({ afterAction }) => {
  afterAction(FETCH_COUNTER, afterFetchCounterReplaceTheCounter);
  afterAction(INCREMENT, afterIncrementOverflowsResetTheCounter);
};
```

## Middleware

All interceptors are in fact one middleware. You can add more middlewares.

### addMiddleware

Add your middleware with `addMiddleware`.

```typescript
function addMiddleware(middleware: ReduxMiddleware): void;
```

Use `addMiddleware` in the egg.

```javascript
import reduxThunk from 'redux-thunk';

export default ({ addMiddleware }) => {
  addMiddleware(reduxThunk);
};
```

## Why are eggs better than ducks?

### REASON 1: Combine eggs and solve dependencies

Dependencies are hard with ducks.
Each duck is independent and must be configured independently.
The user of the duck must know its dependencies and any change will break
an existing application.

But eggs solve the dependencies by themselves.
Their use ages of human thinking about what comes first ducks or eggs
and they conclude that dependency inversion is cool.
If you have a dependency just use it.

```javascript
import counterEgg, { INCREMENT } from 'counter-egg';

export const getParity = ({ ['@my/parity']: parity }) => parity;

function parityReducer(state = true, action) {
  switch (action.type) {
    case INCREMENT:
      return !state;
    default:
      return state;
  }
}

function parityEgg({ combineReducer }) {
  combineReducer('@my/parity', parityReducer);
}

export default [counterEgg, parityEgg];
```

And you can forgot to include the dependency in your app.

```javascript
import hatch from 'egg-hatchery';
import storeEgg from 'store-egg';
import { increment } from '@my/counter-egg';
import parityEgg, { getParity } from '@my/parity-egg';

test('the parity changes with increment', () => {
  const { store } = hatch(storeEgg, counterEgg, parityEgg);
  store.dispatch(increment());
  expect(getParity(store.getState())).toBe(false);
});
```

Or you can include it. It is not repeated.

```javascript
import hatch from 'egg-hatchery';
import storeEgg from 'store-egg';
import counterEgg, { increment, getCount } from '@my/counter-egg';
import parityEgg, { getParity } from '@my/parity-egg';

test('the parity is still correct when the counter egg is added twice', () => {
  const { store } = hatch(storeEgg, counterEgg, parityEgg);
  store.dispatch(increment());
  expect(getParity(store.getState())).toBe(false);
});
```

### REASON 2: Thunks sucks

Well, not exactly. There is one and only one reason to use a thunk: you need the state before dispatching a new action from a component. If you remember the redux connect, it does not inject the state into dispatcher properties. The thunk middleware gives you access to that state. That limitation was because of performance. Nowadays, you can use hooks, but they are still more efficient if you use thunks.

The problem is the frequent use of thunks: launch subsequent actions to complement the current one. We were all thrilled with the ping pong example, but it was a lousy example. When we do these kinds of concatenated actions, we are looking for repercussions of the current action. In our duck, thanks to action creators, we can decouple and maintain it easily. The problem is, what happens when we want to intercept an action from an external duck? We need to use middleware, a redux observable, a saga, or something similar, but ducks are not ready for them. Like the reducers, if a duck needs a middleware or an equivalent, we have to prepare it manually.

The fiveEgg:

```javascript
import counterEgg, { getCount, INCREMENT } from 'counter-egg';

export const FIVE = '@my/counter/FIVE';
export const getFives = ({ ['@my/five']: five }) => five;
const five = () => ({ type: FIVE });

function fiveReducer(state = 0, action) {
  switch (action.type) {
    case FIVE:
      return state + 1;
    default:
      return state;
  }
}

const fiveMiddleware = store => next => action => {
  next(action);
  switch (action.type) {
    case INCREMENT:
      if (getCount(store.getState()) % 5 === 0) store.dispatch(five());
    default:
  }
};

function fiveEgg({ combineReducer, addMiddleware }) {
  combineReducer('@my/five', fiveReducer);
  addMiddleware(fiveMiddleware);
}

export default [counterEgg, fiveEgg];
```

And how your program would look:

```javascript
import hatch from 'egg-hatchery';
import storeEgg from 'store-egg';
import { increment } from '@my/counter-egg';
import fiveEgg, { getFives } from '@my/five-egg';

test('the five changes with increment', () => {
  const { store } = hatch(storeEgg, fiveEgg);
  store.dispatch(increment());
  store.dispatch(increment());
  store.dispatch(increment());
  store.dispatch(increment());
  store.dispatch(increment());
  expect(getFives(store.getState())).toBe(1);
});
```

### REASON 3: They are still ducks

Well, they are almost ducks. There is only one change: instead of exporting by default, a reducer they export by default the egg. Everything else is the well-known old duck.

## Learn deeper

Look at tests for more details.

- [tests](./src/__tests__)

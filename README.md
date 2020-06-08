# Teal Redux Egg 🥚

> 🥚 [Eggs](https://github.com/drpicox/egg-hatchery) are the new 🦆 ducks.

According [Wikipedia](https://en.wikipedia.org/wiki/Eurasian_teal),
the Eurasian teal, common teal, or Eurasian green-winged teal,
often called simply the teal,
is one of the smallest breeds of ducks.

![Eurasian teal duck](https://upload.wikimedia.org/wikipedia/commons/c/c0/Eurasian_teal_%28Anas_crecca%29_Photograph_by_Shantanu_Kuveskar.jpg)

Better cohesion,
lower coupling,
better extensibility,
better reusability.
Embrace SOLID programming.

```javascript
import { update } from 'object-path-immutable'

export function getCount(state) {
  return state.counter
}

export const INCREMENT = 'counter/INCREMENT'
export function increment(amount = 1) {
  return { type: INCREMENT, amount }
}

function initializeCounter(state = {}) {
  return update(state, 'counter', (c = 0) => c)
}

function reduceIncrement(state, action) {
  return update(state, 'counter', (c) => c + action.amount)
}

export default function counterEgg({ initializeState, reduceAction }) {
  initializeState(initializeCounter)
  reduceAction(INCREMENT, reduceIncrement)
}
```

The problem is not the boilerplate,
the problem is that things are not related

## Table of Content

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [First egg](#first-egg)
- [Teal Redux Egg API](#teal-redux-egg-api)
  - [# initializeState](#-initializestate)
  - [# reduceAction](#-reduceaction)
  - [# afterAction](#-afteraction)
  - [# addMiddleware](#-addmiddleware)
- [Patterns](#patterns)
  - [Action pattern](#action-pattern)
  - [Selectors patterns](#selectors-patterns)
- [Why are eggs better than ducks?](#why-are-eggs-better-than-ducks)
  - [REASON 1: Combine eggs and solve dependencies](#reason-1-combine-eggs-and-solve-dependencies)
  - [REASON 2: Thunks sucks](#reason-2-thunks-sucks)
  - [REASON 3: They are still ducks](#reason-3-they-are-still-ducks)
  - [REASON 4: Teal Redux Eggs are SOLID](#reason-4-teal-redux-eggs-are-solid)
  - [REASON 5: Less dirty mains](#reason-5-less-dirty-mains)
- [Learn more](#learn-more)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## First egg

An egg is function that initializes a module, or an array of eggs.
A Teal Redux Egg is like a Duck,
export all selectors, all action types, and all action creators;
but instead of exporting as default symbol the reducer,
export as the default symbol the egg.

```javascript
// counterEgg.js
import { update } from 'object-path-immutable'
import incrementEgg from './incrementEgg'
import resetEgg from './resetEgg'

export * from './incrementEgg'
export * from './resetEgg'

export function getCount(state) {
  return state.counter
}

function initializeCounter(state) {
  return update(state, 'counter', (c = 0) => c)
}

function counterEgg({ initializeState, reduceAction }) {
  initializeState(initializeCounter)
  reduceAction(INCREMENT, reduceIncrement)
}

export default [counterEgg, incrementEgg, resetEgg]
```

```javascript
// incrementEgg.js
import { update } from 'object-path-immutable'

export const INCREMENT = 'counter/INCREMENT'
export function increment(amount = 1) {
  return { type: INCREMENT, amount }
}

function reduceIncrement(state, action) {
  return update(state, 'counter', (c) => c + action.amount)
}

export default function incrementEgg({ reduceAction }) {
  reduceAction(INCREMENT, reduceIncrement)
}
```

```javascript
// resetEgg.js
import { update } from 'object-path-immutable'

export const RESET = 'counter/RESET'
export function reset(amount = 1) {
  return { type: RESET, amount }
}

function reduceReset(state, action) {
  return update(state, 'counter', (c) => c + action.amount)
}

export default function resetEgg({ reduceAction }) {
  reduceAction(RESET, reduceReset)
}
```

## Teal Redux Egg API

### # initializeState

```typescript
type initializeState = (initializeStateCb: ReduxReducer) => void
```

Teal Redux starts with a state that consists of an empty object. This object has no values, no keys, and no default values. If you need any content to be part of the state, you have to initialize with initializeState. The following example is a counter, and it needs to increment from zero, so it initializes the counter property of the state to the value zero.

```javascript
// counterEgg.js
import { update } from 'object-path-immutable'

function initializeCounter(state) {
  return update(state, 'counter', (c = 0) => c)
}

export default ({ initializeState }) => initializeState(initializeCounter)
```

Typically in Redux, we put the default initial state on the reducer itself. This strategy is correct for the typical redux reducer built with combineReducers, but another kind of reducers requires different approaches. Teal Redux Eggs decouples state initialization from reducer computation. It gives one tool to initialize it: initializeState.

The initializeState tool receives a function that returns the state correctly initialized. Instead of initializing the state in the store creation, or in each reducer itself, you update it with only one tool and one mechanism. You can call initializeState as many times as you want.

```javascript
// todoEgg.js
import { update } from 'object-path-immutable'

function initializeTodo(state) {
  return update(state, 'todo', (l = []) => l)
}

export default ({ initializeState }) => initializeState(initializeTodo)
```

And merge all calls in the app egg:

```javascript
// appEgg.js
import counterEgg from './counterEgg'
import todoEgg from './todoEgg'

export default [counterEgg, todoEgg]
```

If you observe the code, you can see that each initializeState resolves a different part of the state; merging both eggs in the app, we initialize the whole state correctly. The final initialized state looks like:

```json
{
  "counter": 0,
  "todo": []
}
```

In Redux, the createStore, receives as a second parameter an object with the initial state. This argument allows to preload data into the state. Teal Redux does not allow you to modify the createStore call, but initializeState enables you to preload the state from the source of your choice.

```javascript
// preloadStateEgg.js
import { merge } from 'object-path-immutable'

function preloadState(state) {
  const { initialState } = global
  if (!initialState) return state

  return merge(state, '', initialState)
}

export default ({ initializeState }) => initializeState(preloadState)
```

The initializeState and stateInitializersFn are synchronous; they assume that the execution without any asynchronous call. If you need to load the state from external services, please consider using an action for that task.

### # reduceAction

```typescript
type reduceAction = (actionType: string, reducer: ReduxReducer) => void
```

In Redux, reducers compute actions. In Teal Redux too. The difference is that while most of the implementations of Redux relays in combineReducers, it associates reducers to subtrees, Teal Redux associates reducers to actions. Given an action, there is one of more than one reducers to compute that action given the whole state.

The reduceAction tool configures the store to reduce a given action type with a specific reducer. When the store dispatches the action, it reduces the state with all reducers for that action type.

```javascript
// counterEgg.js
import { update } from 'object-path-immutable'

export const INCREMENT = 'counter/INCREMENT'
export function increment(amount = 1) {
  return { type: INCREMENT, amount }
}

function initializeCounter(state) {
  return update(state, 'counter', (c = 0) => c)
}

function reduceIncrement(state, action) {
  return update(state, 'counter', (c) => c + action.amount)
}

export default function incrementEgg({ initializeState, reduceAction }) {
  initializeState(INCREMENT, initializeCounter)
  reduceAction(INCREMENT, reduceIncrement)
}
```

Note that each reducer receives the whole state. That means that the reducer should carefully update only that part of the state. Note also that reducers have no default initialization, initializeState handles that initialization.

```javascript
// counterStatsEgg.js
import { update } from 'object-path-immutable'
import { INCREMENT } from './counterEgg'

function initializeCounterStats(state) {
  return update(state, 'counterStats', (c = 0) => c)
}

function reduceIncrement(state, action) {
  return update(state, 'counterStats', (c) => c + 1)
}

export default function incrementEgg({ initializeState, reduceAction }) {
  initializeState(initializeCounterStats)
  reduceAction(INCREMENT, reduceIncrement)
}
```

```javascript
// appEgg.js
import counterEgg from './counterEgg'
import counterStatsEgg from './counterStatsEgg'

export default [counterEgg, counterStatsEgg]
```

### # afterAction

```typescript
type afterAction = (actionType: string, afterActionCb) => void
```

Redux official documentation explains that state computation is synchronous. It shows that you must perform all asynchronous operations outside of reducers. It [proposes](https://redux.js.org/advanced/async-actions) to split asynchronous operations into multiple synchronous actions., and use Redux Thunk to fire all asynchronous logic. We do not recommend using Redux Thunk unless you want to perform dispatch of actions using partial state from redux.

With Teal Redux, instead of using action creators with thunks, you create an after-action. It is a function that executes an operation after the store reduces it. Use after actions to develop your async operations.

```javascript
// fetchPostsEgg.js
import receivePosts from './receivePostsEgg'

export const FETCH_POSTS = 'posts/FETCH'
export function fetchPosts(subreddit) {
  return { type: FETCH_POSTS, subreddit }
}

async function afterFetchPosts({ store }, action) {
  const response = await fetch(
    `https://www.reddit.com/r/${action.subreddit}.json`,
  )
  const json = await response.json()
  store.dispatch(receivePosts(action.subreddit, json))
}

export default ({ afterAction }) => afterAction(FETCH_POSTS, afterFetchPosts)
```

Like using custom middleware, redux observable, or sagas, the best part of the capacity to react to completed operations. In a previous example, we have shown how you can add two reducers to the same action type, but this is usually a bad idea. Here we offer the better alternative, use a second action to update a different part of the state.

```javascript
// counterStatsEgg.js
import { update } from 'object-path-immutable'
import { INCREMENT as INCREMENT_COUNTER } from './counterEgg'

export const INCREMENT_COUNTER_STAT = 'counterStats/INCREMENT'
export function incrementCounterStat() {
  return { type: INCREMENT_COUNTER_STAT }
}

function initializeCounterStats(state) {
  return update(state, 'counterStats', (c = 0) => c)
}

function reduceIncrementCounterState(state, action) {
  return update(state, 'counterStats', (c) => c + 1)
}

function afterIncrement({ store }, action) {
  store.dispatch(incrementCounterStat)
}

export default function incrementEgg({
  initializeState,
  reduceAction,
  afterAction,
}) {
  initializeState(initializeCounterStats)
  reduceAction(INCREMENT_COUNTER_STAT, reduceIncrementCounterState)
  afterAction(INCREMENT_COUNTER, afterIncrement)
}
```

This change of how to handle derived actions reflects how the [DDD](https://levelup.gitconnected.com/redux-and-doman-driven-development-29f818f60f2f) methodology works. The idea is once we reduce an action, it is an event that describes what happened in the state. After that update, other parts of the application can react and update themselves, and consequently generate more events.

### # addMiddleware

```typescript
type addMiddleware = (middleware: ReduxMiddleware) => void
```

Avoid the use of `addMiddleware`, instead of it, use `afterAction` whenever it is possible. But because probably you already have some middleware that you want to use, you can register it using `addMiddleware`.

```javascript
import reduxThunk from 'redux-thunk'

export default ({ addMiddleware }) => {
  addMiddleware(reduxThunk)
}
```

## Patterns

### Action pattern

Eggs export action types. Names of action types are in capitals and separate words by underline. The value of the action includes a prefix, which should match with the one used in combineReducer.

```javascript
export const INCREMENT = `${PREFIX}/INCREMENT`
export const REPLACE_COUNT = `${PREFIX}/REPLACE_COUNT`
```

Eggs export action creators. They are functions that receive parameters and creates a new action object.

```javascript
export const increment = (value = 1) => ({ type: INCREMENT, value })
export const replaceCount = (value) => ({ type: REPLACE_COUNT, value })
```

Do not use action creators to dispatch something different from action. Use interceptors instead.

### Selectors patterns

Eggs export selectors. They are functions that receive at most two arguments: the first is the current state, the second is props object with possible parameters. See [Redux](https://redux.js.org/introduction/learning-resources#selectors) to learn more.

```javascript
export function getCount(state) {
  return state[PREFIX]
}
```

Some selectors need [memoization](https://redux.js.org/recipes/computing-derived-data). Instead of exporting the selector
function, export the factory to the new selector.

```javascript
import { createSelector } from 'reselect'
import { listTodos } from './listTodos'

export function makeCountDoneTodos(state) {
  return createSelector(
    listTodos,
    (todos) => todos.filter((t) => t.done).length,
  )
}
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
import counterEgg, { INCREMENT } from 'counter-egg'

export const getParity = ({ ['@my/parity']: parity }) => parity

function parityReducer(state = true, action) {
  switch (action.type) {
    case INCREMENT:
      return !state
    default:
      return state
  }
}

function parityEgg({ combineReducer }) {
  combineReducer('@my/parity', parityReducer)
}

export default [counterEgg, parityEgg]
```

And you can forgot to include the dependency in your app.

```javascript
import hatch from 'egg-hatchery'
import storeEgg from 'store-egg'
import { increment } from '@my/counter-egg'
import parityEgg, { getParity } from '@my/parity-egg'

test('the parity changes with increment', () => {
  const { store } = hatch(storeEgg, counterEgg, parityEgg)
  store.dispatch(increment())
  expect(getParity(store.getState())).toBe(false)
})
```

Or you can include it. It is not repeated.

```javascript
import hatch from 'egg-hatchery'
import storeEgg from 'store-egg'
import counterEgg, { increment, getCount } from '@my/counter-egg'
import parityEgg, { getParity } from '@my/parity-egg'

test('the parity is still correct when the counter egg is added twice', () => {
  const { store } = hatch(storeEgg, counterEgg, parityEgg)
  store.dispatch(increment())
  expect(getParity(store.getState())).toBe(false)
})
```

### REASON 2: Thunks sucks

Well, not exactly. There is one and only one reason to use a thunk: you need the state before dispatching a new action from a component. If you remember the redux connect, it does not inject the state into dispatcher properties. The thunk middleware gives you access to that state. That limitation was because of performance. Nowadays, you can use hooks, but they are still more efficient if you use thunks.

The problem is the frequent use of thunks: launch subsequent actions to complement the current one. We were all thrilled with the ping pong example, but it was a lousy example. When we do these kinds of concatenated actions, we are looking for repercussions of the current action. In our duck, thanks to action creators, we can decouple and maintain it easily. The problem is, what happens when we want to intercept an action from an external duck? We need to use middleware, a redux observable, a saga, or something similar, but ducks are not ready for them. Like the reducers, if a duck needs a middleware or an equivalent, we have to initialize it manually.

### REASON 3: They are still ducks

Well, they are almost ducks. There is only one change: instead of exporting by default, a reducer they export by default the egg. Everything else is the well-known old duck.

### REASON 4: Teal Redux Eggs are SOLID

Technically they are not SOLID, but they can become SOLID if you write them carefully. One of the fundamental principles of SOLID programming is the [Open Close Principle](https://en.wikipedia.org/wiki/Open%E2%80%93closed_principle). That Principle states that files should be open to extension, but closed for modification. The question is, how to not to write inside a file, but extend their behavior?

The problem of the typical Redux Reducer is the switch statement. That statement disables the Open Close Principle completely. It is because if you want to add any additional action, you need to add one more switch case.

```javascript
import { INCREMENT, RESET } from './actions'

export default function classicReduceCounter(state = 0, action) {
  switch (action.type) {
    case INCREMENT:
      return (state += action.amount)
    case RESET:
      return 0
    default:
      return state
  }
}
```

The consequence is that if you are planning to reuse that duck, module, in other applications, you have to use all or nothing.

Imagine that you are planning to sell the counter module, and charge extra money for the reset operations. You cannot do that unless you add some additional logic to ignore the reset case.

Imagine another case; you are using the basic counter in another application, and now you want to reuse that counter, but you need the reset operation. You have two options: 1) create a clone of the module and have a different counter with reset, 2) add the reset to the original implementation. If you clone the module, you have a maintenance problem: you are duplicating logic in two different modules. If you add the reset implementation to the original module, you add this functionality to all previous applications. And that has two hazards: the other applications got heavier because they support non-required features, and it might have undesired consequences.

That problem does not happen with Teal Redux eggs. You have an egg for the original counter, and you can implement a second egg for the reset functionality. That means that you have two modules. Now you can either sell them separately or use one or two. Old applications remain unaffected; new applications can enhance available behaviors.

```javascript
// counterEgg.js
import { update } from 'object-path-immutable'

export function getCount(state) {
  return state.counter
}

export const INCREMENT = 'counter/INCREMENT'
export function increment(amount = 1) {
  return { type: INCREMENT, amount }
}

function initializeCounter(state = {}) {
  return update(state, 'counter', (c = 0) => c)
}

function reduceIncrement(state, action) {
  return update(state, 'counter', (c) => c + action.amount)
}

export default ({ initializeState, reduceAction }) => {
  initializeState(initializeCounter)
  reduceAction(INCREMENT, reduceIncrement)
}
```

```javascript
// counterResetEgg.js
import { set } from 'object-path-immutable'

export const RESET = 'counter/RESET'
export function reset() {
  return { type: RESET }
}

function reduceReset(state, action) {
  return set(state, 'counter', 0)
}

export default ({ initializeState }) => {
  reduceAction(RESET, reduceReset)
}
```

### REASON 5: Less dirty mains

The main of any application is the dirtiest part of any application. The main initializes and starts everything; it needs to know the details of all modules and logics from our code and wire altogether. Moreover, the main is the part that we must replicate in our tests; the more complex the main, the less reliable and more complicated the tests are.

If you think in a common Redux module, you need to think about its necessities. The main must be aware and wire correctly:
Does it have a reducer and which key I use in the combineReducer?
Does it have any additional reducer not combined with others?
Does it have any middleware?
Does it use any redux-observable?
Does it use any saga?
Does it require the inclusion of other ducks?

Some time ago, the answer was tools like [ducksReducer](https://github.com/drpicox/ducks-reducer) or [ducksMiddleware](https://github.com/drpicox/ducks-middleware). They received all the ducks and generated the expected reducer or middleware. Unfortunately, it had two problems: 1) you have to import everything from the module, so you lose the ability to do tree-shaking, and 2) it does not resolve dependencies. If any module requires redux-thunk, a module cannot load it (it might become duplicated), so it transfers the responsibility to the main to add it. So it solved the problem partially.

Teal Redux Eggs solve most of these problems. Each egg is a self-configuration module. It describes what to configure in the redux store, and it also can include other modules. And because you can specify an array of dependencies, one dependency can be the reduxThunkEgg, include it in all of the eggs that you want, and let to the [egg-hatchery](https://github.com/drpicox/egg-hatchery) load it once.

## Learn more

Look at tests for more details.

- [tests](./src/__tests__)

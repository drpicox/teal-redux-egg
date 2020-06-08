import hatch from 'micro-egg-hatchery'
import { update } from 'object-path-immutable'
import tealReduxEgg from '../'

const INCREMENT = 'count/INCREMENT'
const increment = (amount = 1) => ({ type: INCREMENT, amount })
const RESET = 'count/RESET'
const reset = () => ({ type: RESET })

function initializeCountEgg({ initializeState }) {
  initializeState(() => ({ count: 0 }))
}

function incrementEgg({ reduceAction }) {
  reduceAction(INCREMENT, (state, action) =>
    update(state, 'count', (v) => v + action.amount),
  )
}

test('registers one reducer for a given action', () => {
  const { store } = hatch(tealReduxEgg, initializeCountEgg, incrementEgg)
  store.dispatch(increment())
  const state = store.getState()
  expect(state).toEqual({ count: 1 })
})

test('ignores other action types', () => {
  const { store } = hatch(tealReduxEgg, initializeCountEgg, incrementEgg)
  store.dispatch(reset())
  const state = store.getState()
  expect(state).toEqual({ count: 0 })
})

test('if there is more than one reducer for the same action, are executed in the addition order', () => {
  function incrementMiltupliesEgg({ reduceAction }) {
    reduceAction(INCREMENT, (state) => update(state, 'count', (v) => v * 3))
  }

  const { store } = hatch(
    tealReduxEgg,
    initializeCountEgg,
    incrementEgg,
    incrementMiltupliesEgg,
  )
  store.dispatch(increment())
  const state = store.getState()
  expect(state).toEqual({ count: 3 })
})

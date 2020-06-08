import hatch from 'micro-egg-hatchery'
import tealReduxEgg from '../'

test('initializes the state', () => {
  function testEgg({ initializeState }) {
    initializeState(() => ({ yes: 1 }))
  }

  const { store } = hatch(tealReduxEgg, testEgg)
  const state = store.getState()
  expect(state).toEqual({ yes: 1 })
})

describe('the initializeStateFn argument', () => {
  test('receives the previous state and may upgrade it', () => {
    function testEgg({ initializeState }) {
      initializeState((state) => ({ ...state, a: 1 }))
      initializeState((state) => ({ ...state, b: 2 }))
    }

    const { store } = hatch(tealReduxEgg, testEgg)
    const state = store.getState()
    expect(state).toEqual({ a: 1, b: 2 })
  })

  test('receives the previous state and may replace it', () => {
    function testEgg({ initializeState }) {
      initializeState(() => ({ a: 1, b: 2 }))
      initializeState(() => ({ c: 3 }))
    }

    const { store } = hatch(tealReduxEgg, testEgg)
    const state = store.getState()
    expect(state).toEqual({ c: 3 })
  })

  test('receives breeds as a second argument', () => {
    function testEgg({ breed, initializeState }) {
      breed('one', () => 1)
      initializeState((state, { one }) => ({ ...state, one }))
    }

    const { store } = hatch(tealReduxEgg, testEgg)
    const state = store.getState()
    expect(state).toEqual({ one: 1 })
  })

  test('is independend of the breed order', () => {
    function testEgg({ breed, initializeState }) {
      initializeState((state, { one }) => ({ ...state, one }))
      breed('one', () => 1)
    }

    const { store } = hatch(tealReduxEgg, testEgg)
    const state = store.getState()
    expect(state).toEqual({ one: 1 })
  })
})

import hatch from 'micro-egg-hatchery'
import tealReduxEgg from '../'

const DUMMY = 'DUMMY'
const dummy = () => ({ type: DUMMY })
const notDummy = () => ({ type: `NOT.${DUMMY}` })

test('registers one action to execute after some action', () => {
  const log = []
  function testEgg({ afterAction }) {
    afterAction(DUMMY, () => log.push('test'))
  }

  const { store } = hatch(tealReduxEgg, testEgg)
  store.dispatch(dummy())
  expect(log).toEqual(['test'])
})

test('ignores other action types', () => {
  const log = []
  function testEgg({ afterAction }) {
    afterAction(DUMMY, () => log.push('test'))
  }

  const { store } = hatch(tealReduxEgg, testEgg)
  store.dispatch(notDummy())
  expect(log).toEqual([])
})

test('if there is more than one reducer for the same action, are executed in the addition order', () => {
  const log = []
  function testEgg({ afterAction }) {
    afterAction(DUMMY, () => log.push('test1'))
    afterAction(DUMMY, () => log.push('test2'))
  }

  const { store } = hatch(tealReduxEgg, testEgg)
  store.dispatch(dummy())
  expect(log).toEqual(['test1', 'test2'])
})

describe('after action function parameters', () => {
  test('the first argument is breeds', () => {
    const log = []
    function testEgg({ afterAction, breed }) {
      breed('message', () => 'test')
      afterAction(DUMMY, ({ message }) => log.push(message))
    }

    const { store } = hatch(tealReduxEgg, testEgg)
    store.dispatch(dummy())
    expect(log).toEqual(['test'])
  })

  test('the second argument is the action', () => {
    const log = []
    function testEgg({ afterAction }) {
      afterAction(DUMMY, (breeds, action) => log.push(action))
    }

    const { store } = hatch(tealReduxEgg, testEgg)
    store.dispatch(dummy())
    expect(log).toEqual([dummy()])
  })

  test('the first argument includes the store', () => {
    const log = []
    function testEgg({ afterAction }) {
      afterAction(DUMMY, ({ store }) => log.push(store))
    }

    const { store } = hatch(tealReduxEgg, testEgg)
    store.dispatch(dummy())
    expect(log).toEqual([store])
  })
})

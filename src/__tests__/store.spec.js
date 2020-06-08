import hatch from 'micro-egg-hatchery'
import tealReduxEgg from '../'

test('breeds a redux store', () => {
  const { store } = hatch(tealReduxEgg)

  expect(store).toMatchObject({
    dispatch: expect.any(Function),
    getState: expect.any(Function),
    subscribe: expect.any(Function),
  })
})

test('default initial state is an empty object', () => {
  const { store } = hatch(tealReduxEgg)
  const state = store.getState()
  expect(state).toEqual({})
})

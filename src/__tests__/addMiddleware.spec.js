import hatch from 'micro-egg-hatchery'
import reduxThunk from 'redux-thunk'
import tealReduxEgg from '../'

const DUMMY = 'DUMMY'
const dummy = () => ({ type: DUMMY })
const dummyThunk = () => (dispatch) => dispatch(dummy())

test('registers a middleware', () => {
  const log = []
  function testEgg({ afterAction, addMiddleware }) {
    afterAction(DUMMY, () => log.push('test'))
    addMiddleware(reduxThunk)
  }

  const { store } = hatch(tealReduxEgg, testEgg)
  store.dispatch(dummyThunk())
  expect(log).toEqual(['test'])
})

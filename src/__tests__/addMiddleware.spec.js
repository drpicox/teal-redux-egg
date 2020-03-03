import hatch from '../../../egg-hatchery/src/index';
import reduxEgg from '../';
import counterEgg, { increment, getCount } from './helpers/counter-egg';

const INCREMENT_THREE = '@my/INCREMENT_THREE';
const incrementThree = () => ({ type: INCREMENT_THREE });

test('adds a middleware', () => {
  const middleware = store => next => action => {
    next(action);
    switch (action.type) {
      case INCREMENT_THREE:
        store.dispatch(increment(1));
        store.dispatch(increment(2));
        break;

      default:
    }
  };

  const incrementEgg = ({ addMiddleware }) => {
    addMiddleware(middleware);
  };

  const { store } = hatch(reduxEgg, counterEgg, incrementEgg);
  store.dispatch(incrementThree());

  const count = getCount(store.getState());
  expect(count).toBe(3);
});

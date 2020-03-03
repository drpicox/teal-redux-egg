import hatch from '../../../egg-hatchery/src/index';
import reduxEgg from '../';

test('adds a new reducer', () => {
  const anEgg = ({ combineReducer }) => {
    combineReducer('@my/counter', () => 0);
  };

  const { store } = hatch(reduxEgg, anEgg);
  const state = store.getState();

  expect(state).toEqual({ '@my/counter': 0 });
});

test('combines multiple reducers', () => {
  const anEgg = ({ combineReducer }) => {
    combineReducer('@my/counter', () => 0);
    combineReducer('@my/name', () => 'name');
  };

  const { store } = hatch(reduxEgg, anEgg);
  const state = store.getState();

  expect(state).toEqual({ '@my/counter': 0, '@my/name': 'name' });
});

test('throws when the egg is hatched', () => {
  let foundCombineReducer;
  const anEgg = ({ combineReducer }) => {
    foundCombineReducer = combineReducer;
  };

  hatch(reduxEgg, anEgg);
  expect(() => foundCombineReducer('@my/counter', () => 0)).toThrow(
    /combineReducer cannot be used once is hatched/
  );
});

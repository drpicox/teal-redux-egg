import hatch from '../../../egg-hatchery/src/index';
import reduxEgg from '../';
import animalsEgg, { receiveAnimal, isPresent } from './helpers/animals-egg';
import nameEgg, { replaceName, getName } from './helpers/name-egg';
import counterEgg, { increment, getCount } from './helpers/counter-egg';

test('creates an store that has combineReducer reducer', () => {
  const { store } = hatch(reduxEgg, counterEgg);

  store.dispatch(increment(1));
  const count = getCount(store.getState());

  expect(count).toBe(1);
});

test('combines multiple eggs', () => {
  const { store } = hatch(reduxEgg, counterEgg, animalsEgg, nameEgg);

  store.dispatch(increment(1));
  const count = getCount(store.getState());

  store.dispatch(receiveAnimal('Savio'));
  const isSavioPresent = isPresent(store.getState(), { name: 'Savio' });

  store.dispatch(replaceName('Hoboken'));
  const name = getName(store.getState());

  expect(count).toBe(1);
  expect(isSavioPresent).toBe(true);
  expect(name).toBe('Hoboken');
});

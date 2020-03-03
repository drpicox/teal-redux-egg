import hatch from '../../../egg-hatchery/src/index';
import reduxEgg from '../';
import counterEgg, {
  INCREMENT,
  increment,
  getCount,
  replaceCount
} from './helpers/counter-egg';
import { newLogEgg } from './helpers/new-log-egg';

let log, logEgg;
beforeEach(() => {
  log = [];
  logEgg = newLogEgg(log);
});

test('executes a callback when an action of that type is dispatched', () => {
  const afterEgg = ({ afterAction }) => {
    afterAction(INCREMENT, () => log.push('afterAction executed'));
  };

  const { store } = hatch(reduxEgg, counterEgg, afterEgg);
  store.dispatch(increment(1));

  expect(log).toEqual(['afterAction executed']);
});

test('it is executed after the action is reduced', () => {
  const afterEgg = ({ afterAction }) => {
    afterAction(INCREMENT, () => log.push('afterAction executed'));
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, afterEgg);
  store.dispatch(increment(1));

  const count = getCount(store.getState());
  expect(count).toBe(1);
  expect(log).toEqual([increment(1), 'afterAction executed']);
});

test('it receives the all breeds as first argument', () => {
  const DOUBLE = '@my/DOUBLE';
  const double = () => ({ type: DOUBLE });

  const afterEgg = ({ afterAction }) => {
    afterAction(DOUBLE, ({ store }) => {
      const count = getCount(store.getState());
      store.dispatch(increment(count));
    });
  };

  const { store } = hatch(reduxEgg, counterEgg, afterEgg);
  store.dispatch(increment(3));
  store.dispatch(double());

  const count = getCount(store.getState());
  expect(count).toBe(6);
});

test('it receives the action as second argument', () => {
  const LOAD_COUNTER = '@my/LOAD_COUNTER';
  const loadCounter = id => ({ type: LOAD_COUNTER, id });

  const afterEgg = ({ afterAction }) => {
    afterAction(LOAD_COUNTER, ({ store }, { id }) => {
      const readedValue = parseInt(id, 16);
      store.dispatch(replaceCount(readedValue));
    });
  };

  const { store } = hatch(reduxEgg, counterEgg, afterEgg);
  store.dispatch(loadCounter('faX43'));

  const count = getCount(store.getState());
  expect(count).toBe(0xfa);
});

test('there can be more than one afterAction', () => {
  const afterEgg = ({ afterAction }) => {
    afterAction(INCREMENT, (_, { value }) => {
      log.push(`afterIncrement 1 ${value}`);
    });
    afterAction(INCREMENT, (_, { value }) => {
      log.push(`afterIncrement 2 ${value}`);
    });
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, afterEgg);
  store.dispatch(increment(1));
  store.dispatch(increment(3));

  expect(log).toEqual([
    increment(1),
    'afterIncrement 1 1',
    'afterIncrement 2 1',
    increment(3),
    'afterIncrement 1 3',
    'afterIncrement 2 3'
  ]);
});

test('throws when the egg is hatched', () => {
  let foundAfterAction;
  const anEgg = ({ afterAction }) => {
    foundAfterAction = afterAction;
  };

  hatch(reduxEgg, anEgg);
  expect(() => foundAfterAction(INCREMENT, () => {})).toThrow(
    /afterAction cannot be used once is hatched/
  );
});

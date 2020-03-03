import hatch from '../../../egg-hatchery/src/index';
import reduxEgg from '../';
import counterEgg, {
  INCREMENT,
  increment,
  getCount
} from './helpers/counter-egg';
import { newLogEgg } from './helpers/new-log-egg';

let log, logEgg;
beforeEach(() => {
  log = [];
  logEgg = newLogEgg(log);
});

test('it decides which actions passes, for example, only accepts increments in multiple of two', () => {
  const filterEgg = ({ filterAction }) => {
    filterAction(INCREMENT, (_, action) => action.value % 2 === 0);
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, filterEgg);
  store.dispatch(increment(1));
  store.dispatch(increment(2));
  store.dispatch(increment(3));

  expect(getCount(store.getState())).toEqual(2);
});

test('breeds, and the store, are in the first parameter, in this example, we do not want to count more than 10', () => {
  const filterEgg = ({ filterAction }) => {
    filterAction(INCREMENT, ({ store }, action) => {
      const count = getCount(store.getState());
      return count + action.value <= 10;
    });
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, filterEgg);
  store.dispatch(increment(2));
  store.dispatch(increment(3));
  store.dispatch(increment(4));
  store.dispatch(increment(5));
  store.dispatch(increment(6));

  expect(getCount(store.getState())).toEqual(9);
});

test('executes a callback when an action of that type is dispatched', () => {
  const filterEgg = ({ filterAction }) => {
    filterAction(INCREMENT, () => log.push('filterAction executed'));
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, filterEgg);
  store.dispatch(increment(1));

  expect(log).toContain('filterAction executed');
});

test('the callback receives the breeds object as first argument', () => {
  let foundStore;
  const filterEgg = ({ filterAction }) => {
    filterAction(INCREMENT, ({ store }) => {
      foundStore = store;
      return true;
    });
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, filterEgg);
  store.dispatch(increment(1));

  expect(getCount(foundStore.getState())).toEqual(1);
});

test('the callback receives the action as second argument', () => {
  let foundAction;
  const filterEgg = ({ filterAction }) => {
    filterAction(INCREMENT, (_, action) => {
      foundAction = action;
    });
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, filterEgg);
  store.dispatch(increment(1));

  expect(foundAction).toEqual(increment(1));
});

test('executes the callback brefore reducing it', () => {
  const filterEgg = ({ filterAction }) => {
    filterAction(INCREMENT, () => log.push('filterAction executed'));
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, filterEgg);
  store.dispatch(increment(1));

  expect(log).toEqual(['filterAction executed', increment(1)]);
});

test.each`
  truly
  ${true}
  ${1}
  ${'a'}
  ${{}}
  ${[]}
`('if it returns truly $truly the action is reduced', ({ truly }) => {
  const filterEgg = ({ filterAction }) => {
    filterAction(INCREMENT, () => truly);
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, filterEgg);
  store.dispatch(increment(1));

  expect(getCount(store.getState())).toEqual(1);
});

test.each`
  falsy
  ${false}
  ${0}
  ${''}
  ${null}
  ${undefined}
`('if it returns falsy $falsy the action is not reduced', ({ falsy }) => {
  const filterEgg = ({ filterAction }) => {
    filterAction(INCREMENT, () => falsy);
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, filterEgg);
  store.dispatch(increment(1));

  expect(getCount(store.getState())).toEqual(0);
});

test('if there are multiple filters, and one returns falsy, the action is not reduced', () => {
  const filterEgg = ({ filterAction }) => {
    filterAction(INCREMENT, () => true);
    filterAction(INCREMENT, () => false);
    filterAction(INCREMENT, () => true);
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, filterEgg);
  store.dispatch(increment(1));

  expect(getCount(store.getState())).toEqual(0);
});

test('filter function can decide for each action independently', () => {
  const filterEgg = ({ filterAction }) => {
    filterAction(INCREMENT, (_, { value }) => value % 2 === 0);
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, filterEgg);
  store.dispatch(increment(1));
  store.dispatch(increment(2));
  store.dispatch(increment(3));

  expect(getCount(store.getState())).toEqual(2);
});

test('each filter only affects one action type', () => {
  const filterEgg = ({ filterAction }) => {
    filterAction('DUMMY', () => false);
    filterAction(INCREMENT, () => true);
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, filterEgg);
  store.dispatch(increment(1));

  expect(getCount(store.getState())).toEqual(1);
});

test('throws when the egg is hatched', () => {
  let foundFilterAction;
  const anEgg = ({ filterAction }) => {
    foundFilterAction = filterAction;
  };

  hatch(reduxEgg, anEgg);
  expect(() => foundFilterAction(INCREMENT, () => {})).toThrow(
    /filterAction cannot be used once is hatched/
  );
});

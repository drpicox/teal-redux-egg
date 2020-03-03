import hatch from '../../../egg-hatchery/src/index';
import reduxEgg from '../';
import counterEgg, {
  INCREMENT,
  REPLACE_COUNT,
  increment,
  replaceCount,
  getCount
} from './helpers/counter-egg';
import { newLogEgg } from './helpers/new-log-egg';

let log, logEgg;
beforeEach(() => {
  log = [];
  logEgg = newLogEgg(log);
});

test('the order is the following', () => {
  const anEgg = ({ filterAction, decorateAction, afterAction }) => {
    filterAction(INCREMENT, () => log.push('increment 1 filterAction 1'));
    decorateAction(INCREMENT, () => log.push('increment 1 decorateAction 1'));
    afterAction(INCREMENT, () => log.push('increment 1 afterAction 1'));
    filterAction(INCREMENT, () => log.push('increment 1 filterAction 2'));
    decorateAction(INCREMENT, () => log.push('increment 1 decorateAction 2'));
    afterAction(INCREMENT, () => log.push('increment 1 afterAction 2'));
    filterAction(INCREMENT, () => log.push('increment 1 filterAction 3'));
    decorateAction(INCREMENT, () => log.push('increment 1 decorateAction 3'));
    afterAction(INCREMENT, () => log.push('increment 1 afterAction 3'));

    filterAction(REPLACE_COUNT, () => log.push('replaceCount filterAction'));
    decorateAction(REPLACE_COUNT, () =>
      log.push('replaceCount decorateAction')
    );
    afterAction(REPLACE_COUNT, () => log.push('replaceCount afterAction'));
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, anEgg);
  store.dispatch(replaceCount(10));
  store.dispatch(increment(1));

  expect(getCount(store.getState())).toBe(11);
  expect(log).toEqual([
    'replaceCount filterAction',
    'replaceCount decorateAction',
    replaceCount(10),
    'replaceCount afterAction',
    'increment 1 filterAction 1',
    'increment 1 filterAction 2',
    'increment 1 filterAction 3',
    'increment 1 decorateAction 1',
    'increment 1 decorateAction 2',
    'increment 1 decorateAction 3',
    increment(1),
    'increment 1 afterAction 1',
    'increment 1 afterAction 2',
    'increment 1 afterAction 3'
  ]);
});

test('a filterAction returning false prevents an action to continue', () => {
  const anEgg = ({ addMiddleware, filterAction, afterAction }) => {
    addMiddleware(_store => next => action => {
      log.push('middleware before filterAction');
      next(action);
    });
    filterAction(INCREMENT, () => log.push('filterAction before return false'));
    filterAction(INCREMENT, () => false);
    filterAction(INCREMENT, () => log.push('filterAction after return false'));
    afterAction(INCREMENT, () => log.push('the afterAction'));
    addMiddleware(_store => next => action => {
      log.push('middleware after filterAction');
      next(action);
    });
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, anEgg);
  store.dispatch(increment(1));

  expect(getCount(store.getState())).toBe(0);
  expect(log).toEqual(['filterAction before return false']);
});

test('middlewares and interceptors', () => {
  const middlewareEgg = ({ addMiddleware }) => {
    addMiddleware(_store => next => action => {
      log.push('middleware before next');
      next(action);
      log.push('middleware after next');
    });
  };

  const anEgg = ({ filterAction, decorateAction, afterAction }) => {
    filterAction(INCREMENT, (_, action) => {
      const filterIn = action.value !== 2;
      log.push(`filterAction ${filterIn}`);
      return filterIn;
    });
    decorateAction(INCREMENT, (_, action) => {
      const changeDecoration = action.value === 3;
      if (changeDecoration) {
        action.type = 'NOT_INCREMENT';
      }

      log.push(`decorateAction ${changeDecoration}`);
    });
    afterAction(INCREMENT, () => log.push('afterAction'));
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, middlewareEgg, anEgg);
  log.push('---- dispatch increment(1)');
  store.dispatch(increment(1));
  log.push('---- dispatch increment(2)');
  store.dispatch(increment(2));
  log.push('---- dispatch increment(3)');
  store.dispatch(increment(3));
  log.push('---- dispatch done');

  expect(getCount(store.getState())).toBe(1);
  expect(log).toEqual([
    '---- dispatch increment(1)',
    'filterAction true',
    'decorateAction false',
    'middleware before next',
    increment(1),
    'middleware after next',
    'afterAction',
    '---- dispatch increment(2)',
    'filterAction false',
    '---- dispatch increment(3)',
    'filterAction true',
    'decorateAction true',
    'middleware before next',
    { type: 'NOT_INCREMENT', value: 3 },
    'middleware after next',
    '---- dispatch done'
  ]);
});

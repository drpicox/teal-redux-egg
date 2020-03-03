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

test('it decorates the action with new properties', () => {
  const decorateEgg = ({ decorateAction }) => {
    let seqNumber = 0;
    decorateAction(INCREMENT, (_, action) => {
      action.seqNumber = seqNumber;
      seqNumber += 1;
    });
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, decorateEgg);
  store.dispatch(increment(1));
  store.dispatch(increment(2));
  store.dispatch(increment(1));

  expect(getCount(store.getState())).toEqual(4);
  expect(log).toMatchObject([
    { value: 1, seqNumber: 0 },
    { value: 2, seqNumber: 1 },
    { value: 1, seqNumber: 2 }
  ]);
});

test('breeds, and the store, are in the first parameter, in this example, we do not want to count more than 10', () => {
  const decorateEgg = ({ decorateAction }) => {
    decorateAction(INCREMENT, ({ store }, action) => {
      const count = getCount(store.getState());
      const remaining = 10 - count;

      if (action.value > remaining) {
        action.value = remaining;
      }
    });
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, decorateEgg);
  store.dispatch(increment(2));
  store.dispatch(increment(3));
  store.dispatch(increment(4));
  store.dispatch(increment(5));
  store.dispatch(increment(6));

  expect(getCount(store.getState())).toEqual(10);
});

test('executes a callback when an action of that type is dispatched', () => {
  const decorateEgg = ({ decorateAction }) => {
    decorateAction(INCREMENT, () => log.push('decorateAction executed'));
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, decorateEgg);
  store.dispatch(increment(1));

  expect(log).toContain('decorateAction executed');
});

test('the callback receives the breeds object as first argument', () => {
  let foundStore;
  const decorateEgg = ({ decorateAction }) => {
    decorateAction(INCREMENT, ({ store }) => {
      foundStore = store;
      return true;
    });
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, decorateEgg);
  store.dispatch(increment(1));

  expect(getCount(foundStore.getState())).toEqual(1);
});

test('the callback receives the action as second argument', () => {
  let foundAction;
  const decorateEgg = ({ decorateAction }) => {
    decorateAction(INCREMENT, (_, action) => {
      foundAction = action;
    });
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, decorateEgg);
  store.dispatch(increment(1));

  expect(foundAction).toEqual(increment(1));
});

test('executes the callback brefore reducing it', () => {
  const decorateEgg = ({ decorateAction }) => {
    decorateAction(INCREMENT, () => log.push('decorateAction executed'));
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, decorateEgg);
  store.dispatch(increment(1));

  expect(log).toEqual(['decorateAction executed', increment(1)]);
});

test('if there are multiple decorates, they are executed in the addition order, and it combines all changes', () => {
  const decorateEgg = ({ decorateAction }) => {
    decorateAction(INCREMENT, (_, action) => {
      action.seqNumber = 3;
    });
    decorateAction(INCREMENT, (_, action) => {
      action.id = '#31415';
    });
    decorateAction(INCREMENT, (_, action) => {
      action.value += action.seqNumber;
    });
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, decorateEgg);
  store.dispatch(increment(1));

  expect(getCount(store.getState())).toEqual(4);
  expect(log).toEqual([
    {
      type: INCREMENT,
      id: '#31415',
      seqNumber: 3,
      value: 4
    }
  ]);
});

test('decorate function can decide for each action independently', () => {
  const decorateEgg = ({ decorateAction }) => {
    decorateAction(INCREMENT, (_, action) => {
      if (action.value % 2 === 1) action.value += 1;
    });
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, decorateEgg);
  store.dispatch(increment(1));
  store.dispatch(increment(2));
  store.dispatch(increment(3));

  expect(getCount(store.getState())).toEqual(8);
});

test('each decorate only affects one action type', () => {
  const decorateEgg = ({ decorateAction }) => {
    decorateAction('DUMMY', (_, action) => {
      action.byDummy = true;
    });
    decorateAction(INCREMENT, (_, action) => {
      action.byIncrement = true;
    });
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, decorateEgg);
  store.dispatch(increment(1));

  expect(getCount(store.getState())).toEqual(1);
  expect(log).toEqual([
    {
      type: INCREMENT,
      value: 1,
      byIncrement: true
    }
  ]);
});

test('if a decorator changes the action type, the rest of decorators is executed', () => {
  const anEgg = ({ decorateAction }) => {
    decorateAction(INCREMENT, (_, action) => log.push(action.type));
    decorateAction(INCREMENT, (_, action) => {
      action.type = 'NOT_INCREMENT';
    });
    decorateAction(INCREMENT, (_, action) => log.push(action.type));
  };

  const { store } = hatch(reduxEgg, counterEgg, logEgg, anEgg);
  store.dispatch(increment(1));

  expect(getCount(store.getState())).toEqual(0);
  expect(log).toEqual([
    INCREMENT,
    'NOT_INCREMENT',
    { type: 'NOT_INCREMENT', value: 1 }
  ]);
});

test('throws when the egg is hatched', () => {
  let foundDecorateAction;
  const anEgg = ({ decorateAction }) => {
    foundDecorateAction = decorateAction;
  };

  hatch(reduxEgg, anEgg);
  expect(() => foundDecorateAction(INCREMENT, () => {})).toThrow(
    /decorateAction cannot be used once is hatched/
  );
});

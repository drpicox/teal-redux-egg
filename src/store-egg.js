import { applyMiddleware, createStore, compose } from 'redux';

export default function storeEgg({ tool, breed }) {
  const middleware = [];
  let newReducer = () => () => null;
  let composeEnhancers =
    (typeof window !== 'undefined' &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;

  tool('replaceNewReducer', nextNewReducer => {
    newReducer = nextNewReducer;
  });

  tool('replaceComposeEnhancers', nextComposeEnhancers => {
    composeEnhancers = nextComposeEnhancers;
  });

  tool('addMiddleware', oneMiddleware => {
    middleware.push(oneMiddleware);
  });

  breed('store', breeds =>
    createStore(
      newReducer(breeds),
      composeEnhancers(applyMiddleware(...middleware))
    )
  );
}

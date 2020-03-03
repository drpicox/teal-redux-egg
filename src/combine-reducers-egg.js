import { combineReducers } from 'redux';

export default function storeEgg(tools) {
  const reducers = Object.create(null);

  tools.tool('combineReducer', (name, reducer) => {
    if (tools.isHatched)
      throw new Error(
        `illegal state exception, combineReducer cannot be used once is hatched`
      );

    reducers[name] = reducer;
  });

  tools.replaceNewReducer(() => combineReducers(reducers));
}

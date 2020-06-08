"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tealReduxEgg = tealReduxEgg;

var _redux = require("redux");

var _InitialStateBuilder = require("./InitialStateBuilder");

var _ReduceBuilder = require("./ReduceBuilder");

var _AfterActionMiddlewareBuilder = require("./AfterActionMiddlewareBuilder");

function tealReduxEgg({
  tool,
  breed
}) {
  const initialStateBuilder = new _InitialStateBuilder.InitialStateBuilder();
  const reduceBuilder = new _ReduceBuilder.ReduceBuilder();
  const afterActionMiddlewareBuilder = new _AfterActionMiddlewareBuilder.AfterActionMiddlewareBuilder();
  const middlewareList = [];
  const composeEnhancers = typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || _redux.compose;
  tool('initializeState', initializeFn => {
    initialStateBuilder.add(initializeFn);
  });
  tool('reduceAction', (actionType, reduce) => {
    reduceBuilder.add(actionType, reduce);
  });
  tool('afterAction', (actionType, reduce) => {
    afterActionMiddlewareBuilder.add(actionType, reduce);
  });
  tool('addMiddleware', middleware => {
    middlewareList.push(middleware);
  });
  breed('store', breeds => {
    const initialState = initialStateBuilder.build(breeds);
    return (0, _redux.createStore)(reduceBuilder.build(), initialState, composeEnhancers((0, _redux.applyMiddleware)(...middlewareList, afterActionMiddlewareBuilder.build(breeds))));
  });
}
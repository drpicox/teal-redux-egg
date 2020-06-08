'use strict';

var redux = require('redux');

var InitialStateBuilder = /*#__PURE__*/function () {
  function InitialStateBuilder() {
    this.prepareFnList = [];
  }

  var _proto = InitialStateBuilder.prototype;

  _proto.add = function add(prepareFn) {
    this.prepareFnList.push(prepareFn);
  };

  _proto.build = function build(breeds) {
    return this.prepareFnList.reduce(function (state, fn) {
      return fn(state, breeds);
    }, undefined);
  };

  return InitialStateBuilder;
}();

var ActionMultiList = /*#__PURE__*/function () {
  function ActionMultiList() {
    this._lists = Object.create(null);
  }

  var _proto = ActionMultiList.prototype;

  _proto.add = function add(actionType, item) {
    this.list(actionType).push(item);
  };

  _proto.list = function (actionType) {
    var list = this._lists[actionType];

    if (!list) {
      list = [];
      this._lists[actionType] = list;
    }

    return list;
  };

  return ActionMultiList;
}();

var ReduceBuilder = /*#__PURE__*/function () {
  function ReduceBuilder() {
    this.reducers = new ActionMultiList();
  }

  var _proto = ReduceBuilder.prototype;

  _proto.add = function add(actionType, reduce) {
    this.reducers.add(actionType, reduce);
  };

  _proto.build = function build() {
    var _this = this;

    return function (state, action) {
      if (state === void 0) {
        state = {};
      }

      return _this.reducers.list(action.type).reduce(function (s, fn) {
        return fn(s, action);
      }, state);
    };
  };

  return ReduceBuilder;
}();

var AfterActionMiddlewareBuilder = /*#__PURE__*/function () {
  function AfterActionMiddlewareBuilder() {
    this.fns = new ActionMultiList();
  }

  var _proto = AfterActionMiddlewareBuilder.prototype;

  _proto.add = function add(actionType, fn) {
    this.fns.add(actionType, fn);
  };

  _proto.build = function build(breeds) {
    var _this = this;

    return function () {
      return function (next) {
        return function (action) {
          next(action);

          _this.fns.list(action.type).forEach(function (fn) {
            return fn(breeds, action);
          });
        };
      };
    };
  };

  return AfterActionMiddlewareBuilder;
}();

function tealReduxEgg(_ref) {
  var tool = _ref.tool,
      breed = _ref.breed;
  var initialStateBuilder = new InitialStateBuilder();
  var reduceBuilder = new ReduceBuilder();
  var afterActionMiddlewareBuilder = new AfterActionMiddlewareBuilder();
  var middlewareList = [];
  var composeEnhancers = typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || redux.compose;
  tool('initializeState', function (initializeFn) {
    initialStateBuilder.add(initializeFn);
  });
  tool('reduceAction', function (actionType, reduce) {
    reduceBuilder.add(actionType, reduce);
  });
  tool('afterAction', function (actionType, reduce) {
    afterActionMiddlewareBuilder.add(actionType, reduce);
  });
  tool('addMiddleware', function (middleware) {
    middlewareList.push(middleware);
  });
  breed('store', function (breeds) {
    var initialState = initialStateBuilder.build(breeds);
    return redux.createStore(reduceBuilder.build(), initialState, composeEnhancers(redux.applyMiddleware.apply(void 0, middlewareList.concat([afterActionMiddlewareBuilder.build(breeds)]))));
  });
}

module.exports = tealReduxEgg;

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AfterActionMiddlewareBuilder = void 0;

var _ActionMultiList = require("./ActionMultiList");

class AfterActionMiddlewareBuilder {
  constructor() {
    this.fns = new _ActionMultiList.ActionMultiList();
  }

  add(actionType, fn) {
    this.fns.add(actionType, fn);
  }

  build(breeds) {
    return () => next => action => {
      next(action);
      this.fns.list(action.type).forEach(fn => fn(breeds, action));
    };
  }

}

exports.AfterActionMiddlewareBuilder = AfterActionMiddlewareBuilder;
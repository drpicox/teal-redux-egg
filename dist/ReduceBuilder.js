"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReduceBuilder = void 0;

var _ActionMultiList = require("./ActionMultiList");

class ReduceBuilder {
  constructor() {
    this.reducers = new _ActionMultiList.ActionMultiList();
  }

  add(actionType, reduce) {
    this.reducers.add(actionType, reduce);
  }

  build() {
    return (state = {}, action) => this.reducers.list(action.type).reduce((s, fn) => fn(s, action), state);
  }

}

exports.ReduceBuilder = ReduceBuilder;
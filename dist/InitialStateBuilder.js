"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InitialStateBuilder = void 0;

class InitialStateBuilder {
  constructor() {
    this.prepareFnList = [];
  }

  add(prepareFn) {
    this.prepareFnList.push(prepareFn);
  }

  build(breeds) {
    return this.prepareFnList.reduce((state, fn) => fn(state, breeds), undefined);
  }

}

exports.InitialStateBuilder = InitialStateBuilder;
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ActionMultiList = void 0;

class ActionMultiList {
  constructor() {
    this._lists = Object.create(null);
  }

  add(actionType, item) {
    this.list(actionType).push(item);
  }

  list(actionType) {
    let list = this._lists[actionType];

    if (!list) {
      list = [];
      this._lists[actionType] = list;
    }

    return list;
  }

}

exports.ActionMultiList = ActionMultiList;
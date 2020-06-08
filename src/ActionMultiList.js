export class ActionMultiList {
  _lists = Object.create(null)

  add(actionType, item) {
    this.list(actionType).push(item)
  }

  list(actionType) {
    let list = this._lists[actionType]
    if (!list) {
      list = []
      this._lists[actionType] = list
    }
    return list
  }
}

import { ActionMultiList } from './ActionMultiList'

export class ReduceBuilder {
  reducers = new ActionMultiList()

  add(actionType, reduce) {
    this.reducers.add(actionType, reduce)
  }

  build() {
    return (state = {}, action) =>
      this.reducers.list(action.type).reduce((s, fn) => fn(s, action), state)
  }
}

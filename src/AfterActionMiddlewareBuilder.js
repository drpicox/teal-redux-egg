import { ActionMultiList } from './ActionMultiList'

export class AfterActionMiddlewareBuilder {
  fns = new ActionMultiList()

  add(actionType, fn) {
    this.fns.add(actionType, fn)
  }

  build(breeds) {
    return () => (next) => (action) => {
      next(action)
      this.fns.list(action.type).forEach((fn) => fn(breeds, action))
    }
  }
}

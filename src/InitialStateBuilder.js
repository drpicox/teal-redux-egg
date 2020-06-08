export class InitialStateBuilder {
  prepareFnList = []

  add(prepareFn) {
    this.prepareFnList.push(prepareFn)
  }

  build(breeds) {
    return this.prepareFnList.reduce(
      (state, fn) => fn(state, breeds),
      undefined,
    )
  }
}

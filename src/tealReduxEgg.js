import { applyMiddleware, createStore, compose } from 'redux'
import { InitialStateBuilder } from './InitialStateBuilder'
import { ReduceBuilder } from './ReduceBuilder'
import { AfterActionMiddlewareBuilder } from './AfterActionMiddlewareBuilder'

export function tealReduxEgg({ tool, breed }) {
  const initialStateBuilder = new InitialStateBuilder()
  const reduceBuilder = new ReduceBuilder()
  const afterActionMiddlewareBuilder = new AfterActionMiddlewareBuilder()
  const middlewareList = []
  const composeEnhancers =
    (typeof window !== 'undefined' &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose

  tool('initializeState', (initializeFn) => {
    initialStateBuilder.add(initializeFn)
  })
  tool('reduceAction', (actionType, reduce) => {
    reduceBuilder.add(actionType, reduce)
  })
  tool('afterAction', (actionType, reduce) => {
    afterActionMiddlewareBuilder.add(actionType, reduce)
  })
  tool('addMiddleware', (middleware) => {
    middlewareList.push(middleware)
  })

  breed('store', (breeds) => {
    const initialState = initialStateBuilder.build(breeds)
    return createStore(
      reduceBuilder.build(),
      initialState,
      composeEnhancers(
        applyMiddleware(
          ...middlewareList,
          afterActionMiddlewareBuilder.build(breeds),
        ),
      ),
    )
  })
}

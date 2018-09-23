import { createStore, combineReducers } from 'redux'
import * as reducers from './reducer'

const createStore = (game) => {
  const store = createStore(combineReducers(reducers))
  
}
export {
  createStore
}

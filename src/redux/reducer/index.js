import { ActionMap } from '../action'

const reducers = {}

const createReducer = (type, val = null) => {
  return (state, action) => {
    if (action.type === type) {
      if (action.payload === 0) return 0
      return (action.payload && action.payload) || state 
    }
    if (state === 0) return 0
    return state || val
  }
}

Object.keys(ActionMap).forEach(k => {
  reducers[k] = createReducer(k)
})

reducers.logs = (state = [], action) => {
  if ( (action.type === 'logs') && action.payload) {
    state.push(action.payload)
    return state.slice(0)
  }
  return state
}

export default reducers
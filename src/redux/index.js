import { createStore, combineReducers } from 'redux'
import reducers from './reducer'

const store = createStore(combineReducers(reducers), {
  phase: '等待开始',
  players: [],
  logs: [],
  currentPlayerIndex: 0,  // 当前回合的玩家序号
  currentSelect: 0, // 当前选中的玩家
  target: [], // 被选中为目标的玩家
})

export { store }

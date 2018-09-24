const ActionMap = {
  phase: null,
  players: null,
  logs: null,
  currentPlayerIndex: 0,
  currentSelect: 0,
  target: [],
}

const createAction = (type) => {
  const action = (data) => {
    return {
      type,
      payload: data,
    }
  }
  ActionMap[type] = action
  return action
}

Object.keys(ActionMap).forEach(k => createAction(k))

export {
  createAction,
  ActionMap
}

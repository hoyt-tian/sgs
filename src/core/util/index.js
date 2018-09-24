const list2map = (list = []) => {
  const map = {}
  list.forEach(i => map[i] = i)
  return map
}

const promiseQueue = (promises, fn) => {
  if (promises && promises.length) {
    const p = promises.shift()
    return fn(p).then(() => {
      return promiseQueue(promiseQueue, fn)
    }, (err) => {
      throw err
    })
  } else {
    return Promise.resolve()
  }
  
}

const PChars = ['0', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const pokerChar = (val) => {
  return PChars[val]
}

export {
  list2map,
  promiseQueue,
  pokerChar,
}
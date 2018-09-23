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

export {
  list2map,
  promiseQueue
}
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

/**
 * 是否为锦囊牌
 * @param {*} name 
 */
const isMagic = (name) => ['无中生有', '无懈可击', 
      '决斗', '借刀杀人', '万箭齐发', '南蛮入侵', 
      '顺手牵羊', '五谷丰登', '桃园结义', '过河拆桥', '乐不思蜀', '闪电'].indexOf(name) > -1

export {
  list2map,
  promiseQueue,
  pokerChar,
  isMagic
}
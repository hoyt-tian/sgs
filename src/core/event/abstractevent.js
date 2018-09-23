const EventType = {
  PhaseEvent: 'PE',
  CardEvent: 'CE',
  SkillEvent: 'SE',
  DamageEvent: 'DE',
}

class AbstractEvent {

  constructor({ type, data }) {
    this.type = type
    this.data = data
  }

  execute(game) {
    return new Promise((resolve, reject) => {
      try{
        const listeners = game.listeners.filter(f => f && f.accept && f.accept(this, game)).sort((a, b) => b.priority - a.priority)
        // console.log(`执行事件${this.type} - ${this.data.name}，相关监听函数共有${listeners.length}个`)
        const events = []
        const hanlder = (es) => {
          if (es instanceof AbstractEvent) {
            events.push(es)
          } else if (es instanceof Array) {
            es.forEach(i => events.push(i))
          }
          if (listeners.length) return listeners.shift().execute(this, game).then(hanlder)
          return resolve(events)
        } 
        return hanlder()
      }catch(e) {
        console.error(e)
        reject(this)
      }
    })
  }

}

export default AbstractEvent
export {
  EventType
}

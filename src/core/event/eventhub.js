import AbstractEvent from "./abstractevent";

class EventHub {
  constructor() {
    this.events = []
  }

  poll() {
    if (this.events.length) {
      const event = this.events.shift()
      return event
    }
  }

  push(events = null) {
    if (events instanceof Array) {
      events.forEach(e => this.push(e))
    } else if (events instanceof AbstractEvent) {
      this.events.push(events)
      // console.info(`增加新事件${JSON.stringify(events)}`)
    } else {
      throw new Error('只允许添加抽象事件')
    }
  }
}

export default EventHub

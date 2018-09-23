class Listener {

  constructor(accept, execute, priority = 0) {
    this.priority = priority
    this.accept = accept.bind(this)
    this.execute = (event, game) => {
      return new Promise((resolve, reject) => {
        try{
          execute(event, game, resolve, reject)
        } catch(e) {
          reject(e)
        }
      })
    }
  }
}

export default Listener

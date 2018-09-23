
const defaults = {
  maxHP: 3,
  hp: 3,
  name: '',
}

class Player {
  constructor(cfg) {
    Object.assign(this, defaults, cfg)
    this.cards = []
    this.judges = []
  }

  setHandLimit(val) {
    this.handLimit = val
  }

  addCard(card) {
    card.inUse = true
    this.cards.push(card)
  }

  addCards(cards = []) {
    cards.forEach(c => this.addCard(c))
  }
}

export default Player;
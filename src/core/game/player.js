

class Player {
  constructor({
    name,
  }) {
    this.hp = this.maxHP = 3
    this.name = name
    this.cards = []
    this.judges = []
    this.weapon = null
    this.shield = null
    this.atthorse = null
    this.defhorse = null
    this.hero = null
    this.roleCard = null
    this.status = []
  }

  hasSkill(name) {
    return this.hero && this.hero.hasSkill(name)
  }

  hasStatus(name) {
    return this.status.indexOf(name) > -1
  }

  removeStatus(name) {
    this.status = this.status.filter(s => s !== name)
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

  toViewModel() {
    return {
      name: this.name,
      hp: this.hp,
      maxHP: this.maxHP,
      hero: this.hero,
      roleCard: this.roleCard,
      cards: this.cards,
    }
  }
}

export default Player;
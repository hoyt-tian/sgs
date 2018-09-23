
const CardType = {
  RoleCard: 'RC',
  GameCard: 'GC',
  HeroCard: 'HC'
}

const RoleCardType = {
  Lord: '主公',
  Loyal: '忠臣',
  Rebel: '反贼',
  Careerist: '内奸',
}

const Static = {
  ID: 0,
}

class Card {

  constructor(type = CardType.GameCard, name = Math.random(), id = Static.ID++) {
    this.id = id
    this.name = name
    this.type = type
  }
}

export default Card
export { CardType, RoleCardType }
import Card, { CardType } from './card'

const CardSuit = {
  Heart: 'H',
  Spade: 'S',
  Diamond: 'D',
  Club: 'C',
}

class GameCard extends Card {

  constructor({
    point,
    suit,
    name
  }) {
    super(CardType.GameCard, name)
    this.point = point
    this.suit = suit
  }

  toJSON() {
    return {
      name: this.name,
      point: this.point,
      suit: this.suit
    }
  }

  /**
   * 创建指定的卡牌
   * 花色可选
   * @param {*} param0 
   */
  static createCards({
    name,
    suits = {

    }
  }) {
    const cards = []
    Object.keys(suits).forEach(k => {
      const points = suits[k]
      points.forEach(v => {
        cards.push(new GameCard({
          name,
          point: v,
          suit: CardSuit[k],
        }))
      })
    })
    return cards
  }
}

export default GameCard
export {
  CardSuit
}

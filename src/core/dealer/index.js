import Deck from './deck'
import knuthShuffle from 'knuth-shuffle'
class Dealer {

  constructor() {
    this.cards = []
    this.cursor = 0
  }

  /**
   * 添加单张卡牌
   * @param {*} deck 
   */
  addDeck(deck) {
    deck.getCards().forEach(c => this.addCard(c))
  }

  /**
   * 添加卡组
   * @param {*} card 
   */
  addCard(card) {
    if (this.cards.indexOf(card) > -1) {
      throw new Error('重复添加卡牌')
    }
    this.cards.push(card)
  }

  /**
   * 洗牌
   */
  shuffle() {
    console.info('触发洗牌')
    knuthShuffle.knuthShuffle(this.cards)
    this.cursor = 0
  }

  /**
   * 获取下一张卡牌
   */
  nextCard() {
    if (this.cursor < this.cards.length) {
      if (this.cards[this.cursor]) {
        if (this.cards[this.cursor].inUse) {
          // console.info(`牌堆第${this.cursor}张牌正在使用中，查看下一张是否可用`)
          this.cursor++
          return this.nextCard()
        } else {
          // console.info(`返回牌堆第${this.cursor}张牌`)
          return this.cards[this.cursor++]
        }
      } else {
        throw new Error(`No Card at ${this.cursor}`)
      }
    } else {
      console.info(`牌堆见底，触发洗牌`)
      this.shuffle()
      return this.nextCard()
    }
  }

  /**
   * 从牌堆中获取前n张可用的牌
   * @param {*} count 
   */
  drawCards(n = 1) {
    const cards = []
    for(let i = 0; i < n; i++) {
      cards.push(this.nextCard())
    }
    return cards
  }

  /**
   * 创建卡牌荷官
   * @param {*} param0 
   */
  static createDealer({
    cards = [],
    decks = []
  }) {
    const dealer = new Dealer()
    decks.forEach(d => dealer.addDeck(d))
    cards.forEach(c => dealer.addCard(c))
    return dealer
  }

  /**
   * 标准身份牌
   * @param {*} playerCount 
   */
  static createRoleDealer(playerCount) {
    return Dealer.createDealer({
      decks: [ Deck.createRoleDeck(playerCount) ]
    })
  }

  /**
   * 标准版游戏牌
   */
  static createStandardDealer() {
    const deck = Deck.standardGameDeck()
    const dealer = new Dealer()
    dealer.addDeck(deck)
    return dealer
  }

  /**
   * 标准版武将
   */
  static createStandardHeroDealer() {
    const deck = Deck.standardHeroDeck()
    const dealer = new Dealer()
    dealer.addDeck(deck)
    return dealer
  }

}

export default Dealer
import Deck from '../../../src/core/dealer/deck'
import { CardSuit } from '../../../src/core/card/gamecard';

describe('标准包卡组检测', () => {
  const deck = Deck.standardGameDeck()
  const map = {
    'S': 0,
    'D': 1,
    'C': 2,
    'H': 3,
  }
  deck.sort((c1, c2) => {
    if (c1.suit !== c2.suit) return map[c1.suit] - map[c2.suit]
    return c1.point - c2.point
  })

  const cards = deck.getCards()
  
  test('卡牌数量检测', () => {
    expect(deck.getCards().length).toBe(104)
  });

  ((cards) => {
    return [CardSuit.Spade, CardSuit.Club, CardSuit.Diamond, CardSuit.Heart].map(suit => {
      test(`花色${suit}数量验证`, () => {
        const ss = cards.filter(c => c.suit === suit)
        expect(ss.length).toBe(cards.length >> 2)
      }) 
      
    })
  })(cards);

})

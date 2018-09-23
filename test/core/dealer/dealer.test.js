import Dealer from "../../../src/core/dealer"

describe('荷官功能测试', () => {
  const standard = Dealer.createStandardDealer()
  const role = Dealer.createRoleDealer()

  test('测试洗牌功能', () => {
    const c0 = standard.cards[0]
    standard.shuffle()
    const cc = standard.cards[0]
    expect(c0 !== cc).toBeTruthy()
  })

  test('抽5张牌', () => {
    standard.shuffle()
    const c0 = standard.cards.slice(0, 5)
    const c1 = standard.drawCards(5)
    c0.forEach( (i,idx) => {
      expect(i === c1[idx]).toBeTruthy()
    })
  })

})
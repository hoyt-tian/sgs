import GameCard from './gamecard'
/**
 * 虚拟卡牌，将某（几）张牌用作为另一种牌
 */
class VirtualCard extends GameCard{
  constructor(conf) {
    super(conf)
    this.cards = conf.cards
  }
}

export default VirtualCard

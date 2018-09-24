import React from 'react'
import { pokerChar } from '../../core/util'
import { CardSuit } from '../../core/card/gamecard'
import './index.less'

const SuitMap = {
  [CardSuit.Heart]: '♥',
  [CardSuit.Diamond]: '♦',
  [CardSuit.Club]: '♣',
  [CardSuit.Spade]: '♠',
}
const SuitChar = c => SuitMap[c]
const Color = s => (s === CardSuit.Heart || s === CardSuit.Diamond) ? 'red' : 'black'
class GameCard extends React.PureComponent {
  render() {
    const { card, className, onClick } = this.props
    return <section className={`game-card ${className}`} onClick={onClick}>
              <div className={Color(card.suit)}><div>{pokerChar(card.point)}</div><div>{SuitChar(card.suit)}</div></div>
              <div className="card-name">{card.name}</div>
            </section>
  }
}

export default GameCard

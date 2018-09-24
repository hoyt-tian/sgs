import React from 'react'
import { store } from '../../redux'
import { ActionMap } from '../../redux/action'

class Player extends React.PureComponent {
  render() {
    const { playerIndex, currentSelect } = this.props
    const { cards, name, hero, hp, maxHP } = this.props.player
    return <section className={this.props.className}
      onClick={() => {
        const { target = [] } = store.getState()
        const remain = target.filter(t => t !== playerIndex)
        if (remain.length === target.length) {  // 尚未被选中
          remain.push(playerIndex)
        }
        store.dispatch(ActionMap.target(remain))
      }}
      >
      <div>{name}</div>
      <div>{hero && hero.name || '未分配英雄'}</div>
      <div>HP:{hp}/{maxHP}</div>
      <div>手牌:{cards.length}</div>
      { (playerIndex !== currentSelect) && <div onClick={(event) => {
        store.dispatch(ActionMap.currentSelect(playerIndex))
        store.dispatch(ActionMap.target([]))
        event.stopPropagation()
      }}>切换</div>}
    </section>
  }
}

export default Player

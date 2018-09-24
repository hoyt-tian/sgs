import React from 'react'
import GameCard from '../gamecard'
import Profile from '../profile'
import './index.less'

class Bench extends React.Component {
  constructor(props, context, updater) {
    super(props, context, updater)

    this.state = {
      selected: null,
    }
  }
  render() {
    const { player, confirmText, cancelText } = this.props
    return <section className="bench">
      <section class="card-list">{player && player.cards.map((c, idx) => {
        return <GameCard card={c} className={idx === this.state.selected ? 'select' : ''}
        onClick={() => {
          this.setState({
            selected: idx,
          }, () => {
            this.props.onChange(idx)
          })
        }}/>
      })}</section>
      <section className="op-prof">
        <section className="operation">
          <div className={`btn-use ${this.state.selected !== null ? 'enable' : 'disable'}`}
            onClick={() => {
              if (this.props.onConfirm) this.props.onConfirm(this.state, this.props)
              this.setState({
                selected: null,
              })
            }}
          >{confirmText}</div>
          <div className="btn-cancel" onClick={() => {
            if (this.props.onCancel) this.props.onCancel(this.state, this.props)
            this.setState({
              selected: null,
            })
          }}>{cancelText}</div>
        </section>
        <Profile player={player} />
      </section>
    </section>
  }
}

export default Bench

import React from 'react'
import Game from '../../core/game'
import { connect } from 'react-redux'
import Listener from '../../core/listener/listener'
import { EventType } from '../../core/event/abstractevent'
import Gamelog from '../gamelog'
import Player from '../player'
import Bench from '../bench'
import Dialog from '../dialog'
import './index.less'
import { ActionMap } from '../../redux/action';

class WarRoom extends React.Component{
  constructor(props, context, updater) {
    super(props, context, updater)
    this.game = Game.standard(8)
    this.game.dispatch = props.dispatch
    this.state = {
      showDialog: false,
      selected: null,
      benchConfirm: null,
      benchCancel: null,
    }
    
    this.setupGame(this.game)

  }

  setupGame(game) {
    game.requireCards = ({ target, cards, playerIndex }) => {
      return new Promise((resolve, reject) => {
        game.dispatch(ActionMap.currentSelect(target))
        game.dispatch(ActionMap.target([]))

        const { benchConfirm, benchCancel, benchCancelText, benchConfirmText } = this.state
        this.setState({
          showDialog: true,
          dialog: {
            type: 'alert',
            title: '请出牌',
            content: `您需要打出${cards.join(',')}`,
          },
          benchConfirmText: '出牌',
          benchCancelText: '取消',
          benchConfirm: () => {
            game.dispatch(ActionMap.players(game.players.map(p => p.toViewModel())))
            game.dispatch(ActionMap.currentSelect(playerIndex))
            game.dispatch(ActionMap.target([]))

            this.setState({
              showDialog: false,
              dialog: null,
              benchCancel,
              benchCancelText,
              benchConfirm,
              benchConfirmText,
            })
            resolve(arguments)
          },
          benchCancel: () => {
            game.dispatch(ActionMap.currentSelect(playerIndex))
            game.dispatch(ActionMap.target([]))

            this.setState({
              showDialog: false,
              dialog: null,
              benchCancel,
              benchCancelText,
              benchConfirm,
              benchConfirmText,
            }, () => reject({ cards, target }))
          }
        })

      })
    }

    game.chooseCard = () =>{
      return new Promise((resolve, reject) => {
          this.setState({
            benchConfirmText: '出牌',
            benchCancelText: '结束',
            benchConfirm: (state, props) => {
              game.useCard({
                playerIndex: props.playerIndex,
                cardIndex: state.selected,
                target: props.target,
              })
            },
            benchCancel: () => {
              resolve()
            }
          })
      })
    }

    game.confirm = (dialog) => {
      return new Promise((resolve, reject) => {
        dialog.type = 'confirm'
        dialog.onResolve = () => {
          this.setState({
            showDialog: false,
            dialog: null
          }, () => resolve() )
        }
        dialog.onReject = () => {
          this.setState({
            showDialog: false,
            dialog: null
          }, () => reject() )
        }
        this.setState({
          showDialog: true,
          dialog
        })
      })
    }

    const listeners = [
      new Listener(function(event){
        return (event.type === EventType.PhaseEvent) && (event.data.name === '初始手牌')
      }, function(event, game, resolve){
        const nhero = '许褚'
        game.assignHero(game.players[1], game.heroDealer.cards.find(c => c.name === nhero))
        game.dispatch(ActionMap.players(
          game.players.map(p => p.toViewModel())
        ))
        resolve()
      }, -1),
      new Listener(function(event){
        return (event.type === EventType.PhaseEvent) && (event.data.name === '回合开始')
      }, function(event, game, resolve){
        game.dispatch(ActionMap.currentSelect(event.data.playerIndex))
        game.dispatch(ActionMap.target([]))
        resolve()
        /*
        if (event.data.turnCounter > 20) {
          throw new Error('故意抛出异常')
        } else {
          resolve()
        }
        */
      }, 100),
    ]

    listeners.forEach(l => this.game.listeners.push(l))

  }

  render() {
    return <section className="warroom">
      <section>
        <button onClick={() => {
          this.game.run()
        }}>开始</button>
      </section>
      <section className="table">
        <section className="player-list">
          {this.state.showDialog && this.state.dialog && <Dialog {...this.state.dialog} selected={this.state.selected}/>}
          {this.props.players.map((p, idx) => <Player 
            player={p} 
            className={`player ${this.props.currentPlayerIndex === idx ? 'active' : ''} ${this.props.currentSelect === idx ? 'select' : ''} ${this.props.target.indexOf(idx) > -1 ? 'target' : ''}`} 
            playerIndex={idx}
            currentSelect={this.props.currentSelect}
          />)}
        </section>
        <Gamelog logs={this.props.logs} />
      </section>
      <Bench  player={this.props.players[this.props.currentSelect]}
              target={this.props.target}
              playerIndex={this.props.currentSelect} 
              game={this.game} 
              onChange={(idx) => {
                this.setState({
                  selected: idx,
                })
              }}
              onConfirm={this.state.benchConfirm}
              confirmText={this.state.benchConfirmText}
              onCancel={this.state.benchCancel}
              cancelText={this.state.benchCancelText}
            />
    </section>
  }
}

const mapState2Props = (state) => {
  return state
}

export default connect(mapState2Props)(WarRoom)

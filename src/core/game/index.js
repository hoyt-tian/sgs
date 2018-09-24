import Player from './player';
import AbstractEvent, { EventType } from '../event/abstractevent';
import Dealer from '../dealer'
import EventHub from '../event/eventhub'
import * as Listeners from '../listener'
import { ActionMap } from '../../redux/action'

class Game {
  constructor({ 
    players,
    roleDealer,
    gameDealer,
    heroDealer,
    eventHub = new EventHub(),
    listeners = []
  }) {
    this.players = players
    this.roleDealer = roleDealer
    this.gameDealer = gameDealer
    this.heroDealer = heroDealer
    this.eventHub = eventHub

    this.listeners = listeners
    console.log('初始化Game')
    const event = new AbstractEvent({
      type: EventType.PhaseEvent,
      data: {
        name: '游戏开始',
      }
    })
    this.eventHub.push(event)
    this.dispatch = (action) => console.info(`$$Dispatch$$ ${JSON.stringify(action)}`)
  }

  run() {
    const event = this.eventHub.poll()
    return event.execute(this).then((events) => {
      this.eventHub.push(events)
      return this.run()
    }, (err) => {
      console.error(err)
      return this.run()
    })
  }

  useCard({
    playerIndex,
    cardIndex,
    target,
    skill,
  }) {
    return new AbstractEvent({
      type: EventType.CardEvent,
      data: {
        name: '使用卡牌',
        playerIndex,
        cardIndex,
        target,
        skill,
      }
    }).execute(this)
  }

  /**
   * 在warroom中定义
   * @param {*} param0 
   */
  requireCards({
    target,
    cards
  }) {
    
  }

  /**
   * 选牌出
   * @param {*} param0 
   */
  chooseCards({}){

  }

  assignRole(player, roleCard) {
    roleCard.inUse = true
    player.roleCard = roleCard
    console.log('准备分配角色', JSON.stringify(arguments))
  }

  assignHero(player, heroCard) {
    heroCard.inUse = true
    player.hero = heroCard
    player.maxHP = heroCard.hp
    player.hp = player.maxHP
    // console.log(`玩家${player.name}选择了英雄${heroCard.name}，体力上限为${player.hp}`)
    this.dispatch(ActionMap.logs(`${player.name}选择了英雄${heroCard.name}`))

  }

  static standard(playerCount) {
    const game = new Game({
      players: [
        '王路飞',
        '琦玉',
        '狗剩',
        '建国',
        '蛋蛋',
        '慕容',
        '强子',
        '彩霞'
      ].map((i) => new Player({
          name: i,
        }),
      ),
      roleDealer: Dealer.createRoleDealer(playerCount),
      gameDealer: Dealer.createStandardDealer(),
      heroDealer: Dealer.createStandardHeroDealer(),
      listeners: Object.keys(Listeners).map(k => Listeners[k])
    })
    game.gameDealer.shuffle()
    return game
  }

}

export default Game

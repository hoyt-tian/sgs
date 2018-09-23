import Player from './player';
import AbstractEvent, { EventType } from '../event/abstractevent';
import Dealer from '../dealer'
import EventHub from '../event/eventhub'
import * as Listeners from '../listener'

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

  assignRole(player, roleCard) {
    roleCard.inUse = true
    console.log('准备分配角色', JSON.stringify(arguments))
  }

  assignHero(player, heroCard) {
    heroCard.inUse = true
    player.hero = heroCard
    player.maxHP = heroCard.hp
    player.hp = player.maxHP
    player.hasSkill = (name) => heroCard.hasSkill(name)
    console.log(`玩家${player.name}选择了英雄${heroCard.name}，体力上限为${player.hp}`)

  }

  static standard(playerCount) {
    const game = new Game({
      players: new Array(8).fill(0).map((i,idx) => new Player({
          name: `${idx+1}号玩家`,
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

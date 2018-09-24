import Listener from './listener'
import AbstractEvent, { EventType } from '../event/abstractevent'
import knuthShuffle from 'knuth-shuffle'
import { CardSuit } from '../card/gamecard';
import { ActionMap } from '../../redux/action'
import { isMagic } from '../util'

/**
 * 标准游戏开局
 */
const 游戏开始 = new Listener(function(event){
  return event.type === EventType.PhaseEvent && event.data.name === '游戏开始'
}, function(event, game, resolve){
  console.log('标准游戏开局')
  game.dispatch(ActionMap.phase('游戏开局'))
  game.dispatch(ActionMap.logs(`游戏开始，准备分配位置和角色`))
  game.roundCounter = 0
  game.turnCounter = 0
  return resolve(new AbstractEvent({
    type: EventType.PhaseEvent,
    data: {
      name: '分配位置和角色'
    },
  }))
})
/**
 * 分配位置
 */
const 分配位置和角色 = new Listener(function(event) {
  return event.type === EventType.PhaseEvent && event.data.name === '分配位置和角色'
}, function(event, game, resolve,) {
  console.info('分配位置和角色')
  knuthShuffle.knuthShuffle(game.players)
  const { roleDealer, players } = game
  roleDealer.cards.forEach(c => c.inUse = false)
  game.assignRole(players[0], roleDealer.cards[0])
  game.dispatch(ActionMap.logs(`${players[0].name}是${players[0].roleCard.name}`))

  roleDealer.shuffle()
  for(let i = 1; i < players.length; i++) {
    game.assignRole(players[i], roleDealer.nextCard())
    // game.dispatch(ActionMap.logs(`${players[i].name}是${players[i].roleCard.name}`))
  }
  game.dispatch(ActionMap.players(
    game.players.map(p => p.toViewModel())
  ))
  resolve(new AbstractEvent({
    type: EventType.PhaseEvent,
    data: {
      name: '主公选将',
      lord: game.players[0]
    },
  }))
})

/**
 * 主公位选择武将
 */
const 主公选将 = new Listener(function(event, game){
  return event.type === EventType.PhaseEvent && event.data.name === '主公选将'
}, function(event, game, resolve) {
  //  console.info('主公选择武将')
   game.heroDealer.shuffle()
   const heros = game.heroDealer.cards
   const lords = heros.filter(h => h.isLord)
   const general = heros.filter(h => !h.isLord).slice(0, 2)
   const candicates = lords.concat(general)
   knuthShuffle.knuthShuffle(candicates)
   // todo 默认随机pick一个，要改成ui上选
  game.assignHero(event.data.lord, candicates[0])
  game.dispatch(ActionMap.players(game.players.map(p => p.toViewModel())))
  if (game.players.length >= 5) {
    event.data.lord.maxHP += 1
    event.data.lord.hp += 1
    game.dispatch(ActionMap.logs(`在场玩家不少于5名，主公体力上限增加1点，变为${event.data.lord.hp}`))
  }
  const remains = heros.filter(h => !h.inUse)

  const events = []
  // todo 未来改成并行，暂时先串行
  for(let i = 1; i < game.players.length; i += 1) {

    events.push(new AbstractEvent({
      type: EventType.PhaseEvent,
      data: {
        name: '选择武将',
        player: game.players[i],
        candicates: remains.slice(1 + (i-1)*3, i * 3),
      },
    }))
  }
  events.push(new AbstractEvent({
    type: EventType.PhaseEvent,
    data: {
      name: '初始手牌',
    }
  }))
  resolve(events)
})

/**
 * 非主公玩家选择英雄
 */
const 选择武将 = new Listener(function(event, game){
  return event.type === EventType.PhaseEvent && event.data.name === '选择武将'
}, function(event, game, resolve){
  const { player, candicates } = event.data
  game.assignHero(player, candicates[0])
  game.dispatch(ActionMap.players(game.players.map(p => p.toViewModel())))
  resolve()
})

/**
 * 游戏开始，每个玩家摸4张起始手牌
 */
const 初始手牌 = new Listener(function(event, game){
  return event.type === EventType.PhaseEvent && event.data.name === '初始手牌'
}, function(event, game, resolve){
  const { gameDealer } = game
  game.players.forEach((p,idx) => {
    const cards = gameDealer.drawCards(4)
    p.addCards(cards)
    // console.info(`玩家${p.name}摸了4张手牌`)
    game.dispatch(ActionMap.logs(`${idx}号位置玩家${p.name}摸了4张手牌`))
  })
  game.dispatch(ActionMap.players(game.players.map(p => p.toViewModel())))
  resolve(new AbstractEvent({
    type: EventType.PhaseEvent,
    data: {
      name: '回合开始',
      playerIndex: 0,
    }
  }))
})

const 回合开始 = new Listener(function(event){
  return event.type === EventType.PhaseEvent && event.data.name === '回合开始'
}, function(event, game, resolve){
  const player = game.players[event.data.playerIndex]
  player.shaRemain = 1  // 普通武将单局只能出一次杀
  player.isShaUsed = false
  player.drawCount = 2
  if (event.data.playerIndex === 0) {
    game.roundCounter++
    console.log(`开始新轮次${game.roundCounter}`)
  }
  game.turnCounter++
  console.log(`第${game.roundCounter}轮/第${game.turnCounter}回合`)
  game.dispatch(ActionMap.logs(`${event.data.playerIndex}号位置${player.name}回合开始`))
  game.dispatch(ActionMap.currentPlayerIndex(event.data.playerIndex))

  game.eventHub.push([
    new AbstractEvent({
      type: EventType.PhaseEvent,
      data: {
        name: '回合变更',
        turnCounter: game.turnCounter,
        roundCounter: game.roundCounter,
      },
    }),
    new AbstractEvent({
      type: EventType.PhaseEvent,
      data: {
        name: '判定阶段',
        playerIndex: event.data.playerIndex,
      }
    }),
  ])

  resolve()
})

const 判定阶段 = new Listener(function(event){
  return event.type === EventType.PhaseEvent && event.data.name === '判定阶段'
}, function(event, game, resolve){
  const player = game.players[event.data.playerIndex]

  // game.dispatch(ActionMap.logs(`${event.data.playerIndex}号位置${player.name}进入判定阶段`))

  if (player.judges.length) {
    // 处理判定牌
    // 是否打出 无懈可击
    // 是否该判定
  } else {
    resolve(new AbstractEvent({
      type: EventType.PhaseEvent,
      data: {
        name: '摸牌阶段',
        playerIndex: event.data.playerIndex,
      }
    }))
  }
})

const 摸牌阶段 = new Listener(function(event){
  return event.type === EventType.PhaseEvent && event.data.name === '摸牌阶段'
}, function(event, game, resolve){
  const { gameDealer } = game
  const player = game.players[event.data.playerIndex]
  const cards = gameDealer.drawCards(player.drawCount)
  player.addCards(cards)
  game.dispatch(ActionMap.players(game.players.map(p => p.toViewModel())))

  resolve(new AbstractEvent({
    type: EventType.PhaseEvent,
    data: {
      name: '出牌阶段',
      playerIndex: event.data.playerIndex,
    }
  }))
})

const 出牌阶段 = new Listener(function(event){
  return event.type === EventType.PhaseEvent && event.data.name === '出牌阶段'
}, function(event, game, resolve){
  const player = game.players[event.data.playerIndex]
  // game.dispatch(ActionMap.logs(`${event.data.playerIndex}号位置${player.name}进入出牌阶段`))
  // todo  点击出牌结束后完结
  game.chooseCard().then(() => {
    console.info('出牌')
    console.info(arguments)
  }, () => {
    resolve(new AbstractEvent({
      type: EventType.PhaseEvent,
      data: {
        playerIndex: event.data.playerIndex,
        name: '弃牌阶段',
        handLimit: player.hp,
      },
    }))
  })
  
})

const 弃牌阶段 = new Listener(function(event){
  return event.type === EventType.PhaseEvent && event.data.name === '弃牌阶段'
}, function(event, game, resolve){
  const player = game.players[event.data.playerIndex]
  const handLimit = event.data.handLimit
  // game.dispatch(ActionMap.logs(`${event.data.playerIndex}号位置${player.name}进入弃牌阶段`))
  if (player.cards.length > handLimit) {
    // todo 目前默认丢弃超过手牌上限的牌，之后要改下
    const discards = player.cards.slice(handLimit)

    // console.info(`${event.data.playerIndex}号位玩家共有${player.cards.length}张手牌，手牌上限为${handLimit}，丢弃${discards.length}张手牌`)

    player.cards.splice(handLimit, discards.length)
    discards.forEach(d => d.inUse = false)
    game.dispatch(ActionMap.players(game.players.map(p => p.toViewModel())))
    new AbstractEvent({
      type: EventType.CardEvent,
      data: {
        name: '弃牌',
        cards: discards,
        playerIndex: event.data.playerIndex,
      }
    }).execute(game).then(() => {
      resolve(new AbstractEvent({
        type: EventType.PhaseEvent,
        data: {
          playerIndex: event.data.playerIndex,
          name: '回合结束',
        },
      }))
    }, () => {
      resolve(new AbstractEvent({
        type: EventType.PhaseEvent,
        data: {
          playerIndex: event.data.playerIndex,
          name: '回合结束',
        },
      }))
    })
  } else {
    resolve(new AbstractEvent({
      type: EventType.PhaseEvent,
      data: {
        playerIndex: event.data.playerIndex,
        name: '回合结束',
      },
    }))
  }
  // todo  点击出牌结束后完结
  
})

const 回合结束 = new Listener(function(event){
  return (event.type === EventType.PhaseEvent) && (event.data.name === '回合结束')
}, function(event, game, resolve){
  // console.info(`回合结束`)

  const player = game.players[event.data.playerIndex]
  player.drawCount = null
  game.dispatch(ActionMap.logs(`${event.data.playerIndex}号位置${player.name}回合结束`))

  let idx = (event.data.playerIndex + 1) % game.players.length
  // console.info(`${player.name}[${idx}号位置]回合结束，准备查询下一个存活的玩家`)

  while(true) {
    if (game.players[idx].isDead === true) {
      // console.info(`${idx}号位置玩家已经死亡，准备查看下一位`)
      idx = (idx + 1) % game.players.length
    } else {
      // console.info(`${idx}号位置玩家存活`)
      break
    }
  }
  resolve(new AbstractEvent({
    type: EventType.PhaseEvent,
    data: {
      playerIndex: idx,
      name: '回合开始',
    },
  }))
})

const 回合变更 = new Listener(function(event){
  return (event.type === EventType.PhaseEvent) && (event.data.name === '回合变更')
}, function(event, game, resolve){
  resolve()
})

/**
 * playerIndex
 * cardIndex
 * target
 */
const 打出卡牌 = new Listener(function(event){
  return (event.type === EventType.CardEvent) && (event.data.name === '使用卡牌')
}, function(event, game, resolve){
  const player = game.players[event.data.playerIndex]
  event.data.card = event.data.card || player.cards[event.data.cardIndex]
  player.cards.splice(event.data.cardIndex, 1)
  event.data.card.inUse = false
  game.dispatch(ActionMap.players(game.players.map(p => p.toViewModel() )))
  resolve()
}, 2)

const 使用卡牌 = new Listener(function(event){
  return (event.type === EventType.CardEvent) && (event.data.name === '使用卡牌')
}, function(event, game, resolve, reject){
    if (event.disable === true) {
      return resolve()
    }
    const { target, player, card, playerIndex } = event.data
    switch(card.name) {
      case '桃':
        桃({ player, game, card })
        resolve()
        break
      case '杀':
        杀({ player, card, target, game, event, reject }).then(resolve, reject)
        break
      case '无中生有':
        player.addCards(game.gameDealer.drawCards(2))
        game.dispatch(ActionMap.players(game.players.map(p => p.toViewModel() )))
        resolve()
        break
      case '决斗':
        console.info(`${playerIndex}号位置${player.name}向${target}号位置${game.players[target].name}发起决斗`)
        game.dispatch(ActionMap.players(game.players.map(p => p.toViewModel() )))
        决斗({ player, game, target, playerIndex: event.data.playerIndex, card }).then((evt) => {
          resolve(evt)
        }, (evt) => {
          resolve(evt)
        })
        break
      case '无懈可击':
        console.info('触发无懈可击')
        event.data.targetEvent.disable = !event.data.targetEvent.disable
        game.dispatch(ActionMap.players(game.players.map(p => p.toViewModel() )))
        resolve()
        break
      default:
        resolve()
        break
    }
})

const 轮询无懈 = new Listener(function(event){
  return event.type === EventType.CardEvent && (event.data.name === '使用卡牌') && isMagic(event.data.card.name)
}, function(event, game, resolve){
  const otherIdxs = []
  for(let i = (event.data.playerIndex+1) % game.players.length; i !== event.data.playerIndex; i = (i + 1) % game.players.length) {
    otherIdxs.push(i)
  }
  const handler = () => {
    if (otherIdxs.length) {
      const idx = otherIdxs.shift()
      const p = game.players[idx]

      // todo 还有可能有技能当成无懈可击，暂时先只判断手牌
      if( p.cards.some(c => c.name === '无懈可击') ){
        game.dispatch(ActionMap.currentSelect(idx))
        return game.requireCards({
          cards: ['无懈可击'],
          playerIndex: idx,
        }).then( ({cardIndex}) => {
          game.dispatch(ActionMap.logs(`${idx}号位置${game.players[idx].name}打出无懈可击`))
          new AbstractEvent({
            type: EventType.CardEvent,
            data: {
              name: '使用卡牌',
              playerIndex: idx,
              cardIndex,
              targetEvent: event,
              card: game.players[idx].cards[cardIndex],
            }
          }).execute(game).then(() => {
            resolve()
          }, () => {
            resolve()
          })
        }, () => {
          return handler()
        })
      } else {
        return handler()
      }
    } else {
      resolve()
    }
  }

  handler()
}, 1)

/**
 * 被动打出
 */
const 出牌 = new Listener(function(event){
  return (event.type === EventType.PlayerEvent) && (event.data.name === '出牌')
}, function(event, game, resolve, reject){
  return game.requireCards({
    target: event.data.target,
    cards: event.data.cards,
    playerIndex: event.data.playerIndex,
  }).then(resolve, () => reject(arguments))
})

const 桃 = ({ player, game, card }) => {
  if (player.hp < player.maxHP) {
    player.hp += 1
    game.dispatch(ActionMap.players(game.players.map(p => p.toViewModel())))
  }
  game.eventHub.push(  new AbstractEvent({
    type: EventType.PlayerEvent,
    data: {
      name: '恢复体力',
      playerIndex: event.data.playerIndex,
      card,
    }
  }) )
}

const 杀 = ({ player, card, target, game, event }) => {
  const tplayer = game.players[target]
  game.dispatch(ActionMap.logs(`${event.data.playerIndex}号位置${player.name}向${target}位置${tplayer.name}出杀`))
  game.dispatch(ActionMap.players(game.players.map(p => p.toViewModel())))
  return new AbstractEvent({
    type: EventType.PlayerEvent,
    data: {
      playerIndex: event.data.playerIndex,
      name: '出牌',
      target,
      cards: ['闪']
    }
  }).execute(game).then(() => {
    console.log('出闪')
  }, () =>{
    return new AbstractEvent({
      type: EventType.PlayerEvent,
      data: {
        name: '受到伤害',
        source: player,
        sourceIndex: event.data.playerIndex,
        target: tplayer,
        targetIndex: target,
        card,
        event,
        damageValue: 1,
      }
    }).execute(game)
  })
}

const 决斗 = ({ player, playerIndex, target, game, card }) => {
  if (player.hasSkill('无双')) {

  } else {
    return game.requireCards({
      playerIndex: target,
      cards: ['杀']
    }).then(({ cardIndex }) => {
      player.cards.splice(cardIndex, 1)
      game.dispatch(ActionMap.players(game.players.map(p => p.toViewModel())))
      return 决斗({
        target: playerIndex,
        playerIndex: target,
        player: game.players[target],
        game,
        card
      })
    }, () => {
      console.log(`${player.name}决斗成功`)
      return new AbstractEvent({
        type: EventType.PlayerEvent,
        data: {
          name: '受到伤害',
          damageValue: 1,
          targetIndex: target,
          target: game.players[target],
          card,
          source: player,
          playerIndex,
        }
      })
    })
  }

}

const 受到伤害 = new Listener(function(event){
  return event.type === EventType.PlayerEvent && event.data.name === '受到伤害'
}, function(event, game){
    const { target, targetIndex, damageValue } = event.data
    target.hp -= damageValue
    game.dispatch(ActionMap.logs(`${targetIndex}号位置${target.name}受到${damageValue}点伤害`))
    game.dispatch(ActionMap.players(game.players.map(p => p.toViewModel())))
})

const 濒死检查 = new Listener(function(event){
  return event.type === EventType.PlayerEvent && event.data.name === '受到伤害'
}, function(event, game){
    const { target, source } = event.data
    if (target.hp <=0) {
      console.info('濒死求救')
    }
}, -1)


const 洛神 = new Listener(function(event, game){
  const player = game.players[event.data.playerIndex]
  return event.type === EventType.PhaseEvent && event.data.name === '回合开始' && player.hasSkill('洛神')
}, function(event, game, resolve){
  const player = game.players[event.data.playerIndex]
  // console.info(`${player.name}触发技能洛神`)
  game.dispatch(ActionMap.logs(`${event.data.playerIndex}号位置${player.name}发动洛神`))

  const { gameDealer } = game
  let card = null
  while(true) {
    // todo 询问是否要触发洛神
    card = gameDealer.nextCard()
    console.info(`翻牌 - ${JSON.stringify(card)}`)
    if (card.suit === CardSuit.Spade || card.suit === CardSuit.Club) {
      player.addCard(card)
      // console.info('洛神成功')
      game.dispatch(ActionMap.logs(`洛神判定成功`))
    } else {
      // console.info('洛神失败')
      game.dispatch(ActionMap.logs(`洛神失败`))
      break
    }
  }
  new AbstractEvent({
    type: EventType.CardEvent,
    data: {
      name: '进入弃牌堆',
      card: card,
      playerIndex: event.data.playerIndex,
    }
  }).execute(game).then(() => resolve())
}, -1)

const 闭月 = new Listener(function(event, game){
  const { type, data } = event
  const player = game.players[event.data.playerIndex]
  return type === EventType.PhaseEvent && data.name === '回合结束' && player.hero.hasSkill('闭月')
}, function(event, game, resolve){
  const card = game.gameDealer.nextCard()
  const player = game.players[event.data.playerIndex]
  player.addCard(card)
  // console.log(`${event.data.playerIndex}号位玩家触发了闭月技能，当前手牌数为${player.cards.length}`)
  game.dispatch(ActionMap.logs(`${event.data.playerIndex}号位${player.name}触发了技能闭月`))

  resolve()
}, -1)

/**
 * 回合开始时，向持有裸衣技能的玩家询问是否需要触发裸衣
 */
const 裸衣 = new Listener(function(event, game){
  const player = game.players[event.data.playerIndex]
  return event.type === EventType.PhaseEvent && event.data.name === '回合开始' && player.hero.hasSkill('裸衣')
}, function(event, game, resolve){
  // 询问是否触发裸衣
  game.confirm({
    title: '发动技能',
    content: '是否发动裸衣?',
  }).then(() => {
    const player = game.players[event.data.playerIndex]
    player.drawCount = player.drawCount - 1
    player.status.push('裸衣')
    game.dispatch(ActionMap.logs(`${event.data.playerIndex}号位置${player.name}发动裸衣`))
    resolve()
  }, () => {
    console.log('不发动裸衣')
    resolve()
  })
}, -1)

/**
 * 裸衣状态下造成的伤害+1
 */
const 裸衣效果 = new Listener(function(event, game){
  const { source = null, card = null } = event.data
  return event.type === EventType.PlayerEvent && event.data.name === '受到伤害' 
          && source && source.hasStatus('裸衣') 
          && card && (card.name === '决斗' || /^.?杀$/.test(card.name))
}, function(event, game, resolve){
  event.data.damageValue += 1
  console.info('裸衣伤害加成')
  resolve()
}, 1)

/**
 * 回合结束时，移除裸衣状态
 */
const 裸衣失效 = new Listener(function(event, game){
  const player = game.players[event.data.playerIndex]
  return event.type === EventType.PhaseEvent && event.data.name === '回合结束' && player.hasStatus('裸衣') 
}, function(event, game, resolve){
  const player = game.players[event.data.playerIndex]
  player.removeStatus('裸衣')
  console.info(`${event.data.playerIndex}号位置${player.name}裸衣状态结束`)
  resolve()
}, -1) 

const 克己 = new Listener(function(event, game){
  const player = game.players[event.data.playerIndex]
  return event.type === EventType.PhaseEvent && event.data.name === '弃牌阶段' && player.hero.hasSkill('克己')
}, function(event, game, resolve){
  const player = game.players[event.data.playerIndex]
  if (player.isShaUsed) {
    console.info(`${player.name}使用过杀，不满足克己触发条件`)
  } else {
    event.data.handLimit = 1000
  }
  resolve()
}, 1)

const 咆哮 = new Listener(function(event, game){
  const player = game.players[event.data.playerIndex]
  return event.type === EventType.PhaseEvent && event.data.name === '回合开始' && player.hero.hasSkill('咆哮')
}, function(event, game, resolve){
  const player = game.players[event.data.playerIndex]
  console.info(`${player.name}触发咆哮，本回合不限制出杀次数`)
  player.shaRemain = 1000
  resolve()
}, -1)

export {
  游戏开始,
  分配位置和角色,
  主公选将,
  选择武将,
  初始手牌,
  回合开始,
  判定阶段,
  摸牌阶段,
  出牌阶段,
  弃牌阶段,
  回合结束,
  回合变更,
  打出卡牌,
  使用卡牌,
  出牌,
  受到伤害,
  濒死检查,
  轮询无懈,
  
  闭月,
  洛神,
  裸衣,
  裸衣效果,
  裸衣失效,

  克己,
  咆哮
}

import Listener from './listener'
import AbstractEvent, { EventType } from '../event/abstractevent'
import knuthShuffle from 'knuth-shuffle'
import { CardSuit } from '../card/gamecard';
import { promiseQueue } from '../util';

/**
 * 标准游戏开局
 */
const standardBegin = new Listener(function(event){
  return event.type === EventType.PhaseEvent && event.data.name === '游戏开始'
}, function(event, game, resolve){
  console.log('标准游戏开局')
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
const assignPosition = new Listener(function(event) {
  return event.type === EventType.PhaseEvent && event.data.name === '分配位置和角色'
}, function(event, game, resolve,) {
  console.info('分配位置和角色')
  knuthShuffle.knuthShuffle(game.players)
  const { roleDealer, players } = game
  roleDealer.cards.forEach(c => c.inUse = false)
  game.assignRole(players[0], roleDealer.cards[0])
  roleDealer.shuffle()
  for(let i = 1; i < players.length; i++) {
    game.assignRole(players[i], roleDealer.nextCard())
  }
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
const lordPick = new Listener(function(event, game){
  return event.type === EventType.PhaseEvent && event.data.name === '主公选将'
}, function(event, game, resolve) {
   console.info('主公选择武将')
   game.heroDealer.shuffle()
   const heros = game.heroDealer.cards
   const lords = heros.filter(h => h.isLord)
   const general = heros.filter(h => !h.isLord).slice(0, 2)
   const candicates = lords.concat(general)
   knuthShuffle.knuthShuffle(candicates)
   // todo 默认随机pick一个，要改成ui上选
  game.assignHero(event.data.lord, candicates[0])

  if (game.players.length >= 5) {
    event.data.lord.maxHP += 1
    event.data.lord.hp += 1
    console.info(`在场玩家不少于5名，主公体力上限增加1点，变为${event.data.lord.hp}`)
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
const heroPick = new Listener(function(event, game){
  return event.type === EventType.PhaseEvent && event.data.name === '选择武将'
}, function(event, game, resolve){
  const { player, candicates } = event.data
  game.assignHero(player, candicates[0])
  resolve()
})

/**
 * 游戏开始，每个玩家摸4张起始手牌
 */
const 初始手牌 = new Listener(function(event, game){
  return event.type === EventType.PhaseEvent && event.data.name === '初始手牌'
}, function(event, game, resolve){
  const { gameDealer } = game
  game.players.forEach(p => {
    const cards = gameDealer.drawCards(4)
    p.addCards(cards)
    console.info(`玩家${p.name}摸了4张手牌`)
  })
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
  if (event.data.playerIndex === 0) {
    game.roundCounter++
    console.log(`开始新轮次${game.roundCounter}`)
  }
  game.turnCounter++
  console.log(`第${game.roundCounter}轮/第${game.turnCounter}回合`)
  new AbstractEvent({
    type: EventType.PhaseEvent,
    data: {
      name: '回合变更',
      turnCounter: game.turnCounter,
      roundCounter: game.roundCounter,
    },
  }).execute(game).then(() => {
    resolve(new AbstractEvent({
      type: EventType.PhaseEvent,
      data: {
        name: '判定阶段',
        playerIndex: event.data.playerIndex,
      }
    }))
  })
  
})

const 判定阶段 = new Listener(function(event){
  return event.type === EventType.PhaseEvent && event.data.name === '判定阶段'
}, function(event, game, resolve){
  const player = game.players[event.data.playerIndex]
  if (player.judges.length) {
    // 处理判定牌
    // 是否打出 无懈可击
    // 是否该判定
  } else {
    resolve(new AbstractEvent({
      type: EventType.PhaseEvent,
      data: {
        name: '摸牌阶段',
        drawCount: 2,
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
  const cards = gameDealer.drawCards(event.data.drawCount)
  player.addCards(cards)
  console.info(`玩家${player.name}摸${event.data.drawCount}张牌`)
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
  console.log('Wait for Player use Card')
  // todo  点击出牌结束后完结
  resolve(new AbstractEvent({
    type: EventType.PhaseEvent,
    data: {
      playerIndex: event.data.playerIndex,
      name: '弃牌阶段',
      handLimit: player.hp,
    },
  }))
})

const 弃牌阶段 = new Listener(function(event){
  return event.type === EventType.PhaseEvent && event.data.name === '弃牌阶段'
}, function(event, game, resolve){
  const player = game.players[event.data.playerIndex]
  const handLimit = event.data.handLimit
  if (player.cards.length > handLimit) {
    // todo 目前默认丢弃超过手牌上限的牌，之后要改下
    const discards = player.cards.slice(handLimit)

    console.info(`${event.data.playerIndex}号位玩家共有${player.cards.length}张手牌，手牌上限为${handLimit}，丢弃${discards.length}张手牌`)

    player.cards.splice(handLimit, discards.length)
    discards.forEach(d => d.inUse = false)
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
  console.info(`${event.data.playerIndex}号位置玩家回合结束，${idx}号位置玩家准备回合开始`)
  resolve(new AbstractEvent({
    type: EventType.PhaseEvent,
    data: {
      playerIndex: idx,
      name: '回合开始',
    },
  }))
})


const 洛神 = new Listener(function(event, game){
  const player = game.players[event.data.playerIndex]
  return event.type === EventType.PhaseEvent && event.data.name === '回合开始' && player.hasSkill('洛神')
}, function(event, game, resolve){
  const player = game.players[event.data.playerIndex]
  console.info(`${player.name}触发技能洛神`)
  const { gameDealer } = game
  let card = null
  while(true) {
    // todo 询问是否要触发洛神
    card = gameDealer.nextCard()
    console.info(`翻牌 - ${JSON.stringify(card)}`)
    if (card.suit === CardSuit.Spade || card.suit === CardSuit.Club) {
      player.addCard(card)
      console.info('洛神成功')
    } else {
      console.info('洛神失败')
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
  console.log(`${event.data.playerIndex}号位玩家触发了闭月技能，当前手牌数为${player.cards.length}`)
  resolve()
}, -1)

const 裸衣 = new Listener(function(event, game){
  const player = game.players[event.data.playerIndex]
  return event.type === EventType.PhaseEvent && event.data.name === '回合开始' && player.hero.hasSkill('裸衣')
}, function(event, game, resolve){
  // 询问是否触发裸衣
  const player = game.players[event.data.playerIndex]
  event.data.drawCount = event.data.drawCount - 1
  console.log(`玩家${player.name}触发裸衣, 摸牌阶段摸牌数量为${event.data.drawCount}`)
  resolve()
})

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
  standardBegin,
  assignPosition,
  lordPick,
  heroPick,
  初始手牌,
  回合开始,
  判定阶段,
  摸牌阶段,
  出牌阶段,
  弃牌阶段,
  回合结束,

  闭月,
  洛神,
  裸衣,
  克己,
  咆哮
}

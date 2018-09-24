import Game from '../../../src/core/game'
import Listener from '../../../src/core/listener/listener'
import { EventType } from '../../../src/core/event/abstractevent'

// jest.setTimeout(20000)

describe('测试标准身份场', () => {
  const game = Game.standard(8)


  test('测试游戏进展', (done) => {
    const listeners = [
      new Listener(function(event){
        return (event.type === EventType.PhaseEvent) && (event.data.name === '初始手牌')
      }, function(event, game, resolve){
        const nhero = '貂蝉'
        game.assignHero(game.players[1], game.heroDealer.cards.find(c => c.name === nhero))
        console.info(`成功将2号位置玩家替换成${nhero}`)
        resolve()
      }, -1),
      new Listener(function(event){
        return (event.type === EventType.PhaseEvent) && (event.data.name === '回合变更')
      }, function(event, game, resolve){
        
        if (event.data.turnCounter > 100) {
          throw new Error('故意抛出异常')
        } else {
          resolve()
        }
        
      }, -1)
    ]

    listeners.forEach(l => game.listeners.push(l))

    game.run().then(() => {
      console.info('执行完毕')
      done()
    }, (err) => {
      console.error(err)
    })
  })
})
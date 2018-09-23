import Card, { CardType, RoleCardType } from '../card/card'
import GameCard, { CardSuit } from '../card/gamecard'
import HeroCard, { HeroCamp, HeroGender } from '../card/herocard';
import Skill from '../skill';

class Deck {
  constructor(cards = [], name = Math.random()) {
    this.name = name
    this.cards = cards
  }

  addCard(card) {
    this.cards.push(card)
  }

  addCards(cards = []) {
    cards.forEach(c => this.addCard(c))
  }

  setName(name) {
    this.name = name
  }

  getCards() {
    return this.cards || []
  }

  sort(fn) {
    this.cards.sort(fn)
  }

  /**
   * 创建身份场牌组
   * @param {*} playerCount 
   */
  static createRoleDeck(playerCount) {
    const deck = new Deck([
      new Card(CardType.RoleCard, RoleCardType.Lord),
      new Card(CardType.RoleCard, RoleCardType.Rebel),
    ])
    switch (playerCount) {
      case 2:
        return deck
      case 8:
        deck.addCard(new Card(CardType.RoleCard, RoleCardType.Rebel))
        deck.addCard(new Card(CardType.RoleCard, RoleCardType.Rebel))
        deck.addCard(new Card(CardType.RoleCard, RoleCardType.Rebel))
        deck.addCard(new Card(CardType.RoleCard, RoleCardType.Loyal))
        deck.addCard(new Card(CardType.RoleCard, RoleCardType.Loyal))
        deck.addCard(new Card(CardType.RoleCard, RoleCardType.Careerist))
        return deck
      default:  // todo 增加更多情况
        return deck
    }
  }

  /**
   * 生成指定的游戏卡牌包（标/风/火/山/林）
   * @param {*} deckName 
   */
  static createGameDeck(deckName) {
    switch(deckName) {
      case '标':
        return this.standardGameDeck()
      default:
        throw new Error(`暂不支持${deckName}包`)
    }
  }

  /**
   * 生成标准包游戏卡牌
   * https://wenku.baidu.com/view/39fdd4a9d1f34693daef3e13.html
   */
  static standardGameDeck() {
    const deck = new Deck([], '标准包')

    deck.addCard(new GameCard({
      point: 1,
      suit: CardSuit.Spade,
      name: '闪电'
    }))

    /**
     * 决斗：3张
     */
    deck.addCards(GameCard.createCards({
      name: '决斗',
      suits: {
        Spade: [ 1 ],
        Club: [ 1 ],
        Diamond: [ 1 ],
      }
    }))

    /**
     * 诸葛连弩
     */
    deck.addCards(GameCard.createCards({
      name: '诸葛连弩',
      suits: {
        Club: [ 1 ],
        Diamond: [ 1 ],
      }
    }))

    /**
     * 八卦阵：2张
     */
    deck.addCards(GameCard.createCards({
      name: '八卦阵',
      suits: {
        Club: [ 2 ],
        Spade: [ 2 ],
      }
    }))

    deck.addCard(new GameCard({
      point: 2,
      suit: CardSuit.Spade,
      name: '雌雄双股剑'
    }))

    /**
     * 过河拆桥: 6张
     */
    deck.addCards(GameCard.createCards({
      name: '过河拆桥',
      suits: {
        Club: [ 3, 4 ],
        Spade: [ 3, 4, 12 ],
        Heart: [ 12 ],
      }
    }))


    /**
     * 顺手牵羊：5张
     */
    deck.addCards(GameCard.createCards({
      name: '顺手牵羊',
      suits: {
        Diamond: [ 3, 4 ],
        Spade: [ 3, 4, 11 ],
      }
    }))

    deck.addCard(new GameCard({
      point: 5,
      suit: CardSuit.Spade,
      name: '青龙偃月刀'
    }))

    deck.addCard(new GameCard({
      point: 5,
      suit: CardSuit.Spade,
      name: '绝影'
    }))

    deck.addCard(new GameCard({
      point: 5,
      suit: CardSuit.Club,
      name: '的卢'
    }))

    /**
     * 乐不思蜀：3张
     */
    deck.addCards(GameCard.createCards({
      name: '乐不思蜀',
      suits: {
        Spade: [ 6 ],
        Heart: [ 6 ],
        Club: [ 6 ]
      }
    }))

    deck.addCard(new GameCard({
      point: 6,
      suit: CardSuit.Spade,
      name: '青钢剑'
    }))

    /**
     * 南蛮入侵：3张
     */
    deck.addCards(GameCard.createCards({
      name: '南蛮入侵',
      suits: {
        Spade: [ 7, 13 ],
        Club: [ 7 ]
      }
    }))

    deck.addCard(new GameCard({
      point: 13,
      suit: CardSuit.Spade,
      name: '大宛',
    }))

    /**
     * 杀： 30张
     */
    deck.addCards(GameCard.createCards({
      name: '杀',
      suits: {
        Diamond: [ 6, 7, 8, 9, 10, 13 ],
        Spade: [ 7, 8, 8, 9, 9, 10, 10 ],
        Heart: [ 10, 10, 11 ],
        Club: [ 2, 3, 4, 5, 6, 7, 8, 8, 9, 9, 10, 10, 11, 11]
      }
    }))


    /**
     * 闪：15张
     */
    deck.addCards(GameCard.createCards({
      name: '闪',
      suits: {
        Diamond: [ 2, 2, 3, 4 ,5 ,6 ,7, 8, 9, 10, 11, 11 ],
        Heart: [ 2, 2, 13 ],
      }
    }))

    /**
     * 桃：8张
     */
    deck.addCards(GameCard.createCards({
      name: '桃',
      suits: {
        Diamond: [ 12 ],
        Heart: [ 3, 4, 6, 7, 8, 9, 12 ],
      }
    }))

    
    /**
     * 无懈可击：3张 + 1
     */
    deck.addCards(GameCard.createCards({
      name: '无懈可击',
      suits: {
        Spade: [ 11 ],
        Club: [ 12, 13 ],
        // Diamond: [ 12 ],
      }
    }))

    deck.addCard(new GameCard({
      point: 12,
      suit: CardSuit.Spade,
      name: '丈八蛇矛'
    }))

    /**
     * 借刀杀人：2张
     */
    deck.addCards(GameCard.createCards({
      name: '借刀杀人',
      suits: {
        Club: [ 12, 13 ],
      }
    }))

    

    deck.addCard(new GameCard({
      point: 1,
      suit: CardSuit.Heart,
      name: '万箭齐发'
    }))

    deck.addCard(new GameCard({
      point: 1,
      suit: CardSuit.Heart,
      name: '桃园结义'
    }))

    /**
     * 五谷丰登：2张
     */
    deck.addCards(GameCard.createCards({
      name: '五谷丰登',
      suits: {
        Heart: [ 3, 4 ],
      }
    }))

    deck.addCard(new GameCard({
      point: 5,
      suit: CardSuit.Heart,
      name: '赤兔'
    }))

    deck.addCard(new GameCard({
      point: 5,
      suit: CardSuit.Heart,
      name: '麒麟弓'
    }))

    deck.addCard(new GameCard({
      point: 5,
      suit: CardSuit.Diamond,
      name: '贯石斧'
    }))



    /**
     * 无中生有：4张
     */
    deck.addCards(GameCard.createCards({
      name: '无中生有',
      suits: {
        Heart: [ 7, 8, 9, 11 ],
      }
    }))

    deck.addCard(new GameCard({
      point: 12,
      suit: CardSuit.Diamond,
      name: '方天画戟'
    }))    

    deck.addCard(new GameCard({
      point: 13,
      suit: CardSuit.Heart,
      name: '爪黄飞电'
    }))
    
    deck.addCard(new GameCard({
      point: 13,
      suit: CardSuit.Diamond,
      name: '紫骍'
    }))

    return deck
  }

  /**
   * 生成标准包英雄
   */
  static standardHeroDeck() {
    const deck = new Deck([], '标准包英雄')

    deck.addCards([

      new HeroCard({
        name: '刘备',
        camp: HeroCamp.Shu,
        isLord: true,
        hp: 4,
        skills: [
          Skill.get('仁德'),
          Skill.get('激将'),
        ]
      }),
      new HeroCard({
        name: '关羽',
        camp: HeroCamp.Shu,
        hp: 4,
        skills: [
          Skill.get('武圣'),
        ]
      }),
      new HeroCard({
        name: '张飞',
        camp: HeroCamp.Shu,
        hp: 4,
        skills: [
          Skill.get('咆哮'),
        ]
      }),
      new HeroCard({
        name: '赵云',
        camp: HeroCamp.Shu,
        hp: 4,
        skills: [
          Skill.get('龙胆'),
        ]
      }),
      new HeroCard({
        name: '马超',
        camp: HeroCamp.Shu,
        hp: 4,
        skills: [
          Skill.get('马术'),
          Skill.get('铁骑'),
        ]
      }),
      new HeroCard({
        name: '黄月英',
        camp: HeroCamp.Shu,
        hp: 3,
        gender: HeroGender.Female,
        skills: [
          Skill.get('集智'),
          Skill.get('奇才'),
        ]
      }),
      new HeroCard({
        name: '诸葛亮',
        camp: HeroCamp.Shu,
        hp: 3,
        skills: [
          Skill.get('观星'),
          Skill.get('空城')
        ]
      }),

      new HeroCard({
        name: '曹操',
        camp: HeroCamp.Wei,
        isLord: true,
        hp: 4,
        skills: [
          Skill.get('奸雄'),
          Skill.get('护驾')
        ]
      }),
      new HeroCard({
        name: '司马懿',
        camp: HeroCamp.Wei,
        hp: 3,
        skills: [
          Skill.get('鬼才'),
          Skill.get('反馈')
        ]
      }),
      new HeroCard({
        name: '张辽',
        camp: HeroCamp.Wei,
        hp: 4,
        skills: [
          Skill.get('突袭'),
        ]
      }),
      new HeroCard({
        name: '许褚',
        camp: HeroCamp.Wei,
        hp: 4,
        skills: [
          Skill.get('裸衣'),
        ]
      }),
      new HeroCard({
        name: '郭嘉',
        camp: HeroCamp.Wei,
        hp: 3,
        skills: [
          Skill.get('天妒'),
          Skill.get('遗计'),
        ]
      }),
      new HeroCard({
        name: '甄宓',
        camp: HeroCamp.Wei,
        hp: 3,
        gender: HeroGender.Female,
        skills: [
          Skill.get('洛神'),
          Skill.get('倾城'),
        ]
      }),
      new HeroCard({
        name: '夏侯惇',
        camp: HeroCamp.Wei,
        hp: 4,
        skills: [
          Skill.get('刚烈'),
        ]
      }),

      new HeroCard({
        name: '孙权',
        camp: HeroCamp.Wu,
        isLord: true,
        hp: 4,
        skills: [
          Skill.get('制衡'),
          Skill.get('救援')
        ]
      }),

      new HeroCard({
        name: '黄盖',
        camp: HeroCamp.Wu,
        hp: 4,
        skills: [
          Skill.get('苦肉'),
        ]
      }),
      new HeroCard({
        name: '吕蒙',
        camp: HeroCamp.Wu,
        hp: 4,
        skills: [
          Skill.get('克己'),
        ]
      }),
      new HeroCard({
        name: '大乔',
        camp: HeroCamp.Wu,
        hp: 3,
        gender: HeroGender.Female,
        skills: [
          Skill.get('国色'),
          Skill.get('流离')
        ]
      }),
      new HeroCard({
        name: '陆逊',
        camp: HeroCamp.Wu,
        hp: 3,
        skills: [
          Skill.get('谦逊'),
          Skill.get('连营')
        ]
      }),
      new HeroCard({
        name: '孙尚香',
        camp: HeroCamp.Wu,
        hp: 3,
        gender: HeroGender.Female,
        skills: [
          Skill.get('结姻'),
          Skill.get('枭姬'),
        ]
      }),

      new HeroCard({
        name: '甘宁',
        camp: HeroCamp.Wu,
        hp: 4,
        skills: [
          Skill.get('奇袭'),
        ]
      }),
      new HeroCard({
        name: '周瑜',
        camp: HeroCamp.Wu,
        hp: 3,
        skills: [
          Skill.get('英姿'),
          Skill.get('反间')
        ]
      }),

      new HeroCard({
        name: '吕布',
        camp: HeroCamp.Qun,
        hp: 4,
        skills: [
          Skill.get('无双')
        ]
      }),
      new HeroCard({
        name: '貂蝉',
        camp: HeroCamp.Qun,
        hp: 3,
        gender: HeroGender.Female,
        skills: [
          Skill.get('离间'),
          Skill.get('闭月'),
        ]
      }),
      new HeroCard({
        name: '华佗',
        camp: HeroCamp.Qun,
        hp: 3,
        skills: [
          Skill.get('青囊'),
          Skill.get('急救'),
        ]
      }),

    ])
    return deck
  }
}

export default Deck
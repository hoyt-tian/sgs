import Card, { CardType } from "./card"

const HeroCamp = {
  Wei: '魏',
  Shu: '蜀',
  Wu: '吴',
  Qun: '群',
  Shen: '神',
  None: ''
}

const HeroGender = {
  Male: '男',
  Female: '女',
  None: ''
}

class HeroCard extends Card {
  constructor({
    name,
    camp,
    hp,
    isLord = false,
    skills = [],
    gender = HeroGender.Male,
  }) {
    super(CardType.HeroCard, name)
    this.camp = camp
    this.gender = gender
    this.skills = skills
    this.hp = hp
    this.isLord = isLord
  }

  hasSkill(name) {
    try{
      return !!this.skills.filter(s => s && s.name === name).length
    }catch(e) {
      console.error(`查询技能${name}时报错`)
      console.log(JSON.stringify(this))
      console.error(e)
    }
  }
}

export default HeroCard
export {
  HeroCamp,
  HeroGender,
}

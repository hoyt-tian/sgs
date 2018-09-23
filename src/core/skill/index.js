import * as Listeners from '../listener'

const skills = {}

class Skill {
  constructor(name, desc, listeners = []) {
    this.name = name
    this.desc = desc
  }

  static get(k) {
    if (skills[k]) return skills[k]
    console.warn(`技能${k}尚未创建`)
    // throw new Error(`技能${k}不存在`)
  }

  static set(skill) {
    skills[skill.name] = skill
  }
}

Skill.set(new Skill('闭月', '回合结束摸一张牌', [
  Listeners.闭月,
]))

Skill.set(new Skill('洛神', '回合结束摸一张牌', [
  Listeners.洛神,
]))

Skill.set(new Skill('裸衣', '回合结束摸一张牌', [
  Listeners.裸衣,
]))


export default Skill
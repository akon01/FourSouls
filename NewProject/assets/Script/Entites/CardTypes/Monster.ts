import MonsterCardHolder from "../MonsterCardHolder";
import MonsterReward from "../../CardEffectComponents/MonsterRewards/MonsterReward";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Monster extends cc.Component {
  @property
  monsterPlace: MonsterCardHolder = null;

  @property
  HP: number = 0;

  @property
  currentHp: number = 0;

  @property
  rollValue: number = 0;

  @property
  DMG: number = 0;

  @property
  baseDamage: number = 0;

  @property
  isAttacked: boolean = false;

  @property
  hasEffect: boolean = false;

  @property(MonsterReward)
  reward: MonsterReward = null;

  getDamaged(damage: number) {
    this.currentHp -= damage;
  }

  calculateDamage() {
    let damage = 0;
    damage += this.baseDamage;
    damage += this.DMG;
    // items that increase damage should increase baseDamage
    return damage;
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {}

  // update (dt) {}
}

import MonsterCardHolder from "../MonsterCardHolder";
import MonsterReward from "../../CardEffectComponents/MonsterRewards/MonsterReward";
import Signal from "../../../Misc/Signal";
import Card from "../GameEntities/Card";
import Server from "../../../ServerClient/ServerClient";
import BattleManager from "../../Managers/BattleManager";
import PassiveManager, { PassiveMeta } from "../../Managers/PassiveManager";

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
  rollBonus: number = 0;

  @property
  DMG: number = 0;

  @property
  baseDamage: number = 0;

  @property
  isAttacked: boolean = false;

  @property
  hasEffect: boolean = false;

  @property
  isNonMonster: boolean = false;

  @property
  souls: number = 0;

  @property(MonsterReward)
  reward: MonsterReward = null;

  /**
   * 
   * @param damage 
   * @param sendToServer
   * @returns true if the monster was killed 
   */
  // @testForPassiveAfter('getDamaged')
  async getDamaged(damage: number, sendToServer: boolean) {
    let passiveMeta = new PassiveMeta('getDamaged', Array.of(damage), null, this.node)
    let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
    passiveMeta.args = afterPassiveMeta.args;
    let wasKilled
    if (afterPassiveMeta.continue) {

      this.currentHp -= damage;
      let cardId = this.node.getComponent(Card)._cardId
      let serverData = {
        signal: Signal.MONSTERGETDAMAGED,
        srvData: { cardId: cardId, damage: damage }
      };
      if (sendToServer) {
        Server.$.send(serverData.signal, serverData.srvData)
      }
      wasKilled = await BattleManager.checkIfMonsterIsDead(this.node, sendToServer);
    }
    passiveMeta.result = wasKilled
    let thisResult = await PassiveManager.testForPassiveAfter(passiveMeta)
    return thisResult;
  }

  async gainHp(hpToGain: number, sendToServer: boolean) {
    this.currentHp += hpToGain;
    let cardId = this.node.getComponent(Card)._cardId
    let serverData = {
      signal: Signal.MONSTERGAINHP,
      srvData: { cardId: cardId, damage: hpToGain }
    };
    if (sendToServer) {
      Server.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }


  async gainDMG(DMGToGain: number, sendToServer: boolean) {
    this.baseDamage += DMGToGain;
    let cardId = this.node.getComponent(Card)._cardId
    let serverData = {
      signal: Signal.MONSTERGAINDMG,
      srvData: { cardId: cardId, DMGToGain: DMGToGain }
    };
    if (sendToServer) {
      Server.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }


  async gainRollBonus(bonusToGain: number, sendToServer: boolean) {
    this.rollBonus += bonusToGain;
    let cardId = this.node.getComponent(Card)._cardId
    let serverData = {
      signal: Signal.MONSTERGAINROLLBONUS,
      srvData: { cardId: cardId, bonusToGain: bonusToGain }
    };
    if (sendToServer) {
      Server.$.send(serverData.signal, serverData.srvData)
    }
    return true;
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

  start() { }

  // update (dt) {}
}

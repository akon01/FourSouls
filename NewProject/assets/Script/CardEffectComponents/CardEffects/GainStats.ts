import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import { STATS, TARGETTYPE } from "../../Constants";
import CardManager from "../../Managers/CardManager";
import Monster from "../../Entites/CardTypes/Monster";
import { ActiveEffectData } from "../../Managers/DataInterpreter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GainStats extends Effect {
  effectName = "GainStats";

  @property()
  gainHp: boolean = false;

  @property
  hpToGain: number = 0;

  @property()
  gainDMG: boolean = false;

  @property
  DMGToGain: number = 0;

  @property()
  gainRollBonus: boolean = false;

  @property({ tooltip: "non-attack bonus for players,roll needed to hit on monster" })
  rollBonusToGain: number = 0;

  @property()
  gainAttackRollBonus: boolean = false;

  @property
  attackRollBonusToGain: number = 0;

  @property()
  gainFirstAttackRollBonus: boolean = false;

  @property
  firstAttackRollBonusToGain: number = 0;

  isReveseable = true

  activatedTarget: cc.Node = null;


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(serverEffectStack: ServerEffect[], data?: ActiveEffectData) {
    let target;
    target = data.getTarget(TARGETTYPE.PLAYER)
    if (target == null) {
      target = data.getTarget(TARGETTYPE.MONSTER)
    } else {
      target = PlayerManager.getPlayerByCard(target)
    }
    //case target is a player
    if (target.getComponent(Player) != null) {
      let player: Player = target.getComponent(Player);

      if (this.gainHp) {
        await player.gainHp(this.hpToGain, true)
      }
      if (this.gainDMG) {
        await player.gainDMG(this.DMGToGain, true)
      }
      if (this.gainRollBonus) {
        await player.gainRollBonus(this.rollBonusToGain, true)
      }
      if (this.gainAttackRollBonus) {
        await player.gainAttackRollBonus(this.attackRollBonusToGain, true)
      }
      if (this.gainFirstAttackRollBonus) {
        await player.gainFirstAttackRollBonus(this.firstAttackRollBonusToGain, true)
      }
    } else {
      //    target = CardManager.getCardById(data.target, true)
      let monster: Monster = target.getComponent(Monster)
      if (this.gainHp) {
        await monster.gainHp(this.hpToGain, true)
      }
      if (this.gainDMG) {
        await monster.gainDMG(this.DMGToGain, true)
      }
      if (this.gainRollBonus) {
        await monster.gainRollBonus(this.rollBonusToGain, true)
      }
      this.activatedTarget = target
    }
    //   let targetPlayer = PlayerManager.getPlayerById(data.target);
    return serverEffectStack
  }

  async reverseEffect() {
    let target = this.activatedTarget;

    //case target is a player
    if (target instanceof Player) {
      let player: Player = target.getComponent(Player);

      if (this.gainHp) {
        await player.gainHp(-this.hpToGain, true)
      }
      if (this.gainDMG) {
        await player.gainDMG(-this.DMGToGain, true)
      }
      if (this.gainRollBonus) {
        await player.gainRollBonus(-this.rollBonusToGain, true)
      }
      if (this.gainAttackRollBonus) {
        await player.gainAttackRollBonus(-this.attackRollBonusToGain, true)
      }
      if (this.gainFirstAttackRollBonus) {
        await player.gainFirstAttackRollBonus(-this.firstAttackRollBonusToGain, true)
      }
    } else {
      //target is a monster
      let monster: Monster = target.getComponent(Monster)

      if (this.gainHp) {

        await monster.gainHp(-this.hpToGain, true)

      }
      if (this.gainDMG) {

        await monster.gainDMG(-this.DMGToGain, true)

      }
      if (this.gainRollBonus) {

        await monster.gainRollBonus(-this.rollBonusToGain, true)

      }
      this.activatedTarget = target
    }

  }
}

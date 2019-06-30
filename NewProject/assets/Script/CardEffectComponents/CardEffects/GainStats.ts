import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "../DataCollector/DataCollector";
import { ServerEffect } from "./../../Entites/ServerCardEffect";
import Effect from "./Effect";
import Player from "../../Entites/GameEntities/Player";
import { STATS } from "../../Constants";
import CardManager from "../../Managers/CardManager";
import Monster from "../../Entites/CardTypes/Monster";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GainStats extends Effect {
  effectName = "GainStats";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

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
  doEffect(serverEffectStack: ServerEffect[], data?: { target: number }) {
    let target;
    target = PlayerManager.getPlayerById(data.target);
    //case target is a player
    if (target != null) {
      let player: Player = target.getComponent(Player);

      if (this.gainHp) {
        player.Hp += this.hpToGain;
      }
      if (this.gainDMG) {
        player.baseDamage += this.DMGToGain;
      }
      if (this.gainRollBonus) {
        player.nonAttackRollBonus += this.rollBonusToGain;
      }
      if (this.gainAttackRollBonus) {
        player.attackRollBonus += this.attackRollBonusToGain;
      }
      if (this.gainFirstAttackRollBonus) {
        player.firstAttackRollBonus += this.firstAttackRollBonusToGain;
      }
    } else {
      target = CardManager.getCardById(data.target, true)
      let monster: Monster = target.getComponent(Monster)

      if (this.gainHp) {

        monster.currentHp += this.hpToGain;

      }
      if (this.gainDMG) {

        monster.baseDamage += this.DMGToGain;

      }
      if (this.gainRollBonus) {

        monster.rollBonus += this.rollBonusToGain;

      }
      this.activatedTarget = target
    }
    //   let targetPlayer = PlayerManager.getPlayerById(data.target);

    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }

  reverseEffect() {
    let target = this.activatedTarget;

    //case target is a player
    if (target instanceof Player) {
      let player: Player = target.getComponent(Player);

      if (this.gainHp) {
        player.Hp -= this.hpToGain;
      }
      if (this.gainDMG) {
        player.baseDamage -= this.DMGToGain;
      }
      if (this.gainRollBonus) {
        player.nonAttackRollBonus -= this.rollBonusToGain;
      }
      if (this.gainAttackRollBonus) {
        player.attackRollBonus -= this.attackRollBonusToGain;
      }
      if (this.gainFirstAttackRollBonus) {
        player.firstAttackRollBonus -= this.firstAttackRollBonusToGain;
      }
    } else {
      //target is a monster
      let monster: Monster = target.getComponent(Monster)

      if (this.gainHp) {

        monster.currentHp -= this.hpToGain;

      }
      if (this.gainDMG) {

        monster.baseDamage -= this.DMGToGain;

      }
      if (this.gainRollBonus) {

        monster.rollBonus -= this.rollBonusToGain;

      }
      this.activatedTarget = target
    }
  }
}

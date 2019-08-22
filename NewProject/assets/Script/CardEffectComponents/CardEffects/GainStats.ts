import { TARGETTYPE } from "../../Constants";
import Monster from "../../Entites/CardTypes/Monster";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import PassiveEffect from "./PassiveEffect";

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
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    let target;
    cc.log(data)
    if (data instanceof ActiveEffectData) {
      target = data.getTarget(TARGETTYPE.PLAYER)
      if (target == null) {
        target = data.getTarget(TARGETTYPE.MONSTER)
      } else {
        target = PlayerManager.getPlayerByCard(target)
      }
    } else {
      target = data.effectCardPlayer
    }

    if (target == null) {
      cc.log(`no target to gain stats`)
    } else {
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
      }
      this.activatedTarget = target
    }

    return stack
  }

  async reverseEffect() {
    let target = this.activatedTarget;

    if (target != null) {

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
}

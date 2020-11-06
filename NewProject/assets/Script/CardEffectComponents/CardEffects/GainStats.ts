import { TARGETTYPE } from "../../Constants";
import Monster from "../../Entites/CardTypes/Monster";
import Player from "../../Entites/GameEntities/Player";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";
import PassiveEffect from "./PassiveEffect";
import Stack from "../../Entites/Stack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GainStats extends Effect {
  effectName = "GainStats";

  @property
  multiTarget: boolean = false;

  @property()
  gainHp: boolean = false;

  @property({
    visible: function (this: GainStats) {
      if (this.gainHp) return true
    }
  })
  hpToGain: number = 0;

  @property({
    visible: function (this: GainStats) {
      if (this.gainHp) return true
    }
  })
  hpTemp: boolean = false;

  @property()
  gainDMG: boolean = false;


  @property({
    visible: function (this: GainStats) {
      if (this.gainDMG) return true
    }
    , type: cc.Integer
  })
  DMGToGain: number = 0;


  @property({
    visible: function (this: GainStats) {
      if (this.gainDMG) return true
    }
  })
  dmgTemp: boolean = false;

  @property()
  gainRollBonus: boolean = false;

  @property({
    tooltip: "non-attack bonus for players,roll needed to hit on monster", visible: function (this: GainStats) {
      if (this.gainRollBonus) return true
    }
    , type: cc.Integer
  })
  rollBonusToGain: number = 0;


  @property({
    visible: function (this: GainStats) {
      if (this.gainRollBonus) return true
    }
  })
  rollBonusTemp: boolean = false;

  @property()
  gainAttackRollBonus: boolean = false;

  @property({visible:function(this:GainStats){
    return this.gainAttackRollBonus
  }})
  isOnlyNextAttack:boolean =false

  @property({
    visible: function (this: GainStats) {
      if (this.gainAttackRollBonus) return true
    }
    , type: cc.Integer
  })
  attackRollBonusToGain: number = 0;

  @property({
    visible: function (this: GainStats) {
      if (this.gainAttackRollBonus) return true
    }
  })
  attackRollBonusTemp: boolean = false;

  @property()
  gainFirstAttackRollBonus: boolean = false;

  @property({
    visible: function (this: GainStats) {
      if (this.gainFirstAttackRollBonus) return true
    }
    , type: cc.Integer
  })
  firstAttackRollBonusToGain: number = 0;

  @property({
    visible: function (this: GainStats) {
      if (this.gainFirstAttackRollBonus) return true
    }
  })
  firstAttackRollBonusToGainTemp: boolean = false;


  isReveseable = true

  activatedTarget: cc.Node = null;


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    let target;
    cc.log(data)
    if (this.multiTarget) {
      let targets
      targets = data.getTargets(TARGETTYPE.PLAYER)
      let isPlayer = false;
      if (targets.length > 0) {
        targets = (targets as cc.Node[]).map(target => PlayerManager.getPlayerByCard(target))
        isPlayer = true;
      } else {
        targets = data.getTargets(TARGETTYPE.MONSTER)
      }
      for (const target of targets) {
        await this.addStat(target)
      }
    } else {
      if (data instanceof ActiveEffectData) {
        target = data.getTarget(TARGETTYPE.PLAYER)
        if (target == null) {
          target = data.getTarget(TARGETTYPE.MONSTER)
        } else {
          target = PlayerManager.getPlayerByCard(target)
        }
      } else {
        if (data.effectTargets.length == 0) {
          target = data.effectCardPlayer
        } else {
          target = data.getTarget(TARGETTYPE.PLAYER)
          if (target == null) {
            target = data.getTarget(TARGETTYPE.MONSTER)
          } else {
            target = PlayerManager.getPlayerByCard(target)
          }
        }
      }

      if (target == null) {
        throw `no target to gain stats`
      } else {
        cc.log(target)
        await this.addStat(target)
      }
    }

    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }

  async addStat(target: cc.Node) {
    //case target is a player
    let player: Player = target.getComponent(Player)
    if (player == null) player = PlayerManager.getPlayerByCard(target)
    if (player != null) {
      if (this.gainHp) {
        await player.gainHeartContainer(this.hpToGain, this.hpTemp, true)
      }
      if (this.gainDMG) {
        await player.gainDMG(this.DMGToGain, this.dmgTemp, true)
      }
      if (this.gainRollBonus) {
        await player.gainRollBonus(this.rollBonusToGain, this.rollBonusTemp, true)
      }
      if (this.gainAttackRollBonus) {
        if(this.isOnlyNextAttack){
          await player.gainAttackRollBonus(this.attackRollBonusToGain, this.attackRollBonusTemp, true,true)
        } else {
          await player.gainAttackRollBonus(this.attackRollBonusToGain, this.attackRollBonusTemp, false,true)
        }
      }
      if (this.gainFirstAttackRollBonus) {
        await player.gainFirstAttackRollBonus(this.firstAttackRollBonusToGain, this.firstAttackRollBonusToGainTemp, true)
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

  async reverseEffect() {
    let target = this.activatedTarget;

    if (target != null) {

      //case target is a player
      if (target instanceof Player) {
        let player: Player = target.getComponent(Player);

        if (this.gainHp) {
          await player.gainHeartContainer(-this.hpToGain, this.hpTemp, true)
        }
        if (this.gainDMG) {
          await player.gainDMG(-this.DMGToGain, this.dmgTemp, true)
        }
        if (this.gainRollBonus) {
          await player.gainRollBonus(-this.rollBonusToGain, this.rollBonusTemp, true)
        }
        if (this.gainAttackRollBonus) {
          if(this.isOnlyNextAttack){
            await player.gainAttackRollBonus(-this.attackRollBonusToGain, this.attackRollBonusTemp, true,true)
          } else {
            await player.gainAttackRollBonus(-this.attackRollBonusToGain, this.attackRollBonusTemp, false,true)
          }
        }
        if (this.gainFirstAttackRollBonus) {
          await player.gainFirstAttackRollBonus(-this.firstAttackRollBonusToGain, this.firstAttackRollBonusToGainTemp, true)
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

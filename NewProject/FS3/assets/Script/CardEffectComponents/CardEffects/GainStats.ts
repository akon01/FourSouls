import { CCInteger, log, Node, _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('GainStats')
export class GainStats extends Effect {
  effectName = "GainStats";
  @property
  multiTarget: boolean = false;
  @property
  gainHp: boolean = false;
  @property({
    visible: function (this: GainStats) {
      return this.gainHp
    }
  })
  hpToGain: number = 0;
  @property({
    visible: function (this: GainStats) {
      return this.gainHp
    }
  })
  hpTemp: boolean = false;
  @property
  gainDMG: boolean = false;
  @property({
    visible: function (this: GainStats) {
      return this.gainDMG
    }
    , type: CCInteger
  })
  DMGToGain: number = 0;
  @property({
    visible: function (this: GainStats) {
      return this.gainDMG
    }
  })
  dmgTemp: boolean = false;
  @property
  gainRollBonus: boolean = false;
  @property({
    tooltip: "non-attack bonus for players,roll needed to hit on monster", visible: function (this: GainStats) {
      return this.gainRollBonus
    }
    , type: CCInteger
  })
  rollBonusToGain: number = 0;
  @property({
    visible: function (this: GainStats) {
      return this.gainRollBonus
    }
  })
  rollBonusTemp: boolean = false;
  @property
  gainAttackRollBonus: boolean = false;
  @property({
    visible: function (this: GainStats) {
      return this.gainAttackRollBonus
    }
  })
  isOnlyNextAttack: boolean = false

  @property({
    visible: function (this: GainStats) {
      return this.gainAttackRollBonus
    }
    , type: CCInteger
  })
  attackRollBonusToGain: number = 0;

  @property({
    visible: function (this: GainStats) {
      return this.gainAttackRollBonus
    }
  })
  attackRollBonusTemp: boolean = false;

  @property
  gainFirstAttackRollBonus: boolean = false;

  @property({
    visible: function (this: GainStats) {
      return this.gainFirstAttackRollBonus
    }
    , type: CCInteger
  })
  firstAttackRollBonusToGain: number = 0;

  @property({
    visible: function (this: GainStats) {
      return this.gainFirstAttackRollBonus
    }
  })
  firstAttackRollBonusToGainTemp: boolean = false;


  isReveseable = true

  activatedTarget: Node | null = null;


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    let target;
    if (!data) { debugger; throw new Error("No Data"); }
    if (this.multiTarget) {
      let targets: Node[] = []
      targets = data.getTargets(TARGETTYPE.PLAYER) as Node[]
      let isPlayer = false;
      if (targets.length > 0) {
        targets = (targets as Node[]).map(target => WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target)!.node)
        isPlayer = true;
      } else {
        targets = data.getTargets(TARGETTYPE.MONSTER) as Node[]
      }
      for (const target of targets) {
        await this.addStat(target)
      }
    } else {
      if (data instanceof ActiveEffectData) {
        target = data.getTarget(TARGETTYPE.PLAYER) as Node
        if (target == null) {
          target = data.getTarget(TARGETTYPE.MONSTER) as Node
        } else {
          target = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target)?.node
        }
      } else {
        if (data.effectTargets.length == 0) {
          target = data.effectCardPlayer
        } else {
          target = data.getTarget(TARGETTYPE.PLAYER) as Node
          if (target == null) {
            target = data.getTarget(TARGETTYPE.MONSTER) as Node
          } else {
            target = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target)?.node
          }
        }
      }

      if (target == null) {
        throw `no target to gain stats`
      } else {
        log(target)
        await this.addStat(target)
      }
    }

    if (data instanceof PassiveEffectData) return data
    return WrapperProvider.stackWrapper.out._currentStack
  }
  async addStat(target: Node) {
    //case target is a player
    let player: Player | null = target.getComponent(Player)
    if (player == null) player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target)
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
        if (this.isOnlyNextAttack) {
          await player.gainAttackRollBonus(this.attackRollBonusToGain, this.attackRollBonusTemp, true, true)
        } else {
          await player.gainAttackRollBonus(this.attackRollBonusToGain, this.attackRollBonusTemp, false, true)
        }
      }
      if (this.gainFirstAttackRollBonus) {
        await player.gainFirstAttackRollBonus(this.firstAttackRollBonusToGain, this.firstAttackRollBonusToGainTemp, true)
      }
    } else {
      //  target = WrapperProvider.cardManagerWrapper.out.getCardById(data.target, true)
      let monster: Monster | null = target.getComponent(Monster)
      if (!monster) { debugger; throw new Error("No Player Nor Monster"); }

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

      // case target is a player
      if (target instanceof Player) {
        let player: Player | null = target.getComponent(Player);
        if (player) {
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
            if (this.isOnlyNextAttack) {
              await player.gainAttackRollBonus(-this.attackRollBonusToGain, this.attackRollBonusTemp, true, true)
            } else {
              await player.gainAttackRollBonus(-this.attackRollBonusToGain, this.attackRollBonusTemp, false, true)
            }
          }
          if (this.gainFirstAttackRollBonus) {
            await player.gainFirstAttackRollBonus(-this.firstAttackRollBonusToGain, this.firstAttackRollBonusToGainTemp, true)
          }
        }
      } else {
        // target is a monster
        let monster: Monster | null = target.getComponent(Monster)
        if (!monster) { debugger; throw new Error("Not Player Nor Monster"); }

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

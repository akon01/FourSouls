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
  multiTarget = false;

  @property
  gainHp = false;

  @property({
    visible: function (this: GainStats) {
      return this.gainHp && !this.isHpToGainFromDataCollector
    }
  })
  hpToGain = 0;

  @property({
    visible: function (this: GainStats) {
      return this.gainHp
    }
  })
  isHpToGainFromDataCollector = false;


  @property({
    visible: function (this: GainStats) {
      return this.isHpToGainFromDataCollector
    }
  })
  hpDataIndex = 0

  @property({
    visible: function (this: GainStats) {
      return this.gainHp
    }
  })
  hpTemp = false;

  @property
  gainDMG = false;

  @property({
    visible: function (this: GainStats) {
      return this.gainDMG && !this.isDMGToGainFromDataCollector
    }
    , type: CCInteger
  })
  DMGToGain = 0;

  @property({
    visible: function (this: GainStats) {
      return this.gainDMG
    }
  })
  isDMGToGainFromDataCollector = false;


  @property({
    visible: function (this: GainStats) {
      return this.isDMGToGainFromDataCollector
    }
  })
  DMGdataIndex = 0

  @property({
    visible: function (this: GainStats) {
      return this.gainDMG
    }
  })
  dmgTemp = false;

  @property
  gainRollBonus = false;

  @property({
    tooltip: "non-attack bonus for players,roll needed to hit on monster", visible: function (this: GainStats) {
      return this.gainRollBonus && !this.isRollBonusToGainFromDataCollector
    }
    , type: CCInteger
  })
  rollBonusToGain = 0;

  @property({
    visible: function (this: GainStats) {
      return this.gainRollBonus
    }
  })
  isRollBonusToGainFromDataCollector = false;


  @property({
    visible: function (this: GainStats) {
      return this.isRollBonusToGainFromDataCollector
    }
  })
  rollBonusDataIndex = 0

  @property({
    visible: function (this: GainStats) {
      return this.gainRollBonus
    }
  })
  rollBonusTemp = false;

  @property
  gainAttackRollBonus = false;

  @property({
    visible: function (this: GainStats) {
      return this.gainAttackRollBonus
    }
  })
  isOnlyNextAttack = false

  @property({
    visible: function (this: GainStats) {
      return this.gainAttackRollBonus && !this.isAttackRollBonusToGainFromDataCollector
    }
    , type: CCInteger
  })
  attackRollBonusToGain = 0;

  @property({
    visible: function (this: GainStats) {
      return this.gainAttackRollBonus
    }
  })
  isAttackRollBonusToGainFromDataCollector = false;


  @property({
    visible: function (this: GainStats) {
      return this.isAttackRollBonusToGainFromDataCollector
    }
  })
  attackRollBonusDataIndex = 0

  @property({
    visible: function (this: GainStats) {
      return this.gainAttackRollBonus
    }
  })
  attackRollBonusTemp = false;

  @property
  gainFirstAttackRollBonus = false;

  @property({
    visible: function (this: GainStats) {
      return this.gainFirstAttackRollBonus && !this.isFirstAttackRollBonusToGainFromDataCollector
    }
    , type: CCInteger
  })
  firstAttackRollBonusToGain = 0;

  @property({
    visible: function (this: GainStats) {
      return this.gainFirstAttackRollBonus
    }
  })
  isFirstAttackRollBonusToGainFromDataCollector = false;


  @property({
    visible: function (this: GainStats) {
      return this.isAttackRollBonusToGainFromDataCollector
    }
  })
  firstAttackRollBonusDataIndex = 0

  @property({
    visible: function (this: GainStats) {
      return this.gainFirstAttackRollBonus
    }
  })
  firstAttackRollBonusToGainTemp = false;


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
        await this.addStat(target, data)
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
        throw new Error(`no target to gain stats`)
      } else {
        console.log(target)
        await this.addStat(target, data)
      }
    }

    if (data instanceof PassiveEffectData) return data
    return WrapperProvider.stackWrapper.out._currentStack
  }

  getHPToGain(data: ActiveEffectData | PassiveEffectData,target:Node) {
    const numbersData = data.getTargets(TARGETTYPE.NUMBER) as number[]
    return this.getQuantityInRegardsToBlankCard(target,this.isHpToGainFromDataCollector ? numbersData[this.hpDataIndex] : this.hpToGain)
  }


  getDMGToGain(data: ActiveEffectData | PassiveEffectData,target:Node) {
    const numbersData = data.getTargets(TARGETTYPE.NUMBER) as number[]
    return this.getQuantityInRegardsToBlankCard(target,this.isDMGToGainFromDataCollector ? numbersData[this.DMGdataIndex] : this.DMGToGain)
  }

  getRollBonus(data: ActiveEffectData | PassiveEffectData,target:Node) {
    const numbersData = data.getTargets(TARGETTYPE.NUMBER) as number[]
    return this.getQuantityInRegardsToBlankCard(target,this.isRollBonusToGainFromDataCollector ? numbersData[this.rollBonusDataIndex] : this.rollBonusToGain)
  }

  getAttackRollBonus(data: ActiveEffectData | PassiveEffectData,target:Node) {
    const numbersData = data.getTargets(TARGETTYPE.NUMBER) as number[]
    return this.getQuantityInRegardsToBlankCard(target,this.isAttackRollBonusToGainFromDataCollector ? numbersData[this.attackRollBonusDataIndex] : this.attackRollBonusToGain)
  }

  getFirstAttackRollBonus(data: ActiveEffectData | PassiveEffectData,target:Node) {
    const numbersData = data.getTargets(TARGETTYPE.NUMBER) as number[]
    return this.getQuantityInRegardsToBlankCard(target,this.isFirstAttackRollBonusToGainFromDataCollector ? numbersData[this.firstAttackRollBonusDataIndex] : this.firstAttackRollBonusToGain)
  }



  async addStat(target: Node, data: ActiveEffectData | PassiveEffectData) {
    //case target is a player
    let player: Player | null = target.getComponent(Player)
    const numbersData = data.getTargets(TARGETTYPE.NUMBER) as number[]
    if (player == null) player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target)
    if (player != null) {
      if (this.gainHp) {

        await player.gainHeartContainer(this.getHPToGain(data,player.node), this.hpTemp, true)
      }
      if (this.gainDMG) {
        await player.gainDMG(this.getDMGToGain(data,player.node), this.dmgTemp, true)
      }
      if (this.gainRollBonus) {
        await player.gainRollBonus(this.getRollBonus(data,player.node), this.rollBonusTemp, true)
      }
      if (this.gainAttackRollBonus) {
        if (this.isOnlyNextAttack) {
          await player.gainAttackRollBonus(this.getAttackRollBonus(data,player.node), this.attackRollBonusTemp, true, true)
        } else {
          await player.gainAttackRollBonus(this.getAttackRollBonus(data,player.node), this.attackRollBonusTemp, false, true)
        }
      }
      if (this.gainFirstAttackRollBonus) {
        await player.gainFirstAttackRollBonus(this.getFirstAttackRollBonus(data,player.node), this.firstAttackRollBonusToGainTemp, true)
      }
    } else {
      //  target = WrapperProvider.cardManagerWrapper.out.getCardById(data.target, true)
      const monster: Monster | null = target.getComponent(Monster)
      if (!monster) { debugger; throw new Error("No Player Nor Monster"); }

      if (this.gainHp) {
        await monster.gainHp(this.getHPToGain(data,monster.node), true)
      }
      if (this.gainDMG) {
        await monster.gainDMG(this.getDMGToGain(data,monster.node), true)
      }
      if (this.gainRollBonus) {
        await monster.gainRollBonus(this.getRollBonus(data,monster.node), true)
      }
    }
    this.activatedTarget = target
  }
  async reverseEffect(data: ActiveEffectData | PassiveEffectData) {
    const target = this.activatedTarget;

    if (target != null) {

      // case target is a player
      if (target instanceof Player) {
        const player: Player | null = target.getComponent(Player);
        if (player) {
          if (this.gainHp) {
            await player.gainHeartContainer(-this.getHPToGain(data,player.node), this.hpTemp, true)
          }
          if (this.gainDMG) {
            await player.gainDMG(-this.getDMGToGain(data,player.node), this.dmgTemp, true)
          }
          if (this.gainRollBonus) {
            await player.gainRollBonus(-this.getRollBonus(data,player.node), this.rollBonusTemp, true)
          }
          if (this.gainAttackRollBonus) {
            if (this.isOnlyNextAttack) {
              await player.gainAttackRollBonus(-this.getAttackRollBonus(data,player.node), this.attackRollBonusTemp, true, true)
            } else {
              await player.gainAttackRollBonus(-this.getAttackRollBonus(data,player.node), this.attackRollBonusTemp, false, true)
            }
          }
          if (this.gainFirstAttackRollBonus) {
            await player.gainFirstAttackRollBonus(-this.getFirstAttackRollBonus(data,player.node), this.firstAttackRollBonusToGainTemp, true)
          }
        }
      } else {
        // target is a monster
        const monster: Monster | null = target.getComponent(Monster)
        if (!monster) { debugger; throw new Error("Not Player Nor Monster"); }

        if (this.gainHp) {

          await monster.gainHp(-this.getHPToGain(data,monster.node), true)

        }
        if (this.gainDMG) {

          await monster.gainDMG(-this.getDMGToGain(data,monster.node), true)

        }
        if (this.gainRollBonus) {

          await monster.gainRollBonus(-this.getRollBonus(data,monster.node), true)

        }
        this.activatedTarget = target
      }
    }

  }
}

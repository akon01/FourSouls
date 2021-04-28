import { Node, _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('ChangePlayerSpecificStats')
export class ChangePlayerSpecificStats extends Effect {
  effectName = "ChangePlayerSpecificStats";
  @property
  multiTarget = false;
  @property
  gainStartTurnDraw = false;
  @property({
    visible: function (this: ChangePlayerSpecificStats) {
      return this.gainStartTurnDraw
    }
  })
  StartTurnDrawToGain = 0;


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
      if (targets.length == 0) {
        throw new CardEffectTargetError(`target players are null`, true, data, stack)
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
        throw new CardEffectTargetError(`target player is null`, true, data, stack)
      } else {
        console.log(target)
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
      if (this.gainStartTurnDraw) {
        await player.changeTurnDrawPlays(this.getQuantityInRegardsToBlankCard(player.node, this.StartTurnDrawToGain), true)
      }

    }
    this.activatedTarget = target
  }
  async reverseEffect() {
    const target = this.activatedTarget;

    if (target != null) {

      // case target is a player
      if (target instanceof Player) {
        const player: Player | null = target.getComponent(Player);
        if (player) {
          if (this.gainStartTurnDraw) {
            await player.changeTurnDrawPlays(this.getQuantityInRegardsToBlankCard(player.node, this.StartTurnDrawToGain), true)
          }

        }
      }
      this.activatedTarget = target
    }
  }

}


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

  currTargets: Node[] = []

  currData: ActiveEffectData | PassiveEffectData | null = null
  currStack: StackEffectInterface[] = []


  /**
   *
   * @param data {target:PlayerId}
   */
  doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    let target;
    if (!data) { debugger; throw new Error("No Data"); }
    this.currData = data
    this.currStack = stack
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
      const i = 0
      return this.handleAddStatToTarget(i, targets.length)
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
        this.addStat(target)
        return this.handleEndOfAddStats()
      }
    }
    return this.handleEndOfAddStats()
  }

  private handleEndOfAddStats(): Promise<PassiveEffectData | StackEffectInterface[]> {
    if (this.currData instanceof PassiveEffectData) return Promise.resolve(this.currData)
    return Promise.resolve(WrapperProvider.stackWrapper.out._currentStack)
  }

  private handleAddStatToTarget(idx: number, length: number): Promise<PassiveEffectData | StackEffectInterface[]> {
    const target = this.currTargets[idx]
    this.addStat(target)
    return this.handleAfterAddStatToTarget(idx, length)
  }

  private handleAfterAddStatToTarget(idx: number, length: number): Promise<PassiveEffectData | StackEffectInterface[]> {
    if (idx < length) {
      return this.handleAddStatToTarget(idx++, length)
    }
    return this.handleEndOfAddStats()
  }

  addStat(target: Node) {
    //case target is a player
    let player: Player | null = target.getComponent(Player)
    if (player == null) player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(target)
    if (player != null) {
      if (this.gainStartTurnDraw) {
        player.changeTurnDrawPlays(this.getQuantityInRegardsToBlankCard(player.node, this.StartTurnDrawToGain), true)
      }

    }
    this.activatedTarget = target
  }
  reverseEffect() {
    const target = this.activatedTarget;

    if (target != null) {

      // case target is a player
      if (target instanceof Player) {
        const player: Player | null = target.getComponent(Player);
        if (player) {
          if (this.gainStartTurnDraw) {
            player.changeTurnDrawPlays(this.getQuantityInRegardsToBlankCard(player.node, this.StartTurnDrawToGain), true)
          }

        }
      }
      this.activatedTarget = target
    }
  }

}


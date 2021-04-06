import { CCInteger, Node, _decorator } from 'cc';
import { TARGETTYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('AddPlayLootOpportunity')
export class AddPlayLootOpportunity extends Effect {
  effectName = "AddPlayLootOpportunity";
  @property(CCInteger)
  numOfTimes = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const playerCard = data.getTarget(TARGETTYPE.PLAYER) as Node
    if (!playerCard) {
      throw new Error(`no Player to all loot plays to`)
    }
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard)!
    player.changeLootCardPlayes(this.getQuantityInRegardsToBlankCard(player.node, this.numOfTimes), true);
    // if (WrapperProvider.turnsManagerWrapper.out.isCurrentPlayer(player.node)) {
    //   player.lootCardPlays += this.numOfTimes
    // }

    //  }

    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}

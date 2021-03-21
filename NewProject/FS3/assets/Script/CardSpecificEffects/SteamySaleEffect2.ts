import { CCInteger, Node, _decorator } from 'cc';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { TARGETTYPE } from "../Constants";
import { CardEffect } from "../Entites/CardEffect";
import { Stack } from "../Entites/Stack";
import { PassiveEffectData } from "../Managers/PassiveEffectData";
import { PlayerManager } from "../Managers/PlayerManager";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { SteamySaleEffect } from "./SteamySaleEffect";
const { ccclass, property } = _decorator;


@ccclass('SteamySaleEffect2')
export class SteamySaleEffect2 extends Effect {
  effectName = "SteamySaleEffect2";

  // @property(CCInteger)
  // steamySaleEffectIdFinal: number = -1

  @property(SteamySaleEffect)
  steamySaleEffect: SteamySaleEffect | null = null
  getSteamySaleEffect1() {
    return this.steamySaleEffect
    // return this.node.getComponent(CardEffect)!.getEffect(this.steamySaleEffectIdFinal) as SteamySaleEffect
  }
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData
  ) {
    const playerCard = data.getTarget(TARGETTYPE.PLAYER) as Node
    if (!playerCard) {
      throw new Error(`No Player Found To Reduce Store Cost`)
    }
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard)!
    const effect = this.getSteamySaleEffect1();
    if (!effect) { debugger; throw new Error("No Steamy Sale Effect 1 Set!"); }

    player.storeCardCostReduction = effect.originalStoreCost
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
import { Node, _decorator } from 'cc';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { TARGETTYPE } from "../Constants";
import { Item } from "../Entites/CardTypes/Item";
import { Monster } from "../Entites/CardTypes/Monster";
import { Card } from "../Entites/GameEntities/Card";
import { Player } from '../Entites/GameEntities/Player';
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { WrapperProvider } from '../Managers/WrapperProvider';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
const { ccclass, property } = _decorator;



@ccclass('DivorcePapersEffect')
export class DivorcePapersEffect extends Effect {
  effectName = "DivorcePapersEffect";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData | ActiveEffectData
  ) {
    const playerToGive = WrapperProvider.playerManagerWrapper.out.getPlayerByCard((data.getTarget(TARGETTYPE.PLAYER) as Node))!.getComponent(Player)!
    const itemToGet = (data.getTarget(TARGETTYPE.ITEM) as Node)
    const lootsToGet = (data.getTargets(TARGETTYPE.CARD) as Node[]).filter(et => et != itemToGet && et != playerToGive.character!)
    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(this._effectCard!)

    const numOfCoins = Math.floor(playerToGive.coins / 2);
    playerToGive.changeMoney(-numOfCoins, true)
    cardOwner?.changeMoney(numOfCoins, true)
    for (const lootToGive of lootsToGet) {
      await playerToGive.loseLoot(lootToGive, true)
      await WrapperProvider.cardManagerWrapper.out.moveCardTo(lootToGive, cardOwner!.handNode!, true, false)
      await cardOwner?.gainLoot(lootToGive, true)
    }
    await playerToGive.loseItem(itemToGet, true)
    await cardOwner?.addItem(itemToGet, true, true)

    if (data instanceof PassiveEffectData) {
      return data
    }
    return stack
  }

}
import { Node, _decorator } from 'cc';
import { Card } from '../../Entites/GameEntities/Card';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('GetSoulCard')
export class GetSoulCard extends Effect {
  effectName = "GetSoulCard";


  @property
  alsoAddSoulsToCard: boolean = false

  @property({
    visible: function (this: GetSoulCard) {
      return this.alsoAddSoulsToCard
    }
  })
  numOfSoulsToAddToCard: number = 1;

  /**
   *
   * @param data {lootPlayedId:number,playerId:number} 
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data"); }

    const playerCard = data.getTarget(TARGETTYPE.PLAYER)
    const cardToTake = data.getTarget(TARGETTYPE.CARD) as Node
    const playerToGiveTo = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard as Node)
    if (playerToGiveTo == null) {
      throw new Error(`player to give to is null`)
    } else {
      if (this.alsoAddSoulsToCard) {
        cardToTake.getComponent(Card)!.changeNumOfSouls(this.numOfSoulsToAddToCard, true)
      }
      await playerToGiveTo.receiveSoulCard(cardToTake as Node, true)
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}

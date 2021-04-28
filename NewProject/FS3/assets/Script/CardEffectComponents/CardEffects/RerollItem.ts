import { Node, _decorator } from 'cc';
import { Item } from '../../Entites/CardTypes/Item';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('RerollItem')
export class RerollItem extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;
  effectName = "RerollItem";
  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data"); }
    const cardChosen = data.getTarget(TARGETTYPE.ITEM)
    if (cardChosen == null) {
      throw new CardEffectTargetError(`No Item To Reroll found`, true, data, stack)
    } else {
      if (cardChosen instanceof Node) {
        const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(cardChosen)!
        await cardChosen.getComponent(Item)!.destroyItem(true);
        const treasureTopDeck = WrapperProvider.cardManagerWrapper.out.treasureDeck;
        await player.addItem(treasureTopDeck, true, true);
      }
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}

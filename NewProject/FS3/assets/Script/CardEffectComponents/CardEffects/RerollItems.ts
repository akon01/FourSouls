import { Node, _decorator } from 'cc';
import { Item } from '../../Entites/CardTypes/Item';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('RerollItems')
export class RerollItems extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;
  effectName = "RerollItems";
  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data"); }
    const cardsChosen = data.getTargets(TARGETTYPE.ITEM);
    let player: Player;
    const treasureDeck = WrapperProvider.cardManagerWrapper.out.treasureDeck;
    if (cardsChosen.length == 0) {
      throw new CardEffectTargetError(`No Items To Reroll Targets found`, true, data, stack)
    } else {
      for (let i = 0; i < cardsChosen.length; i++) {
        const cardChosen = cardsChosen[i];
        if (cardChosen instanceof Node) {
          player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(cardChosen)!;
          await cardChosen.getComponent(Item)!.destroyItem(true);
          await player.addItem(treasureDeck, true, true);
        }
      }
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}

import { _decorator, Node, log } from 'cc';
const { ccclass, property } = _decorator;

import { Deck } from "../../Entites/GameEntities/Deck";
import { Stack } from "../../Entites/Stack";
import { CardManager } from "../../Managers/CardManager";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
import { WrapperProvider } from '../../Managers/WrapperProvider';

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
      log(`no item to reroll`)
    } else {
      if (cardChosen instanceof Node) {
        const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(cardChosen)!
        await player.destroyItem(cardChosen, true);
        const treasureTopDeck = WrapperProvider.cardManagerWrapper.out.treasureDeck;
        await player.addItem(treasureTopDeck, true, true);
      }
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}

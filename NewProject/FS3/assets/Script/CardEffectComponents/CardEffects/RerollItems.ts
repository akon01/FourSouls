import { _decorator, Node, log } from 'cc';
const { ccclass, property } = _decorator;

import { Deck } from "../../Entites/GameEntities/Deck";
import { Player } from "../../Entites/GameEntities/Player";
import { Stack } from "../../Entites/Stack";
import { CardManager } from "../../Managers/CardManager";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
import { WrapperProvider } from '../../Managers/WrapperProvider';

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
      log(`no items to reroll`)
    } else {
      for (let i = 0; i < cardsChosen.length; i++) {
        const cardChosen = cardsChosen[i];
        if (cardChosen instanceof Node) {
          player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(cardChosen)!;
          await player.destroyItem(cardChosen, true);
          await player.addItem(treasureDeck, true, true);
        }
      }
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}

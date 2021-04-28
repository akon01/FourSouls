import { Node, _decorator } from 'cc';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('DiscardAndDrawLoot')
export class DiscardAndDrawLoot extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;
  effectName = "DiscardAndDrawLoot";
  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const cardChosen = data.getTargets(TARGETTYPE.CARD)
    console.log(cardChosen)
    if (cardChosen.length == 0) {
      throw new CardEffectTargetError(`target cards to discard are null`, true, data, stack)
      //console.log(`target card is null`)
    } else {
      if (cardChosen instanceof Node) {
        const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(cardChosen)!
        // player.playLootCard(cardPlayed, true);
        await player.discardLoot(cardChosen, true);
        await player.drawCards(WrapperProvider.cardManagerWrapper.out.lootDeck, true);
      } else {
        if (cardChosen instanceof Array) {
          for (let i = 0; i < cardChosen.length; i++) {
            const card = cardChosen[i];
            const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(card as Node)!
            // player.getComponent(Player).playLootCard(cardPlayed, true);
            await player.discardLoot(card as Node, true);
            await player.drawCards(WrapperProvider.cardManagerWrapper.out.lootDeck, true);
          }
        }
      }
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}

import Deck from "../../Entites/GameEntities/Deck";
import CardManager from "../../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import ChooseCard from "../DataCollector/ChooseCard";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import Effect from "./Effect";
import Stack from "../../Entites/Stack";
import ChooseCardTypeAndFilter from "../ChooseCardTypeAndFilter";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LootThenPutOnTop extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;

  effectName = "LootThenPutOnTop";

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    const playerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (playerCard instanceof cc.Node) {
      const player = PlayerManager.getPlayerByCard(playerCard)
      if (player == null) {
        cc.log(`no player to loot`)
      } else {
        await player.drawCard(CardManager.lootDeck, true);
        const cardChoose = new ChooseCard();
        cardChoose.chooseType = new ChooseCardTypeAndFilter()
        cardChoose.chooseType.chooseType = CHOOSE_CARD_TYPE.MY_HAND;
        cardChoose.flavorText = "Choose Loot To Put On Top"
        const chosenData = await cardChoose.collectData({ cardPlayerId: player.playerId })
        // let chosenCard = CardManager.getCardById(chosenData.cardChosenId, true)
        const chosenCard = chosenData.effectTargetCard;
        const lootDeck = CardManager.lootDeck.getComponent(Deck);
        await CardManager.moveCardTo(chosenCard, lootDeck.node, true, false);
        await player.loseLoot(chosenCard, true)
        await lootDeck.addToDeckOnTop(chosenCard, true)
      }
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}

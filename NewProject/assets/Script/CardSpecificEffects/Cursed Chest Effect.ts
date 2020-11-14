import Effect from "../CardEffectComponents/CardEffects/Effect";
import { CARD_TYPE, CHOOSE_CARD_TYPE, TARGETTYPE } from "../Constants";
import Item from "../Entites/CardTypes/Item";
import Monster from "../Entites/CardTypes/Monster";
import Deck from "../Entites/GameEntities/Deck";
import Player from "../Entites/GameEntities/Player";
import MonsterField from "../Entites/MonsterField";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import CardPreviewManager from "../Managers/CardPreviewManager";
import { ActiveEffectData, PassiveEffectData } from "../Managers/DataInterpreter";
import PileManager from "../Managers/PileManager";
import PlayerManager from "../Managers/PlayerManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";

const { ccclass, property } = cc._decorator;

@ccclass("CursedChestEffect")
export default class CursedChestEffect extends Effect {

  effectName = "CursedChestEffect";

  /**
   *
   * @param data {target:PlayerId}
   */

  //@printMethodStarted(COLORS.RED)
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    const activatingPlayer = PlayerManager.getPlayerByCard(data.getTarget(TARGETTYPE.PLAYER) as cc.Node)
    if (activatingPlayer == null) {
      throw new Error("No Player Found For Cursed Chest Effect")
    }
    const deck: Deck = CardManager.treasureDeck.getComponent(Deck)
    const guppyItems: Item[] = [];
    deck.getCards().forEach(card => {
      if (card.getComponent(Item).isGuppyItem) {
        guppyItems.push(card.getComponent(Item))
      }
    });
    const itemChosen = await CardPreviewManager.selectFromCards(guppyItems.map(item => item.node), 1)
    await activatingPlayer.addItem(itemChosen[0], true, true)
    deck.shuffleDeck()

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}

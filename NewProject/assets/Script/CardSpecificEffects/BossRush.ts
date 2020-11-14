import Effect from "../CardEffectComponents/CardEffects/Effect";
import { CARD_TYPE, CHOOSE_CARD_TYPE, TARGETTYPE } from "../Constants";
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

@ccclass("BossRushEffect")
export default class BossRushEffect extends Effect {

  effectName = "BossRushEffect";

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
      throw new Error("No Player Found For Boss Rush")
    }
    const deck: Deck = CardManager.monsterDeck.getComponent(Deck)
    const bosses: Monster[] = [];
    const nonBosses: Monster[] = []
    while (bosses.length < 2) {
      const cardDrawn = deck.drawCard(true)
      CardPreviewManager.showToOtherPlayers(cardDrawn)
      const monster = cardDrawn.getComponent(Monster)
      if (monster.isBoss || monster.isMegaBoss) {
        bosses.push(monster)
      } else {
        nonBosses.push(monster)
      }
    }
    await activatingPlayer.giveNextClick("Click Next When To Continue")
    //await CardPreviewManager.removeFromCurrentPreviews(cardsToSee)
    for (let i = 0; i < bosses.length; i++) {
      const boss = bosses[i];
      await MonsterField.givePlayerChoiceToCoverPlace(boss, activatingPlayer)
    }
    for (let i = 0; i < nonBosses.length; i++) {
      const nonBoss = nonBosses[i];
      await PileManager.addCardToPile(CARD_TYPE.MONSTER, nonBoss.node, true)
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }
}

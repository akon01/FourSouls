import { _decorator, Node } from 'cc';
const { ccclass } = _decorator;

import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { CARD_TYPE, TARGETTYPE } from "../Constants";
import { Monster } from "../Entites/CardTypes/Monster";
import { Deck } from "../Entites/GameEntities/Deck";
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { WrapperProvider } from '../Managers/WrapperProvider';

@ccclass("BossRushEffect")
export class BossRushEffect extends Effect {
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
    if (!data) { debugger; throw new Error("No Data!!"); }

    const activatingPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(data.getTarget(TARGETTYPE.PLAYER) as Node)
    if (activatingPlayer == null) {
      throw new Error("No Player Found For Boss Rush")
    }
    const deck: Deck = WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!
    const bosses: Monster[] = [];
    const nonBosses: Monster[] = []
    while (bosses.length < 2) {
      const cardDrawn = deck.drawCard(true)
      WrapperProvider.cardPreviewManagerWrapper.out.showToOtherPlayers([cardDrawn])
      const monster = cardDrawn.getComponent(Monster)!
      if (monster.isBoss || monster.isMegaBoss) {
        bosses.push(monster)
      } else {
        nonBosses.push(monster)
      }
    }
    await activatingPlayer.giveNextClick("Click Next To Continue")
    //await WrapperProvider.cardPreviewManagerWrapper.out.removeFromCurrentPreviews(cardsToSee)
    for (let i = 0; i < bosses.length; i++) {
      const boss = bosses[i];
      await WrapperProvider.monsterFieldWrapper.out.givePlayerChoiceToCoverPlace(boss, activatingPlayer)
    }
    for (let i = 0; i < nonBosses.length; i++) {
      const nonBoss = nonBosses[i];
      await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.MONSTER, nonBoss.node, true)
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}

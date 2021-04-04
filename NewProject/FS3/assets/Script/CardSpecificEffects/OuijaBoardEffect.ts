import { CCInteger, _decorator } from 'cc';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { Monster } from '../Entites/CardTypes/Monster';
import { Deck } from '../Entites/GameEntities/Deck';
import { WrapperProvider } from '../Managers/WrapperProvider';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
const { ccclass, property } = _decorator;


@ccclass('OuijaBoardEffect')
export class OuijaBoardEffect extends Effect {
  effectName = "OuijaBoardEffect";

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: { numberRolled: number; cardPlayerId: number }
  ) {

    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(this.getEffectCard())!
    const monsterDeck = WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!;
    //monsterDeck.drawCard(true)
    const top4Cards = monsterDeck.getCards().slice(-4, -1)
    const previews = await WrapperProvider.cardPreviewManagerWrapper.out.getPreviews(top4Cards, true)
    WrapperProvider.cardPreviewManagerWrapper.out.showToOtherPlayers(top4Cards)
    let cardsToPutBack = [...top4Cards]
    if (top4Cards.some(c => c.getComponent(Monster)!.isNonMonster)) {
      const answer = await cardOwner.giveYesNoChoice('Do You Want To Play A Non-Monster Card?')
      if (answer) {
        const selectedCard = await WrapperProvider.cardPreviewManagerWrapper.out.selectFromCards(top4Cards, 1)
        await cardOwner.activateCard(selectedCard[0])
        cardsToPutBack = cardsToPutBack.filter(c => c != selectedCard[0])
      }
    }
    for (const card of cardsToPutBack) {
      monsterDeck.addToDeckOnBottom(card, 0, true)
    }
    return stack
  }
}

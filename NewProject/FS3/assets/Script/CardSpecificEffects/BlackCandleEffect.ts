import { instantiate, Node, _decorator } from 'cc';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { ChooseCard } from '../CardEffectComponents/DataCollector/ChooseCard';
import { CHOOSE_CARD_TYPE, TARGETTYPE } from '../Constants';
import { Item } from '../Entites/CardTypes/Item';
import { Monster } from '../Entites/CardTypes/Monster';
import { Card } from '../Entites/GameEntities/Card';
import { Deck } from '../Entites/GameEntities/Deck';
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { EffectTarget } from '../Managers/EffectTarget';
import { WrapperProvider } from '../Managers/WrapperProvider';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
const { ccclass } = _decorator;


@ccclass('BlackCandleEffect')
export class BlackCandleEffect extends Effect {
  effectName = "BlackCandleEffect";
  /**
   *
   * @param data {target:PlayerId}
   */
  // eslint-disable-next-line 
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData
  ) {
    const playerManager = WrapperProvider.playerManagerWrapper.out;
    const cardPreviewManager = WrapperProvider.cardPreviewManagerWrapper.out;
    const monsterDeck = WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!
    const top6Cards = monsterDeck.getCards().slice(-6)
    cardPreviewManager.showToOtherPlayers(top6Cards)

    if (!top6Cards.some(c => c.getComponent(Monster)!.isCurse)) {
      return stack
    }
    let remainingCards = Object.assign({}, top6Cards)
    do {
      remainingCards = await this.handleChooseOfCard(top6Cards)
    }
    while (remainingCards.length !== 0 && remainingCards.length != top6Cards.length)



    return stack
  }

  async handleChooseOfCard(cardsToChooseFrom: Node[]) {
    const playerManager = WrapperProvider.playerManagerWrapper.out;
    const owner = playerManager.getPlayerByCard(this.getEffectCard())!
    const cardPreviewManager = WrapperProvider.cardPreviewManagerWrapper.out;
    const chooseCardForPlayerToReceiveCurse = new ChooseCard()
    chooseCardForPlayerToReceiveCurse.chooseType!.chooseType = CHOOSE_CARD_TYPE.ALL_PLAYERS
    const selectedCards = await cardPreviewManager.selectFromCards(cardsToChooseFrom, 1, true)
    if (selectedCards.length == 0) {
      return cardsToChooseFrom
    }
    const playerToReceiveTarget = await chooseCardForPlayerToReceiveCurse.collectData({ cardPlayerId: owner.playerId }) as EffectTarget
    const playerToReceive = playerManager.getPlayerByCard(playerToReceiveTarget.effectTargetCard)!
    await playerToReceive.addItem(selectedCards[0], true, true)
    playerToReceive.addCurse(selectedCards[0], true)
    return cardsToChooseFrom.filter(c => c !== selectedCards[0])
  }
}

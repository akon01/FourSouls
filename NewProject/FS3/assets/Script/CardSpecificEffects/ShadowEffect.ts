import { Node, _decorator } from 'cc';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { ChooseCardTypeAndFilter } from '../CardEffectComponents/ChooseCardTypeAndFilter';
import { ChooseCard } from '../CardEffectComponents/DataCollector/ChooseCard';
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "../Constants";
import { Item } from "../Entites/CardTypes/Item";
import { Monster } from "../Entites/CardTypes/Monster";
import { Card } from "../Entites/GameEntities/Card";
import { Player } from '../Entites/GameEntities/Player';
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { WrapperProvider } from '../Managers/WrapperProvider';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
const { ccclass, property } = _decorator;



@ccclass('ShadowEffect')
export class ShadowEffect extends Effect {
  effectName = "ShadowEffect";

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData
  ) {
    const chooseCard = new ChooseCard()
    chooseCard.chooseType!.chooseType = CHOOSE_CARD_TYPE.SPECIPIC_PLAYER_ITEMS_WITHOUT_ETERNALS
    chooseCard.otherPlayer = data.methodArgs[0] as Player
    const cardOwener = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(this.getEffectCard())!
    const chosenCard = await chooseCard.collectData({ cardPlayerId: cardOwener.playerId })
    data.methodArgs.push(chosenCard)
    if (data instanceof PassiveEffectData) {
      return data
    }
    return stack
  }


}
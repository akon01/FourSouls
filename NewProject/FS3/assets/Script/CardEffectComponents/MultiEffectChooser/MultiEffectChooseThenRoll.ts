import { _decorator, Node, Enum, log } from 'cc';
const { ccclass, property } = _decorator;

import { ITEM_TYPE } from "../../Constants";
import { EffectsAndNumbers } from "../../EffectsAndNumbers";
import { CardEffect } from "../../Entites/CardEffect";
import { DecisionMarker } from "../../Entites/DecisionMarker";
import { Card } from "../../Entites/GameEntities/Card";
import { Player } from '../../Entites/GameEntities/Player';
import { EffectTarget } from "../../Managers/EffectTarget";
import { PlayerManager } from '../../Managers/PlayerManager';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Effect } from "../CardEffects/Effect";
import { ChooseCardTypeAndFilter } from "../ChooseCardTypeAndFilter";
import { ChooseCard } from "../DataCollector/ChooseCard";
import { IMultiEffectRollAndCollect } from "./IMultiEffectRollAndCollect";

@ccclass('MultiEffectChooseThenRoll')
export class MultiEffectChooseThenRoll extends IMultiEffectRollAndCollect {
  collectorName = "MultiEffectChooseThenRoll";

  cardChosen: Node | null = null;

  @property({ type: Enum(ITEM_TYPE) })
  effectsType: ITEM_TYPE = ITEM_TYPE.ACTIVE;

  @property({ type: [EffectsAndNumbers], multiline: true })
  effectsAndNumbers: EffectsAndNumbers[] = [];


  @property
  multiType: boolean = false;

  @property({
    type: ChooseCardTypeAndFilter, visible: function (this: MultiEffectChooseThenRoll) {
      return !this.multiType
    }
  })
  chooseType: ChooseCardTypeAndFilter | null = null;

  @property({
    type: [ChooseCardTypeAndFilter], visible: function (this: MultiEffectChooseThenRoll) {
      return this.multiType
    }
  })
  chooseTypes: ChooseCardTypeAndFilter[] = []

  @property
  flavorText: string = ''

  /**
   *
   * @param data {cardPlayed}
   */
  async collectData(data: {
    cardPlayed: Node;
    cardPlayerId: number;
  }): Promise<null> {

    const chooseCard = new ChooseCard()
    chooseCard.flavorText = this.flavorText
    if (this.multiType) {
      chooseCard.multiType = true
      chooseCard.chooseTypes = this.chooseTypes
    } else {
      chooseCard.chooseType = this.chooseType;
    }

    const chooseData = await chooseCard.collectData({ cardPlayerId: data.cardPlayerId }) as EffectTarget
    this.cardChosen = chooseData.effectTargetCard
    await WrapperProvider.decisionMarkerWrapper.out.showDecision(WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node), this.cardChosen, true)

    return null
  }

  getEffectByNumberRolled(numberRolled: number, cardPlayed: Node) {
    const cardEffectComp = cardPlayed.getComponent(CardEffect)!;
    let chosenEffect: Effect | null = null;
    for (let i = 0; i < this.effectsAndNumbers.length; i++) {
      const eAn = this.effectsAndNumbers[i];
      const index = eAn.numbers.find((number) => { if (number == numberRolled) { return true } })
      if (index != null) {
        chosenEffect = eAn.effect

        break;
      }

    }
    if (!chosenEffect) {
      log(this.effectsAndNumbers.map(ean => ean.effect!.name + "" + ean.numbers))
      throw new Error(`No effect was chosen with the number rolled ${numberRolled}`)
    }
    log(chosenEffect.name)
    return chosenEffect;

  }

  onLoad() {
    const cardEffectComp = this.node.getComponent(CardEffect)!
    this.effectsAndNumbers.forEach(ean => ean.effect = cardEffectComp.getEffect(ean.effectIdFinal))
  }
}

import { ITEM_TYPE } from "../../Constants";
import EffectsAndNumbers from "../../EffectsAndNumbers";
import CardEffect from "../../Entites/CardEffect";
import DecisionMarker from "../../Entites/Decision Marker";
import Card from "../../Entites/GameEntities/Card";
import Stack from "../../Entites/Stack";
import PlayerManager from "../../Managers/PlayerManager";
import { createNewEffect } from "../../reset";
import RollDiceStackEffect from "../../StackEffects/Roll DIce";
import Effect from "../CardEffects/Effect";
import Cost from "../Costs/Cost";
import DataCollector from "../DataCollector/DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiEffectRoll extends DataCollector {
  collectorName = "MultiEffectRoll";

  @property(Cost)
  cost: Cost = null

  @property({ type: cc.Enum(ITEM_TYPE) })
  effectsType: ITEM_TYPE = ITEM_TYPE.ACTIVE;

  @property({ type: [EffectsAndNumbers], multiline: true })
  effectsAndNumbers: EffectsAndNumbers[] = [];

  setWithOld(data: MultiEffectRoll) {
    const oldEffectsAndNumbers = data.effectsAndNumbers;
    oldEffectsAndNumbers.forEach(effect => {
      if (effect.effect.hasBeenHandled) {
        effect.effectId.id = effect.effect.EffectId
        effect.effectId.name = effect.effect.effectName
      } else {
        const newId = createNewEffect(effect.effect, this.node, true)
        effect.effectId.id = newId
        effect.effectId.name = effect.effect.effectName
      }
      effect.effect = null
    });
  }

  /**
   *
   * @param data {cardPlayed}
   */
  async collectData(data: {
    cardPlayed: cc.Node;
    cardPlayerId: number;
  }): Promise<Effect> {
    const card = data.cardPlayed;
    const player = PlayerManager.getPlayerById(data.cardPlayerId)
    const currentStackEffect = Stack.getCurrentResolvingStackEffect()
    const diceRoll = new RollDiceStackEffect(player.character.getComponent(Card)._cardId, currentStackEffect)
    // let diceRoll = new RollDice();
    await Stack.addToStack(diceRoll, true)
    const numberRolled = currentStackEffect.LockingResolve;
    // let numberRolled = await diceRoll.collectData({ cardPlayerId: data.cardPlayerId, cardId: player.dice.diceId });
    const cardEffectComp = card.getComponent(CardEffect);

    let chosenEffect: Effect = null;
    for (let i = 0; i < this.effectsAndNumbers.length; i++) {
      const eAn = this.effectsAndNumbers[i];
      const index = eAn.numbers.find((number) => { if (number == numberRolled) { return true } })
      if (index != null) {
        chosenEffect = eAn.effect

        break;
      }

    }
    cc.log(chosenEffect)
    await DecisionMarker.$.showEffectChosen(Card.getCardNodeByChild(this.node), chosenEffect)
    cc.log(chosenEffect.name)
    return chosenEffect;
  }

  getEffectByNumberRolled(numberRolled: number, cardPlayed: cc.Node) {
    const cardEffectComp = cardPlayed.getComponent(CardEffect);
    let chosenEffect: Effect = null;
    for (let i = 0; i < this.effectsAndNumbers.length; i++) {
      const eAn = this.effectsAndNumbers[i];
      const index = eAn.numbers.find((number) => { if (number == numberRolled) { return true } })
      if (index != null) {
        chosenEffect = eAn.effect

        break;
      }

    }
    if (!chosenEffect) {
      cc.log(this.effectsAndNumbers.map(ean => ean.effect.name + "" + ean.numbers))
      throw new Error(`No effect was chosen with the number rolled ${numberRolled}`)
    }
    cc.log(chosenEffect.name)
    return chosenEffect;

  }
}

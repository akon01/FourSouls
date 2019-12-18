import { ITEM_TYPE } from "../../Constants";
import EffectsAndNumbers from "../../EffectsAndNumbers";
import CardEffect from "../../Entites/CardEffect";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import Effect from "../CardEffects/Effect";
import DataCollector from "../DataCollector/DataCollector";
import RollDice from "../RollDice";
import RollDiceStackEffect from "../../StackEffects/Roll DIce";
import Card from "../../Entites/GameEntities/Card";
import Stack from "../../Entites/Stack";




const { ccclass, property } = cc._decorator;



@ccclass
export default class MultiEffectRoll extends DataCollector {
  collectorName = "MultiEffectRoll";

  @property({ type: cc.Enum(ITEM_TYPE) })
  effectsType: ITEM_TYPE = ITEM_TYPE.ACTIVE;

  @property({ type: [EffectsAndNumbers], multiline: true })
  effectsAndNumbers: EffectsAndNumbers[] = [];

  /**
   *
   * @param data {cardPlayed}
   */
  async collectData(data: {
    cardPlayed: cc.Node;
    cardPlayerId: number;
  }): Promise<Effect> {
    let card = data.cardPlayed;
    let player = PlayerManager.getPlayerById(data.cardPlayerId)
    let currentStackEffect = Stack.getCurrentResolvingStackEffect()
    let diceRoll = new RollDiceStackEffect(player.character.getComponent(Card)._cardId, currentStackEffect)
    // let diceRoll = new RollDice();
    await Stack.addToStack(diceRoll, true)
    let numberRolled = currentStackEffect.LockingResolve;
    // let numberRolled = await diceRoll.collectData({ cardPlayerId: data.cardPlayerId, cardId: player.dice.diceId });
    let cardEffectComp = card.getComponent(CardEffect);
    let effects: cc.Node[] = [];
    effects = effects.concat(cardEffectComp.activeEffects, cardEffectComp.paidEffects, cardEffectComp.passiveEffects)
    let chosenEffect: Effect = null;
    for (let i = 0; i < this.effectsAndNumbers.length; i++) {
      const eAn = this.effectsAndNumbers[i];
      let index = eAn.numbers.find((number) => { if (number == numberRolled) return true })
      if (index != null) {
        chosenEffect = eAn.effect

        break;
      }

    }
    cc.log(chosenEffect.name)
    return chosenEffect;
  }



  getEffectByNumberRolled(numberRolled: number, cardPlayed: cc.Node) {
    let cardEffectComp = cardPlayed.getComponent(CardEffect);
    let effects: cc.Node[] = [];
    effects = effects.concat(cardEffectComp.activeEffects, cardEffectComp.paidEffects, cardEffectComp.passiveEffects)
    let chosenEffect: Effect = null;
    for (let i = 0; i < this.effectsAndNumbers.length; i++) {
      const eAn = this.effectsAndNumbers[i];
      let index = eAn.numbers.find((number) => { if (number == numberRolled) return true })
      if (index != null) {
        chosenEffect = eAn.effect

        break;
      }

    }
    if (!chosenEffect) {
      cc.log(this.effectsAndNumbers.map(ean => ean.effect.name + '' + ean.numbers))
      throw new Error(`No effect was chosen with the number rolled ${numberRolled}`)
    }
    cc.log(chosenEffect.name)
    return chosenEffect;

  }
}

import { Enum, log, Node, _decorator } from 'cc';
import { ITEM_TYPE } from "../../Constants";
import { EffectsAndNumbers } from "../../EffectsAndNumbers";
import { CardEffect } from "../../Entites/CardEffect";
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { RollDiceStackEffect } from "../../StackEffects/RollDIce";
import { Effect } from "../CardEffects/Effect";
import { Cost } from "../Costs/Cost";
import { DataCollector } from "../DataCollector/DataCollector";
const { ccclass, property } = _decorator;


@ccclass('MultiEffectRoll')
export class MultiEffectRoll extends DataCollector {
  collectorName = "MultiEffectRoll";

  @property(Cost)
  cost: Cost | null = null

  @property({ type: Enum(ITEM_TYPE) })
  effectsType: ITEM_TYPE = ITEM_TYPE.ACTIVE;

  @property({ type: [EffectsAndNumbers], multiline: true })
  effectsAndNumbers: EffectsAndNumbers[] = [];


  /**
   *
   * @param data {cardPlayed}
   */
  async collectData(data: {
    cardPlayed: Node;
    cardPlayerId: number;
  }): Promise<Effect> {
    const card = data.cardPlayed;
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardPlayerId)!
    const currentStackEffect = WrapperProvider.stackWrapper.out.getCurrentResolvingStackEffect()!
    const diceRoll = new RollDiceStackEffect(player.character!.getComponent(Card)!._cardId, currentStackEffect)
    // let diceRoll = new RollDice();
    await WrapperProvider.stackWrapper.out.addToStack(diceRoll, true)
    const numberRolled = currentStackEffect.LockingResolve;
    // let numberRolled = await diceRoll.collectData({ cardPlayerId: data.cardPlayerId, cardId: player.dice.diceId });
    const cardEffectComp = card.getComponent(CardEffect);

    let chosenEffect: Effect | null = null;
    for (let i = 0; i < this.effectsAndNumbers.length; i++) {
      const eAn = this.effectsAndNumbers[i];
      const index = eAn.numbers.find((number) => { if (number == numberRolled) { return true } })
      if (index != null) {
        chosenEffect = eAn.effect

        break;
      }

    }
    log(chosenEffect)
    if (!chosenEffect) { debugger; throw new Error("no chosen Effect") }
    await WrapperProvider.decisionMarkerWrapper.out.showEffectChosen(WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node), chosenEffect)
    log(chosenEffect.name)
    return chosenEffect;
  }

  getEffectByNumberRolled(numberRolled: number, cardPlayed: Node) {
    const cardEffectComp = cardPlayed.getComponent(CardEffect);
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

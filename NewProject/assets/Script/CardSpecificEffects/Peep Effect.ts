import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import Monster from "../Entites/CardTypes/Monster";
import Deck from "../Entites/GameEntities/Deck";
import Player from "../Entites/GameEntities/Player";
import MonsterField from "../Entites/MonsterField";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import { ActiveEffectData, PassiveEffectData } from "../Managers/DataInterpreter";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PeepEffect extends Effect {
  effectName = "PeepEffect";


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData | ActiveEffectData
  ) {
    const monsterDeck = CardManager.monsterDeck.getComponent(Deck);

    const peep = monsterDeck.getCards().filter((card) => { card.name == "The Bloat" })[0]
    if (!peep) {
      throw new Error("The Bloat is not in the deck")
    } else {
      await MonsterField.givePlayerChoiceToCoverPlace(peep.getComponent(Monster), TurnsManager.getCurrentTurn().getTurnPlayer())
    }
    monsterDeck.shuffleDeck()


    if (data instanceof PassiveEffectData) return data
    return Stack._currentStack
  }
}

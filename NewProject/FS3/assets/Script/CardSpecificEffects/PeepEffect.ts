import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { DataCollector } from "../CardEffectComponents/DataCollector/DataCollector";
import { Monster } from "../Entites/CardTypes/Monster";
import { Deck } from "../Entites/GameEntities/Deck";
import { Player } from "../Entites/GameEntities/Player";
import { MonsterField } from "../Entites/MonsterField";
import { Stack } from "../Entites/Stack";
import { CardManager } from "../Managers/CardManager";
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { PlayerManager } from "../Managers/PlayerManager";
import { TurnsManager } from "../Managers/TurnsManager";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { WrapperProvider } from '../Managers/WrapperProvider';

@ccclass('PeepEffect')
export class PeepEffect extends Effect {
  effectName = "PeepEffect";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData | ActiveEffectData
  ) {
    const monsterDeck = WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!;
    const peep = monsterDeck.getCards().filter((card) => { card.name == "The Bloat" })[0]
    if (!peep) {
      throw new Error("The Bloat is not in the deck")
    } else {
      await WrapperProvider.monsterFieldWrapper.out.givePlayerChoiceToCoverPlace(peep.getComponent(Monster)!, WrapperProvider.turnsManagerWrapper.out.getCurrentTurn()!.getTurnPlayer()!)
    }
    monsterDeck.shuffleDeck()
    if (data instanceof PassiveEffectData) return data
    return WrapperProvider.stackWrapper.out._currentStack
  }
}

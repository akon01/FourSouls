import { _decorator } from 'cc';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { Monster } from "../Entites/CardTypes/Monster";
import { Deck } from "../Entites/GameEntities/Deck";
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { WrapperProvider } from '../Managers/WrapperProvider';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
const { ccclass, property } = _decorator;


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

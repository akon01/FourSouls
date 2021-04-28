import { Node, _decorator } from 'cc';
import { Signal } from '../../../Misc/Signal';
import { TARGETTYPE } from "../../Constants";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Deck } from '../../Entites/GameEntities/Deck';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('MarkDeckAsDrawFromPileInsted')
export class MarkDeckAsDrawFromPileInsted extends Effect {
      effectName = "MarkDeckAsDrawFromPileInsted";


      @property
      markAsTrue = true

      /**
       *
       * @param data {target:PlayerId}
       */
      async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

            if (!data) throw new Error("No Data Collected");
            const deckToMark = data.getTarget(TARGETTYPE.DECK) as Node | null
            if (!deckToMark) {
                  throw new CardEffectTargetError(`No Deck To Mark As Draw From Pile Found`, true, data, stack)
            }
            const deckComp = deckToMark.getComponent(Deck)!;
            deckComp._isDrawFromPileInsted = true

            WrapperProvider.serverClientWrapper.out.send(Signal.MARK_DECK_AS_DRAW_FROM_PILE_INSTED, { markAsTrue: this.markAsTrue, deckType: deckComp.deckType })


            if (data instanceof PassiveEffectData) return data
            return WrapperProvider.stackWrapper.out._currentStack
      }
}

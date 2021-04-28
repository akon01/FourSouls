import { Node, _decorator } from 'cc';
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";

const { ccclass, property } = _decorator;


@ccclass('DiscardFromPlace')
export class DiscardFromPlace extends Effect {
  chooseType = CHOOSE_CARD_TYPE.DECKS;
  effectName = "DiscardFromPlace";
  //@printMethodStarted(COLORS.RED)
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const targetsToDiscard = data.getTargets(TARGETTYPE.CARD) as Node[]
    if (targetsToDiscard.length == 0) {
      throw new CardEffectTargetError(`target cards to discard is null`, true, data, stack)
    }
    for (const target of targetsToDiscard) {
      const monsterComp = target.getComponent(Monster);
      if (monsterComp != null && monsterComp.monsterPlace != null) {
        await monsterComp.monsterPlace.discardTopMonster(true)
        continue
      }
      if (WrapperProvider.storeWrapper.out.getStoreCards().indexOf(target) >= 0) {
        await WrapperProvider.storeWrapper.out.discardStoreCard(target, true)
        continue
      }
    }
    if (data instanceof PassiveEffectData) {
      return data;
    } else { return stack }
  }
}

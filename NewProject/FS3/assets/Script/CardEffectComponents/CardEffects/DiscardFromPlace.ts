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
  currTargets: Node[] = [];
  currData: ActiveEffectData | PassiveEffectData | null = null;
  currStack: StackEffectInterface[] = [];
  //@printMethodStarted(COLORS.RED)
  doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const targetsToDiscard = data.getTargets(TARGETTYPE.CARD) as Node[]
    if (targetsToDiscard.length == 0) {
      throw new CardEffectTargetError(`target cards to discard is null`, true, data, stack)
    }
    const index = 0;
    this.currData = data;
    this.currTargets = targetsToDiscard
    this.currStack = stack
    return this.handleTarget(index, this.currTargets.length)
  }

  private handleTarget(index: number, length: number): Promise<PassiveEffectData | StackEffectInterface[]> {
    const target = this.currTargets[index]
    const monsterComp = target.getComponent(Monster);
    if (monsterComp != null && monsterComp.monsterPlace != null) {
      return monsterComp.monsterPlace.discardTopMonster(true).then(_ => {
        return this.handleAfterTarget(index++, length, this.handleTarget, this)
      })

    } else if (WrapperProvider.storeWrapper.out.getStoreCards().indexOf(target) >= 0) {
      return WrapperProvider.storeWrapper.out.discardStoreCard(target, true).then(_ => {
        return this.handleAfterTarget(index++, length, this.handleTarget, this)
      })
    }
    return this.handleAfterTarget(index++, length, this.handleTarget, this)
  }

}

import { _decorator } from 'cc';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { PreCondition } from "./PreCondition";
const { ccclass, property } = _decorator;


@ccclass('ThisCardIsInDiscard')
export class ThisCardIsInDiscard extends PreCondition {

  testCondition(meta: any) {
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    let answer = true
    const pile = WrapperProvider.pileManagerWrapper.out.getPileByCard(thisCard);
    const lootPlayPile = WrapperProvider.pileManagerWrapper.out.lootPlayPile
    if (pile == null || pile === lootPlayPile) {
      answer = false
    }

    return answer
  }
}

import { Node, _decorator } from 'cc';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('DiscardAndDrawLoot')
export class DiscardAndDrawLoot extends Effect {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;
  effectName = "DiscardAndDrawLoot";

  currData: ActiveEffectData | PassiveEffectData | null = null;
  currTargets: StackEffectInterface[] | Node[] | number[] | Effect[] = [];
  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */


  doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const cardChosen = data.getTargets(TARGETTYPE.CARD)
    console.log(cardChosen)
    if (cardChosen.length == 0) {
      throw new CardEffectTargetError(`target cards to discard are null`, true, data, stack)
      //console.log(`target card is null`)
    } else {
      this.currData = data;
      this.currTargets = cardChosen
      const index = 0;
      return this.handleTarget(index, this.currTargets.length)
    }
  }

  private handleTarget(index: number, length: number): Promise<PassiveEffectData | StackEffectInterface[]> {
    const cardChosen = this.currTargets[index] as Node
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(cardChosen)!
    // player.playLootCard(cardPlayed, true);
    return player.discardLoot(cardChosen, true).then(_ => {
      return player.drawCards(WrapperProvider.cardManagerWrapper.out.lootDeck, true).then(_ => {
        return this.handleAfterTarget(index++, length)
      });
    });


  }
  handleAfterTarget(index: number, length: number): Promise<PassiveEffectData | StackEffectInterface[]> {
    if (index < length) {
      return this.handleTarget(index, length)
    }
    return this.handleReturnValues()
  }
  handleReturnValues(): Promise<PassiveEffectData | StackEffectInterface[]> {
    if (this.currData instanceof PassiveEffectData) { return Promise.resolve(this.currData) }
    return Promise.resolve(WrapperProvider.stackWrapper.out._currentStack)
  }
}

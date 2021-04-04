import { log, Node, _decorator } from 'cc';
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "../../Constants";
import { Card } from '../../Entites/GameEntities/Card';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { RollDiceStackEffect } from "../../StackEffects/RollDIce";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
import { IHasSavedRoll } from './UseSavedRoll';
const { ccclass, property } = _decorator;


@ccclass('RollDiceAndSaveForLater')
export class RollDiceAndSaveForLater extends Effect implements IHasSavedRoll {
  chooseType = CHOOSE_CARD_TYPE.MY_HAND;
  effectName = "RollDiceAndSaveForLater";

  private rolledNumber = -1;

  private hasBeenRolled = false

  getRolledNumber() {
    if (!this.hasBeenRolled) {
      throw new Error("Tring to get rolled dice when not available");
    }
    return this.rolledNumber;
  }

  /**
   *
   * @param data {lootPlayedId:number,playerId:number}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    console.log(data)
    if (!data) { debugger; throw new Error("No Data"); }
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard((data.getTarget(TARGETTYPE.PLAYER) as Node))
    if (!player) {
      throw new Error("No Player To Roll Dice!");
    }

    const currentStackEffect = WrapperProvider.stackWrapper.out.getCurrentResolvingStackEffect()!
    const diceRoll = new RollDiceStackEffect(player.character!.getComponent(Card)!._cardId, currentStackEffect)
    // let diceRoll = new RollDice();
    await WrapperProvider.stackWrapper.out.addToStack(diceRoll, true)
    const numberRolled = currentStackEffect.LockingResolve;
    this.hasBeenRolled = true
    this.rolledNumber = numberRolled

    if (data instanceof PassiveEffectData) return data
    return WrapperProvider.stackWrapper.out._currentStack
  }
}
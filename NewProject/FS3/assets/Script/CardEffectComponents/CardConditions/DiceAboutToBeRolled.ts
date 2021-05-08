import { CCInteger, log, _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('DiceAboutToBeRolled')
export class DiceAboutToBeRolled extends Condition {
  event = PASSIVE_EVENTS.DICE_ABOUT_TO_BE_ROLLED
  needsDataCollector = false

  @property
  isOwnerOnly = false;


  // @property({ type: DataCollector, tooltip: 'Only Put If Not In "Add Passive Effect" Active effect' })
  // dataCollector: DataCollector = null

  testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No MethodScope"); }
    if (!meta.args) { debugger; throw new Error("No Args"); }
    const player: Player = meta.methodScope.getComponent(Player)!;
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const numberRolled = meta.args[0]
    let answer = true;
    // let playerName = WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(this.conditionData.cardChosenId).name;
    if (this.isOwnerOnly) {
      if (WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard) != player) {
        answer = false;
      }
    }
    return Promise.resolve(answer);
  }
}

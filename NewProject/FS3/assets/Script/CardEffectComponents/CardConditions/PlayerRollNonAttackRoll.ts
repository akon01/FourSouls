import { CCInteger, log, _decorator } from 'cc';
import { PASSIVE_EVENTS, ROLL_TYPE } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('PlayerRollNonAttackRoll')
export class PlayerRollNonAttackRoll extends Condition {
  event = PASSIVE_EVENTS.PLAYER_ROLL_DICE
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
    const rollType = meta.args[1] as ROLL_TYPE
    let answer = true;
    // let playerName = WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(this.conditionData.cardChosenId).name;
    if (!(player instanceof Player)) {
      answer = false
    }
    if (!(rollType == ROLL_TYPE.EFFECT || rollType == ROLL_TYPE.EFFECT_ROLL)) {
      answer = false
    }
    if (this.isOwnerOnly) {
      if (WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard) != player) {
        answer = false;
      }
    }
    console.log(`answer is ${answer}`)
    return Promise.resolve(answer);
  }
}

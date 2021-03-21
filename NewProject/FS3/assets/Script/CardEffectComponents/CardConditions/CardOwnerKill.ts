import { _decorator } from 'cc';
const { ccclass } = _decorator;

import { PASSIVE_EVENTS } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { Condition } from "./Condition";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('CardOwnerKill')
export class CardOwnerKill extends Condition {
  //  event = PASSIVE_EVENTS.PLAYER_COMBAT_DAMAGE_GIVEN
  events = [PASSIVE_EVENTS.PLAYER_PAY_DEATH_PANELTIES, PASSIVE_EVENTS.MONSTER_IS_KILLED]
  needsDataCollector = false;

  async testCondition(meta: PassiveMeta) {
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
    const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;
    if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }
    switch (meta.passiveEvent) {
      case PASSIVE_EVENTS.PLAYER_PAY_DEATH_PANELTIES:
        const killedPlayer: Player = meta.methodScope.getComponent(Player)!;
        if (killedPlayer instanceof Player &&
          killedPlayer._thisTurnKiller == cardOwner.character
        ) {
          return true
        } else { return false }

      case PASSIVE_EVENTS.MONSTER_IS_KILLED:
        const killedMonster: Monster = meta.methodScope.getComponent(Monster)!;
        if (killedMonster instanceof Monster &&
          killedMonster._thisTurnKiller == cardOwner.character
        ) {
          return true
        } else { return false }
      default:
        return false
        break;
    }
  }
}

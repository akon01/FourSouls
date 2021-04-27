import { Node, _decorator } from 'cc';
import { PASSIVE_EVENTS } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Condition } from "./Condition";
const { ccclass, property } = _decorator;


@ccclass('AtSpecificHP')
export class AtSpecificHP extends Condition {
  events = [PASSIVE_EVENTS.PLAYER_GET_HIT, PASSIVE_EVENTS.MONSTER_GET_HIT]
  @property
  specificHp = 0;
  @property
  isOrBelowHp = false;
  isActive = false;
  @property
  isOwnerOnly = true


  async testCondition(meta: PassiveMeta) {
    if (!meta.methodScope) { debugger; throw new Error("No Scope!"); }

    const subject = meta.methodScope;

    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)!
    const playerOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!
    let cardOwner: Node | null = null;
    if (playerOwner) {
      cardOwner = playerOwner.node
    } else {
      cardOwner = thisCard;
    }

    let subjectComp: Monster | Player | null = null;
    let currnetHpValue = -1
    if (meta.passiveEvent == PASSIVE_EVENTS.MONSTER_GET_HIT) {
      subjectComp = subject.getComponent(Monster)!
      currnetHpValue = subjectComp.currentHp
    } else if (PASSIVE_EVENTS.PLAYER_GET_HIT) {
      subjectComp = subject.getComponent(Player)!
      currnetHpValue = subjectComp._Hp
    }

    if ((currnetHpValue == this.specificHp || (this.isOrBelowHp && currnetHpValue <= this.specificHp)) && !this.isActive) {
      if (this.isOwnerOnly) {
        if (cardOwner == subjectComp!.node) {
          this.isActive = true;
          return true
        }
      } else {
        this.isActive = true;
        return true
      }
    }

    return false;

  }
}
import { PASSIVE_EVENTS } from "../../Constants";
import Monster from "../../Entites/CardTypes/Monster";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Effect from "../CardEffects/Effect";
import Condition from "./Condition";
import Card from "../../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AtSpecificHp extends Condition {

  events = [PASSIVE_EVENTS.PLAYER_GET_HIT, PASSIVE_EVENTS.MONSTER_GET_HIT]

  @property
  specificHp: number = 0;

  @property
  isOrBelowHp: boolean = false;

  @property(Effect)
  myEffect: Effect = null;


  isActive: boolean = false;

  @property
  isOwnerOnly: boolean = true

  async testCondition(meta: PassiveMeta) {
    const subject = meta.methodScope;

    const thisCard = Card.getCardNodeByChild(this.node)
    const playerOwner = PlayerManager.getPlayerByCard(thisCard)
    let cardOwner: cc.Node = null;
    if (playerOwner) {
      cardOwner = playerOwner.node
    } else {
      cardOwner = thisCard;
    }

    let subjectComp: Monster | Player;
    let currnetHpValue: number
    let ownerName: string
    if (meta.passiveEvent == PASSIVE_EVENTS.MONSTER_GET_HIT) {
      subjectComp = subject.getComponent(Monster)
      currnetHpValue = subjectComp.currentHp
      ownerName = cardOwner.getComponent(Monster).name.split('<')[0]
    } else if (PASSIVE_EVENTS.PLAYER_GET_HIT) {
      subjectComp = subject.getComponent(Player)
      currnetHpValue = subjectComp._Hp
      ownerName = cardOwner.getComponent(Player).name.split('<')[0]
    }

    if ((currnetHpValue == this.specificHp || (this.isOrBelowHp && currnetHpValue <= this.specificHp)) && !this.isActive) {
      if (this.isOwnerOnly) {
        if (ownerName == subjectComp.name.split('<')[0]) {
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

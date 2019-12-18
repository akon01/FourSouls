import { PASSIVE_EVENTS } from "../../Constants";
import Monster from "../../Entites/CardTypes/Monster";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Effect from "../CardEffects/Effect";
import Condition from "./Condition";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AtSpecificHp extends Condition {

  event = PASSIVE_EVENTS.PLAYER_GET_HIT

  @property
  specificHp: number = 0;

  @property(Effect)
  myEffect: Effect = null;

  isActive: boolean = false;

  async testCondition(meta: PassiveMeta) {
    const subject = meta.methodScope;

    const thisCard = this.node.parent.parent;

    let cardOwner: any = PlayerManager.getPlayerByCard(thisCard);
    if (cardOwner == null) {
      cardOwner = thisCard;
    }

    const subjectName: string = subject.name
    const nameArray = subjectName.split("<")
    if (subject.getComponent(Monster) != null && nameArray[0] == cardOwner.name && meta.passiveEvent == PASSIVE_EVENTS.MONSTER_GET_HIT) {
      if (subject.getComponent(Monster).currentHp == this.specificHp) {
        this.isActive = true
        return true;
      } else if (this.isActive) {
        this.myEffect.reverseEffect()
      }
    } else if (
      subject.getComponent(Player) != null &&
      subject.name == cardOwner.name
      //&&  meta.passiveEvent == PASSIVE_EVENTS.PLAYER_GET_HIT
    ) {
      if (subject.getComponent(Player)._Hp == this.specificHp) {
        this.isActive = true
        return true;
      } else if (this.isActive) {
        this.myEffect.reverseEffect()
      }
    } else {
      return false;
    }
  }
}

import ConditionInterface from "./ConditionInterface";
import Condition from "./Condition";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import Monster from "../../Entites/CardTypes/Monster";
import CardManager from "../../Managers/CardManager";
import Effect from "../CardEffects/Effect";
import { PassiveMeta } from "../../Managers/PassiveManager";
import { PASSIVE_EVENTS } from "../../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AtSpecificHp extends Condition {

  @property
  specificHp: number = 0;

  @property(Effect)
  myEffect: Effect = null;

  isActive: boolean = false;

  async testCondition(meta: PassiveMeta) {
    let subject = meta.methodScope;;
    cc.log(`subject is ${subject.name}`)
    let thisCard = this.node.parent.parent;
    cc.log(`this card is ${thisCard.name}`)
    let cardOwner: any = PlayerManager.getPlayerByCard(thisCard);
    if (cardOwner == null) {
      cardOwner = thisCard;
    }
    cc.log(`card owner is ${cardOwner.name}`)
    let subjectName: string = subject.name
    let nameArray = subjectName.split('<')
    if (subject.getComponent(Monster) != null && nameArray[0] == cardOwner.name && meta.passiveEvent == PASSIVE_EVENTS.MONSTER_GET_HIT) {
      if (subject.getComponent(Monster).currentHp == this.specificHp) {
        this.isActive = true
        return true;
      } else if (this.isActive) {
        this.myEffect.reverseEffect()
      }
    } else if (
      subject.getComponent(Player) != null &&
      subject.name == cardOwner.name &&
      meta.passiveEvent == PASSIVE_EVENTS.PLAYER_GET_HIT
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

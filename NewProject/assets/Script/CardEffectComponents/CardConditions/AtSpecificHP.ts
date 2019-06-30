import ConditionInterface from "./ConditionInterface";
import Condition from "./Condition";
import Player from "../../Entites/GameEntities/Player";
import PlayerManager from "../../Managers/PlayerManager";
import Monster from "../../Entites/CardTypes/Monster";
import CardManager from "../../Managers/CardManager";
import Effect from "../CardEffects/Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AtSpecificHp extends Condition {

  @property
  specificHp: number = 0;

  @property(Effect)
  myEffect: Effect = null;

  isActive: boolean = false;

  testCondition(meta: any) {

    let subject = meta.scope;;
    let thisCard = this.node.parent.parent;
    let cardOwner: any = PlayerManager.getPlayerByCard(thisCard);
    if (cardOwner == null) {
      cardOwner = thisCard;
    }
    let subjectName: string = subject.name
    let nameArray = subjectName.split('<')




    if (subject instanceof Monster && nameArray[0] == cardOwner.name && meta.key == 'getDamaged') {
      if (subject.currentHp == this.specificHp) {

        this.isActive = true
        return true;
      } else if (this.isActive) {
        this.myEffect.reverseEffect()
      }

    } else if (
      subject instanceof Player &&
      subject.name == cardOwner.name &&
      meta.key == "getHit"
    ) {
      if (subject.Hp == this.specificHp) {

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

import { ServerEffect } from "./../../Entites/ServerCardEffect";

import EffectInterface from "./EffectInterface";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE, PASSIVE_TYPE } from "../../Constants";
import Condition from "../CardConditions/Condition";
import PreCondition from "../PreConditions/PreCondition";
import Cost from "../Costs/Cost";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/NewScript";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PassiveEffect extends Effect {


  /**
   *
   * @param data {target:Player}
   */
  async doEffect(serverEffectStack: ServerEffect[], data: PassiveEffectData) {
    return data;
  }

  reverseEffect() {

  }

  onLoad() {
    this._effectCard = this.node.parent;
  }

  // toString() {
  //   return `${this.hasSubAction},${this.passiveType},${this.passiveEffectToAdd.toString()},${this.effectName}.${this.chooseType}`
  // }
}

import { ServerEffect } from "./../../Entites/ServerCardEffect";

import EffectInterface from "./EffectInterface";
import DataCollector from "../DataCollector/DataCollector";
import { CHOOSE_TYPE, PASSIVE_TYPE } from "../../Constants";
import Condition from "../CardConditions/Condition";
import PreCondition from "../PreConditions/PreCondition";
import Cost from "../Costs/Cost";
import { ActiveEffectData } from "../../Managers/DataInterpreter";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Effect extends cc.Component implements EffectInterface {


  effectData: ActiveEffectData = null;

  @property(Cost)
  cost: Cost = null;

  @property(PreCondition)
  preCondition: PreCondition = null;

  hasSubAction: boolean = false;
  @property(Condition)
  condition: Condition = null;

  @property({ type: cc.Enum(PASSIVE_TYPE) })
  passiveType: PASSIVE_TYPE = 1;

  @property(Effect)
  passiveEffectToAdd: Effect = null;

  effectName: string = null;

  chooseType: CHOOSE_TYPE = null;

  @property([DataCollector])
  dataCollector: DataCollector[] = [];

  @property
  _effectCard: cc.Node = null;

  /**
   *
   * @param data {target:Player}
   */
  async doEffect(serverEffectStack: ServerEffect[], data?) {
    return null;
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

import { CHOOSE_CARD_TYPE, ITEM_TYPE, PASSIVE_TYPE } from "../../Constants";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Condition from "../CardConditions/Condition";
import Cost from "../Costs/Cost";
import DataCollector from "../DataCollector/DataCollector";
import EffectDataConcurencyBase from "../EffectDataConcurency/EffectDataConcurencyBase";
import IEffectDataConcurency from "../EffectDataConcurency/IEffectDataConcurency";
import PreCondition from "../PreConditions/PreCondition";
import EffectInterface from "./EffectInterface";



const { ccclass, property } = cc._decorator;

@ccclass
export default class Effect extends cc.Component implements EffectInterface {

  @property
  isSilent: boolean = false;

  effectData: ActiveEffectData | PassiveEffectData = null;

  @property(Cost)
  cost: Cost = null;

  @property(PreCondition)
  preCondition: PreCondition = null;

  hasSubAction: boolean = false;

  @property({ type: [Condition] })
  conditions: Condition[] = [];

  @property({ type: cc.Enum(PASSIVE_TYPE) })
  passiveType: PASSIVE_TYPE = 1;

  @property(Effect)
  passiveEffectToAdd: Effect = null;

  effectName: string = null;

  chooseType: CHOOSE_CARD_TYPE = null;

  @property([DataCollector])
  dataCollector: DataCollector[] = [];

  @property
  _effectCard: cc.Node = null;

  @property
  optionalAfterDataCollection: boolean = false;

  @property
  optionalBeforeDataCollection: boolean = false;

  @property
  hasPlayerChoiceToActivateInChainEffects: boolean = false;

  @property
  hasLockingResolve: boolean = false;

  lockingResolve = 0;

  @property
  hasDataConcurency: boolean = false;

  @property({
    visible: function (this: Effect) {
      return this.hasDataConcurency
    }, type: EffectDataConcurencyBase
  })
  dataConcurencyComponent: IEffectDataConcurency = null


  @property
  optionalFlavorText: string = ''
  /**
   *
   * @param data {target:Player}
   */
  async doEffect(Stack: StackEffectInterface[], data?) {
    return null;
  }

  reverseEffect() {

  }

  runDataConcurency(effectData: ActiveEffectData | PassiveEffectData, numOfEffect: number, type: ITEM_TYPE, sendToServer: boolean) {
    this.dataConcurencyComponent.runDataConcurency(effectData, numOfEffect, type, sendToServer)
  }

  onLoad() {
    this._effectCard = this.node.parent;
  }

  // toString() {
  //   return `${this.hasSubAction},${this.passiveType},${this.passiveEffectToAdd.toString()},${this.effectName}.${this.chooseType}`
  // }
}

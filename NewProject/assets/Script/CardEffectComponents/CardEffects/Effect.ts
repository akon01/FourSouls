import { CHOOSE_CARD_TYPE, ITEM_TYPE, PASSIVE_TYPE } from "../../Constants";
import EffectPosition from "../../EffectPosition";
import CardEffect from "../../Entites/CardEffect";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Condition from "../CardConditions/Condition";
import Cost from "../Costs/Cost";
import DataCollector from "../DataCollector/DataCollector";
import EffectDataConcurencyBase from "../EffectDataConcurency/EffectDataConcurencyBase";
import IEffectDataConcurency from "../EffectDataConcurency/IEffectDataConcurency";
import IdAndName from "../IdAndNameComponent";
import PreCondition from "../PreConditions/PreCondition";
import EffectInterface from "./EffectInterface";



const { ccclass, property } = cc._decorator;

@ccclass
export default class Effect extends cc.Component implements EffectInterface {

  resetInEditor() {
    this.setEffectId();
  }
  setWithOld(oldEffect: Effect) {

  }

  hasBeenHandled: boolean = false

  @property({ type: EffectPosition })
  effectPosition: EffectPosition = new EffectPosition()

  @property
  EffectId: number = -1

  @property
  isSilent: boolean = false;

  effectData: ActiveEffectData | PassiveEffectData = null;

  @property(Cost)
  cost: Cost = null;

  @property({ type: IdAndName, multiline: true })
  costId: IdAndName = null

  getCost() {
    return this.node.getComponent(CardEffect).getCost(this.costId.id)
  }

  @property(PreCondition)
  preCondition: PreCondition = null;

  @property({ type: IdAndName, multiline: true })
  preConditionId: IdAndName = null;

  getPreCondition() {
    return this.node.getComponent(CardEffect).getPreCondtion(this.preConditionId.id)
  }

  hasSubAction: boolean = false;

  @property({ type: [Condition] })
  conditions: Condition[] = [];

  @property({ type: IdAndName, multiline: true })
  conditionsIds: IdAndName[] = []

  getConditions() {
    const cardEffectComp = this.node.getComponent(CardEffect);
    return this.conditionsIds.map(conditionId => cardEffectComp.getCondtion(conditionId.id))
  }

  @property({ type: cc.Enum(PASSIVE_TYPE) })
  passiveType: PASSIVE_TYPE = 1;

  @property(Effect)
  passiveEffectToAdd: Effect = null;

  @property({ type: IdAndName, multiline: true })
  passiveEffectToAddId: IdAndName = null

  getPassiveEffectToAdd() {
    return this.node.getComponent(CardEffect).getEffect(this.passiveEffectToAddId.id)
  }

  effectName: string = null;

  chooseType: CHOOSE_CARD_TYPE = null;

  @property([DataCollector])
  dataCollector: DataCollector[] = [];

  @property({ type: IdAndName, multiline: true })
  dataCollectorsIds: IdAndName[] = []

  getDataCollectors() {
    const cardEffectComp = this.node.getComponent(CardEffect);
    return this.dataCollectorsIds.map(dataCollectorId => cardEffectComp.getDataCollector(dataCollectorId.id))
  }


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
  dataConcurencyComponent: EffectDataConcurencyBase = null


  @property({
    visible: function (this: Effect) {
      return this.hasDataConcurency
    }, type: IdAndName
  })
  dataConcurencyComponentId: IdAndName = null


  @property
  optionalFlavorText: string = ''
  setEffectId() {
    if (this.node && this.EffectId == -1) {
      const comps = this.node.getComponents(Effect);
      this.EffectId = comps.findIndex(ed => ed == this);
    }
  }

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

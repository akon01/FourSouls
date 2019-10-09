import { COLLECTORTYPE, PASSIVE_META_COMPONENTS } from "../../Constants";
import { EffectTarget } from "../../Managers/DataInterpreter";
import PassiveManager, { PassiveMeta } from "../../Managers/PassiveManager";
import DataCollector from "./DataCollector";
import Player from "../../Entites/GameEntities/Player";


const { ccclass, property } = cc._decorator;

@ccclass
export default class GetTargetFromPassiveMeta extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "GetTargetFromPassiveMeta";

  metaIndex: number = null;
  isAfterActivation: boolean = null

  @property({ type: cc.Enum(PASSIVE_META_COMPONENTS) })
  passiveComponent: PASSIVE_META_COMPONENTS = 1

  @property({
    type: cc.Integer, visible: function (this: GetTargetFromPassiveMeta) {
      if (this.passiveComponent == 2) return true
    }
  })
  argsIndex = 0;


  /**
   *
   * @param data cardId:card id 
   * @returns {target:cc.node of the card that was played}
   */
  collectData(data) {

    let passiveMeta: PassiveMeta;
    let target: EffectTarget;
    cc.log(`this meta index ${this.metaIndex}`)
    if (!this.metaIndex) throw `no MetaIndex`
    this.isAfterActivation == true ? passiveMeta = PassiveManager.afterActivationMap.get(this.metaIndex) : passiveMeta = PassiveManager.beforeActivationMap.get(this.metaIndex)
    switch (this.passiveComponent) {
      case PASSIVE_META_COMPONENTS.SCOPE:
        if (passiveMeta.methodScope.getComponent(Player)) {
          passiveMeta.methodScope = passiveMeta.methodScope.getComponent(Player).character
        }
        target = new EffectTarget(passiveMeta.methodScope)
        break;
      case PASSIVE_META_COMPONENTS.ARGS:
        target = new EffectTarget(passiveMeta.args[this.argsIndex])
        break;
      case PASSIVE_META_COMPONENTS.RESULT:
        target = new EffectTarget(passiveMeta.result)
        break;
      default:
        break;
    }

    return target;
  }
}

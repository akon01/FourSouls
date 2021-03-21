import { CCInteger, Enum, log, _decorator } from 'cc';
import { COLLECTORTYPE, PASSIVE_META_COMPONENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { EffectTarget } from "../../Managers/EffectTarget";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { ActivatePassiveEffect } from "../../StackEffects/ActivatePassiveEffect";
import { DataCollector } from "./DataCollector";
const { ccclass, property } = _decorator;


@ccclass('GetTargetFromPassiveMeta')
export class GetTargetFromPassiveMeta extends DataCollector {
  type = COLLECTORTYPE.AUTO;
  collectorName = "GetTargetFromPassiveMeta";

  metaIndex: number | null = null;
  isAfterActivation: boolean | null = null

  @property({ type: Enum(PASSIVE_META_COMPONENTS) })
  passiveComponent: PASSIVE_META_COMPONENTS = 1

  @property({
    type: CCInteger, visible: function (this: GetTargetFromPassiveMeta) {
      return this.passiveComponent == 2
    }
  })
  argsIndex = 0;

  /**
   *
   * @param data cardId:card id
   * @returns {target:node of the card that was played}
   */
  collectData(data: any) {

    let passiveMeta: PassiveMeta | null = null;
    let target: EffectTarget | null = null;
    const resolvingStackEffect = WrapperProvider.stackWrapper.out._currentStack[WrapperProvider.stackWrapper.out._currentStack.length - 1] as ActivatePassiveEffect;
    if (!resolvingStackEffect.index) {
      throw new Error(`Cant Get Passive Meta, last stack effect is not of type ActivatePassiveEffect`)
    } else {
      this.metaIndex = resolvingStackEffect.index
      this.isAfterActivation = resolvingStackEffect.isAfterActivation
    }
    if (!this.metaIndex) { throw new Error(`no MetaIndex`) }
    this.isAfterActivation == true ? passiveMeta = WrapperProvider.passiveManagerWrapper.out.afterActivationMap.get(this.metaIndex)! : passiveMeta = WrapperProvider.passiveManagerWrapper.out.beforeActivationMap.get(this.metaIndex)!
    log(passiveMeta)
    if (!passiveMeta) { debugger; throw new Error("No Passive Meta"); }

    switch (this.passiveComponent) {
      case PASSIVE_META_COMPONENTS.SCOPE:
        if (passiveMeta.methodScope!.getComponent(Player)) {
          passiveMeta.methodScope = passiveMeta.methodScope!.getComponent(Player)!.character
        }
        target = new EffectTarget(passiveMeta.methodScope!)
        break;
      case PASSIVE_META_COMPONENTS.ARGS:
        target = new EffectTarget(passiveMeta.args![this.argsIndex])
        break;
      case PASSIVE_META_COMPONENTS.RESULT:
        target = new EffectTarget(passiveMeta.result)
        break;
      default:
        break;
    }

    if (!target) { debugger; throw new Error("No Target Found"); }

    this.cardChosen = target.effectTargetCard

    return target;
  }
}

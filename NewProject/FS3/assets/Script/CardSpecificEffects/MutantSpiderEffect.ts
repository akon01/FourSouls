import { _decorator } from 'cc';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { SelectFromButtons } from '../CardEffectComponents/DataCollector/SelectFromButtons';
import { Player } from '../Entites/GameEntities/Player';
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { WrapperProvider } from '../Managers/WrapperProvider';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
const { ccclass, property } = _decorator;


@ccclass('MutantSpiderEffect')
export class MutantSpiderEffect extends Effect {
  effectName = "MutantSpiderEffect";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData
  ) {
    const player = data.methodArgs[1] as Player
    const rolledNumbers: number[] = []
    for (let index = 0; index < 4; index++) {
      rolledNumbers.push(await player.rollDice(data.methodArgs[2], true))
    }
    const selectFromButtons = new SelectFromButtons()
    selectFromButtons.buttonsToSelectFrom = rolledNumbers.map(num => { return { buttonName: num.toString(), buttonText: num.toString() } })
    const collectedData = await selectFromButtons.collectData(data)
    data.methodArgs[0] = collectedData.effectTargetNumber

    this.conditions[0].isConditionActive = false

    if (data instanceof PassiveEffectData) return data
    return WrapperProvider.stackWrapper.out._currentStack
  }
}

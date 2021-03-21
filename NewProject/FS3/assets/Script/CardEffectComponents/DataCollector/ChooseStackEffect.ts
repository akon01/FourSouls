import { _decorator, Enum, log, Node } from 'cc';
const { ccclass, property } = _decorator;

import { Player } from "../../Entites/GameEntities/Player";
import { Stack } from "../../Entites/Stack";
import { EffectTarget } from "../../Managers/EffectTarget";
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectVisManager } from "../../Managers/StackEffectVisManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { StackEffectPreview } from "../../StackEffects/StackEffectVisualRepresentation/StackEffectPreview";
import { GAME_EVENTS, STACK_EFFECT_TYPE } from "./../../Constants";
import { DataCollector } from "./DataCollector";
import { whevent } from "../../../ServerClient/whevent";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('ChooseStackEffect')
export class ChooseStackEffect extends DataCollector {
  collectorName = "ChooseStackEffect";
  //isEffectChosen: boolean = false;
  setIsEffectChosen(boolean: boolean) {
    this.isEffectChosen = boolean;
    whevent.emit(GAME_EVENTS.CHOOSE_STACK_EFFECT_CHOSEN, boolean)
  }
  stackEffectChosen: StackEffectInterface | null = null;
  playerId: number | null = null;

  @property({ type: Enum(STACK_EFFECT_TYPE) })
  chooseTypes: STACK_EFFECT_TYPE[] = [];

  /**
   *  @throws when there are no cards to choose from in the choose type
   * @param data cardPlayerId:Player who played the card
   * @returns {target:node of the player who played the card}
   */

  async collectData(data: {
    cardPlayerId: number;
  }): Promise<EffectTarget> {
    log(`stack choose stack effect`)
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardPlayerId)!
    this.playerId = data.cardPlayerId;
    const stackEffectsToChooseFrom = []
    for (let i = 0; i < this.chooseTypes.length; i++) {
      const chooseType = this.chooseTypes[i];
      stackEffectsToChooseFrom.push(...this.getStackEffectsToChoose(chooseType, player));
    }
    if (stackEffectsToChooseFrom.length == 0) {
      throw new Error("No Stack Effects To Choose From!")
    }

    log(`b4 require choosing an effect`)
    const chosenStackEffect = await this.requireChoosingAnEffect(stackEffectsToChooseFrom);
    log(`after require choosing an effect`)

    const target = new EffectTarget(chosenStackEffect.getComponent(StackEffectPreview)!)
    log(target)
    // log(`chosen ${target.effectTargetCard.name}`)

    return target;

  }

  getStackEffectsToChoose(chooseType: STACK_EFFECT_TYPE, mePlayer?: Player, player?: Player) {
    const stackEffectsToReturn: StackEffectInterface[] = [];
    let players

    return WrapperProvider.stackWrapper.out._currentStack.filter(effect => {
      if (effect.stackEffectType == chooseType) {
        return true
      }
    })

  }

  async requireChoosingAnEffect(stackEffectsToChooseFrom: StackEffectInterface[]) {

    if (stackEffectsToChooseFrom.length == 1) {
      return WrapperProvider.stackEffectVisManagerWrapper.out.getPreviewByStackId(stackEffectsToChooseFrom[0].entityId)!.node

    } let stackEffectsPreviews: StackEffectPreview[] = []

    stackEffectsPreviews = stackEffectsToChooseFrom.map(stackEffect => WrapperProvider.stackEffectVisManagerWrapper.out.getPreviewByStackId(stackEffect.entityId)!)
    stackEffectsPreviews = stackEffectsPreviews.filter(preview => {
      if (preview != undefined) { return true }
    })
    for (const stackEffectPreview of stackEffectsPreviews) {
      WrapperProvider.stackEffectVisManagerWrapper.out.makeRequiredForDataCollector(stackEffectPreview, this)
    }
    WrapperProvider.stackEffectVisManagerWrapper.out.showPreviews()
    log(`wait for effect to be chosen `)
    const stackEffectChosen = await this.waitForEffectToBeChosen()
    log(`effect chosen is ${stackEffectChosen}`)
    for (const stackEffectPreview of stackEffectsPreviews) {
      WrapperProvider.stackEffectVisManagerWrapper.out.makeNotRequiredForDataCollector(stackEffectPreview)
    }
    return stackEffectChosen

  }

  async waitForEffectToBeChosen(): Promise<Node> {
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.CHOOSE_STACK_EFFECT_CHOSEN, (data: any) => {
        if (data) {
          resolve(this.cardChosen!);
        }
      })
    })
  }
}

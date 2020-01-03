import Player from "../../Entites/GameEntities/Player";
import Stack from "../../Entites/Stack";
import { EffectTarget } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectVisManager from "../../Managers/StackEffectVisManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import StackEffectPreview from "../../StackEffects/StackEffectVisualRepresentation/StackEffectPreview";
import { GAME_EVENTS, STACK_EFFECT_TYPE } from "./../../Constants";
import DataCollector from "./DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChooseStackEffect extends DataCollector {
  collectorName = "ChooseStackEffect";
  //isEffectChosen: boolean = false;
  set isEffectChosen(boolean: boolean) {
    whevent.emit(GAME_EVENTS.CHOOSE_STACK_EFFECT_CHOSEN, boolean)
  }
  stackEffectChosen: StackEffectInterface;
  playerId: number;

  @property({ type: cc.Enum(STACK_EFFECT_TYPE) })
  chooseTypes: STACK_EFFECT_TYPE[] = [];

  /**
   *  @throws when there are no cards to choose from in the choose type
   * @param data cardPlayerId:Player who played the card
   * @returns {target:cc.node of the player who played the card}
   */

  async collectData(data: {
    cardPlayerId;
  }): Promise<EffectTarget> {
    cc.log(`stack choose stack effect`)
    const player = PlayerManager.getPlayerById(data.cardPlayerId)
    this.playerId = data.cardPlayerId;
    const stackEffectsToChooseFrom = []
    for (let i = 0; i < this.chooseTypes.length; i++) {
      const chooseType = this.chooseTypes[i];
      stackEffectsToChooseFrom.push(...this.getStackEffectsToChoose(chooseType, player));
    }
    if (stackEffectsToChooseFrom.length == 0) {
      throw new Error("No Stack Effects To Choose From!")
    }

    cc.log(`b4 require choosing an effect`)
    const chosenStackEffect = await this.requireChoosingAnEffect(stackEffectsToChooseFrom);
    cc.log(`after require choosing an effect`)

    const target = new EffectTarget(chosenStackEffect.getComponent(StackEffectPreview))
    cc.log(target)
    // cc.log(`chosen ${target.effectTargetCard.name}`)

    return target;

  }

  getStackEffectsToChoose(chooseType: STACK_EFFECT_TYPE, mePlayer?: Player, player?: Player) {
    const stackEffectsToReturn: StackEffectInterface[] = [];
    let players

    return Stack._currentStack.filter(effect => {
      if (effect.stackEffectType == chooseType) {
        return true
      }
    })

  }

  async requireChoosingAnEffect(
    stackEffectsToChooseFrom
  ) {

    if (stackEffectsToChooseFrom.length == 1) {
      return StackEffectVisManager.$.getPreviewByStackId(stackEffectsToChooseFrom[0].entityId).node

    } let stackEffectsPreviews = []

    for (const effect of stackEffectsToChooseFrom) {
      stackEffectsPreviews.push(effect.entityId)
    }

    stackEffectsPreviews = stackEffectsToChooseFrom.map(stackEffect => StackEffectVisManager.$.getPreviewByStackId(stackEffect.entityId))
    stackEffectsPreviews = stackEffectsPreviews.filter(preview => {
      if (preview != undefined) { return true }
    })
    for (const stackEffectPreview of stackEffectsPreviews) {
      StackEffectVisManager.$.makeRequiredForDataCollector(stackEffectPreview, this)
    }
    StackEffectVisManager.$.showPreviews()
    cc.log(`wait for effect to be chosen `)
    const stackEffectChosen = await this.waitForEffectToBeChosen()
    cc.log(`effect chosen is ${stackEffectChosen}`)
    for (const stackEffectPreview of stackEffectsPreviews) {
      StackEffectVisManager.$.makeNotRequiredForDataCollector(stackEffectPreview)
    }
    return stackEffectChosen

  }

  async waitForEffectToBeChosen(): Promise<cc.Node> {
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.CHOOSE_STACK_EFFECT_CHOSEN, (data) => {
        if (data) {
          resolve(this.cardChosen);
        }
      })
    })
  }
}

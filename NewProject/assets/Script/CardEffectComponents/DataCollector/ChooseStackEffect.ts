import Item from "../../Entites/CardTypes/Item";
import Card from "../../Entites/GameEntities/Card";
import Deck from "../../Entites/GameEntities/Deck";
import Player from "../../Entites/GameEntities/Player";
import ActionManager from "../../Managers/ActionManager";
import CardManager from "../../Managers/CardManager";
import { EffectTarget } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import { CARD_TYPE, CHOOSE_CARD_TYPE, STACK_EFFECT_TYPE, TARGETTYPE } from "./../../Constants";
import MonsterField from "./../../Entites/MonsterField";
import DataCollector from "./DataCollector";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Stack from "../../Entites/Stack";
import StackEffectVisManager from "../../Managers/StackEffectVisManager";
import StackEffectPreview from "../../StackEffects/StackEffectVisualRepresentation/StackEffectPreview";
import ActivateItem from "../../StackEffects/Activate Item";



const { ccclass, property } = cc._decorator;

@ccclass
export default class ChooseStackEffect extends DataCollector {
  collectorName = "ChooseStackEffect";
  isEffectChosen: boolean = false;
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
    let player = PlayerManager.getPlayerById(data.cardPlayerId).getComponent(
      Player
    );
    this.playerId = data.cardPlayerId;
    let stackEffectsToChooseFrom = []
    for (let i = 0; i < this.chooseTypes.length; i++) {
      const chooseType = this.chooseTypes[i];
      stackEffectsToChooseFrom.push(...this.getStackEffectsToChoose(chooseType, player));
    }
    if (stackEffectsToChooseFrom.length == 0) {
      throw 'No Stack Effects To Choose From!'
    }

    cc.log(`b4 require choosing an effect`)
    let chosenStackEffect = await this.requireChoosingAnEffect(stackEffectsToChooseFrom);
    cc.log(`after require choosing an effect`)

    let target = new EffectTarget(chosenStackEffect.getComponent(StackEffectPreview))
    cc.log(target)
    // cc.log(`chosen ${target.effectTargetCard.name}`)

    return target;


  }



  getStackEffectsToChoose(chooseType: STACK_EFFECT_TYPE, mePlayer?: Player, player?: Player) {
    let stackEffectsToReturn: StackEffectInterface[] = [];
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
      if (preview != undefined) return true
    })
    for (const stackEffectPreview of stackEffectsPreviews) {
      StackEffectVisManager.$.makeRequiredForDataCollector(stackEffectPreview, this)
    }
    StackEffectVisManager.$.showPreviews()
    cc.log(`wait for effect to be chosen `)
    let stackEffectChosen = await this.waitForEffectToBeChosen()
    cc.log(`effect chosen is ${stackEffectChosen}`)
    for (const stackEffectPreview of stackEffectsPreviews) {
      StackEffectVisManager.$.makeNotRequiredForDataCollector(stackEffectPreview)
    }
    return stackEffectChosen

  }

  async waitForEffectToBeChosen(): Promise<cc.Node> {
    cc.log(`wait for effect to be chosen start`)
    return new Promise((resolve, reject) => {
      let check = () => {
        if (this.isEffectChosen == true) {
          cc.log(`wait for effect to be chosen end`)
          this.isEffectChosen = false;

          resolve(this.cardChosen);
        } else {
          cc.log(`wait for effect to be chosen continue`)
          setTimeout(check, 50);
        }
      };
      check.bind(this);
      setTimeout(check, 50);
    });
  }
}

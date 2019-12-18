import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import Effect from "../CardEffectComponents/CardEffects/Effect";
import ChainCollector from "../CardEffectComponents/DataCollector/ChainCollector";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { EFFECT_ANIMATION_TIME, GAME_EVENTS, ITEM_TYPE, PARTICLE_TYPES } from "../Constants";
import EffectsAndOptionalChoice from "../EffectAndOptionalChoice";
import CardManager from "../Managers/CardManager";
import DataInterpreter, { ActiveEffectData, EffectData, PassiveEffectData, ServerEffectData } from "../Managers/DataInterpreter";
import ParticleManager from "../Managers/ParticleManager";
import PlayerManager from "../Managers/PlayerManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import Item from "./CardTypes/Item";
import Card from "./GameEntities/Card";
import Player from "./GameEntities/Player";
import { Logger } from "./Logger";
import { ServerEffect } from "./ServerCardEffect";
import Stack from "./Stack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardEffect extends cc.Component {

  @property
  hasDestroySelfEffect: boolean = false;

  @property(cc.Node)
  conditions: cc.Node[] = [];

  @property(cc.Node)
  activeEffects: cc.Node[] = [];

  @property(cc.Node)
  passiveEffects: cc.Node[] = [];

  @property(cc.Node)
  toAddPassiveEffects: cc.Node[] = [];

  @property(cc.Node)
  paidEffects: cc.Node[] = [];

  @property({ type: [EffectsAndOptionalChoice], multiline: true })
  test123: EffectsAndOptionalChoice[] = []

  @property
  hasMultipleEffects: boolean = false;

  @property({
    type: DataCollector, visible: function (this: CardEffect) {
      if (this.hasMultipleEffects) { return true }
    }
  })
  multiEffectCollector: DataCollector = null;

  @property({ visible: false })
  effectData = null;

  @property({ visible: false })
  data: {} = {};

  @property({ visible: false })
  cardPlayerId: number = 0;

  @property
  serverEffectStack: ServerEffect[] = [];

  /**
   * @throws an error if there is an empty active effect slot in the cardEffect
   * @returns true if any one of the effects can be activated, false otherwise
   */
  testEffectsPreConditions() {
    const boolPool: boolean[] = []
    const itemComp = this.node.getComponent(Item)
    let itemIsActivated: boolean
    if (itemComp != null) {
      itemIsActivated = itemComp.activated
    } else {
      itemIsActivated = false;
    }
    let innerBoolPool = []

    if (!itemIsActivated) {

      for (const activeEffect of this.activeEffects) {
        if (!activeEffect) { throw new Error(`An Empty Active Effect Slot In ${this.node.name}`) }
        const preCondition = activeEffect.getComponent(Effect).preCondition
        if (preCondition != null) {
          if (preCondition.testCondition()) {

            return true;
          }

        } else if (preCondition == null) {
          innerBoolPool.push(true)
        }
      }

      if (innerBoolPool.length >= this.activeEffects.filter(effect => { if (effect.getComponent(Effect).preCondition == null) { return true } }).length) {
        boolPool.push(true)
      }
    } else {
      //  boolPool.push(true)
    }
    innerBoolPool = []
    for (const passiveEffect of this.passiveEffects) {
      if (!passiveEffect) { throw new Error(`An Empty Passive Effect Slot In ${this.node.name}`) }
      const preCondition = passiveEffect.getComponent(Effect).preCondition
      if (preCondition != null && preCondition.testCondition()) {

        return true;
      } else if (preCondition == null) {
        innerBoolPool.push(true)
      }
    }

    if (innerBoolPool.length >= this.passiveEffects.filter(effect => { if (effect.getComponent(Effect).preCondition == null) { return true } }).length) {
      boolPool.push(true)
    }
    innerBoolPool = []
    for (const paidEffect of this.paidEffects) {
      if (!paidEffect) { throw new Error(`An Empty Paid Effect Slot In ${this.node.name}`) }
      const preCondition = paidEffect.getComponent(Effect).preCondition
      if (preCondition != null && preCondition.testCondition()) {

        return true;
      } else if (preCondition == null) {
        innerBoolPool.push(true)
      }
    }

    if (innerBoolPool.length >= this.paidEffects.filter(effect => { if (effect.getComponent(Effect).preCondition == null) { return true } }).length) {
      boolPool.push(true)
    }
    innerBoolPool = []
    for (const toAddPassiveEffect of this.toAddPassiveEffects) {
      if (!toAddPassiveEffect) { throw new Error(`An Empty ToAdd Passive Effect Slot In ${this.node.name}`) }
      const preCondition = toAddPassiveEffect.getComponent(Effect).preCondition
      if (preCondition != null && preCondition.testCondition()) {

        return true;
      } else if (preCondition == null) {
        innerBoolPool.push(true)
      }
    }

    if (innerBoolPool.length >= this.toAddPassiveEffects.filter(effect => { if (effect.getComponent(Effect).preCondition == null) { return true } }).length) {
      boolPool.push(true)
    }

    if (boolPool.length == 4) {

      return true;
    }
    cc.log(`no effect passes pre-conditions on ${this.node.parent.name}`)
    return false;
  }

  /**
   *
   * @param data {effect}
   */

  async doEffectByNumAndType(
    numOfEffect: number,
    type: ITEM_TYPE,
    effectData: any) {
    let serverEffectStack = null;
    let chosenEffect: Effect
    switch (type) {
      case ITEM_TYPE.ACTIVE:
        for (let i = 0; i < this.activeEffects.length; i++) {
          const effect = this.activeEffects[i].getComponent(Effect);
          if (i == numOfEffect) {
            chosenEffect = effect
            // try {
            //   serverEffectStack = await effect.doEffect(
            //     Stack._currentStack,
            //     effectData
            //   );
            // } catch (error) {
            //   cc.error(error)
            // }
            break;
          }
        }
        break;
      case ITEM_TYPE.PASSIVE:
        for (let i = 0; i < this.passiveEffects.length; i++) {
          const effect = this.passiveEffects[i].getComponent(Effect);
          if (i == numOfEffect) {
            chosenEffect = effect
            // try {
            //   serverEffectStack = await effect.doEffect(
            //     Stack._currentStack,
            //     effectData
            //   );
            // } catch (error) {
            //   cc.error(error)
            // }
            break;
          }
        }
        break;
      case ITEM_TYPE.TO_ADD_PASSIVE:
        for (let i = 0; i < this.toAddPassiveEffects.length; i++) {
          const effect = this.toAddPassiveEffects[i].getComponent(Effect);
          if (i == numOfEffect) {
            chosenEffect = effect
            // try {
            //   serverEffectStack = await effect.doEffect(
            //     Stack._currentStack,
            //     effectData
            //   );
            // } catch (error) {
            //   cc.error(error)
            // }
            break;
          }
        }
        break;
      case ITEM_TYPE.PAID:
        for (let i = 0; i < this.paidEffects.length; i++) {
          const effect = this.paidEffects[i].getComponent(Effect);
          if (i == numOfEffect) {
            chosenEffect = effect

            break;
          }
        }
      default:
        break;
    }
    try {
      let doEffect = true
      if (chosenEffect.optional) {
        doEffect = await PlayerManager.getPlayerById(this.cardPlayerId).giveYesNoChoice()
      }
      if (doEffect) {
        serverEffectStack = await chosenEffect.doEffect(
          Stack._currentStack,
          effectData
        );
      } else {
        return effectData
      }
    } catch (error) {
      error = `effect ${chosenEffect.effectName} failed to execute\n${error}\n` + `effect data was:`
      if (error.stack) {
        cc.error(error.stack)
      }
      cc.error(error)
      cc.error(effectData)
      cc.error(error.stack)

      Logger.error(error)
    }
    return serverEffectStack
  }

  getEffectByNumAndType(effectNum: number, effectType: ITEM_TYPE) {

    switch (effectType) {
      case ITEM_TYPE.ACTIVE:
        for (let i = 0; i < this.activeEffects.length; i++) {
          const effect = this.activeEffects[i].getComponent(Effect);
          if (i == effectNum) {
            return effect
          }
        }
        break;
      case ITEM_TYPE.PASSIVE:
        for (let i = 0; i < this.passiveEffects.length; i++) {
          const effect = this.passiveEffects[i].getComponent(Effect);
          if (i == effectNum) {
            return effect
          }
        }
        break;
      case ITEM_TYPE.TO_ADD_PASSIVE:
        for (let i = 0; i < this.toAddPassiveEffects.length; i++) {
          const effect = this.toAddPassiveEffects[i].getComponent(Effect);
          if (i == effectNum) {
            return effect
          }
        }
        break;
      case ITEM_TYPE.PAID:
        for (let i = 0; i < this.paidEffects.length; i++) {
          const effect = this.paidEffects[i].getComponent(Effect);
          if (i == effectNum) {
            return effect
          }
        }
      default:
        cc.error(`effect type is not one of the registered ITEM_TYPE enum`)
        Logger.error("effect type is not one of the registered ITEM_TYPE enum")
        break;
    }
    cc.error(`no effect found for ${effectNum} and type ${effectType} in card ${this.node.name}`)
    Logger.error(`no effect found for ${effectNum} and type ${effectType} in card ${this.node.name}`)
  }

  sendServerCardEffect(oldData) {
    const data = {
      cardId: this.node.getComponent(Card)._cardId,
      effectData: oldData
    };
    ServerClient.$.send(Signal.SERVER_CARD_EFFECT, data);
  }

  async collectEffectData(
    effect: Effect,
    oldData: { cardPlayerId: number; cardId: number }
  ) {
    let data: ServerEffectData;
    let endData: ActiveEffectData | PassiveEffectData = null;

    const isActive = (this.getEffectIndexAndType(effect).type == ITEM_TYPE.ACTIVE) ? true : false

    if (effect.dataCollector != null) {

      if (effect.dataCollector instanceof DataCollector) {
        data = await effect.dataCollector.collectData(oldData)
        endData = DataInterpreter.makeEffectData(data, this.node, oldData.cardPlayerId, isActive, false)
      } else {
        for (let o = 0; o < effect.dataCollector.length; o++) {
          const dataCollector = effect.dataCollector[o];
          cc.log(`collecting data for ${effect.name} with ${dataCollector.name}`)
          try {
            data = await dataCollector.collectData(oldData)

          } catch (error) {
            cc.error(error)
            Logger.error(error)
          }
          if (endData == null) {
            if (dataCollector instanceof ChainCollector) {
              endData = DataInterpreter.makeEffectData(data, this.node, oldData.cardPlayerId, isActive, true)
            } else {
              endData = DataInterpreter.makeEffectData(data, this.node, oldData.cardPlayerId, isActive, false)
            }
          } else {
            endData.addTarget(data)
          }
        }
      }
    } else {
      throw new Error(`tring to collect data for ${effect.effectName} but it has no data collector`)
    }
    // if (endData instanceof ActiveEffectData) data = DataInterpreter.convertToServerData(endData)
    data = DataInterpreter.convertToServerData(endData)
    //  data = await effect.dataCollector.collectData(oldData);
    return data;
  }

  /**
   * @throws an error when there is an empty slot
   * @param effect an effect of this card
   */
  getEffectIndexAndType(effect: Effect) {
    const splitName = effect.name.split("<");
    for (let i = 0; i < this.activeEffects.length; i++) {
      if (!this.activeEffects[i]) { throw new Error(`Empty Active Effect Slot`) }
      const testedEffect = this.activeEffects[i].getComponent(Effect);
      const splitTestedName = testedEffect.name.split("<");

      if (effect.uuid == testedEffect.uuid) {
        //  if (splitName[1] == splitTestedName[1]) {
        return { type: ITEM_TYPE.ACTIVE, index: i };
      }
    }
    for (let i = 0; i < this.passiveEffects.length; i++) {
      if (!this.passiveEffects[i]) { throw new Error(`Empty Passive Effect Slot`) }
      const passiveEffect = this.passiveEffects[i].getComponent(Effect);
      const splitTestedName = passiveEffect.name.split("<");
      // if (splitName[1] == splitTestedName[1]) {

      if (effect.uuid == passiveEffect.uuid) {
        return { type: ITEM_TYPE.PASSIVE, index: i };
      }
    }
    for (let i = 0; i < this.toAddPassiveEffects.length; i++) {
      if (!this.toAddPassiveEffects[i]) { throw new Error(`Empty ToAdd Passive Effect Slot`) }
      const toAddPassiveEffect = this.toAddPassiveEffects[i].getComponent(Effect);
      const splitTestedName = toAddPassiveEffect.name.split("<");
      //if (splitName[1] == splitTestedName[1]) {

      if (effect.uuid == toAddPassiveEffect.uuid) {
        return { type: ITEM_TYPE.TO_ADD_PASSIVE, index: i };
      }
    }
    for (let i = 0; i < this.paidEffects.length; i++) {
      if (!this.paidEffects[i]) { throw new Error(`Empty Paid Effect Slot`) }
      const paidEffect = this.paidEffects[i].getComponent(Effect);
      const splitTestedName = paidEffect.name.split("<");
      // if (splitName[1] == splitTestedName[1]) {

      if (effect.uuid == paidEffect.uuid) {
        return { type: ITEM_TYPE.PAID, index: i };
      }
    }

  }

  async collectEffectFromNum(cardPlayed: cc.Node, cardPlayerId: number) {
    const multiEffectCollector: DataCollector = this.multiEffectCollector.getComponent(
      DataCollector
    );
    const chosenEffect = await multiEffectCollector.collectData({
      cardPlayed: cardPlayed,
      cardPlayerId: cardPlayerId
    });
    return chosenEffect;
  }

  ///TEST!!
  async getServerEffect(cardEffect: Effect, cardPlayerId: number, collectEffectData: boolean) {
    if (cardEffect == null || cardEffect == undefined) { throw new Error("CardEffect is null") }
    const cardPlayed = this.node
    const effectData = this.getEffectIndexAndType(cardEffect);
    const serverEffect = new ServerEffect(
      cardEffect.effectName,
      effectData.index,
      cardPlayerId,
      cardPlayed.getComponent(Card)._cardId,
      effectData.type
    );
    //pay costs like counters/destroing items and so on
    if (cardEffect.cost != null) {
      await cardEffect.cost.takeCost()
    }

    const cardPlayedData = { cardPlayerId: cardPlayerId, cardId: cardPlayed.getComponent(Card)._cardId }

    if (collectEffectData) {
      if (cardEffect.dataCollector != null) {
        this.effectData = await this.collectEffectData(cardEffect, cardPlayedData);
      } else {
        if (cardEffect.dataCollector) {
          cc.error(`need to collect data but cant!`)
          Logger.error(`need to collect data for ${cardEffect.name} with ${cardEffect.dataCollector} but cant!`)
        }
      }
    }
    if (this.effectData != null) {
      serverEffect.cardEffectData = this.effectData;
    }
    serverEffect.hasSubAction = false;

    return serverEffect;
  }

  async doEffectAnimation() {
    const particleSystem = this.node.getComponentInChildren(cc.ParticleSystem)
    ParticleManager.activateParticleEffect(this.node, PARTICLE_TYPES.ACTIVATE_EFFECT, true)
    setTimeout(() => {
      whevent.emit(GAME_EVENTS.CARD_EFFECT_ANIM_END, this.node)
    }, EFFECT_ANIMATION_TIME * 1000);
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.CARD_EFFECT_ANIM_END, (cardWithAnim: cc.Node) => {
        if (cardWithAnim == this.node) {
          ParticleManager.disableParticleEffect(this.node, PARTICLE_TYPES.ACTIVATE_EFFECT, true)
          resolve()
        }
      })

    })
  }

  async doServerEffect2(
    currentServerEffect: ServerEffect,
    allStackEffects: StackEffectInterface[]
  ) {
    cc.log(
      "doing effect: " +
      currentServerEffect.effectName +
      " of card: " +
      this.node.name
    );

    await this.doEffectAnimation()

    //interpret data --- not for chainEffect effectData
    let effectData
    if (currentServerEffect.cardEffectData != null) {
      if (!(currentServerEffect.cardEffectData instanceof EffectData)) {
        effectData = DataInterpreter.convertToEffectData(currentServerEffect.cardEffectData)
      } else {
        effectData = currentServerEffect.cardEffectData
      }
      this.effectData = effectData;
      //if effect is chainEffects
    }
    this.cardPlayerId = currentServerEffect.cardPlayerId;
    let newStack;

    // if (currentServerEffect.effctType == ITEM_TYPE.ACTIVE) {
    newStack = await this.doEffectByNumAndType(
      currentServerEffect.cardEffectNum,
      currentServerEffect.effctType,
      effectData
    );

    //TODO - TEST!!!! NEW!
    this.effectData = null

    return newStack

  }

  // getOnlyEffect() {
  //   if ((this.activeEffects.length == 1) && (this.paidEffects.length == 0) && (this.passiveEffects.length == 0)) {
  //     return this.activeEffects[0].getComponent(Effect)
  //   }
  //   if ((this.activeEffects.length == 0) && (this.paidEffects.length == 1) && (this.passiveEffects.length == 0)) {
  //     return this.paidEffects[0].getComponent(Effect)
  //   }
  //   if ((this.activeEffects.length == 0) && (this.paidEffects.length == 0) && (this.passiveEffects.length == 1)) {
  //     return this.passiveEffects[0].getComponent(Effect)
  //   }
  // }

  // LIFE-CYCLE CALLBACKS:

  //  onLoad () {

  //  }

  start() { }

  // update (dt) {}
}

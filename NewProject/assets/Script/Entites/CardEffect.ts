import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import Effect from "../CardEffectComponents/CardEffects/Effect";
import ChainCollector from "../CardEffectComponents/DataCollector/ChainCollector";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { ITEM_TYPE } from "../Constants";
import CardManager from "../Managers/CardManager";
import DataInterpreter, { ActiveEffectData, EffectData, PassiveEffectData } from "../Managers/DataInterpreter";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import Item from "./CardTypes/Item";
import Card from "./GameEntities/Card";
import { ServerEffect } from "./ServerCardEffect";
import Stack from "./Stack";



const { ccclass, property } = cc._decorator;

@ccclass
export default class CardEffect extends cc.Component {
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

  @property(DataCollector)
  multiEffectCollector: DataCollector = null;

  @property
  hasRollLock: boolean = false;

  @property
  effectData = null;

  @property
  data: {} = {};

  @property
  hasMultipleEffects: boolean = false;

  @property
  cardPlayerId: number = 0;

  @property
  serverEffectStack: ServerEffect[] = [];

  /**
   * @returns true if any one of the effects can be activated, false otherwise
   */
  testEffectsPreConditions() {
    let boolPool: boolean[] = []
    let itemComp = this.node.getComponent(Item)
    let itemIsActivated: boolean
    if (itemComp != null) {
      itemIsActivated = itemComp.activated
    } else {
      itemIsActivated = false;
    }
    let innerBoolPool = []

    if (!itemIsActivated) {

      for (const activeEffect of this.activeEffects) {
        let preCondition = activeEffect.getComponent(Effect).preCondition
        if (preCondition != null) {
          if (preCondition.testCondition()) {

            return true;
          }

        } else if (preCondition == null) {
          innerBoolPool.push(true)
        }
      }


      if (innerBoolPool.length >= this.activeEffects.filter(effect => { if (effect.getComponent(Effect).preCondition == null) return true }).length) {
        boolPool.push(true)
      }
    } else {
      //  boolPool.push(true)
    }
    innerBoolPool = []
    for (const passiveEffect of this.passiveEffects) {
      let preCondition = passiveEffect.getComponent(Effect).preCondition
      if (preCondition != null && preCondition.testCondition()) {

        return true;
      } else if (preCondition == null) {
        innerBoolPool.push(true)
      }
    }


    if (innerBoolPool.length >= this.passiveEffects.filter(effect => { if (effect.getComponent(Effect).preCondition == null) return true }).length) {
      boolPool.push(true)
    }
    innerBoolPool = []
    for (const paidEffect of this.paidEffects) {
      let preCondition = paidEffect.getComponent(Effect).preCondition
      if (preCondition != null && preCondition.testCondition()) {

        return true;
      } else if (preCondition == null) {
        innerBoolPool.push(true)
      }
    }


    if (innerBoolPool.length >= this.paidEffects.filter(effect => { if (effect.getComponent(Effect).preCondition == null) return true }).length) {
      boolPool.push(true)
    }
    innerBoolPool = []
    for (const toAddPassiveEffect of this.toAddPassiveEffects) {
      let preCondition = toAddPassiveEffect.getComponent(Effect).preCondition
      if (preCondition != null && preCondition.testCondition()) {

        return true;
      } else if (preCondition == null) {
        innerBoolPool.push(true)
      }
    }


    if (innerBoolPool.length >= this.toAddPassiveEffects.filter(effect => { if (effect.getComponent(Effect).preCondition == null) return true }).length) {
      boolPool.push(true)
    }

    if (boolPool.length == 4) {

      return true;
    }
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
    switch (type) {
      case ITEM_TYPE.ACTIVE:
        for (let i = 0; i < this.activeEffects.length; i++) {
          const effect = this.activeEffects[i].getComponent(Effect);
          if (i == numOfEffect) {
            serverEffectStack = await effect.doEffect(
              Stack._currentStack,
              effectData
            );
            break;
          }
        }
        break;
      case ITEM_TYPE.PASSIVE:
        for (let i = 0; i < this.passiveEffects.length; i++) {
          const effect = this.passiveEffects[i].getComponent(Effect);
          if (i == numOfEffect) {
            serverEffectStack = await effect.doEffect(
              Stack._currentStack,
              effectData
            );
            break;
          }
        }
        break;
      case ITEM_TYPE.TO_ADD_PASSIVE:
        for (let i = 0; i < this.toAddPassiveEffects.length; i++) {
          const effect = this.toAddPassiveEffects[i].getComponent(Effect);
          if (i == numOfEffect) {
            serverEffectStack = await effect.doEffect(
              Stack._currentStack,
              effectData
            );
            break;
          }
        }
        break;
      case ITEM_TYPE.PAID:
        for (let i = 0; i < this.paidEffects.length; i++) {
          const effect = this.paidEffects[i].getComponent(Effect);
          if (i == numOfEffect) {
            serverEffectStack = await effect.doEffect(
              Stack._currentStack,
              effectData
            );
            break;
          }
        }
      default:
        break;
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
        break;
    }
  }

  sendServerCardEffect(oldData) {
    let data = {
      cardId: this.node.getComponent(Card)._cardId,
      effectData: oldData
    };
    ServerClient.$.send(Signal.SERVER_CARD_EFFECT, data);
  }

  async collectEffectData(
    effect: Effect,
    oldData: { cardPlayerId: number; cardId: number }
  ) {
    let data;
    let endData: ActiveEffectData | PassiveEffectData = null;

    let isActive = (this.getEffectIndexAndType(effect).type == ITEM_TYPE.ACTIVE) ? true : false

    for (let o = 0; o < effect.dataCollector.length; o++) {
      const dataCollector = effect.dataCollector[o];
      cc.log(`collecting data for ${effect.name} with ${dataCollector.name}`)
      try {
        data = await dataCollector.collectData(oldData)

      } catch (error) {
        cc.error(error)
      }
      if (endData == null) {
        if (dataCollector instanceof ChainCollector) {
          endData = DataInterpreter.makeEffectData(data, this.node, oldData.cardPlayerId, true, true)
        } else {
          endData = DataInterpreter.makeEffectData(data, this.node, oldData.cardPlayerId, true, false)
        }
      } else {
        if (endData instanceof ActiveEffectData) endData.addTarget(DataInterpreter.getNodeFromData(data))
      }
    }
    if (effect.dataCollector instanceof DataCollector) {
      data = await effect.dataCollector.collectData(oldData)
      endData = DataInterpreter.makeEffectData(data, this.node, oldData.cardPlayerId, true, false)
    }
    if (endData instanceof ActiveEffectData) data = DataInterpreter.convertToServerData(endData)
    cc.log(endData)
    cc.log(data)
    //  data = await effect.dataCollector.collectData(oldData);
    return data;
  }


  getEffectIndexAndType(effect: Effect) {
    let splitName = effect.name.split("<");
    for (let i = 0; i < this.activeEffects.length; i++) {
      const testedEffect = this.activeEffects[i].getComponent(Effect);
      let splitTestedName = testedEffect.name.split("<");
      if (splitName[1] == splitTestedName[1]) {
        return { type: ITEM_TYPE.ACTIVE, index: i };
      }
    }
    for (let i = 0; i < this.passiveEffects.length; i++) {
      const passiveEffect = this.passiveEffects[i].getComponent(Effect);
      let splitTestedName = passiveEffect.name.split("<");
      if (splitName[1] == splitTestedName[1]) {
        return { type: ITEM_TYPE.PASSIVE, index: i };
      }
    }
    for (let i = 0; i < this.toAddPassiveEffects.length; i++) {
      const toAddPassiveEffect = this.toAddPassiveEffects[i].getComponent(Effect);
      let splitTestedName = toAddPassiveEffect.name.split("<");
      if (splitName[1] == splitTestedName[1]) {
        return { type: ITEM_TYPE.TO_ADD_PASSIVE, index: i };
      }
    }
    for (let i = 0; i < this.paidEffects.length; i++) {
      const paidEffect = this.paidEffects[i].getComponent(Effect);
      let splitTestedName = paidEffect.name.split("<");
      if (splitName[1] == splitTestedName[1]) {
        return { type: ITEM_TYPE.PAID, index: i };
      }
    }


  }

  async collectEffectFromNum(cardPlayed: cc.Node, cardPlayerId: number) {
    const multiEffectCollector: DataCollector = this.multiEffectCollector.getComponent(
      DataCollector
    );
    let chosenEffect = await multiEffectCollector.collectData({
      cardPlayed: cardPlayed,
      cardPlayerId: cardPlayerId
    });
    return chosenEffect;
  }

  // async getServerEffectDepracated(
  //   cardPlayedData: {
  //     cardPlayerId: number;
  //     cardId: number;
  //   },
  //   cardEffectIndex?
  // ): Promise<ServerEffect> {

  //   let cardPlayed = CardManager.getCardById(cardPlayedData.cardId, true);
  //   let cardEffect: Effect;
  //   if (cardEffectIndex != null) {

  //     let effect = this.passiveEffects[cardEffectIndex];
  //     if (effect == null) {
  //       effect = this.toAddPassiveEffects[cardEffectIndex]
  //     }
  //     cardEffect = effect.getComponent(Effect);
  //   } else {
  //     if (this.hasMultipleEffects) {
  //       cardEffect = await this.collectEffectFromNum(
  //         cardPlayed,
  //         cardPlayedData.cardPlayerId
  //       );
  //     } else {
  //       cardEffect = this.activeEffects[0].getComponent(Effect);
  //     }
  //   }
  //   let effectData = this.getEffectIndexAndType(cardEffect);
  //   let serverEffect = new ServerEffect(
  //     cardEffect.effectName,
  //     effectData.index,
  //     cardPlayedData.cardPlayerId,
  //     cardPlayedData.cardId,
  //     effectData.type
  //   );
  //   //pay costs like counters/destroing items and so on
  //   if (cardEffect.cost != null) {
  //     cardEffect.cost.takeCost()
  //   }


  //   if (cardEffect.dataCollector.length > 0 || cardEffect.dataCollector != null) {
  //     cc.log(`collect effect data for ${cardEffect.name}`)
  //     this.effectData = await this.collectEffectData(cardEffect, cardPlayedData);
  //   }

  //   serverEffect.hasSubAction = false;
  //   serverEffect.cardEffectData = this.effectData;

  //   return serverEffect;
  // }


  ///TEST!!
  async getServerEffect(cardEffect: Effect, cardPlayerId: number, collectEffectData: boolean) {
    let cardPlayed = this.node
    let effectData = this.getEffectIndexAndType(cardEffect);
    let serverEffect = new ServerEffect(
      cardEffect.effectName,
      effectData.index,
      cardPlayerId,
      cardPlayed.getComponent(Card)._cardId,
      effectData.type
    );
    //pay costs like counters/destroing items and so on
    // if (cardEffect.cost != null) {
    //   cardEffect.cost.takeCost()
    // }

    let cardPlayedData = { cardPlayerId: cardPlayerId, cardId: cardPlayed.getComponent(Card)._cardId }
    if (collectEffectData) {
      if (cardEffect.dataCollector.length > 0 || cardEffect.dataCollector != null) {
        cc.log(`collect effect data for ${cardEffect.name}`)
        this.effectData = await this.collectEffectData(cardEffect, cardPlayedData);
      }
    }
    if (this.effectData != null) {
      serverEffect.cardEffectData = this.effectData;
    }
    serverEffect.hasSubAction = false;


    return serverEffect;
  }

  async doServerEffect(
    currentServerEffect: ServerEffect,
    allServerEffects: ServerEffect[]
  ) {
    cc.log(
      "doing effect: " +
      currentServerEffect.effectName +
      " of card: " +
      this.node.name
    );

    //interpret data --- not for chainEffect effectData
    let effectData
    if (currentServerEffect.cardEffectData != null) {
      if (!(currentServerEffect.cardEffectData instanceof EffectData)) {
        effectData = DataInterpreter.convertToActiveEffectData(currentServerEffect.cardEffectData)
      } else {
        effectData = currentServerEffect.cardEffectData
      }
      this.effectData = effectData;
      //if effect is chainEffects
    }
    this.cardPlayerId = currentServerEffect.cardPlayerId;
    this.serverEffectStack = allServerEffects;
    let serverEffectStack;
    // if (currentServerEffect.effctType == ITEM_TYPE.ACTIVE) {
    serverEffectStack = await this.doEffectByNumAndType(
      currentServerEffect.cardEffectNum,
      currentServerEffect.effctType,
      effectData
    );

    return serverEffectStack

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

    //interpret data --- not for chainEffect effectData
    let effectData
    if (currentServerEffect.cardEffectData != null) {
      if (!(currentServerEffect.cardEffectData instanceof EffectData)) {

        effectData = DataInterpreter.convertToActiveEffectData(await currentServerEffect.cardEffectData)
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

    return newStack

  }


  getOnlyEffect() {
    if ((this.activeEffects.length == 1) && (this.paidEffects.length == 0) && (this.passiveEffects.length == 0)) {
      return this.activeEffects[0].getComponent(Effect)
    }
    if ((this.activeEffects.length == 0) && (this.paidEffects.length == 1) && (this.passiveEffects.length == 0)) {
      return this.paidEffects[0].getComponent(Effect)
    }
    if ((this.activeEffects.length == 0) && (this.paidEffects.length == 0) && (this.passiveEffects.length == 1)) {
      return this.passiveEffects[0].getComponent(Effect)
    }
  }

  // LIFE-CYCLE CALLBACKS:

  //  onLoad () {

  //  }

  start() { }

  // update (dt) {}
}

import Signal from "../../Misc/Signal";
import Server from "../../ServerClient/ServerClient";
import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";

import { ITEM_TYPE } from "../Constants";
import CardManager from "../Managers/CardManager";
import Card from "./GameEntities/Card";
import { ServerEffect } from "./ServerCardEffect";
import Item from "./CardTypes/Item";
import DataInterpreter, { ActiveEffectData, PassiveEffectData, EffectData } from "../Managers/DataInterpreter";
import ChainCollector from "../CardEffectComponents/DataCollector/ChainCollector";


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
              this.serverEffectStack,
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
              this.serverEffectStack,
              effectData
            );
            break;
          }
        }
        break;
      case ITEM_TYPE.TOADDPASSIVE:
        for (let i = 0; i < this.toAddPassiveEffects.length; i++) {
          const effect = this.toAddPassiveEffects[i].getComponent(Effect);
          if (i == numOfEffect) {
            serverEffectStack = await effect.doEffect(
              this.serverEffectStack,
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
              this.serverEffectStack,
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

  sendServerCardEffect(oldData) {
    let data = {
      cardId: this.node.getComponent(Card)._cardId,
      effectData: oldData
    };
    Server.$.send(Signal.SERVERCARDEFFECT, data);
  }

  async collectEffectData(
    effect: Effect,
    oldData: { cardPlayerId: number; cardId: number }
  ) {
    let data;
    let endData: ActiveEffectData | PassiveEffectData = null;

    for (let o = 0; o < effect.dataCollector.length; o++) {
      const dataCollector = effect.dataCollector[o];
      cc.log(`collecting data for ${effect.name} with ${dataCollector.name}`)
      data = await dataCollector.collectData(oldData)
      cc.log('unformatted data for ' + effect.name)
      cc.log(data)
      if (endData == null) {
        if (dataCollector instanceof ChainCollector) {
          cc.log('data collector is chain collector, make effect data with chain')
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
    cc.log('active/passive effect data for ' + effect.name)
    cc.log(endData)
    if (endData instanceof ActiveEffectData) data = DataInterpreter.convertToServerData(endData)
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
        return { type: ITEM_TYPE.TOADDPASSIVE, index: i };
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

  async getServerEffect(
    cardPlayedData: {
      cardPlayerId: number;
      cardId: number;
    },
    cardEffectIndex?
  ): Promise<ServerEffect> {

    let cardPlayed = CardManager.getCardById(cardPlayedData.cardId, true);
    let cardEffect: Effect;
    if (cardEffectIndex != null) {

      let effect = this.passiveEffects[cardEffectIndex];
      if (effect == null) {
        effect = this.toAddPassiveEffects[cardEffectIndex]
      }
      cardEffect = effect.getComponent(Effect);
    } else {
      if (this.hasMultipleEffects) {
        cardEffect = await this.collectEffectFromNum(
          cardPlayed,
          cardPlayedData.cardPlayerId
        );
      } else {
        cardEffect = this.activeEffects[0].getComponent(Effect);
      }
    }
    let effectData = this.getEffectIndexAndType(cardEffect);
    let serverEffect = new ServerEffect(
      cardEffect.effectName,
      effectData.index,
      cardPlayedData.cardPlayerId,
      cardPlayedData.cardId,
      effectData.type
    );
    //pay costs like counters/destroing items and so on
    if (cardEffect.cost != null) {
      cardEffect.cost.takeCost()
    }


    if (cardEffect.dataCollector.length > 0 || cardEffect.dataCollector != null) {
      cc.log(`collect effect data for ${cardEffect.name}`)
      this.effectData = await this.collectEffectData(cardEffect, cardPlayedData);
    }

    serverEffect.hasSubAction = false;
    serverEffect.cardEffectData = this.effectData;

    return serverEffect;
  }

  //@printMethodStarted(COLORS.RED)
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

  // LIFE-CYCLE CALLBACKS:

  //  onLoad () {

  //  }

  start() { }

  // update (dt) {}
}

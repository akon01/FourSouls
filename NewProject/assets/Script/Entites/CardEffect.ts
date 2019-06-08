import { Interface } from "readline";
import { Script } from "vm";

import Effect from "../CardEffectComponents/CardEffects/Effect";

import Condition from "../CardEffectComponents/CardConditions/Condition";
import {
  COLLECTORTYPE,
  printMethodStarted,
  printMethodEnded,
  COLORS
} from "../Constants";
import Card from "./Card";
import Server from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";
import { ServerCardEffect } from "./ServerCardEffect";
import { resolve } from "url";
import EffectTextPos from "../EffectTextPos";

import CardManager from "../Managers/CardManager";
import MultiEffect from "../CardEffectComponents/DataCollector/MultiEffect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardEffect extends cc.Component {
  @property(cc.Node)
  conditions: cc.Node[] = [];

  @property(cc.Node)
  effects: cc.Node[] = [];

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

  testConditions(): boolean {
    let conditionsNotPassed = 0;
    for (let i = 0; i < this.conditions.length; i++) {
      const condition = this.conditions[i].getComponent(Condition);
      if (!condition.testCondition()) {
        conditionsNotPassed++;
      }
    }
    if (conditionsNotPassed > 0) {
      return false;
    } else {
      return true;
    }
  }

  /**
   *
   * @param data {effect}
   */
  doEffectByNum(numOfEffect) {
    //cc.log('%cdoEffectByNum():', 'color:#4A3;');
    for (let i = 0; i < this.effects.length; i++) {
      const effect = this.effects[i].getComponent(Effect);
      if ((i = numOfEffect - 1)) {
        effect.doEffect(this.effectData);
        break;
      }
    }
  }

  sendServerCardEffect(oldData) {
    let data = {
      cardId: this.node.getComponent(Card).cardId,
      effectData: oldData
    };
    Server.$.send(Signal.SERVERCARDEFFECT, data);
  }

  @printMethodStarted(COLORS.GREEN)
  @printMethodEnded(COLORS.GREEN)
  async collectEffectData(
    effect: Effect,
    oldData: { cardPlayerId: number; cardId: number }
  ) {
    //cc.log('%cgetDataByEffect():', 'color:#4A3;');
    let data;
    cc.log(effect.dataCollector.collectorName);
    data = await effect.dataCollector.collectData(oldData);
    return data;
  }

  getEffectByNum(numOfEffect) {
    //cc.log('%cgetEffectByNum():', 'color:#4A3;');
    for (let i = 0; i < this.effects.length; i++) {
      const effect = this.effects[i];
      if (i == numOfEffect - 1) {
        cc.log("return: " + effect.name);
        return effect.getComponent(Effect);
      }
    }
  }

  getEffectIndex(effect: Effect) {
    let splitName = effect.name.split("<");
    for (let i = 0; i < this.effects.length; i++) {
      const testedEffect = this.effects[i].getComponent(Effect);
      let splitTestedName = testedEffect.name.split("<");
      if (splitName[1] == splitTestedName[1]) {
        return i;
      }
    }
  }

  async collectEffectFromNum(cardPlayed: cc.Node) {
    //cc.log('%ccollectEffectFromNum():', 'color:#4A3;');
    const multiEffectCollector: MultiEffect = this.multiEffectCollector.getComponent(
      DataCollector
    );
    let chosenEffect = await multiEffectCollector.collectData(cardPlayed);
    return chosenEffect;
  }

  @printMethodStarted(COLORS.GREEN)
  async getServerCardEffect(cardPlayedData: {
    cardPlayerId: number;
    cardId: number;
  }): Promise<ServerCardEffect> {
    //cc.log('%cstartCardEffect():', 'color:#4A3;');
    let cardPlayed = CardManager.getCardById(cardPlayedData.cardId);
    let cardEffect: Effect;
    if (this.hasMultipleEffects) {
      cardEffect = await this.collectEffectFromNum(cardPlayed);
    } else {
      cardEffect = this.effects[0].getComponent(Effect);
    }
    this.effectData = await this.collectEffectData(cardEffect, cardPlayedData);

    let effectIndex = this.getEffectIndex(cardEffect);
    return new Promise((resolve, reject) => {
      resolve(
        new ServerCardEffect(
          cardEffect.effectName,
          this.effectData,
          effectIndex,
          cardPlayedData.cardPlayerId,
          cardPlayedData.cardId
        )
      );
    });
  }

  @printMethodStarted(COLORS.GREEN)
  doEffectFromServerCardEffect(serverCardEffect: ServerCardEffect) {
    //cc.log('%cdoEffectFromServerCardEffect():', 'color:#4A3;');
    this.effectData = serverCardEffect.cardEffectData;
    this.cardPlayerId = serverCardEffect.cardPlayerId;
    cc.log(this.effectData);
    this.doEffectByNum(serverCardEffect.cardEffectNum);
  }

  // LIFE-CYCLE CALLBACKS:

  //  onLoad () {

  //  }

  start() {}

  // update (dt) {}
}

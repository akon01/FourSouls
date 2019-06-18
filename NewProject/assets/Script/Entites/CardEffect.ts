import Signal from "../../Misc/Signal";
import Server from "../../ServerClient/ServerClient";
import Condition from "../CardEffectComponents/CardConditions/Condition";
import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import MultiEffect from "../CardEffectComponents/DataCollector/MultiEffect";
import { COLORS, printMethodStarted, CARD_TYPE, ITEM_TYPE } from "../Constants";
import CardManager from "../Managers/CardManager";
import Card from "./GameEntities/Card";
import { ServerEffect } from "./ServerCardEffect";
import PassiveEffect from "../PassiveEffects/PassiveEffect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardEffect extends cc.Component {
  @property(cc.Node)
  conditions: cc.Node[] = [];

  @property(cc.Node)
  activeEffects: cc.Node[] = [];

  @property(cc.Node)
  passiveEffects: cc.Node[] = [];

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

  // testConditions(): boolean {
  //   let conditionsNotPassed = 0;
  //   for (let i = 0; i < this.conditions.length; i++) {
  //     const condition = this.conditions[i].getComponent(Condition);
  //     if (!condition.testCondition()) {
  //       conditionsNotPassed++;
  //     }
  //   }
  //   if (conditionsNotPassed > 0) {
  //     return false;
  //   } else {
  //     return true;
  //   }
  // }

  /**
   *
   * @param data {effect}
   */
  //@printMethodStarted(COLORS.RED)
  async doEffectByNum(
    numOfEffect,
    isPassiveEffect?: boolean
  ): Promise<ServerEffect[]> {
    let serverEffectStack;
    if (isPassiveEffect) {
      for (let i = 0; i < this.passiveEffects.length; i++) {
        const effect = this.passiveEffects[i].getComponent(Effect);
        if (i == numOfEffect) {
          serverEffectStack = await effect.doEffect(
            this.serverEffectStack,
            this.effectData
          );
          break;
        }
      }
    } else {
      for (let i = 0; i < this.activeEffects.length; i++) {
        const effect = this.activeEffects[i].getComponent(Effect);
        if (i == numOfEffect) {
          serverEffectStack = await effect.doEffect(
            this.serverEffectStack,
            this.effectData
          );
          break;
        }
      }
    }
    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }

  sendServerCardEffect(oldData) {
    let data = {
      cardId: this.node.getComponent(Card).cardId,
      effectData: oldData
    };
    Server.$.send(Signal.SERVERCARDEFFECT, data);
  }

  async collectEffectData(
    effect: Effect,
    oldData: { cardPlayerId: number; cardId: number }
  ) {
    let data;
    data = await effect.dataCollector.collectData(oldData);
    return data;
  }

  getEffectByNum(numOfEffect) {
    for (let i = 0; i < this.activeEffects.length; i++) {
      const effect = this.activeEffects[i];
      if (i == numOfEffect - 1) {
        return effect.getComponent(Effect);
      }
    }
  }

  getEffectIndex(effect: Effect) {
    let splitName = effect.name.split("<");
    for (let i = 0; i < this.activeEffects.length; i++) {
      const testedEffect = this.activeEffects[i].getComponent(Effect);
      let splitTestedName = testedEffect.name.split("<");
      if (splitName[1] == splitTestedName[1]) {
        return i;
      }
    }
    for (let i = 0; i < this.passiveEffects.length; i++) {
      const passiveEffect = this.passiveEffects[i].getComponent(Effect);

      let splitTestedName = passiveEffect.name.split("<");
      if (splitName[1] == splitTestedName[1]) {
        return i;
      }
    }
  }

  async collectEffectFromNum(cardPlayed: cc.Node) {
    const multiEffectCollector: MultiEffect = this.multiEffectCollector.getComponent(
      DataCollector
    );
    let chosenEffect = await multiEffectCollector.collectData(cardPlayed);
    return chosenEffect;
  }

  async getServerEffect(
    cardPlayedData: {
      cardPlayerId: number;
      cardId: number;
    },
    cardEffectIndex?: number
  ): Promise<ServerEffect> {
    cc.log(cardPlayedData.cardPlayerId);
    let cardPlayed = CardManager.getCardById(cardPlayedData.cardId);
    let cardEffect: Effect;
    let effectType;
    cc.log(cardEffectIndex);
    if (cardEffectIndex != null) {
      cc.log(cardEffectIndex);
      effectType = ITEM_TYPE.PASSIVE;
      cardEffect = this.passiveEffects[cardEffectIndex].getComponent(Effect);
    } else {
      effectType = ITEM_TYPE.ACTIVE;

      if (this.hasMultipleEffects) {
        cardEffect = await this.collectEffectFromNum(cardPlayed);
      } else {
        cardEffect = this.activeEffects[0].getComponent(Effect);
      }
    }
    cc.log(cardEffect);
    this.effectData = await this.collectEffectData(cardEffect, cardPlayedData);

    let effectIndex = this.getEffectIndex(cardEffect);
    return new Promise((resolve, reject) => {
      resolve(
        new ServerEffect(
          cardEffect.effectName,
          this.effectData,
          effectIndex,
          cardPlayedData.cardPlayerId,
          cardPlayedData.cardId,
          effectType
        )
      );
    });
  }

  async doEffectFromServerEffect(
    currentServerEffect: ServerEffect,
    allServerEffects: ServerEffect[]
  ): Promise<ServerEffect[]> {
    cc.log(
      "doing effect: " +
        currentServerEffect.effectName +
        " of card: " +
        this.node.name
    );

    this.effectData = currentServerEffect.cardEffectData;

    this.cardPlayerId = currentServerEffect.cardPlayerId;

    this.serverEffectStack = allServerEffects;
    let serverEffectStack;
    if (currentServerEffect.effctType == ITEM_TYPE.ACTIVE) {
      serverEffectStack = await this.doEffectByNum(
        currentServerEffect.cardEffectNum
      );
    } else {
      serverEffectStack = await this.doEffectByNum(
        currentServerEffect.cardEffectNum,
        true
      );
    }
    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }

  // LIFE-CYCLE CALLBACKS:

  //  onLoad () {

  //  }

  start() {}

  // update (dt) {}
}

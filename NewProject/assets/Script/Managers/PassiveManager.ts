import { beforeMethod, afterMethod } from "kaop-ts";
import {
  CONDITION_TYPE,
  COLORS,
  PASSIVE_TYPE
} from "../Constants";

import CardEffect from "../Entites/CardEffect";
import Player from "../Entites/GameEntities/Player";
import PlayerManager from "./PlayerManager";
import Monster from "../Entites/CardTypes/Monster";
import Effect from "../CardEffectComponents/CardEffects/Effect";
import Card from "../Entites/GameEntities/Card";
import CardManager from "./CardManager";
import Server from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";

import { Pointcut, Aspect, Before, Joinpoint } from "@ts-ioc/aop"
import { IClassMethodDecorator, TypeMetadata, createClassMethodDecorator, MethodMetadata } from "@ts-ioc/core";
import { throws } from "assert";
import DataInterpreter, { PassiveEffectData } from "./DataInterpreter";

const { ccclass, property } = cc._decorator;

@ccclass

export default class PassiveManager extends cc.Component {
  static passiveItems: cc.Node[] = [];

  static allBeforeEffects: Effect[] = [];
  static allAfterEffects: Effect[] = [];
  static oneTurnBeforeEffects: Effect[] = [];
  static oneTurnAfterEffects: Effect[] = [];
  static inPassivePhase: boolean = false;

  static inRegisterPhase: boolean = false


  static getPassivesinfo() {
    let passiveItemsCardIds = this.passiveItems.map(card => card.getComponent(Card)._cardId)
    return {
      allBeforeEffects: this.allBeforeEffects,
      allAfterEffects: this.allAfterEffects,
      oneTurnBeforeEffects: this.oneTurnBeforeEffects,
      oneTurnAfterEffects: this.oneTurnAfterEffects,
      passiveItemsCardIds: passiveItemsCardIds
    }
  }

  static updateInfo(info) {
    this.allAfterEffects = info.allAfterEffects;
    this.allBeforeEffects = info.allBeforeEffects;
    this.oneTurnAfterEffects = info.oneTurnAfterEffects;
    this.oneTurnBeforeEffects = info.oneTurnBeforeEffects;
    this.passiveItems = info.passiveItemsCardIds.map(id => { CardManager.getCardById(id, true) })
  }

  static async registerPassiveItem(itemToRegister: cc.Node, sendToServer: boolean) {
    if (this.inRegisterPhase) {
      let phaseOver = await this.waitForRegister()
    }
    this.inRegisterPhase = true;
    let cardEffect = itemToRegister.getComponent(CardEffect)
    if (itemToRegister.getComponent(CardEffect) != null) {

      if (cardEffect.passiveEffects.length > 0) {
        if (this.passiveItems.find(passiveItem => passiveItem == itemToRegister) == undefined) {
          this.passiveItems.push(itemToRegister);
          let cardPassives = cardEffect.passiveEffects.map(effectNode => {
            return effectNode.getComponent(Effect);
          });

          //this.allPassiveEffects.concat(cardPassives);
          for (let passive of cardPassives) {
            if (passive.passiveType == PASSIVE_TYPE.AFTER) {

              this.allAfterEffects.push(passive);

            } else {

              this.allBeforeEffects.push(passive);
            }
          }
          if (sendToServer) {
            let cardId = itemToRegister.getComponent(Card)._cardId
            Server.$.send(Signal.REGISTERPASSIVEITEM, { cardId: cardId })
          }
        }

      }
    }
    this.inRegisterPhase = false;

  }

  static async registerOneTurnPassiveEffect(effect: Effect, sendToServer: boolean) {
    if (this.inRegisterPhase) {
      let phaseOver = await this.waitForRegister()
    }
    this.inRegisterPhase = true;
    if (effect.passiveType == PASSIVE_TYPE.AFTER) {

      this.oneTurnAfterEffects.push(effect);

    } else {

      this.oneTurnBeforeEffects.push(effect);
    }

    if (sendToServer) {
      let card = effect.node.parent.getComponent(Card)
      let effectIndex = card.node.getComponent(CardEffect).getEffectIndexAndType(effect)
      let serverEffectData = DataInterpreter.convertToServerData(effect.condition.conditionData)
      let srvData = { cardId: card._cardId, effectIndex: effectIndex, conditionData: serverEffectData }
      Server.$.send(Signal.REGISTERONETURNPASSIVEEFFECT, srvData)
    }

    this.inRegisterPhase = false;
  }

  static async waitForRegister(): Promise<boolean> {
    //w8 for a server message with a while,after the message is recived (should be a stack of effects with booleans) resolve with stack of effects.
    return new Promise((resolve, reject) => {
      let check = () => {
        if (PassiveManager.inPassivePhase == false) {
          //  ActionManager.noMoreActionsBool = false;
          resolve(true);
        } else {
          setTimeout(check, 50);
        }
      };
      check.bind(this);
      setTimeout(check, 50);
    });
  }

  static isCardRegistered(card: cc.Node) {
    return this.passiveItems.includes(card);
  }

  static clearAllListeners() {
    this.allAfterEffects = [];
    this.passiveItems = [];
  }

  static async checkB4Passives(passiveMeta: PassiveMeta) {
    PassiveManager.inPassivePhase = true;
    let allPassiveEffects = PassiveManager.allBeforeEffects;
    allPassiveEffects = allPassiveEffects.concat(PassiveManager.oneTurnBeforeEffects)
    let allPassivesToActivate: Effect[] = [];
    for (let i = 0; i < allPassiveEffects.length; i++) {
      const passiveEffect = allPassiveEffects[i];
      cc.log(`test condition for ${passiveEffect.name}`)
      let isConditionTrue = await passiveEffect.condition.testCondition(passiveMeta);
      if (isConditionTrue) {
        cc.log('condition true')
        allPassivesToActivate.push(passiveEffect)
      } else {
      }
    }
    cc.log(allPassivesToActivate.map(effect => effect.name))
    let methodData = { continue: false, args: [] }
    if (allPassivesToActivate.length > 0) {

      let passiveData = await this.activateB4Passives(passiveMeta, allPassivesToActivate)
      methodData.continue = !passiveData.terminateOriginal
      methodData.args = passiveData.methodArgs;
    } else {
      methodData.continue = true
      methodData.args = passiveMeta.args;
    }

    PassiveManager.inPassivePhase = false;

    return methodData;
  }

  static async activateB4Passives(passiveMeta: PassiveMeta, passivesToActivate: Effect[]) {
    let cardToActivate: cc.Node;
    let passiveIndex
    let cardActivatorId;
    let newArgs: PassiveEffectData;
    for (const effect of passivesToActivate) {
      cc.log(`doing b4 passive effect ${effect.name}`)
      cardToActivate = effect.node.parent;
      passiveIndex = cardToActivate
        .getComponent(CardEffect)
        .getEffectIndexAndType(effect);
      if (cardToActivate.getComponent(Monster) == null) {
        let player = PlayerManager.getPlayerByCard(cardToActivate);
        cardActivatorId = player.playerId;
      } else {

        let monster = cardToActivate.getComponent(Card)
        cardActivatorId = monster._cardId;
        //  monster.activatePassive(monster.cardId, passiveIndex, false)
      }
      let serverEffect = await CardManager.activateCard(
        cardToActivate,
        cardActivatorId,
        passiveIndex.index
      );
      let passiveData
      if (newArgs == null) {
        passiveData = { terminateOriginal: false, newArgs: passiveMeta.args }
      } else {
        passiveData = { terminateOriginal: newArgs.terminateOriginal, newArgs: newArgs.methodArgs }
      }
      passiveData = DataInterpreter.makeEffectData(passiveData, cardToActivate, cardActivatorId, false)
      serverEffect.cardEffectData = passiveData;

      //all of the effect should return an object {terminateOriginal:boolean,args:altered function args}
      newArgs = await cardToActivate
        .getComponent(CardEffect)
        .doServerEffect(serverEffect, []);

    }

    return newArgs;
  }


  static async testForPassiveAfter(meta: PassiveMeta) {


    PassiveManager.inPassivePhase = true;
    let allPassiveEffects = PassiveManager.allAfterEffects;
    for (let i = 0; i < allPassiveEffects.length; i++) {
      const passiveEffect = allPassiveEffects[i];

      let activated: boolean
      cc.log(`test condition for ${passiveEffect.name}`)
      let isConditionTrue = await passiveEffect.condition.testCondition(meta);
      if (isConditionTrue) {
        cc.log('condition true')
        let cardActivated = passiveEffect.node.parent;
        let passiveIndex = cardActivated
          .getComponent(CardEffect)
          .getEffectIndexAndType(passiveEffect);

        if (cardActivated.getComponent(Monster) == null) {
          let player = PlayerManager.getPlayerByCard(cardActivated);

          if (player.node == PlayerManager.mePlayer) {
            activated = await player.activatePassive(
              cardActivated,
              true,
              passiveIndex.index
            );
          } else {
            activated = await player.activatePassive(
              cardActivated,
              false,
              passiveIndex.index
            );
          }
        } else {
          let monster = cardActivated.getComponent(Card)
          monster.activatePassive(monster._cardId, passiveIndex.index, false)
        }
      } else {
      }
    }
    PassiveManager.inPassivePhase = false;
    return meta.result;

  };


  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }


  // update (dt) {}
}

export class PassiveMeta {

  constructor(methodName: string, args: any[], result: any, methodScope: cc.Node) {
    this.args = args
    this.methodName = methodName;
    this.methodScope = methodScope;
    this.preventMethod = false;
    this.result = result;
  }

  methodName: string = "";
  args: any[] = [];
  result: any = null;
  preventMethod: boolean = false;
  methodScope: cc.Node = null;

}




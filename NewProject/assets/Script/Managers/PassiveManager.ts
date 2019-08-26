import { beforeMethod, afterMethod } from "kaop-ts";
import {
  CONDITION_TYPE,
  COLORS,
  PASSIVE_TYPE,
  PASSIVE_EVENTS
} from "../Constants";

import CardEffect from "../Entites/CardEffect";
import Player from "../Entites/GameEntities/Player";
import PlayerManager from "./PlayerManager";
import Monster from "../Entites/CardTypes/Monster";
import Effect from "../CardEffectComponents/CardEffects/Effect";
import Card from "../Entites/GameEntities/Card";
import CardManager from "./CardManager";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";

import { Pointcut, Aspect, Before, Joinpoint } from "@ts-ioc/aop"
import { IClassMethodDecorator, TypeMetadata, createClassMethodDecorator, MethodMetadata } from "@ts-ioc/core";
import { throws } from "assert";
import DataInterpreter, { PassiveEffectData } from "./DataInterpreter";
import ActivatePassiveEffect from "../StackEffects/Activate Passive Effect";
import MultiEffectRoll from "../CardEffectComponents/MultiEffectChooser/MultiEffectRoll";
import Stack from "../Entites/Stack";

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

  static passiveMethodData: PassiveMeta

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
            ServerClient.$.send(Signal.REGISTER_PASSIVE_ITEM, { cardId: cardId })
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
      ServerClient.$.send(Signal.REGISTER_ONE_TURN_PASSIVE_EFFECT, srvData)
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
      this.passiveMethodData = null;
      methodData.continue = !passiveData.preventMethod
      methodData.args = passiveData.args;
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
    this.passiveMethodData = passiveMeta
    let isPlayer = false;
    for (let i = 0; i < passivesToActivate.length; i++) {
      const effect = passivesToActivate[i];
      cc.log(`doing b4 passive effect ${effect.name}`)
      cardToActivate = effect.node.parent.parent;

      passiveIndex = cardToActivate
        .getComponent(CardEffect)
        .getEffectIndexAndType(effect);
      if (cardToActivate.getComponent(Monster) == null) {
        let player = PlayerManager.getPlayerByCard(cardToActivate);
        cardActivatorId = player.playerId;
        isPlayer = true
      } else {

        let monster = cardToActivate.getComponent(Card)
        cardActivatorId = monster._cardId;
        //  monster.activatePassive(monster.cardId, passiveIndex, false)
      }
      let activatePassiveEffect: ActivatePassiveEffect
      let hasLockingEffect;
      let collector = cardToActivate.getComponent(CardEffect).multiEffectCollector;
      if (collector != null && collector instanceof MultiEffectRoll) {
        hasLockingEffect = true;
      } else hasLockingEffect = false;
      if (isPlayer) {
        let player = PlayerManager.getPlayerByCard(cardToActivate);

        activatePassiveEffect = new ActivatePassiveEffect(player.character.getComponent(Card)._cardId, hasLockingEffect, cardActivatorId, cardToActivate, effect, false)

      } else {

        activatePassiveEffect = new ActivatePassiveEffect(cardToActivate.getComponent(Card)._cardId, hasLockingEffect, cardActivatorId, cardToActivate, effect, false)
      }
      if (passivesToActivate.length - i == 1) {
        cc.log(`should be last passive effect to be added to the stack for this action, begin resolving`)
        await Stack.addToStack(activatePassiveEffect, true)
      } else {
        cc.log(`should be more passives to add to stack, do not start resolving.`)
        await Stack.addToStackAbove(activatePassiveEffect)
      }

    }


    return this.passiveMethodData;
  }


  static async testForPassiveAfter(meta: PassiveMeta) {


    PassiveManager.inPassivePhase = true;
    let allPassiveEffects = PassiveManager.allAfterEffects;
    let passivesToActive = [];
    for (let i = 0; i < allPassiveEffects.length; i++) {
      const passive = allPassiveEffects[i];
      if (await passive.condition.testCondition(meta))
        passivesToActive.push(passive)
    }

    //  await allPassiveEffects.for(passive => { if (passive.condition.testCondition(meta)) return passive })
    this.passiveMethodData = meta;
    for (let i = 0; i < passivesToActive.length; i++) {
      const passiveEffect = passivesToActive[i];

      let activated: boolean


      let cardActivated = passiveEffect.node.parent;
      let passiveIndex = cardActivated
        .getComponent(CardEffect)
        .getEffectIndexAndType(passiveEffect);

      let hasLockingEffect;
      let collector = cardActivated.getComponent(CardEffect).multiEffectCollector;
      if (collector != null && collector instanceof MultiEffectRoll) {
        hasLockingEffect = true;
      } else hasLockingEffect = false;
      let activatePassiveEffect: ActivatePassiveEffect;
      if (cardActivated.getComponent(Monster) == null) {
        let player = PlayerManager.getPlayerByCard(cardActivated);
        activatePassiveEffect = new ActivatePassiveEffect(player.character.getComponent(Card)._cardId, hasLockingEffect, player.playerId, cardActivated, passiveEffect, false)

      } else {
        let monster = cardActivated.getComponent(Card)
        activatePassiveEffect = new ActivatePassiveEffect(monster._cardId, hasLockingEffect, monster._cardId, cardActivated, passiveEffect, false)
      }
      if (passivesToActive.length - i == 1) {
        cc.log(`should be last passive effect to be added to the stack for this action, begin resolving`)
        await Stack.addToStack(activatePassiveEffect, true)
      } else {
        cc.log(`should be more passives to add to stack, do not start resolving.`)
        await Stack.addToStackAbove(activatePassiveEffect)
      }
    }


    PassiveManager.inPassivePhase = false;
    return this.passiveMethodData.result;

  };


  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }


  // update (dt) {}
}

export class PassiveMeta {

  constructor(passiveEvent: PASSIVE_EVENTS, args: any[], result: any, methodScope: cc.Node) {
    this.args = args
    this.passiveEvent = passiveEvent;
    this.methodScope = methodScope;
    this.preventMethod = false;
    this.result = result;
  }

  passiveEvent: PASSIVE_EVENTS = null;
  args: any[] = [];
  result: any = null;
  preventMethod: boolean = false;
  methodScope: cc.Node = null;

}




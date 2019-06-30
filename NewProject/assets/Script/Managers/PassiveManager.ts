import { beforeMethod, afterMethod } from "kaop-ts";
import {
  CONDITION_TYPE,
  printMethodStarted,
  COLORS,
  PASSIVE_TYPE
} from "../Constants";
import PassiveEffect from "../PassiveEffects/PassiveEffect";
import CardEffect from "../Entites/CardEffect";
import Player from "../Entites/GameEntities/Player";
import PlayerManager from "./PlayerManager";
import Monster from "../Entites/CardTypes/Monster";
import Effect from "../CardEffectComponents/CardEffects/Effect";
import Card from "../Entites/GameEntities/Card";
import CardManager from "./CardManager";
import Server from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";

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
      let effectIndex = card.node.getComponent(CardEffect).getEffectIndex(effect)
      let srvData = { cardId: card._cardId, effectIndex: effectIndex, conditionData: effect.condition.conditionData }
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

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}

export const testForPassiveBefore = (methodCallerName: string) =>
  beforeMethod(async meta => {

    ;
    PassiveManager.inPassivePhase = true;
    let allPassiveEffects = PassiveManager.allBeforeEffects;
    allPassiveEffects = allPassiveEffects.concat(PassiveManager.oneTurnBeforeEffects)
    let className = meta.scope;
    let activated;
    let allPassivesToActivate: Effect[] = [];

    for (let i = 0; i < allPassiveEffects.length; i++) {

      const passiveEffect = allPassiveEffects[i];
      ;
      let isConditionTrue = passiveEffect.condition.testCondition(meta);
      if (isConditionTrue) {

        allPassivesToActivate.push(passiveEffect)

        // let cardActivated = passiveEffect.node.parent;
        // let passiveIndex = cardActivated
        //   .getComponent(CardEffect)
        //   .getEffectIndex(passiveEffect);

        // if (cardActivated.getComponent(Monster) == null) {
        //   let player = PlayerManager.getPlayerByCard(cardActivated);

        //   if (player.node == PlayerManager.mePlayer) {
        //     activated = await player.activatePassive(
        //       cardActivated,
        //       true,
        //       passiveIndex
        //     );
        //   } else {
        //     activated = await player.activatePassive(
        //       cardActivated,
        //       false,
        //       passiveIndex
        //     );
        //   }
        // } else {
        //   
        //   let monster = cardActivated.getComponent(Card)
        //   monster.activatePassive(monster.cardId, passiveIndex, false)
        // }
      } else {

      }

    }

    PassiveManager.inPassivePhase = false;
    meta.commit(allPassivesToActivate);
  });

export const activatePassiveB4 = beforeMethod(async meta => {

  let effectsToActivate: Effect[] = meta.args.pop();
  if (effectsToActivate.length > 0) {
    let cardToActivate: cc.Node;
    let passiveIndex
    let cardActivatorId;
    let newArgs;
    for (const effect of effectsToActivate) {

      cardToActivate = effect.node.parent;
      passiveIndex = cardToActivate
        .getComponent(CardEffect)
        .getEffectIndex(effect);
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
        passiveIndex
      );
      let passiveData
      if (newArgs == null) {

        passiveData = { terminateOriginal: false, newArgs: meta.args }
      } else {
        passiveData = { terminateOriginal: newArgs.terminateOriginal, newArgs: newArgs.newArgs }
      }
      serverEffect.cardEffectData = passiveData;

      //all of the effect should return an object {terminateOriginal:boolean,args:altered function args}
      newArgs = await cardToActivate
        .getComponent(CardEffect)
        .doServerEffect(serverEffect, []);

    }
    if (newArgs.terminateOriginal) {

      meta.prevent()
    } else {

      meta.args = newArgs.newArgs;

    }

  }
  meta.commit()

})


export const testForPassiveAfter = (methodCallerName: string) =>
  afterMethod(async meta => {

    ;
    PassiveManager.inPassivePhase = true;
    let allPassiveEffects = PassiveManager.allAfterEffects;
    let className = meta.scope;
    let activated;


    for (const passiveEffect of allPassiveEffects) {
      let isConditionTrue = passiveEffect.condition.testCondition(meta);
      if (isConditionTrue) {
        let cardActivated = passiveEffect.node.parent;
        let passiveIndex = cardActivated
          .getComponent(CardEffect)
          .getEffectIndex(passiveEffect);

        if (cardActivated.getComponent(Monster) == null) {
          let player = PlayerManager.getPlayerByCard(cardActivated);

          if (player.node == PlayerManager.mePlayer) {
            activated = await player.activatePassive(
              cardActivated,
              true,
              passiveIndex
            );
          } else {
            activated = await player.activatePassive(
              cardActivated,
              false,
              passiveIndex
            );
          }
        } else {

          let monster = cardActivated.getComponent(Card)
          monster.activatePassive(monster._cardId, passiveIndex, false)
        }
      } else {
      }
    }
    PassiveManager.inPassivePhase = false;
    meta.commit();
  });

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

const { ccclass, property } = cc._decorator;

@ccclass
export default class PassiveManager extends cc.Component {
  static passiveItems: cc.Node[] = [];

  static allBeforeEffects: Effect[] = [];
  static allAfterEffects: Effect[] = [];
  static inPassivePhase: boolean = false;

  static inRegisterPhase: boolean = false

  static async registerPassiveItem(itemToRegister: cc.Node) {
    if (this.inRegisterPhase) {
      let phaseOver = await this.waitForRegister()
    }
    this.inRegisterPhase = true;
    if (itemToRegister.getComponent(CardEffect) != null) {
      let cardEffect = itemToRegister.getComponent(CardEffect);

      if (cardEffect.passiveEffects.length > 0) {
        if (this.passiveItems.find(passiveItem => passiveItem == itemToRegister) == undefined) {
          this.passiveItems.push(itemToRegister);
          let cardPassives = cardEffect.passiveEffects.map(effectNode => {
            return effectNode.getComponent(Effect);
          });

          //this.allPassiveEffects.concat(cardPassives);
          for (let passive of cardPassives) {
            if (passive.passiveType == PASSIVE_TYPE.AFTER) {
              //cc.log('added ' + itemToRegister.name + ' effect to afterEffects')
              this.allAfterEffects.push(passive);
              //cc.log(this.allAfterEffects)
            } else {
              //cc.log('added ' + itemToRegister.name + ' effect to beforeEffect')
              this.allBeforeEffects.push(passive);
            }
          }
        }
      }
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
    //cc.log("test for passives before");
    //cc.log(methodCallerName);
    PassiveManager.inPassivePhase = true;
    let allPassiveEffects = PassiveManager.allBeforeEffects;
    let className = meta.scope;
    let activated;

    for (const passiveEffect of allPassiveEffects) {
      //cc.log(passiveEffect);
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
          //cc.log("do when monster effect is activated");
        }
      } else {
      }
    }

    PassiveManager.inPassivePhase = false;
    meta.commit();
  });

//cc.log("test for passives before");
export const testForPassiveAfter = (methodCallerName: string) =>
  afterMethod(async meta => {
    //cc.log("test for passives after");
    //cc.log(methodCallerName);
    PassiveManager.inPassivePhase = true;
    let allPassiveEffects = PassiveManager.allAfterEffects;
    let className = meta.scope;
    let activated;

    //cc.log(allPassiveEffects)
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
          //cc.log("do when monster effect is activated");
          let monster = cardActivated.getComponent(Card)
          monster.activatePassive(monster.cardId, passiveIndex, false)
        }
      } else {
      }
    }
    PassiveManager.inPassivePhase = false;
    meta.commit();
  });

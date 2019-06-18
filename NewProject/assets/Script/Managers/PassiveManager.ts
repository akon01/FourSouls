import { beforeMethod, afterMethod } from "kaop-ts";
import { CONDITION_TYPE, printMethodStarted, COLORS } from "../Constants";
import PassiveEffect from "../PassiveEffects/PassiveEffect";
import CardEffect from "../Entites/CardEffect";
import Player from "../Entites/GameEntities/Player";
import PlayerManager from "./PlayerManager";
import Monster from "../Entites/CardTypes/Monster";
import Effect from "../CardEffectComponents/CardEffects/Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PassiveManager extends cc.Component {
  static passiveItems: cc.Node[] = [];

  static allPassiveEffects: Effect[] = [];
  static inPassivePhase: boolean = false;

  static registerPassiveItem(itemToRegister: cc.Node) {
    if (itemToRegister.getComponent(CardEffect) != null) {
      let cardEffect = itemToRegister.getComponent(CardEffect);

      if (cardEffect.passiveEffects.length > 0) {
        this.passiveItems.push(itemToRegister);
        let cardPassives = cardEffect.passiveEffects.map(effectNode => {
          return effectNode.getComponent(Effect);
        });

        //this.allPassiveEffects.concat(cardPassives);
        for (let i = 0; i < cardPassives.length; i++) {
          const passive = cardPassives[i];
          this.allPassiveEffects.push(passive);
        }
      }
    }
  }

  static clearAllListeners() {
    this.allPassiveEffects = [];
    this.passiveItems = [];
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {}

  // update (dt) {}
}

export const testForPassiveBefore = (methodCallerName: string) =>
  beforeMethod(async meta => {
    cc.log(methodCallerName);
    PassiveManager.inPassivePhase = true;
    cc.log("test for passives");
    let allPassiveEffects = PassiveManager.allPassiveEffects;
    let className = meta.scope;
    let activated;

    cc.log(allPassiveEffects);
    for (const passiveEffect of allPassiveEffects) {
      cc.log(passiveEffect);
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
          cc.log("do when monster effect is activated");
        }
      } else {
      }
    }

    PassiveManager.inPassivePhase = false;
    meta.commit();
  });

export const testForPassiveAfter = () =>
  afterMethod(async meta => {
    PassiveManager.inPassivePhase = true;
    let allPassiveEffects = PassiveManager.allPassiveEffects;
    let className = meta.scope;
    let activated;

    cc.log(allPassiveEffects);
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
          cc.log("do when monster effect is activated");
        }
      } else {
      }
    }
    PassiveManager.inPassivePhase = false;
    meta.commit();
  });

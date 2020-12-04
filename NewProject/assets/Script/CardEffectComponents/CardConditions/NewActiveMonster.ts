import { PASSIVE_EVENTS } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import Condition from "./Condition";
import TurnsManager from "../../Managers/TurnsManager";
import Card from "../../Entites/GameEntities/Card";
import Monster from "../../Entites/CardTypes/Monster";
import CardEffect from "../../Entites/CardEffect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewActiveMonster extends Condition {

  event = PASSIVE_EVENTS.NEW_ACTIVE_MONSTER

  @property
  isOwnerTurnOnly: boolean = true;

  @property
  isOnlyForAttackableMonsters: boolean = false;

  @property
  isSpecificNewMonster: boolean = true;

  @property({
    visible: function (this: NewActiveMonster) {
      return this.isSpecificNewMonster
    }, type: Monster
  })
  specificNewMonster: Monster = null

  @property
  isSpecificNotNewMonster: boolean = false;

  @property({
    visible: function (this: NewActiveMonster) {
      return this.isSpecificNotNewMonster
    }, type: Monster
  })
  specificNotNewMonster: Monster = null

  @property
  notInConcurentData: boolean = false;

  async testCondition(meta: PassiveMeta) {
    const turnPlayer: Player = TurnsManager.currentTurn.getTurnPlayer()
    const thisCard = Card.getCardNodeByChild(this.node)
    const cardOwner = PlayerManager.getPlayerByCard(thisCard);
    const newMosnterCard = meta.args[0] as cc.Node
    let result = true;
    const monsterComp = newMosnterCard.getComponent(Monster);
    if (this.isSpecificNewMonster) {
      if (this.specificNewMonster != monsterComp) {
        result = false;
      }
    }
    if (this.isSpecificNotNewMonster) {
      if (this.specificNotNewMonster == monsterComp) {
        result = false
      }
    }
    if (this.isOnlyForAttackableMonsters) {
      if (monsterComp.isNonMonster || monsterComp.isMonsterWhoCantBeAttacked) {
        result = false;
      }
    }
    if (this.notInConcurentData) {
      const concurentData = thisCard.getComponent(CardEffect).concurentEffectData;
      if (concurentData != null) {
        debugger
        const allTargets = concurentData.getAllTargets().nodes
        if (allTargets.includes(monsterComp.node)) {
          result = false
        }
      }
    }
    if (this.isOwnerTurnOnly) {
      if (turnPlayer.name != cardOwner.name) {
        result = false
      }
    }
    return result;
  }
}

import { TARGETTYPE } from "../../Constants";
import Monster from "../../Entites/CardTypes/Monster";
import Player from "../../Entites/GameEntities/Player";
import Stack from "../../Entites/Stack";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import TurnsManager from "../../Managers/TurnsManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AddAttackOpportunity extends Effect {
  effectName = "AddAttackOpportunity";

  @property(cc.Integer)
  numOfTimes: number = 0;

  @property
  isOnlyMonsterDeck: boolean = false;

  @property
  makeMust: boolean = false;

  @property({
    visible: function (this: AddAttackOpportunity) {
      return (this.makeMust) ? true : false
    }
  })
  makeSpecificMonsterMust: boolean = false;

  @property({
    visible: function (this: AddAttackOpportunity) {
      return (this.makeSpecificMonsterMust) ? true : false
    }
  })
  specificMonsterToMake: Monster = null

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    const targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (targetPlayerCard == null) {
      throw new Error(`target player is null`)
    } else {
      const player: Player = PlayerManager.getPlayerByCard(targetPlayerCard as cc.Node)
      if (!this.isOnlyMonsterDeck) {
        player.attackPlays += this.numOfTimes
        //if the player must attack a monster
        if (this.makeMust) {
          player._mustAttackPlays += this.numOfTimes
          if (this.makeSpecificMonsterMust) {
            player._mustAttackMonsters.push(this.specificMonsterToMake)
          }
        }
      } else {
        //if the player must attack the monster deck
        player._attackDeckPlays += this.numOfTimes;
        if (this.makeMust) {
          player._mustDeckAttackPlays += this.numOfTimes
        }
      }
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }

}

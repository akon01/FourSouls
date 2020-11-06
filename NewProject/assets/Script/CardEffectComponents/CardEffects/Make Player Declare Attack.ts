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
export default class MakePlayerDeclareAttack extends Effect {
  effectName = "AddAttackOpportunity";


  @property
  makeSpecificMonsterMust: boolean = false;

  @property({
    visible: function (this: MakePlayerDeclareAttack) {
      return (this.makeSpecificMonsterMust) ? true : false
    }
  ,type:Monster})
  specificMonsterToDeclareAttackOn: Monster = null

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
          if (this.makeSpecificMonsterMust) {
            await player.declareAttack(this.specificMonsterToDeclareAttackOn.node,true)
          }  else {
            await player.declareAttack(data.getTarget(TARGETTYPE.MONSTER) as cc.Node,true)
          }
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }

}

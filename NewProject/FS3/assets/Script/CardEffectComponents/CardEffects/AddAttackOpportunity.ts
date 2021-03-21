import { _decorator, CCInteger, Node } from 'cc';
const { ccclass, property } = _decorator;

import { TARGETTYPE } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";

@ccclass('AddAttackOpportunity')
export class AddAttackOpportunity extends Effect {
  effectName = "AddAttackOpportunity";
  @property(CCInteger)
  numOfTimes: number = 0;
  @property
  isOnlyMonsterDeck: boolean = false;
  @property
  makeMust: boolean = false;
  @property({
    visible: function (this: AddAttackOpportunity) {
      return this.makeMust
    }
  })
  makeSpecificMonsterMust: boolean = false;
  @property({
    visible: function (this: AddAttackOpportunity) {
      return this.makeSpecificMonsterMust
    }
  })
  specificMonsterToMake: Monster | null = null



  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    if (!data) { debugger; throw new Error("No Data!"); }
    const targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (targetPlayerCard == null) {
      throw new Error(`target player is null`)
    } else {
      const player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetPlayerCard as Node)!
      if (!this.isOnlyMonsterDeck) {
        player.attackPlays += this.numOfTimes
        // if the player must attack a monster
        if (this.makeMust) {
          player._mustAttackPlays += this.numOfTimes
          if (this.makeSpecificMonsterMust) {
            if (!this.specificMonsterToMake) { debugger; throw new Error("No Specific MOnster Set"); }

            player._mustAttackMonsters.push(this.specificMonsterToMake)
          }
        }
      } else {
        // if the player must attack the monster deck
        player._attackDeckPlays += this.numOfTimes;
        if (this.makeMust) {
          player._mustDeckAttackPlays += this.numOfTimes
        }
      }
    }

    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}


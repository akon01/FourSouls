import { _decorator, CCInteger, Node } from 'cc';
const { ccclass, property } = _decorator;

import { TARGETTYPE } from "../../Constants";
import { Monster } from "../../Entites/CardTypes/Monster";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
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
  numOfTimes = 0;
  @property
  isOnlyMonsterDeck = false;
  @property
  makeMust = false;
  @property({
    visible: function (this: AddAttackOpportunity) {
      return this.makeMust
    }
  })
  makeSpecificMonsterMust = false;
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
  doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

    if (!data) { debugger; throw new Error("No Data!"); }
    const targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (targetPlayerCard == null) {
      throw new CardEffectTargetError(`target player is null`, true, data, stack)
    } else {
      const player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetPlayerCard as Node)!
      const numOfTimes = this.getQuantityInRegardsToBlankCard(player.node, this.numOfTimes)
      if (!this.isOnlyMonsterDeck) {
        player.attackPlays += numOfTimes
        // if the player must attack a monster
        if (this.makeMust) {
          player._mustAttackPlays += numOfTimes
          if (this.makeSpecificMonsterMust) {
            if (!this.specificMonsterToMake) { debugger; throw new Error("No Specific MOnster Set"); }

            player._mustAttackMonsters.push(this.specificMonsterToMake)
          }
        }
      } else {
        // if the player must attack the monster deck
        player._attackDeckPlays += numOfTimes
        if (this.makeMust) {
          player._mustDeckAttackPlays += numOfTimes
        }
      }
    }

    if (data instanceof PassiveEffectData) { return Promise.resolve(data) }
    return Promise.resolve(WrapperProvider.stackWrapper.out._currentStack)
  }
}


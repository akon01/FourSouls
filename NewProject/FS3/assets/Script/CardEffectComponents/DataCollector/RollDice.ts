import { Node, _decorator } from 'cc';
import { ROLL_TYPE } from '../../Constants';
import { Card } from '../../Entites/GameEntities/Card';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { RollDiceStackEffect } from '../../StackEffects/RollDIce';
import { DataCollector } from './DataCollector';

const { ccclass, property } = _decorator;


@ccclass('RollDiceDataCollector')
export class RollDiceDataCollector extends DataCollector {
  collectorName = "RollDiceDataCollector";
  isEffectChosen = false;
  cardChosen: Node | null = null;
  playerId: number | null = null;
  rollType: ROLL_TYPE = ROLL_TYPE.ATTACK;
  hasSubAction = true;
  /**
   *
   * @param data cardPlayerId:Player who played the card
   * @returns {target:cc.node of the player who played the card}
   */
  async collectData(data: {
    cardPlayerId: number;
    cardId: number;
  }): Promise<number> {
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardPlayerId)!
    const currentStackEffect = WrapperProvider.stackWrapper.out.getCurrentResolvingStackEffect()!
    const diceRoll = new RollDiceStackEffect(player.character!.getComponent(Card)!._cardId, currentStackEffect)
    // let diceRoll = new RollDice();
    await WrapperProvider.stackWrapper.out.addToStack(diceRoll, true)
    const numberRolled = currentStackEffect.LockingResolve;
    return numberRolled
  }
}

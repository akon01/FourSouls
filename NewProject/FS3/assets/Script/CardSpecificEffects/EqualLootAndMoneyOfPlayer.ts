import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { ActiveEffectData } from "../Managers/ActiveEffectData";
import { TARGETTYPE } from "../Constants";
import { Player } from "../Entites/GameEntities/Player";
import { PlayerManager } from "../Managers/PlayerManager";
import { CardManager } from "../Managers/CardManager";
import { Deck } from "../Entites/GameEntities/Deck";
import { WrapperProvider } from '../Managers/WrapperProvider';

@ccclass('EqualLootAndMoneyOfPlayer')
export class EqualLootAndMoneyOfPlayer extends Effect {
  effectName = "EqualLootAndMoneyOfPlayer";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData) {

    if (!data) { debugger; throw new Error("No Data"); }

    let targetPlayersCards = data.getTargets(TARGETTYPE.PLAYER)
    if (targetPlayersCards.length == 0) {
      throw new Error(`target players is null`)
    } else {
      let players: Player[] = []
      for (const playerCard of targetPlayersCards) {
        if (playerCard instanceof Node) {
          players.push(WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard)!)
        }
      }
      let rewardedPlayer = players[0]
      let playerToEqualTo = players[1]

      const cardDiff = playerToEqualTo.getHandCards().length - rewardedPlayer.getHandCards().length
      for (let i = 0; i < cardDiff; i++) {
        let loot = WrapperProvider.cardManagerWrapper.out.lootDeck.getComponent(Deck)!.drawCard(true)
        await rewardedPlayer.gainLoot(loot, true)
      }
      let moneyDiff = playerToEqualTo.coins - rewardedPlayer.coins
      if (moneyDiff < 0) moneyDiff = 0;
      await rewardedPlayer.changeMoney(moneyDiff, true)
    }
    return stack
  }
}
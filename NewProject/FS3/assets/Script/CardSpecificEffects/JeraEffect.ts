import { _decorator, Node, log } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { DataCollector } from "../CardEffectComponents/DataCollector/DataCollector";
import { Deck } from "../Entites/GameEntities/Deck";
import { MonsterField } from "../Entites/MonsterField";
import { BattleManager } from "../Managers/BattleManager";
import { CardManager } from "../Managers/CardManager";
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "../Constants";
import { Player } from "../Entites/GameEntities/Player";
import { PlayerManager } from "../Managers/PlayerManager";
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { WrapperProvider } from '../Managers/WrapperProvider';


@ccclass('JeraEffect')
export class JeraEffect extends Effect {
  effectName = "JeraEffect";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {
    let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER);
    if (targetPlayerCard == null) {
      console.log(`no target player`)
    } else {
      if (targetPlayerCard instanceof Node) {
        let player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetPlayerCard)!
        let numOfCardsToDraw = player.getHandCards().length
        for (let i = 0; i < numOfCardsToDraw; i++) {
          await player.drawCards(WrapperProvider.cardManagerWrapper.out.lootDeck, true)
        }
      }
    }
    return stack
  }
}
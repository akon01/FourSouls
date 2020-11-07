import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import Deck from "../Entites/GameEntities/Deck";
import MonsterField from "../Entites/MonsterField";
import BattleManager from "../Managers/BattleManager";
import CardManager from "../Managers/CardManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import { TARGETTYPE } from "../Constants";
import Player from "../Entites/GameEntities/Player";
import PlayerManager from "../Managers/PlayerManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JeraEffect extends Effect {
  effectName = "JeraEffect";

  @property({ type: DataCollector, override: true })
  dataCollector = null;


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data
  ) {

    let targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER);
    if (targetPlayerCard == null) {
      cc.log(`no target player`)
    } else {
      if (targetPlayerCard instanceof cc.Node) {
        let player: Player = PlayerManager.getPlayerByCard(targetPlayerCard)
        let numOfCardsToDraw = player.getHandCards().length
        for (let i = 0; i < numOfCardsToDraw; i++) {
          await player.drawCard(CardManager.lootDeck, true)
        }
      }
    }





    return stack
  }
}

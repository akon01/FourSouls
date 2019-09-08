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
export default class TemperanceEffect extends Effect {
  effectName = "TemperanceEffect";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  @property
  dmgToTake: number = 0;

  @property
  moneyToGet: number = 0


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
      let player: Player = PlayerManager.getPlayerByCard(targetPlayerCard as cc.Node)
      await player.getHit(this.dmgToTake, true)
      await player.changeMoney(this.moneyToGet, true)
    }


    return stack
  }
}

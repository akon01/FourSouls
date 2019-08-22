import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import { ActiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE } from "./../../Constants";
import Effect from "./Effect";


const { ccclass, property } = cc._decorator;

@ccclass
export default class LookAtPlayerHand extends Effect {
  chooseType = CHOOSE_CARD_TYPE.ALL_PLAYERS;

  effectName = "LookAtPlayerHand";

  /**
   *
   * @param data {target:PlayerId}
   */

  //@printMethodStarted(COLORS.RED)
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData
  ) {


    let playerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (playerCard instanceof cc.Node) {
      let player: Player = PlayerManager.getPlayerByCard(playerCard)
      if (player == null) {
        cc.log(`no player`)
      } else {
        let cardsToSee: cc.Node[] = player.handCards
        CardPreviewManager.getPreviews(cardsToSee, true)
      }
    }
    return stack
  }
}

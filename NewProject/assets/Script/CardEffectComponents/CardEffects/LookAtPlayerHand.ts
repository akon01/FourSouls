import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE } from "./../../Constants";
import Effect from "./Effect";


const { ccclass, property } = cc._decorator;

@ccclass
export default class LookAtPlayerHand extends Effect {
  chooseType = CHOOSE_CARD_TYPE.ALL_PLAYERS;

  effectName = "LookAtPlayerHand";

  @property
  multiTarget: boolean = false;



  /**
   *
   * @param data {target:PlayerId}
   */

  //@printMethodStarted(COLORS.RED)
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {

    if (this.multiTarget) {
      let playersCards = data.getTargets(TARGETTYPE.PLAYER)
      if (!(playersCards != null && playersCards.length > 0)) {
        throw `no targets`
      } else {
        let originalPlayer = PlayerManager.getPlayerByCard(data.effectCardPlayer)
        let players = (playersCards as cc.Node[]).map(card => PlayerManager.getPlayerByCard(card))
        for (let i = 0; i < players.length; i++) {
          const player = players[i];
          CardPreviewManager.getPreviews(player.handCards, true)
          await originalPlayer.giveNextClick()
          CardPreviewManager.removeFromCurrentPreviews(player.handCards)
        }
      }
    } else {



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
    }

    if (data instanceof PassiveEffectData) return data
    return stack
  }
}

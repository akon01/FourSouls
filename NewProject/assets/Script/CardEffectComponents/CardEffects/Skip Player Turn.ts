import { TARGETTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import Stack from "../../Entites/Stack";
import { ActiveEffectData, PassiveEffectData } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE } from "./../../Constants";
import Effect from "./Effect";

const { ccclass, property } = cc._decorator;

@ccclass('SkipPlayerTurn')
export default class SkipPlayerTurn extends Effect {
  chooseType = CHOOSE_CARD_TYPE.ALL_PLAYERS;

  effectName = "SkipPlayerTurn";

  @property
  multiTarget: boolean = false;

  @property({ override: true })
  optionalFlavorText: string = ''

  /**
   *
   * @param data {target:PlayerId}
   */

  //@printMethodStarted(COLORS.RED)
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {

    const originalPlayer = PlayerManager.getPlayerByCard(data.effectCardPlayer)
    if (this.multiTarget) {
      const playersCards = data.getTargets(TARGETTYPE.PLAYER)
      if (!(playersCards != null && playersCards.length > 0)) {
        throw new Error(`no targets`)
      } else {
        const players = (playersCards as cc.Node[]).map(card => PlayerManager.getPlayerByCard(card))
        for (let i = 0; i < players.length; i++) {
          const player = players[i];
          this.skipTurnForPlayer(player)
        }
      }
    } else {

      const playerCard = data.getTarget(TARGETTYPE.PLAYER)
      if (playerCard instanceof cc.Node) {
        const player: Player = PlayerManager.getPlayerByCard(playerCard)
        if (player == null) {
          throw new Error("No Target Found")
        } else {
          this.skipTurnForPlayer(player)
        }
      }
    }

    if (data instanceof PassiveEffectData) { return data }
    return Stack._currentStack
  }


  skipTurnForPlayer(player: Player) {
    player.skipTurn = true
  }


}

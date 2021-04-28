import { Node, _decorator } from 'cc';
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "../../Constants";
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;



@ccclass('SkipPlayerTurn')
export class SkipPlayerTurn extends Effect {
  chooseType = CHOOSE_CARD_TYPE.ALL_PLAYERS;
  effectName = "SkipPlayerTurn";
  @property
  multiTarget = false;
  @property({ override: true })
  optionalFlavorText = ''
  /**
   *
   * @param data {target:PlayerId}
   */
  //@printMethodStarted(COLORS.RED)
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data"); }
    const originalPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(data.effectCardPlayer!)
    if (this.multiTarget) {
      const playersCards = data.getTargets(TARGETTYPE.PLAYER)
      if (!(playersCards != null && playersCards.length > 0)) {
        throw new CardEffectTargetError(`No Player Targets found`, true, data, stack)
      } else {
        const players = (playersCards as Node[]).map(card => WrapperProvider.playerManagerWrapper.out.getPlayerByCard(card)!)
        for (let i = 0; i < players.length; i++) {
          const player = players[i];
          this.skipTurnForPlayer(player)
        }
      }
    } else {

      const playerCard = data.getTarget(TARGETTYPE.PLAYER)
      if (playerCard instanceof Node) {
        const player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard)!
        if (player == null) {
          throw new Error("No Target Found")
        } else {
          this.skipTurnForPlayer(player)
        }
      }
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
  skipTurnForPlayer(player: Player) {
    player.skipTurn = true
  }
}

import { Node, _decorator } from 'cc';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Player } from '../../Entites/GameEntities/Player';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('SetShowPlayerHandCards')
export class SetShowPlayerHandCards extends Effect {
  chooseType = CHOOSE_CARD_TYPE.ALL_PLAYERS;
  effectName = "SetShowPlayerHandCards";

  @property
  setToShow = false

  @property
  isOnlyForActivatingPlayer = true
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data"); }
    const playerCards = data.getTargets(TARGETTYPE.PLAYER) as Node[]
    if (playerCards.length == 0) {
      throw new CardEffectTargetError(`No Player Targets found`, true, data, stack)
    }
    for (const playerCard of playerCards) {
      this.setPlayerBool(WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard))
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }

  setPlayerBool(player: Player | null) {
    if (!player) throw new Error("No Player To Set!");

    player.hand?.setShowCardsBack(this.setToShow, !this.isOnlyForActivatingPlayer)
  }
}

import { CCInteger, Node, _decorator } from 'cc';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { CHOOSE_CARD_TYPE, TARGETTYPE } from "./../../Constants";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('StealMoney')
export class StealMoney extends Effect {
  chooseType = CHOOSE_CARD_TYPE.ALL_PLAYERS;
  effectName = "stealMoney";
  @property(CCInteger)
  numOfCoins = 0;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data"); }
    const stealer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(data.effectCardPlayer!)!
    const playerCard = data.getTarget(TARGETTYPE.PLAYER)
    if (!playerCard) {
      throw new CardEffectTargetError(`No Player Card Target found`, true, data, stack)
    }
    if (playerCard instanceof Node) {
      const targetPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard)!
      if (targetPlayer == null) {
        throw new Error(`no target player available`)
      } else {
        if (targetPlayer.coins >= this.numOfCoins) {
          await targetPlayer.changeMoney(-this.numOfCoins, true);
          await stealer.changeMoney(this.numOfCoins, true);
        } else {
          await stealer.changeMoney(targetPlayer.coins, true);
          await targetPlayer.changeMoney(-targetPlayer.coins, true);
        }
      }
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}

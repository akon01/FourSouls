import { _decorator, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { DataCollector } from "../CardEffectComponents/DataCollector/DataCollector";
import { Deck } from "../Entites/GameEntities/Deck";
import { Player } from "../Entites/GameEntities/Player";
import { CardManager } from "../Managers/CardManager";
import { PlayerManager } from "../Managers/PlayerManager";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";

@ccclass('AngelRoomEffect')
export class AngelRoomEffect extends Effect {
  effectName = "AngelRoomEffect";
  @property(CCInteger)
  numOfCoins = 0;
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: { numberRolled: number; cardPlayerId: number }
  ) {
    const activatingPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardPlayerId)!
    const trasureDeck = WrapperProvider.cardManagerWrapper.out.treasureDeck;
    const lootDeck = WrapperProvider.cardManagerWrapper.out.lootDeck;
    switch (data.numberRolled) {
      case 1:
        for (let i = 0; i < 2; i++) {

          const over = await activatingPlayer.addItem(trasureDeck, true, true);

        }
        break;
      case 2:
      case 3:
        await activatingPlayer.addItem(trasureDeck, true, true);
        break;
      case 4:
      case 5:
      case 6:
        let over = await activatingPlayer.drawCards(lootDeck, true);
        over = await activatingPlayer.drawCards(lootDeck, true);
        break;
      default:
        // for (let i = 0; i < 2; i++) {

        //   let over = await activatingPlayer.addItem(trasureTopCard, true, true);

        // }
        break;
    }
    return stack
  }
}

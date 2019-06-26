import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { ServerEffect } from "../Entites/ServerCardEffect";
import PlayerManager from "../Managers/PlayerManager";
import Player from "../Entites/GameEntities/Player";
import CardManager from "../Managers/CardManager";
import Deck from "../Entites/GameEntities/Deck";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AngelRoomEffect extends Effect {
  effectName = "AngelRoomEffect";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  @property(Number)
  numOfCoins: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    serverEffectStack: ServerEffect[],
    data: { numberRolled: number; cardPlayerId: number }
  ) {
    let activatingPlayer = PlayerManager.getPlayerById(
      data.cardPlayerId
    ).getComponent(Player);
    let trasureTopCard = CardManager.treasureDeck.getComponent(Deck).drawnCard;
    let lootDeck = CardManager.lootDeck;

    switch (data.numberRolled) {
      case 1:
        for (let i = 0; i < 2; i++) {
          cc.log('add item ' + (i + 1))
          let over = await activatingPlayer.addItem(trasureTopCard, false, true);
          cc.log('add item ' + (i + 1) + ' finished')
        }
        break;
      case 2:
      case 3:
        activatingPlayer.addItem(trasureTopCard, false, true);
        break;
      case 4:
      case 5:
      case 6:
        let over = await activatingPlayer.drawCard(lootDeck, true);
        over = await activatingPlayer.drawCard(lootDeck, true);
        break;
      default:

        break;
    }
    // let targetPlayer = PlayerManager.getPlayerById(data.target);
    // let player: Player = targetPlayer.getComponent(Player);
    // player.changeMoney(this.numOfCoins);

    return new Promise<ServerEffect[]>((resolve, reject) => {
      resolve(serverEffectStack);
    });
  }
}

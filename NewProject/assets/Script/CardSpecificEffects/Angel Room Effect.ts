import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import Deck from "../Entites/GameEntities/Deck";
import Player from "../Entites/GameEntities/Player";
import CardManager from "../Managers/CardManager";
import PlayerManager from "../Managers/PlayerManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AngelRoomEffect extends Effect {
  effectName = "AngelRoomEffect";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  @property(cc.Integer)
  numOfCoins: number = 0;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: { numberRolled: number; cardPlayerId: number }
  ) {
    const activatingPlayer = PlayerManager.getPlayerById(
      data.cardPlayerId
    )
    const trasureDeck = CardManager.treasureDeck;
    const lootDeck = CardManager.lootDeck;

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
        let over = await activatingPlayer.drawCard(lootDeck, true);
        over = await activatingPlayer.drawCard(lootDeck, true);
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

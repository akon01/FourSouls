import CardPreview from "../../Entites/CardPreview";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import Effect from "../CardEffects/Effect";
import DataCollector from "../DataCollector/DataCollector";
import PlayerManager from "../../Managers/PlayerManager";
import ActionManager from "../../Managers/ActionManager";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiEffectChoose extends DataCollector {
  collectorName = "MultiEffectChoose";

  /**
   *
   * @param data {cardPlayed}
   */
  async collectData(data: {
    cardPlayed: cc.Node;
    cardPlayerId: number;
  }): Promise<Effect> {
    cc.log(data)

    let preview = CardPreviewManager.addPreview(data.cardPlayed).node
    let player = PlayerManager.getPlayerById(data.cardPlayerId)
    await ActionManager.updateActionsForNotTurnPlayer(player.node)
    let effectChosen = await preview.getComponent(CardPreview).chooseEffectFromCard(data.cardPlayed);

    return effectChosen.getComponent(Effect)
  }
}

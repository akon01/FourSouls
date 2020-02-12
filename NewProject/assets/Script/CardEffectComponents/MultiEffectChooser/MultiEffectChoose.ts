import CardPreview from "../../Entites/CardPreview";
import ActionManager from "../../Managers/ActionManager";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import PlayerManager from "../../Managers/PlayerManager";
import Effect from "../CardEffects/Effect";
import DataCollector from "../DataCollector/DataCollector";

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

    const preview = CardPreviewManager.addPreview(data.cardPlayed).node
    const player = PlayerManager.getPlayerById(data.cardPlayerId)
    await ActionManager.updateActionsForNotTurnPlayer(player.node)
    const effectChosen = await preview.getComponent(CardPreview).chooseEffectFromCard(data.cardPlayed);
    //  DecisionMarker.$.showEffectChosen(Card.getCardNodeByChild(this.node), effectChosen, player.node, true)
    return effectChosen.getComponent(Effect)
  }
}

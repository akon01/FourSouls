import ActionManager from "../../Managers/ActionManager";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import PlayerManager from "../../Managers/PlayerManager";
import Effect from "../CardEffects/Effect";
import DataCollector from "../DataCollector/DataCollector";
import CardPreview from "../../Entites/Card Preview";
import CardEffect from "../../Entites/CardEffect";
import PreCondition from "../PreConditions/PreCondition";

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
    const preview = CardPreviewManager.addPreview(data.cardPlayed).node
    const player = PlayerManager.getPlayerById(data.cardPlayerId)
    await ActionManager.updateActionsForNotTurnPlayer(player.node)
    CardPreviewManager.setFalvorText("Select An Effect To Activate")
    const allActivatedEffects = [...data.cardPlayed.getComponent(CardEffect).activeEffects, ...data.cardPlayed.getComponent(CardEffect).paidEffects]
    const availableToActivateEffects = allActivatedEffects.filter(effect => {
      if (effect.getComponent(Effect).preCondition) {
        if (effect.getComponent(Effect).preCondition.getComponent(PreCondition).testCondition()) {
          return true
        }
      } else {
        return true
      }
    })

    if (availableToActivateEffects.length == 1) {
      return availableToActivateEffects[0].getComponent(Effect)
    }


    const effectChosen = await preview.getComponent(CardPreview).chooseEffectFromCard(data.cardPlayed, false);
    CardPreviewManager.setFalvorText("")
    //  DecisionMarker.$.showEffectChosen(Card.getCardNodeByChild(this.node), effectChosen, player.node, true)
    return effectChosen.getComponent(Effect)
  }
}

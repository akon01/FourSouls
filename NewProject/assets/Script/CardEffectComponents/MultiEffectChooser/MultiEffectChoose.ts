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
    const cardPlayerCardEffect = data.cardPlayed.getComponent(CardEffect);
    const allActivatedEffects = [...cardPlayerCardEffect.getActiveEffects(), ...cardPlayerCardEffect.getPaidEffects()]
    const availableToActivateEffects = allActivatedEffects.filter(effect => {
      const preCondition = effect.getPreCondition();
      if (preCondition) {
        if (preCondition.testCondition()) {
          return true
        }
      } else {
        return true
      }
    })

    if (availableToActivateEffects.length == 1) {
      return availableToActivateEffects[0]
    }


    const effectChosen = await preview.getComponent(CardPreview).chooseEffectFromCard(data.cardPlayed, false);
    CardPreviewManager.setFalvorText("")
    //  DecisionMarker.$.showEffectChosen(Card.getCardNodeByChild(this.node), effectChosen, player.node, true)
    return effectChosen
  }
}

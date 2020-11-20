import CardEffect from "../../Entites/CardEffect";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import Effect from "../CardEffects/Effect";
import PreCondition from "../PreConditions/PreCondition";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiPassiveEffectsChooseAsEffect extends Effect {
  effectName = "MultiPassiveEffectsChooseAsEffect";

  noDataCollector=true

  async chooseAnEffect(cardWithEffects: cc.Node) {
    const preview = CardPreviewManager.addPreview(cardWithEffects)
    const allActivatedEffects = [...cardWithEffects.getComponent(CardEffect).getPassiveEffects()]
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
    const effectChosen = await preview.chooseEffectFromCard(cardWithEffects, true);
    CardPreviewManager.setFalvorText("")
    //  DecisionMarker.$.showEffectChosen(Card.getCardNodeByChild(this.node), effectChosen, player.node, true)
    return effectChosen
  }

}

import CardEffect from "../../Entites/CardEffect";
import CardPreviewManager from "../../Managers/CardPreviewManager";
import Effect from "../CardEffects/Effect";
import PreCondition from "../PreConditions/PreCondition";


const { ccclass, property } = cc._decorator;

@ccclass
export default class MultiPassiveEffectsChooseAsEffect extends Effect {
  effectName = "MultiPassiveEffectsChooseAsEffect";

  async chooseAnEffect(cardWithEffects: cc.Node) {
    const preview = CardPreviewManager.addPreview(cardWithEffects)
    const allActivatedEffects = [...cardWithEffects.getComponent(CardEffect).passiveEffects]
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
    const effectChosen = await preview.chooseEffectFromCard(cardWithEffects, true);
    CardPreviewManager.setFalvorText("")
    //  DecisionMarker.$.showEffectChosen(Card.getCardNodeByChild(this.node), effectChosen, player.node, true)
    return effectChosen.getComponent(Effect)
  }

}

import { Node, _decorator } from 'cc';
import { CardEffect } from "../../Entites/CardEffect";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Effect } from "../CardEffects/Effect";
const { ccclass, property } = _decorator;


@ccclass('MultiPassiveEffectsChooseAsEffect')
export class MultiPassiveEffectsChooseAsEffect extends Effect {
  effectName = "MultiPassiveEffectsChooseAsEffect";

  noDataCollector = true

  async chooseAnEffect(cardWithEffects: Node) {
    const preview = WrapperProvider.cardPreviewManagerWrapper.out.addPreview(cardWithEffects)
    const allActivatedEffects = [...cardWithEffects.getComponent(CardEffect)!.getPassiveEffects()]
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
    WrapperProvider.cardPreviewManagerWrapper.out.setFalvorText("")
    //  decisionMarker._dm.showEffectChosen(WrapperProvider.cardManagerWrapper.out(this.node), effectChosen, player.node, true)
    return effectChosen
  }

}

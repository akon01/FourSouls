import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { Effect } from "../CardEffects/Effect";
import { DataCollector } from "../DataCollector/DataCollector";
import { CardPreview } from "../../Entites/CardPreview";
import { CardEffect } from "../../Entites/CardEffect";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { IMultiEffectChoose } from './IMultiEffectChoose';

@ccclass('MultiEffectChoose')
export class MultiEffectChoose extends IMultiEffectChoose {
  collectorName = "MultiEffectChoose";


  /**
   *
   * @param data {cardPlayed} 
   */
  async collectData(data: {
    cardPlayed: Node;
    cardPlayerId: number;
  }): Promise<Effect> {
    const preview = WrapperProvider.cardPreviewManagerWrapper.out.addPreview(data.cardPlayed).node
    const player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardPlayerId)!
    await WrapperProvider.actionManagerWrapper.out.updateActionsForNotTurnPlayer(player.node)
    WrapperProvider.cardPreviewManagerWrapper.out.setFalvorText("Select An Effect To Activate")
    const cardPlayerCardEffect = data.cardPlayed.getComponent(CardEffect)!;
    let allActivatedEffects = []
    if (this.isOnlyActives) {
      allActivatedEffects = [...cardPlayerCardEffect.getActiveEffects()]
    } else if (this.isOnlyPaid) {
      allActivatedEffects = [...cardPlayerCardEffect.getPaidEffects()]
    } else {
      allActivatedEffects = [...cardPlayerCardEffect.getActiveEffects(), ...cardPlayerCardEffect.getPaidEffects()]
    }
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
      //return availableToActivateEffects[0]
    }
    const effectChosen = await preview.getComponent(CardPreview)!.chooseEffectFromCard(data.cardPlayed, false);
    WrapperProvider.cardPreviewManagerWrapper.out.setFalvorText("")
    //  decisionMarker._dm.showEffectChosen(WrapperProvider.cardManagerWrapper.out(this.node), effectChosen, player.node, true)
    return effectChosen
  }
}
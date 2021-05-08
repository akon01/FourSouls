import { Component, instantiate, Node, Sprite, _decorator } from 'cc';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { TARGETTYPE } from "../Constants";
import { CardEffect } from '../Entites/CardEffect';
import { Card } from '../Entites/GameEntities/Card';
import { Player } from "../Entites/GameEntities/Player";
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { EffectRunner } from '../Managers/EffectRunner';
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { WrapperProvider } from '../Managers/WrapperProvider';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
const { ccclass, property } = _decorator;



@ccclass('PlaceboEffect')
export class PlaceboEffect extends Effect {
  effectName = "PlaceboEffect";
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData | PassiveEffectData
  ) {
    const thisOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(this.getEffectCard())!
    const targetEffectToCopy = data.getTarget(TARGETTYPE.EFFECT) as Effect
    const cardComponentsRetVals = this.copyCardEffectComponent(targetEffectToCopy)
    const cardEffectComp = cardComponentsRetVals.newNode.getComponent(CardEffect)!
    const effectData = await cardEffectComp.collectEffectData(cardComponentsRetVals.newEffect, { cardId: this.getEffectCard().getComponent(Card)!._cardId, cardPlayerId: thisOwner.playerId })
    const retVal = await EffectRunner.runEffect(cardComponentsRetVals.newEffect, stack, effectData)
    this.deleteCardEffectComponents(cardComponentsRetVals.newNode)
    return retVal!
  }

  copyCardEffectComponent(effect: Effect) {
    const effectCardNode = effect.node
    const effectIdxType = effectCardNode.getComponent(CardEffect)!.getEffectIndexAndType(effect)
    const newEffectCardNode = instantiate(effectCardNode)
    const spriteComponents = newEffectCardNode.getComponentsInChildren(Sprite)
    for (const spriteComp of spriteComponents) {
      spriteComp.enabled = false
    }
    this.node.addChild(newEffectCardNode)
    const newEffectToDo = newEffectCardNode.getComponent(CardEffect)!.getEffectByNumAndType(effectIdxType.index, effectIdxType.type)!
    return { newNode: newEffectCardNode, newEffect: newEffectToDo }
  }


  deleteCardEffectComponents(nodeToDelete: Node) {
    this.node.removeChild(nodeToDelete)
    nodeToDelete.destroy()
  }
}
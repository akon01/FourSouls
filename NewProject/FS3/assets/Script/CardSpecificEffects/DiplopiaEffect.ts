import { instantiate, Node, _decorator } from 'cc';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { TARGETTYPE } from '../Constants';
import { Card } from '../Entites/GameEntities/Card';
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
const { ccclass } = _decorator;


@ccclass('DiplopiaEffect')
export class DiplopiaEffect extends Effect {
  effectName = "DiplopiaEffect";

  /**
   *
   * @param data {target:PlayerId}
   */
  // eslint-disable-next-line 
  async doEffect(
    stack: StackEffectInterface[],
    data: ActiveEffectData
  ) {


    const cardToCopy = data.getTarget(TARGETTYPE.CARD)! as Node
    const newCard = instantiate(cardToCopy)
    // this.node.addChild(newCard)
    const copyCardComp = newCard.getComponent(Card)!;
    const thisCard = this.getEffectCard();
    const thisCardComp = thisCard.getComponent(Card)!;
    copyCardComp._cardId = thisCardComp._cardId
    // copyCardComp._isInHand = thisCardComp._isInHand
    // copyCardComp._isOnDesk = thisCardComp._isOnDesk
    // copyCardComp.souls = thisCardComp.souls
    // copyCardComp.type = thisCardComp.type
    // copyCardComp.isGoingToBePlayed = thisCardComp.isGoingToBePlayed
    // copyCardComp.isGoingToBeDestroyed = thisCardComp.isGoingToBeDestroyed
    // copyCardComp._isRequired = false
    // copyCardComp.setOwner(thisCardComp._ownedBy, true)
    // copyCardComp.hasCounter = thisCardComp.hasCounter
    copyCardComp.cardName = "Diplopia(" + copyCardComp.cardName + ")"
    // const thisCardItemComp = thisCard.getComponent(Item)!
    await thisCardComp._ownedBy!.addItem(copyCardComp.node, true, true)
    // const copyCardItemComp = newCard.getComponent(Item)!
    // copyCardItemComp.setLastOwner(thisCardComp._ownedBy!, true)

    this.node.active = false
    return stack
  }
}

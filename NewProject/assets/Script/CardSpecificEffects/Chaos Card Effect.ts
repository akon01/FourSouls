import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { TARGETTYPE } from "../Constants";
import { PassiveEffectData, ActiveEffectData } from "../Managers/DataInterpreter";
import PlayerManager from "../Managers/PlayerManager";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import CardManager from "../Managers/CardManager";
import Monster from "../Entites/CardTypes/Monster";
import Item from "../Entites/CardTypes/Item";
import Store from "../Entites/GameEntities/Store";
import PileManager from "../Managers/PileManager";
import Card from "../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChaosCardEffect extends Effect {
  effectName = "ChaosCardEffect";

  @property({ type: DataCollector, override: true })
  dataCollector = null;


  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData | ActiveEffectData
  ) {

    let target = data.getTarget(TARGETTYPE.CARD)
    if (!target) {
      throw `no target found`
    } else {
      if (PlayerManager.getPlayerByCard(target as cc.Node)) {
        await PlayerManager.getPlayerByCard(target as cc.Node).killPlayer(true, CardManager.getCardOwner(this.node.parent))
      } else if (PlayerManager.isAOwnedSoul(target as cc.Node)) {
        //Card Should Be Soul Card
        await PlayerManager.getPlayerByCard(target as cc.Node).loseSoul(target as cc.Node, true)
        await PileManager.addCardToPile((target as cc.Node).getComponent(Card).type, target as cc.Node, true)
      } else if ((target as cc.Node).getComponent(Monster)) {
        await (target as cc.Node).getComponent(Monster).kill(CardManager.getCardOwner(this.node.parent))
      } else if ((target as cc.Node).getComponent(Item)) {
        if (!CardManager.getCardOwner(target as cc.Node)) {
          await Store.$.discardStoreCard(target as cc.Node, true)
        }
        await PlayerManager.getPlayerByCard(target as cc.Node).loseItem(target as cc.Node)
      }
    }

    if (data instanceof PassiveEffectData) {
      return data
    }
    return stack
  }
}

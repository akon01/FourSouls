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
      throw new Error(`no target found`)
    } else {
      if (PlayerManager.isAOwnedSoul(target as cc.Node)) {
        //Card Should Be Soul Card
        await PlayerManager.getPlayerByCard(target as cc.Node).loseSoul(target as cc.Node, true)
        await PileManager.addCardToPile((target as cc.Node).getComponent(Card).type, target as cc.Node, true)
        if (data instanceof PassiveEffectData) {
          return data
        }
        return stack
      }
      if ((target as cc.Node).getComponent(Monster)) {
        await this.killMonster(target as cc.Node)
        //    await PileManager.addCardToPile((target as cc.Node).getComponent(Card).type, target as cc.Node, true)
        if (data instanceof PassiveEffectData) {
          return data
        }
        return stack
      }
      if ((target as cc.Node).getComponent(Item)) {
        const cardOwner = PlayerManager.getPlayerByCard(target as cc.Node);
        if (!CardManager.getCardOwner(target as cc.Node)) {
          await Store.$.removeFromStore(target as cc.Node, true)
          await PileManager.addCardToPile((target as cc.Node).getComponent(Card).type, target as cc.Node, true)
        } else if (!((target as cc.Node) == cardOwner.character || (target as cc.Node) == cardOwner.characterItem)) {
          await cardOwner.loseItem(target as cc.Node, true)
          await PileManager.addCardToPile((target as cc.Node).getComponent(Card).type, target as cc.Node, true)
          if (data instanceof PassiveEffectData) {
            return data
          }
          return stack
        }
      }
      if (PlayerManager.getPlayerByCard(target as cc.Node)) {
        await PlayerManager.getPlayerByCard(target as cc.Node).killPlayer(true, CardManager.getCardOwner(this.node.parent))
        if (data instanceof PassiveEffectData) {
          return data
        }
        return stack
      }


    }

    if (data instanceof PassiveEffectData) {
      return data
    }
    return stack
  }

  async killMonster(monster: cc.Node) {
    await monster.getComponent(Monster).kill(CardManager.getCardOwner(Card.getCardNodeByChild(this.node)))
  }

}

import { log, _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { CardManager } from "../../Managers/CardManager";
import { PlayerManager } from "../../Managers/PlayerManager";
import { PreCondition } from "./PreCondition";
import { Card } from "../../Entites/GameEntities/Card";
import { Item } from "../../Entites/CardTypes/Item";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('HasUnchargedItem')
export class HasUnchargedItem extends PreCondition {
  @property
  itemsNeeded: number = 1;
  testCondition(meta: any) {
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    const owner = WrapperProvider.cardManagerWrapper.out.getCardOwner(thisCard);
    if (owner) {
      const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(owner)!
      const playerItems = [...player.getActiveItems().filter(item => item.getComponent(Item)!.needsRecharge)]
      console.log(playerItems)
      if (playerItems.length >= this.itemsNeeded) {
        return true
      } else {
        return false
      }
    } else {
      throw new Error(`no owner for this card ${thisCard}`)
    }
  }
}
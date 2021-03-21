import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { CardManager } from "../../Managers/CardManager";
import { PlayerManager } from "../../Managers/PlayerManager";
import { PreCondition } from "./PreCondition";
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('HasMoney')
export class HasMoney extends PreCondition {
  @property
  moneyNeeded: number = 1;
  testCondition(meta: any) {

    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node);
    const owner = WrapperProvider.cardManagerWrapper.out.getCardOwner(thisCard);
    if (owner) {
      const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(owner)!
      if (player.coins >= this.moneyNeeded) {
        return true
      } else { return false }
    } else {
      throw new Error(`no owner for this card ${thisCard}`)
    }
  }
}
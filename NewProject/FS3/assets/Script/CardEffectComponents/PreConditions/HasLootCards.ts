import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { CardManager } from "../../Managers/CardManager";
import { PlayerManager } from "../../Managers/PlayerManager";
import { PreCondition } from "./PreCondition";
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('HasLootCards')
export class HasLootCards extends PreCondition {
      /**
       *
       */
      constructor() {
            super();

      }
      @property
      cardsNeeded: number = 1;
      testCondition(meta: any) {

            let thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
            let owner = WrapperProvider.cardManagerWrapper.out.getCardOwner(thisCard)!;
            if (owner) {
                  let player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(owner)!
                  if (player.getHandCards().length > 0) {
                        return true
                  } else return false
            } else {
                  throw `no owner for this card ${thisCard}`
            }
      }
}
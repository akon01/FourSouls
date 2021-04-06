import { CCInteger, Node, _decorator } from 'cc';
import { Signal } from "../../../Misc/Signal";
import { CARD_TYPE, TARGETTYPE } from "../../Constants";
import { CardEffect } from "../../Entites/CardEffect";
import { Card } from "../../Entites/GameEntities/Card";
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { DataCollector } from '../DataCollector/DataCollector';
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('AddTrinketOrCurse')
export class AddTrinketOrCurse extends Effect {
  effectName = "AddTrinketOrCurse";



  /**
   *
   */
  constructor() {
    super();

  }

  // @property({
  //   type: CCInteger, override: true, visible: function (this: AddTrinketOrCurse) {
  //     return !this.addMuiliEffect
  //   }
  // })
  // itemEffectToAddIdFinal: number = -1;
  @property({
    type: Effect, override: true, visible: function (this: AddTrinketOrCurse) {
      return !this.addMuiliEffect
    }
  })
  itemEffectToAdd: Effect | null = null;
  @property({
    type: [CCInteger], visible: function (this: AddTrinketOrCurse) {
      return this.addMuiliEffect
    }
  })
  itemEffectsToAddIdsFinal: number[] = [];
  @property({
    type: [Effect], visible: function (this: AddTrinketOrCurse) {
      return this.addMuiliEffect
    }
  })
  itemEffectsToAdd: Effect[] = [];
  @property
  addMuiliEffect = false;
  // @property({
  //   type: CCInteger, visible: function (this: AddTrinketOrCurse) {
  //     return this.addMuiliEffect
  //   }
  // })
  // multiEffectCollectorIdFinal: number = -1
  @property({
    type: DataCollector, visible: function (this: AddTrinketOrCurse) {
      return this.addMuiliEffect
    }
  })
  multiEffectCollector: DataCollector | null = null

  @property
  isCurse = false
  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const targetPlayerCard = data.getTarget(TARGETTYPE.PLAYER)

    if (targetPlayerCard == null) {
      throw new Error(`target player is null`)
    } else {
      if (targetPlayerCard instanceof Node) {
        const player: Player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(targetPlayerCard)!;
        this.removeAddTrinketEffect()
        const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
        thisCard.getComponent(Card)!.type = CARD_TYPE.TREASURE;
        WrapperProvider.serverClientWrapper.out.send(Signal.CARD_ADD_TRINKET, { cardId: thisCard.getComponent(Card)!._cardId, playerId: player.playerId, addMuiliEffect: this.addMuiliEffect })
        if (!this.isCurse) {
          WrapperProvider.pileManagerWrapper.out.removeFromPile(thisCard, true)
        }
        await player.addItem(thisCard, true, true);
        if (this.isCurse) {
          player.addCurse(thisCard, true)
        }
      }
    }
    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
  removeAddTrinketEffect() {
    const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)!
    const thisCardEffect = thisCard.getComponent(CardEffect)!
    // Remove this Effect!
    thisCardEffect.activeEffects = thisCardEffect.activeEffects.filter(aid => aid.EffectId != this.EffectId);
    if (this.addMuiliEffect) {
      for (let i = 0; i < this.itemEffectsToAdd.length; i++) {
        const effect = this.itemEffectsToAdd[i];
        thisCardEffect.passiveEffects.push(effect)
      }
      if (this.multiEffectCollector) {
        thisCardEffect.multiEffectCollector = this.multiEffectCollector;
        thisCardEffect.hasMultipleEffects = true;
      }
    } else {
      if (!this.itemEffectToAdd) {
        throw new Error("No Item Effect To Add");

      }
      thisCardEffect.passiveEffects.push(this.itemEffectToAdd)
    }
    //   this.enabled=false

  }
}

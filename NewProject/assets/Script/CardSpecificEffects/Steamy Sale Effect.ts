import Effect from "../CardEffectComponents/CardEffects/Effect";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import { PassiveEffectData } from "../Managers/DataInterpreter";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import Store from "../Entites/GameEntities/Store";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SteamySaleEffect extends Effect {
  effectName = "SteamySaleEffect";

  @property({ type: DataCollector, override: true })
  dataCollector = null;

  originalStoreCost: number = 0

  @property
  toReverseEffect: boolean = false;

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: PassiveEffectData
  ) {
    if (!this.toReverseEffect) {
      this.originalStoreCost = Store.storeCardsCost
      Store.storeCardsCost = 5;
    } else this.reverseEffect()

    return data
  }

  reverseEffect() {
    Store.storeCardsCost = this.originalStoreCost
  }
}

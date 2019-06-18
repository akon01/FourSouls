import Condition from "../CardEffectComponents/CardConditions/Condition";
import Effect from "../CardEffectComponents/CardEffects/Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PassiveEffect extends cc.Component {
  @property(Condition)
  condition: Condition = null;

  @property(Effect)
  effect: Effect = null;

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {}

  // update (dt) {}
}

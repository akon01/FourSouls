import { _decorator, Node, Enum } from 'cc';
import { TARGETTYPE } from '../../Constants';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';
import { Card } from '../../Entites/GameEntities/Card';
import { HoverSpriteType as HoverSpriteType } from '../../Entites/GameEntities/Mouse';
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
const { ccclass, property } = _decorator;


@ccclass('AlterMouseHoverPreviewSprite')
export class AlterMouseHoverPreviewSprite extends Effect {
  effectName = "AlterMouseHoverPreviewSprite";

  @property({ type: Enum(HoverSpriteType) })
  hoverSpriteTypeToSet: HoverSpriteType = HoverSpriteType.default

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data!"); }
    const targetCards = data.getTargets(TARGETTYPE.CARD) as Node[]
    if (targetCards.length == 0) {
      throw new CardEffectTargetError(`target cards are null`, true, data, stack)
    }
    for (const target of targetCards) {
      target.getComponent(Card)!.setHoverSpriteType(this.hoverSpriteTypeToSet)
    }



    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }

}

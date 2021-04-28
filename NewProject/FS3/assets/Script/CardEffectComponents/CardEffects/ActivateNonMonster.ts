import { _decorator, Node, log } from 'cc';
const { ccclass, property } = _decorator;

import { TARGETTYPE } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { PlayerManager } from "../../Managers/PlayerManager";
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Effect } from "./Effect";
import { Stack } from "../../Entites/Stack";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { CardEffectTargetError } from '../../Entites/Errors/CardEffectTargetError';

@ccclass('ActivateNonMonster')
export class ActivateNonMonster extends Effect {
      effectName = "ActivateNonMonster";


      /**
       *
       * @param data {target:PlayerId}
       */
      async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

            const playerTarget = data?.getTarget(TARGETTYPE.PLAYER) as Node | null;
            if (!playerTarget) {
                  throw new CardEffectTargetError("No Player Target Found", true, data, stack)
            }
            const playerToActivate = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerTarget)!
            const nonMonsterToActivate = data?.getTarget(TARGETTYPE.MONSTER) as Node | null
            if (!nonMonsterToActivate) {
                  throw new CardEffectTargetError("No Non-Monster To Activate", true, data, stack)
            }

            await playerToActivate.activateCard(nonMonsterToActivate)

            if (data instanceof PassiveEffectData) return data
            return WrapperProvider.stackWrapper.out._currentStack
      }
}

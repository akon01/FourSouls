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

@ccclass('ActivateNonMonster')
export class ActivateNonMonster extends Effect {
      effectName = "ActivateNonMonster";


      /**
       *
       * @param data {target:PlayerId}
       */
      async doEffect(stack: StackEffectInterface[], data?: ActiveEffectData | PassiveEffectData) {

            const playerToActivate = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(data?.getTarget(TARGETTYPE.PLAYER) as Node)!
            const nonMonsterToActivate = data?.getTarget(TARGETTYPE.MONSTER) as Node

            await playerToActivate.activateCard(nonMonsterToActivate)

            if (data instanceof PassiveEffectData) return data
            return WrapperProvider.stackWrapper.out._currentStack
      }
}

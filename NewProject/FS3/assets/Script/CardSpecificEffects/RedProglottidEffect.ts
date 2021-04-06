import { CCInteger, _decorator } from 'cc';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { Monster } from '../Entites/CardTypes/Monster';
import { Player } from '../Entites/GameEntities/Player';
import { WrapperProvider } from '../Managers/WrapperProvider';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
const { ccclass, property } = _decorator;


@ccclass('RedProglottidEffect')
export class RedProglottidEffect extends Effect {
  effectName = "RedProglottidEffect";

  /**
   *
   * @param data {target:PlayerId}
   */
  async doEffect(
    stack: StackEffectInterface[],
    data: { numberRolled: number; cardPlayerId: number }
  ) {

    const playersWithCounters = WrapperProvider.playerManagerWrapper.out.players.map(p => p.getComponent(Player)!).filter(p => p.getEggCounters() > 0)
    const monstersWithCounters = WrapperProvider.monsterFieldWrapper.out.getActiveMonsters().map(a => a.getComponent(Monster)!).filter(a => a.getEggCounters() > 0)
    for (const player of playersWithCounters) {
      await player.gainDMG(player.getEggCounters(), false, true)
    }
    for (const monster of monstersWithCounters) {
      await monster.gainDMG(monster.getEggCounters(), true)
    }
    return stack
  }
}

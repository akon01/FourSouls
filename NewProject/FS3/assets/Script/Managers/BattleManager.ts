import { Component, Node, _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";
import { MonsterReward } from "../CardEffectComponents/MonsterRewards/MonsterReward";
import { PARTICLE_TYPES, REWARD_TYPES, STACK_EFFECT_TYPE } from "../Constants";
import { Monster } from "../Entites/CardTypes/Monster";
import { Player } from '../Entites/GameEntities/Player';
import { IAttackableEntity } from '../Entites/IAttackableEntity';
import { WrapperProvider } from './WrapperProvider';

const { ccclass, property } = _decorator;




@ccclass('BattleManager')
export class BattleManager extends Component {



      currentlyAttackedEntityNode: Node | null = null;

      currentlyAttackedEntity: IAttackableEntity | null = null;

      firstAttack = true;

      inBattle = false;

      @property({ type: [MonsterReward] })
      availableReward: MonsterReward[] = []




      getRewardByType(type: REWARD_TYPES) {
            return WrapperProvider.battleManagerWrapper.out.availableReward.filter(reward => reward.type == type)[0]
      }



      async declareAttackOnMonster(monsterCard: Node, sendToServer: boolean) {
            //
            WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntityNode = monsterCard;
            WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntity = monsterCard.getComponent(Monster) ?? WrapperProvider.playerManagerWrapper.out.getPlayerByCard(monsterCard);
            monsterCard.getComponent(Monster)!._isAttacked = true
            // ;
            WrapperProvider.turnsManagerWrapper.out.currentTurn!.battlePhase = true;
            this.inBattle = true

            if (sendToServer) {
                  WrapperProvider.particleManagerWrapper.out.activateParticleEffect(monsterCard, PARTICLE_TYPES.MONSTER_IN_BATTLE, true)
                  await WrapperProvider.actionManagerWrapper.out.updateActions();
            }
      }

      endBattle(sendToServer: boolean) {
            if (!this.inBattle) return;
            const monsterCard = WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntityNode
            monsterCard!.getComponent(Monster)!._isAttacked = false
            WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntity = null;
            WrapperProvider.battleManagerWrapper.out.currentlyAttackedEntityNode = null;
            WrapperProvider.turnsManagerWrapper.out.currentTurn!.battlePhase = false;
            if (sendToServer) {
                  if (monsterCard) {
                        WrapperProvider.particleManagerWrapper.out.disableParticleEffect(monsterCard, PARTICLE_TYPES.MONSTER_IN_BATTLE, true)
                  }
                  WrapperProvider.serverClientWrapper.out.send(Signal.END_BATTLE)
            }
            this.inBattle = false;
      }

      async cancelAttack(sendToServer: boolean) {

            if (sendToServer) {
                  this.endBattle(sendToServer)
                  const currentStackEffectOfTheAttack = WrapperProvider.stackWrapper.out._currentStack.filter(stackEffect => {
                        if (stackEffect.stackEffectType == STACK_EFFECT_TYPE.ATTACK_ROLL || stackEffect.stackEffectType == STACK_EFFECT_TYPE.COMBAT_DAMAGE) { return true }
                  })
                  for (const stackEffect of currentStackEffectOfTheAttack) {
                        await WrapperProvider.stackWrapper.out.fizzleStackEffect(stackEffect, false, true)
                  }

            }
      }

      /**
       * @returns true if hit, false if miss
       * @param rollValue dice roll
       */
      ////@printMethodStarted(COLORS.RED)
      async rollOnMonster(rollValue: number, sendToServer?: boolean) {
            const monsterRollValue = this.currentlyAttackedEntity!.getRollValue() + this.currentlyAttackedEntity!.getRollBonus();
            // let turnPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerById(
            //   turnsManagerWrapper._tm.currentTurn.PlayerId
            // )
            if (this.firstAttack) {
                  this.firstAttack = false;
            }
            if (rollValue >= monsterRollValue) {
                  return true;
            } else { return false; }
      }

      // async killMonster(monsterCard: e, sendToServer?: boolean) {

      //   await monsterCard.getComponent(Monster).kill(sendToServer)
      // }

      // LIFE-CYCLE CALLBACKS:

      onLoad() {
            //battleManagerWrapper._bm.$ = this;
      }

      start() { }

      // update (dt) {}
}

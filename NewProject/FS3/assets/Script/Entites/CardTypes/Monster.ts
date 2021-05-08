import { Component, error, log, Node, _decorator } from 'cc';
import { Signal } from "../../../Misc/Signal";
import { AddEggCounters, IEggCounterable, RemoveEggCounters } from '../../CardEffectComponents/IEggCounterable';
import { MonsterRewardDescription } from "../../CardEffectComponents/MonsterRewards/MonsterRewardDescription";
import { ANNOUNCEMENT_TIME, PARTICLE_TYPES, PASSIVE_EVENTS } from "../../Constants";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { MonsterDeath } from "../../StackEffects/MonsterDeath";
import { Card } from "../GameEntities/Card";
import { IAttackableEntity } from '../IAttackableEntity';
import { MonsterCardHolder } from "../MonsterCardHolder";
const { ccclass, property, type } = _decorator;


@ccclass('Monster')
export class Monster extends Component implements IEggCounterable, IAttackableEntity {
  getCanBeAttacked(): boolean {
    return !this.isMonsterWhoCantBeAttacked
  }
  async takeDamage(damage: number, sendToServer: boolean, damageDealer: Node, numberRolled?: number): Promise<any> {
    return await this.takeDamaged(damage, sendToServer, damageDealer, numberRolled)
  }
  getCurrentHp(): number {
    return this.currentHp
  }
  getRollValue(): number {
    return this.rollValue
  }
  getRollBonus(): number {
    return this._rollBonus
  }

  private eggCounters = 0

  getEggCounters(): number {
    return this.eggCounters
  }

  async addEggCounters(numToChange: number, sendToServer: boolean): Promise<void> {

    let cardId: number | undefined = undefined
    let scope: Node | undefined = undefined
    if (sendToServer) {
      cardId = this.getComponent(Card)?._cardId
      scope = this.node
    }
    await AddEggCounters(numToChange, this.getComponent(Card)!, sendToServer, cardId, scope)
  }

  async removeEggCounters(numToChange: number, sendToServer: boolean): Promise<void> {
    let cardId: number | undefined = undefined
    let scope: Node | undefined = undefined
    if (sendToServer) {
      cardId = this.getComponent(Card)?._cardId
      scope = this.node
    }
    await RemoveEggCounters(numToChange, this.getEggCounters(), this.getComponent(Card)!, sendToServer, cardId, scope)
  }

  monsterPlace: MonsterCardHolder | null = null;

  //@ts-ignore
  @property({
    visible: function (this: Monster) {
      if (!this.isNonMonster) { return true }
    }
  })
  HP = 0;

  //@ts-ignore
  @property({
    visible: function (this: Monster) {
      if (!this.isNonMonster) { return true }
    }
  })
  currentHp = 0;

  //@ts-ignore
  @property({
    visible: function (this: Monster) {
      if (!this.isNonMonster) { return true }
    }
  })
  rollValue = 0;

  @property
  _rollBonus = 0;

  //@ts-ignore
  @property({
    visible: function (this: Monster) {
      if (!this.isNonMonster) { return true }
    }
  })
  DMG = 0;

  @property
  _bonusDamage = 0;

  @property
  _isAttacked = false;

  @property
  hasEffect = false;

  @property
  isNonMonster = false;

  @property
  isBoss = false;

  @property
  isMegaBoss = false;

  @property
  isMonsterWhoCantBeAttacked = false

  @property
  _dmgPrevention: number[] = [];

  @type(Node)
  _thisTurnKiller: Node | null = null;

  @property({ type: MonsterRewardDescription })
  monsterRewardDescription: MonsterRewardDescription = new MonsterRewardDescription



  getReward() {
    const reward = WrapperProvider.battleManagerWrapper.out.getRewardByType(this.monsterRewardDescription.rewardType)
    if (reward == null) return reward
    reward.doubleReward = this.monsterRewardDescription.doubleReward
    reward.rollNumber = this.monsterRewardDescription.rollNumber
    reward.hasRoll = this.monsterRewardDescription.hasRoll
    reward.setRewardQuantity(this.monsterRewardDescription.quantity)
    reward.attachedToCardId = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node).getComponent(Card)!._cardId
    return reward
  }


  killer: Node | null = null;

  //@ts-ignore
  @property({
    visible: function (this: Monster) {
      if (this.isNonMonster) { return true }
    }
  })
  isCurse = false

  @property
  _isDead = false;

  @property
  _lastHitRoll = 0

  @property
  doNotRemovePassiveEffectsWhenRemovingFromMonsterCardHolder = false

  /**
   *
   * @param damage
   * @param sendToServer
   * @returns true if the monster was killed
   */
  // @testForPassiveAfter('getDamaged')
  async takeDamaged(damage: number, sendToServer: boolean, damageDealer: Node, numberRolled?: number) {
    console.error(`take dmg on ${this.name}`)

    if (!sendToServer) {
      if (this.currentHp - damage < 0) {
        this.currentHp = 0
      } else {
        this.currentHp -= damage;
      }
      return true
    } else {

      const oldDamage = damage;
      //Prevent Damage
      damage = await this.preventDamage(damage)
      if (damage == 0) {
        console.log(`damage after reduction is 0`)
        return false
      }

      let toContinue = true
      const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.MONSTER_GET_HIT, [damage, damageDealer, numberRolled], null, this.node)
      if (sendToServer) {
        console.error(`check b4 passives on ${this.name}`)
        const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
        console.error(`after check b4 passives on ${this.name}`)
        passiveMeta.args = afterPassiveMeta.args;
        toContinue = afterPassiveMeta.continue
        console.log(afterPassiveMeta.args)
        if (!afterPassiveMeta.args) { debugger; throw new Error("No After Passive Args!"); }

        damage = afterPassiveMeta.args[0];
        damageDealer = afterPassiveMeta.args[1];
      }
      if (toContinue) {

        if (this.currentHp - damage < 0) {
          this.currentHp = 0
        } else {
          this.currentHp -= damage;
        }

        if (damage > 0) {
          const cardId = this.getComponent(Card)!._cardId
          const dmgDealerCardID = damageDealer.getComponent(Card)!._cardId;
          const serverData = {
            signal: Signal.MONSTER_GET_DAMAGED,
            srvData: { cardId: cardId, hpLeft: this.currentHp, dmgDlrId: dmgDealerCardID }
          };
          //particleManagerWrapper._pm.activateParticleEffect(this.node, PARTICLE_TYPES.MONSTER_GET_HIT)
          WrapperProvider.particleManagerWrapper.out.runParticleOnce(this.node, PARTICLE_TYPES.MONSTER_GET_HIT)
          WrapperProvider.soundManagerWrapper.out.playSound(WrapperProvider.soundManagerWrapper.out.monsterGetHit!)
          if (sendToServer) {
            //debugger
            console.error(serverData.srvData.toString())
            WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
            if (this.currentHp == 0) {
              this.killer = damageDealer
              await this.kill(damageDealer, numberRolled)
            }
          }
        }
      }
      //   wasKilled = await battleManagerWrapper._bmcheckIfMonsterIsDead(this.node, sendToServer);
      // }
      if (sendToServer) {
        const thisResult = await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta) as Promise<boolean>
        return thisResult;
      }
    }
    return true
    // passiveMeta.result = wasKilled
  }

  async addDamagePrevention(dmgToPrevent: number, sendToServer: boolean) {
    this._dmgPrevention.push(dmgToPrevent)
    if (sendToServer) {
      console.log(`send to server`)
      WrapperProvider.serverClientWrapper.out.send(Signal.MONSTER_ADD_DMG_PREVENTION, { cardId: this.node.getComponent(Card)!._cardId, dmgToPrevent: dmgToPrevent })
      console.log(`send to server 2`)
    }
  }

  async preventDamage(incomingDamage: number) {
    if (this._dmgPrevention.length > 0) {
      //  console.log(`doing dmg prevention`)
      const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.MONSTER_PREVENT_DAMAGE, null, null, this.node)
      const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)
      this._dmgPrevention.sort((a, b) => a - b)
      let newDamage = incomingDamage

      while (this._dmgPrevention.length > 0) {
        if (newDamage == 0) {
          return 0;
        } else {
          if (this._dmgPrevention.indexOf(newDamage) >= 0) {
            const dmgPreventionInstance = this._dmgPrevention.splice(this._dmgPrevention.indexOf(newDamage), 1)
            //   console.error(`prevented exactly ${dmgPreventionInstance[0]} dmg`)
            newDamage -= dmgPreventionInstance[0]

            continue;
          } else {
            const instance = this._dmgPrevention.shift()!;
            //  console.error(`prevented ${instance} dmg`)
            newDamage -= instance
            continue;
          }
        }
      }

      passiveMeta.result = newDamage
      const thisResult = await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
      WrapperProvider.announcementLableWrapper.out.showAnnouncement(`${this.name} Prevented ${incomingDamage - thisResult} Damage`, ANNOUNCEMENT_TIME, true)
      if (thisResult == 0) {
        return 0
      } else { return thisResult }
    } else { return incomingDamage }
  }

  async gainHp(hpToGain: number, sendToServer: boolean) {
    this.currentHp += hpToGain;
    const cardId = this.node.getComponent(Card)!._cardId
    const serverData = {
      signal: Signal.MONSTER_GAIN_HP,
      srvData: { cardId: cardId, damage: hpToGain }
    };
    if (sendToServer) {
      WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
    }
    return true;
  }

  async gainDMG(DMGToGain: number, sendToServer: boolean) {
    this._bonusDamage += DMGToGain;
    const cardId = this.node.getComponent(Card)!._cardId
    const serverData = {
      signal: Signal.MONSTER_GAIN_DMG,
      srvData: { cardId: cardId, DMGToGain: DMGToGain }
    };
    if (sendToServer) {
      WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
    }
    return true;
  }

  async gainRollBonus(bonusToGain: number, sendToServer: boolean) {
    this._rollBonus += bonusToGain;
    const cardId = this.node.getComponent(Card)!._cardId
    const serverData = {
      signal: Signal.MONSTER_GAIN_ROLL_BONUS,
      srvData: { cardId: cardId, bonusToGain: bonusToGain }
    };
    if (sendToServer) {
      WrapperProvider.serverClientWrapper.out.send(serverData.signal, serverData.srvData)
    }
    return true;
  }

  heal(hpToGain: number, sendToServer: boolean, healDown?: boolean) {

    if (sendToServer) {
      WrapperProvider.serverClientWrapper.out.send(Signal.MONSTER_HEAL, { cardId: this.node.getComponent(Card)!._cardId, hpToGain: hpToGain })
    }
    if (healDown) {
      this.currentHp = hpToGain
    } else {
      if (this.currentHp + hpToGain > this.HP) {
        this.currentHp = this.HP
      } else {
        this.currentHp += hpToGain
      }
    }

  }
  /**
   * !!!!!!!!!! Dont put await infront of this function!!!!!!!!!!!!!
   * @param killerCard who killed the monster
   */
  async kill(killerCard: Node, numberRolled?: number) {

    // if (WrapperProvider.stackWrapper.out._currentStack.length > 0) {
    //   await WrapperProvider.stackWrapper.outwaitForStackEmptied()
    // }
    const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!
    // if (WrapperProvider.playerManagerWrapper.out.mePlayer == turnPlayer.node) {
    const monsterDeath = new MonsterDeath(turnPlayer.character!.getComponent(Card)!._cardId, this.node, killerCard, numberRolled)
    await WrapperProvider.stackWrapper.out.addToStackAbove(monsterDeath)

    // }
  }

  calculateDamage() {
    let damage = 0;
    damage += this._bonusDamage;
    damage += this.DMG;
    // items that increase damage should increase baseDamage
    return damage;
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}

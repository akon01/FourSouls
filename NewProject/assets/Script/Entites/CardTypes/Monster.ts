import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import MonsterReward from "../../CardEffectComponents/MonsterRewards/MonsterReward";
import { PASSIVE_EVENTS, PARTICLE_TYPES } from "../../Constants";
import PassiveManager, { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import TurnsManager from "../../Managers/TurnsManager";
import MonsterDeath from "../../StackEffects/Monster Death";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Card from "../GameEntities/Card";
import MonsterCardHolder from "../MonsterCardHolder";
import Stack from "../Stack";
import ParticleManager from "../../Managers/ParticleManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Monster extends cc.Component {
  @property
  monsterPlace: MonsterCardHolder = null;

  @property
  HP: number = 0;

  @property
  currentHp: number = 0;

  @property
  rollValue: number = 0;

  @property
  rollBonus: number = 0;

  @property
  DMG: number = 0;

  @property
  bonusDamage: number = 0;

  @property
  isAttacked: boolean = false;

  @property
  hasEffect: boolean = false;

  @property
  isNonMonster: boolean = false;

  @property
  souls: number = 0;

  @property
  _dmgPrevention: number[] = [];

  @property
  _thisTurnKiller: cc.Node = null;

  @property(MonsterReward)
  reward: MonsterReward = null;

  /**
   * 
   * @param damage 
   * @param sendToServer
   * @returns true if the monster was killed 
   */
  // @testForPassiveAfter('getDamaged')
  async getDamaged(damage: number, sendToServer: boolean, damageDealer: cc.Node) {

    if (!sendToServer) {
      if (this.currentHp - damage < 0) {
        this.currentHp = 0
      } else {
        this.currentHp -= damage;
      }
    } else {

      //Prevent Damage
      damage = await this.preventDamage(damage)
      if (damage == 0) {
        cc.log(`damage after reduction is 0`)
      }

      let toContinue = true
      let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.MONSTER_GET_HIT, [damage, damageDealer], null, this.node)
      if (sendToServer) {
        let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        passiveMeta.args = afterPassiveMeta.args;
        toContinue = afterPassiveMeta.continue
        damage = afterPassiveMeta.args[0];
        damageDealer = afterPassiveMeta.args[1];
      }
      let wasKilled
      if (toContinue) {

        if (this.currentHp - damage < 0) {
          this.currentHp = 0
        } else {
          this.currentHp -= damage;
        }

        let cardId = this.node.getComponent(Card)._cardId
        let serverData = {
          signal: Signal.MONSTER_GET_DAMAGED,
          srvData: { cardId: cardId, hpLeft: this.currentHp, damageDealerId: damageDealer.getComponent(Card)._cardId }
        };
        ParticleManager.activateParticleEffect(this.node, PARTICLE_TYPES.MONSTER_GET_HIT)
        //ParticleManager.runParticleOnce(this.node, PARTICLE_TYPES.MONSTER_GET_HIT)
        if (sendToServer) {
          ServerClient.$.send(serverData.signal, serverData.srvData)
          if (this.currentHp == 0) {
            await this.kill(damageDealer)
          }
        }
      }
      //   wasKilled = await BattleManager.checkIfMonsterIsDead(this.node, sendToServer);
      // }
      if (sendToServer) {
        let thisResult = await PassiveManager.testForPassiveAfter(passiveMeta)
        return thisResult;
      }
    }
    // passiveMeta.result = wasKilled
  }

  async addDamagePrevention(dmgToPrevent: number, sendToServer: boolean) {
    this._dmgPrevention.push(dmgToPrevent)
    if (sendToServer) {
      ServerClient.$.send(Signal.MONSTER_ADD_DMG_PREVENTION, { playerId: this.node.getComponent(Card)._cardId, dmgToPrevent: dmgToPrevent })
    }
  }

  async preventDamage(incomingDamage: number) {
    if (this._dmgPrevention.length > 0) {
      //  cc.log(`doing dmg prevention`)
      let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.MONSTER_PREVENT_DAMAGE, null, null, this.node)
      let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
      this._dmgPrevention.sort((a, b) => { return a - b })
      let newDamage = incomingDamage

      while (this._dmgPrevention.length > 0) {
        if (newDamage == 0) {
          return 0;
        } else {
          if (this._dmgPrevention.includes(newDamage)) {
            let dmgPreventionInstance = this._dmgPrevention.splice(this._dmgPrevention.indexOf(newDamage), 1)
            //   cc.error(`prevented exactly ${dmgPreventionInstance[0]} dmg`)
            newDamage -= dmgPreventionInstance[0]

            continue;
          } else {
            const instance = this._dmgPrevention.shift();
            //  cc.error(`prevented ${instance} dmg`)
            newDamage -= instance
            continue;
          }
        }
      }

      passiveMeta.result = newDamage
      let thisResult = await PassiveManager.testForPassiveAfter(passiveMeta)
      if (thisResult == 0) {
        return 0
      } else return thisResult
    } else return incomingDamage
  }

  async gainHp(hpToGain: number, sendToServer: boolean) {
    this.currentHp += hpToGain;
    let cardId = this.node.getComponent(Card)._cardId
    let serverData = {
      signal: Signal.MONSTER_GAIN_HP,
      srvData: { cardId: cardId, damage: hpToGain }
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }


  async gainDMG(DMGToGain: number, sendToServer: boolean) {
    this.bonusDamage += DMGToGain;
    let cardId = this.node.getComponent(Card)._cardId
    let serverData = {
      signal: Signal.MONSTER_GAIN_DMG,
      srvData: { cardId: cardId, DMGToGain: DMGToGain }
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }


  async gainRollBonus(bonusToGain: number, sendToServer: boolean) {
    this.rollBonus += bonusToGain;
    let cardId = this.node.getComponent(Card)._cardId
    let serverData = {
      signal: Signal.MONSTER_GAIN_ROLL_BONUS,
      srvData: { cardId: cardId, bonusToGain: bonusToGain }
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }

  heal(hpToGain: number, sendToServer: boolean) {

    if (sendToServer) {
      ServerClient.$.send(Signal.MONSTER_HEAL, { cardId: this.node.getComponent(Card)._cardId, hpToGain: hpToGain })
    }
    if (this.currentHp + hpToGain > this.HP) {
      this.currentHp = this.HP
    } else {
      this.currentHp += hpToGain
    }

  }

  async kill(killerCard: cc.Node) {
    let monsterComp = this
    let monsterPlace = monsterComp.monsterPlace;
    let turnPlayer =
      TurnsManager.currentTurn.getTurnPlayer()
    if (PlayerManager.mePlayer == turnPlayer.node) {
      let monsterDeath = new MonsterDeath(turnPlayer.character.getComponent(Card)._cardId, this.node, killerCard)
      await Stack.addToStackAbove(monsterDeath)

    }
  }


  calculateDamage() {
    let damage = 0;
    damage += this.bonusDamage;
    damage += this.DMG;
    // items that increase damage should increase baseDamage
    return damage;
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}

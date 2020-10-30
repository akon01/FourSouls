import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import MonsterReward from "../../CardEffectComponents/MonsterRewards/MonsterReward";
import { PARTICLE_TYPES, PASSIVE_EVENTS, ANNOUNCEMENT_TIME } from "../../Constants";
import ParticleManager from "../../Managers/ParticleManager";
import PassiveManager, { PassiveMeta } from "../../Managers/PassiveManager";
import PlayerManager from "../../Managers/PlayerManager";
import TurnsManager from "../../Managers/TurnsManager";
import MonsterDeath from "../../StackEffects/Monster Death";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";
import Card from "../GameEntities/Card";
import MonsterCardHolder from "../MonsterCardHolder";
import Stack from "../Stack";
import SoundManager from "../../Managers/SoundManager";
import AnnouncementLable from "../../LableScripts/Announcement Lable";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Monster extends cc.Component {
  @property({ visible: false })
  monsterPlace: MonsterCardHolder = null;

  @property({
    visible: function (this: Monster) {
      if (!this.isNonMonster) { return true }
    }
  })
  HP: number = 0;


  @property({
    visible: function (this: Monster) {
      if (!this.isNonMonster) { return true }
    }
  })
  currentHp: number = 0;


  @property({
    visible: function (this: Monster) {
      if (!this.isNonMonster) { return true }
    }
  })
  rollValue: number = 0;

  @property
  _rollBonus: number = 0;

  @property({
    visible: function (this: Monster) {
      if (!this.isNonMonster) { return true }
    }
  })
  DMG: number = 0;

  @property
  _bonusDamage: number = 0;

  @property
  _isAttacked: boolean = false;

  @property
  hasEffect: boolean = false;

  @property
  isNonMonster: boolean = false;

  @property
  isBoss: boolean = false;

  @property
  isMegaBoss: boolean = false;

  @property
  isMonsterWhoCantBeAttacked: boolean = false

  @property
  _dmgPrevention: number[] = [];

  @property
  _thisTurnKiller: cc.Node = null;


  @property({
    type: MonsterReward,
    visible: function (this: Monster) {
      if (!this.isNonMonster) { return true }
    }
  })
  reward: MonsterReward = null;

  @property({ visible: false })
  killer: cc.Node = null;

  @property({
    visible: function (this: Monster) {
      if (this.isNonMonster) { return true }
    }
  })
  isCurse: boolean = false

  @property
  _isDead: boolean = false;

  @property
  _lastHitRoll: number = 0

  /**
   *
   * @param damage
   * @param sendToServer
   * @returns true if the monster was killed
   */
  // @testForPassiveAfter('getDamaged')
  async takeDamaged(damage: number, sendToServer: boolean, damageDealer: cc.Node, numberRolled?: number) {
    cc.error(`take dmg on ${this.name}`)

    if (!sendToServer) {
      if (this.currentHp - damage < 0) {
        this.currentHp = 0
      } else {
        this.currentHp -= damage;
      }
    } else {

      const oldDamage = damage;
      //Prevent Damage
      damage = await this.preventDamage(damage)
      if (damage == 0) {
        cc.log(`damage after reduction is 0`)
        return false
      }

      let toContinue = true
      const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.MONSTER_GET_HIT, [damage, damageDealer, numberRolled], null, this.node)
      if (sendToServer) {
        cc.error(`check b4 passives on ${this.name}`)
        const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        cc.error(`after check b4 passives on ${this.name}`)
        passiveMeta.args = afterPassiveMeta.args;
        toContinue = afterPassiveMeta.continue
        cc.log(afterPassiveMeta.args)
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
          const cardId = this.node.getComponent(Card)._cardId
          const serverData = {
            signal: Signal.MONSTER_GET_DAMAGED,
            srvData: { cardId: cardId, hpLeft: this.currentHp, damageDealerId: damageDealer.getComponent(Card)._cardId }
          };
          //ParticleManager.activateParticleEffect(this.node, PARTICLE_TYPES.MONSTER_GET_HIT)
          ParticleManager.runParticleOnce(this.node, PARTICLE_TYPES.MONSTER_GET_HIT)
          SoundManager.$.playSound(SoundManager.$.monsterGetHit)
          if (sendToServer) {
            ServerClient.$.send(serverData.signal, serverData.srvData)
            if (this.currentHp == 0) {
              this.killer = damageDealer
              await this.kill(damageDealer, numberRolled)
            }
          }
        }
      }
      //   wasKilled = await BattleManager.checkIfMonsterIsDead(this.node, sendToServer);
      // }
      if (sendToServer) {
        const thisResult = await PassiveManager.testForPassiveAfter(passiveMeta)
        return thisResult;
      }
    }
    // passiveMeta.result = wasKilled
  }

  async addDamagePrevention(dmgToPrevent: number, sendToServer: boolean) {
    this._dmgPrevention.push(dmgToPrevent)
    if (sendToServer) {
      cc.log(`send to server`)
      ServerClient.$.send(Signal.MONSTER_ADD_DMG_PREVENTION, { cardId: this.node.getComponent(Card)._cardId, dmgToPrevent: dmgToPrevent })
      cc.log(`send to server 2`)
    }
  }

  async preventDamage(incomingDamage: number) {
    if (this._dmgPrevention.length > 0) {
      //  cc.log(`doing dmg prevention`)
      const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.MONSTER_PREVENT_DAMAGE, null, null, this.node)
      const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
      this._dmgPrevention.sort((a, b) => a - b)
      let newDamage = incomingDamage

      while (this._dmgPrevention.length > 0) {
        if (newDamage == 0) {
          return 0;
        } else {
          if (this._dmgPrevention.includes(newDamage)) {
            const dmgPreventionInstance = this._dmgPrevention.splice(this._dmgPrevention.indexOf(newDamage), 1)
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
      const thisResult = await PassiveManager.testForPassiveAfter(passiveMeta)
      AnnouncementLable.$.showAnnouncement(`${this.name} Prevented ${incomingDamage - thisResult} Damage`, ANNOUNCEMENT_TIME, true)
      if (thisResult == 0) {
        return 0
      } else { return thisResult }
    } else { return incomingDamage }
  }

  async gainHp(hpToGain: number, sendToServer: boolean) {
    this.currentHp += hpToGain;
    const cardId = this.node.getComponent(Card)._cardId
    const serverData = {
      signal: Signal.MONSTER_GAIN_HP,
      srvData: { cardId: cardId, damage: hpToGain }
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }

  async gainDMG(DMGToGain: number, sendToServer: boolean) {
    this._bonusDamage += DMGToGain;
    const cardId = this.node.getComponent(Card)._cardId
    const serverData = {
      signal: Signal.MONSTER_GAIN_DMG,
      srvData: { cardId: cardId, DMGToGain: DMGToGain }
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }

  async gainRollBonus(bonusToGain: number, sendToServer: boolean) {
    this._rollBonus += bonusToGain;
    const cardId = this.node.getComponent(Card)._cardId
    const serverData = {
      signal: Signal.MONSTER_GAIN_ROLL_BONUS,
      srvData: { cardId: cardId, bonusToGain: bonusToGain }
    };
    if (sendToServer) {
      ServerClient.$.send(serverData.signal, serverData.srvData)
    }
    return true;
  }

  heal(hpToGain: number, sendToServer: boolean, healDown?: boolean) {

    if (sendToServer) {
      ServerClient.$.send(Signal.MONSTER_HEAL, { cardId: this.node.getComponent(Card)._cardId, hpToGain: hpToGain })
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
  async kill(killerCard: cc.Node, numberRolled?: number) {

    // if (Stack._currentStack.length > 0) {
    //   await Stack.waitForStackEmptied()
    // }
    const monsterComp = this
    const monsterPlace = monsterComp.monsterPlace;
    const turnPlayer =
      TurnsManager.currentTurn.getTurnPlayer()
    // if (PlayerManager.mePlayer == turnPlayer.node) {
    const monsterDeath = new MonsterDeath(turnPlayer.character.getComponent(Card)._cardId, this.node, killerCard, numberRolled)
    await Stack.addToStackAbove(monsterDeath)

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

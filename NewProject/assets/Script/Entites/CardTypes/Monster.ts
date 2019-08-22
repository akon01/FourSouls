import MonsterCardHolder from "../MonsterCardHolder";
import MonsterReward from "../../CardEffectComponents/MonsterRewards/MonsterReward";
import Signal from "../../../Misc/Signal";
import Card from "../GameEntities/Card";
import ServerClient from "../../../ServerClient/ServerClient";
import BattleManager from "../../Managers/BattleManager";
import PassiveManager, { PassiveMeta } from "../../Managers/PassiveManager";
import TurnsManager from "../../Managers/TurnsManager";
import PlayerManager from "../../Managers/PlayerManager";
import MonsterDeath from "../../StackEffects/Monster Death";
import Stack from "../Stack";
import PileManager from "../../Managers/PileManager";
import { CARD_TYPE } from "../../Constants";
import MonsterRewardStackEffect from "../../StackEffects/Monster Reward";
import Player from "../GameEntities/Player";
import StackEffectInterface from "../../StackEffects/StackEffectInterface";

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
  baseDamage: number = 0;

  @property
  isAttacked: boolean = false;

  @property
  hasEffect: boolean = false;

  @property
  isNonMonster: boolean = false;

  @property
  souls: number = 0;

  @property(MonsterReward)
  reward: MonsterReward = null;

  /**
   * 
   * @param damage 
   * @param sendToServer
   * @returns true if the monster was killed 
   */
  // @testForPassiveAfter('getDamaged')
  async getDamaged(damage: number, sendToServer: boolean) {

    if (!sendToServer) {
      if (this.currentHp - damage < 0) {
        this.currentHp = 0
      } else {
        this.currentHp -= damage;
      }
    } else {
      let passiveMeta = new PassiveMeta('getDamaged', Array.of(damage), null, this.node)
      let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
      passiveMeta.args = afterPassiveMeta.args;
      let wasKilled
      if (afterPassiveMeta.continue) {

        if (this.currentHp - damage < 0) {
          this.currentHp = 0
        } else {
          this.currentHp -= damage;
        }

        let cardId = this.node.getComponent(Card)._cardId
        let serverData = {
          signal: Signal.MONSTER_GET_DAMAGED,
          srvData: { cardId: cardId, damage: damage }
        };
        if (sendToServer) {
          ServerClient.$.send(serverData.signal, serverData.srvData)
        }
      }
      //   wasKilled = await BattleManager.checkIfMonsterIsDead(this.node, sendToServer);
      // }
      let thisResult = await PassiveManager.testForPassiveAfter(passiveMeta)
      return thisResult;
    }
    // passiveMeta.result = wasKilled
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
    this.baseDamage += DMGToGain;
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

  async kill(sendToServer: boolean, stackEffectToAddBelow?: StackEffectInterface) {
    cc.log(stackEffectToAddBelow)
    let monsterComp = this
    let monsterPlace = monsterComp.monsterPlace;
    let turnPlayer =
      TurnsManager.currentTurn.getTurnPlayer()
    if (PlayerManager.mePlayer == turnPlayer.node) {
      let monsterDeath = new MonsterDeath(turnPlayer.character.getComponent(Card)._cardId, this.node)
      if (stackEffectToAddBelow) {
        cc.log(`add below`)
        await Stack.addToStackBelow(monsterDeath, stackEffectToAddBelow)
        //   await Stack.doStackEffectFromTop(true) 
        // } else {
        //   cc.log(`add normal`)
        //   await Stack.addToStack(monsterDeath, true)
      }
      cc.log(`after monster death resolved`)

      // let turnPlayerCard = PlayerManager.getPlayerById(TurnsManager.currentTurn.PlayerId).getComponent(Player).character
      // let monsterReward = new MonsterRewardStackEffect(monsterDeath.creatorCardId, this.node, turnPlayerCard)
      // // if (stackEffectToAddBelow) {
      // //   cc.log(`add below`)
      // //   await Stack.addToStackBelow(monsterDeath, stackEffectToAddBelow)
      // // } else {
      // // cc.log(`add normal`)
      // await Stack.addToStack(monsterReward, true)
    }
    cc.log(`after monster reward resolved`)

    //TODO add passive check for "when this dies" and add them to the stack and change above to "addToStackAbove"

    // let cardComp = this.node.getComponent(Card)
    // if (cardComp.souls == 0) {
    //   await PileManager.addCardToPile(CARD_TYPE.MONSTER, this.node, true);
    // } else {
    //   await turnPlayer.getSoulCard(this.node, sendToServer)
    // }
    // if (BattleManager.currentlyAttackedMonster != null && this.node == BattleManager.currentlyAttackedMonster.node) {
    //   BattleManager.currentlyAttackedMonster = null;
    //   TurnsManager.currentTurn.battlePhase = false;
    // }
  }


  calculateDamage() {
    let damage = 0;
    damage += this.baseDamage;
    damage += this.DMG;
    // items that increase damage should increase baseDamage
    return damage;
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}

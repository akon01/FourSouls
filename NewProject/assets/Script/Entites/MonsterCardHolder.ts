import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import { CARD_TYPE, PASSIVE_EVENTS } from "../Constants";
import BattleManager from "../Managers/BattleManager";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import PileManager from "../Managers/PileManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import RefillEmptySlot from "../StackEffects/Refill Empty Slot";
import CardEffect from "./CardEffect";
import Monster from "./CardTypes/Monster";
import Card from "./GameEntities/Card";
import Player from "./GameEntities/Player";
import MonsterField from "./MonsterField";
import Stack from "./Stack";
import CardManager from "../Managers/CardManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterCardHolder extends cc.Component {
  @property
  id: number = null;

  @property
  monsters: cc.Node[] = [];

  @property
  spriteFrame: cc.SpriteFrame = null;

  @property({ type: cc.Label })
  hpLable: cc.Label = null;

  @property({ type: cc.Label })
  dmgLable: cc.Label = null;

  @property
  private _activeMonster: cc.Node = null;

  @property({ type: cc.Label })
  rollBonusLable: cc.Label = null;

  // public set activeMonster(v: cc.Node) {
  //   const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.NEW_ACTIVE_MONSTER, [v], null, v);
  //   if (PlayerManager.mePlayer == TurnsManager.currentTurn.getTurnPlayer().node) {
  //     const afterPassiveMetaPromise = PassiveManager.checkB4Passives(passiveMeta);
  //     // tslint:disable-next-line: no-floating-promises
  //     afterPassiveMetaPromise.then((afterPassiveMeta) => {
  //       v = afterPassiveMeta.args[0];
  //       this._activeMonster = v;
  //     });
  //   } else {
  //     this._activeMonster = v;
  //   }
  // }

  public get activeMonster(): cc.Node {
    return this._activeMonster;
  }

  async setActiveMonster(monsterCard: cc.Node, sendToServer: boolean) {
    if (sendToServer) {
      if (this.activeMonster && MonsterField.activeMonsters.includes(this.activeMonster)) {
        MonsterField.activeMonsters.splice(MonsterField.activeMonsters.indexOf(this.activeMonster), 1)
        this.activeMonster.getComponent(Monster).monsterPlace = null;
        PassiveManager.removePassiveItemEffects(this.activeMonster, sendToServer)
      }
    }
    const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.NEW_ACTIVE_MONSTER, [monsterCard], null, monsterCard);
    if (PlayerManager.mePlayer == TurnsManager.currentTurn.getTurnPlayer().node) {
      const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta);
      monsterCard = afterPassiveMeta.args[0];
      this._activeMonster = monsterCard;
    } else {
      this._activeMonster = monsterCard;
    }
    const monster = monsterCard.getComponent(Monster);
    monster.currentHp = monster.HP;
    monster.monsterPlace = this;

    if (monsterCard.active == false) {
      monsterCard.active = true;
    }
    this.spriteFrame = null;
    monsterCard.setParent(this.node);
    //  this.node.addChild(monsterCard, 0);
    monsterCard.setPosition(0, 0);

    this.node.width = monsterCard.width;
    this.node.height = monsterCard.height;

    MonsterField.activeMonsters.push(monsterCard)
    CardManager.makeCardPreviewable(monsterCard)

    const monsterEffect = this.activeMonster.getComponent(CardEffect)
    if (monsterEffect != null && monsterEffect.passiveEffects.length > 0 && !PassiveManager.isCardRegistered(this.activeMonster)) {

      if (TurnsManager.isCurrentPlayer(PlayerManager.mePlayer)) {
        await PassiveManager.registerPassiveItem(this.activeMonster, true)
      }
    }
    await PassiveManager.testForPassiveAfter(passiveMeta)
  }

  async getNextMonster(sendToServer: boolean) {
    if (this.monsters.length > 0) {
      await this.setActiveMonster(this.monsters[this.monsters.length - 1], sendToServer);
      if (sendToServer) {
        ServerClient.$.send(Signal.GET_NEXT_MONSTER, { monsterPlaceId: this.id });
      }
    } else {
      if (sendToServer) {
        const refillEmptySlot = new RefillEmptySlot(PlayerManager.mePlayer.getComponent(Player).character.getComponent(Card)._cardId, this.node, CARD_TYPE.MONSTER);
        await Stack.addToStack(refillEmptySlot, true);
      }
    }

  }
  /**
   * add a monster to the place and set it as active
   * @param monsterCard
   */

  async addToMonsters(monsterCard: cc.Node, sendToServer: boolean) {

    if (monsterCard.getComponent(Card)._isFlipped) {
      monsterCard.getComponent(Card).flipCard(sendToServer);
    }
    for (const monster of this.monsters) {
      monster.active = false;
    }
    this.monsters.push(monsterCard);

    await this.setActiveMonster(monsterCard, sendToServer);

    if (sendToServer) {
      ServerClient.$.send(Signal.ADD_MONSTER, { monsterPlaceId: this.id, monsterId: monsterCard.getComponent(Card)._cardId });
    }

  }

  async discardTopMonster(sendToServer: boolean) {

    const monster = this._activeMonster;
    await PileManager.addCardToPile(CARD_TYPE.MONSTER, monster, sendToServer);
    await this.removeMonster(monster, sendToServer);
    // this.monsters.length > 0 ? this.activeMonster = this.monsters.pop() : this.activeMonster = null;
    // await this.getNextMonster(true)

  }

  async removeMonster(monster: cc.Node, sendToServer: boolean) {
    this.monsters.splice(this.monsters.indexOf(monster));
    if (MonsterField.activeMonsters.includes(monster)) {
      MonsterField.activeMonsters.splice(MonsterField.activeMonsters.indexOf(monster), 1)
      monster.getComponent(Monster).monsterPlace = null;
      if (!monster.getComponent(Monster).isCurse) {
        PassiveManager.removePassiveItemEffects(monster, sendToServer)
      }
    }

    if (sendToServer) {
      ServerClient.$.send(Signal.REMOVE_MONSTER, { holderId: this.id, monsterId: monster.getComponent(Card)._cardId });
      await this.getNextMonster(true);
    }
    // this.getNextMonster(sendToServer);
  }

  toString() {
    if (this._activeMonster != null) {
      return (
        "monsterPlace " +
        this.id +
        " \nactive Monster :" +
        this._activeMonster.getComponent(Card).name
      );
    } else {
      return "monsterPlace " + this.id + " \nactive Monster : none";
    }
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    //  this.hpLable = this.node.getChildByName("hp").getComponent(cc.Label);
    //this.dmgLable = this.node.getChildByName("dmg").getComponent(cc.Label);
    this.spriteFrame = this.getComponent(cc.Sprite).spriteFrame;
  }

  start() { }

  update(dt) {
    if (this._activeMonster != null) {
      const activeMonster = this._activeMonster.getComponent(Monster);
      this.hpLable.string =
        "🖤:" + activeMonster.currentHp;
      if (activeMonster._bonusDamage != 0) {
        this.dmgLable.string =
          "🏹:" + activeMonster.calculateDamage();
        this.dmgLable.node.active = true;
      } else {
        this.dmgLable.node.active = false;
      }
      if (activeMonster._rollBonus > 0) {
        this.rollBonusLable.string = "🎲:" + (activeMonster._rollBonus + activeMonster.rollValue)
        this.rollBonusLable.node.active = true
      } else {
        this.rollBonusLable.node.active = false
      }
    } else {
      this.hpLable.string = "";
      this.dmgLable.node.active = false;
      // this.dmgLable.string = "dmg:" + 0;
    }
  }
}

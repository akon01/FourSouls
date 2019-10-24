import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import { CARD_TYPE, PASSIVE_EVENTS, ROLL_TYPE } from "../Constants";
import CardManager from "../Managers/CardManager";
import PileManager from "../Managers/PileManager";
import Monster from "./CardTypes/Monster";
import Card from "./GameEntities/Card";
import Deck from "./GameEntities/Deck";
import MonsterField from "./MonsterField";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import RefillEmptySlot from "../StackEffects/Refill Empty Slot";
import PlayerManager from "../Managers/PlayerManager";
import Player from "./GameEntities/Player";
import Stack from "./Stack";
import TurnsManager from "../Managers/TurnsManager";
import BattleManager from "../Managers/BattleManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterCardHolder extends cc.Component {
  @property
  id: number = null;

  @property
  private _activeMonster: cc.Node = null;


  public set activeMonster(v: cc.Node) {
    let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.NEW_ACTIVE_MONSTER, [v], null, v)
    if (PlayerManager.mePlayer == TurnsManager.currentTurn.getTurnPlayer().node) {
      let afterPassiveMetaPromise = PassiveManager.checkB4Passives(passiveMeta)
      afterPassiveMetaPromise.then((afterPassiveMeta) => {
        v = afterPassiveMeta.args[0]
        this._activeMonster = v;
      })
    } else {
      this._activeMonster = v;
    }
  }


  public get activeMonster(): cc.Node {
    return this._activeMonster
  }



  @property
  monsters: cc.Node[] = [];

  @property
  spriteFrame: cc.SpriteFrame = null;

  @property
  hpLable: cc.Label = null;

  @property
  dmgLable: cc.Label = null;


  async getNextMonster(sendToServer: boolean) {
    if (this.monsters.length > 0) {
      this._activeMonster = this.monsters[this.monsters.length - 1]
      this._activeMonster.active = true
      this.spriteFrame = this._activeMonster.getComponent(cc.Sprite).spriteFrame;
      if (sendToServer) {
        ServerClient.$.send(Signal.GET_NEXT_MONSTER, { monsterPlaceId: this.id });
      }
      //return this.activeMonster;
    } else {

      if (sendToServer) {
        let refillEmptySlot = new RefillEmptySlot(PlayerManager.mePlayer.getComponent(Player).character.getComponent(Card)._cardId, this.node, CARD_TYPE.MONSTER)
        await Stack.addToStack(refillEmptySlot, true)
        // let drawnMonster = await CardManager.monsterDeck.getComponent(Deck).drawCard(sendToServer);
        // if (drawnMonster.getComponent(Card)._isFlipped) {
        //   drawnMonster.getComponent(Card).flipCard(sendToServer);
        // }

        // await this.addToMonsters(drawnMonster, sendToServer);
      }
    }
    MonsterField.updateActiveMonsters();
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

    this._activeMonster = monsterCard;
    let monster = this._activeMonster.getComponent(Monster);
    monster.currentHp = monster.HP;
    monster.monsterPlace = this;

    if (monsterCard.active == false) {
      monsterCard.active = true;
    }
    this.spriteFrame = null;
    monsterCard.setParent(this.node)
    //  this.node.addChild(monsterCard, 0);
    monsterCard.setPosition(0, 0);

    this.node.width = monsterCard.width;
    this.node.height = monsterCard.height;
    if (sendToServer) {
      ServerClient.$.send(Signal.ADD_MONSTER, { monsterPlaceId: this.id, monsterId: monsterCard.getComponent(Card)._cardId });
    }
    MonsterField.updateActiveMonsters();
  }

  async discardTopMonster(sendToServer: boolean) {

    let monster = this._activeMonster;
    this.removeMonster(monster, sendToServer)
    await PileManager.addCardToPile(CARD_TYPE.MONSTER, monster, sendToServer)
    cc.log(`discard top`)
    //this.monsters.length > 0 ? this.activeMonster = this.monsters.pop() : this.activeMonster = null;
    await this.getNextMonster(true)






  }


  removeMonster(monster: cc.Node, sendToServer: boolean) {
    this.monsters.splice(this.monsters.indexOf(monster));

    if (sendToServer) {
      ServerClient.$.send(Signal.REMOVE_MONSTER, { holderId: this.id, monsterId: monster.getComponent(Card)._cardId });
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
    this.hpLable = this.node.getChildByName("hp").getComponent(cc.Label);
    this.dmgLable = this.node.getChildByName("dmg").getComponent(cc.Label);
    this.spriteFrame = this.getComponent(cc.Sprite).spriteFrame;
  }

  start() { }

  update(dt) {
    if (this._activeMonster != null) {
      this.hpLable.string =
        "🖤:" + this._activeMonster.getComponent(Monster).currentHp;
      if (this._activeMonster.getComponent(Monster).bonusDamage != 0) {
        this.dmgLable.string =
          "🏹:" + this._activeMonster.getComponent(Monster).calculateDamage();
        this.dmgLable.enabled = true;
      } else {
        this.dmgLable.enabled = false;
      }

      if (BattleManager.currentlyAttackedMonsterNode == this.activeMonster) {

      }


    } else {
      this.hpLable.string = '';
      this.dmgLable.enabled = false;
      // this.dmgLable.string = "dmg:" + 0;
    }
  }
}

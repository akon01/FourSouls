import Monster from "./CardTypes/Monster";
import Card from "./GameEntities/Card";
import MonsterField from "./MonsterField";
import CardManager from "../Managers/CardManager";
import Deck from "./GameEntities/Deck";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import Player from "./GameEntities/Player";
import ActionManager from "../Managers/ActionManager";
import PileManager from "../Managers/PileManager";
import { CARD_TYPE, printMethodStarted, COLORS } from "../Constants";
import Server from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";
import CardEffect from "./CardEffect";
import BattleManager from "../Managers/BattleManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterCardHolder extends cc.Component {
  @property
  id: number = null;

  @property
  activeMonster: cc.Node = null;

  @property
  monsters: cc.Node[] = [];

  @property
  spriteFrame: cc.SpriteFrame = null;

  @property
  hpLable: cc.Label = null;

  @property
  dmgLable: cc.Label = null;

  @printMethodStarted(COLORS.LIGHTBLUE)
  getNextMonster(sendToServer: boolean) {



    if (this.monsters.length > 0) {
      cc.log('monster place is not empty. putting last on top')

      //cc.log('more than one mosnter')
      this.activeMonster = this.monsters[this.monsters.length - 1]
      this.activeMonster.active = true
      this.spriteFrame = this.activeMonster.getComponent(cc.Sprite).spriteFrame;
      //MonsterField.updateActiveMonsters();
      if (sendToServer) {
        Server.$.send(Signal.GETNEXTMONSTER, { holderId: this.id });
      }
      //return this.activeMonster;
    } else {
      cc.log('monster place is  empty. putting new card from deck')
      let drawnMonster = CardManager.monsterDeck.getComponent(Deck).drawCard(sendToServer);
      if (drawnMonster.getComponent(Card).isFlipped) {
        drawnMonster.getComponent(Card).flipCard();
      }
      //cc.log('getNextMonster ')
      this.addToMonsters(drawnMonster, sendToServer);
    }
    MonsterField.updateActiveMonsters();

  }
  /**
   * add a monster to the place and set it as active
   * @param monsterCard
   */
  @printMethodStarted(COLORS.LIGHTBLUE)
  async addToMonsters(monsterCard: cc.Node, sendToServer: boolean) {
    cc.log('add to monsters ' + monsterCard.name + ', send to server' + sendToServer)
    if (monsterCard.getComponent(Card).isFlipped) {
      monsterCard.getComponent(Card).flipCard();
    }
    for (const monster of this.monsters) {
      monster.active = false;
    }
    cc.log(this.monsters.map(monster => monster.name))

    this.monsters.push(monsterCard);
    cc.log(this.monsters.map(monster => monster.name))
    this.activeMonster = monsterCard;
    let monster = this.activeMonster.getComponent(Monster);
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
      Server.$.send(Signal.ADDMONSTER, { holderId: this.id, monsterId: monsterCard.getComponent(Card).cardId });
    }
    if (monster.isNonMonster) {
      let waitForAllReactionsOver = await ActionManager.waitForReqctionsOver();
      let currentTurnPlayer = PlayerManager.getPlayerById(
        TurnsManager.currentTurn.PlayerId
      );
      if (currentTurnPlayer == PlayerManager.mePlayer) {
        // let activateItemOver = await currentTurnPlayer
        //   .getComponent(Player)
        //   .activateItem(this.activeMonster, true);
        let serverEffect = await CardManager.getCardEffect(this.activeMonster, currentTurnPlayer.getComponent(Player).playerId)
        let over = await this.activeMonster.getComponent(CardEffect).doServerEffect(serverEffect, [])
        PileManager.addCardToPile(CARD_TYPE.MONSTER, this.activeMonster, true);
        BattleManager.currentlyAttackedMonster = null;
        TurnsManager.currentTurn.battlePhase = false;
        ActionManager.updateActions()
        //  this.getNextMonster(true);
      }
    }
    MonsterField.updateActiveMonsters();
    ActionManager.updateActions();
  }

  @printMethodStarted(COLORS.LIGHTBLUE)
  removeMonster(monster: cc.Node, sendToServer: boolean) {

    this.monsters.splice(this.monsters.indexOf(monster));
    if (sendToServer) {
      Server.$.send(Signal.REMOVEMONSTER, { holderId: this.id, monsterId: monster.getComponent(Card).cardId });
    }
    // this.getNextMonster(sendToServer);
  }

  toString() {
    if (this.activeMonster != null) {
      return (
        "monsterPlace " +
        this.id +
        " \nactive Monster :" +
        this.activeMonster.getComponent(Card)
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
    if (this.activeMonster != null) {
      this.hpLable.string =
        "hp: " + this.activeMonster.getComponent(Monster).currentHp;
      if (this.activeMonster.getComponent(Monster).baseDamage != 0) {
        this.dmgLable.string =
          "dmg: " + this.activeMonster.getComponent(Monster).calculateDamage();
        this.dmgLable.enabled = true;
      } else {
        this.dmgLable.enabled = false;
      }
    } else {
      this.hpLable.string = "hp:" + 'null!';
      this.dmgLable.enabled = false;
      // this.dmgLable.string = "dmg:" + 0;
    }
  }
}
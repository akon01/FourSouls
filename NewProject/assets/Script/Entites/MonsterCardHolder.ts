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
import { CARD_TYPE, COLORS } from "../Constants";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";
import CardEffect from "./CardEffect";
import BattleManager from "../Managers/BattleManager";
import ActivateItem from "../StackEffects/Activate Item";
import MultiEffectRoll from "../CardEffectComponents/MultiEffectChooser/MultiEffectRoll";
import Stack from "./Stack";

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


  async getNextMonster(sendToServer: boolean) {
    if (this.monsters.length > 0) {
      this.activeMonster = this.monsters[this.monsters.length - 1]
      this.activeMonster.active = true
      this.spriteFrame = this.activeMonster.getComponent(cc.Sprite).spriteFrame;
      if (sendToServer) {
        ServerClient.$.send(Signal.GET_NEXT_MONSTER, { monsterPlaceId: this.id });
      }
      //return this.activeMonster;
    } else {

      let drawnMonster = CardManager.monsterDeck.getComponent(Deck).drawCard(sendToServer);
      if (drawnMonster.getComponent(Card)._isFlipped) {
        drawnMonster.getComponent(Card).flipCard(sendToServer);
      }

      await this.addToMonsters(drawnMonster, sendToServer);
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
      ServerClient.$.send(Signal.ADD_MONSTER, { monsterPlaceId: this.id, monsterId: monsterCard.getComponent(Card)._cardId });
    }
    if (monster.isNonMonster) {
      let waitForAllReactionsOver = await ActionManager.waitForReqctionsOver();
      let currentTurnPlayer = PlayerManager.getPlayerById(
        TurnsManager.currentTurn.PlayerId
      );
      if (currentTurnPlayer == PlayerManager.mePlayer) {
        let hasLockingEffect;
        let collector = this.activeMonster.getComponent(CardEffect).multiEffectCollector;
        if (collector != null && collector instanceof MultiEffectRoll) {
          hasLockingEffect = true;
        } else hasLockingEffect = false;
        let playMonsterAsItem = new ActivateItem(currentTurnPlayer.getComponent(Player).character.getComponent(Card)._cardId, hasLockingEffect, this.activeMonster, currentTurnPlayer.getComponent(Player).character, false)
        await Stack.addToStack(playMonsterAsItem, true)

        // let serverEffect = await CardManager.getCardEffect(this.activeMonster, currentTurnPlayer.getComponent(Player).playerId)

        //let over = await this.activeMonster.getComponent(CardEffect).doServerEffect(serverEffect, [])
        //await PileManager.addCardToPile(CARD_TYPE.MONSTER, this.activeMonster, true);

        BattleManager.currentlyAttackedMonster = null;
        TurnsManager.currentTurn.battlePhase = false;
      }
    }
    MonsterField.updateActiveMonsters();
    // ActionManager.updateActions();
  }

  async discardTopMonster(sendToServer: boolean) {
    let monster = this.activeMonster;
    this.removeMonster(monster, sendToServer)
    await PileManager.addCardToPile(CARD_TYPE.MONSTER, monster, sendToServer)
    this.monsters.length > 0 ? this.activeMonster = this.monsters.pop() : this.activeMonster = null;

  }


  removeMonster(monster: cc.Node, sendToServer: boolean) {
    this.monsters.splice(this.monsters.indexOf(monster));

    if (sendToServer) {
      ServerClient.$.send(Signal.REMOVE_MONSTER, { holderId: this.id, monsterId: monster.getComponent(Card)._cardId });
    }
    // this.getNextMonster(sendToServer);
  }

  toString() {
    if (this.activeMonster != null) {
      return (
        "monsterPlace " +
        this.id +
        " \nactive Monster :" +
        this.activeMonster.getComponent(Card).name
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
      if (this.activeMonster.getComponent(Monster).bonusDamage != 0) {
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

import Monster from "./CardTypes/Monster";
import Card from "./GameEntities/Card";
import MonsterField from "./MonsterField";
import CardManager from "../Managers/CardManager";
import Deck from "./GameEntities/Deck";

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

  getNextMonster() {
    cc.log(this.monsters.length);
    if (this.monsters.length > 0) {
      this.activeMonster = this.monsters.pop();
      this.spriteFrame = this.activeMonster.getComponent(cc.Sprite).spriteFrame;
      return this.activeMonster;
    } else {
      let drawnMonster = CardManager.monsterDeck.getComponent(Deck).drawCard();
      if (drawnMonster.getComponent(Card).isFlipped) {
        drawnMonster.getComponent(Card).flipCard();
      }
      this.addToMonsters(drawnMonster);
    }
  }
  /**
   * add a monster to the place and set it as active
   * @param monsterCard
   */
  addToMonsters(monsterCard: cc.Node) {
    for (const monster of this.monsters) {
      monster.active = false;
    }
    this.monsters.push(monsterCard);
    this.activeMonster = monsterCard;
    this.activeMonster.getComponent(Monster).monsterPlace = this;
    this.spriteFrame = null;
    this.node.addChild(monsterCard, 0);
    monsterCard.setPosition(0, 0);

    this.node.width = monsterCard.width;
    this.node.height = monsterCard.height;
  }

  removeMonster(monster: cc.Node) {
    this.monsters.splice(this.monsters.indexOf(monster));
    this.getNextMonster();
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

  start() {}

  update(dt) {
    if (this.activeMonster != null) {
      this.hpLable.string =
        "hp: " + this.activeMonster.getComponent(Monster).currentHp;
      if (this.activeMonster.getComponent(Monster).baseDamage != 0) {
        this.dmgLable.string =
          "dmg: " + this.activeMonster.getComponent(Monster).calculateDamage();
      } else {
        this.dmgLable.enabled = false;
      }
    } else {
      this.hpLable.string = "hp:" + 0;
      this.dmgLable.enabled = false;
      // this.dmgLable.string = "dmg:" + 0;
    }
  }
}

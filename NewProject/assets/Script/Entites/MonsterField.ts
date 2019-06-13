import Signal from "../../Misc/Signal";
import Server from "../../ServerClient/ServerClient";
import { printMethodStarted } from "../Constants";
import CardManager from "../Managers/CardManager";
import { CARD_HEIGHT, CARD_WIDTH, COLORS } from "./../Constants";
import { CardLayout } from "./CardLayout";
import Card from "./GameEntities/Card";
import MonsterCardHolder from "./MonsterCardHolder";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterField extends cc.Component {
  @property(Number)
  maxNumOfMonsters: number = 2;

  @property(cc.Prefab)
  MonsterCardHolderPrefab: cc.Prefab = null;

  static monsterCardHolders: MonsterCardHolder[] = [];

  static activeMonsters: cc.Node[] = [];

  static holderIds = 0;

  @property
  layout: cc.Layout = null;

  @property
  widgetPadding: number = 0;

  /**
   *
   * @param monsterPlaceId id of the place to put the monster
   * @param monsterCard a monster card to put, if none is set, one from the deck wiil go
   */
  addMonsterToExsistingPlace(
    monsterPlaceId: number,
    monsterCard: cc.Node,
    sendToServer: boolean
  ) {
    let monsterCardComp = monsterCard.getComponent(Card);
    if (monsterCardComp.isFlipped) {
      monsterCardComp.flipCard();
    }
    let monsterHolder = MonsterField.getMonsterPlaceById(monsterPlaceId);
    let monsterId = monsterCardComp.cardId;
    //monsterCard.parent = cc.find("Canvas");
    //monsterPlace.node.active = false;
    // monsterCard.parent = monsterHolder.node;
    // monsterCard.setPosition(0, 0);

    monsterHolder.addToMonsters(monsterCard);
    CardManager.allCards.push(monsterCard);
    CardManager.onTableCards.push(monsterCard);
    // let layout = this.node.getComponent(CardLayout);
    // layout.addCardToLayout(monsterCard);
    this.updateActiveMonsters();
    let signal = Signal.NEWMONSTERONPLACE;
    let srvData = { newMonsterId: monsterId, monsterPlaceId: monsterPlaceId };
    if (sendToServer) {
      Server.$.send(signal, srvData);
    }
  }

  static getMonsterPlaceByActiveMonsterId(
    activeMonsterId: number
  ): MonsterCardHolder {
    for (let i = 0; i < this.monsterCardHolders.length; i++) {
      const monsterPlace = this.monsterCardHolders[i];
      const testedActiveMonsterId = monsterPlace.activeMonster.getComponent(
        Card
      ).cardId;
      if (activeMonsterId == testedActiveMonsterId) {
        return monsterPlace;
      }
    }
  }

  addMonsterToNewPlace(monsterCard, sendToServer: boolean) {
    let newMonsterHolder = this.getNewMonsterHolder();
    MonsterField.monsterCardHolders.push(
      newMonsterHolder.getComponent(MonsterCardHolder)
    );
    let layout = this.node.getComponent(CardLayout);
    layout.addCardToLayout(newMonsterHolder);

    this.addMonsterToExsistingPlace(
      newMonsterHolder.getComponent(MonsterCardHolder).id,
      monsterCard,
      sendToServer
    );
  }

  getNewMonsterHolder() {
    let newMonsterHolder = cc.instantiate(this.MonsterCardHolderPrefab);
    newMonsterHolder.name;
    newMonsterHolder.width = CARD_WIDTH;
    newMonsterHolder.height = CARD_HEIGHT;
    newMonsterHolder.getComponent(
      MonsterCardHolder
    ).id = ++MonsterField.holderIds;
    newMonsterHolder.name = "holder" + MonsterField.holderIds;
    this.node.addChild(newMonsterHolder);
    MonsterField.monsterCardHolders.push(
      newMonsterHolder.getComponent(MonsterCardHolder)
    );
    return newMonsterHolder;
  }

  getMonsterCardHoldersIds() {
    let ids = [];
    for (let i = 0; i < MonsterField.monsterCardHolders.length; i++) {
      const monsterPlace = MonsterField.monsterCardHolders[i];
      ids.push(monsterPlace.id);
    }
    return ids;
  }

  static getMonsterPlaceById(id: number) {
    for (let i = 0; i < MonsterField.monsterCardHolders.length; i++) {
      const monsterPlace = MonsterField.monsterCardHolders[i];

      if (monsterPlace.id == id) {
        return monsterPlace;
      }
    }
  }

  updateActiveMonsters() {
    MonsterField.activeMonsters = [];
    for (let i = 0; i < MonsterField.monsterCardHolders.length; i++) {
      const monsterPlace = MonsterField.monsterCardHolders[i];
      MonsterField.activeMonsters.push(monsterPlace.activeMonster);
    }
  }



  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.layout = this.getComponent(cc.Layout);
    // cc.log(layout);
    // cc.log(this.node);
    //make first two monster places
    for (let i = 0; i < 2; i++) {
      // let monsterHolder = cc.instantiate(this.MonsterCardHolderPrefab);
      // monsterHolder.name =
      //   "holder" + monsterHolder.getComponent(MonsterCardHolder).id;
      // monsterHolder.parent = this.node;
      // monsterHolder.width = CARD_WIDTH;
      // monsterHolder.height = CARD_HEIGHT;
      // cc.log("add holder to layout");
      // // this.node.addChild(monsterHolder);
      // cc.log("after add holder to layout");
      // MonsterField.monsterCardHolders.push(
      //   monsterHolder.getComponent(MonsterCardHolder)
      // );
      this.getNewMonsterHolder();
      // this.node.parent.dispatchEvent(
      //   new cc.Event.EventCustom("monsterFieldRdy", true)
      // );
    }
    // MonsterField.monsterCardHolders.push(new MonsterPlace(++MonsterField.placesIds));
    // MonsterField.monsterCardHolders.push(new MonsterPlace(++MonsterField.placesIds));
  }

  start() {}

  update(dt) {}
}

// export class MonsterPlace  {

//     placeForCards:cc.Node
//   activeMonster: cc.Node = null;
//   monsters: cc.Node[] = [];
//   id: number = 0;
//   attackButton: cc.Button;

//   constructor(id) {
//     this.id = id;

//   }

//   getNextMonster() {
//     return (this.activeMonster = this.monsters.pop());
//   }
//   /**
//    * add a monster to the place and set it as active
//    * @param monsterCard
//    */
//   addToMonsters(monsterCard: cc.Node) {
//     this.monsters.push(monsterCard);
//     this.activeMonster = monsterCard;
//     this.activeMonster.getComponent(Monster).monsterPlace = this;
//     cc.log(this);
//   }

//   //   toString() {
//   //     "monsterPlace " +
//   //       this.id +
//   //       " \nactive Monster :" +
//   //       this.activeMonster.getComponent(Card);
//   //   }
// }

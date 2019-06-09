import { MoveLootToPile } from "./../Entites/Action";
import { printMethodStarted, ITEM_TYPE } from "./../Constants";
import { CARD_HEIGHT, CARD_WIDTH, TIMETODRAW } from "../Constants";
import Player from "../Entites/Player";
import { CardLayout } from "../Entites/CardLayout";
import Server from "../../ServerClient/ServerClient";
import PlayerDesk from "../Entites/PlayerDesk";
import CardManager from "./CardManager";
import Character from "../Entites/CardTypes/Character";
import PileManager from "./PileManager";
import Dice from "../Entites/Dice";
import MoneyLable from "../LableScripts/MoneyLable";
import Item from "../Entites/CardTypes/Item";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerManager extends cc.Component {
  static players: cc.Node[] = [];

  static hands: cc.Node[] = [];

  static desks: cc.Node[] = [];

  static dice: cc.Node[] = [];

  static playerPrefab: cc.Prefab = null;

  static handPrefab: cc.Prefab = null;

  static dicePrefab: cc.Prefab = null;

  static playerDeskPrefab: cc.Prefab = null;

  static mePlayer: cc.Node = null;

  static prefabLoaded = false;

  static async init(serverId: number) {
    await this.preLoadPrefabs();
    this.createPlayers(serverId);
    this.createHands();
    this.createPlayerDesks();
    this.createDice();
    this.assingHands();
  }

  static async preLoadPrefabs() {
    cc.loader.loadResDir("Prefabs/Entities/", function(err, rsc, urls) {
      for (let i = 0; i < rsc.length; i++) {
        const prefab: cc.Prefab = rsc[i];
        switch (prefab.name) {
          case "Hand":
            PlayerManager.handPrefab = prefab;
            break;
          case "Player":
            PlayerManager.playerPrefab = prefab;
            break;
          case "Dice":
            PlayerManager.dicePrefab = prefab;
          case "PlayerDesk":
            PlayerManager.playerDeskPrefab = prefab;
            break;
          default:
            break;
        }
      }
      PlayerManager.prefabLoaded = true;
    });
    let loaded = await this.waitForPrefabLoad();
    return loaded;
  }

  static async waitForPrefabLoad(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let check = () => {
        if (PlayerManager.prefabLoaded == true) {
          resolve(true);
        } else setTimeout(check, 50);
      };
      setTimeout(check, 50);
    });
  }

  static createPlayers(serverId: number) {
    //create max amount of players and assing them to this property

    for (let i = 1; i <= Server.numOfPlayers; i++) {
      var newNode: cc.Node = cc.instantiate(PlayerManager.playerPrefab);
      newNode.name = "player" + i;
      let playerComp: Player = newNode.getComponent("Player");
      playerComp.playerId = i;
      if (i == serverId) {
        playerComp.me = true;
        PlayerManager.mePlayer = newNode;
      }

      cc.director
        .getScene()
        .getChildByName("Canvas")
        .addChild(newNode);

      PlayerManager.players.push(newNode);
    }
  }

  //create hands and place them on canvas
  static createHands() {
    for (let i = 1; i <= PlayerManager.players.length; i++) {
      var newNode: cc.Node = cc.instantiate(PlayerManager.handPrefab);
      let handComp: CardLayout = newNode.getComponent("CardLayout");
      handComp.handId = i;
      newNode.height = CARD_HEIGHT;
      newNode.width = CARD_WIDTH * 7;
      newNode.name = "Hand";
      PlayerManager.hands.push(newNode);
    }
  }

  static createDice() {
    for (let i = 1; i <= PlayerManager.players.length; i++) {
      var newNode: cc.Node = cc.instantiate(PlayerManager.dicePrefab);
      let diceComp: Dice = newNode.getComponent(Dice);
      newNode.name = "Dice";
      PlayerManager.dice.push(newNode);
    }
  }

  static createPlayerDesks() {
    for (let i = 1; i <= PlayerManager.players.length; i++) {
      var newNode: cc.Node = cc.instantiate(PlayerManager.playerDeskPrefab);
      let deskComp: PlayerDesk = newNode.getComponent("PlayerDesk");

      let playerItems: cc.Node = newNode.getChildByName("PlayerItems");
      let activeItemsLayout: CardLayout = deskComp.activeItemLayout.getComponent(
        CardLayout
      );
      let passiveItemsLayout: CardLayout = deskComp.passiveItemLayout.getComponent(
        CardLayout
      );
      activeItemsLayout.node.height = CARD_HEIGHT;
      passiveItemsLayout.node.height = CARD_HEIGHT;
      activeItemsLayout.node.width = CARD_WIDTH * 7;
      passiveItemsLayout.node.width = CARD_WIDTH * 7;

      deskComp.deskId = i;
      newNode.name = "Desk";
      PlayerManager.desks.push(newNode);
    }
  }

  static assingCharacters() {
    for (let i = 0; i < PlayerManager.players.length; i++) {
      const playerComp: Player = PlayerManager.players[i].getComponent(Player);
      const fullCharCard: {
        char: cc.Node;
        item: cc.Node;
      } = CardManager.characterDeck.pop();
      let charCard = fullCharCard.char;
      let itemCard = fullCharCard.item;
      CardManager.onTableCards.push(charCard, itemCard);
      CardManager.allCards.push(charCard, itemCard);
      playerComp.setCharacter(charCard, itemCard);
      playerComp.activeItems.push(charCard);
      if (
        itemCard.getComponent(Item).type == ITEM_TYPE.ACTIVE ||
        itemCard.getComponent(Item).type == ITEM_TYPE.BOTH
      ) {
        playerComp.activeItems.push(itemCard);
      } else {
        playerComp.passiveItems.push(itemCard);
      }
    }
  }

  static getItemByCharCard(item, i, items) {
    switch (this.name) {
      case "Blue Baby":
        if (item.name == "Forever Alone") {
          return item;
        }
        break;
      case "The Lost":
        //////cc.log('character the lost')
        if (item.name == "HolyMantle") {
          //////cc.log('item Holy Mantle')
          return item;
        }
        break;
      default:
        break;
    }
  }

  static assingHands() {
    let meId: number = PlayerManager.mePlayer.getComponent("Player").playerId;
    let playerNode: cc.Node;
    let canvas: cc.Node = cc.find("Canvas");
    let playerComp: Player;

    for (let i = 0; i < PlayerManager.players.length; i++) {
      const handNode = PlayerManager.hands[i];
      const deskNode = PlayerManager.desks[i];
      const diceNode = PlayerManager.dice[i];
      let handComp: CardLayout = handNode.getComponent("CardLayout");
      let diceWidget: cc.Widget = diceNode.getComponent(cc.Widget);
      let handWidget: cc.Widget = handNode.getComponent(cc.Widget);
      let deskWidget: cc.Widget = deskNode.getComponent(cc.Widget);
      handWidget.alignMode = cc.Widget.AlignMode.ONCE;
      let deskComp: PlayerDesk = deskNode.getComponent("PlayerDesk");
      switch (i) {
        case 0:
          playerNode = PlayerManager.mePlayer;
          playerComp = PlayerManager.mePlayer.getComponent("Player");

          //position hand

          handWidget.target = canvas;
          handWidget.isAlignRight = true;
          handWidget.isAlignBottom = true;
          handWidget.right = 65;
          handWidget.bottom = -38;

          //position desk
          deskWidget.target = canvas;
          deskWidget.isAlignRight = true;
          deskWidget.isAlignBottom = true;
          deskWidget.right = 230;
          deskWidget.bottom = 110;

          //position dice
          diceWidget.target = canvas;
          diceWidget.isAlignRight = true;
          diceWidget.isAlignBottom = true;
          diceWidget.right = 250;
          diceWidget.bottom = 160;

          //show hand and then hide on touch
          handNode.on("touchstart", event => {
            //////cc.log('show hand ')
            handComp.showHandLayout();
            handNode.getComponent(CardLayout).scheduleOnce(() => {
              handComp.hideHandLayout();
            }, 2);
          });

          //attach money lable to player
          cc
            .find("Canvas/RBMoneyLable")
            .getComponent(MoneyLable).player = playerComp;

          break;
        case 1:
          playerNode = PlayerManager.getPlayerById(meId + 1);
          playerComp = playerNode.getComponent("Player");
          //set hand pos
          handWidget.target = canvas;
          handWidget.isAlignLeft = true;
          handWidget.isAlignBottom = true;
          handWidget.left = 65;
          handWidget.bottom = -38;
          // set desk pos
          deskWidget.target = canvas;
          deskWidget.isAlignLeft = true;
          deskWidget.isAlignBottom = true;
          deskWidget.left = 230;
          deskWidget.bottom = 110;

          //position dice
          diceWidget.target = canvas;
          diceWidget.isAlignLeft = true;
          diceWidget.isAlignBottom = true;
          diceWidget.left = 250;
          diceWidget.bottom = 160;

          //attach money lable to player
          cc
            .find("Canvas/LBMoneyLable")
            .getComponent(MoneyLable).player = playerComp;

          break;
        case 2:
          playerNode = PlayerManager.getPlayerById(meId + 2);
          playerComp = playerNode.getComponent("Player");
          //set hand pos
          handWidget.target = canvas;
          handWidget.isAlignLeft = true;
          handWidget.isAlignTop = true;
          handWidget.left = 65;
          handWidget.top = -38;
          //set desk pos
          deskWidget.target = canvas;
          deskWidget.isAlignLeft = true;
          deskWidget.isAlignTop = true;
          deskWidget.left = 230;
          deskWidget.top = 110;
          //position dice
          diceWidget.target = canvas;
          diceWidget.isAlignLeft = true;
          diceWidget.isAlignTop = true;
          diceWidget.left = 250;
          diceWidget.top = 160;

          //attach money lable to player
          cc
            .find("Canvas/LTMoneyLable")
            .getComponent(MoneyLable).player = playerComp;

          break;
        case 3:
          playerNode = PlayerManager.getPlayerById(meId + 3);
          playerComp = playerNode.getComponent("Player");
          //set hand pos
          handWidget.target = canvas;
          handWidget.isAlignRight = true;
          handWidget.isAlignTop = true;
          handWidget.right = 65;
          handWidget.bottom = -38;
          // set desk pos
          deskWidget.target = canvas;
          deskWidget.isAlignRight = true;
          deskWidget.isAlignTop = true;
          deskWidget.left = 230;
          deskWidget.top = 110;
          //position dice
          diceWidget.target = canvas;
          diceWidget.isAlignRight = true;
          diceWidget.isAlignTop = true;
          diceWidget.left = 250;
          diceWidget.top = 160;

          //attach money lable to player
          cc
            .find("Canvas/RTMoneyLable")
            .getComponent(MoneyLable).player = playerComp;
          break;
        default:
          break;
      }

      //setting hand of player

      playerNode.addChild(handNode);
      handWidget.updateAlignment();

      playerNode.getComponent("Player").landingZones.push(handNode);
      handComp.boundingBoxWithoutChildren = handComp.node.getBoundingBoxToWorld();

      playerComp.hand = handComp;

      //setting desk of player

      playerComp.setDesk(deskNode);
      deskWidget.updateAlignment();

      //setting dice of player
      playerComp.setDice(diceNode);
    }
  }

  static getPlayerById(id: number): cc.Node {
    //if current player id is not 1 in server then place id in order for assinging hands
    if (id > Server.numOfPlayers) {
      id = id - Server.numOfPlayers;
    }
    for (let i = 0; i < PlayerManager.players.length; i++) {
      const player = PlayerManager.players[i];
      let playerComp: Player = player.getComponent("Player");
      if (playerComp.playerId == id) {
        return player;
      }
    }
  }

  static getPlayerByCardId(cardId: number) {
    let playerCard = CardManager.getCardById(cardId);
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i].getComponent(Player);
      if (player.character == playerCard) {
        return player;
      }
    }
  }

  ///ADD a function to get all the other players given a player
  static getOtherPlayers(player: cc.Node) {
    let otherPlayerNodes: Player[] = [];
    for (let i = 0; i < PlayerManager.players.length; i++) {
      if (PlayerManager.players[i] != player) {
        otherPlayerNodes.push(PlayerManager.players[i].getComponent("Player"));
      }
    }
    return otherPlayerNodes;
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() {}

  // update (dt) {}
}

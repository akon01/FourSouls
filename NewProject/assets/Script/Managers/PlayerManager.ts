import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import { CardLayout } from "../Entites/CardLayout";
import Item from "../Entites/CardTypes/Item";
import Card from "../Entites/GameEntities/Card";
import Dice from "../Entites/GameEntities/Dice";
import Player from "../Entites/GameEntities/Player";
import PlayerDesk from "../Entites/PlayerDesk";
import MoneyLable from "../LableScripts/MoneyLable";
import { CARD_HEIGHT, CARD_WIDTH, ITEM_TYPE } from "./../Constants";
import CardManager from "./CardManager";
import Character from "../Entites/CardTypes/Character";


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

  static edenChosen = false;

  static edenChosenCard: cc.Node = null;

  static async init(serverId: number) {
    await this.preLoadPrefabs();
    this.createPlayers(serverId);
    this.createHands();
    this.createPlayerDesks();
    this.createDice();
    this.assingHands();
  }

  static async preLoadPrefabs() {
    cc.loader.loadResDir("Prefabs/Entities/", function (err, rsc, urls) {
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
      check.bind(this);
      setTimeout(check, 50);
    });
  }

  static createPlayers(serverId: number) {
    //create max amount of players and assing them to this property

    for (let i = 1; i <= ServerClient.numOfPlayers; i++) {
      var newNode: cc.Node = cc.instantiate(PlayerManager.playerPrefab);
      newNode.name = "player" + i;
      let playerComp: Player = newNode.getComponent(Player);
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
    //for (let i = 1; i <= PlayerManager.players.length; i++) {
    for (let i = 1; i <= 4; i++) {
      //  var newNode: cc.Node = cc.instantiate(PlayerManager.handPrefab);
      let newNode = cc.find('Canvas/Hand' + i)
      let handComp: CardLayout = newNode.getComponent("CardLayout");
      handComp.handId = i;
      newNode.height = CARD_HEIGHT;
      newNode.width = CARD_WIDTH * 7;
      newNode.name = "Hand";
      PlayerManager.hands.push(newNode);
    }
  }

  static createDice() {
    //    for (let i = 1; i <= PlayerManager.players.length; i++) {
    for (let i = 1; i <= 4; i++) {
      //   var newNode: cc.Node = cc.instantiate(PlayerManager.dicePrefab);
      let newNode = cc.find('Canvas/Dice' + i)

      newNode.getComponent(Dice).diceId = ++CardManager.cardsId;
      newNode.name = "Dice";

      PlayerManager.dice.push(newNode);
    }
  }

  static createPlayerDesks() {

    //  for (let i = 1; i <= PlayerManager.players.length; i++) {
    for (let i = 1; i <= 4; i++) {
      //    var newNode: cc.Node = cc.instantiate(PlayerManager.playerDeskPrefab);
      let deskName = 'Desk' + i

      let newNode = cc.find("Canvas/" + deskName)
      let deskComp: PlayerDesk = newNode.getComponent(PlayerDesk);

      let playerItems: cc.Node = newNode.getChildByName("PlayerItems");
      let activeItemsLayout: CardLayout = deskComp.activeItemLayout.getComponent(
        CardLayout
      );
      let passiveItemsLayout: CardLayout = deskComp.passiveItemLayout.getComponent(
        CardLayout
      );
      // activeItemsLayout.node.height = CARD_HEIGHT;
      // passiveItemsLayout.node.height = CARD_HEIGHT;
      // activeItemsLayout.node.width = CARD_WIDTH * 7;
      // passiveItemsLayout.node.width = CARD_WIDTH * 7;

      deskComp.deskId = i;
      newNode.name = "Desk";
      PlayerManager.desks.push(newNode);
    }
  }

  static async assingCharacters(sendToServer: boolean) {
    for (let i = 0; i < PlayerManager.players.length; i++) {
      const playerComp: Player = PlayerManager.players[i].getComponent(Player);
      const fullCharCard: {
        char: cc.Node;
        item: cc.Node;
      } = CardManager.characterDeck.pop();
      let charCard = fullCharCard.char;
      let itemCard;
      if (charCard.getComponent(Card).cardName == 'Eden') {
        ServerClient.$.send(Signal.CHOOSE_FOR_EDEN, { playerId: playerComp.playerId, originPlayerId: this.mePlayer.getComponent(Player).playerId })
        itemCard = await this.waitForEdenChoose()

      } else {

        itemCard = fullCharCard.item;
        CardManager.onTableCards.push(charCard, itemCard);
      }
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
      if (sendToServer) {
        // playerComp.hpLable = cc.find(`Canvas/P${playerComp.playerId} HP`).getComponent(cc.Label)
        playerComp.hpLable.string = `${charCard.getComponent(Character).Hp}♥`
        //  CardManager.allCards.push(charCard, itemCard);
        ServerClient.$.send(Signal.ASSIGN_CHAR_TO_PLAYER, { playerId: playerComp.playerId, charCardId: charCard.getComponent(Card)._cardId, itemCardId: itemCard.getComponent(Card)._cardId })
      }
    }
  }


  static async waitForEdenChoose() {
    return new Promise((resolve, reject) => {
      let check = () => {
        if (PlayerManager.edenChosen == true) {
          resolve(PlayerManager.edenChosenCard);
        } else setTimeout(check, 50);
      };
      check.bind(this);
      setTimeout(check, 50);
    });
  }

  static getItemByCharCard(item, i, items) {
    switch (this.name) {
      case "Blue Baby":
        if (item.name == "Forever Alone") {
          return item;
        }
        break;
      case "The Lost":

        if (item.name == "HolyMantle") {

          return item;
        }
        break;
      default:
        break;
    }
  }

  static assingHands() {
    let meId: number = PlayerManager.mePlayer.getComponent(Player).playerId;
    let playerNode: cc.Node;
    let canvas: cc.Node = cc.find("Canvas");
    let playerComp: Player;

    for (let i = 0; i < PlayerManager.players.length; i++) {
      const handNode = PlayerManager.hands[i]
      const deskNode = PlayerManager.desks[i]
      const diceNode = PlayerManager.dice[i]

      let handComp: CardLayout = handNode.getComponent("CardLayout");
      let diceWidget: cc.Widget = diceNode.getComponent(cc.Widget);
      let handWidget: cc.Widget = handNode.getComponent(cc.Widget);
      let deskWidget: cc.Widget = deskNode.getComponent(cc.Widget);
      handWidget.alignMode = cc.Widget.AlignMode.ONCE;
      let deskComp: PlayerDesk = deskNode.getComponent(PlayerDesk);
      switch (i) {
        case 0:
          playerNode = PlayerManager.mePlayer;
          playerComp = PlayerManager.mePlayer.getComponent(Player);
          playerComp._putCharLeft = true
          // //position hand

          playerComp._reactionToggle = cc.find('Canvas/Reaction Toggle').getComponent(cc.Toggle)

          //attach money lable to player
          cc
            .find("Canvas/RBMoneyLable")
            .getComponent(MoneyLable).player = playerComp;

          playerComp.hpLable = cc.find(`Canvas/P1 HP`).getComponent(cc.Label)
          break;
        case 1:
          playerNode = PlayerManager.getPlayerById(meId + 1);
          playerComp = playerNode.getComponent(Player);


          //attach money lable to player
          cc
            .find("Canvas/LBMoneyLable")
            .getComponent(MoneyLable).player = playerComp;
          playerComp.hpLable = cc.find(`Canvas/P2 HP`).getComponent(cc.Label)
          break;
        case 2:
          playerNode = PlayerManager.getPlayerById(meId + 2);
          playerComp = playerNode.getComponent(Player);


          //attach money lable to player
          cc
            .find("Canvas/LTMoneyLable")
            .getComponent(MoneyLable).player = playerComp;
          playerComp.hpLable = cc.find(`Canvas/P3 HP`).getComponent(cc.Label)
          break;
        case 3:
          playerNode = PlayerManager.getPlayerById(meId + 3);
          playerComp = playerNode.getComponent(Player);
          playerComp._putCharLeft = true;


          //attach money lable to player
          cc
            .find("Canvas/RTMoneyLable")
            .getComponent(MoneyLable).player = playerComp;
          playerComp.hpLable = cc.find(`Canvas/P4 HP`).getComponent(cc.Label)
          break;
        default:
          break;
      }

      //setting hand of player

      playerComp.setHand(handNode);
      // playerNode.addChild(handNode);
      // handWidget.updateAlignment();

      // playerNode.getComponent(Player).landingZones.push(handNode);
      // handComp.boundingBoxWithoutChildren = handComp.node.getBoundingBoxToWorld();

      // playerComp.hand = handComp;

      //setting desk of player

      playerComp.setDesk(deskNode);
      deskWidget.updateAlignment();

      //setting dice of player
      playerComp.setDice(diceNode);
    }

    for (let i = 1; i <= this.players.length; i++) {
      const desk = this.desks[this.desks.length - 1];
      desk.destroy();
      this.desks.splice(this.desks.indexOf(desk))
      const hand = this.hands[this.hands.length - 1]
      hand.destroy();
      this.hands.splice(this.hands.indexOf(hand))
      const dice = this.dice[this.dice.length - 1]
      dice.destroy();
      this.dice.splice(this.dice.indexOf(dice))
    }
  }

  static getPlayerById(id: number): cc.Node {
    //if current player id is not 1 in server then place id in order for assinging hands
    if (id > ServerClient.numOfPlayers) {
      id = id - ServerClient.numOfPlayers;
    }
    for (let i = 0; i < PlayerManager.players.length; i++) {
      const player = PlayerManager.players[i];
      let playerComp: Player = player.getComponent(Player);
      if (playerComp.playerId == id) {
        return player;
      }
    }
    cc.log('no player was found')
    return null;
  }


  static getPlayerByCard(card: cc.Node) {
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i].getComponent(Player);

      if (player.character == card) return player
      if (player.characterItem == card) return player

      for (let j = 0; j < player.handCards.length; j++) {
        const testedCard = player.handCards[j];

        if (card == testedCard) {
          return player;
        }
      }

      for (let j = 0; j < player.deskCards.length; j++) {
        const testedCard = player.deskCards[j];

        if (card == testedCard) {
          return player;
        }
      }
      for (let j = 0; j < player._lootCardsPlayedThisTurn.length; j++) {
        const lootCard = player._lootCardsPlayedThisTurn[j];
        if (card == lootCard) return player
      }
    }
    cc.log('no player was found')
    return null;

  }

  static getPlayerByCardId(cardId: number) {
    let playerCard = CardManager.getCardById(cardId, true);
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i].getComponent(Player);
      if (player.character == playerCard) {
        return player;
      }
    }
  }

  static getPlayerByDice(diceId: number) {
    for (const player of this.players) {
      if (player.getComponent(Player).dice.diceId == diceId) {
        return player.getComponent(Player);
      }
    }
    cc.log('no player found')
  }

  static getPriorityPlayer() {
    for (const player of this.players) {
      if (player.getComponent(Player)._hasPriority) {
        return player.getComponent(Player)
      }
    }
  }

  static getNextPlayer(player: Player) {
    let id = player.playerId
    cc.log(id)
    if (id == this.players.length) {
      id = 0
    }
    for (let i = 0; i < this.players.length; i++) {
      const playerToTest = this.players[i].getComponent(Player);
      if (playerToTest.playerId == (id + 1)) return playerToTest

    }
  }

  ///ADD a function to get all the other players given a player
  static getOtherPlayers(player: cc.Node) {
    let otherPlayerNodes: Player[] = [];
    for (let i = 0; i < PlayerManager.players.length; i++) {
      if (PlayerManager.players[i] != player) {
        otherPlayerNodes.push(PlayerManager.players[i].getComponent(Player));
      }
    }
    return otherPlayerNodes;
  }

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}

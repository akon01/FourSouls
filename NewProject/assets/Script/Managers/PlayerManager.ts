import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import { CardLayout } from "../Entites/CardLayout";
import Item from "../Entites/CardTypes/Item";
import Card from "../Entites/GameEntities/Card";
import Deck from "../Entites/GameEntities/Deck";
import Dice from "../Entites/GameEntities/Dice";
import Player from "../Entites/GameEntities/Player";
import PlayerDesk from "../Entites/PlayerDesk";
import StatLable from "../LableScripts/MoneyLable";
import { BUTTON_STATE, CARD_HEIGHT, CARD_WIDTH, GAME_EVENTS, ITEM_TYPE, PASSIVE_EVENTS } from "./../Constants";
import ButtonManager from "./ButtonManager";
import CardManager from "./CardManager";
import PassiveManager, { PassiveMeta } from "./PassiveManager";
import DecisionMarker from "../Entites/Decision Marker";
import { whevent } from "../../ServerClient/whevent";
import PlayerStatsViewer from "../Entites/Player Stats Viewer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerManager extends cc.Component {

  static players: cc.Node[] = [];

  static hands: cc.Node[] = [];

  @property([PlayerDesk])
  desks: PlayerDesk[] = [];

  static dice: cc.Node[] = [];

  @property(cc.Prefab)
  playerPrefab: cc.Prefab = null;

  @property(cc.Prefab)
  handPrefab: cc.Prefab = null;

  @property(cc.Prefab)
  dicePrefab: cc.Prefab = null;

  @property(cc.Prefab)
  playerDeskPrefab: cc.Prefab = null;

  @property(cc.Toggle)
  reactionToggle: cc.Toggle = null

  static mePlayer: cc.Node = null;

  static edenChosen = false;

  static edenChosenCard: cc.Node = null;

  static $: PlayerManager = null;

  static isLoaded: boolean = false;


  static async init(serverId: number) {
    //  await this.preLoadPrefabs();
    if (this.isLoaded == false) {
      const loaded = await this.waitForPrefabLoad();
    }
    this.createPlayers(serverId);
    this.createPlayerDesks();
    this.createHands();
    this.createDice();
    this.assingHands();

    cc.loader.releaseResDir("Prefabs/Entities/", cc.Prefab)
  }

  static async preLoadPrefabs() {
    cc.loader.loadResDir("Prefabs/Entities/", function (err, rsc) {
      for (let i = 0; i < rsc.length; i++) {
        const prefab: cc.Prefab = rsc[i];
        switch (prefab.name) {
          case "Hand":
            PlayerManager.$.handPrefab = prefab;
            break;
          case "Player":
            PlayerManager.$.playerPrefab = prefab;
            break;
          case "Dice":
            PlayerManager.$.dicePrefab = prefab;
          case "PlayerDesk":
            PlayerManager.$.playerDeskPrefab = prefab;
            break;
          default:
            break;
        }
      }
      whevent.emit(GAME_EVENTS.PLAYER_MAN_PREFAB_LOAD);
      // PlayerManager.prefabLoaded = true;
    });
    const loaded = await this.waitForPrefabLoad();
    return loaded;
  }

  static async waitForPrefabLoad(): Promise<boolean> {
    return new Promise((resolve) => {
      whevent.onOnce(GAME_EVENTS.PLAYER_MAN_PREFAB_LOAD, () => {
        resolve(true);
      });

    });
  }

  static createPlayers(serverId: number) {
    cc.log(`create`)
    cc.log(PlayerManager.$)
    // create max amount of players and assing them to this property
    for (let i = 1; i <= ServerClient.numOfPlayers; i++) {
      const newNode: cc.Node = cc.instantiate(PlayerManager.$.playerPrefab);
      newNode.name = "player" + i;
      const playerComp: Player = newNode.getComponent(Player);
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
    PlayerManager.$.playerPrefab = null;
  }

  // create hands and place them on canvas
  static createHands() {
    // for (let i = 0; i < PlayerManager.players.length - PlayerManager.hands.length; i++) {
    //   PlayerManager.hands.pop().destroy()
    // }
    for (let i = 1; i <= PlayerManager.players.length; i++) {
      cc.log(this.$.desks)
      const hands = this.$.desks.map(desk => desk.hand);
      // for (let i = 1; i <= 4; i++) {
      //  var newNode: cc.Node = cc.instantiate(PlayerManager.handPrefab);
      cc.log(hands)
      const newNode = hands[i - 1].node
      const handComp: CardLayout = newNode.getComponent(CardLayout);
      handComp.handId = i;
      newNode.height = CARD_HEIGHT;
      newNode.width = CARD_WIDTH * 7;
      newNode.name = "Hand" + i;
      PlayerManager.hands.push(newNode);
    }
  }

  static createDice() {
    for (let i = 1; i <= PlayerManager.players.length; i++) {
      // for (let i = 1; i <= 4; i++) {
      //   var newNode: cc.Node = cc.instantiate(PlayerManager.dicePrefab);
      let newNode: Dice = this.$.desks.map(desk => desk.dice)[i - 1];
      newNode.diceId = ++CardManager.cardsId;
      newNode.node.name = "Dice" + i;
      PlayerManager.dice.push(newNode.node);
    }
  }

  static createPlayerDesks() {
    const numOfDesksToDestroy = PlayerManager.$.desks.length - PlayerManager.players.length;
    for (let i = 0; i < numOfDesksToDestroy; i++) {
      const deskToDestroy = PlayerManager.$.desks.pop().node;
      cc.log(`destroy ${deskToDestroy.name}`)
      deskToDestroy.destroyAllChildren()
      deskToDestroy.destroy()
      cc.log(deskToDestroy)
    }
    for (let i = 1; i <= PlayerManager.players.length; i++) {
      // for (let i = 1; i <= 4; i++) {
      //    var newNode: cc.Node = cc.instantiate(PlayerManager.playerDeskPrefab);
      const deskName = "Desk" + i;

      const newNode = this.$.desks[i - 1].node
      const deskComp: PlayerDesk = newNode.getComponent(PlayerDesk);

      deskComp.deskId = i;
      newNode.name = deskName;
      //   PlayerManager.desks.push(newNode);
    }
  }

  static shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }



  static async waitForSetCharOver() {
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.END_SET_CHAR, () => {
        resolve()
      })
    })
  }

  static async assignCharacterToPlayer(fullCharCard: { char: cc.Node, item: cc.Node }, player: Player, sendToServer: boolean) {
    const charCard = fullCharCard.char;
    let itemCard: cc.Node;
    // Special Case : Eden
    if (charCard.getComponent(Card).cardName == "Eden") {
      ServerClient.$.send(Signal.CHOOSE_FOR_EDEN, { playerId: player.playerId, originPlayerId: this.mePlayer.getComponent(Player).playerId });
      itemCard = await this.waitForEdenChoose();
      //   itemCard = CardManager.treasureDeck.getComponent(Deck)._cards.getCards().find(card => card.name == `Smelter`)
      CardManager.treasureDeck.getComponent(Deck).drawSpecificCard(itemCard, true);
      if (itemCard.getComponent(Card)._isFlipped) { itemCard.getComponent(Card).flipCard(true); }
      itemCard.getComponent(Item).eternal = true;
    } else {
      itemCard = fullCharCard.item;
    }
    CardManager.onTableCards.push(charCard, itemCard);
    if (player.node != this.mePlayer) {
      ServerClient.$.send(Signal.SET_CHAR, { originPlayerId: this.mePlayer.getComponent(Player).playerId, playerId: player.playerId, charCardId: charCard.getComponent(Card)._cardId, itemCardId: itemCard.getComponent(Card)._cardId })
      await this.waitForSetCharOver()
      cc.log(`after set char end`)
    } else {
      await player.setCharacter(charCard, itemCard, true);
    }
  }

  static async assingCharacters(sendToServer: boolean) {
    // Is Char Deck Shuffle

    const rand = new Date().getTime() % 10;
    for (let index = 0; index <= rand; index++) {
      CardManager.characterDeck = this.shuffle(CardManager.characterDeck);
    }
    //
    let isEden = false
    let edenPlayer: Player = null
    let edenItem: cc.Node = null;
    for (let i = 0; i < PlayerManager.players.length; i++) {
      const playerComp: Player = PlayerManager.players[i].getComponent(Player);

      let fullCharCard
      //only for test of characters:
      // if (i == 0) {
      //   cc.log(`i is zero`)
      //   fullCharCard = CardManager.characterDeck.find(card => card.char.getComponent(Card).cardName == "Lilith")
      // } else {
      fullCharCard = CardManager.characterDeck.pop();
      //   cc.log(fullCharCard)
      // }
      // special case: Eden
      if (fullCharCard.char.getComponent(Card).cardName == "Eden") {
        isEden = true
        edenPlayer = playerComp
        //Item Shuld Be null here
        edenItem = fullCharCard.item
      }
      cc.log(`assign ${fullCharCard.char.name} to player ${playerComp.playerId}`)
      await this.assignCharacterToPlayer(fullCharCard, playerComp, sendToServer);
    }
    // special case: Eden
    if (isEden) {
      CardManager.onTableCards.push(edenItem)
      const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ADD_ITEM, [edenItem], null, edenPlayer.node);
      const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta);
      edenItem = afterPassiveMeta.args[0];
      passiveMeta.result = await PassiveManager.testForPassiveAfter(passiveMeta);
    }
  }

  static async waitForEdenChoose(): Promise<cc.Node> {
    return new Promise((resolve) => {
      whevent.onOnce(GAME_EVENTS.EDEN_WAS_CHOSEN, () => {
        resolve(PlayerManager.edenChosenCard);
      });
    });
  }

  static getItemByCharCard(item) {
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
    const meId: number = PlayerManager.mePlayer.getComponent(Player).playerId;
    let playerNode: cc.Node;
    // let canvas: cc.Node = cc.find("Canvas");
    let playerComp: Player;

    for (let i = 0; i < PlayerManager.players.length; i++) {

      const handNode = PlayerManager.hands[i];
      const deskNode = PlayerManager.$.desks[i].node;
      const diceNode = PlayerManager.dice[i];
      const playerStats = deskNode.getComponent(PlayerDesk).playerStatsLayout

      const handWidget: cc.Widget = handNode.getComponent(cc.Widget);
      const deskWidget: cc.Widget = deskNode.getComponent(cc.Widget);
      handWidget.alignMode = cc.Widget.AlignMode.ONCE;
      let moneyLable: cc.Node = playerStats.coins.node
      let hpLable: cc.Node = playerStats.hp.node
      let id: number
      switch (i) {
        case 0:
          playerNode = PlayerManager.mePlayer;
          playerComp = playerNode.getComponent(Player);
          playerComp._putCharLeft = true;
          // //position hand

          playerComp._reactionToggle = deskNode.getComponent(PlayerDesk).playerStatsLayout.reactionToggle.getComponent(cc.Toggle);


          playerComp._reactionToggle.node.on(cc.Node.EventType.TOUCH_END, async () => {
            let event;
            ServerClient.$.send(Signal.REACTION_TOGGLED, { playerId: PlayerManager.mePlayer.getComponent(Player).playerId })
            cc.log(`reaction btn touch end`)
            !PlayerManager.mePlayer.getComponent(Player)._reactionToggle.isChecked == true ? event = BUTTON_STATE.ENABLED : event = BUTTON_STATE.DISABLED;
            if (event == BUTTON_STATE.ENABLED) {
              if (!PlayerManager.mePlayer.getComponent(Player)._inGetResponse) {
                event = BUTTON_STATE.DISABLED
              }
            }
            ButtonManager.enableButton(ButtonManager.$.skipButton, event);
          }, this);

          ButtonManager.enableButton(ButtonManager.$.NoButton, BUTTON_STATE.DISABLED);

          deskNode.getComponent(PlayerDesk).playerStatsLayout.player = playerComp

          // attach money lable to player
          moneyLable.active = true
          hpLable.active = true
          break;
        case 1:
          id = meId + 1
          if (id > ServerClient.numOfPlayers) {
            id = id - ServerClient.numOfPlayers;
          }
          playerNode = PlayerManager.getPlayerById(id).node;
          playerComp = playerNode.getComponent(Player);


          deskNode.getComponent(PlayerDesk).playerStatsLayout.node.getComponent(PlayerStatsViewer).player = playerComp
          // attach money lable to player
          playerComp._reactionToggle = deskNode.getComponent(PlayerDesk).playerStatsLayout.reactionToggle.getComponent(cc.Toggle);


          moneyLable.active = true


          hpLable.active = true
          break;
        case 2:
          id = meId + 2
          if (id > ServerClient.numOfPlayers) {
            id = id - ServerClient.numOfPlayers;
          }
          playerNode = PlayerManager.getPlayerById(id).node;
          playerComp = playerNode.getComponent(Player);
          deskNode.getComponent(PlayerDesk).playerStatsLayout.node.getComponent(PlayerStatsViewer).player = playerComp
          playerComp._reactionToggle = deskNode.getComponent(PlayerDesk).playerStatsLayout.reactionToggle.getComponent(cc.Toggle);
          // attach money lable to player

          moneyLable.active = true

          hpLable.active = true
          break;
        case 3:
          id = meId + 3
          if (id > ServerClient.numOfPlayers) {
            id = id - ServerClient.numOfPlayers;
          }
          playerNode = PlayerManager.getPlayerById(id).node;
          playerComp = playerNode.getComponent(Player);
          playerComp._putCharLeft = true;
          deskNode.getComponent(PlayerDesk).playerStatsLayout.node.getComponent(PlayerStatsViewer).player = playerComp
          playerComp._reactionToggle = deskNode.getComponent(PlayerDesk).playerStatsLayout.reactionToggle.getComponent(cc.Toggle);
          // attach money lable to player
          moneyLable.active = true
          hpLable.active = true
          break;
        default:
          break;
      }

      // setting hand of player

      playerComp.setHand(handNode);

      // setting desk of player

      playerComp.setDesk(deskNode);
      deskWidget.updateAlignment();

      // setting dice of player
      playerComp.setDice(diceNode);
    }

    // const numToDelete = this.desks.length - this.players.length;

    // for (let i = 0; i < numToDelete; i++) {
    //   const desk = this.desks[this.desks.length - 1];
    //   desk.destroy();
    //   this.desks.splice(this.desks.indexOf(desk));
    //   const hand = this.hands[this.hands.length - 1];
    //   hand.destroy();
    //   this.hands.splice(this.hands.indexOf(hand));
    //   const dice = this.dice[this.dice.length - 1];
    //   dice.destroy();
    //   this.dice.splice(this.dice.indexOf(dice));
    // }
  }

  static getPlayerById(id: number): Player {
    // // if current player id is not 1 in server then place id in order for assinging hands
    // if (id > ServerClient.numOfPlayers) {
    //   id = id - ServerClient.numOfPlayers;
    // }
    for (let i = 0; i < PlayerManager.players.length; i++) {
      const player = PlayerManager.players[i];
      const playerComp: Player = player.getComponent(Player);
      if (playerComp.playerId == id) {
        return playerComp;
      }
      if (playerComp.character && playerComp.character.getComponent(Card)._cardId == id) { return playerComp; }
      if (playerComp.characterItem && playerComp.characterItem.getComponent(Card)._cardId == id) { return playerComp; }
    }
    const card = CardManager.getCardById(id)
    let endString = ``
    if (card) {
      endString = `it was ${card.name}`
    }
    // throw new Error(`No player found by id ${id} ` + endString);
  }

  static getPlayerByCard(card: cc.Node) {
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i].getComponent(Player);

      if (player.character == card) { return player; }
      if (player.characterItem == card) { return player; }

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
        if (card == lootCard) { return player; }
      }
      if (player.soulsLayout) {
        for (const soulCard of player.soulsLayout.children) {
          if (card == soulCard) { return player; }
        }
      }
      for (const itemLost of player.itemsLostThisTurn) {
        if (card == itemLost) { return player }
      }
    }

    return null;

  }

  static getPlayerByCardId(cardId: number) {
    const playerCard = CardManager.getCardById(cardId, true);
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

  }

  static getPriorityPlayer() {
    for (const player of this.players) {
      if (player.getComponent(Player)._hasPriority) {
        return player.getComponent(Player);
      }
    }
  }

  static getNextPlayer(player: Player) {
    let id = player.playerId;
    if (id == this.players.length) {
      id = 0;
    }
    for (let i = 0; i < this.players.length; i++) {
      const playerToTest = this.players[i].getComponent(Player);
      if (playerToTest.playerId == (id + 1)) { return playerToTest; }

    }
  }

  /// ADD a function to get all the other players given a player
  static getOtherPlayers(player: cc.Node) {
    const otherPlayerNodes: Player[] = [];
    for (let i = 0; i < PlayerManager.players.length; i++) {
      if (PlayerManager.players[i] != player) {
        otherPlayerNodes.push(PlayerManager.players[i].getComponent(Player));
      }
    }
    return otherPlayerNodes;
  }

  static isAOwnedSoul(card: cc.Node) {
    for (const player of this.players.map((player) => player.getComponent(Player))) {
      if (player.soulsLayout.children.includes(card)) { return true; }
    }
    return false;
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {

  }

  start() {
    PlayerManager.$ = this;
    whevent.emit(GAME_EVENTS.PLAYER_MAN_PREFAB_LOAD);
  }

  // update (dt) {}
}

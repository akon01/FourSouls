import { assetManager, Component, director, instantiate, log, Node, Prefab, resources, Toggle, UITransform, Widget, _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";
import { whevent } from "../../ServerClient/whevent";
import { CardLayout } from "../Entites/CardLayout";
import { Item } from "../Entites/CardTypes/Item";
import { Card } from "../Entites/GameEntities/Card";
import { Deck } from "../Entites/GameEntities/Deck";
import { Dice } from "../Entites/GameEntities/Dice";
import { Player } from "../Entites/GameEntities/Player";
import { PlayerDesk } from "../Entites/PlayerDesk";
import { PlayerStatsViewer } from "../Entites/PlayerStatsViewer";
import { ReactionToggle } from "../Entites/ReactionToggle";
import { BUTTON_STATE, CARD_HEIGHT, CARD_WIDTH, GAME_EVENTS, PASSIVE_EVENTS } from "./../Constants";
import { PassiveMeta } from "./PassiveMeta";
import { WrapperProvider } from './WrapperProvider';

const { ccclass, property } = _decorator;


@ccclass('PlayerManager')
export class PlayerManager extends Component {
  players: Node[] = [];

  hands: Node[] = [];

  @property([PlayerDesk])
  desks: PlayerDesk[] = [];

  dice: Node[] = [];

  @property(Prefab)
  playerPrefab: Prefab | null = null;

  @property(Prefab)
  handPrefab: Prefab | null = null;

  @property(Prefab)
  dicePrefab: Prefab | null = null;

  @property(Prefab)
  playerDeskPrefab: Prefab | null = null;

  @property(Toggle)
  reactionToggle: Toggle | null = null

  mePlayer: Node | null = null;

  edenChosen = false;

  edenChosenCard: Node | null = null;




  isLoaded: boolean = false;





  getPlayersSortedByTurnPlayer() {
    const players = [WrapperProvider.turnsManagerWrapper.out.getCurrentTurn()!.getTurnPlayer()] as Player[]
    const filteredPlayers = this.players.filter(p => p != players[0].node);
    for (let i = 0; i < filteredPlayers.length; i++) {
      const currentPlayer = players[players.length - 1]
      players.push(this.getNextPlayer(currentPlayer)!)
    }
    return players;
  }

  async init(serverId: number) {
    //  await this.preLoadPrefabs();
    if (this.isLoaded == false) {
      const loaded = await this.waitForPrefabLoad();
    }
    this.createPlayers(serverId);
    this.createPlayerDesks();
    this.createHands();
    this.createDice();
    this.assingHands();

    const prefabs = [WrapperProvider.playerManagerWrapper.out.handPrefab, WrapperProvider.playerManagerWrapper.out.playerPrefab, WrapperProvider.playerManagerWrapper.out.dicePrefab, WrapperProvider.playerManagerWrapper.out.playerDeskPrefab]
    prefabs.forEach(prefab => {
      if (prefab)
        assetManager.releaseAsset(prefab)
    })
    resources.release("Prefabs/Entities/", Prefab)
  }

  async preLoadPrefabs() {
    resources.loadDir<Prefab>("Prefabs/Entities/", (err, rsc) => {
      for (let i = 0; i < rsc.length; i++) {
        const prefab: Prefab = rsc[i];
        debugger
        switch (prefab.data.name) {
          case "Hand":
            WrapperProvider.playerManagerWrapper.out.handPrefab = prefab;
            break;
          case "Player":
            WrapperProvider.playerManagerWrapper.out.playerPrefab = prefab;
            break;
          case "Dice":
            WrapperProvider.playerManagerWrapper.out.dicePrefab = prefab;
          case "PlayerDesk":
            WrapperProvider.playerManagerWrapper.out.playerDeskPrefab = prefab;
            break;
          default:
            break;
        }
      }
      whevent.emit(GAME_EVENTS.PLAYER_MAN_PREFAB_LOAD);
      // WrapperProvider.playerManagerWrapper.out.prefabLoaded = true;
    });
    const loaded = await this.waitForPrefabLoad();
    return loaded;
  }

  async waitForPrefabLoad(): Promise<boolean> {
    return new Promise((resolve) => {
      whevent.onOnce(GAME_EVENTS.PLAYER_MAN_PREFAB_LOAD, () => {
        resolve(true);
      });

    });
  }

  createPlayers(serverId: number) {
    log(`create`)
    log(WrapperProvider.playerManagerWrapper.out)
    // create max amount of players and assing them to this property
    for (let i = 1; i <= WrapperProvider.serverClientWrapper.out.numOfPlayers; i++) {
      const newNode: Node = instantiate(WrapperProvider.playerManagerWrapper.out.playerPrefab) as unknown as Node;
      newNode.name = "player" + i;
      const playerComp: Player = newNode.getComponent(Player)!;
      playerComp.playerId = i;
      if (i == serverId) {
        playerComp.me = true;
        WrapperProvider.playerManagerWrapper.out.mePlayer = newNode;
      }

      WrapperProvider.CanvasNode!.addChild(newNode);

      WrapperProvider.playerManagerWrapper.out.players.push(newNode);
    }
    WrapperProvider.playerManagerWrapper.out.playerPrefab = null;
  }

  // create hands and place them on canvas
  createHands() {
    // for (let i = 0; i < WrapperProvider.playerManagerWrapper.out.players.length - WrapperProvider.playerManagerWrapper.out.hands.length; i++) {
    //   WrapperProvider.playerManagerWrapper.out.hands.pop().destroy()
    // }
    for (let i = 1; i <= WrapperProvider.playerManagerWrapper.out.players.length; i++) {
      log(WrapperProvider.playerManagerWrapper.out.desks)
      const hands = WrapperProvider.playerManagerWrapper.out.desks.map(desk => desk.hand!);
      // for (let i = 1; i <= 4; i++) {
      //  var newNode: Node = instantiate(WrapperProvider.playerManagerWrapper.out.handPrefab);
      log(hands)
      const newNode = hands[i - 1].node
      const handComp: CardLayout = newNode.getComponent(CardLayout)!;
      handComp.handId = i;
      const trans = newNode.getComponent(UITransform)!
      trans.height = CARD_HEIGHT;
      trans.width = CARD_WIDTH * 7;
      newNode.name = "Hand" + i;
      WrapperProvider.playerManagerWrapper.out.hands.push(newNode);
    }
  }

  createDice() {
    for (let i = 1; i <= WrapperProvider.playerManagerWrapper.out.players.length; i++) {
      // for (let i = 1; i <= 4; i++) {
      //   var newNode: Node = instantiate(WrapperProvider.playerManagerWrapper.out.dicePrefab);
      const newNode: Dice = WrapperProvider.playerManagerWrapper.out.desks.map(desk => desk.dice!)[i - 1];
      newNode.diceId = ++WrapperProvider.cardManagerWrapper.out.cardsId;
      newNode.node.name = "Dice" + i;
      WrapperProvider.playerManagerWrapper.out.dice.push(newNode.node);
    }
  }

  createPlayerDesks() {
    const numOfDesksToDestroy = WrapperProvider.playerManagerWrapper.out.desks.length - WrapperProvider.playerManagerWrapper.out.players.length;
    for (let i = 0; i < numOfDesksToDestroy; i++) {
      const deskToDestroy = WrapperProvider.playerManagerWrapper.out.desks.pop()!.node;
      log(`destroy ${deskToDestroy.name}`)
      deskToDestroy.destroyAllChildren()
      deskToDestroy.destroy()
      log(deskToDestroy)
    }
    for (let i = 1; i <= WrapperProvider.playerManagerWrapper.out.players.length; i++) {
      // for (let i = 1; i <= 4; i++) {
      //    var newNode: Node = instantiate(WrapperProvider.playerManagerWrapper.out.playerDeskPrefab);
      const deskName = "Desk" + i;

      const newNode = WrapperProvider.playerManagerWrapper.out.desks[i - 1].node
      const deskComp: PlayerDesk = newNode.getComponent(PlayerDesk)!;

      deskComp.deskId = i;
      newNode.name = deskName;
      //   WrapperProvider.playerManagerWrapper.out.desks.push(newNode);
    }
  }

  shuffle(array: any[]) {
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

  async waitForSetCharOver() {
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.END_SET_CHAR, () => {
        resolve(true)
      })
    })
  }

  async assignCharacterToPlayer(fullCharCard: { char: Node, item: Node }, player: Player, sendToServer: boolean) {
    const charCard = fullCharCard.char;
    let itemCard: Node;
    // Special Case : Eden
    if (charCard.getComponent(Card)!.cardName == "Eden") {
      WrapperProvider.serverClientWrapper.out.send(Signal.CHOOSE_FOR_EDEN, { playerId: player.playerId, originPlayerId: this.mePlayer!.getComponent(Player)!.playerId });
      itemCard = await this.waitForEdenChoose();
      //   itemCard = WrapperProvider.cardManagerWrapper.out.treasureDeck.getComponent(Deck)!._cards.getCards().find(card => card.name == `Smelter`)
      WrapperProvider.cardManagerWrapper.out.treasureDeck!.getComponent(Deck)!.drawSpecificCard(itemCard, true);
      if (itemCard.getComponent(Card)!._isFlipped) { itemCard.getComponent(Card)!.flipCard(true); }
      itemCard.getComponent(Item)!.eternal = true;
    } else {
      itemCard = fullCharCard.item;
    }
    WrapperProvider.cardManagerWrapper.out.addOnTableCards([charCard, itemCard]);
    if (player.node != this.mePlayer) {
      WrapperProvider.serverClientWrapper.out.send(Signal.SET_CHAR, { originPlayerId: this.mePlayer!.getComponent(Player)!.playerId, playerId: player.playerId, charCardId: charCard.getComponent(Card)!._cardId, itemCardId: itemCard.getComponent(Card)!._cardId })
      await this.waitForSetCharOver()
      log(`after set char end`)
    } else {
      await player.setCharacter(charCard, itemCard, true);
    }
  }

  async assingCharacters(sendToServer: boolean) {
    // Is Char Deck Shuffle

    const rand = new Date().getTime() % 10;
    for (let index = 0; index <= rand; index++) {
      WrapperProvider.cardManagerWrapper.out.characterDeck = this.shuffle(WrapperProvider.cardManagerWrapper.out.characterDeck);
    }
    //
    let isEden = false
    let edenPlayer: Player | null = null
    let edenItem: Node | null = null;
    for (let i = 0; i < WrapperProvider.playerManagerWrapper.out.players.length; i++) {
      const playerComp: Player = WrapperProvider.playerManagerWrapper.out.players[i].getComponent(Player)!;

      let fullCharCard
      ////only for test of characters:
      //  if (i == 0) {
      //   log(`i is zero`)
      //  fullCharCard = WrapperProvider.cardManagerWrapper.out.characterDeck.find(card => card.char.getComponent(Card)!.cardName == "Bumbo")
      // } else {
      fullCharCard = WrapperProvider.cardManagerWrapper.out.characterDeck.pop()!;
      //   log(fullCharCard)
      //  }
      // special case: Eden
      if (fullCharCard.char.getComponent(Card)!.cardName == "Eden") {
        isEden = true
        edenPlayer = playerComp
        //Item Shuld Be null here
        edenItem = fullCharCard.item
      }
      log(`assign ${fullCharCard.char.name} to player ${playerComp.playerId}`)
      await this.assignCharacterToPlayer(fullCharCard, playerComp, sendToServer);
    }
    // special case: Eden
    if (isEden) {
      WrapperProvider.cardManagerWrapper.out.addOnTableCards([edenItem!])
      const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_ADD_ITEM, [edenItem], null, edenPlayer!.node);
      const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta);
      if (!afterPassiveMeta.args) { debugger; throw new Error("No Args Found!!"); }

      edenItem = afterPassiveMeta.args[0];
      passiveMeta.result = await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta);
    }
  }

  async waitForEdenChoose(): Promise<Node> {
    return new Promise((resolve) => {
      whevent.onOnce(GAME_EVENTS.EDEN_WAS_CHOSEN, () => {
        resolve(WrapperProvider.playerManagerWrapper.out.edenChosenCard!);
      });
    });
  }



  assingHands() {
    const meId: number = WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.playerId;
    let playerNode: Node;
    let playerComp: Player = new Player;

    for (let i = 0; i < WrapperProvider.playerManagerWrapper.out.players.length; i++) {

      const handNode = WrapperProvider.playerManagerWrapper.out.hands[i];
      const deskNode = WrapperProvider.playerManagerWrapper.out.desks[i].node;
      const diceNode = WrapperProvider.playerManagerWrapper.out.dice[i];
      const playerStats = deskNode.getComponent(PlayerDesk)!.playerStatsLayout!

      const handWidget: Widget = handNode.getComponent(Widget)!;
      const deskWidget: Widget = deskNode.getComponent(Widget)!;
      handWidget.alignMode = Widget.AlignMode.ONCE;
      const moneyLable: Node = playerStats.coins!.node
      const hpLable: Node = playerStats.hp!.node
      let id: number
      switch (i) {
        case 0:
          playerNode = WrapperProvider.playerManagerWrapper.out.mePlayer!;
          playerComp = playerNode.getComponent(Player)!;
          playerComp._putCharLeft = true;
          // //position hand

          playerComp._reactionToggle = deskNode.getComponent(PlayerDesk)!.playerStatsLayout!.reactionToggle!.getComponent(ReactionToggle);

          playerComp._reactionToggle!.setSelfReactionEvent()
          // playerComp._reactionToggle.node.on(Node.EventType.TOUCH_END, async () => {
          //   let event;
          //   serverClientWrapper._sc.send(Signal.REACTION_TOGGLED, { playerId: WrapperProvider.playerManagerWrapper.out.mePlayer.getComponent(Player)!.playerId })
          //   log(`reaction btn touch end`)
          //   !WrapperProvider.playerManagerWrapper.out.mePlayer.getComponent(Player)!._reactionToggle.isChecked == true ? event = BUTTON_STATE.ENABLED : event = BUTTON_STATE.DISABLED;
          //   if (event == BUTTON_STATE.ENABLED) {
          //     if (!WrapperProvider.playerManagerWrapper.out.mePlayer.getComponent(Player)!._inGetResponse) {
          //       event = BUTTON_STATE.DISABLED
          //     }
          //   }
          //   WrapperProvider.buttonManagerWrapper.out.enableButton(buttonManagerWrapper._bm.skipButton, event);
          // }, this);

          WrapperProvider.buttonManagerWrapper.out.enableButton(WrapperProvider.buttonManagerWrapper.out.NoButton!, BUTTON_STATE.DISABLED);

          deskNode.getComponent(PlayerDesk)!.playerStatsLayout!.player = playerComp

          // attach money lable to player
          moneyLable.active = true
          hpLable.active = true
          break;
        case 1:
          id = meId + 1
          if (id > WrapperProvider.serverClientWrapper.out.numOfPlayers) {
            id = id - WrapperProvider.serverClientWrapper.out.numOfPlayers;
          }
          playerNode = WrapperProvider.playerManagerWrapper.out.getPlayerById(id)!.node;
          playerComp = playerNode.getComponent(Player)!;

          deskNode.getComponent(PlayerDesk)!.playerStatsLayout!.node.getComponent(PlayerStatsViewer)!.player = playerComp
          // attach money lable to player
          playerComp._reactionToggle = deskNode.getComponent(PlayerDesk)!.playerStatsLayout!.reactionToggle!.getComponent(ReactionToggle);

          moneyLable.active = true

          hpLable.active = true
          break;
        case 2:
          id = meId + 2
          if (id > WrapperProvider.serverClientWrapper.out.numOfPlayers) {
            id = id - WrapperProvider.serverClientWrapper.out.numOfPlayers;
          }
          playerNode = WrapperProvider.playerManagerWrapper.out.getPlayerById(id)!.node;
          playerComp = playerNode.getComponent(Player)!;
          deskNode.getComponent(PlayerDesk)!.playerStatsLayout!.node.getComponent(PlayerStatsViewer)!.player = playerComp
          playerComp._reactionToggle = deskNode.getComponent(PlayerDesk)!.playerStatsLayout!.reactionToggle!.getComponent(ReactionToggle);
          // attach money lable to player

          moneyLable.active = true

          hpLable.active = true
          break;
        case 3:
          id = meId + 3
          if (id > WrapperProvider.serverClientWrapper.out.numOfPlayers) {
            id = id - WrapperProvider.serverClientWrapper.out.numOfPlayers;
          }
          playerNode = WrapperProvider.playerManagerWrapper.out.getPlayerById(id)!.node;
          playerComp = playerNode.getComponent(Player)!;
          playerComp._putCharLeft = true;
          deskNode.getComponent(PlayerDesk)!.playerStatsLayout!.node.getComponent(PlayerStatsViewer)!.player = playerComp
          playerComp._reactionToggle = deskNode.getComponent(PlayerDesk)!.playerStatsLayout!.reactionToggle!.getComponent(ReactionToggle);
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

  getPlayerById(id: number): Player | null {
    // // if current player id is not 1 in server then place id in order for assinging hands
    // if (id > ServerClient.numOfPlayers) {
    //   id = id - ServerClient.numOfPlayers;
    // }
    for (let i = 0; i < WrapperProvider.playerManagerWrapper.out.players.length; i++) {
      const player = WrapperProvider.playerManagerWrapper.out.players[i];
      const playerComp: Player = player.getComponent(Player)!;
      if (playerComp.playerId == id) {
        return playerComp;
      }
      if (playerComp.character && playerComp.character.getComponent(Card)!._cardId == id) { return playerComp; }
      if (playerComp.characterItem && playerComp.characterItem.getComponent(Card)!._cardId == id) { return playerComp; }
    }
    const card = WrapperProvider.cardManagerWrapper.out.getCardById(id)
    let endString = ``
    if (card) {
      endString = `it was ${card.name}`
    }
    return null
    //throw new Error(`No player found by id ${id} ` + endString);
  }

  getPlayerByCard(card: Node) {
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i].getComponent(Player)!;

      if (player.character == card) { return player; }
      if (player.characterItem == card) { return player; }

      const handCards = player.getHandCards();
      for (let j = 0; j < handCards.length; j++) {
        const testedCard = handCards[j];

        if (card == testedCard) {
          return player;
        }
      }

      const deskCards = player.getDeskCards()
      for (let j = 0; j < deskCards.length; j++) {
        const testedCard = deskCards[j];

        if (card == testedCard) {
          return player;
        }
      }
      for (let j = 0; j < player._lootCardsPlayedThisTurn.length; j++) {
        const lootCard = player._lootCardsPlayedThisTurn[j];
        if (card == lootCard) { return player; }
      }
      if (player.soulsLayout) {
        const soulCards = player.getSoulCards();
        for (const soulCard of soulCards) {
          if (card == soulCard) { return player; }
        }
      }
      for (const itemLost of player.itemsLostThisTurn) {
        if (card == itemLost) { return player }
      }
    }

    return null;

  }

  getPlayerByCardId(cardId: number) {
    const playerCard = WrapperProvider.cardManagerWrapper.out.getCardById(cardId, true);
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i].getComponent(Player)!;
      if (player.character == playerCard) {
        return player;
      }
    }
  }

  getPlayerByDice(diceId: number) {
    for (const player of this.players) {
      if (player.getComponent(Player)!.dice!.diceId == diceId) {
        return player.getComponent(Player);
      }
    }

  }

  getPriorityPlayer() {
    for (const player of this.players) {
      if (player.getComponent(Player)!._hasPriority) {
        return player.getComponent(Player);
      }
    }
    return WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()
  }

  getNextPlayer(player: Player) {
    let id = player.playerId;
    if (id == this.players.length) {
      id = 0;
    }
    for (let i = 0; i < this.players.length; i++) {
      const playerToTest = this.players[i].getComponent(Player)!;
      if (playerToTest.playerId == (id + 1)) { return playerToTest; }
    }
    return null
  }

  /// ADD a function to get all the other players given a player
  getOtherPlayers(player: Node) {
    const otherPlayerNodes: Player[] = [];
    for (let i = 0; i < WrapperProvider.playerManagerWrapper.out.players.length; i++) {
      if (WrapperProvider.playerManagerWrapper.out.players[i] != player) {
        otherPlayerNodes.push(WrapperProvider.playerManagerWrapper.out.players[i].getComponent(Player)!);
      }
    }
    return otherPlayerNodes;
  }

  isAOwnedSoul(card: Node) {
    for (const player of this.players.map((player) => player.getComponent(Player))) {
      if (!player) continue
      if (player.soulsLayout!.children.indexOf(card) >= 0) { return true; }
    }
    return false;
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {

  }

  start() {
    WrapperProvider.playerManagerWrapper.out = this;
    whevent.emit(GAME_EVENTS.PLAYER_MAN_PREFAB_LOAD);
  }

  // update (dt) {}
}

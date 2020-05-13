const { ccclass, property } = cc._decorator;

import TurnsManager from "./Managers/TurnsManager";
import { getCurrentPlayer, Turn } from "./Modules/TurnsModule";

import ActionManager from "./Managers/ActionManager";
import ButtonManager from "./Managers/ButtonManager";
import CardManager from "./Managers/CardManager";
import PlayerManager from "./Managers/PlayerManager";

import ServerClient from "../ServerClient/ServerClient";

import MonsterField from "./Entites/MonsterField";
import PileManager from "./Managers/PileManager";

import Signal from "../Misc/Signal";
import { GAME_EVENTS, STACK_EFFECT_TYPE } from "./Constants";
import Monster from "./Entites/CardTypes/Monster";
import Card from "./Entites/GameEntities/Card";
import Deck from "./Entites/GameEntities/Deck";
import Player from "./Entites/GameEntities/Player";
import Store from "./Entites/GameEntities/Store";
import Stack from "./Entites/Stack";
import SoundManager from "./Managers/SoundManager";
import { whevent } from "../ServerClient/whevent";

//( id represents a human player and it coresponds with playerID)
// tslint:disable-next-line: prefer-const
let id = 1;

@ccclass
export default class MainScript extends cc.Component {
  static currentPlayerNode: cc.Node = null;

  static currentPlayerComp: Player = null;

  @property([Player])
  otherPlayersComps: Player[] = [];

  @property(cc.Node)
  selectedCard: cc.Node = null;

  @property(cc.Node)
  turnsManager: cc.Node = null;

  @property(cc.Node)
  pilesManager: cc.Node = null;

  @property(cc.Node)
  playersManager: cc.Node = null;

  @property(cc.Node)
  actionsManager: cc.Node = null;

  @property(cc.Node)
  buttonsManager: cc.Node = null;

  @property(cc.Node)
  cardManager: cc.Node = null;

  @property(cc.Node)
  battleManager: cc.Node = null;

  @property(cc.Node)
  canvasNode: cc.Node = null;

  @property(cc.Node)
  cardPreview: cc.Node = null;

  static serverId: number = null;

  @property(cc.Node)
  store: cc.Node = null;

  @property(cc.Node)
  monsterField: cc.Node = null;

  @property
  _stackShow: cc.Label = null;

  static gameHasStarted: boolean = false;

  // LIFE-CYCLE CALLBACKS:

  async onLoad() {
    if (cc.find("ServerClient") != null) {
      const serverClient: ServerClient = cc
        .find("ServerClient")
        .getComponent(ServerClient);
      MainScript.serverId = serverClient.pid;
    } else {
      MainScript.serverId = 1;
    }
    cc.log(`server id is ${MainScript.serverId}`)

    this._stackShow = cc.find("Canvas/StackShow").getComponent(cc.Label)

    //set up store and monster components
    const storeComp: Store = this.store.getComponent(Store);
    storeComp.onLoad();

    //set up Players
    cc.log(`init player manager with ${MainScript.serverId}`)
    await PlayerManager.init(MainScript.serverId);

    //Set up Turns
    cc.log(`turns manager init`)
    TurnsManager.init();
    //set up button pool
    cc.log(`buttn init`)
    ButtonManager.init();
    cc.log(`card init`)
    //set up card manager
    await CardManager.init();

    //set up pile manager
    await PileManager.init();



    //Set up turn lable
    const currentTurnLableComp = cc
      .find("Canvas")
      .getChildByName("current Turn")
      .getComponent(cc.Label);

    currentTurnLableComp.string =
      "Turn " + TurnsManager.getCurrentTurn().PlayerId;

    //set up player lable
    const currentPlayerLableComp = cc
      .find("Canvas")
      .getChildByName("current Player")
      .getComponent(cc.Label);

    currentPlayerLableComp.string = "Player " + MainScript.serverId;

    // cc.director.getScene().on("monsterAttacked", () => {

    //   PlayerManager.mePlayer.getComponent(Player).showAvailableReactions();
    // });

    MainScript.currentPlayerNode = getCurrentPlayer(
      PlayerManager.players,
      TurnsManager.currentTurn,
    );
    MainScript.currentPlayerComp = MainScript.currentPlayerNode.getComponent(
      Player,
    );
    //ActionManager.updateActions();
    const playerId = PlayerManager.mePlayer.getComponent(Player).playerId
    const turnPlayerId = TurnsManager.currentTurn.PlayerId
    ServerClient.$.send(Signal.FINISH_LOAD, { id: playerId, turnPlayerId: turnPlayerId })

    whevent.on(GAME_EVENTS.GAME_OVER, (async playerWhoWonId => {
      for (let i = 0; i < Stack._currentStack.length; i++) {
        const se = Stack._currentStack[i];
        await Stack.fizzleStackEffect(se, true)
      }
      MainScript.endGame(playerWhoWonId, true)
    }))

    // this.node.on(`gameOver`, (playerWhoWonId => {
    //   cc.director.loadScene("Game Over", () => {
    //     let wonString = cc.find('Canvas/playerWon').getComponent(cc.RichText)
    //     wonString.string = ' <color=#0fffff > player ' + playerWhoWonId + ' won < /color>'
    //   });
    // }))

    //await
    // ActionManager.updateActions()
  }

  static endGame(playerWhoWonId: number, sendToServer: boolean) {

    cc.error(`end game`)
    if (sendToServer) {
      ServerClient.$.send(Signal.END_GAME, { playerId: playerWhoWonId })
    }
    cc.director.loadScene("Game Over", () => {
      const wonString = cc.find("Canvas/playerWon").getComponent(cc.RichText)
      wonString.string = " <color=#0fffff > player " + playerWhoWonId + " won < /color>"
    });
  }

  static async startGame() {
    cc.error(`start game`)
    await PlayerManager.assingCharacters(true);
    let startingPlayer: Player;
    let firstTurn: Turn
    for (const player of PlayerManager.players) {
      if (player.getComponent(Player).character.name == "Cain") {
        startingPlayer = player.getComponent(Player)
        break;
      }
    }
    if (startingPlayer != null) {

      firstTurn = TurnsManager.getTurnByPlayerId(startingPlayer.playerId)
    } else {
      const randPlayerNumber = Math.floor(Math.random() * PlayerManager.players.length)
      for (const player of PlayerManager.players) {
        if (player.getComponent(Player).playerId == randPlayerNumber + 1) {
          startingPlayer = player.getComponent(Player)
          break;
        }
      }

      firstTurn = TurnsManager.getTurnByPlayerId(startingPlayer.playerId)
    }
    const decks = CardManager.getAllDecks()
    for (let i = 0; i < decks.length; i++) {
      const deck = decks[i].getComponent(Deck);

      if (deck.suffleInTheStart) {
        deck.shuffleDeck()
      } else {
        ServerClient.$.send(Signal.DECK_ARRAGMENT, { deckType: deck.deckType, arrangement: deck._cards.map(card => card.getComponent(Card)._cardId) })
      }

    }
    await Store.$.addStoreCard(true)
    await Store.$.addStoreCard(true)
    // cc.error(`after add store card`)
    const ids = MonsterField.getMonsterCardHoldersIds()
    for (let i = 0; i < ids.length; i++) {
      const mosnterHolderId = ids[i];
      let newMonster = CardManager.monsterDeck.getComponent(Deck).drawCard(true)
      while (newMonster.getComponent(Monster).isNonMonster) {
        CardManager.monsterDeck.getComponent(Deck).addToDeckOnBottom(newMonster, true)
        newMonster = CardManager.monsterDeck.getComponent(Deck).drawCard(true)
      }
      await MonsterField.addMonsterToExsistingPlace(mosnterHolderId, newMonster, true)
    }
    // await CardManager.checkForEmptyFields();
    // await CardManager.updateOnTableCards();
    // await CardManager.updatePlayerCards();

    await CardManager.registerBonusSouls()

    SoundManager.$.setBGVolume(0.5)
    SoundManager.$.playBGMusic(SoundManager.$.BasicBGMusic)

    //  await ActionManager.updateActions()
    for (const player of PlayerManager.players) {
      const comp = player.getComponent(Player)
      await comp.changeMoney(3, true, true)
      for (let o = 0; o < 3; o++) {
        await comp.drawCard(CardManager.lootDeck, true)

      }
    }
    MainScript.gameHasStarted = true
    ServerClient.$.send(Signal.GAME_HAS_STARTED)
    await TurnsManager.setCurrentTurn(firstTurn, true)

  }

  static async makeFirstUpdateActions(playerId) {
    //TurnsManager.endTurn()
    //  await TurnsManager.currentTurn.getTurnPlayer().endTurn(true)
    cc.log(`make first update`)
    if (PlayerManager.mePlayer.getComponent(Player).playerId == playerId) {
      await MainScript.startGame()
      await ActionManager.updateActions()

      // let over = await ActionManager.updateActions();

      ServerClient.$.send(Signal.UPDATE_ACTIONS)

    }
  }

  updateActions() {
    if (MainScript.currentPlayerNode == PlayerManager.mePlayer) {
      ActionManager.updateActionsForTurnPlayer(MainScript.currentPlayerNode);
    } else {
      ActionManager.updateActionsForNotTurnPlayer(PlayerManager.mePlayer);
    }
  }

  start() { }

  update(dt) {
  }
}

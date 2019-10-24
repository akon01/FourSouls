const { ccclass, property } = cc._decorator;

import { Turn, getCurrentPlayer } from "./Modules/TurnsModule";
import TurnsManager from "./Managers/TurnsManager";

import PlayerManager from "./Managers/PlayerManager";
import ActionManager from "./Managers/ActionManager";
import ButtonManager from "./Managers/ButtonManager";
import CardManager from "./Managers/CardManager";

import ServerClient from "../ServerClient/ServerClient";

import PileManager from "./Managers/PileManager";
import MonsterField from "./Entites/MonsterField";

import Store from "./Entites/GameEntities/Store";
import Player from "./Entites/GameEntities/Player";
import Monster from "./Entites/CardTypes/Monster";
import Deck from "./Entites/GameEntities/Deck";
import CardPreview from "./Entites/CardPreview";
import Signal from "../Misc/Signal";
import { ContainerBuilder } from "@ts-ioc/core";
import { AopModule } from "@ts-ioc/aop";
import Stack from "./Entites/Stack";
import { STACK_EFFECT_TYPE } from "./Constants";
import Card from "./Entites/GameEntities/Card";

//( id represents a human player and it coresponds with playerID)
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

  // LIFE-CYCLE CALLBACKS:

  async onLoad() {
    if (cc.find("ServerClient") != null) {
      let serverClient: ServerClient = cc
        .find("ServerClient")
        .getComponent(ServerClient);
      MainScript.serverId = serverClient.pid;
    } else {
      MainScript.serverId = 1;
    }
    cc.log(`server id is ${MainScript.serverId}`)

    this._stackShow = cc.find('Canvas/StackShow').getComponent(cc.Label)

    //set up screen size
    var canvas = this.canvasNode.getComponent(cc.Canvas);

    //  canvas.designResolution = new cc.Size(SCREEN_WIDTH, SCREEN_HEIGHT)

    //set up manager components
    var playerManagerComp: PlayerManager = this.playersManager.getComponent(
      "PlayerManager"
    );
    var turnsManagerComp: TurnsManager = this.turnsManager.getComponent(
      "TurnsManager"
    );
    var actionsManagerComp: ActionManager = this.actionsManager.getComponent(
      "ActionManager"
    );
    var buttonsManagerComp: ButtonManager = this.buttonsManager.getComponent(
      "ButtonManager"
    );
    var CardManagerComp: CardManager = this.cardManager.getComponent(
      "CardManager"
    );
    var PilesManagerComp: PileManager = this.pilesManager.getComponent(
      PileManager
    );

    //set up store and monster components
    var storeComp: Store = this.store.getComponent(Store);
    storeComp.onLoad();

    var monsterComp: MonsterField = this.monsterField.getComponent(
      MonsterField
    );

    //set up Players
    cc.log(`init player manager with ${MainScript.serverId}`)
    await PlayerManager.init(MainScript.serverId);


    //Set up Turns

    TurnsManager.init();
    //set up button pool
    ButtonManager.init();

    //set up card manager

    let cardManagerFinished = await CardManager.init();

    let charDeckComplete = false;

    //set up pile manager
    PileManager.init();

    //deal player cards



    //deal two treasures and  two monsters
    //this.node.on("decksDone", () => {
    //   
    //storeComp.addStoreCard(false);
    //storeComp.addStoreCard(false);

    // monsterComp.addMonsterToExsistingPlace(
    //   1,
    //   CardManager.monsterDeck.getComponent(Deck).drawCard(false),
    //   false
    // );
    // monsterComp.addMonsterToExsistingPlace(
    //   2,
    //   CardManager.monsterDeck.getComponent(Deck).drawCard(false),
    //   false
    // );


    // });

    //Set up turn lable
    var currentTurnLableComp = cc
      .find("Canvas")
      .getChildByName("current Turn")
      .getComponent(cc.Label);

    currentTurnLableComp.string =
      "Turn " + TurnsManager.getCurrentTurn().PlayerId;

    //set up player lable
    var currentPlayerLableComp = cc
      .find("Canvas")
      .getChildByName("current Player")
      .getComponent(cc.Label);

    currentPlayerLableComp.string = "Player " + MainScript.serverId;

    cc.director.getScene().on("monsterAttacked", () => {

      PlayerManager.mePlayer.getComponent(Player).showAvailableReactions();
    });

    MainScript.currentPlayerNode = getCurrentPlayer(
      PlayerManager.players,
      TurnsManager.currentTurn
    );
    MainScript.currentPlayerComp = MainScript.currentPlayerNode.getComponent(
      Player
    );
    //ActionManager.updateActions();
    let playerId = PlayerManager.mePlayer.getComponent(Player).playerId
    let turnPlayerId = TurnsManager.currentTurn.PlayerId
    ServerClient.$.send(Signal.FINISH_LOAD, { id: playerId, turnPlayerId: turnPlayerId })


    this.node.on(`gameOver`, (playerWhoWonId => {
      cc.director.loadScene("Game Over", () => {
        let wonString = cc.find('Canvas/playerWon').getComponent(cc.RichText)
        wonString.string = ' <color=#0fffff > player ' + playerWhoWonId + ' won < /color>'
      });
    }))

    //await
    // ActionManager.updateActions()
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
      let randPlayerNumber = Math.floor(Math.random() * PlayerManager.players.length)
      cc.log(randPlayerNumber
      )
      for (const player of PlayerManager.players) {
        if (player.getComponent(Player).playerId == randPlayerNumber + 1) {
          startingPlayer = player.getComponent(Player)
          break;
        }
      }

      firstTurn = TurnsManager.getTurnByPlayerId(startingPlayer.playerId)
    }
    let decks = CardManager.getAllDecks()
    for (let i = 0; i < decks.length; i++) {
      const deck = decks[i].getComponent(Deck);

      if (deck.suffleInTheStart) {
        deck.shuffleDeck()
      } else {
        ServerClient.$.send(Signal.DECK_ARRAGMENT, { deckType: deck.deckType, arrangement: deck._cards.map(card => card.getComponent(Card)._cardId) })
      }

    }
    // await Store.$.addStoreCard(true)
    // await Store.$.addStoreCard(true)
    // cc.error(`after add store card`)
    let ids = MonsterField.getMonsterCardHoldersIds()
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

    await ActionManager.updateActions()
    for (const player of PlayerManager.players) {
      let comp = player.getComponent(Player)
      await comp.changeMoney(3, true)
      for (let o = 0; o < 3; o++) {
        await comp.drawCard(CardManager.lootDeck, true)

      }
    }
    TurnsManager.setCurrentTurn(firstTurn, true)

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
    var playerManagerComp: PlayerManager = this.playersManager.getComponent(
      "PlayerManager"
    );
    var actionsManagerComp: ActionManager = this.actionsManager.getComponent(
      "ActionManager"
    );
    if (MainScript.currentPlayerNode == PlayerManager.mePlayer) {
      ActionManager.updateActionsForTurnPlayer(MainScript.currentPlayerNode);
    } else {
      ActionManager.updateActionsForNotTurnPlayer(PlayerManager.mePlayer);
    }
  }

  start() { }

  update(dt) {
    if (Stack._currentStack.length == 0) {
      this._stackShow.string = "Empty Stack"
    } else {
      let stackText: string = '';
      for (const stackEffect of Stack._currentStack) {
        let type;
        switch (stackEffect.stackEffectType) {
          case 1:
            type = "ACTIVATE ITEM"
            break;
          case 2:
            type = "ATTACK_ROLL"
            break;
          case 3:
            type = "COMBAT_DAMAGE"
            break;
          case 4:
            type = "DECLARE_ATTACK"
            break;
          case 5:
            type = "MONSTER_DEATH"
            break;
          case 6:
            type = "MONSTER_END_DEATH"
            break;
          case 7:
            type = "MONSTER_REWARD"
            break;
          case 8:
            type = "PLAY_LOOT_CARD"
            break;
          case 9:
            type = "  PURCHASE_ITEM"
            break;
          case 10:
            type = "REFILL_EMPTY_SLOT"
            break;
          case 11:
            type = "ROLL_DICE"
            break;
          case 12:

            type = "TAKE_DAMAGE"
            break;
          case 13:
            type = "START_TURN_LOOT"
            break
          case 14:
            type = "ACTIVATE_PASSIVE_EFFECT"
            break
          case 15:
            type = "PLAYER_DEATH"
            break;
          case 16:
            type = "PLAYER_DEATH_PENALTY"
            break
          default:
            break;
        }

        stackText = stackText.concat(' \n' + type + ' by ' + CardManager.getCardById(stackEffect.creatorCardId).name)
      }
      this._stackShow.string = stackText
    }
  }
}

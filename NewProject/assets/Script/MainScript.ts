const { ccclass, property } = cc._decorator;

import { Turn, getCurrentPlayer } from "./Modules/TurnsModule";
import TurnsManager from "./Managers/TurnsManager";

import PlayerManager from "./Managers/PlayerManager";
import ActionManager from "./Managers/ActionManager";
import ButtonManager from "./Managers/ButtonManager";
import CardManager from "./Managers/CardManager";

import Server from "../ServerClient/ServerClient";

import PileManager from "./Managers/PileManager";
import MonsterField from "./Entites/MonsterField";

import Store from "./Entites/GameEntities/Store";
import Player from "./Entites/GameEntities/Player";
import Monster from "./Entites/CardTypes/Monster";
import Deck from "./Entites/GameEntities/Deck";
import CardPreview from "./Entites/CardPreview";
import Signal from "../Misc/Signal";

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

  // LIFE-CYCLE CALLBACKS:

  async onLoad() {
    if (cc.find("ServerClient") != null) {
      let ServerClient: Server = cc
        .find("ServerClient")
        .getComponent(Server);
      MainScript.serverId = ServerClient.pid;
    } else {
      MainScript.serverId = 1;
    }

    //make cardPreview not active at the start
    // let cardPreview = cc.find("Canvas/CardPreview").getComponent(CardPreview);
    // cardPreview.onLoad();
    // cardPreview.node.active = false;

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

    PlayerManager.assingCharacters();

    //deal two treasures and  two monsters
    //this.node.on("decksDone", () => {
    //   
    storeComp.addStoreCard(false);
    storeComp.addStoreCard(false);

    // monsterComp.addMonsterToExsistingPlace(
    //   1,
    //   CardManager.monsterDeck.getComponent(Deck).drawCard(),
    //   false
    // );
    // monsterComp.addMonsterToExsistingPlace(
    //   2,
    //   CardManager.monsterDeck.getComponent(Deck).drawCard(),
    //   false
    // );


    // });

    //Set up turn lable
    var currentTurnLableComp = cc
      .find("Canvas")
      .getChildByName("current Turn")
      .getComponent(cc.Label);

    currentTurnLableComp.string =
      "current turn is:" + TurnsManager.getCurrentTurn().PlayerId;

    //set up player lable
    var currentPlayerLableComp = cc
      .find("Canvas")
      .getChildByName("current Player")
      .getComponent(cc.Label);

    currentPlayerLableComp.string = "current player is:" + MainScript.serverId;

    //     //set up card preview node.
    //    this.cardPreview.active = false;

    //set up server action listeners(another player did an action):

    // this.node.on('addItem', ({ playerId, cardId }) => {
    //     actionsManagerComp.otherPlayerGotItem(playerId, cardId)
    //     ActionManager.updateActions()
    //     PlayerManager.mePlayer.getComponent(Player).showAvailableReactions()
    // })

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
    Server.$.send(Signal.FINISHLOAD, { id: playerId, turnPlayerId: turnPlayerId })

    // ActionManager.updateActions()
  }

  static async makeFirstUpdateActions(playerId) {



    if (PlayerManager.mePlayer.getComponent(Player).playerId == playerId) {

      let over = await ActionManager.updateActions();

      Server.$.send(Signal.UPDATEACTIONS)
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

  // update (dt) {}
}

import { Component, director, error, find, Label, log, Node, RichText, _decorator } from 'cc';
import { Signal } from "../Misc/Signal";
import { ServerClient } from "../ServerClient/ServerClient";
import { whevent } from "../ServerClient/whevent";
import { GAME_EVENTS } from "./Constants";
import { Monster } from "./Entites/CardTypes/Monster";
import { Card } from "./Entites/GameEntities/Card";
import { Deck } from "./Entites/GameEntities/Deck";
import { Player } from "./Entites/GameEntities/Player";
import { Store } from "./Entites/GameEntities/Store";
import { WrapperProvider } from './Managers/WrapperProvider';
import { getCurrentPlayer, Turn } from "./Modules/TurnsModule";
const { ccclass, property } = _decorator;

//( id represents a human player and it coresponds with playerID)
// tslint:disable-next-line: prefer-const
let id = 1;


@ccclass('MainScript')
export class MainScript extends Component {
    currentPlayerNode: Node | null = null;
    currentPlayerComp: Player | null = null;

    otherPlayersComps: Player[] = [];
    @property(Node)
    selectedCard: Node | null = null;
    @property(Node)
    turnsManager: Node | null = null;
    @property(Node)
    pilesManager: Node | null = null;
    @property(Node)
    playersManager: Node | null = null;
    @property(Node)
    actionsManager: Node | null = null;
    @property(Node)
    buttonsManager: Node | null = null;
    @property(Node)
    cardManager: Node | null = null;
    @property(Node)
    battleManager: Node | null = null;
    @property(Node)
    canvasNode: Node | null = null;
    @property(Node)
    cardPreview: Node | null = null;
    serverId: number | null = null;
    @property(Node)
    store: Node | null = null;
    @property(Node)
    monsterField: Node | null = null;
    @property
    gameHasStarted = false;



    @property(Label)
    _stackShow: Label | null = null;













    // LIFE-CYCLE CALLBACKS:
    async onLoad() {
        if (find("ServerClient") != null) {
            const serverClient: ServerClient = find("ServerClient")!.getComponent(ServerClient)!;
            WrapperProvider.mainScriptWrapper.out.serverId = serverClient.pid;
        } else {
            debugger
            WrapperProvider.mainScriptWrapper.out.serverId = 1;
        }
        console.log(`server id is ${WrapperProvider.mainScriptWrapper.out.serverId}`)

        this._stackShow = find("RenderRoot2D/Canvas/StackShow")!.getComponent(Label)!

        //set up store and monster components
        const storeComp: Store = this.store!.getComponent(Store)!;
        storeComp.onLoad();

        //set up Players
        console.log(`init player manager with ${WrapperProvider.mainScriptWrapper.out.serverId}`)
        await WrapperProvider.playerManagerWrapper.out.init(WrapperProvider.mainScriptWrapper.out.serverId);

        //Set up Turns
        console.log(`turns manager init`)
        WrapperProvider.turnsManagerWrapper.out.init();
        //set up button pool
        console.log(`buttn init`)
        WrapperProvider.buttonManagerWrapper.out.init();
        console.log(`card init`)
        //set up card manager
        await WrapperProvider.cardManagerWrapper.out.init();

        //set up pile manager
        await WrapperProvider.pileManagerWrapper.out.init();



        //Set up turn lable
        const currentTurnLableComp = find("RenderRoot2D/Canvas")!
            .getChildByName("current Turn")!
            .getComponent(Label)!;

        currentTurnLableComp.string =
            "Turn " + WrapperProvider.turnsManagerWrapper.out.getCurrentTurn()!.PlayerId;

        //set up player lable
        const currentPlayerLableComp = find("RenderRoot2D/Canvas")!
            .getChildByName("current Player")!
            .getComponent(Label)!;

        currentPlayerLableComp.string = "Player " + WrapperProvider.mainScriptWrapper.out.serverId;

        // director.getScene().on("monsterAttacked", () => {

        //   WrapperProvider.playerManagerWrapper.out.mePlayer.getComponent(Player).showAvailableReactions();
        // });

        WrapperProvider.mainScriptWrapper.out.currentPlayerNode = getCurrentPlayer(WrapperProvider.playerManagerWrapper.out.players, WrapperProvider.turnsManagerWrapper.out.currentTurn!);
        WrapperProvider.mainScriptWrapper.out.currentPlayerComp = WrapperProvider.mainScriptWrapper.out.currentPlayerNode!.getComponent(Player)!;
        //WrapperProvider.actionManagerWrapper.out.updateActions();
        const playerId = WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.playerId
        const turnPlayerId = WrapperProvider.turnsManagerWrapper.out.currentTurn!.PlayerId
        WrapperProvider.serverClientWrapper.out.send(Signal.FINISH_LOAD, { id: playerId, turnPlayerId: turnPlayerId })

        whevent.on(GAME_EVENTS.GAME_OVER, (async (playerWhoWonId: number) => {
            for (let i = 0; i < WrapperProvider.stackWrapper.out._currentStack.length; i++) {
                const se = WrapperProvider.stackWrapper.out._currentStack[i];
                await WrapperProvider.stackWrapper.out.fizzleStackEffect(se, true, true)
            }
            WrapperProvider.mainScriptWrapper.out.endGame(playerWhoWonId, true)
        }))

        // this.node.on(`gameOver`, (playerWhoWonId => {
        //   director.loadScene("Game Over", () => {
        //     let wonString = find('Canvas/playerWon').getComponent(RichText)
        //     wonString.string = ' <color=#0fffff > player ' + playerWhoWonId + ' won < /color>'
        //   });
        // }))

        //await
        // WrapperProvider.actionManagerWrapper.out.updateActions()
    }



    endGame(playerWhoWonId: number, sendToServer: boolean) {

        console.error(`end game`)
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.END_GAME, { playerId: playerWhoWonId })
        }
        director.loadScene("Game Over", () => {
            const wonString = find("RenderRoot2D/Canvas/playerWon")!.getComponent(RichText)!
            wonString.string = " <color=#0fffff > player " + playerWhoWonId + " won < /color>"
        });
    }

    async startGame() {
        console.error(`start game`)
        await WrapperProvider.playerManagerWrapper.out.assingCharacters(true);
        let startingPlayer: Player | null = null;
        let firstTurn: Turn
        for (const player of WrapperProvider.playerManagerWrapper.out.players) {
            if (player.getComponent(Player)!.character!.name == "Cain") {
                startingPlayer = player.getComponent(Player)!
                break;
            }
        }
        if (startingPlayer != null) {

            firstTurn = WrapperProvider.turnsManagerWrapper.out.getTurnByPlayerId(startingPlayer.playerId)!
        } else {
            const randPlayerNumber = Math.floor(Math.random() * WrapperProvider.playerManagerWrapper.out.players.length)
            for (const player of WrapperProvider.playerManagerWrapper.out.players) {
                if (player.getComponent(Player)!.playerId == randPlayerNumber + 1) {
                    startingPlayer = player.getComponent(Player)
                    break;
                }
            }
            if (!startingPlayer) { debugger; throw new Error("No Starting Player Found!"); }

            firstTurn = WrapperProvider.turnsManagerWrapper.out.getTurnByPlayerId(startingPlayer.playerId)!
        }
        const decks = WrapperProvider.cardManagerWrapper.out.getAllDecks()
        for (let i = 0; i < decks.length; i++) {
            const deck = decks[i].getComponent(Deck)!;

            if (deck.suffleInTheStart) {
                deck.shuffleDeck()
            } else {
                WrapperProvider.serverClientWrapper.out.send(Signal.DECK_ARRAGMENT, { deckType: deck.deckType, arrangement: deck.getCards().map(card => card.getComponent(Card)!._cardId) })
            }

        }
        await WrapperProvider.storeWrapper.out.addStoreCard(true)
        await WrapperProvider.storeWrapper.out.addStoreCard(true)
        // console.error(`after add store card`)
        const ids = WrapperProvider.monsterFieldWrapper.out.getMonsterCardHoldersIds()
        for (let i = 0; i < ids.length; i++) {
            const mosnterHolderId = ids[i];
            let newMonster = WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!.drawCard(true)
            while (newMonster.getComponent(Monster)!.isNonMonster) {
                WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!.addToDeckOnBottom(newMonster, 0, true)
                newMonster = WrapperProvider.cardManagerWrapper.out.monsterDeck.getComponent(Deck)!.drawCard(true)
            }
            await WrapperProvider.monsterFieldWrapper.out.addMonsterToExsistingPlace(mosnterHolderId, newMonster, true)
        }
        // await WrapperProvider.cardManagerWrapper.out.checkForEmptyFields();
        // await WrapperProvider.cardManagerWrapper.out.updateOnTableCards();
        // await WrapperProvider.cardManagerWrapper.out.updatePlayerCards();

        await WrapperProvider.cardManagerWrapper.out.registerBonusSouls()

        WrapperProvider.soundManagerWrapper.out.setBGVolume(0.5)
        WrapperProvider.soundManagerWrapper.out.playBGMusic(WrapperProvider.soundManagerWrapper.out.BasicBGMusic!)

        //  await WrapperProvider.actionManagerWrapper.out.updateActions()
        for (const player of WrapperProvider.playerManagerWrapper.out.players) {
            const comp = player.getComponent(Player)!
            await comp.changeMoney(3, true, true)
            for (let o = 0; o < 3; o++) {
                await comp.drawCards(WrapperProvider.cardManagerWrapper.out.lootDeck, true)

            }
        }
        WrapperProvider.mainScriptWrapper.out.gameHasStarted = true
        WrapperProvider.serverClientWrapper.out.send(Signal.GAME_HAS_STARTED)
        await WrapperProvider.turnsManagerWrapper.out.setCurrentTurn(firstTurn, true)

    }

    async makeFirstUpdateActions(playerId: number) {
        //turnsManagerWrapper._tm.endTurn()
        //  await turnsManagerWrapper._tm.currentTurn.getTurnPlayer().endTurn(true)
        console.log(`make first update`)
        console.log(WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.playerId)
        console.log(playerId)
        if (WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.playerId == playerId) {
            await WrapperProvider.mainScriptWrapper.out.startGame()
            await WrapperProvider.actionManagerWrapper.out.updateActions()

            // let over = await WrapperProvider.actionManagerWrapper.out.updateActions();

            WrapperProvider.serverClientWrapper.out.send(Signal.UPDATE_ACTIONS)
            let number = WrapperProvider.mainScriptWrapper.out.countNodes(find("RenderRoot2D/Canvas")!, 0, new Set<Node>())
            const allCards = WrapperProvider.cardManagerWrapper.out.GetAllCards()
            allCards.forEach(card => {
                number = WrapperProvider.mainScriptWrapper.out.countNodes(card, number, new Set<Node>())
            });

            console.error(`the number of nodes is :${number}`)
        }
    }

    countNodes(node: Node, number: number, nodeSet: Set<Node>) {
        number += 1
        if (node.children.length == 0) {
            return number;
        }
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            //if (!nodeSet.has(child)) {
            // nodeSet.add(child)
            number = WrapperProvider.mainScriptWrapper.out.countNodes(child, number, nodeSet)
            // }
        }
        return number
    }

    async updateActions() {
        if (WrapperProvider.mainScriptWrapper.out.currentPlayerNode == WrapperProvider.playerManagerWrapper.out.mePlayer) {
            await WrapperProvider.actionManagerWrapper.out.updateActionsForTurnPlayer(WrapperProvider.mainScriptWrapper.out.currentPlayerNode!);
        } else {
            WrapperProvider.actionManagerWrapper.out.updateActionsForNotTurnPlayer(WrapperProvider.playerManagerWrapper.out.mePlayer!);
        }
    }

}

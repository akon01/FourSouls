import { Component, find, Label, log, Node, _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";
// import { HeadlessHorsemanCondition } from '../CardEffectComponents/CardConditions/CardSpecificConditions/HeadlessHorsemanCondition';
import { Character } from "../Entites/CardTypes/Character";
import { Monster } from "../Entites/CardTypes/Monster";
import { Card } from "../Entites/GameEntities/Card";
import { Player } from "../Entites/GameEntities/Player";
import { OneTimeTurn, Turn } from "../Modules/TurnsModule";
import { WrapperProvider } from './WrapperProvider';
const { ccclass } = _decorator;



@ccclass('TurnsManager')
export class TurnsManager extends Component {
      turns: Turn[] = [];

      turnId = 0;

      currentTurn: Turn | null = null;

      turnLable: Label | null = null







      init() {

            this.makeTurns();
            WrapperProvider.turnsManagerWrapper.out.currentTurn = WrapperProvider.turnsManagerWrapper.out.turns[1];

            //turnsManagerWrapper._tm.currentTurn = this.turns[Math.floor((Math.random() * Server.numOfPlayers))]
      }
      makeTurns() {
            for (let i = 1; i < WrapperProvider.serverClientWrapper.out.numOfPlayers! + 1; i++) {
                  this.turns.push(new Turn(i));
            }
      }

      addOneTimeTurn(playerId: number, sendToServer: boolean) {
            const currentTurn = this.getCurrentTurn()!
            const indexOfCurrent = this.turns.indexOf(currentTurn);
            this.turns.fill(new OneTimeTurn(playerId), indexOfCurrent)
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.ADD_TURN, { playerId })
            }
      }

      removeTurn(turn: Turn, sendToServer: boolean) {
            const turnIndex = this.turns.indexOf(turn);
            this.turns = this.turns.filter(t => t !== turn)
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.REMOVE_TURN, { turnIndex })
            }
      }

      getCurrentTurn() {
            return WrapperProvider.turnsManagerWrapper.out.currentTurn;
      }

      getTurns() {
            return WrapperProvider.turnsManagerWrapper.out.turns;
      }

      getTurnByPlayerId(playerId: number) {
            console.log(`searching for turn ${playerId}`)
            for (const turn of this.turns) {
                  console.log(turn)
                  if (turn.PlayerId == playerId) { return turn; }
            }
      }

      /**
       *
       * @param sendToServer false if should not send an event.
       */
      async nextTurn() {

            if (WrapperProvider.stackWrapper.out._currentStack.length > 0) {
                  console.log(`wait for stack to be emptied`)
                  console.log(WrapperProvider.stackWrapper.out._currentStack)
                  await WrapperProvider.stackWrapper.out.waitForStackEmptied()
            }
            WrapperProvider.stackWrapper.out.replaceStack([], true)

            await this.endTurn(true);

            const nextTurn = this.getNextTurn(WrapperProvider.turnsManagerWrapper.out.currentTurn!, this.turns)!;
            await this.setCurrentTurn(nextTurn, true);


      }

      async setCurrentTurn(turn: Turn, sendToServer: boolean) {

            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.SET_TURN, { playerId: turn.PlayerId })
            }
            if (turn.PlayerId != 0) {
                  turn.refreshTurn();
                  this.turnLable!.string = `Turn ` + turn.PlayerId
                  WrapperProvider.turnsManagerWrapper.out.currentTurn = turn;
                  if (sendToServer) { await turn.startTurn(); }
            }
      }

      async endTurn(sendToServer: boolean) {
            WrapperProvider.turnsManagerWrapper.out.currentTurn!.endTurn(sendToServer)
            if (
                  this.getNextTurn(WrapperProvider.turnsManagerWrapper.out.currentTurn!, WrapperProvider.turnsManagerWrapper.out.turns)!.PlayerId != 0
            ) {
                  WrapperProvider.storeWrapper.out.thisTurnStoreCards = []
                  for (const player of WrapperProvider.playerManagerWrapper.out.players.map(player => player.getComponent(Player))) {
                        if (!player) continue
                        await player.handleResetOneTurnProperties()

                  }
                  const activeMonsters = WrapperProvider.monsterFieldWrapper.out.getActiveMonsters();
                  const activeMonstersComps = activeMonsters.map(monster => monster.getComponent(Monster));
                  for (const monster of activeMonstersComps) {
                        if (!monster) continue
                        monster._rollBonus = 0;
                        monster._bonusDamage = 0;
                        monster._thisTurnKiller = null;
                        monster._lastHitRoll = 0
                        await monster.heal(monster.HP, false, true)
                  }
                  ////Special Conditions To Do: TODO: Should not be here at all.
                  const headlessHorsmanCard = activeMonstersComps.find(c => c!.node.getComponent(Card)!.cardName == "Headless Horseman")
                  if (headlessHorsmanCard) {
                        //If  Useing  Refrence  cause  Circular Refrence Error!!
                        const condition = headlessHorsmanCard.node.getComponent("HeadlessHorsemanCondition")! as any
                        condition._isFirstTime = true
                  }
                  if (sendToServer) {
                        WrapperProvider.serverClientWrapper.out.send(Signal.END_TURN)
                  }
            }

      }

      getNextTurn(currentTurn: Turn, turns: Turn[]): Turn | null {
            for (let i = 0; i < turns.length; i++) {
                  const nextTurn = turns[i];
                  if (currentTurn.PlayerId == WrapperProvider.playerManagerWrapper.out.players.length) {
                        if (nextTurn.PlayerId == 1) {
                              return nextTurn;
                        }
                  }
                  if (nextTurn.PlayerId == currentTurn.PlayerId + 1) {
                        return nextTurn;
                  }
            }
            return null;
      }

      setTurns(turns2: Turn[]) {
            WrapperProvider.turnsManagerWrapper.out.turns = turns2;
      }

      isCurrentPlayer(player: Node): boolean {
            const playerId = player.getComponent(Player)!.playerId
            if (WrapperProvider.turnsManagerWrapper.out.currentTurn!.PlayerId == playerId) {
                  return true;
            }
            return false;
      }

      // LIFE-CYCLE CALLBACKS:

      onLoad() {
            const canvas = WrapperProvider.CanvasNode
            this.turnLable = find(`current Turn`, canvas)!.getComponent(Label)
      }

      start() { }

      // update (dt) {}
}

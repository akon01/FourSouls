import { Component, director, instantiate, Prefab, _decorator } from 'cc';
import { Player } from "./Entites/GameEntities/Player";
import { WrapperProvider } from './Managers/WrapperProvider';
const { ccclass, property } = _decorator;

let id = 1;
let cardId = 1;

@ccclass('ButtonScript')
export class ButtonScript extends Component {
      @property(Prefab)
      cardPrefab: Prefab | null = null;



      // addToHand(){

      //     let turns:Turns = find('MainScript/Turns').getComponent('Turns')
      //     let card = find('Canvas/blue baby');
      //     let hand = find('player'+turns.currentTurn.turnId+'/Hand')

      //     card.parent = hand;
      //     let handComp:Hand = hand.getComponent(Hand);
      //     handComp.addToHandCards(card)
      // }

      changePlayers() {
            id = (id + 1) % WrapperProvider.serverClientWrapper.out.numOfPlayers;
            if (id == 0) {
                  id = 2;
            }
            return id;
      }

      async nextTurnClick() {
            const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!
            //turnPlayer.getComponent(Player)._endTurnFlag = true
            await turnPlayer.getComponent(Player)!.endTurn(true);
      }

      addNewCard() {
            const newCard = instantiate(this.cardPrefab!);
            newCard.name = "card" + cardId;
            cardId++;
            WrapperProvider.CanvasNode!.addChild(newCard);
      }

      // LIFE-CYCLE CALLBACKS:

      onLoad() { }

      start() {


      }

      // update (dt) {}
}

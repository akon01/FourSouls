import TurnsManager from "./Managers/TurnsManager";
import { MAX_PLAYERS } from "./Constants";
import ServerClient from "../ServerClient/ServerClient";
import PlayLootCard from "./CardEffectComponents/CardEffects/PlayLootCard";
import PlayerManager from "./Managers/PlayerManager";
import Player from "./Entites/GameEntities/Player";



const { ccclass, property } = cc._decorator;

var id = 1;

var cardId = 1;

@ccclass
export default class buttonScript extends cc.Component {
  @property(cc.Prefab)
  cardPrefab: cc.Prefab = null;

  // addToHand(){

  //     let turns:Turns = cc.find('MainScript/Turns').getComponent('Turns')
  //     let card = cc.find('Canvas/blue baby');
  //     let hand = cc.find('player'+turns.currentTurn.turnId+'/Hand')

  //     card.parent = hand;
  //     let handComp:Hand = hand.getComponent(Hand);
  //     handComp.addToHandCards(card)
  // }

  changePlayers() {
    id = (id + 1) % ServerClient.numOfPlayers;
    if (id == 0) {
      id = 2;
    }
    return id;
  }

  async nextTurnClick() {
    let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()

    await turnPlayer.getComponent(Player).endTurn(true);
  }

  addNewCard() {
    let newCard = cc.instantiate(this.cardPrefab);
    newCard.name = "card" + cardId;
    cardId++;
    cc.director
      .getScene()
      .getChildByName("Canvas")
      .addChild(newCard);
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() { }

  start() { }

  // update (dt) {}
}

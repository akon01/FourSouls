import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import ChooseCardTypeAndFilter from "../CardEffectComponents/ChooseCardTypeAndFilter";
import ChooseCard from "../CardEffectComponents/DataCollector/ChooseCard";
import CardManager from "../Managers/CardManager";
import CardPreviewManager from "../Managers/CardPreviewManager";
import PassiveManager from "../Managers/PassiveManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import { CARD_HEIGHT, CARD_WIDTH, CHOOSE_CARD_TYPE, COLORS } from "./../Constants";
import CardEffect from "./CardEffect";
import { CardLayout } from "./CardLayout";
import Monster from "./CardTypes/Monster";
import Card from "./GameEntities/Card";
import Player from "./GameEntities/Player";
import MonsterCardHolder from "./MonsterCardHolder";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterField extends cc.Component {
  @property(cc.Integer)
  maxNumOfMonsters: number = 2;

  @property(cc.Prefab)
  MonsterCardHolderPrefab: cc.Prefab = null;

  static monsterCardHolders: MonsterCardHolder[] = [];

  static activeMonsters: cc.Node[] = [];

  static holderIds = 0;

  static $: MonsterField = null

  @property
  layout: cc.Layout = null;

  @property
  widgetPadding: number = 0;

  /**
   *
   * @param monsterPlaceId id of the place to put the monster
   * @param monsterCard a monster card to put, if none is set, one from the deck will go
   */
  static async addMonsterToExsistingPlace(
    monsterPlaceId: number,
    monsterCard: cc.Node,
    sendToServer: boolean
  ) {
    const monsterCardComp = monsterCard.getComponent(Card);
    if (monsterCardComp._isFlipped) {
      monsterCardComp.flipCard(sendToServer);
    }
    const monsterHolder = MonsterField.getMonsterPlaceById(monsterPlaceId);
    const monsterId = monsterCardComp._cardId;
    monsterCard.getComponent(Monster).currentHp = monsterCard.getComponent(
      Monster
    ).HP;

    if (sendToServer) {
      await monsterHolder.addToMonsters(monsterCard, sendToServer);
    }
    const signal = Signal.NEW_MONSTER_ON_PLACE;
    const srvData = { cardId: monsterId, monsterPlaceId: monsterPlaceId };
    if (sendToServer) {
      ServerClient.$.send(signal, srvData);
      if (monsterCard.getComponent(Monster).isNonMonster) {
        await TurnsManager.currentTurn.getTurnPlayer().activateCard(monsterCard)
      }
    }
    CardManager.allCards.add(monsterCard.getComponent(Card)._cardId);
    CardManager.onTableCards.push(monsterCard);

  }

  static async givePlayerChoiceToCoverPlace(monsterToCoverWith: Monster, player: Player) {
    const chooseCard = new ChooseCard();
    chooseCard.flavorText = "Choose A Monster To Cover"
    await CardPreviewManager.getPreviews(Array.of(monsterToCoverWith.node), true)
    CardPreviewManager.showToOtherPlayers(monsterToCoverWith.node);
    chooseCard.chooseType = new ChooseCardTypeAndFilter()
    chooseCard.chooseType.chooseType = CHOOSE_CARD_TYPE.MONSTER_PLACES
    const monsterInSpotChosen = await chooseCard.collectData({ cardPlayerId: player.playerId })
    const activeMonsterSelected = monsterInSpotChosen.effectTargetCard.getComponent(Monster)
    const monsterCardHolder: MonsterCardHolder = MonsterField.getMonsterPlaceById(
      activeMonsterSelected.monsterPlace.id
    );
    await MonsterField.addMonsterToExsistingPlace(monsterCardHolder.id, monsterToCoverWith.node, true)
  }

  static getMonsterPlaceByActiveMonsterId(
    activeMonsterId: number
  ): MonsterCardHolder {
    for (let i = 0; i < this.monsterCardHolders.length; i++) {
      const monsterPlace = this.monsterCardHolders[i];
      const testedActiveMonsterId = monsterPlace.activeMonster.getComponent(
        Card
      )._cardId;
      if (activeMonsterId == testedActiveMonsterId) {
        return monsterPlace;
      }
    }
  }

  static async addMonsterToNewPlace(sendToServer: boolean) {
    const newMonsterHolder = this.getNewMonsterHolder();
    const layout = this.$.node.getComponent(cc.Layout);
    newMonsterHolder.setParent(layout.node)
    //layout.addCardToLayout(newMonsterHolder);

    if (sendToServer) {
      ServerClient.$.send(Signal.NEW_MONSTER_PLACE)
      await newMonsterHolder.getComponent(MonsterCardHolder).getNextMonster(true)
    }
    // this.addMonsterToExsistingPlace(
    //   newMonsterHolder.getComponent(MonsterCardHolder).id,
    //   monsterCard,
    //   sendToServer
    // );
  }

  static getNewMonsterHolder() {
    const newMonsterHolder = cc.instantiate(MonsterField.$.MonsterCardHolderPrefab);
    newMonsterHolder.name;
    newMonsterHolder.width = CARD_WIDTH;
    newMonsterHolder.height = CARD_HEIGHT;
    newMonsterHolder.getComponent(
      MonsterCardHolder
    ).id = ++MonsterField.holderIds;
    newMonsterHolder.name = "holder" + MonsterField.holderIds;
    this.$.node.addChild(newMonsterHolder);
    MonsterField.monsterCardHolders.push(
      newMonsterHolder.getComponent(MonsterCardHolder)
    );
    return newMonsterHolder;
  }

  static getMonsterCardHoldersIds() {
    const ids = [];
    for (let i = 0; i < MonsterField.monsterCardHolders.length; i++) {
      const monsterPlace = MonsterField.monsterCardHolders[i];
      ids.push(monsterPlace.id);
    }
    return ids;
  }

  static getMonsterPlaceById(id: number) {
    for (let i = 0; i < MonsterField.monsterCardHolders.length; i++) {
      const monsterPlace = MonsterField.monsterCardHolders[i];

      if (monsterPlace.id == id) {
        return monsterPlace;
      }
    }
    throw new Error(`No monster place found with id ${id}`)
  }

  static async updateActiveMonsters() {
    MonsterField.activeMonsters = [];
    for (let i = 0; i < MonsterField.monsterCardHolders.length; i++) {
      const monsterPlace = MonsterField.monsterCardHolders[i];
      if (monsterPlace.activeMonster != null) {
        MonsterField.activeMonsters.push(monsterPlace.activeMonster);
        const monsterEffect = monsterPlace.activeMonster.getComponent(CardEffect)
        if (monsterEffect != null && monsterEffect.passiveEffects.length > 0 && !PassiveManager.isCardRegistered(monsterPlace.activeMonster)) {

          if (TurnsManager.isCurrentPlayer(PlayerManager.mePlayer)) {
            await PassiveManager.registerPassiveItem(monsterPlace.activeMonster, true)
          }
        }
      }
    }
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.layout = this.getComponent(cc.Layout);
    MonsterField.$ = this;
    //make first two monster places
    for (let i = 0; i < 2; i++) {
      MonsterField.getNewMonsterHolder();
    }
    // MonsterField.monsterCardHolders.push(new MonsterPlace(++MonsterField.placesIds));
    // MonsterField.monsterCardHolders.push(new MonsterPlace(++MonsterField.placesIds));
  }

  start() { }

  update(dt) { }
}

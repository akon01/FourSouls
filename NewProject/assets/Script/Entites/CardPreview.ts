import {
  TIMETOSHOWPREVIEW,
  printMethodSignal,
  COLORS,
  printMethodStarted
} from "../Constants";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import { TIMETOHIDEPREVIEW } from "./../Constants";
import CardEffect from "./CardEffect";
import Player from "./GameEntities/Player";
import Server from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";
import Card from "./GameEntities/Card";
import ActionManager from "../Managers/ActionManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardPreview extends cc.Component {
  @property()
  card: cc.Node = null;

  static $: CardPreview = null;

  @property(cc.Button)
  exitButton: cc.Button = null;

  static wasEffectChosen: boolean = false;

  static effectChosen = null;

  @property
  effectChildern: cc.Node[] = [];

  @property
  hideThisTimeOut = null;

  //@printMethodStarted(COLORS.RED)
  showCardPreview(
    card: cc.Node,
    makeItemReadyToActivate: boolean,
    makeLootPlayable?: boolean,
    makeMonsterAttackable?: boolean,
    makeItemBuyable?: boolean
  ) {
    this.node.on(cc.Node.EventType.TOUCH_START, event => {
      event.stopPropagation();
    });
    if (this.hideThisTimeOut != null) {
      clearTimeout(this.hideThisTimeOut);
      this.hideThisTimeOut = null;
    }
    if (makeItemReadyToActivate) {
      this.node.once(cc.Node.EventType.TOUCH_START, () => {
        let cardPlayer = PlayerManager.getPlayerById(
          TurnsManager.currentTurn.PlayerId
        ).getComponent(Player);
        if (!card.getComponent(CardEffect).hasMultipleEffects) {
          this.hideCardPreview();
        }
        cardPlayer.activateItem(card, true);
      });
    }
    if (makeLootPlayable) {
      this.node.once(cc.Node.EventType.TOUCH_START, () => {
        let cardPlayer = PlayerManager.getPlayerById(
          TurnsManager.currentTurn.PlayerId
        ).getComponent(Player);
        this.hideCardPreview();
        cardPlayer.playLootCard(card, true);
      });
    }
    if (makeMonsterAttackable) {
      this.node.once(cc.Node.EventType.TOUCH_START, () => {
        let cardPlayer = PlayerManager.getPlayerById(
          TurnsManager.currentTurn.PlayerId
        ).getComponent(Player);
        this.hideCardPreview();
        cardPlayer.declareAttack(card, true);
      });
    }

    if (makeItemBuyable) {
      this.node.once(cc.Node.EventType.TOUCH_START, () => {
        let cardPlayer = PlayerManager.getPlayerById(
          TurnsManager.currentTurn.PlayerId
        ).getComponent(Player);
        this.hideCardPreview();
        cardPlayer.buyItem(card, true);
      });
    }

    this.node.active = true;
    this.card = card;

    let newSprite = card.getComponent(Card).frontSprite;
    this.node.getComponent(cc.Sprite).spriteFrame = newSprite;
    this.node.setSiblingIndex(this.node.parent.childrenCount - 1);
    if (this.node.getNumberOfRunningActions() == 0) {
      this.node.runAction(cc.fadeTo(TIMETOSHOWPREVIEW, 255));
    } else {
      this.node.stopAllActions();
      this.node.runAction(cc.fadeTo(TIMETOSHOWPREVIEW, 255));
    }
  }

  hideCardPreview(event?) {
    if (event) {
      event.stopPropagation();
    }
    this.node.off(cc.Node.EventType.TOUCH_START);
    for (let o = 0; o < this.effectChildern.length; o++) {
      const child = this.effectChildern[o];
      this.node.removeChild(child);
    }
    this.node.runAction(cc.fadeTo(TIMETOHIDEPREVIEW, 0));
    this.hideThisTimeOut = setTimeout(() => {
      this.node.setSiblingIndex(0);
      this.card = null;
      this.node.getComponent(cc.Sprite).spriteFrame = null;
      this.node.active = false;
      this.hideThisTimeOut = null;
    }, TIMETOHIDEPREVIEW * 1000);
    ActionManager.updateActions();
  }

  addEffectToPreview(effect: cc.Node) {
    let originalParent = effect.parent;
    let originalY = effect.y;

    let parentHeight = originalParent.height;

    let yPositionScale = this.node.height / parentHeight;

    let heightScale = effect.height / parentHeight;
    let widthScale = this.node.width / originalParent.width;
    this.node.addChild(cc.instantiate(effect), 1, effect.name);
    let newEffect = this.node.getChildByName(effect.name);
    this.effectChildern.push(newEffect);

    newEffect.width = this.node.width;

    newEffect.height = this.node.height * heightScale;

    let newY = originalY * yPositionScale;
    newEffect.setPosition(0, newY);

    newEffect.once(cc.Node.EventType.TOUCH_START, () => {
      this.hideCardPreview();
      CardPreview.effectChosen = newEffect;
      CardPreview.wasEffectChosen = true;
    });
  }

  async chooseEffectFromCard(card: cc.Node): Promise<cc.Node> {
    this.showCardPreview(card, false);
    this.exitButton.getComponent(cc.Button).interactable = false;
    let cardEffects = card.getComponent(CardEffect).activeEffects;
    //let effects be chosen on click
    for (let i = 0; i < cardEffects.length; i++) {
      const effect = cardEffects[i];

      this.addEffectToPreview(effect);
    }
    let chosenEffect = await this.testForEffectChosen();
    cc.log(chosenEffect);
    //disable effects be chosen on click
    for (let i = 0; i < cardEffects.length; i++) {
      const effect = cardEffects[i];
      effect.off(cc.Node.EventType.TOUCH_START);
    }
    this.exitButton.getComponent(cc.Button).interactable = true;
    return new Promise<cc.Node>((resolve, reject) => {
      resolve(chosenEffect);
    });
  }

  testForEffectChosen(): Promise<cc.Node> {
    return new Promise((resolve, reject) => {
      let check = () => {
        if (CardPreview.wasEffectChosen) {
          CardPreview.wasEffectChosen = false;
          resolve(CardPreview.effectChosen);
        } else {
          setTimeout(check, 50);
        }
      };
      setTimeout(check, 50);
    });
  }

  showToOtherPlayers(card: cc.Node) {
    let currentPlayer = TurnsManager.currentTurn.PlayerId;
    let srvData = {
      cardToShowId: card.getComponent(Card).cardId,
      playerId: currentPlayer
    };
    Server.$.send(Signal.SHOWCARDPREVIEW, srvData);
  }

  chooseEffect() {
    CardPreview.effectChosen = this;
    CardPreview.wasEffectChosen = true;
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.node.opacity = 0;
    CardPreview.$ = this;
  }

  start() {
    // CardPreview.$ = this;
  }

  // update (dt) {}
}

import {
  TIMETOSHOWPREVIEW,
  printMethodSignal,
  COLORS,
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
import { Decipher } from "crypto";
import Deck from "./GameEntities/Deck";
import CardPreviewManager from "../Managers/CardPreviewManager";
import Effect from "../CardEffectComponents/CardEffects/Effect";
import Item from "./CardTypes/Item";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardPreview extends cc.Component {
  @property()
  card: cc.Node = null;

  static $: CardPreview = null;

  @property(cc.Button)
  exitButton: cc.Button = null;

  static wasEffectChosen: boolean = false;

  static effectChosen: cc.Node = null;

  isSelected: boolean = false;

  @property
  counterLable: cc.Label = null;

  @property
  effectChildren: cc.Node[] = [];

  @property
  hideThisTimeOut = null;



  hideCardPreview(event?) {
    if (event) {
      event.stopPropagation();
    }

    this.node.off(cc.Node.EventType.TOUCH_START);
    for (let o = 0; o < this.effectChildren.length; o++) {
      const child = this.effectChildren[o];
      this.node.removeChild(child);
    }
    this.node.runAction(cc.fadeTo(TIMETOHIDEPREVIEW, 0));
    let hideTimeOut = () => {
      // this.node.setSiblingIndex(0);
      this.card = null;
      this.node.getComponent(cc.Sprite).spriteFrame = null;
      this.node.active = false;
      this.hideThisTimeOut = null;
      CardPreviewManager.$.node.emit('previewRemoved', this.node)
    };
    hideTimeOut.bind(this);
    this.hideThisTimeOut = setTimeout(hideTimeOut, TIMETOHIDEPREVIEW * 1000);

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
    newEffect.getComponent(Effect)._effectCard = originalParent;
    this.effectChildren.push(newEffect);

    newEffect.width = this.node.width;

    newEffect.height = this.node.height * heightScale;

    let newY = originalY * yPositionScale;
    newEffect.setPosition(0, newY);

    newEffect.once(cc.Node.EventType.TOUCH_START, () => {

      this.hideCardPreview();
      CardPreview.effectChosen = effect;
      CardPreview.wasEffectChosen = true;
    });
  }

  async chooseEffectFromCard(card: cc.Node): Promise<cc.Node> {
    //  this.showCardPreview(card, false);
    CardPreviewManager.openPreview(this.node)
    this.exitButton.getComponent(cc.Button).interactable = false;
    let cardEffects = card.getComponent(CardEffect).paidEffects
    // let cardEffects = card.getComponent(CardEffect).activeEffects;
    //cardEffects = cardEffects.concat(card.getComponent(CardEffect).paidEffects)
    //let effects be chosen on click
    for (let i = 0; i < cardEffects.length; i++) {
      const effect = cardEffects[i];
      let preCondition = effect.getComponent(Effect).preCondition
      if (preCondition != null && preCondition.testCondition()) {

        this.addEffectToPreview(effect);
      }
      else if (preCondition == null) {

        this.addEffectToPreview(effect)
      }
    }
    cardEffects = card.getComponent(CardEffect).activeEffects;
    for (let i = 0; i < cardEffects.length; i++) {
      const effect = cardEffects[i];
      let preCondition = effect.getComponent(Effect).preCondition
      if (!card.getComponent(Item).activated) {

        if (preCondition != null && preCondition.testCondition()) {

          this.addEffectToPreview(effect);
        }
        else if (preCondition == null) {

          this.addEffectToPreview(effect)
        }
      }
    }


    let chosenEffect = await this.testForEffectChosen();
    ;
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
      check.bind(this);
      setTimeout(check, 50);
    });
  }

  // showToOtherPlayers(card: cc.Node) {
  //   let currentPlayer = TurnsManager.currentTurn.PlayerId;
  //   let srvData = {
  //     cardToShowId: card.getComponent(Card)._cardId,
  //     playerId: currentPlayer
  //   };
  //   Server.$.send(Signal.SHOWCARDPREVIEW, srvData);
  // }

  chooseEffect() {
    CardPreview.effectChosen = this;
    CardPreview.wasEffectChosen = true;
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.node.opacity = 255;
    this.counterLable = this.node.getChildByName('Counter').getComponent(cc.Label);
    this.counterLable.enabled = false;
    CardPreview.$ = this;
  }

  start() {
    // CardPreview.$ = this;
  }

  // update (dt) {}
}

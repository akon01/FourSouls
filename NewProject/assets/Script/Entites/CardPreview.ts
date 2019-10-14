import Effect from "../CardEffectComponents/CardEffects/Effect";
import CardPreviewManager from "../Managers/CardPreviewManager";
import { TIME_TO_HIDE_PREVIEW, GAME_EVENTS } from "./../Constants";
import CardEffect from "./CardEffect";
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

  @property
  hasTouchProperty: boolean = false;

  unuse() {
    this.node.active = true;
    this.node.opacity = 255;
  }


  async hideCardPreview(event?) {
    if (event) {
      event.stopPropagation();
    }

    this.node.off(cc.Node.EventType.TOUCH_START);
    for (let o = 0; o < this.effectChildren.length; o++) {
      const child = this.effectChildren[o];
      this.node.removeChild(child);
    }
    let func = cc.callFunc(() => {
      // this.node.setSiblingIndex(0);
      this.card = null;
      this.hasTouchProperty = false
      this.node.getComponent(cc.Sprite).spriteFrame = null;
      this.node.active = false;
      whevent.emit(GAME_EVENTS.CARD_PREVIEW_HIDE_OVER)
      CardPreviewManager.$.node.emit('previewRemoved', this.node)
    }, this)
    this.node.runAction(cc.sequence(cc.fadeTo(TIME_TO_HIDE_PREVIEW, 0), func));
    //this.hideThisTimeOut = setTimeout(hideTimeOut, TIME_TO_HIDE_PREVIEW * 1000);
    await this.waitForHideOver()
  }

  waitForHideOver() {
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.CARD_PREVIEW_HIDE_OVER, () => {
        resolve(true)
      })
    });
  }


  addEffectToPreview(effect: cc.Node) {
    let originalParent = effect.parent;
    let originalY = effect.y;

    let parentHeight = originalParent.height;

    let yPositionScale = this.node.height / parentHeight;

    let heightScale = effect.height / parentHeight;
    let widthScale = this.node.width / originalParent.width;

    let name = effect.name + ' ' + this.node.childrenCount
    this.node.addChild(cc.instantiate(effect), 1, name);
    let newEffect = this.node.getChildByName(name);
    newEffect.getComponent(Effect)._effectCard = originalParent;
    this.effectChildren.push(newEffect);

    newEffect.width = this.node.width;

    newEffect.height = this.node.height * heightScale;


    let newY = originalY * yPositionScale;

    newEffect.setPosition(0, newY);

    cc.log(`new effect name ${newEffect.name}`)
    newEffect.once(cc.Node.EventType.TOUCH_START, async () => {
      cc.log(`new effect ${newEffect.name} was chosen`)
      await this.hideCardPreview();
      CardPreview.effectChosen = effect;
      whevent.emit(GAME_EVENTS.CARD_PREVIEW_CHOOSE_EFFECT)
      //  CardPreview.wasEffectChosen = true;
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
    cc.log(cardEffects)
    for (let i = 0; i < cardEffects.length; i++) {
      const effect = cardEffects[i];
      cc.log(effect)
      let preCondition = effect.getComponent(Effect).preCondition
      let itemComp = card.getComponent(Item)
      if (itemComp != null) {
        if (!itemComp.activated) {

          if (preCondition != null && preCondition.testCondition()) {

            this.addEffectToPreview(effect);
          }
          else if (preCondition == null) {

            this.addEffectToPreview(effect)
          }
        }
      } else {
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
      whevent.onOnce(GAME_EVENTS.CARD_PREVIEW_CHOOSE_EFFECT, () => {
        resolve(CardPreview.effectChosen)
      })
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
    CardPreview.effectChosen = this.node;
    whevent.emit(GAME_EVENTS.CARD_PREVIEW_CHOOSE_EFFECT)
    // CardPreview.wasEffectChosen = true;
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

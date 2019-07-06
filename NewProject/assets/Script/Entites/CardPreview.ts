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

  static effectChosen = null;

  isSelected: boolean = false;

  @property
  counterLable: cc.Label = null;

  @property
  effectChildren: cc.Node[] = [];

  @property
  hideThisTimeOut = null;

  //@printMethodStarted(COLORS.RED)
  // showCardPreview(
  //   card: cc.Node,
  //   makeItemReadyToActivate: boolean,
  //   makeLootPlayable?: boolean,
  //   makeMonsterAttackable?: boolean,
  //   makeItemBuyable?: boolean
  // ) {
  //   this.node.on(cc.Node.EventType.TOUCH_START, event => {
  //     event.stopPropagation();
  //   });
  //   if (this.hideThisTimeOut != null) {
  //     clearTimeout(this.hideThisTimeOut);
  //     this.hideThisTimeOut = null;
  //   }
  //   if (makeItemReadyToActivate) {
  //     this.node.once(cc.Node.EventType.TOUCH_START, () => {
  //       let cardPlayer = PlayerManager.getPlayerById(
  //         TurnsManager.currentTurn.PlayerId
  //       ).getComponent(Player);
  //       if (!card.getComponent(CardEffect).hasMultipleEffects) {
  //         this.hideCardPreview();
  //       }
  //       cardPlayer.activateItem(card, true);
  //     });
  //   }
  //   if (makeLootPlayable) {
  //     this.node.once(cc.Node.EventType.TOUCH_START, () => {
  //       let cardPlayer = PlayerManager.getPlayerById(
  //         TurnsManager.currentTurn.PlayerId
  //       ).getComponent(Player);
  //       this.hideCardPreview();
  //       cardPlayer.playLootCard(card, true);
  //     });
  //   }
  //   if (makeMonsterAttackable) {
  //     this.node.once(cc.Node.EventType.TOUCH_START, () => {
  //       let cardPlayer = PlayerManager.getPlayerById(
  //         TurnsManager.currentTurn.PlayerId
  //       ).getComponent(Player);
  //       this.hideCardPreview();
  //       cardPlayer.declareAttack(card, true);
  //     });
  //   }

  //   if (makeItemBuyable) {
  //     this.node.once(cc.Node.EventType.TOUCH_START, () => {
  //       let cardPlayer = PlayerManager.getPlayerById(
  //         TurnsManager.currentTurn.PlayerId
  //       ).getComponent(Player);
  //       this.hideCardPreview();
  //       cardPlayer.buyItem(card, true);
  //     });
  //   }

  //   this.node.active = true;
  //   this.card = card;

  //   let newSprite = card.getComponent(Card).frontSprite;
  //   this.node.getComponent(cc.Sprite).spriteFrame = newSprite;
  //   this.node.setSiblingIndex(this.node.parent.childrenCount - 1);
  //   if (this.node.getNumberOfRunningActions() == 0) {
  //     this.node.runAction(cc.fadeTo(TIMETOSHOWPREVIEW, 255));
  //   } else {
  //     this.node.stopAllActions();
  //     this.node.runAction(cc.fadeTo(TIMETOSHOWPREVIEW, 255));
  //   }
  // }

  // async showCardPreview2(card: cc.Node) {

  //   let cardComp;
  //   let newSprite;
  //   if (card.getComponent(Deck) == null) {

  //     cardComp = card.getComponent(Card);
  //   } else {

  //     cardComp = card.getComponent(Deck);
  //     newSprite = card.getComponent(cc.Sprite).spriteFrame;
  //   }
  //   this.node.on(cc.Node.EventType.TOUCH_START, event => {
  //     event.stopPropagation();
  //   });

  //   if (cardComp.isRequired) {
  //     if (card.getComponent(Deck) == null) {
  //       newSprite = card.getComponent(Card).frontSprite;
  //     }
  //     this.node.once(cc.Node.EventType.TOUCH_START, () => {
  //       let cardPlayer = PlayerManager.getPlayerById(
  //         TurnsManager.currentTurn.PlayerId
  //       ).getComponent(Player);
  //       this.hideCardPreview();
  //       cardComp.requiredFor.cardChosen = card;
  //       cardComp.requiredFor.isCardChosen = true;
  //     });
  //   } else if (cardComp instanceof Card) {


  //     newSprite = card.getComponent(Card).frontSprite;
  //     if (cardComp._isReactable) {
  //       ;
  //       this.node.once(cc.Node.EventType.TOUCH_START, () => {
  //         let cardPlayer = PlayerManager.getPlayerById(
  //           cardComp._cardHolderId
  //         ).getComponent(Player);
  //         if (!card.getComponent(CardEffect).hasMultipleEffects) {
  //           this.hideCardPreview();
  //         }
  //         cardPlayer.activateCard(card);
  //       });
  //     } else if (cardComp._isActivateable) {
  //       ;
  //       this.node.once(cc.Node.EventType.TOUCH_START, () => {
  //         let cardPlayer = PlayerManager.getPlayerById(
  //           TurnsManager.currentTurn.PlayerId
  //         ).getComponent(Player);
  //         if (!card.getComponent(CardEffect).hasMultipleEffects) {
  //           this.hideCardPreview();
  //         }
  //         cardPlayer.activateItem(card, true);
  //       });
  //     } else if (cardComp._isPlayable) {
  //       ;
  //       this.node.once(cc.Node.EventType.TOUCH_START, () => {
  //         let cardPlayer = PlayerManager.getPlayerById(
  //           TurnsManager.currentTurn.PlayerId
  //         ).getComponent(Player);
  //         this.hideCardPreview();
  //         cardPlayer.playLootCard(card, true);
  //       });
  //     }
  //     if (cardComp._isAttackable) {
  //       ;
  //       this.node.once(cc.Node.EventType.TOUCH_START, () => {
  //         let cardPlayer = PlayerManager.getPlayerById(
  //           TurnsManager.currentTurn.PlayerId
  //         ).getComponent(Player);
  //         this.hideCardPreview();
  //         cardPlayer.declareAttack(card, true);
  //       });
  //     } else if (cardComp._isBuyable) {
  //       ;
  //       this.node.once(cc.Node.EventType.TOUCH_START, () => {
  //         let cardPlayer = PlayerManager.getPlayerById(
  //           TurnsManager.currentTurn.PlayerId
  //         ).getComponent(Player);
  //         this.hideCardPreview();
  //         cardPlayer.buyItem(card, true);
  //       });
  //     }
  //   }

  //   // this.node.active = true;
  //   this.card = card;

  //   this.node.getComponent(cc.Sprite).spriteFrame = newSprite;
  //   this.node.setSiblingIndex(this.node.parent.childrenCount - 1);
  //   if (this.node.getNumberOfRunningActions() == 0) {
  //     this.node.runAction(cc.fadeTo(TIMETOSHOWPREVIEW, 255));
  //   } else {
  //     this.node.stopAllActions();
  //     this.node.runAction(cc.fadeTo(TIMETOSHOWPREVIEW, 255));
  //   }
  //   return true;
  // }

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
      CardPreview.effectChosen = newEffect;
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
        cc.log(`added${effect.name} , precondition passed`)
        this.addEffectToPreview(effect);
      }
      else if (preCondition == null) {
        cc.log(`added${effect.name},no precondition`)
        this.addEffectToPreview(effect)
      }
    }
    cardEffects = card.getComponent(CardEffect).activeEffects;
    for (let i = 0; i < cardEffects.length; i++) {
      const effect = cardEffects[i];
      let preCondition = effect.getComponent(Effect).preCondition
      if (!card.getComponent(Item).activated) {
        cc.log('card is not activated')
        if (preCondition != null && preCondition.testCondition()) {
          cc.log(`added${effect.name} , precondition passed`)
          this.addEffectToPreview(effect);
        }
        else if (preCondition == null) {
          cc.log(`added${effect.name},no precondition`)
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

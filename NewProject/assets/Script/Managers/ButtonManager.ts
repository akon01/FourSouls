import Player from "../Entites/GameEntities/Player";
import { BUTTON_STATE, GAME_EVENTS } from "../Constants";
import PlayerManager from "./PlayerManager";
import CardPreviewManager from "./CardPreviewManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ButtonManager extends cc.Component {

  @property(cc.Node)
  togglePreviewManagerButton: cc.Node = null;

  @property(cc.Node)
  showStackButton: cc.Node = null;

  @property(cc.Node)
  yesButton: cc.Node = null;

  @property(cc.Node)
  skipButton: cc.Node = null;

  @property(cc.Node)
  nextTurnButton: cc.Node = null;

  @property(cc.Node)
  NoButton: cc.Node = null;

  @property(cc.Node)
  clearPreviewsButton: cc.Node = null;

  @property(cc.Layout)
  cardPreviewButtonLayout: cc.Layout = null

  @property(cc.Layout)
  playerButtonLayout: cc.Layout = null

  static $: ButtonManager = null

  // LIFE-CYCLE CALLBACKS:

  static init() {

    // this.addToHandButtonPool = new cc.NodePool();
    // //50 is number of available buttons during runtime (make Constant!)
    // for (let i = 0; i < 50; i++) {
    //      let addToHandButton:cc.Node = cc.instantiate(this.addToHandButtonPrefab);
    //      addToHandButton.name = 'addToHandButton';
    //      this.addToHandButtonPool.put(addToHandButton);

    // }
  }

  static moveButton(button: cc.Node, layout: cc.Layout) {
    if (button.parent != layout.node)
      button.setParent(layout.node)
  }


  static enableButton(button: cc.Node, state: BUTTON_STATE, extra?: any[]) {
    let btn = button.getComponent(cc.Button)
    //makes sure that if any other states run, the button will be enabled
    if (btn.interactable == false && state != BUTTON_STATE.DISABLED && state != BUTTON_STATE.ENABLED) this.enableButton(btn.node, BUTTON_STATE.ENABLED)

    switch (state) {
      case BUTTON_STATE.ENABLED:

        //special case :
        //skip button shuold not appare if the player isnt in get response
        if (button == this.$.skipButton && !PlayerManager.mePlayer.getComponent(Player)._inGetResponse) {
          break;
        }

        btn.interactable = true;
        btn.node.active = true;

        //special cases

        //Yes/Confirm Or No/Skip button should be on previews layout if it is open
        if (button == this.$.yesButton || button == this.$.skipButton) {
          if (CardPreviewManager.isOpen) {
            this.moveButton(btn.node, this.$.cardPreviewButtonLayout)
          } else this.moveButton(btn.node, this.$.playerButtonLayout)
        }
        break;
      case BUTTON_STATE.DISABLED:
        btn.interactable = false;
        let makeDisapper = false;
        if (button != this.$.nextTurnButton && button != this.$.clearPreviewsButton) makeDisapper = true;
        if (button == this.$.skipButton && !PlayerManager.mePlayer.getComponent(Player)._reactionToggle.isChecked) makeDisapper = true
        if (makeDisapper)
          btn.node.active = false;
        break;
      case BUTTON_STATE.CHANGE_TEXT:
        btn.node.getComponentInChildren(cc.Label).string = extra[0]
        break

      //PLAYER AFFECTING//
      case BUTTON_STATE.PLAYER_CHOOSE_NO:
        btn.node.on(cc.Node.EventType.TOUCH_START, () => {
          extra[0]._playerYesNoDecision = false;
          cc.log(extra[0])
          extra[0].hasPlayerSelectedYesNo = true
        }, extra[0])
        break;
      case BUTTON_STATE.PLAYER_CHOOSE_YES:
        btn.node.on(cc.Node.EventType.TOUCH_START, () => {
          extra[0]._playerYesNoDecision = true;
          cc.log(extra[0])
          extra[0].hasPlayerSelectedYesNo = true
        }, extra[0])
        break;
      case BUTTON_STATE.PLAYER_CLICKS_NEXT:
        btn.node.on(cc.Node.EventType.TOUCH_START, () => {
          //cc.log(extra[0])
          whevent.emit(GAME_EVENTS.PLAYER_CLICKED_NEXT)
          //extra[0].hasPlayerClickedNext = true
        })
        break;

      //PLAYER AFFECTING//

      //SKIP BUTTON ONLY //
      case BUTTON_STATE.SKIP_SKIP_RESPONSE:
        btn.node.once(cc.Node.EventType.TOUCH_START, () => {
          let player: Player = extra[1]
          clearTimeout(extra[0]);
          player.respondWithNoAction(
            extra[2]
          )
        }, extra[1])
        if (CardPreviewManager.isOpen) {
          this.moveButton(btn.node, this.$.cardPreviewButtonLayout)
        } else this.moveButton(btn.node, this.$.playerButtonLayout)
        break;

      //SKIP BUTTON ONLY END //

      //Toggle Card Preview Button //
      case BUTTON_STATE.TOGGLE_TO_OPEN_PREVIEWS:
        ButtonManager.enableButton(ButtonManager.$.togglePreviewManagerButton, BUTTON_STATE.CHANGE_TEXT, ['+'])
        this.moveButton(ButtonManager.$.togglePreviewManagerButton, this.$.playerButtonLayout)
        btn.node.off(cc.Node.EventType.TOUCH_START)
        btn.node.on(cc.Node.EventType.TOUCH_START, CardPreviewManager.showPreviewManager)
        break;
      case BUTTON_STATE.TOGGLE_TO_CLOSE_PREVIEWS:
        ButtonManager.enableButton(ButtonManager.$.togglePreviewManagerButton, BUTTON_STATE.CHANGE_TEXT, ['-'])
        this.moveButton(ButtonManager.$.togglePreviewManagerButton, this.$.cardPreviewButtonLayout)
        btn.node.off(cc.Node.EventType.TOUCH_START)
        btn.node.on(cc.Node.EventType.TOUCH_START, CardPreviewManager.hidePreviewManager)
        break;
      //Toggle Card Preview Button //

      //Clear Previews Button//
      case BUTTON_STATE.SET_CLEAR_PREVIEWS:
        btn.node.on(cc.Node.EventType.TOUCH_START, CardPreviewManager.clearAllPreviews.bind(CardPreviewManager))
        break;
      //Clear Previews Button end//

      //Yes Button Only//
      case BUTTON_STATE.SET_CONFIRM_SELECT_IN_PREVIEWS:
        // if (CardPreviewManager.isOpen) {
        //   this.moveButton(btn.node, this.$.cardPreviewButtonLayout)
        // } else this.moveButton(btn.node, this.$.playerButtonLayout)
        let eventHandler = new cc.Component.EventHandler();
        eventHandler.component = 'CardPreviewManager'
        eventHandler.handler = 'confirmSelect'
        eventHandler.target = CardPreviewManager.$.node;
        btn.clickEvents.push(eventHandler)
        // btn.node.on(cc.Node.EventType.TOUCH_START, CardPreviewManager.confirmSelect)
        break;
      case BUTTON_STATE.REMOVE_CONFIRM_SELECT:
        eventHandler = new cc.Component.EventHandler();
        eventHandler.component = 'CardPreviewManager'
        eventHandler.handler = 'confirmSelect'
        eventHandler.target = CardPreviewManager.$.node;
        btn.clickEvents.splice(btn.clickEvents.indexOf(eventHandler))
        break

      case BUTTON_STATE.SET_NOT_YET_AVAILABLE:
        btn.interactable = false;
        break;
      case BUTTON_STATE.SET_AVAILABLE:
        btn.interactable = true;
        break;
      //Yes Button Only End//
      default:
        break;
    }
  }



  onLoad() {
    ButtonManager.$ = this;
  }

  start() { }

  // update (dt) {}
}

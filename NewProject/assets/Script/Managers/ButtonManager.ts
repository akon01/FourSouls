import { BUTTON_STATE, GAME_EVENTS } from "../Constants";
import Player from "../Entites/GameEntities/Player";
import CardPreviewManager from "./CardPreviewManager";
import PlayerManager from "./PlayerManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ButtonManager extends cc.Component {

  @property(cc.Button)
  togglePreviewManagerButton: cc.Button = null;

  @property(cc.Button)
  showStackButton: cc.Button = null;

  @property(cc.Button)
  yesButton: cc.Button = null;

  @property(cc.Button)
  confirmButton: cc.Button = null;

  @property(cc.Button)
  nextButton: cc.Button = null;

  @property(cc.Button)
  skipButton: cc.Button = null;

  @property(cc.Button)
  nextTurnButton: cc.Button = null;

  @property(cc.Button)
  NoButton: cc.Button = null;

  @property(cc.Button)
  clearPreviewsButton: cc.Button = null;

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



  static moveButton(button: cc.Button, layout: cc.Layout) {
    if (button.node.parent != layout.node) {
      button.node.setParent(layout.node)
    }
  }

  static moveAvailableButtonsTo(layout: cc.Layout) {
    cc.log(`move buttons to ${layout.name}`)
    this.moveButton(this.$.NoButton, layout)
    this.moveButton(this.$.yesButton, layout)
    this.moveButton(this.$.nextButton, layout)

  }

  static enableButton(button: cc.Button, state: BUTTON_STATE, extra?: any[]) {
    const btn = button.getComponent(cc.Button)
    //makes sure that if any other states run, the button will be enabled
    let eventHandler = new cc.Component.EventHandler();
    let player: Player
    switch (state) {
      case BUTTON_STATE.ENABLED:

        btn.interactable = true;
        btn.node.active = true;

        break;
      case BUTTON_STATE.DISABLED:
        btn.interactable = false;
        btn.node.active = false;
        break;
      case BUTTON_STATE.CHANGE_TEXT:
        btn.node.getComponentInChildren(cc.Label).string = extra[0]
        break

      //PLAYER AFFECTING// 
      case BUTTON_STATE.PLAYER_CHOOSE_NO:
        btn.clickEvents = []
        eventHandler.component = "Player"
        eventHandler.handler = "chooseYesNo"
        player = extra[0]
        eventHandler.target = player.node
        eventHandler.customEventData = "False"
        btn.clickEvents.push(eventHandler)
        break;

      case BUTTON_STATE.PLAYER_CHOOSE_YES:
        btn.clickEvents = []
        eventHandler.component = "Player"
        eventHandler.handler = "chooseYesNo"
        player = extra[0]
        eventHandler.target = player.node
        eventHandler.customEventData = "True"
        btn.clickEvents.push(eventHandler)
        break;

      case BUTTON_STATE.PLAYER_CLICKS_NEXT:
        btn.clickEvents = []
        eventHandler.component = "Player"
        eventHandler.handler = "clickNext"
        player = extra[0]
        eventHandler.target = player.node
        btn.clickEvents.push(eventHandler)
        break;

      //PLAYER AFFECTING//

      //SKIP BUTTON ONLY //
      case BUTTON_STATE.SKIP_SKIP_RESPONSE:
        btn.clickEvents = []
        eventHandler.component = "Player"
        eventHandler.handler = "skipButtonClicked"
        player = extra[1]
        eventHandler.target = player.node
        eventHandler.customEventData = extra[2]
        btn.clickEvents.push(eventHandler)
        break;

      //SKIP BUTTON ONLY END //

      //Toggle Card Preview Button //
      case BUTTON_STATE.TOGGLE_TO_OPEN_PREVIEWS:
        ButtonManager.enableButton(ButtonManager.$.togglePreviewManagerButton, BUTTON_STATE.CHANGE_TEXT, ["+"])
        this.moveButton(ButtonManager.$.togglePreviewManagerButton, this.$.playerButtonLayout)

        btn.clickEvents = []
        eventHandler.component = "CardPreviewManager"
        eventHandler.handler = "openPrevManagerButtonClicked"
        eventHandler.target = CardPreviewManager.$.node
        btn.clickEvents.push(eventHandler)
        break;
      case BUTTON_STATE.TOGGLE_TO_CLOSE_PREVIEWS:
        ButtonManager.enableButton(ButtonManager.$.togglePreviewManagerButton, BUTTON_STATE.CHANGE_TEXT, ["-"])
        this.moveButton(ButtonManager.$.togglePreviewManagerButton, this.$.cardPreviewButtonLayout)
        btn.clickEvents = []
        eventHandler.component = "CardPreviewManager"
        eventHandler.handler = "closePrevManagerButtonClicked"
        eventHandler.target = CardPreviewManager.$.node
        btn.clickEvents.push(eventHandler)
        break;
      //Toggle Card Preview Button //

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

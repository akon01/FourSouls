import { Button, Component, EventHandler, Label, Layout, _decorator } from 'cc';
import { BUTTON_STATE } from "../Constants";
import { Player } from "../Entites/GameEntities/Player";
import { WrapperProvider } from './WrapperProvider';
const { ccclass, property } = _decorator;


@ccclass('ButtonManager')
export class ButtonManager extends Component {
  @property(Button)
  togglePreviewManagerButton: Button | null = null;

  @property(Button)
  showStackButton: Button | null = null;

  @property(Button)
  yesButton: Button | null = null;

  @property(Button)
  confirmButton: Button | null = null;

  @property(Button)
  nextButton: Button | null = null;

  @property(Button)
  skipButton: Button | null = null;

  @property(Button)
  nextTurnButton: Button | null = null;

  @property(Button)
  NoButton: Button | null = null;

  @property(Button)
  clearPreviewsButton: Button | null = null;

  @property(Layout)
  cardPreviewButtonLayout: Layout | null = null

  @property(Layout)
  playerButtonLayout: Layout | null = null





  // LIFE-CYCLE CALLBACKS:

  init() {

    // this.addToHandButtonPool = new NodePool();
    // //50 is number of available buttons during runtime (make Constant!)
    // for (let i = 0; i < 50; i++) {
    //      let addToHandButton:Node = instantiate(this.addToHandButtonPrefab);
    //      addToHandButton.name = 'addToHandButton';
    //      this.addToHandButtonPool.put(addToHandButton);

    // }
  }



  moveButton(button: Button, layout: Layout) {
    if (button.node.parent != layout.node) {
      button.node.setParent(layout.node)
    }
  }

  moveAvailableButtonsTo(layout: Layout) {
    this.moveButton(WrapperProvider.buttonManagerWrapper.out.NoButton!, layout)
    this.moveButton(WrapperProvider.buttonManagerWrapper.out.yesButton!, layout)
    this.moveButton(WrapperProvider.buttonManagerWrapper.out.nextButton!, layout)

  }

  enableButton(button: Button, state: BUTTON_STATE, extra?: any[]) {
    const btn = button.getComponent(Button)!
    //makes sure that if any other states run, the button will be enabled
    let eventHandler = new EventHandler();
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
        btn.node.getComponentInChildren(Label)!.string = extra![0]
        break

      //PLAYER AFFECTING// 
      case BUTTON_STATE.PLAYER_CHOOSE_NO:
        btn.clickEvents = []
        eventHandler.component = "Player"
        eventHandler.handler = "chooseYesNo"
        player = extra![0]
        eventHandler.target = player.node
        eventHandler.customEventData = "False"
        btn.clickEvents.push(eventHandler)
        break;

      case BUTTON_STATE.PLAYER_CHOOSE_YES:
        btn.clickEvents = []
        eventHandler.component = "Player"
        eventHandler.handler = "chooseYesNo"
        player = extra![0]
        eventHandler.target = player.node
        eventHandler.customEventData = "True"
        btn.clickEvents.push(eventHandler)
        break;

      case BUTTON_STATE.PLAYER_CLICKS_NEXT:
        btn.clickEvents = []
        eventHandler.component = "Player"
        eventHandler.handler = "clickNext"
        player = extra![0]
        eventHandler.target = player.node
        btn.clickEvents.push(eventHandler)
        break;

      //PLAYER AFFECTING//

      //SKIP BUTTON ONLY //
      case BUTTON_STATE.SKIP_SKIP_RESPONSE:
        btn.clickEvents = []
        eventHandler.component = "Player"
        eventHandler.handler = "skipButtonClicked"
        player = extra![1]
        eventHandler.target = player.node
        eventHandler.customEventData = extra![2]
        btn.clickEvents.push(eventHandler)
        break;

      //SKIP BUTTON ONLY END //

      //Toggle CardPreview Button //
      case BUTTON_STATE.TOGGLE_TO_OPEN_PREVIEWS:
        WrapperProvider.buttonManagerWrapper.out.enableButton(this.togglePreviewManagerButton!, BUTTON_STATE.CHANGE_TEXT, ["+"])
        this.moveButton(this.togglePreviewManagerButton!, WrapperProvider.buttonManagerWrapper.out.playerButtonLayout!)

        btn.clickEvents = []
        eventHandler.component = "CardPreviewManager"
        eventHandler.handler = "openPrevManagerButtonClicked"
        eventHandler.target = WrapperProvider.cardPreviewManagerWrapper.out.node
        btn.clickEvents.push(eventHandler)
        break;
      case BUTTON_STATE.TOGGLE_TO_CLOSE_PREVIEWS:
        WrapperProvider.buttonManagerWrapper.out.enableButton(this.togglePreviewManagerButton!, BUTTON_STATE.CHANGE_TEXT, ["-"])
        this.moveButton(this.togglePreviewManagerButton!, WrapperProvider.buttonManagerWrapper.out.cardPreviewButtonLayout!)
        btn.clickEvents = []
        eventHandler.component = "CardPreviewManager"
        eventHandler.handler = "closePrevManagerButtonClicked"
        eventHandler.target = WrapperProvider.cardPreviewManagerWrapper.out.node
        btn.clickEvents.push(eventHandler)
        break;
      //Toggle CardPreview Button //

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
  }


  // update (dt) {}
}

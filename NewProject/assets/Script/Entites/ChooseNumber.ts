import { GAME_EVENTS } from "../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ChooseNumber extends cc.Component {
  @property(cc.Label)
  numberLable: cc.Label = null;

  @property(cc.Button)
  plusButton: cc.Button = null;

  @property(cc.Button)
  minusButton: cc.Button = null;

  @property(cc.Button)
  okButton: cc.Button = null;

  @property
  currentNumber: number = 1;

  @property
  max: number = 1;

  @property
  isOk: boolean = false;

  addOne() {
    if (this.currentNumber + 1 <= this.max) {
      this.currentNumber += 1;
    }
  }

  subtractOne() {
    this.currentNumber -= 1;
  }

  ok() {
    whevent.emit(GAME_EVENTS.CHOOSE_NUMBER_OK)
  }

  testForOk(): Promise<number> {
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.CHOOSE_NUMBER_OK, () => {
        resolve(this.currentNumber);
      })
    });
  }

  async getNumber(max) {
    this.max = max;
    return await this.testForOk;
  }
  // LIFE-CYCLE CALLBACKS:

  onLoad() { }

  start() { }

  update(dt) {
    this.numberLable.string = this.currentNumber.toString();
  }
}

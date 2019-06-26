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
    this.isOk = true;
  }

  testForOk(): Promise<number> {
    return new Promise((resolve, reject) => {
      //cc.log("please choose a number");
      let check = () => {
        if (this.isOk) {
          this.isOk = false;
          resolve(this.currentNumber);
        } else {
          setTimeout(check, 50);
        }
      };
      check.bind(this);
      setTimeout(check, 50);
    });
  }

  async getNumber(max) {
    this.max = max;
    return await this.testForOk;
  }
  // LIFE-CYCLE CALLBACKS:

  onLoad() {}

  start() {}

  update(dt) {
    this.numberLable.string = this.currentNumber.toString();
  }
}

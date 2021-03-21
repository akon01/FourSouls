import { _decorator, Component, Label, Button } from 'cc';
const { ccclass, property } = _decorator;

import { GAME_EVENTS } from "../Constants";
import { whevent } from "../../ServerClient/whevent";

@ccclass('ChooseNumber')
export class ChooseNumber extends Component {
      @property(Label)
      numberLable: Label | null = null;

      @property(Button)
      plusButton: Button | null = null;

      @property(Button)
      minusButton: Button | null = null;

      @property(Button)
      okButton: Button | null = null;

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

      async getNumber(max: number) {
            this.max = max;
            return await this.testForOk;
      }
      // LIFE-CYCLE CALLBACKS:

      update(dt: number) {
            this.numberLable!.string = this.currentNumber.toString();
      }
}

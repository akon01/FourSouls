import {
  ROLL_TYPE,
  TIMEFORDICEROLL,
  printMethodStarted,
  COLORS
} from "../../Constants";
import Player from "./Player";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Dice extends cc.Component {
  @property
  currentRolledNumber: number = -1;

  @property
  lastRolledNumber: number = -1;

  @property([cc.SpriteFrame])
  diceSprites: cc.SpriteFrame[] = [];

  @property
  loadedSprites: boolean = false;

  @property
  availableRolls: number = 0;

  @property
  rollType: ROLL_TYPE = null;

  @property
  rollOver: boolean = false;

  @printMethodStarted(COLORS.RED)
  async rollDice(rollType: ROLL_TYPE) {
    this.rollType = rollType;
    if (this.currentRolledNumber == -1) {
      this.lastRolledNumber = this.currentRolledNumber;
    }
    let timesToRoll = Math.floor(Math.random() * 5) + 4;
    this.doRoll();
    let rollOver = await this.waitForDiceRoll();
    // await this.schedule(
    //   () => {
    //     this.currentRolledNumber = Math.floor(Math.random() * 6) + 1;
    //     this.node.getComponent(
    //       cc.Sprite
    //     ).spriteFrame = this.getSpriteByNumber();
    //   },
    //   TIMEFORDICEROLL,
    //   Math.floor(Math.random() * 5) + 4
    // );
    let eventName = "" + this.rollType;
    cc.log("rolled " + this.currentRolledNumber);
    return new Promise<number>((resolve, reject) => {
      resolve(this.currentRolledNumber);
    });
  }

  async waitForDiceRoll(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let check = () => {
        if (this.rollOver == true) {
          this.rollOver = false;

          resolve(true);
        } else {
          setTimeout(check, 50);
        }
      };
      setTimeout(check, 50);
    });
  }

  diceChange() {
    let newNumber = Math.floor(Math.random() * 6) + 1;
    while (newNumber == this.currentRolledNumber) {
      newNumber = Math.floor(Math.random() * 6) + 1;
    }
    this.currentRolledNumber = newNumber;
    // this.node.getComponent(cc.Sprite).spriteFrame = this.getSpriteByNumber();
  }

  doRoll() {
    let timesToRoll = Math.floor(Math.random() * 5) + 4;
    let rolledTimes = 0;
    this.schedule(
      () => {
        if (rolledTimes == timesToRoll) {
          this.rollOver = true;
        } else {
          this.diceChange();
          rolledTimes++;
        }
      },
      TIMEFORDICEROLL,
      timesToRoll
    );
  }

  disableRoll() {
    this.node.off(cc.Node.EventType.TOUCH_START);
  }

  async setRoll(diceNum: number) {
    this.lastRolledNumber = this.currentRolledNumber;
    this.currentRolledNumber = diceNum;
    return new Promise<number>((resolve, reject) => {
      resolve(this.currentRolledNumber);
    });
  }

  async increaseRollBy(increaseBy: number) {
    this.lastRolledNumber = this.currentRolledNumber;
    this.currentRolledNumber += increaseBy;
    return new Promise<number>((resolve, reject) => {
      resolve(this.currentRolledNumber);
    });
  }

  async decreaseRollBy(decreaseBy) {
    this.lastRolledNumber = this.currentRolledNumber;
    this.currentRolledNumber -= decreaseBy;
    return new Promise<number>((resolve, reject) => {
      resolve(this.currentRolledNumber);
    });
  }

  getSpriteByNumber() {
    for (let i = 0; i < this.diceSprites.length; i++) {
      const diceSprite = this.diceSprites[i];
      if (i == this.currentRolledNumber - 1) {
        return diceSprite;
      }
    }
  }

  @printMethodStarted(COLORS.RED)
  async addRollAction(rollType: ROLL_TYPE) {
    this.availableRolls++;
    this.rollType = rollType;
    this.node.off(cc.Node.EventType.TOUCH_START);
    this.node.once(cc.Node.EventType.TOUCH_START, async () => {
      let player = this.node.parent.getComponent(Player);
      cc.log("player clicked on dice");
      player.rollDice(rollType, true);
    });
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.node.off(cc.Node.EventType.TOUCH_START);
    this.currentRolledNumber = 1;
  }

  start() {}

  update(dt) {
    this.node.getComponent(cc.Sprite).spriteFrame = this.diceSprites[
      this.currentRolledNumber - 1
    ];
  }
}

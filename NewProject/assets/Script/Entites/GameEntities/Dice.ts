import {
  ROLL_TYPE,
  TIME_FOR_DICE_ROLL
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

  @property
  diceId: number = 0;

  @property
  player: Player = null;

  //@printMethodStarted(COLORS.RED)
  async rollDice(rollType: ROLL_TYPE) {
    let player = this.player
    this.rollType = rollType;
    if (this.currentRolledNumber == -1) {
      this.lastRolledNumber = this.currentRolledNumber;
    }
    this.rollOver = false;

    this.doRoll();
    await this.waitForDiceRoll()
    switch (this.rollType) {
      case ROLL_TYPE.ATTACK:
        if ((this.currentRolledNumber + player.attackRollBonus) <= 6) {
          this.currentRolledNumber += player.attackRollBonus;
        } else {
          this.currentRolledNumber = 6
        }
        break;
      case ROLL_TYPE.FIRST_ATTACK:
        //add the bonus of all attacks plus the bonuses of only first attack
        if ((this.currentRolledNumber + player.attackRollBonus + player.firstAttackRollBonus) <= 6) {
          this.currentRolledNumber += player.attackRollBonus;
          this.currentRolledNumber += player.firstAttackRollBonus;
        } else {
          this.currentRolledNumber = 6
        }
        break;
      case ROLL_TYPE.EFFECT:
      case ROLL_TYPE.EFFECT_ROLL:
        if ((this.currentRolledNumber + player.nonAttackRollBonus) <= 6) {
          //add the bonus of all attacks plus the bonuses of only first attack
          this.currentRolledNumber += player.nonAttackRollBonus;
        } else {
          this.currentRolledNumber = 6;
        }
        break;
      default:
        break;
    }

    return this.currentRolledNumber;
  }

  async waitForDiceRoll(): Promise<boolean> {
    return new Promise((resolve) => {
      let check = () => {
        if (this.rollOver == true) {
          this.rollOver = false;
          resolve(true);
        } else {
          setTimeout(check, 50);
        }
      };
      check.bind(this);
      setTimeout(check, 50);
    });
  }

  activateRollAnimation() {
    this.schedule(this.diceChange, TIME_FOR_DICE_ROLL, cc.macro.REPEAT_FOREVER);
  }

  endRollAnimation() {
    this.unschedule(this.diceChange);
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
    let i = 0;
    let check = () => {
      if (i < timesToRoll) {
        setTimeout(() => {
          this.diceChange();
          i++;
          check();
        }, TIME_FOR_DICE_ROLL * 1000);
      } else {
        this.rollOver = true;
      }
    }
    check()
    // this.schedule(
    //   () => {
    //     if (rolledTimes == timesToRoll) {
    //       
    //       this.rollOver = true;
    //     } else {
    //       this.diceChange();
    //       rolledTimes++;
    //     }
    //   },
    //   TIMEFORDICEROLL,
    //   timesToRoll
    // );

  }

  disableRoll() {
    this.node.off(cc.Node.EventType.TOUCH_START);
  }

  async setRoll(diceNum: number) {
    this.lastRolledNumber = this.currentRolledNumber;
    this.currentRolledNumber = diceNum;
    return new Promise<number>((resolve) => {
      resolve(this.currentRolledNumber);
    });
  }

  async increaseRollBy(increaseBy: number) {
    this.lastRolledNumber = this.currentRolledNumber;
    this.currentRolledNumber += increaseBy;
    return new Promise<number>((resolve) => {
      resolve(this.currentRolledNumber);
    });
  }

  async decreaseRollBy(decreaseBy) {
    this.lastRolledNumber = this.currentRolledNumber;
    this.currentRolledNumber -= decreaseBy;
    return new Promise<number>((resolve) => {
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

  //@printMethodStarted(COLORS.RED)
  async addRollAction(rollType: ROLL_TYPE) {
    this.availableRolls++;
    this.rollType = rollType;
    this.node.off(cc.Node.EventType.TOUCH_START);
    this.node.once(cc.Node.EventType.TOUCH_START, async () => {
      this.player.rollAttackDice(true);
    });
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.node.off(cc.Node.EventType.TOUCH_START);
    this.currentRolledNumber = 1;
  }

  start() { }

  update(dt) {
    this.node.getComponent(cc.Sprite).spriteFrame = this.diceSprites[
      this.currentRolledNumber - 1
    ];
  }
}

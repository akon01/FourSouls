import {
  GAME_EVENTS,
  ROLL_TYPE,
  TIME_FOR_DICE_ROLL
} from "../../Constants";
import Player from "./Player";
import DecisionMarker from "../Decision Marker";
import SoundManager from "../../Managers/SoundManager";
import { whevent } from "../../../ServerClient/whevent";
import CardManager from "../../Managers/CardManager";
import AnimationManager, { ANIM_COLORS } from "../../Managers/Animation Manager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Dice extends cc.Component {
  @property
  _currentRolledNumber: number = -1;

  set currentRolledNumber(number: number) {
    this._currentRolledNumber = number
    if (this.diceSprite) {
      this.diceSprite.spriteFrame = this.diceSprites[number - 1]
    }
  }

  get currentRolledNumber() { return this._currentRolledNumber }

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

  @property({ visible: false })
  diceSprite: cc.Sprite = null;

  //@printMethodStarted(COLORS.RED)
  async rollDice(rollType: ROLL_TYPE) {
    const player = this.player
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
        if (this.currentRolledNumber + player.attackRollBonus < 1) {
          this.currentRolledNumber = 1
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
        if (this.currentRolledNumber + player.attackRollBonus + player.firstAttackRollBonus < 1) {
          this.currentRolledNumber = 1
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
        if (this.currentRolledNumber + player.nonAttackRollBonus < 1) {
          this.currentRolledNumber = 1
        }
        break;
      default:
        break;
    }
    // DecisionMarker.$.showDecision() 

    return this.currentRolledNumber;
  }

  async waitForDiceRoll(): Promise<boolean> {
    return new Promise((resolve) => {
      whevent.onOnce(GAME_EVENTS.DICE_ROLL_OVER, () => {
        this.rollOver = false;
        resolve(true);
      })
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
    const clipId = SoundManager.$.playLoopedSound(SoundManager.$.rollDice)
    const timesToRoll = Math.floor(Math.random() * 5) + 4;
    let i = 0;
    const check = () => {
      if (i < timesToRoll) {
        setTimeout(() => {
          this.diceChange();
          i++;
          check();
        }, TIME_FOR_DICE_ROLL * 1000);
      } else {
        whevent.emit(GAME_EVENTS.DICE_ROLL_OVER)
        SoundManager.$.stopLoopedSound(clipId)
        this.rollOver = true;
      }
    }
    check()
  }

  disableRoll() {
    this.node.off(cc.Node.EventType.TOUCH_END);
  }

  setRoll(diceNum: number) {
    //ONly for admin console//
    if (this.player.setDiceAdmin > 0 && this.player.setDiceAdmin < 7) {
      this.currentRolledNumber = this.player.setDiceAdmin
      return this.currentRolledNumber
    }
    //ONly for admin console//
    this.lastRolledNumber = this.currentRolledNumber;
    if (diceNum > 6) { diceNum = 6 }
    if (diceNum < 1) { diceNum = 1 }
    this.currentRolledNumber = diceNum;
    return this.currentRolledNumber
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
  addRollAction(rollType: ROLL_TYPE) {
    this.availableRolls++;
    this.rollType = rollType;
    this.node.off(cc.Node.EventType.TOUCH_END);
    AnimationManager.$.showAnimation(this.node, ANIM_COLORS.BLUE)
    this.node.once(cc.Node.EventType.TOUCH_END, async () => {
      AnimationManager.$.endAnimation(this.node)
      await this.player.rollAttackDice(true);
    });
  }

  // LIFE-CYCLE CALLBACKS:

  onLoad() {
    this.node.off(cc.Node.EventType.TOUCH_END);
    this.currentRolledNumber = 1;
  }

  changeSprite(num: number) {
    this.diceSprite.spriteFrame = this.diceSprites[num - 1]
  }

  addAnimationSprite() {
    const sprites = cc.instantiate(CardManager.$.cardSpritesPrefab)
    const cardSprite = sprites.getChildByName(`Card Sprite`);
    const glowSprite = sprites.getChildByName(`Glow Sprite`);
    cardSprite.getComponent(cc.Widget).target = this.node
    cardSprite.getComponent(cc.Widget).updateAlignment();
    glowSprite.getComponent(cc.Widget).target = this.node
    glowSprite.getComponent(cc.Widget).updateAlignment();
    cardSprite.getComponent(cc.Sprite).spriteFrame = this.node.getComponent(cc.Sprite).spriteFrame
    if (!sprites.isChildOf(this.node)) {
      this.node.addChild(sprites)
      this.diceSprite = cardSprite.getComponent(cc.Sprite)
      this.node.removeComponent(cc.Sprite)
    }
  }

  start() {
    this.addAnimationSprite()
  }

  update(dt) {
    //this.node.getComponent(cc.Sprite).spriteFrame = this.diceSprites[this.currentRolledNumber - 1];
    // if (this.currentRolledNumber != 1) {

    //   cc.log(this.node.getComponent(cc.Sprite).spriteFrame)
    // }
  }
}

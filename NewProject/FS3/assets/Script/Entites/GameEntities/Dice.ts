import { Component, error, instantiate, log, macro, Node, Sprite, SpriteFrame, SystemEventType, Widget, _decorator } from 'cc';
import { whevent } from "../../../ServerClient/whevent";
import {
      GAME_EVENTS,
      ROLL_TYPE,
      TIME_FOR_DICE_ROLL
} from "../../Constants";
import { ANIM_COLORS } from "../../Managers/AnimationManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { Player } from "./Player";
const { ccclass, property } = _decorator;


@ccclass('Dice')
export class Dice extends Component {
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

      @property([SpriteFrame])
      diceSprites: SpriteFrame[] = [];

      @property
      loadedSprites: boolean = false;

      @property
      availableRolls: number = 0;

      rollType: ROLL_TYPE | null = null;

      @property
      rollOver: boolean = false;

      @property
      diceId: number = 0;

      player: Player | null = null;

      diceSprite: Sprite | null = null;

      //@printMethodStarted(COLORS.RED)
      async rollDice(rollType: ROLL_TYPE) {
            const player = this.player!
            this.rollType = rollType;
            if (this.currentRolledNumber == -1) {
                  this.lastRolledNumber = this.currentRolledNumber;
            }
            this.rollOver = false;


            this.doRoll();
            await this.waitForDiceRoll()
            log(`wait for roll over, roled ${this.currentRolledNumber}`)
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
            // decisionMarker._dm.showDecision() 

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
            this.schedule(this.diceChange, TIME_FOR_DICE_ROLL, macro.REPEAT_FOREVER);
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

            // this.node.getComponent(Sprite).spriteFrame = this.getSpriteByNumber();
      }

      doRoll() {
            const clipId = WrapperProvider.soundManagerWrapper.out.playLoopedSound(WrapperProvider.soundManagerWrapper.out.rollDice!)
            const timesToRoll = Math.floor(Math.random() * 5) + 4;
            let i = 0;
            const check = () => {
                  if (i <= timesToRoll) {
                        setTimeout(() => {
                              this.diceChange();
                              i++;
                              check();
                        }, TIME_FOR_DICE_ROLL * 1000);
                  } else {
                        whevent.emit(GAME_EVENTS.DICE_ROLL_OVER)
                        WrapperProvider.soundManagerWrapper.out.stopLoopedSound(clipId)
                        this.rollOver = true;
                  }
            }
            check()
      }

      disableRoll() {
            this.node.off(SystemEventType.TOUCH_END);
      }

      setRoll(diceNum: number) {
            //ONly for AdminConsole//
            const player = this.player!
            if (player.setDiceAdmin > 0 && player.setDiceAdmin < 7) {
                  this.currentRolledNumber = player.setDiceAdmin
                  return this.currentRolledNumber
            }
            //ONly for AdminConsole//
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

      async decreaseRollBy(decreaseBy: number) {
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
            this.node.off(SystemEventType.TOUCH_END);
            WrapperProvider.animationManagerWrapper.out.showAnimation(this.node, ANIM_COLORS.BLUE)
            this.node.once(SystemEventType.TOUCH_END, async () => {
                  WrapperProvider.animationManagerWrapper.out.endAnimation(this.node)
                  await this.player!.rollAttackDice(true);
            });
      }

      // LIFE-CYCLE CALLBACKS:

      onLoad() {
            this.node.off(SystemEventType.TOUCH_END);
            this.currentRolledNumber = 1;
      }

      changeSprite(num: number) {
            this.diceSprite!.spriteFrame = this.diceSprites[num - 1]
      }

      addAnimationSprite() {
            const sprites = this.node.getChildByName("Sprites")
            if (!sprites) {
                  throw new Error("No Sprites Found on dice");

            }
            const cardSprite = sprites.getChildByName(`Card Sprite`)!;
            const glowSprite = sprites.getChildByName(`Glow Sprite`)!;
            const cardWidget = (cardSprite.getComponent(Widget)!);
            const cardSpriteComp = (cardSprite.getComponent(Sprite)!);
            cardSpriteComp.spriteFrame = this.node.getComponent(Sprite)!.spriteFrame
            if (!sprites.isChildOf(this.node)) {
                  try {
                        this.node.addChild(sprites)
                  } catch (errorf) {
                        error(`error Adding Sprites To Dice, ` + errorf)
                  }
                  this.node.getComponent(Sprite)!.destroy()
            }
            this.diceSprite = cardSpriteComp
            cardWidget.target = this.node
            cardWidget.updateAlignment();
            const glowWiget = glowSprite.getComponent(Widget)!;
            glowWiget.target = this.node
            glowWiget.updateAlignment();
      }

      start() {
            this.addAnimationSprite()
      }

}

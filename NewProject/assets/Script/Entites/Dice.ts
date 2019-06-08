import { ROLL_TYPE } from "../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Dice extends cc.Component {

    @property
    currentRolledNumber: number = -1;

    @property
    lastRolledNumber: number = -1;

    @property([cc.SpriteFrame])
    diceSprites: cc.SpriteFrame[] = []

    @property
    loadedSprites: boolean = false;

    @property
    availableRolls:number = 0;

    @property
    rollType:ROLL_TYPE = null;

    rollDice() {
 
        if (this.currentRolledNumber == -1) {
            this.lastRolledNumber = this.currentRolledNumber
        }
        this.schedule(()=>{
            this.currentRolledNumber = Math.floor(Math.random() * 6)+1
            this.node.getComponent(cc.Sprite).spriteFrame = this.getSpriteByNumber()
        },0.2,Math.floor(Math.random() * 5)+4)
        let eventName = ''+this.rollType
        //cc.log('rolled '+this.currentRolledNumber)
        this.node.dispatchEvent(new cc.Event.EventCustom(eventName,true))
        
    }

    setRoll(diceNum: number) {
        this.lastRolledNumber = this.currentRolledNumber;
        this.currentRolledNumber = diceNum;
    }

    increaseRollBy(increaseBy: number) {
        this.lastRolledNumber = this.currentRolledNumber;
        this.currentRolledNumber += increaseBy
    }

    decreaseRollBy(decreaseBy) {
        this.lastRolledNumber = this.currentRolledNumber;
        this.currentRolledNumber -= decreaseBy
    }

    getSpriteByNumber() {
        for (let i = 0; i < this.diceSprites.length; i++) {
            const diceSprite = this.diceSprites[i];
            if (i == this.currentRolledNumber-1) {
                return diceSprite
            }
        }
    }

    addRollAction(rollType:ROLL_TYPE){
        this.availableRolls ++;
        this.rollType = rollType;
        this.node.on(cc.Node.EventType.TOUCH_START,()=>{
      
            this.rollDice()
        })
    }


    // LIFE-CYCLE CALLBACKS:

    onLoad() {
         this.node.off(cc.Node.EventType.TOUCH_START)
    }

    start() {

    }

    update(dt) {
           
    }
}

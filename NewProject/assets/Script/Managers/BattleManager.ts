import Monster from "../Entites/CardTypes/Monster";
import TurnsManager from "./TurnsManager";
import PlayerManager from "./PlayerManager";
import MainScript from "../MainScript";
import Dice from "../Entites/Dice";
import { ROLL_TYPE } from "../Constants";


const {ccclass, property} = cc._decorator;

@ccclass
export default class BattleManager extends cc.Component {

   static currentlyAttackedMonsterNode: cc.Node = null;

   static currentlyAttackedMonster: Monster = null;

   static firstAttack:boolean =true;

    
    static declareAttackOnMonster(monsterCard:cc.Node){
        BattleManager.currentlyAttackedMonsterNode = monsterCard;
        BattleManager.currentlyAttackedMonster = monsterCard.getComponent(Monster)
        TurnsManager.currentTurn.battlePhase = true;
        //cc.log(MainScript.currentPlayerComp)
        MainScript.currentPlayerComp.dice.getComponent(Dice).addRollAction(ROLL_TYPE.FIRSTATTACK)
    }
   
    /**
     * @returns true if hit, false if miss
     * @param rollValue dice roll
     */
    static rollOnMonster(rollValue:number): boolean{
        if(this.firstAttack){
            this.firstAttack = false;
        }
        if(rollValue >= this.currentlyAttackedMonster.rollValue){
            return true
        } else return false;
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}

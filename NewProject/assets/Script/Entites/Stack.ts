import StackEffect from "./StackEffect";
import PlayerManager from "../Managers/PlayerManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Stack extends cc.Component {

    static _currentStack: StackEffect[] = []

    static _currentStackEffectResolving: StackEffect = null;

    static isInResolvePhase: boolean = false;


    static async startResponseCheck() {
        let priorityPlayer = PlayerManager.getPriorityPlayer()
        //change to return a stack effect with the (card activated,loot played,choice made ) 
        let playerReactionStackEffect: StackEffect = await priorityPlayer.getReaction()

    }

    static addToStack(stackEffect: StackEffect) {
        this._currentStack.push(stackEffect)
    }

}

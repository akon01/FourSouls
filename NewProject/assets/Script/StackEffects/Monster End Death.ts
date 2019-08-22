import { CARD_TYPE, STACK_EFFECT_TYPE } from "../Constants";
import Monster from "../Entites/CardTypes/Monster";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import PileManager from "../Managers/PileManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import ServerMonsterEndDeath from "./ServerSideStackEffects/Server Monster End Death ";
import StackEffectInterface from "./StackEffectInterface";
import { MonsterDeathVis } from "./StackEffectVisualRepresentation/Monster Death Vis";


export default class MonsterEndDeath implements StackEffectInterface {
    visualRepesentation: MonsterDeathVis;
    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.MONSTER_END_DEATH;


    monsterWhoDied: Monster;


    constructor(creatorCardId: number, monsterWhoDied: cc.Node, entityId?: number) {
        if (entityId) {
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }

        this.creatorCardId = creatorCardId;
        this.monsterWhoDied = monsterWhoDied.getComponent(Monster)
        this.visualRepesentation = new MonsterDeathVis(this.monsterWhoDied.name)
        this.visualRepesentation.stackEffectType = this.stackEffectType;

    }

    async putOnStack() {
        cc.log(`put monster end death on the stack`)
        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)

    }

    async resolve() {
        cc.log('resolve monster end death')
        let turnPlayer = PlayerManager.getPlayerById(TurnsManager.currentTurn.PlayerId).getComponent(Player)
        if (this.monsterWhoDied.souls > 0) {
            await turnPlayer.getSoulCard(this.monsterWhoDied.node, true)
        } else {
            await PileManager.addCardToPile(CARD_TYPE.MONSTER, this.monsterWhoDied.node, true)
        }
    }

    convertToServerStackEffect() {
        let serverMonsterReward = new ServerMonsterEndDeath(this)
        return serverMonsterReward
    }

}

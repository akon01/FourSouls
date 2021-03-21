import { _decorator, Component, NodePool, Node } from 'cc';
const { ccclass, property } = _decorator;

import { STACK_EFFECT_VIS_TYPE } from "../Constants";
import { StackEffectPreview } from "../StackEffects/StackEffectVisualRepresentation/StackEffectPreview";
import { StackEffectConcrete } from "../StackEffects/StackEffectConcrete";
import { StackEffectInterface } from '../StackEffects/StackEffectInterface';

@ccclass('StackEffectPreviewPool')
export class StackEffectPreviewPool extends Component {

    @property
    basicPool: NodePool = new NodePool(StackEffectPreview);

    @property
    playerPool: NodePool = new NodePool();

    @property
    monsterPool: NodePool = new NodePool();

    @property
    bossPool: NodePool = new NodePool();

    @property
    megaBossPool: NodePool = new NodePool();

    // LIFE-CYCLE CALLBACKS:

    getByStackEffect(stackEffect: StackEffectInterface) {
        switch (stackEffect.visualRepesentation.visType) {
            case STACK_EFFECT_VIS_TYPE.BASIC:
                return this.getBasic()
            case STACK_EFFECT_VIS_TYPE.BOSS_ACTION:
                return this.getBoss()

            case STACK_EFFECT_VIS_TYPE.MEGA_BOSS_ACTION:
                return this.getMegaBoss()

            case STACK_EFFECT_VIS_TYPE.MONSTER_ACTION:
                return this.getMonster()

            case STACK_EFFECT_VIS_TYPE.PLAYER_ACTION:
                return this.getPlayer()
            default:
                return null
        }
    }

    putByStackEffectPreview(stackEffectPreview: StackEffectPreview) {
        switch (stackEffectPreview.stackEffect!.visualRepesentation.visType) {
            case STACK_EFFECT_VIS_TYPE.BASIC:

                return this.addBasic(stackEffectPreview.node)
            case STACK_EFFECT_VIS_TYPE.BOSS_ACTION:
                return this.addBoss(stackEffectPreview.node)

            case STACK_EFFECT_VIS_TYPE.MEGA_BOSS_ACTION:
                return this.addMegaBoss(stackEffectPreview.node)

            case STACK_EFFECT_VIS_TYPE.MONSTER_ACTION:
                return this.addMonster(stackEffectPreview.node)

            case STACK_EFFECT_VIS_TYPE.PLAYER_ACTION:
                return this.addPlayer(stackEffectPreview.node)
            default:
                break;
        }

    }

    getBasic() {
        return this.basicPool.get()
    }

    addBasic(basic: Node) {
        this.basicPool.put(basic)
    }

    getPlayer() {
        return this.playerPool.get()
    }

    addPlayer(player: Node) {
        this.playerPool.put(player)
    }
    getBoss() {
        return this.bossPool.get()
    }

    addBoss(boss: Node) {
        this.bossPool.put(boss)
    }

    getMonster() {
        return this.monsterPool.get()
    }

    addMonster(monster: Node) {
        this.monsterPool.put(monster)
    }

    getMegaBoss() {
        return this.megaBossPool.get()
    }

    addMegaBoss(megaBoss: Node) {
        this.megaBossPool.put(megaBoss)
    }

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}

import { STACK_EFFECT_VIS_TYPE } from "../Constants";
import StackEffectPreview from "../StackEffects/StackEffectVisualRepresentation/StackEffectPreview";
import StackEffectConcrete from "../StackEffects/StackEffectConcrete";


const { ccclass, property } = cc._decorator;

@ccclass
export default class StackEffectPreviewPool extends cc.Component {

    @property
    basicPool: cc.NodePool = new cc.NodePool(StackEffectPreview);

    @property
    playerPool: cc.NodePool = new cc.NodePool();

    @property
    monsterPool: cc.NodePool = new cc.NodePool();

    @property
    bossPool: cc.NodePool = new cc.NodePool();

    @property
    megaBossPool: cc.NodePool = new cc.NodePool();

    // LIFE-CYCLE CALLBACKS:

    getByStackEffect(stackEffect: StackEffectConcrete) {
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
                break;
        }
    }

    putByStackEffectPreview(stackEffectPreview: StackEffectPreview) {
        switch (stackEffectPreview.stackEffect.visualRepesentation.visType) {
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

    addBasic(basic: cc.Node) {
        this.basicPool.put(basic)
    }

    getPlayer() {
        return this.playerPool.get()
    }

    addPlayer(player: cc.Node) {
        this.playerPool.put(player)
    }
    getBoss() {
        return this.bossPool.get()
    }

    addBoss(boss: cc.Node) {
        this.bossPool.put(boss)
    }

    getMonster() {
        return this.monsterPool.get()
    }

    addMonster(monster: cc.Node) {
        this.monsterPool.put(monster)
    }

    getMegaBoss() {
        return this.megaBossPool.get()
    }

    addMegaBoss(megaBoss: cc.Node) {
        this.megaBossPool.put(megaBoss)
    }

    // onLoad () {}

    start() {

    }

    // update (dt) {}
}

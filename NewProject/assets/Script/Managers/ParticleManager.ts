import { PARTICLE_TYPES } from "../Constants";



const { ccclass, property } = cc._decorator;

@ccclass('EffectMap')
class EffectMap {

    @property({ type: cc.Enum(PARTICLE_TYPES) })
    name: PARTICLE_TYPES = 1

    @property({ type: cc.ParticleAsset })
    effect: cc.ParticleAsset = null;

}

@ccclass
export default class ParticleManager extends cc.Component {


    @property({ type: [EffectMap], multiline: true })
    particleEffects: EffectMap[] = [];

    static activateParticleEffect(card: cc.Node, particleType: PARTICLE_TYPES) {
        let particleSys: cc.ParticleSystem = card.getComponentInChildren(cc.ParticleSystem)
        let particle = this.$.particleEffects.find(particle => particle.name == particleType)
        if (!particle) throw 'No particle found by type'

        particleSys.stopSystem()
        particleSys.file = particle.effect as unknown as string
        particleSys.resetSystem()
        // particleSys.
    }

    static disableParticleEffect(card: cc.Node, particleType: PARTICLE_TYPES) {
        let particleSys: cc.ParticleSystem = card.getComponentInChildren(cc.ParticleSystem)
        let particle = this.$.particleEffects.find(particle => particle.name == particleType)
        if (!particle) throw 'No particle found by type'
        if (particleSys.file == particle.effect as unknown as string) {
            particleSys.stopSystem()
        }
    }

    static runParticleOnce(card: cc.Node, particleType: PARTICLE_TYPES) {
        let particleSys = card.getComponentInChildren(cc.ParticleSystem)
        let particle = this.$.particleEffects.find(particle => particle.name == particleType)
        let parent = particleSys.node.parent.parent;
        let newSys = cc.instantiate(particleSys.node);
        newSys.name = particleSys.node.name + (parent.childrenCount + 1)
        particleSys = newSys.getComponent(cc.ParticleSystem)
        particleSys.autoRemoveOnFinish = true;
        particleSys.file = particle.effect as unknown as string;
        parent.addChild(newSys)
        particleSys.resetSystem()


    }

    static $: ParticleManager = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        ParticleManager.$ = this;
    }

    start() {

    }

    // update (dt) {}
}

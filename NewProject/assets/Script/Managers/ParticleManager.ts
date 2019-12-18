import { PARTICLE_TYPES } from "../Constants";
import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";
import Card from "../Entites/GameEntities/Card";
import { Server } from "net";



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

    activatedEffects: Map<cc.Node, PARTICLE_TYPES[]> = new Map();

    static activateParticleEffect(card: cc.Node, particleType: PARTICLE_TYPES, sendToServer: boolean) {

        let particleSys: cc.ParticleSystem = card.getComponentInChildren(cc.ParticleSystem)
        let particle = this.$.particleEffects.find(particle => particle.name == particleType)
        if (!particle) throw new Error('No particle found by type')

        particleSys.stopSystem()
        particleSys.file = particle.effect as unknown as string
        let activeCardEffects = this.$.activatedEffects.get(card)
        if (activeCardEffects) {
            activeCardEffects.push(particle.name)
            this.$.activatedEffects.set(card, activeCardEffects)
        } else {
            this.$.activatedEffects.set(card, [particle.name])
        }
        particleSys.resetSystem()
        if (sendToServer) {
            ServerClient.$.send(Signal.ACTIVATE_PARTICLE_EFFECT, { cardId: card.getComponent(Card)._cardId, particleType: particleType })
        }
        // particleSys.
    }

    static disableParticleEffect(card: cc.Node, particleType: PARTICLE_TYPES, sendToServer: boolean) {
        let particleSys: cc.ParticleSystem = card.getComponentInChildren(cc.ParticleSystem)
        let particle = this.$.particleEffects.find(particle => particle.name == particleType)
        if (!particle) throw new Error('No particle found by type')
        if (particleSys.file == particle.effect as unknown as string) {
            particleSys.stopSystem()
            let activeCardEffects = this.$.activatedEffects.get(card)
            activeCardEffects = activeCardEffects.filter(effect => effect != particleType)
            this.$.activatedEffects.set(card, activeCardEffects)
            const shouldRunEffects = this.$.activatedEffects.get(card);
            this.$.activatedEffects.set(card, [])
            if (sendToServer) {
                ServerClient.$.send(Signal.DISABLE_PARTICLE_EFFECT, { cardId: card.getComponent(Card)._cardId, particleType: particleType })
            }
            for (let i = 0; i < shouldRunEffects.length; i++) {
                const effect = shouldRunEffects[i];
                this.activateParticleEffect(card, effect, false)
            }
            // for (let i = 0; i < shouldRunEffects.length; i++) {
            // }
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

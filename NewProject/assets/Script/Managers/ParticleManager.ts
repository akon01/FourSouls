import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import { PARTICLE_TYPES, PARTICLE_SYS_MAX } from "../Constants";
import Card from "../Entites/GameEntities/Card";

const { ccclass, property } = cc._decorator;

@ccclass("EffectMap")
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
        if (card == undefined || card == null) {
            throw new Error(`No card to activate particle effect on`)
        }

        const particleSys: cc.ParticleSystem = card.getComponentInChildren(cc.ParticleSystem)
        const particle = this.$.particleEffects.find(particle => particle.name == particleType)
        cc.error(`activate particle with type ${particleType}`)
        cc.log(particle.effect.name)
        if (!particle) { throw new Error("No particle found by type") }

        particleSys.stopSystem()
        particleSys.file = particle.effect
        const activeCardEffects = this.$.activatedEffects.get(card)
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
        if (!card) {
            throw new Error("No Card with particle");
        }
        const particleSys: cc.ParticleSystem = card.getComponentInChildren(cc.ParticleSystem)
        const particle = this.$.particleEffects.find(particle => particle.name == particleType)
        if (!particle) { throw new Error("No particle found by type") }
        if (particleSys.file == particle.effect) {
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
        const particle = this.$.particleEffects.find(particle => particle.name == particleType)
        const parent = particleSys.node.parent.parent;
        const newSys = cc.instantiate(particleSys.node);
        newSys.name = particleSys.node.name + (parent.childrenCount + 1)
        particleSys = newSys.getComponent(cc.ParticleSystem)
        particleSys.autoRemoveOnFinish = true;
        particleSys.file = particle.effect
        parent.addChild(newSys)
        particleSys.resetSystem()

    }

    // static checkCardMask(card: cc.Node) {
    //     const cardMask = card.getComponentInChildren(cc.Mask);
    //     cc.log(`checking ${card.name} mask`)
    //     if (cardMask && !cardMask.node.active) {
    //         cardMask.node.active = true
    //         //   cardMask.enabled = true
    //         cc.log(`activated mask`)
    //     }
    // }

    static $: ParticleManager = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        ParticleManager.$ = this;
    }

    start() {

    }

    // update (dt) {}
}

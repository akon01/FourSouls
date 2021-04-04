import { AnimationClip, Component, Enum, error, instantiate, log, Node, ParticleAsset, ParticleSystem2D, _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";
import { PARTICLE_TYPES } from "../Constants";
import { Card } from "../Entites/GameEntities/Card";
import { WrapperProvider } from './WrapperProvider';
const { ccclass, property } = _decorator;



@ccclass("EffectMap")
class EffectMap {

    @property({ type: Enum(PARTICLE_TYPES) })
    name: PARTICLE_TYPES = 1

    @property({ type: ParticleAsset })
    effect: ParticleAsset | null = null;

}


@ccclass('ParticleManager')
export class ParticleManager extends Component {

    @property({ type: [EffectMap], multiline: true })
    particleEffects: EffectMap[] = [];

    @property(AnimationClip)
    glows: AnimationClip[] = []




    activatedEffects: Map<Node, PARTICLE_TYPES[]> = new Map();

    activateParticleEffect(card: Node, particleType: PARTICLE_TYPES, sendToServer: boolean) {
        if (card == undefined || card == null) {
            throw new Error(`No card to activate particle effect on`)
        }

        const particleSys: ParticleSystem2D = card.getComponentInChildren(ParticleSystem2D)!
        const particle = WrapperProvider.particleManagerWrapper.out.particleEffects.find(particle => particle.name == particleType)!
        console.error(`activate particle with type ${particleType}`)
        console.log(particle.effect!.name)
        if (!particle) { throw new Error("No particle found by type") }

        particleSys.stopSystem()
        particleSys.file = particle.effect
        const activeCardEffects = WrapperProvider.particleManagerWrapper.out.activatedEffects.get(card)
        if (activeCardEffects) {
            activeCardEffects.push(particle.name)
            WrapperProvider.particleManagerWrapper.out.activatedEffects.set(card, activeCardEffects)
        } else {
            WrapperProvider.particleManagerWrapper.out.activatedEffects.set(card, [particle.name])
        }
        particleSys.resetSystem()
        if (sendToServer) {
            WrapperProvider.serverClientWrapper.out.send(Signal.ACTIVATE_PARTICLE_EFFECT, { cardId: card.getComponent(Card)!._cardId, particleType: particleType })
        }
        // particleSys.
    }

    disableParticleEffect(card: Node, particleType: PARTICLE_TYPES, sendToServer: boolean) {
        if (!card) {
            throw new Error("No Card with particle");
        }
        const particleSys: ParticleSystem2D = card.getComponentInChildren(ParticleSystem2D)!
        const particle = WrapperProvider.particleManagerWrapper.out.particleEffects.find(particle => particle.name == particleType)
        if (!particle) { throw new Error("No particle found by type") }
        if (particleSys.file == particle.effect) {
            particleSys.stopSystem()
            let activeCardEffects = WrapperProvider.particleManagerWrapper.out.activatedEffects.get(card)!
            activeCardEffects = activeCardEffects.filter(effect => effect != particleType)
            WrapperProvider.particleManagerWrapper.out.activatedEffects.set(card, activeCardEffects)
            const shouldRunEffects = WrapperProvider.particleManagerWrapper.out.activatedEffects.get(card)!;
            WrapperProvider.particleManagerWrapper.out.activatedEffects.set(card, [])
            if (sendToServer) {
                WrapperProvider.serverClientWrapper.out.send(Signal.DISABLE_PARTICLE_EFFECT, { cardId: card.getComponent(Card)!._cardId, particleType: particleType })
            }
            for (let i = 0; i < shouldRunEffects.length; i++) {
                const effect = shouldRunEffects[i];
                this.activateParticleEffect(card, effect, false)
            }
            // for (let i = 0; i < shouldRunEffects.length; i++) {
            // }
        }

    }


    runParticleOnce(card: Node, particleType: PARTICLE_TYPES) {
        let particleSys = card.getComponentInChildren(ParticleSystem2D)!
        const particle = WrapperProvider.particleManagerWrapper.out.particleEffects.find(particle => particle.name == particleType)!
        const parent = particleSys.node.parent!.parent!;
        const newSys = instantiate(particleSys.node);
        newSys.name = particleSys.node.name + (parent.children.length + 1)
        particleSys = newSys.getComponent(ParticleSystem2D)!
        //     particleSys.autoRemoveOnFinish = true;
        particleSys.file = particle.effect
        parent.addChild(newSys)
        particleSys.resetSystem()

    }

    // checkCardMask(card: Node) {
    //     const cardMask = card.getComponentInChildren(Mask);
    //     console.log(`checking ${card.name} mask`)
    //     if (cardMask && !cardMask.node.active) {
    //         cardMask.node.active = true
    //         //   cardMask.enabled = true
    //         console.log(`activated mask`)
    //     }
    // }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    }



    // update (dt) {}
}

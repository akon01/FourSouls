import Monster from "../../Entites/CardTypes/Monster";
import Card from "../../Entites/GameEntities/Card";
import MonsterDeath from "../Monster Death";
import MonsterEndDeath from "../Monster End Death";
import MonsterRewardStackEffect from "../Monster Reward";
import StackEffectInterface from "../StackEffectInterface";
import StackEffectPreview from "./StackEffectPreview";
import CombatDamage from "../Combat Damage";
import PlayerManager from "../../Managers/PlayerManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterActionPreview extends StackEffectPreview {

    setStackEffect(stackEffect: StackEffectInterface) {
        this.stackEffect = stackEffect;
        const stackEffectVis = stackEffect.visualRepesentation
        let monster: Monster
        if (stackEffect instanceof MonsterDeath) {
            monster = stackEffect.monsterToDie
            this.node.getComponent(cc.Sprite).spriteFrame = monster.node.getComponent(Card).frontSprite
            this.flavorTextLable.string = monster.name + ` is going to die.`
        } else if (stackEffect instanceof MonsterEndDeath) {
            monster = stackEffect.monsterWhoDied
            this.node.getComponent(cc.Sprite).spriteFrame = monster.node.getComponent(Card).frontSprite
            this.flavorTextLable.string = monster.name + ` has died`
        } else if (stackEffect instanceof MonsterRewardStackEffect) {
            monster = stackEffect.monsterWithReward
            this.node.getComponent(cc.Sprite).spriteFrame = monster.node.getComponent(Card).frontSprite
            this.flavorTextLable.string = stackEffect.playerToReward.name + ` is reciving ` + stackEffect.monsterWithReward.name + ` death reward`
        } else if (stackEffect instanceof CombatDamage) {
            monster = stackEffect.entityToTakeDamageCard.getComponent(Monster)
            this.node.getComponent(cc.Sprite).spriteFrame = monster.node.getComponent(Card).frontSprite
            this.flavorTextLable.string = monster.name + ` is reciving damage from ` + PlayerManager.getPlayerByCard(stackEffect.entityToDoDamageCard).name
        }
    }


    hideExtraInfo() {
        this.flavorTextLable.node.active = false;
        this.nameLable.node.active = false;
        this.imageArea.active = false;
        this.isShowExtraInfo = false;
    }

    showExtraInfo() {
        this.flavorTextLable.node.active = true;
        this.nameLable.node.active = true;
        this.imageArea.active = true;
        this.isShowExtraInfo = true;
    }

    // showTargets() {
    //     if (this.stackEffect instanceof ActivateItem || this.stackEffect instanceof PlayLootCardStackEffect) {
    //         const effectToDo = this.stackEffect.effectToDo;
    //         if (effectToDo) {
    //             cc.log(effectToDo)
    //             const effectData = effectToDo.effectData
    //             if (effectData) {
    //                 cc.log(effectData)
    //                 const targets = effectData.effectTargets
    //                 cc.log(targets)
    //                 for (const target of targets) {
    //                     if (target.effectTargetCard) {
    //                         ParticleManager.runParticleOnce(target.effectTargetCard, PARTICLE_TYPES.ACTIVATE_EFFECT)
    //                     }

    //                 }
    //             }
    //         }
    //     }
    // }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // this.node.on(cc.Node.EventType.TOUCH_END, () => {
        //     this.showTargets()
        // }, this)
    }

    start() {

    }

    update(dt) {
        // if (this.stackEffect.visualRepesentation.hasBeenUpdated) {
        //     if (this.isShowExtraInfo) {
        //         const stackEffectVis = this.stackEffect.visualRepesentation
        //         this.node.getComponent(cc.Sprite).spriteFrame = stackEffectVis.baseSprite;
        //         this.nameLable.string = this.stackEffect.constructor.name + this.stackEffect.entityId
        //         if (stackEffectVis.flavorText != "123") {
        //             this.flavorTextLable.string = stackEffectVis.flavorText;
        //         }
        //         if (stackEffectVis.extraSprite != null) {
        //             this.imageArea.getComponent(cc.Sprite).spriteFrame = stackEffectVis.extraSprite
        //         }
        //     } else {
        //         if (this.stackEffect instanceof PlayLootCardStackEffect) {
        //             this.node.getComponent(cc.Sprite).spriteFrame = this.stackEffect.lootToPlay.getComponent(cc.Sprite).spriteFrame
        //             this.hideExtraInfo()
        //         } else if (this.stackEffect instanceof ActivateItem) {
        //             this.node.getComponent(cc.Sprite).spriteFrame = this.stackEffect.itemToActivate.getComponent(cc.Sprite).spriteFrame
        //             this.hideExtraInfo()
        //         } else if (this.stackEffect instanceof ActivatePassiveEffect) {
        //             this.node.getComponent(cc.Sprite).spriteFrame = this.stackEffect.cardWithEffect.getComponent(cc.Sprite).spriteFrame
        //         }
        //     }
        //     this.updateInfo(true)
        // }

    }

}
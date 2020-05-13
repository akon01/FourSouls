import Signal from "../../../Misc/Signal";
import ServerClient from "../../../ServerClient/ServerClient";
import Card from "../../Entites/GameEntities/Card";
import ActivateItem from "../Activate Item";
import ActivatePassiveEffect from "../Activate Passive Effect";
import PlayLootCardStackEffect from "../Play Loot Card";
import StackEffectInterface from "../StackEffectInterface";
import { ServerStackVisualisation } from "./Server Stack Vis";
import StackEffectPreview from "./StackEffectPreview";
import StartTurnLoot from "../Start Turn Loot";
import PurchaseItem from "../Purchase Item";
import PlayerDeath from "../Player Death";
import PlayerDeathPenalties from "../Player Death Penalties";
import RollDiceStackEffect from "../Roll DIce";
import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import CombatDamage from "../Combat Damage";
import DeclareAttack from "../Declare Attack";
import AttackRoll from "../Attack Roll";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerActionPreview extends StackEffectPreview {

    setStackEffect(stackEffect: StackEffectInterface) {
        this.stackEffect = stackEffect;
        const stackEffectVis = stackEffect.visualRepesentation
        if (stackEffect instanceof StartTurnLoot) {
            this.node.getComponent(cc.Sprite).spriteFrame = stackEffect.turnPlayer.character.getComponent(Card).frontSprite
            this.nameLable.string = stackEffect.turnPlayer.name
            this.flavorTextLable.string = stackEffect._lable
        } else if (stackEffect instanceof PurchaseItem) {
            this.node.getComponent(cc.Sprite).spriteFrame = stackEffect.playerWhoBuys.character.getComponent(Card).frontSprite
            this.nameLable.string = stackEffect.playerWhoBuys.name
            this.flavorTextLable.string = stackEffect._lable
        } else if (stackEffect instanceof PlayerDeath) {
            this.node.getComponent(cc.Sprite).spriteFrame = stackEffect.playerToDie.character.getComponent(Card).frontSprite
            this.nameLable.string = stackEffect.playerToDie.name
            this.flavorTextLable.string = stackEffect._lable
        } else if (stackEffect instanceof PlayerDeathPenalties) {
            this.node.getComponent(cc.Sprite).spriteFrame = stackEffect.playerToPay.character.getComponent(Card).frontSprite
            this.nameLable.string = stackEffect.playerToPay.name
            this.flavorTextLable.string = stackEffect._lable
        } else if (stackEffect instanceof RollDiceStackEffect) {
            const playerCard = CardManager.getCardById(stackEffect.creatorCardId, true);
            const player = PlayerManager.getPlayerByCard(playerCard);
            this.node.getComponent(cc.Sprite).spriteFrame = playerCard.getComponent(Card).frontSprite
            this.nameLable.string = player.name
            this.flavorTextLable.string = stackEffect._lable
        } else if (stackEffect instanceof CombatDamage) {
            this.node.getComponent(cc.Sprite).spriteFrame = stackEffect.entityToTakeDamageCard.getComponent(Card).frontSprite
            const player = PlayerManager.getPlayerByCard(stackEffect.entityToTakeDamageCard);
            this.nameLable.string = player.name
            this.flavorTextLable.string = stackEffect._lable
        } else if (stackEffect instanceof DeclareAttack) {
            this.node.getComponent(cc.Sprite).spriteFrame = stackEffect.attackingPlayer.character.getComponent(Card).frontSprite
            this.nameLable.string = stackEffect.attackingPlayer.name
            this.flavorTextLable.string = stackEffect._lable
        } else if (stackEffect instanceof AttackRoll) {
            this.node.getComponent(cc.Sprite).spriteFrame = stackEffect.rollingPlayer.character.getComponent(Card).frontSprite
            this.nameLable.string = stackEffect.rollingPlayer.name
            this.flavorTextLable.string = stackEffect._lable
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
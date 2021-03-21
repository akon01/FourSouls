import { Sprite, _decorator } from 'cc';
import { Card } from "../../Entites/GameEntities/Card";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { AttackRoll } from "../AttackRoll";
import { CombatDamage } from "../CombatDamage";
import { DeclareAttack } from "../DeclareAttack";
import { PlayerDeath } from "../PlayerDeath";
import { PlayerDeathPenalties } from "../PlayerDeathPenalties";
import { PurchaseItem } from "../PurchaseItem";
import { RollDiceStackEffect } from "../RollDIce";
import { StackEffectInterface } from "../StackEffectInterface";
import { StartTurnLoot } from "../StartTurnLoot";
import { StackEffectPreview } from "./StackEffectPreview";
const { ccclass, property } = _decorator;


@ccclass('PlayerActionPreview')
export class PlayerActionPreview extends StackEffectPreview {

    setStackEffect(stackEffect: StackEffectInterface) {
        this.stackEffect = stackEffect;
        const stackEffectVis = stackEffect.visualRepesentation
        if (stackEffect instanceof StartTurnLoot) {
            this.node.getComponent(Sprite)!.spriteFrame = stackEffect.turnPlayer.character!.getComponent(Card)!.frontSprite
            this.nameLable!.string = stackEffect.turnPlayer.name
            this.flavorTextLable!.string = stackEffect._lable
        } else if (stackEffect instanceof PurchaseItem) {
            this.node.getComponent(Sprite)!.spriteFrame = stackEffect.playerWhoBuys.character!.getComponent(Card)!.frontSprite
            this.nameLable!.string = stackEffect.playerWhoBuys.name
            this.flavorTextLable!.string = stackEffect._lable
        } else if (stackEffect instanceof PlayerDeath) {
            this.node.getComponent(Sprite)!.spriteFrame = stackEffect.playerToDie.character!.getComponent(Card)!.frontSprite
            this.nameLable!.string = stackEffect.playerToDie.name
            this.flavorTextLable!.string = stackEffect._lable
        } else if (stackEffect instanceof PlayerDeathPenalties) {
            this.node.getComponent(Sprite)!.spriteFrame = stackEffect.playerToPay.character!.getComponent(Card)!.frontSprite
            this.nameLable!.string = stackEffect.playerToPay.name
            this.flavorTextLable!.string = stackEffect._lable
        } else if (stackEffect instanceof RollDiceStackEffect) {
            const playerCard = WrapperProvider.cardManagerWrapper.out.getCardById(stackEffect.creatorCardId, true);
            const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(playerCard)!;
            this.node.getComponent(Sprite)!.spriteFrame = playerCard.getComponent(Card)!.frontSprite
            this.nameLable!.string = player.name
            this.flavorTextLable!.string = stackEffect._lable
        } else if (stackEffect instanceof CombatDamage) {
            this.node.getComponent(Sprite)!.spriteFrame = stackEffect.entityToTakeDamageCard.getComponent(Card)!.frontSprite
            const player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(stackEffect.entityToTakeDamageCard)!;
            this.nameLable!.string = player.name
            this.flavorTextLable!.string = stackEffect._lable
        } else if (stackEffect instanceof DeclareAttack) {
            this.node.getComponent(Sprite)!.spriteFrame = stackEffect.attackingPlayer.character!.getComponent(Card)!.frontSprite
            this.nameLable!.string = stackEffect.attackingPlayer.name
            this.flavorTextLable!.string = stackEffect._lable
        } else if (stackEffect instanceof AttackRoll) {
            this.node.getComponent(Sprite)!.spriteFrame = stackEffect.rollingPlayer.character!.getComponent(Card)!.frontSprite
            this.nameLable!.string = stackEffect.rollingPlayer.name
            this.flavorTextLable!.string = stackEffect._lable
        }

    }


    hideExtraInfo() {
        this.flavorTextLable!.node.active = false;
        this.nameLable!.node.active = false;
        this.imageArea!.active = false;
        this.isShowExtraInfo = false;
    }

    showExtraInfo() {
        this.flavorTextLable!.node.active = true;
        this.nameLable!.node.active = true;
        this.imageArea!.active = true;
        this.isShowExtraInfo = true;
    }

}
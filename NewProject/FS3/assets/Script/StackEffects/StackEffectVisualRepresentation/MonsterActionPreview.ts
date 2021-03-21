import { Sprite, _decorator } from 'cc';
const { ccclass, property } = _decorator;

import { Monster } from "../../Entites/CardTypes/Monster";
import { Card } from "../../Entites/GameEntities/Card";
import { MonsterDeath } from "../MonsterDeath";
import { MonsterEndDeath } from "../MonsterEndDeath";
import { MonsterRewardStackEffect } from "../MonsterReward";
import { StackEffectInterface } from "../StackEffectInterface";
import { StackEffectPreview } from "./StackEffectPreview";
import { CombatDamage } from "../CombatDamage";
import { PlayerManager } from "../../Managers/PlayerManager";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('MonsterActionPreview')
export class MonsterActionPreview extends StackEffectPreview {
    setStackEffect(stackEffect: StackEffectInterface) {
        this.stackEffect = stackEffect;
        const stackEffectVis = stackEffect.visualRepesentation
        let monster: Monster
        if (stackEffect instanceof MonsterDeath) {
            monster = stackEffect.monsterToDie
            this.node.getComponent(Sprite)!.spriteFrame = monster.node.getComponent(Card)!.frontSprite
            this.flavorTextLable!.string = monster.name + ` is going to die.`
        } else if (stackEffect instanceof MonsterEndDeath) {
            monster = stackEffect.monsterWhoDied
            this.node.getComponent(Sprite)!.spriteFrame = monster.node.getComponent(Card)!.frontSprite
            this.flavorTextLable!.string = monster.name + ` has died`
        } else if (stackEffect instanceof MonsterRewardStackEffect) {
            monster = stackEffect.monsterWithReward
            this.node.getComponent(Sprite)!.spriteFrame = monster.node.getComponent(Card)!.frontSprite
            this.flavorTextLable!.string = stackEffect.playerToReward.name + ` is reciving ` + stackEffect.monsterWithReward.name + ` death reward`
        } else if (stackEffect instanceof CombatDamage) {
            monster = stackEffect.entityToTakeDamageCard.getComponent(Monster)!
            this.node.getComponent(Sprite)!.spriteFrame = monster.node.getComponent(Card)!.frontSprite
            this.flavorTextLable!.string = monster.name + ` is reciving damage from ` + WrapperProvider.playerManagerWrapper.out.getPlayerByCard(stackEffect.entityToDoDamageCard)!.name
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

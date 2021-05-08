import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { PASSIVE_EVENTS } from "../../Constants";
import { Player } from "../../Entites/GameEntities/Player";
import { PassiveMeta } from "../../Managers/PassiveMeta";
import { PlayerManager } from "../../Managers/PlayerManager";
import { Condition } from "./Condition";
import { TurnsManager } from "../../Managers/TurnsManager";
import { Card } from "../../Entites/GameEntities/Card";
import { Monster } from "../../Entites/CardTypes/Monster";
import { CardEffect } from "../../Entites/CardEffect";
import { WrapperProvider } from '../../Managers/WrapperProvider';

@ccclass('NewActiveMonster')
export class NewActiveMonster extends Condition {
    event = PASSIVE_EVENTS.NEW_ACTIVE_MONSTER
    @property
    isOwnerTurnOnly = true;
    @property
    isOnlyForAttackableMonsters = false;
    @property
    isSpecificNewMonster = true;

    @property({
        visible: function (this: NewActiveMonster) {
            return this.isSpecificNewMonster
        }, type: Monster
    })
    specificNewMonster: Monster | null = null

    @property
    isSpecificNotNewMonster = false;

    @property({
        visible: function (this: NewActiveMonster) {
            return this.isSpecificNotNewMonster
        }, type: Monster
    })
    specificNotNewMonster: Monster | null = null

    @property
    notInConcurentData = false;

    testCondition(meta: PassiveMeta) {

        const thisCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)
        if (!meta.args) { debugger; throw new Error("No Args"); }
        const newMosnterCard = meta.args[0] as Node
        let result = true;
        const monsterComp = newMosnterCard.getComponent(Monster)!;
        if (this.isSpecificNewMonster) {
            if (this.specificNewMonster != monsterComp) {
                result = false;
            }
        }
        if (this.isSpecificNotNewMonster) {
            if (this.specificNotNewMonster == monsterComp) {
                result = false
            }
        }
        if (this.isOnlyForAttackableMonsters) {
            if (monsterComp.isNonMonster || monsterComp.isMonsterWhoCantBeAttacked) {
                result = false;
            }
        }
        if (this.notInConcurentData) {
            const concurentData = thisCard.getComponent(CardEffect)!.concurentEffectData;
            if (concurentData != null) {
                debugger
                const allTargets = concurentData.getAllTargets().nodes
                if (allTargets.indexOf(monsterComp.node) >= 0) {
                    result = false
                }
            }
        }
        if (this.isOwnerTurnOnly) {
            const cardOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(thisCard)!;
            const turnPlayer: Player = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!
            if (turnPlayer.name != cardOwner.name) {
                result = false
            }
        }
        return Promise.resolve(result);
    }
}
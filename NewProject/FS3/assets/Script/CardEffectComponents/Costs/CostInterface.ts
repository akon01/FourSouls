import { _decorator } from 'cc';
import { Effect } from '../CardEffects/Effect';
import { PreCondition } from '../PreConditions/PreCondition';
const { ccclass, property } = _decorator;

import { PreConditionInterface } from "../PreConditions/PreConditionInterface";
interface CostInterface {
    CostId: number
    // preConditionIdFinal: number
    preCondition: PreCondition | null
    testPreCondition(): boolean
    takeCost(): void;
    getThisEffect(): Effect
}

export type { CostInterface }
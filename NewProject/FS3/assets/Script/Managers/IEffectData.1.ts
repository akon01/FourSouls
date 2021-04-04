import { Node } from 'cc';
import { StackEffectInterface } from '../StackEffects/StackEffectInterface';
import { IEffectTarget } from "./IEffectTarget";

interface IEffectData {
    effectCard: Node;
    effectCardOwner: Node;
    effectCardPlayer: Node | null;
    chainEffectsData: Array<{ effectIndex: number; data: IEffectData[]; }>;
    effectTargets: IEffectTarget[];
    getAllTargets(): {
        nodes: Node[];
        stackEffects: StackEffectInterface[];
    };
}
export type { IEffectData };

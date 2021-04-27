import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

export interface IAttackableEntity {
    takeDamage(damage: number, sendToServer: boolean, damageDealer: Node, numberRolled?: number): Promise<any>
    calculateDamage(): number
    node: Node
    getCurrentHp(): number
    getRollValue(): number
    getRollBonus(): number
    _isAttacked: boolean
    getCanBeAttacked(): boolean
    _isDead: boolean
}
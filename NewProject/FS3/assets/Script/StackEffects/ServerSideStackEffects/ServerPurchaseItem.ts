import { Card } from "../../Entites/GameEntities/Card";
import { Player } from "../../Entites/GameEntities/Player";
import { WrapperProvider } from "../../Managers/WrapperProvider";
import { PurchaseItem } from "../PurchaseItem";
import { BaseServerStackEffect, ServerStackEffectInterface } from "./ServerStackEffectInterface";

export class ServerPurchaseItem extends BaseServerStackEffect {
    stackEffectType: import("../../Constants").STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean = false;
    stackEffectToLock: ServerStackEffectInterface | undefined;
    hasLockingStackEffect: boolean = false;
    hasLockingStackEffectResolved: boolean = false;
    lockingStackEffect: ServerStackEffectInterface | undefined;
    LockingResolve: any;
    lable: string;


    itemToPurchaseCardId: number
    playerWhoBuysCardId: number
    cost: number

    constructor(purchaseItemStackEffect: PurchaseItem) {
        super()
        this.entityId = purchaseItemStackEffect.entityId;
        this.creatorCardId = purchaseItemStackEffect.creatorCardId;
        this.itemToPurchaseCardId = purchaseItemStackEffect.itemToPurchase.getComponent(Card)!._cardId;
        this.playerWhoBuysCardId = purchaseItemStackEffect.playerWhoBuys.character!.getComponent(Card)!._cardId
        this.cost = 10;
        this.stackEffectType = purchaseItemStackEffect.stackEffectType;
        this.lable = purchaseItemStackEffect._lable
    }

    convertToStackEffect() {
        let purchaseItem = new PurchaseItem(this.creatorCardId, WrapperProvider.cardManagerWrapper.out.getCardById(this.itemToPurchaseCardId, true), WrapperProvider.playerManagerWrapper.out.getPlayerByCardId(this.playerWhoBuysCardId)!.getComponent(Player)!.character!.getComponent(Card)!._cardId, this.entityId, this.lable)
        return purchaseItem;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: PurchaseItem\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.cost) endString = endString + `Cost Of Item:${this.cost}\n`
        if (this.itemToPurchaseCardId) endString = endString + `Item To Buy:${WrapperProvider.cardManagerWrapper.out.getCardById(this.itemToPurchaseCardId).name}\n`
        if (this.playerWhoBuysCardId) endString = endString + `Player Who Buys:${WrapperProvider.cardManagerWrapper.out.getCardById(this.playerWhoBuysCardId).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }


}

import Card from "../../Entites/GameEntities/Card";
import Player from "../../Entites/GameEntities/Player";
import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import PurchaseItem from "../Purchase Item";
import ServerStackEffectInterface from "./ServerStackEffectInterface";


export default class ServerPurchaseItem implements ServerStackEffectInterface {
    stackEffectType: import("../../Constants").STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: ServerStackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface;
    LockingResolve: any;
    lable: string;


    itemToPurchaseCardId: number
    playerWhoBuysCardId: number
    cost: number

    constructor(purchaseItemStackEffect: PurchaseItem) {
        this.entityId = purchaseItemStackEffect.entityId;
        this.creatorCardId = purchaseItemStackEffect.creatorCardId;
        this.itemToPurchaseCardId = purchaseItemStackEffect.itemToPurchase.getComponent(Card)._cardId;
        this.playerWhoBuysCardId = purchaseItemStackEffect.playerWhoBuys.character.getComponent(Card)._cardId
        this.cost = 10;
        this.stackEffectType = purchaseItemStackEffect.stackEffectType;
        this.lable = purchaseItemStackEffect._lable
    }

    convertToStackEffect() {
        let purchaseItem = new PurchaseItem(this.creatorCardId, CardManager.getCardById(this.itemToPurchaseCardId, true), PlayerManager.getPlayerByCardId(this.playerWhoBuysCardId).getComponent(Player).character.getComponent(Card)._cardId, this.entityId, this.lable)
        return purchaseItem;
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Purchase Item\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.cost) endString = endString + `Cost Of Item:${this.cost}\n`
        if (this.itemToPurchaseCardId) endString = endString + `Item To Buy:${CardManager.getCardById(this.itemToPurchaseCardId).name}\n`
        if (this.playerWhoBuysCardId) endString = endString + `Player Who Buys:${CardManager.getCardById(this.playerWhoBuysCardId).name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }


}

import StackEffectInterface from "../StackEffectInterface";
import Stack from "../../Entites/Stack";
import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import { ROLL_TYPE } from "../../Constants";
import ServerRollDiceStackEffect from "./Server Roll DIce";
import Player from "../../Entites/GameEntities/Player";
import PurchaseItem from "../Purchase Item";
import Card from "../../Entites/GameEntities/Card";
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
    }

    convertToStackEffect() {
        let purchaseItem = new PurchaseItem(this.creatorCardId, CardManager.getCardById(this.itemToPurchaseCardId, true), PlayerManager.getPlayerByCardId(this.playerWhoBuysCardId).getComponent(Player).character.getComponent(Card)._cardId)
        return purchaseItem;
    }


}

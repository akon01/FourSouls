import { Node } from 'cc';
import { PASSIVE_EVENTS, STACK_EFFECT_TYPE } from "../Constants";
import { Player } from "../Entites/GameEntities/Player";
import { PassiveMeta } from "../Managers/PassiveMeta";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { ServerPurchaseItem } from "./ServerSideStackEffects/ServerPurchaseItem";
import { StackEffectConcrete } from "./StackEffectConcrete";
import { StackEffectInterface } from "./StackEffectInterface";
import { PurchaseItemVis } from "./StackEffectVisualRepresentation/PurchaseItemVis";

export class PurchaseItem extends StackEffectConcrete {
    visualRepesentation: PurchaseItemVis
    name = `Player PurchaseItem`
    entityId!: number;
    creatorCardId!: number;
    isLockingStackEffect!: boolean;
    stackEffectToLock!: StackEffectInterface;
    hasLockingStackEffect!: boolean;
    hasLockingStackEffectResolved!: boolean;
    lockingStackEffect!: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.PURCHASE_ITEM;
    _lable!: string;

    isToBeFizzled = false;

    creationTurnId!: number;

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
        if (!(WrapperProvider.storeWrapper.out.getStoreCards()!.indexOf(this.itemToPurchase) >= 0)) {
            this.isToBeFizzled = true
            return true
        }
        return false
    }

    nonOriginal = false;

    itemToPurchase: Node
    playerWhoBuys: Player
    cost: number

    constructor(creatorCardId: number, itemToPurchase: Node, playerWhoBuysId: number, entityId?: number, lable?: string) {
        super(creatorCardId, entityId)


        this.itemToPurchase = itemToPurchase;
        this.playerWhoBuys = WrapperProvider.playerManagerWrapper.out.getPlayerById(playerWhoBuysId)!
        if (WrapperProvider.storeWrapper.out.getStoreCards().indexOf(itemToPurchase) >= 0) {
            this.cost = this.playerWhoBuys.getStoreCost()
        } else { this.cost = WrapperProvider.storeWrapper.out.topCardCost }
        this.visualRepesentation = new PurchaseItemVis(this.itemToPurchase, this.playerWhoBuys, this.cost)
        if (lable) {
            this.setLable(lable, false)
        } else {
            this.setLable(`Player ${playerWhoBuysId} Is About To Buy ${itemToPurchase.name} For ${this.cost}`, false)
        }
    }

    async putOnStack() {
        const turnPlayer = WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!
        turnPlayer.givePriority(true)
        //add Passive Check for buying (maybe from shop or not)
    }

    async resolve() {
        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_BUY_ITEM, [-this.cost, this.itemToPurchase], null, this.playerWhoBuys.node, this.entityId)

        const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta)

        if (!afterPassiveMeta.args) { debugger; throw new Error("No Args Found!"); }

        passiveMeta.args = afterPassiveMeta.args;
        this.itemToPurchase = passiveMeta.args[1]
        this.cost = passiveMeta.args[0]

        if (this.playerWhoBuys.coins >= this.cost) {
            this.setLable(`Player ${this.playerWhoBuys.playerId} Has Bought ${this.itemToPurchase.name} For ${Math.abs(this.cost)} cents`, true)
            await this.playerWhoBuys.changeMoney(this.cost, true)
            await WrapperProvider.storeWrapper.out.removeFromStore(this.itemToPurchase, true)
            await this.playerWhoBuys.addItem(this.itemToPurchase, true, false)
            WrapperProvider.animationManagerWrapper.out.endAnimation(this.itemToPurchase)
            this.playerWhoBuys.buyPlays -= 1;

            await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)

        } else {
            WrapperProvider.announcementLableWrapper.out.showAnnouncement(`Not Enought Money`, 3, true)
            //this.setLable(`Player ${this.playerWhoBuys.playerId} dont have enough money`,true)
        }
    }

    convertToServerStackEffect() {
        const serverPurchaseItem = new ServerPurchaseItem(this)
        return serverPurchaseItem
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: PurchaseItem\nCreator Card: ${WrapperProvider.cardManagerWrapper.out.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.cost) { endString = endString + `Cost Of Item:${this.cost}\n` }
        if (this.itemToPurchase) { endString = endString + `Item To Buy:${this.itemToPurchase.name}\n` }
        if (this.playerWhoBuys) { endString = endString + `Player Who Buys:${this.playerWhoBuys.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}

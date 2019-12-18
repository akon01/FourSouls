import StackEffectInterface from "./StackEffectInterface";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import PlayerManager from "../Managers/PlayerManager";
import { ROLL_TYPE, STACK_EFFECT_TYPE, PASSIVE_EVENTS, GAME_EVENTS } from "../Constants";
import ServerRollDiceStackEffect from "./ServerSideStackEffects/Server Roll DIce";
import Player from "../Entites/GameEntities/Player";
import ServerPurchaseItem from "./ServerSideStackEffects/Server Purchase Item";
import TurnsManager from "../Managers/TurnsManager";
import { PurchaseItemVis } from "./StackEffectVisualRepresentation/Purchase Item Vis";
import Store from "../Entites/GameEntities/Store";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";


export default class PurchaseItem implements StackEffectInterface {

    visualRepesentation: PurchaseItemVis
    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: StackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: StackEffectInterface;
    LockingResolve: any;
    stackEffectType: STACK_EFFECT_TYPE = STACK_EFFECT_TYPE.PURCHASE_ITEM;
    _lable: string;

    set lable(text: string) {
        this._lable = text
        if (!this.nonOriginal) whevent.emit(GAME_EVENTS.LABLE_CHANGE)
    }

    isToBeFizzled: boolean = false;

    creationTurnId: number


    checkForFizzle() {
        if (this.creationTurnId != TurnsManager.currentTurn.turnId) return true
        if (this.isToBeFizzled) return true
        if (!Store.storeCards.includes(this.itemToPurchase)) {
            this.isToBeFizzled = true
            return true
        }
        return false
    }

    nonOriginal: boolean = false;


    itemToPurchase: cc.Node
    playerWhoBuys: Player
    cost: number

    constructor(creatorCardId: number, itemToPurchase: cc.Node, playerWhoBuysId: number, entityId?: number) {
        if (entityId) {
            this.nonOriginal = true
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }

        this.creatorCardId = creatorCardId;
        this.creationTurnId = TurnsManager.currentTurn.turnId;
        this.itemToPurchase = itemToPurchase;
        this.playerWhoBuys = PlayerManager.getPlayerById(playerWhoBuysId)
        if (Store.storeCards.includes(itemToPurchase)) {
            this.cost = Store.storeCardsCost
        } else this.cost = Store.topCardCost
        this.visualRepesentation = new PurchaseItemVis(this.itemToPurchase, this.playerWhoBuys, this.cost)
        this.lable = `Player ${playerWhoBuysId} is about to buy ${itemToPurchase.name} for ${this.cost}`
    }

    async putOnStack() {
        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
        //add Passive Check for buying (maybe from shop or not)
    }

    async resolve() {
        let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_BUY_ITEM, [-this.cost, this.itemToPurchase], null, this.playerWhoBuys.node, this.entityId)

        let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        cc.log(afterPassiveMeta)
        passiveMeta.args = afterPassiveMeta.args;

        // if (this.playerWhoBuys.coins >= this.cost) {
        await this.playerWhoBuys.changeMoney(passiveMeta.args[0], true)
        await Store.$.removeFromStore(passiveMeta.args[1], true)
        await this.playerWhoBuys.addItem(passiveMeta.args[1], true, false)
        TurnsManager.currentTurn.buyPlays -= 1;

        //  } else {
        //    cc.log(`not enought money`)
        //this.lable = `Player ${this.playerWhoBuys.playerId} dont have enough money`
        // }
    }

    convertToServerStackEffect() {
        let serverPurchaseItem = new ServerPurchaseItem(this)
        return serverPurchaseItem
    }


    toString() {
        let endString = `id:${this.entityId}\ntype: Purchase Item\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) endString = endString + `Lock Result: ${this.LockingResolve}\n`
        if (this.cost) endString = endString + `Cost Of Item:${this.cost}\n`
        if (this.itemToPurchase) endString = endString + `Item To Buy:${this.itemToPurchase.name}\n`
        if (this.playerWhoBuys) endString = endString + `Player Who Buys:${this.playerWhoBuys.name}\n`
        if (this.stackEffectToLock) endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n`
        return endString
    }

}

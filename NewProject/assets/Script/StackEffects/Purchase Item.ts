import { GAME_EVENTS, PASSIVE_EVENTS, ROLL_TYPE, STACK_EFFECT_TYPE } from "../Constants";
import Player from "../Entites/GameEntities/Player";
import Store from "../Entites/GameEntities/Store";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import PassiveManager, { PassiveMeta } from "../Managers/PassiveManager";
import PlayerManager from "../Managers/PlayerManager";
import TurnsManager from "../Managers/TurnsManager";
import ServerPurchaseItem from "./ServerSideStackEffects/Server Purchase Item";
import ServerRollDiceStackEffect from "./ServerSideStackEffects/Server Roll DIce";
import StackEffectConcrete from "./StackEffectConcrete";
import StackEffectInterface from "./StackEffectInterface";
import { PurchaseItemVis } from "./StackEffectVisualRepresentation/Purchase Item Vis";

export default class PurchaseItem extends StackEffectConcrete {

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
        if (!this.nonOriginal) { whevent.emit(GAME_EVENTS.LABLE_CHANGE) }
    }

    isToBeFizzled: boolean = false;

    creationTurnId: number

    checkForFizzle() {
        if (super.checkForFizzle()) {
            this.isToBeFizzled = true
            return true
        }
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
        super(creatorCardId, entityId)


        this.itemToPurchase = itemToPurchase;
        this.playerWhoBuys = PlayerManager.getPlayerById(playerWhoBuysId)
        if (Store.storeCards.includes(itemToPurchase)) {
            this.cost = this.playerWhoBuys.getStoreCost()
        } else { this.cost = Store.topCardCost }
        this.visualRepesentation = new PurchaseItemVis(this.itemToPurchase, this.playerWhoBuys, this.cost)
        this.lable = `Player ${playerWhoBuysId} is about to buy ${itemToPurchase.name} for ${this.cost}`
    }

    async putOnStack() {
        const turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
        //add Passive Check for buying (maybe from shop or not)
    }

    async resolve() {
        const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_BUY_ITEM, [-this.cost, this.itemToPurchase], null, this.playerWhoBuys.node, this.entityId)

        const afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        cc.log(afterPassiveMeta)
        passiveMeta.args = afterPassiveMeta.args;

        if (this.playerWhoBuys.coins >= this.cost) {
            await this.playerWhoBuys.changeMoney(passiveMeta.args[0], true)
            await Store.$.removeFromStore(passiveMeta.args[1], true)
            await this.playerWhoBuys.addItem(passiveMeta.args[1], true, false)
            TurnsManager.currentTurn.buyPlays -= 1;

        } else {
            cc.log(`not enought money`)
            //this.lable = `Player ${this.playerWhoBuys.playerId} dont have enough money`
        }
    }

    convertToServerStackEffect() {
        const serverPurchaseItem = new ServerPurchaseItem(this)
        return serverPurchaseItem
    }

    toString() {
        let endString = `id:${this.entityId}\ntype: Purchase Item\nCreator Card: ${CardManager.getCardById(this.creatorCardId).name}\n`
        if (this.LockingResolve) { endString = endString + `Lock Result: ${this.LockingResolve}\n` }
        if (this.cost) { endString = endString + `Cost Of Item:${this.cost}\n` }
        if (this.itemToPurchase) { endString = endString + `Item To Buy:${this.itemToPurchase.name}\n` }
        if (this.playerWhoBuys) { endString = endString + `Player Who Buys:${this.playerWhoBuys.name}\n` }
        if (this.stackEffectToLock) { endString = endString + `Stack Effect To Lock:${this.stackEffectToLock}\n` }
        return endString
    }

}

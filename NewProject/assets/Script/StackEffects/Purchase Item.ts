import StackEffectInterface from "./StackEffectInterface";
import Stack from "../Entites/Stack";
import CardManager from "../Managers/CardManager";
import PlayerManager from "../Managers/PlayerManager";
import { ROLL_TYPE, STACK_EFFECT_TYPE, PASSIVE_EVENTS } from "../Constants";
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

    itemToPurchase: cc.Node
    playerWhoBuys: Player
    cost: number

    constructor(creatorCardId: number, itemToPurchase: cc.Node, playerWhoBuysId: number, entityId?: number) {
        if (entityId) {
            this.entityId = entityId
        } else {
            this.entityId = Stack.getNextStackEffectId()
        }

        this.creatorCardId = creatorCardId;
        this.itemToPurchase = itemToPurchase;
        this.playerWhoBuys = PlayerManager.getPlayerById(playerWhoBuysId).getComponent(Player)
        if (Store.storeCards.includes(itemToPurchase)) {
            this.cost = Store.storeCardsCost
        } else this.cost = Store.topCardCost
        this.visualRepesentation = new PurchaseItemVis(this.itemToPurchase, this.playerWhoBuys, this.cost)
    }

    async putOnStack() {
        cc.log(`player ${this.playerWhoBuys.playerId} has put buy item ${this.itemToPurchase.name} on the stack`)
        let turnPlayer = TurnsManager.currentTurn.getTurnPlayer()
        turnPlayer.givePriority(true)
        //add Passive Check for buying (maybe from shop or not)
    }

    async resolve() {
        cc.log('resolve purchase item')


        let passiveMeta = new PassiveMeta(PASSIVE_EVENTS.PLAYER_BUY_ITEM, [-this.cost, this.itemToPurchase], null, this.playerWhoBuys.node)

        let afterPassiveMeta = await PassiveManager.checkB4Passives(passiveMeta)
        cc.log(afterPassiveMeta)
        passiveMeta.args = afterPassiveMeta.args;

        // if (this.playerWhoBuys.coins >= this.cost) {
        await this.playerWhoBuys.changeMoney(passiveMeta.args[0], true)
        //  await CardManager.moveCardTo(this.itemToPurchase, this.playerWhoBuys.hand.node, true)
        Store.$.buyItemFromShop(passiveMeta.args[1], true)
        await this.playerWhoBuys.addItem(passiveMeta.args[1], true, false)
        TurnsManager.currentTurn.buyPlays -= 1;
        //  } else {
        //    cc.log(`not enought money`)
        // }
    }

    convertToServerStackEffect() {
        let serverPurchaseItem = new ServerPurchaseItem(this)
        return serverPurchaseItem
    }

}

import { _decorator, Enum, Node, log } from 'cc';
const { ccclass, property } = _decorator;

import { CHOOSE_CARD_TYPE, COLLECTORTYPE } from "../../Constants";
import { Card } from "../../Entites/GameEntities/Card";
import { Player } from "../../Entites/GameEntities/Player";
import { EffectTarget } from "../../Managers/EffectTarget";
import { PlayerManager } from "../../Managers/PlayerManager";
import { DataCollector } from "./DataCollector";
import { Item } from "../../Entites/CardTypes/Item";
import { CardSet } from "../../Entites/CardSet";
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { EffectTargetFactory } from '../../Managers/EffectTargetFactory';
enum CARD_PLAYER_ITEM_TYPE {
    MY_ITEMS,
    MY_CHARACTER,
    MY_ACTIVES,
    MY_PAID,
    MY_PASSIVES
}

@ccclass('CardPlayerItems')
export class CardPlayerItems extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'CardPlayerItems';
    @property({
        type: Enum(CARD_PLAYER_ITEM_TYPE), visible: function (this: CardPlayerItems) {
            return !this.isMultiType
        }
    })
    itemType: CARD_PLAYER_ITEM_TYPE = CARD_PLAYER_ITEM_TYPE.MY_ITEMS
    @property
    isFilterEternal: boolean = false;
    @property
    isMultiType: boolean = false
    @property({
        type: [Enum(CARD_PLAYER_ITEM_TYPE)], visible: function (this: CardPlayerItems) {
            return this.isMultiType
        }
    })
    itemTypes: CARD_PLAYER_ITEM_TYPE[] = []
    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:node of the player who played the card}
     */
    collectData(data: any) {
        const player = WrapperProvider.playerManagerWrapper.out.getPlayerById(data.cardPlayerId)!
        let cards: CardSet = new CardSet()
        if (this.isMultiType) {
            for (const type of this.itemTypes) {
                const typeCards = this.getCards(player, type);
                for (const card of typeCards) {
                    cards.push(card)
                }
            }
        } else {
            const typeCards = this.getCards(player, this.itemType)
            for (const card of typeCards) {
                cards.push(card)
            }
        }
        if (this.isFilterEternal) {
            cards.set(cards.filter(card => !card.getComponent(Item)!.eternal))
        }
        console.log(`card player items:`, cards.map(c => c.name))
        return cards.map(card => WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(card))

    }
    getCards(player: Player, itemType: CARD_PLAYER_ITEM_TYPE) {
        let cards: Node[] = []
        switch (itemType) {
            case CARD_PLAYER_ITEM_TYPE.MY_ITEMS:
                cards = cards.concat(player.getActiveItems(), player.getPassiveItems(), player.getPaidItems())
                break;
            case CARD_PLAYER_ITEM_TYPE.MY_CHARACTER:
                cards.push(player.character!)
                break;
            case CARD_PLAYER_ITEM_TYPE.MY_ACTIVES:
                cards = player.getActiveItems()
                break;
            case CARD_PLAYER_ITEM_TYPE.MY_PASSIVES:
                cards = player.getPassiveItems()
                break;
            case CARD_PLAYER_ITEM_TYPE.MY_PAID:
                cards = player.getPaidItems()
                break;
            default:
                break;
        }
        return cards
    }
}

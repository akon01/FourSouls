
import { COLLECTORTYPE, CHOOSE_CARD_TYPE } from "../../Constants";
import PlayerManager from "../../Managers/PlayerManager";
import DataCollector from "./DataCollector";
import Player from "../../Entites/GameEntities/Player";
import Card from "../../Entites/GameEntities/Card";
import Item from "../../Entites/CardTypes/Item";
import { EffectTarget } from "../../Managers/DataInterpreter";



const { ccclass, property } = cc._decorator;

@ccclass
export default class CardPlayerItems extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = 'CardPlayerItems';

    @property({ type: cc.Enum(CHOOSE_CARD_TYPE) })
    ItemsToGet: CHOOSE_CARD_TYPE = CHOOSE_CARD_TYPE.ALL_PLAYERS_ACTIVATED_ITEMS

    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data) {
        let player = PlayerManager.getPlayerById(data.cardPlayerId).getComponent(Player)
        let cards: cc.Node[] = []
        switch (this.ItemsToGet) {
            case CHOOSE_CARD_TYPE.PLAYER_ITEMS:
                cards = cards.concat(player.activeItems, player.passiveItems)
                break;
            // case CHOOSE_TYPE.PLAYERNONACTIVATEDITEMS:
            // cards = cards.concat(player.activeItems.filter((item)=>!item.getComponent(Item).activated))
            // break;
            default:
                break;
        }
        let endData = { cardsIds: cards.map((card) => card.getComponent(Card)._cardId) }
        let targets = cards.map(card => new EffectTarget(card))
        return targets
    }

}

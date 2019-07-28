
import { COLLECTORTYPE, CHOOSE_TYPE } from "../../Constants";
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

    @property({ type: cc.Enum(CHOOSE_TYPE) })
    ItemsToGet: CHOOSE_TYPE = CHOOSE_TYPE.ALLPLAYERSACTIVATEDITEMS

    /**
     * 
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data) {
        let player = PlayerManager.getPlayerById(data.cardPlayerId).getComponent(Player)
        let cards: cc.Node[] = []
        switch (this.ItemsToGet) {
            case CHOOSE_TYPE.PLAYERITEMS:
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

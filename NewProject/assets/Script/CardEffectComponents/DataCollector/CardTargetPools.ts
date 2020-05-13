
import { CARD_POOLS, COLLECTORTYPE } from "../../Constants";
import Player from "../../Entites/GameEntities/Player";
import Store from "../../Entites/GameEntities/Store";
import MonsterField from "../../Entites/MonsterField";
import BattleManager from "../../Managers/BattleManager";
import { EffectTarget } from "../../Managers/DataInterpreter";
import PlayerManager from "../../Managers/PlayerManager";
import TurnsManager from "../../Managers/TurnsManager";
import DataCollector from "./DataCollector";
import CardManager from "../../Managers/CardManager";
import Deck from "../../Entites/GameEntities/Deck";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardTargetPools extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = "CardTargetPools";

    @property({ type: cc.Enum(CARD_POOLS) })
    targetPool: CARD_POOLS = 1;

    /**
     *
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data) {
        let players: cc.Node[] = []
        switch (this.targetPool) {
            case CARD_POOLS.ACTIVE_MONSTERS:
                return MonsterField.activeMonsters.map(monster => new EffectTarget(monster))
            case CARD_POOLS.ACTIVE_MONSTERS_NOT_ATTACKED:
                return MonsterField.activeMonsters.map(monster => new EffectTarget(monster)).filter(monster => monster.effectTargetCard != BattleManager.currentlyAttackedMonsterNode)
            case CARD_POOLS.YOUR_HAND:
                return PlayerManager.mePlayer.getComponent(Player).handCards.map(card => new EffectTarget(card))
            case CARD_POOLS.YOUR_CHARACTER:
                return new EffectTarget(PlayerManager.mePlayer.getComponent(Player).character)
            case CARD_POOLS.ALL_PLAYERS:
                return PlayerManager.players.map(player => new EffectTarget(player.getComponent(Player).character))
            case CARD_POOLS.OTHER_PLAYERS:
                players = PlayerManager.players.filter(player => {
                    if (player.uuid != PlayerManager.mePlayer.uuid) {
                        return true
                    }
                })
                return players.map(player => new EffectTarget(player.getComponent(Player).character))
            case CARD_POOLS.PLAYERS_EXCEPT_ATTAKING:
                players = PlayerManager.players
                if (TurnsManager.currentTurn.battlePhase) { players = players.filter(player => player != TurnsManager.currentTurn.getTurnPlayer().node) }
                return players.map(player => new EffectTarget(player.getComponent(Player).character))
            case CARD_POOLS.STORE_CARDS:
                return Store.storeCards
            case CARD_POOLS.TOP_OF_DECKS:
                let cards = [CardManager.treasureDeck.getComponent(Deck)._cards[CardManager.treasureDeck.getComponent(Deck)._cards.length - 1],
                CardManager.monsterDeck.getComponent(Deck)._cards.getCard(CardManager.monsterDeck.getComponent(Deck)._cards.length - 1),
                CardManager.lootDeck.getComponent(Deck)._cards.getCard(CardManager.lootDeck.getComponent(Deck)._cards.length - 1)
                ]
                return cards.map(card => new EffectTarget(card))
            default:
                break;
        }

    }

}

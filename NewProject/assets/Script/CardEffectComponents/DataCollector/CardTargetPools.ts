import { CARD_POOLS, COLLECTORTYPE } from "../../Constants";
import Item from "../../Entites/CardTypes/Item";
import Card from "../../Entites/GameEntities/Card";
import Deck from "../../Entites/GameEntities/Deck";
import Player from "../../Entites/GameEntities/Player";
import Store from "../../Entites/GameEntities/Store";
import MonsterField from "../../Entites/MonsterField";
import BattleManager from "../../Managers/BattleManager";
import CardManager from "../../Managers/CardManager";
import { EffectTarget } from "../../Managers/DataInterpreter";
import PileManager from "../../Managers/PileManager";
import PlayerManager from "../../Managers/PlayerManager";
import TurnsManager from "../../Managers/TurnsManager";
import DataCollector from "./DataCollector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardTargetPools extends DataCollector {
    type = COLLECTORTYPE.AUTO;
    collectorName = "CardTargetPools";

    @property({ type: cc.Enum(CARD_POOLS) })
    targetPool: CARD_POOLS = 1;

    @property(cc.Node)
    exceptCard: cc.Node = null

    /**
     *
     * @param data cardPlayerId:Player who played the card
     * @returns {target:cc.node of the player who played the card}
     */
    collectData(data) {
        const result = this.GetByPool(data)
        if (result == null) {
            return result;
        }
        if (this.exceptCard != null) {
            if (result instanceof EffectTarget) {
                if (result.effectTargetCard == this.exceptCard) {
                    return null
                } else {
                    return result
                }
            } else if (Array.isArray(result)) {
                if (result[0] instanceof EffectTarget) {
                    return (result as EffectTarget[]).filter(r => r.effectTargetCard != this.exceptCard)
                } else {
                    return (result as cc.Node[]).filter(r => r != this.exceptCard)
                }
            }
        } else {
            return result;
        }
    }

    GetByPool(data): EffectTarget[] | EffectTarget | cc.Node[] {
        let players: cc.Node[] = []
        let playerComps: Player[]
        let myId: number = 0
        const treasureDeck = CardManager.treasureDeck.getComponent(Deck);
        const monsterDeck = CardManager.monsterDeck.getComponent(Deck)
        const lootDeck = CardManager.lootDeck.getComponent(Deck)
        const mePlayer = PlayerManager.mePlayer.getComponent(Player);
        switch (this.targetPool) {
            case CARD_POOLS.ACTIVE_MONSTERS:
                return MonsterField.getActiveMonsters().map(monster => new EffectTarget(monster))
            case CARD_POOLS.ACTIVE_MONSTERS_NOT_ATTACKED:
                return MonsterField.getActiveMonsters().map(monster => new EffectTarget(monster)).filter(monster => monster.effectTargetCard != BattleManager.currentlyAttackedMonsterNode)
            case CARD_POOLS.YOUR_HAND:
                return mePlayer.getHandCards().map(card => new EffectTarget(card))
            case CARD_POOLS.YOUR_ACTIVES:
                return mePlayer.getActiveItems().map(card => new EffectTarget(card))
            case CARD_POOLS.YOUR_ACTIVES_AND_PAID:
                return mePlayer.getActiveItems().concat(mePlayer.getPaidItems()).map(card => new EffectTarget(card))
            case CARD_POOLS.YOUR_PASSIVES:
                return mePlayer.getPassiveItems().map(card => new EffectTarget(card))
            case CARD_POOLS.YOUR_CHARACTER:
                return new EffectTarget(mePlayer.character)
            case CARD_POOLS.ALL_PLAYERS:
                const turnPlayerId = TurnsManager.getCurrentTurn().PlayerId
                return PlayerManager.getPlayersSortedByTurnPlayer().map(player => new EffectTarget(player.character))
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
                return Store.getStoreCards()
            case CARD_POOLS.TOP_OF_DECKS:

                const cards: cc.Node[] = [treasureDeck.getCards()[treasureDeck.getCardsLength() - 1],
                monsterDeck.getCards()[monsterDeck.getCardsLength() - 1],
                lootDeck.getCards()[lootDeck.getCardsLength() - 1]
                ]
                return cards.map(card => new EffectTarget(card))
            case CARD_POOLS.PLAYERS_SOULS:
                return PlayerManager.players.map(player => player.getComponent(Player).getSoulCards()).map(c => new EffectTarget(c))
            case CARD_POOLS.DISCARD_PILES:
                return PileManager.getTopCardOfPiles().map(c => new EffectTarget(c))
            case CARD_POOLS.IN_DECK_GUPPY_ITEMS:
                return treasureDeck.getCards().filter(e => e.getComponent(Item).isGuppyItem).map(c => new EffectTarget(c))
            case CARD_POOLS.PLAYER_TO_YOUR_LEFT:
                myId = mePlayer.playerId
                if (myId == PlayerManager.players.length) {
                    return new EffectTarget(PlayerManager.players[0].getComponent(Player).character)
                }
                return new EffectTarget(PlayerManager.players[myId].getComponent(Player).character)
            case CARD_POOLS.PLAYER_TO_YOUR_RIGHT:
                myId = mePlayer.playerId
                if (myId == 1) {
                    return new EffectTarget(PlayerManager.players[PlayerManager.players.length - 1].getComponent(Player).character)
                }
                return new EffectTarget(PlayerManager.players[myId - 1 - 1].getComponent(Player).character)
            case CARD_POOLS.RANDOM_OTHER_PLAYER_LOOT_NOT_BEING_PLAYED:
                playerComps = PlayerManager.players.filter(player => {
                    if (player.uuid != PlayerManager.mePlayer.uuid) {
                        return true
                    }
                }).map(p => p.getComponent(Player))
                const handCards: cc.Node[] = []
                playerComps.forEach(player => {
                    player.getHandCards().filter(c => !c.getComponent(Card).isGoingToBePlayed).forEach(card => {
                        handCards.push(card)
                    })
                })
                const rand = Math.floor(Math.random() * handCards.length)
                return new EffectTarget(handCards[rand])
            default:
                break;
        }

    }

}


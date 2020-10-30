import { CARD_POOLS, COLLECTORTYPE } from "../../Constants";
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
        }
    }

    GetByPool(data): EffectTarget[] | EffectTarget | cc.Node[] {
        let players: cc.Node[] = []
        switch (this.targetPool) {
            case CARD_POOLS.ACTIVE_MONSTERS:
                return MonsterField.activeMonsters.map(monster => new EffectTarget(monster))
            case CARD_POOLS.ACTIVE_MONSTERS_NOT_ATTACKED:
                return MonsterField.activeMonsters.map(monster => new EffectTarget(monster)).filter(monster => monster.effectTargetCard != BattleManager.currentlyAttackedMonsterNode)
            case CARD_POOLS.YOUR_HAND:
                return PlayerManager.mePlayer.getComponent(Player).handCards.map(card => new EffectTarget(card))
            case CARD_POOLS.YOUR_ACTIVES:
                return PlayerManager.mePlayer.getComponent(Player).activeItems.map(card => new EffectTarget(card))
            case CARD_POOLS.YOUR_ACTIVES_AND_PAID:
                return PlayerManager.mePlayer.getComponent(Player).activeItems.concat(PlayerManager.mePlayer.getComponent(Player).paidItems).map(card => new EffectTarget(card))
            case CARD_POOLS.YOUR_PASSIVES:
                return PlayerManager.mePlayer.getComponent(Player).passiveItems.map(card => new EffectTarget(card))
            case CARD_POOLS.YOUR_CHARACTER:
                return new EffectTarget(PlayerManager.mePlayer.getComponent(Player).character)
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
                return Store.storeCards
            case CARD_POOLS.TOP_OF_DECKS:
                const cards = [CardManager.treasureDeck.getComponent(Deck)._cards[CardManager.treasureDeck.getComponent(Deck)._cards.length - 1],
                CardManager.monsterDeck.getComponent(Deck)._cards.getCard(CardManager.monsterDeck.getComponent(Deck)._cards.length - 1),
                CardManager.lootDeck.getComponent(Deck)._cards.getCard(CardManager.lootDeck.getComponent(Deck)._cards.length - 1)
                ]
                return cards.map(card => new EffectTarget(card))
            case CARD_POOLS.PLAYERS_SOULS:
                return PlayerManager.players.map(player => player.getComponent(Player).soulCards).map(c => new EffectTarget(c))
            case CARD_POOLS.DISCARD_PILES:
                return PileManager.getTopCardOfPiles().map(c => new EffectTarget(c))
            default:
                break;
        }

    }

}


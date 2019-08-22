import StackEffectInterface from "../StackEffectInterface";
import Stack from "../../Entites/Stack";
import CardManager from "../../Managers/CardManager";
import PlayerManager from "../../Managers/PlayerManager";
import { ROLL_TYPE, CARD_TYPE } from "../../Constants";
import ServerRollDiceStackEffect from "./Server Roll DIce";
import Player from "../../Entites/GameEntities/Player";
import ServerPurchaseItem from "./Server Purchase Item";
import TurnsManager from "../../Managers/TurnsManager";
import Deck from "../../Entites/GameEntities/Deck";
import Store from "../../Entites/GameEntities/Store";
import MonsterField from "../../Entites/MonsterField";
import MonsterCardHolder from "../../Entites/MonsterCardHolder";
import ServerRefillEmptySlot from "./Server Reffill Empty Slot";
import ServerStackEffectInterface from "./ServerStackEffectInterface";
import DeclareAttack from "../Declare Attack";
import Card from "../../Entites/GameEntities/Card";


export default class ServerDeclareAttack implements ServerStackEffectInterface {
    stackEffectType: import("../../Constants").STACK_EFFECT_TYPE;


    entityId: number;
    creatorCardId: number;
    isLockingStackEffect: boolean;
    stackEffectToLock: ServerStackEffectInterface;
    hasLockingStackEffect: boolean;
    hasLockingStackEffectResolved: boolean;
    lockingStackEffect: ServerStackEffectInterface;
    LockingResolve: any;


    attackingPlayerCardId: number
    idOfCardBeingAttacked: number


    constructor(declareAttack: DeclareAttack) {
        this.entityId = declareAttack.entityId
        this.creatorCardId = declareAttack.creatorCardId;
        this.attackingPlayerCardId = declareAttack.attackingPlayer.character.getComponent(Card)._cardId;
        this.idOfCardBeingAttacked = declareAttack.cardBeingAttacked.getComponent(Card)._cardId;
        this.stackEffectType = declareAttack.stackEffectType;
    }


    convertToStackEffect() {
        let declareAttack = new DeclareAttack(this.creatorCardId, PlayerManager.getPlayerByCardId(this.attackingPlayerCardId).getComponent(Player), CardManager.getCardById(this.idOfCardBeingAttacked))
        return declareAttack;
    }


}

import { CardLayout } from "./CardLayout";
import { ifError } from "assert";
import CardManager from "../Managers/CardManager";
import { CipherCCM } from "crypto";
import Monster from "./CardTypes/Monster";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MonsterField extends cc.Component {

    @property(Number)
    maxNumOfMonsters: number = 2;

    static monsterPlaces: MonsterPlace[] = [];

    static activeMonsters: cc.Node[] = [];

    static placesIds = 0;

    @property
    layout: CardLayout = null;

    /**
     * 
     * @param monsterPlaceId id of the place to put the monster
     * @param monsterCard a monster card to put, if none is set, one from the deck wiil go
     */
    addMonsterToExsistingPlace(monsterPlaceId, monsterCard) {
        let monsterPlace = this.getMonsterPlaceById(monsterPlaceId)
        monsterPlace.addToMonsters(monsterCard)
        CardManager.allCards.push(monsterCard)
        CardManager.onTableCards.push(monsterCard)
        let layout = this.node.getComponent(CardLayout)
        monsterCard.parent = cc.find('Canvas')
        layout.addCardToLayout(monsterCard)
        this.updateActiveMonsters()

    }

    addMonsterToNewPlace(monsterCard){
        let newMonsterPlace =  new MonsterPlace(++MonsterField.placesIds)
        MonsterField.monsterPlaces.push(newMonsterPlace)
        this.addMonsterToExsistingPlace(newMonsterPlace.id,monsterCard)

    }

    getMonsterPlacesIds() {
        let ids = [];
        for (let i = 0; i < MonsterField.monsterPlaces.length; i++) {
            const monsterPlace = MonsterField.monsterPlaces[i];
            ids.push(monsterPlace.id)
        }
        return ids;
    }

    getMonsterPlaceById(id: number) {
        for (let i = 0; i < MonsterField.monsterPlaces.length; i++) {
            const monsterPlace = MonsterField.monsterPlaces[i];
            if (monsterPlace.id == id) {
                return monsterPlace;
            }
        }
    }

    updateActiveMonsters() {
        //cc.log(MonsterField.monsterPlaces)
        MonsterField.activeMonsters = [];
        for (let i = 0; i < MonsterField.monsterPlaces.length; i++) {
            const monsterPlace = MonsterField.monsterPlaces[i];
            MonsterField.activeMonsters.push(monsterPlace.activeMonster)
        }
    }

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.layout = this.node.getComponent(CardLayout)
        //make first two monster places
        MonsterField.monsterPlaces.push(new MonsterPlace(++MonsterField.placesIds))
        MonsterField.monsterPlaces.push(new MonsterPlace(++MonsterField.placesIds))
    }

    start() {

    }

    // update (dt) {}
}


export class MonsterPlace {
    activeMonster: cc.Node = null;
    monsters: cc.Node[] = [];
    id: number = 0;
    attackButton: cc.Button

    constructor (id){
        this.id = id;
    }

    getNextMonster() {
        return this.activeMonster = this.monsters.pop()
    }


    addToMonsters(monsterCard: cc.Node) {
        this.monsters.push(monsterCard)
        this.activeMonster = monsterCard
        this.activeMonster.getComponent(Monster).monsterPlace = this

    }
}
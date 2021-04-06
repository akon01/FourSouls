import { log, _decorator, Node, Component } from 'cc';
import { Item } from "../../Entites/CardTypes/Item";
import { Monster } from '../../Entites/CardTypes/Monster';
import { Card } from "../../Entites/GameEntities/Card";
import { Player } from '../../Entites/GameEntities/Player';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { IEggCounterable } from '../IEggCounterable';
import { PreCondition } from "./PreCondition";
const { ccclass, property } = _decorator;


@ccclass('SomeEntitiesDontHaveEggCounter')
export class SomeEntitiesDontHaveEggCounter extends PreCondition {
  @property
  entitiesNeeded = 1;

  @property
  isPlayers = true

  @property
  isMonsters = true

  @property(Node)
  excludeFromCount: Node | null = null

  testCondition(meta: any) {
    let entitiesWithoutCounter: (IEggCounterable & Component)[] = []
    if (this.isPlayers) {
      WrapperProvider.playerManagerWrapper.out.players.forEach(p => {
        const playerComp = p.getComponent(Player)!;
        if (playerComp.getEggCounters() == 0) {
          entitiesWithoutCounter.push(playerComp)
        }
      })
    }
    if (this.isMonsters) {
      WrapperProvider.monsterFieldWrapper.out.getActiveMonsters().forEach(m => {
        const monsterComp = m.getComponent(Monster)!;
        if (monsterComp.getEggCounters() == 0) {
          entitiesWithoutCounter.push(monsterComp)
        }
      })
    }
    entitiesWithoutCounter = entitiesWithoutCounter.filter(e => e.node != this.excludeFromCount)
    return entitiesWithoutCounter.length >= this.entitiesNeeded

  }
}

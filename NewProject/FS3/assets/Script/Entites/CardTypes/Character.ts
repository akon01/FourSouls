import { Component, Node, Prefab, _decorator } from 'cc';
import { Player } from "../GameEntities/Player";
const { ccclass, property } = _decorator;


@ccclass('Character')
export class Character extends Component {
  @property(Prefab)
  charItemPrefab: Prefab | null = null;

  charItemCard: Node | null = null;
  @property
  activated = false;
  @property
  hp = 0;
  @property
  damage = 0;

  player: Player | null = null
  // LIFE-CYCLE CALLBACKS:
  // onLoad () {}
  // update (dt) {}
}


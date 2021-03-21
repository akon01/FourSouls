import { _decorator, Node } from 'cc';
const { ccclass, property } = _decorator;

import { Item } from "./Item";

@ccclass('CharacterItem')
export class CharacterItem extends Item {
  @property(Node)
  character: Node | null = null;
  @property({ override: true })
  needsRecharge: boolean = false;
  // LIFE-CYCLE CALLBACKS:
  // onLoad () {}
  start() { }
  // update (dt) {}
}


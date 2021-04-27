import { _decorator, Component, Node, SpriteFrame, Label, UITransform, Sprite } from 'cc';
const { ccclass, property } = _decorator;

import { Signal } from "../../Misc/Signal";

import { CARD_TYPE, PASSIVE_EVENTS } from "../Constants";
import { PassiveMeta } from "../Managers/PassiveMeta";
import { RefillEmptySlot } from "../StackEffects/RefillEmptySlot";
import { CardEffect } from "./CardEffect";
import { Monster } from "./CardTypes/Monster";
import { Card } from "./GameEntities/Card";
import { Player } from "./GameEntities/Player";
import { WrapperProvider } from '../Managers/WrapperProvider';

@ccclass('MonsterCardHolder')
export class MonsterCardHolder extends Component {
      @property
      id: number | null = null;

      @property
      monsters: Node[] = [];

      @property
      spriteFrame: SpriteFrame | null = null;

      @property({ type: Label })
      hpLable: Label | null = null;

      @property({ type: Label })
      dmgLable: Label | null = null;

      private _activeMonster: Node | null = null;

      @property({ type: Label })
      rollBonusLable: Label | null = null;









      // public set activeMonster(v: Node) {
      //   const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.NEW_ACTIVE_MONSTER, [v], null, v);
      //   if (WrapperProvider.playerManagerWrapper.out.mePlayer == turnsManagerWrapper._tm.currentTurn.getTurnPlayer().node) {
      //     const afterPassiveMetaPromise = passiveManagerWrapper._pm.checkB4Passives(passiveMeta);
      //     // tslint:disable-next-line: no-floating-promises
      //     afterPassiveMetaPromise.then((afterPassiveMeta) => {
      //       v = afterPassiveMeta.args[0];
      //       this._activeMonster = v;
      //     });
      //   } else {
      //     this._activeMonster = v;
      //   }
      // }

      public get activeMonster(): Node | null {
            return this._activeMonster;
      }

      async setActiveMonster(monsterCard: Node, sendToServer: boolean) {
            const currentActiveMonster = this.activeMonster
            const activeMonsters = WrapperProvider.monsterFieldWrapper.out.getActiveMonsters()
            if (sendToServer) {
                  if (this.activeMonster && activeMonsters.indexOf(this.activeMonster) >= 0) {
                        WrapperProvider.monsterFieldWrapper.out.removeFromActiveMonsters(this.activeMonster)
                        this.activeMonster.getComponent(Monster)!.monsterPlace = null;
                        WrapperProvider.passiveManagerWrapper.out.removePassiveItemEffects(this.activeMonster, sendToServer)
                  }
            }
            const passiveMeta = new PassiveMeta(PASSIVE_EVENTS.NEW_ACTIVE_MONSTER, [monsterCard, currentActiveMonster], null, monsterCard);
            if (WrapperProvider.turnsManagerWrapper.out.isCurrentPlayer(WrapperProvider.playerManagerWrapper.out.mePlayer!)) {
                  const afterPassiveMeta = await WrapperProvider.passiveManagerWrapper.out.checkB4Passives(passiveMeta);
                  if (!afterPassiveMeta.args) { debugger; throw new Error("No Args!"); }

                  monsterCard = afterPassiveMeta.args[0];
                  this._activeMonster = monsterCard;
            } else {
                  this._activeMonster = monsterCard;
            }
            const monster = monsterCard.getComponent(Monster)!;
            monster.currentHp = monster.HP;
            monster.monsterPlace = this;

            if (monsterCard.active == false) {
                  monsterCard.active = true;
            }
            this.spriteFrame = null;
            monsterCard.setParent(this.node);
            //  this.node.addChild(monsterCard, 0);
            monsterCard.setPosition(0, 0);

            const thisTrans = this.node.getComponent(UITransform)!;
            const monsterTrans = monsterCard.getComponent(UITransform)!;
            thisTrans.width = monsterTrans.width;
            thisTrans.height = monsterTrans.height;

            WrapperProvider.monsterFieldWrapper.out.activeMonsters.add(monsterCard.getComponent(Card)!._cardId)
            WrapperProvider.cardManagerWrapper.out.makeCardPreviewable(monsterCard)

            if (!this.activeMonster) { debugger; throw new Error("No Active Monster"); }

            const monsterEffect = this.activeMonster.getComponent(CardEffect)
            if (monsterEffect != null && monsterEffect.passiveEffects.length > 0 && !WrapperProvider.passiveManagerWrapper.out.isCardRegistered(this.activeMonster)) {

                  if (WrapperProvider.turnsManagerWrapper.out.isCurrentPlayer(WrapperProvider.playerManagerWrapper.out.mePlayer!)) {
                        await WrapperProvider.passiveManagerWrapper.out.registerPassiveItem(this.activeMonster, true)
                  }
            }
            if (WrapperProvider.turnsManagerWrapper.out.isCurrentPlayer(WrapperProvider.playerManagerWrapper.out.mePlayer!)) {
                  await WrapperProvider.passiveManagerWrapper.out.testForPassiveAfter(passiveMeta)
            }
      }

      async getNextMonster(sendToServer: boolean) {
            if (this.monsters.length > 0) {
                  await this.setActiveMonster(this.monsters[this.monsters.length - 1], sendToServer);
                  if (sendToServer) {
                        WrapperProvider.serverClientWrapper.out.send(Signal.GET_NEXT_MONSTER, { monsterPlaceId: this.id });
                  }
            } else {
                  if (sendToServer) {
                        const refillEmptySlot = new RefillEmptySlot(WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)!.character!.getComponent(Card)!._cardId, this.node, CARD_TYPE.MONSTER);
                        await WrapperProvider.stackWrapper.out.addToStack(refillEmptySlot, true);
                  }
            }

      }
      /**
       * add a monster to the place and set it as active
       * @param monsterCard
       */

      async addToMonsters(monsterCard: Node, sendToServer: boolean) {

            const monsterCardComp = monsterCard.getComponent(Card)!;
            if (monsterCardComp._isShowingBack) {
                  monsterCardComp.flipCard(sendToServer);
            }
            for (const monster of this.monsters) {
                  monster.active = false;
            }
            this.monsters.push(monsterCard);

            await this.setActiveMonster(monsterCard, sendToServer);

            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.ADD_MONSTER, { monsterPlaceId: this.id, monsterId: monsterCardComp._cardId });
            }

      }

      async discardTopMonster(sendToServer: boolean) {

            const monster = this._activeMonster;
            if (!monster) { debugger; throw new Error("No Active Monster To Discard"); }

            await WrapperProvider.pileManagerWrapper.out.addCardToPile(CARD_TYPE.MONSTER, monster, sendToServer);
            await this.removeMonster(monster, sendToServer);
            // this.monsters.length > 0 ? this.activeMonster = this.monsters.pop() : this.activeMonster = null;
            // await this.getNextMonster(true)

      }

      async removeMonster(monster: Node, sendToServer: boolean) {
            this.monsters.splice(this.monsters.indexOf(monster));
            if (WrapperProvider.monsterFieldWrapper.out.getActiveMonsters().indexOf(monster) >= 0) {
                  const monsterComp = monster.getComponent(Monster)!;
                  WrapperProvider.monsterFieldWrapper.out.removeFromActiveMonsters(monster)
                  monsterComp.monsterPlace = null;
                  if (!monsterComp.isCurse || !monsterComp.doNotRemovePassiveEffectsWhenRemovingFromMonsterCardHolder) {
                        WrapperProvider.passiveManagerWrapper.out.removePassiveItemEffects(monster, sendToServer)
                  }
            }

            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.REMOVE_MONSTER, { holderId: this.id, monsterId: monster.getComponent(Card)!._cardId });
                  await this.getNextMonster(true);
            }
            // this.getNextMonster(sendToServer);
      }

      toString() {
            if (this._activeMonster != null) {
                  return (
                        "monsterPlace " +
                        this.id +
                        " \nactive Monster :" +
                        this._activeMonster.getComponent(Card)!.name
                  );
            } else {
                  return "monsterPlace " + this.id + " \nactive Monster : none";
            }
      }

      // LIFE-CYCLE CALLBACKS:

      onLoad() {
            //  this.hpLable = this.node.getChildByName("hp").getComponent(Label);
            //this.dmgLable = this.node.getChildByName("dmg").getComponent(Label);
            this.spriteFrame = this.getComponent(Sprite)!.spriteFrame;
      }



      update(dt: number) {
            if (this._activeMonster != null) {
                  const activeMonster = this._activeMonster.getComponent(Monster)!;
                  this.hpLable!.string =
                        "🖤:" + activeMonster.currentHp;
                  if (activeMonster._bonusDamage != 0) {
                        this.dmgLable!.string =
                              "🏹:" + activeMonster.calculateDamage();
                        this.dmgLable!.node.active = true;
                  } else {
                        this.dmgLable!.node.active = false;
                  }
                  if (activeMonster._rollBonus != 0) {
                        this.rollBonusLable!.string = "🎲:" + (activeMonster._rollBonus + activeMonster.rollValue)
                        this.rollBonusLable!.node.active = true
                  } else {
                        this.rollBonusLable!.node.active = false
                  }
            } else {
                  this.hpLable!.string = "";
                  this.dmgLable!.node.active = false;
                  // this.dmgLable.string = "dmg:" + 0;
            }
      }
}

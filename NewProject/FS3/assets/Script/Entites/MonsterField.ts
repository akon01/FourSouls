import { _decorator, Component, CCInteger, Prefab, Layout, Node, instantiate, UITransform } from 'cc';
const { ccclass, property } = _decorator;

import { Signal } from "../../Misc/Signal";

import { ChooseCardTypeAndFilter } from "../CardEffectComponents/ChooseCardTypeAndFilter";
import { ChooseCard } from "../CardEffectComponents/DataCollector/ChooseCard";
import { EffectTarget } from "../Managers/EffectTarget";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { CARD_HEIGHT, CARD_WIDTH, CHOOSE_CARD_TYPE } from "./../Constants";
import { CardEffect } from "./CardEffect";
import { Monster } from "./CardTypes/Monster";
import { Card } from "./GameEntities/Card";
import { Player } from "./GameEntities/Player";
import { MonsterCardHolder } from "./MonsterCardHolder";

@ccclass('MonsterField')
export class MonsterField extends Component {
      @property(CCInteger)
      maxNumOfMonsters = 2;

      @property(Prefab)
      MonsterCardHolderPrefab: Prefab | null = null;

      monsterCardHolders: MonsterCardHolder[] = [];

      activeMonsters: Set<number> = new Set()

      holderIds = 0;




      layout: Layout | null = null;

      @property
      widgetPadding = 0;







      getActiveMonsters() {
            return Array.from(this.activeMonsters.values()).map(cid => WrapperProvider.cardManagerWrapper.out.getCardById(cid))
      }

      removeFromActiveMonsters(card: Node) {
            this.activeMonsters.delete(card.getComponent(Card)!._cardId)
      }
      /**
       *
       * @param monsterPlaceId id of the place to put the monster
       * @param monsterCard a monster card to put, if none is set, one from the deck will go
       */
      async addMonsterToExsistingPlace(
            monsterPlaceId: number,
            monsterCard: Node,
            sendToServer: boolean
      ) {
            const monsterCardComp = monsterCard.getComponent(Card)!;
            if (monsterCardComp._isShowingBack) {
                  monsterCardComp.flipCard(sendToServer);
            }
            const monsterHolder = WrapperProvider.monsterFieldWrapper.out.getMonsterPlaceById(monsterPlaceId);
            const monsterId = monsterCardComp._cardId;
            const monsterComp = monsterCard.getComponent(Monster)
            if (!monsterComp) return
            monsterComp.currentHp = monsterComp.HP;

            if (sendToServer) {
                  await monsterHolder.addToMonsters(monsterCard, sendToServer);
            }
            const signal = Signal.NEW_MONSTER_ON_PLACE;
            const srvData = { cardId: monsterId, monsterPlaceId: monsterPlaceId };
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(signal, srvData);
                  if (monsterComp.isNonMonster) {
                        await WrapperProvider.turnsManagerWrapper.out.currentTurn!.getTurnPlayer()!.activateCard(monsterCard)
                  }
            }
            WrapperProvider.cardManagerWrapper.out.allCards.push(monsterCard);
            WrapperProvider.cardManagerWrapper.out.addOnTableCards([monsterCard]);

      }

      async givePlayerChoiceToCoverPlace(monsterToCoverWith: Monster, player: Player) {
            const chooseCard = new ChooseCard();
            chooseCard.flavorText = "Choose A Monster To Cover"
            await WrapperProvider.cardPreviewManagerWrapper.out.getPreviews(Array.of(monsterToCoverWith.node), true)
            WrapperProvider.cardPreviewManagerWrapper.out.showToOtherPlayers([monsterToCoverWith.node]);
            chooseCard.chooseType = new ChooseCardTypeAndFilter()
            chooseCard.chooseType.chooseType = CHOOSE_CARD_TYPE.MONSTER_PLACES
            const monsterInSpotChosen = await chooseCard.collectData({ cardPlayerId: player.playerId }) as EffectTarget
            const activeMonsterSelected = monsterInSpotChosen.effectTargetCard.getComponent(Monster)!
            const monsterCardHolder: MonsterCardHolder = WrapperProvider.monsterFieldWrapper.out.getMonsterPlaceById(activeMonsterSelected.monsterPlace!.id!);
            await WrapperProvider.monsterFieldWrapper.out.addMonsterToExsistingPlace(monsterCardHolder.id!, monsterToCoverWith.node, true)
      }

      getMonsterPlaceByActiveMonsterId(activeMonsterId: number): MonsterCardHolder | null {
            for (let i = 0; i < this.monsterCardHolders.length; i++) {
                  const monsterPlace = this.monsterCardHolders[i];
                  const testedActiveMonsterId = monsterPlace.activeMonster!.getComponent(Card)!._cardId;
                  if (activeMonsterId == testedActiveMonsterId) {
                        return monsterPlace;
                  }
            }
            return null
      }

      async addMonsterToNewPlace(sendToServer: boolean) {
            const newMonsterHolder = this.getNewMonsterHolder();
            if (!newMonsterHolder) return
            const layout = WrapperProvider.monsterFieldWrapper.out.node.getComponent(Layout)!;
            newMonsterHolder.setParent(layout.node)
            //layout.addCardToLayout(newMonsterHolder);

            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.NEW_MONSTER_PLACE)
                  await newMonsterHolder.getComponent(MonsterCardHolder)!.getNextMonster(true)
            }
            // this.addMonsterToExsistingPlace(
            //   newMonsterHolder.getComponent(MonsterCardHolder).id,
            //   monsterCard,
            //   sendToServer
            // );
      }

      getNewMonsterHolder() {
            const newMonsterHolder = instantiate(WrapperProvider.monsterFieldWrapper.out.MonsterCardHolderPrefab) as unknown as Node;
            if (!newMonsterHolder) return
            const uiTrans = newMonsterHolder.getComponent(UITransform)!;
            newMonsterHolder.name;
            uiTrans.width = CARD_WIDTH;
            uiTrans.height = CARD_HEIGHT;
            newMonsterHolder.getComponent(MonsterCardHolder)!.id = ++WrapperProvider.monsterFieldWrapper.out.holderIds;
            newMonsterHolder.name = "holder" + WrapperProvider.monsterFieldWrapper.out.holderIds;
            WrapperProvider.monsterFieldWrapper.out.node.addChild(newMonsterHolder);
            WrapperProvider.monsterFieldWrapper.out.monsterCardHolders.push(newMonsterHolder.getComponent(MonsterCardHolder)!);
            return newMonsterHolder;
      }

      getMonsterCardHoldersIds() {
            const ids = [];
            for (let i = 0; i < WrapperProvider.monsterFieldWrapper.out.monsterCardHolders.length; i++) {
                  const monsterPlace = WrapperProvider.monsterFieldWrapper.out.monsterCardHolders[i];
                  ids.push(monsterPlace.id!);
            }
            return ids;
      }

      getMonsterPlaceById(id: number) {
            for (let i = 0; i < WrapperProvider.monsterFieldWrapper.out.monsterCardHolders.length; i++) {
                  const monsterPlace = WrapperProvider.monsterFieldWrapper.out.monsterCardHolders[i];

                  if (monsterPlace.id == id) {
                        return monsterPlace;
                  }
            }
            throw new Error(`No monster place found with id ${id}`)
      }

      async updateActiveMonsters() {
            WrapperProvider.monsterFieldWrapper.out.activeMonsters.clear();
            for (let i = 0; i < WrapperProvider.monsterFieldWrapper.out.monsterCardHolders.length; i++) {
                  const monsterPlace = WrapperProvider.monsterFieldWrapper.out.monsterCardHolders[i];
                  if (monsterPlace.activeMonster != null) {
                        WrapperProvider.monsterFieldWrapper.out.activeMonsters.add(monsterPlace.activeMonster.getComponent(Card)!._cardId);
                        const monsterEffect = monsterPlace.activeMonster.getComponent(CardEffect)
                        if (monsterEffect != null && monsterEffect.passiveEffects.length > 0 && !WrapperProvider.passiveManagerWrapper.out.isCardRegistered(monsterPlace.activeMonster)) {

                              if (WrapperProvider.turnsManagerWrapper.out.isCurrentPlayer(WrapperProvider.playerManagerWrapper.out.mePlayer!)) {
                                    await WrapperProvider.passiveManagerWrapper.out.registerPassiveItem(monsterPlace.activeMonster, true)
                              }
                        }
                  }
            }
      }

      // LIFE-CYCLE CALLBACKS:

      onLoad() {
            this.layout = this.getComponent(Layout);
            //WrapperProvider.monsterFieldWrapper.out.monsterFieldWrapper = this;
            //make first two monster places
            for (let i = 0; i < 2; i++) {
                  WrapperProvider.monsterFieldWrapper.out.getNewMonsterHolder();
            }
            WrapperProvider.monsterFieldWrapper.out.activeMonsters = new Set();
            // WrapperProvider.monsterFieldWrapper.out.monsterCardHolders.push(new MonsterPlace(++WrapperProvider.monsterFieldWrapper.out.placesIds));
            // WrapperProvider.monsterFieldWrapper.out.monsterCardHolders.push(new MonsterPlace(++WrapperProvider.monsterFieldWrapper.out.placesIds));
      }

}

import { Component, error, log, Node, _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";
import { whevent } from "../../ServerClient/whevent";
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { MultiEffectRollAsEffect } from "../CardEffectComponents/CardEffects/MultiEffectRollAsEffect";
import { CARD_TYPE, GAME_EVENTS, PASSIVE_TYPE } from "../Constants";
import { CardEffect } from "../Entites/CardEffect";
import { CardSet } from "../Entites/CardSet";
import { Monster } from "../Entites/CardTypes/Monster";
import { Card } from "../Entites/GameEntities/Card";
import { Player } from "../Entites/GameEntities/Player";
import { ActivatePassiveEffect } from "../StackEffects/ActivatePassiveEffect";
import { PassiveMeta } from './PassiveMeta';
import { ServerEffectData } from './ServerEffectData';
import { WrapperProvider } from './WrapperProvider';
const { ccclass } = _decorator;


@ccclass('PassiveManager')
export class PassiveManager extends Component {
      passiveItems: CardSet = new CardSet()

      allBeforeEffects: Effect[] = [];
      allAfterEffects: Effect[] = [];
      oneTurnBeforeEffects: Effect[] = [];
      oneTurnAfterEffects: Effect[] = [];
      inPassivePhase: boolean = false;

      inRegisterPhase: boolean = false

      // passiveMethodData: PassiveMeta

      beforeActivationMap: Map<number, PassiveMeta> = new Map();
      afterActivationMap: Map<number, PassiveMeta> = new Map();

      beforeActivationIndex: number = 0;
      afterActivationIndex: number = 0;









      updatePassiveMethodData(newData: PassiveMeta, isAfterActivation: boolean, sendToServer: boolean) {
            let index = newData.index;
            if (index == null) {
                  // console.error(`passiveMeta has no index, give him one`)
                  isAfterActivation == true ? index = ++this.afterActivationIndex : index = ++this.beforeActivationIndex
                  newData.index = index
            }
            if (isAfterActivation) {
                  this.afterActivationMap.set(index, newData)
            } else {
                  this.beforeActivationMap.set(index, newData)
            };
            let serverData = null;
            if (sendToServer) {
                  if (newData) {
                        serverData = newData.convertToServerPassiveMeta()
                  }
                  WrapperProvider.serverClientWrapper.out.send(Signal.UPDATE_PASSIVE_DATA, { passiveData: serverData, isAfterActivation: isAfterActivation, index: index })
            }
            return index
      }

      clearPassiveMethodData(index: number, isAfterActivation: boolean, sendToServer: boolean) {
            if (index) {
                  if (isAfterActivation) {
                        this.afterActivationMap.delete(index)
                  } else {
                        this.beforeActivationMap.delete(index)
                  }

                  if (sendToServer) {
                        WrapperProvider.serverClientWrapper.out.send(Signal.CLEAR_PASSIVE_DATA, { index: index, isAfterActivation: isAfterActivation })
                  }
            }
      }

      getPassivesinfo() {
            const passiveItemsCardIds = this.passiveItems.map(card => card.getComponent(Card)!._cardId)
            return {
                  allBeforeEffects: this.allBeforeEffects,
                  allAfterEffects: this.allAfterEffects,
                  oneTurnBeforeEffects: this.oneTurnBeforeEffects,
                  oneTurnAfterEffects: this.oneTurnAfterEffects,
                  passiveItemsCardIds: passiveItemsCardIds
            }
      }

      updateInfo(info: any) {
            this.allAfterEffects = info.allAfterEffects;
            this.allBeforeEffects = info.allBeforeEffects;
            this.oneTurnAfterEffects = info.oneTurnAfterEffects;
            this.oneTurnBeforeEffects = info.oneTurnBeforeEffects;
            this.passiveItems = info.passiveItemsCardIds.map((id: any) => { WrapperProvider.cardManagerWrapper.out.getCardById(id, true) })
      }

      async registerPassiveItem(itemToRegister: Node, sendToServer: boolean) {
            if (this.inRegisterPhase) {
            }
            this.inRegisterPhase = true;
            const cardEffect = itemToRegister.getComponent(CardEffect)
            if (!cardEffect) return
            if (itemToRegister.getComponent(CardEffect) != null) {

                  if (cardEffect.passiveEffects.length > 0) {
                        if (!this.isCardRegistered(itemToRegister)) {
                              this.passiveItems.push(itemToRegister);
                              const cardPassives = cardEffect.getPassiveEffects()
                              for (const passive of cardPassives) {
                                    if (!passive) { continue }
                                    const conditions = passive.getConditions();
                                    //test check to see if any effects are registered with condition data already collected, if so , when registering on server, convert to ActiveEffectData\PassiveEffectData
                                    if (conditions.indexOf(null!) >= 0) {
                                          throw new Error(`Trying to register a passive with a place for condition but none selected.`)
                                    }
                                    // if (conditions.find(condition => condition.conditionData != null) != undefined) {
                                    //       throw new Error(`trying to register a passive effect with condition data, change algorithm to pass the data thru the server`)
                                    // }
                                    if (passive.passiveType == PASSIVE_TYPE.AFTER) {

                                          this.allAfterEffects.push(passive);

                                    } else {

                                          this.allBeforeEffects.push(passive);
                                    }
                              }
                              if (sendToServer) {
                                    console.log(`regstered ${itemToRegister.name} to passive manager`)
                                    const cardId = itemToRegister.getComponent(Card)!._cardId
                                    WrapperProvider.serverClientWrapper.out.send(Signal.REGISTER_PASSIVE_ITEM, { cardId: cardId })
                              }
                        } else {
                              console.log(`card already registered`)
                        }

                  }
            }
            this.inRegisterPhase = false;
      }

      removePassiveItemEffects(item: Node, sendToServer: boolean) {
            if (this.isCardRegistered(item)) {
                  const passiveEffects = item.getComponent(CardEffect)!.getPassiveEffects();
                  const cardPassives = passiveEffects
                  this.passiveItems.splice(this.passiveItems.indexOf(item), 1)
                  for (const passive of cardPassives) {
                        if (!passive) { continue };
                        if (passive.passiveType == PASSIVE_TYPE.AFTER) {

                              this.allAfterEffects.splice(this.allAfterEffects.indexOf(passive), 1)

                        } else {

                              this.allBeforeEffects.splice(this.allBeforeEffects.indexOf(passive), 1)
                        }
                  }
                  if (sendToServer) {
                        WrapperProvider.serverClientWrapper.out.send(Signal.REMOVE_FROM_PASSIVE_MANAGER, { cardId: item.getComponent(Card)!._cardId })
                  }
            } else {
                  return
            }
      }

      removeOneTurnPassiveEffect(effect: Effect, sendToServer: boolean) {
            if (effect.passiveType == PASSIVE_TYPE.AFTER) {

                  this.oneTurnAfterEffects = this.oneTurnAfterEffects.filter(e => e != effect);

            } else {

                  this.oneTurnBeforeEffects = this.oneTurnBeforeEffects.filter(e => e != effect);
            }

            if (sendToServer) {
                  const card = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(effect.node).getComponent(Card)!
                  const effectIndex = card.node.getComponent(CardEffect)!.getEffectIndexAndType(effect)
                  WrapperProvider.serverClientWrapper.out.send(Signal.REMOVE_ONE_TURN_PASSIVE_EFFECT, { cardId: card._cardId, effectIndex: effectIndex })
            }
      }

      async registerOneTurnPassiveEffect(effect: Effect, sendToServer: boolean) {
            if (this.inRegisterPhase) {
            }
            this.inRegisterPhase = true;
            if (effect.passiveType == PASSIVE_TYPE.AFTER) {

                  this.oneTurnAfterEffects.push(effect);

            } else {

                  this.oneTurnBeforeEffects.push(effect);
            }

            if (sendToServer) {
                  const card = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(effect.node).getComponent(Card)!
                  const effectIndex = card.node.getComponent(CardEffect)!.getEffectIndexAndType(effect)
                  const conditionsData: ServerEffectData[] = [];
                  const conditions = effect.getConditions();
                  for (let i = 0; i < conditions.length; i++) {
                        const condition = conditions[i];
                        try {
                              conditionsData.push(WrapperProvider.dataInerpreterWrapper.out.convertToServerData(condition.conditionData))
                        } catch (error) {
                              WrapperProvider.loggerWrapper.out.error(error)
                        }

                  }
                  // let serverEffectData = WrapperProvider.dataInerpreterWrapper.out.convertToServerData(effect.conditions.conditionData)
                  //let srvData = { cardId: card._cardId, effectIndex: effectIndex, conditionData: serverEffectData }
                  const srvData = { cardId: card._cardId, effectIndex: effectIndex, conditionData: conditionsData }
                  WrapperProvider.serverClientWrapper.out.send(Signal.REGISTER_ONE_TURN_PASSIVE_EFFECT, srvData)
            }

            this.inRegisterPhase = false;
      }

      async waitForRegister(): Promise<boolean> {
            //w8 for a server message with a while,after the message is recived (should be a stack of effects with booleans) resolve with stack of effects.
            return new Promise((resolve) => {
                  whevent.onOnce(GAME_EVENTS.PASSIVE_MAN_PASSIVE_PHASE_OVER, () => {
                        resolve(true);
                  })
            });
      }

      isCardRegistered(card: Node) {
            return this.passiveItems.includes(card);
      }

      clearAllListeners() {
            this.allAfterEffects = [];
            this.passiveItems.clear();
      }

      async testPassivesCondtions(passivesToCheck: Effect[], passiveMeta: PassiveMeta) {
            console.error(`test passive Conditions for Event: ${passiveMeta.passiveEvent}`)
            const allPassiveEffects = passivesToCheck;
            const allPassivesToActivate: Effect[] = []
            for (let i = 0; i < allPassiveEffects.length; i++) {
                  const passiveEffect = allPassiveEffects[i];
                  const effectCard = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(passiveEffect.node)

                  let isTrue = true;
                  if (passiveEffect.conditions.length == 0) {
                        console.error(`passive effect ${passiveEffect.effectName} on ${WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(passiveEffect.node).name} has no conditions`)
                        isTrue = false;
                  }
                  const conditions = passiveEffect.getConditions();
                  for (let i = 0; i < conditions.length; i++) {
                        const condition = conditions[i];
                        if (!condition) { throw new Error("Empty condition space in Effect") }
                        if (condition.event) {
                              condition.event == passiveMeta.passiveEvent ? isTrue = true : isTrue = false
                        } else if (condition.events.length > 0) {
                              let isOneOfTheEvents: boolean = false

                              for (const event of condition.events) {
                                    if (event == passiveMeta.passiveEvent) { isOneOfTheEvents = true }
                              }

                              if (!isOneOfTheEvents) { isTrue = false }
                        }

                        const conditionDataCollector = condition.getDataCollector();
                        if (isTrue && conditionDataCollector != null) {
                              let cardOwner: Node | null = null
                              const playerOwner = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(effectCard)
                              if (playerOwner == null) {
                                    cardOwner = effectCard
                              } else {
                                    cardOwner = playerOwner.character
                              }
                              if (!cardOwner) { debugger; throw new Error("No Card Owner"); }
                              const x = await conditionDataCollector.collectData({ cardPlayerId: cardOwner.getComponent(Card)!._cardId, cardId: effectCard.getComponent(Card)!._cardId })
                              condition.conditionData = WrapperProvider.dataInerpreterWrapper.out.makeEffectData(x, effectCard, cardOwner.getComponent(Card)!._cardId, false, false)
                        } else if (condition.isAddPassiveEffect && !condition.conditionData && condition.needsDataCollector) {
                              throw new Error(`Effect ${passiveEffect.effectName} is an "Add Passive Effect", its condition ${condition.name} doesn't have condition data`)
                        }

                        try {
                              if (isTrue && (await condition.testCondition(passiveMeta) == false)) {
                                    isTrue = false;
                              }
                        } catch (error) {
                              WrapperProvider.loggerWrapper.out.error(error, passiveMeta)
                              isTrue = false
                        }
                        if (isTrue == false) { break; }
                  }
                  //  let isConditionTrue = await passiveEffect.conditions.testCondition(passiveMeta);
                  //if (isConditionTrue) {
                  if (isTrue) {
                        allPassivesToActivate.push(passiveEffect)
                  } else {
                        //condition wasnt true, do nothning
                  }
            }
            return allPassivesToActivate
      }

      async checkB4Passives(passiveMeta: PassiveMeta) {

            // if (!WrapperProvider.playerManagerWrapper.out.mePlayer.getComponent(Player)!._hasPriority) return { continue: true, args: passiveMeta.args };

            console.log(passiveMeta)
            const originalStackEffect = WrapperProvider.stackWrapper.out._currentStack.find(effect => effect.entityId == passiveMeta.originStackId)
            WrapperProvider.passiveManagerWrapper.out.inPassivePhase = true;
            let allPassiveEffects = WrapperProvider.passiveManagerWrapper.out.allBeforeEffects;
            allPassiveEffects = allPassiveEffects.concat(WrapperProvider.passiveManagerWrapper.out.oneTurnBeforeEffects)
            let allPassivesToActivate: Effect[] = [];
            try {
                  allPassivesToActivate = await this.testPassivesCondtions(allPassiveEffects, passiveMeta)
            } catch (error) {
                  WrapperProvider.loggerWrapper.out.error(error)
            }

            let methodData: { continue: boolean, args: any[] | null } = { continue: false, args: [] }
            let newPassiveMeta: PassiveMeta | undefined
            if (allPassivesToActivate.length > 0) {
                  newPassiveMeta = await this.activateB4Passives(passiveMeta, allPassivesToActivate)
                  if (originalStackEffect) {
                        if (originalStackEffect.checkForFizzle()) {
                              methodData.continue = false
                              methodData.args = newPassiveMeta.args;
                        } else {
                              methodData.continue = !newPassiveMeta.preventMethod
                              methodData.args = newPassiveMeta.args;
                              console.log(methodData)
                        }
                  } else {
                        methodData.continue = !newPassiveMeta.preventMethod
                        methodData.args = newPassiveMeta.args;
                        console.log(methodData)
                  }
            } else {
                  methodData.continue = true
                  methodData.args = passiveMeta.args;
            }
            // if (newPassiveMeta) {
            //   this.clearPassiveMethodData(newPassiveMeta.index, false, true)
            // }
            whevent.emit(GAME_EVENTS.PASSIVE_MAN_PASSIVE_PHASE_OVER)
            WrapperProvider.passiveManagerWrapper.out.inPassivePhase = false;
            return methodData;
      }

      async activateB4Passives(passiveMeta: PassiveMeta, passivesToActivate: Effect[]) {
            let cardToActivate: Node;
            let cardActivatorId;

            const index = this.updatePassiveMethodData(passiveMeta, false, true)
            passiveMeta.index = index
            // this.passiveMethodData = passiveMeta
            let isPlayer = false;
            for (let i = 0; i < passivesToActivate.length; i++) {
                  const effect = passivesToActivate[i];
                  cardToActivate = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(effect.node);

                  const cardEffectComp = cardToActivate.getComponent(CardEffect)!;
                  let player: Player | null
                  if (cardToActivate.getComponent(Monster) == null) {
                        player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(cardToActivate)!;
                        isPlayer = true
                  } else {
                        player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(passiveMeta.methodScope!);
                        if (!player) {
                              player = WrapperProvider.turnsManagerWrapper.out.getCurrentTurn()!.getTurnPlayer()!;
                        }
                  }
                  cardActivatorId = player.playerId;
                  let activatePassiveEffect: ActivatePassiveEffect
                  let hasLockingEffect;
                  const multiEffectRollEffect = cardEffectComp.getPassiveEffects()[0];
                  if (multiEffectRollEffect != null && multiEffectRollEffect instanceof MultiEffectRollAsEffect) {
                        hasLockingEffect = true;
                  } else { hasLockingEffect = false; }
                  let hasDataBeenColleced: boolean
                  if (effect.effectData) {
                        hasDataBeenColleced = true
                  } else { hasDataBeenColleced = false }
                  player = null
                  if (isPlayer) {
                        player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(cardToActivate);
                        if (!player) { throw new Error(`no player was found for card ${cardToActivate.name}, can't make new ActivatePassiveEffect of the card`) }

                        //   activatePassiveEffect = new ActivatePassiveEffect(player.character.getComponent(Card)!._cardId, hasLockingEffect, cardActivatorId, cardToActivate, effect, hasDataBeenColleced, false, index)

                  } else {
                        player = WrapperProvider.playerManagerWrapper.out.mePlayer!.getComponent(Player)
                  }
                  if (!player) { debugger; throw new Error("No Player!"); }
                  activatePassiveEffect = new ActivatePassiveEffect(player.character!.getComponent(Card)!._cardId, hasLockingEffect, cardActivatorId, cardToActivate, effect, hasDataBeenColleced, false, index)
                  if (passivesToActivate.length - i == 1) {

                        // if (WrapperProvider.stackWrapper.out._currentStack.EffectsResolving.length == 0) {
                        await WrapperProvider.stackWrapper.out.addToStack(activatePassiveEffect, true)
                        // } else {
                        //   await WrapperProvider.stackWrapper.out.addToStackAbove(activatePassiveEffect)
                        // }
                  } else {
                        await WrapperProvider.stackWrapper.out.addToStackAbove(activatePassiveEffect)
                  }

            }

            const retVal = this.beforeActivationMap.get(passiveMeta.index);
            if (!retVal) { debugger; throw new Error("No Retrun Value Found!"); }

            return retVal
      }

      async testForPassiveAfter(meta: PassiveMeta) {

            //  if (!WrapperProvider.playerManagerWrapper.out.mePlayer.getComponent(Player)!._hasPriority) return meta.result;

            const index = this.updatePassiveMethodData(meta, true, true)
            meta.index = index
            WrapperProvider.passiveManagerWrapper.out.inPassivePhase = true;
            let allPassiveEffects = WrapperProvider.passiveManagerWrapper.out.allAfterEffects;
            allPassiveEffects = allPassiveEffects.concat(WrapperProvider.passiveManagerWrapper.out.oneTurnAfterEffects)
            let passivesToActivate: Effect[] = [];
            try {
                  console.log(allPassiveEffects)
                  passivesToActivate = await this.testPassivesCondtions(allPassiveEffects, meta)
            } catch (error) {
                  WrapperProvider.loggerWrapper.out.error(error)
            }
            console.log(passivesToActivate)
            for (let i = 0; i < passivesToActivate.length; i++) {
                  const passiveEffect = passivesToActivate[i];
                  const cardActivated: Node = WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(passiveEffect.node);
                  const cardEffectComp = cardActivated.getComponent(CardEffect)!;
                  let hasLockingEffect;
                  const multiEffectRollEffect = cardEffectComp.getPassiveEffects()[0];
                  if (multiEffectRollEffect != null && multiEffectRollEffect.getComponent(Effect) instanceof MultiEffectRollAsEffect) {
                        hasLockingEffect = true;
                  } else { hasLockingEffect = false; }
                  let activatePassiveEffect: ActivatePassiveEffect;
                  let player: Player | null
                  console.log(cardActivated)
                  if (cardActivated.getComponent(Monster) == null && cardActivated.getComponent(Card)!.type != CARD_TYPE.BONUS_SOULS) {
                        player = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(cardActivated);
                  } else {
                        console.log(meta.methodScope)
                        if (!meta.methodScope) { debugger; throw new Error("No Method Scope"); }

                        player = meta.methodScope.getComponent(Player);
                        console.log(`is scope`)
                        if (!player) {
                              player = WrapperProvider.turnsManagerWrapper.out.getCurrentTurn()!.getTurnPlayer();
                              console.log(`is turn player`)
                        }
                  }
                  if (!player) { debugger; throw new Error("No Player Found"); }

                  activatePassiveEffect = new ActivatePassiveEffect(player.character!.getComponent(Card)!._cardId, hasLockingEffect, player.playerId, cardActivated, passiveEffect, false, true, index)
                  if (passivesToActivate.length - i == 1) {
                        await WrapperProvider.stackWrapper.out.addToStack(activatePassiveEffect, true)
                  } else {
                        await WrapperProvider.stackWrapper.out.addToStackAbove(activatePassiveEffect)
                  }
            }

            whevent.emit(GAME_EVENTS.PASSIVE_MAN_PASSIVE_PHASE_OVER)
            WrapperProvider.passiveManagerWrapper.out.inPassivePhase = false;
            const result = this.afterActivationMap.get(meta.index)!.result
            //this.clearPassiveMethodData(meta.index, true, true)
            return result;

      };

      // LIFE-CYCLE CALLBACKS:

      // onLoad () {}

      start() { }

      // update (dt) {}
}



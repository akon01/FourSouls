import { CCInteger, Component, error, log, Node, ParticleSystem, _decorator } from 'cc';
import { Signal } from "../../Misc/Signal";
import { whevent } from "../../ServerClient/whevent";
import { Condition } from "../CardEffectComponents/CardConditions/Condition";
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { Cost } from "../CardEffectComponents/Costs/Cost";
import { ChainCollector } from "../CardEffectComponents/DataCollector/ChainCollector";
import { DataCollector } from "../CardEffectComponents/DataCollector/DataCollector";
import { EffectDataConcurencyBase } from "../CardEffectComponents/EffectDataConcurency/EffectDataConcurencyBase";
import { IMultiEffectChoose } from '../CardEffectComponents/MultiEffectChooser/IMultiEffectChoose';
import { PreCondition } from "../CardEffectComponents/PreConditions/PreCondition";
import { EFFECT_ANIMATION_TIME, GAME_EVENTS, ITEM_TYPE, PARTICLE_TYPES } from "../Constants";
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { EffectData } from '../Managers/EffectData';
import { EffectRunner } from '../Managers/EffectRunner';
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { ServerEffectData } from '../Managers/ServerEffectData';
import { WrapperProvider } from '../Managers/WrapperProvider';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { Item } from "./CardTypes/Item";
import { Card } from "./GameEntities/Card";
import { ServerEffect } from "./ServerCardEffect";
const { ccclass, property } = _decorator;


@ccclass('CardEffect')
export class CardEffect extends Component {

  @property
  hasDestroySelfEffect = false;


  getCondition<T extends Condition>(id: number) {
    return this.node.getComponents(Condition).find(cond => cond.ConditionId == id) as T
  }

  getAllEffects() {
    return [...this.getActiveEffects(), ...this.getPaidEffects(), ...this.getPassiveEffects(), ...this.getToAddPassiveEffects()]
  }

  getDataConcurency<T extends EffectDataConcurencyBase>(id: number): EffectDataConcurencyBase {
    return this.node.getComponents(EffectDataConcurencyBase).find(edc => edc.ConcurencyId == id) as T
  }

  getActiveEffects() {
    return this.activeEffects
    // return this.activeEffectsIdsFinal.map(id => this.getEffect(id))
  }

  @property({ type: [CCInteger], multiline: true })
  activeEffectsIdsFinal: number[] = []

  @property([Component])
  activeEffects: Effect[] = []

  getPassiveEffects() {
    return this.passiveEffects
    // return this.passiveEffectsIdsFinal.map(id => this.getEffect(id))
  }

  @property({ type: [CCInteger], multiline: true })
  passiveEffectsIdsFinal: number[] = []

  @property([Component])
  passiveEffects: Effect[] = []


  getToAddPassiveEffects() {
    return this.toAddPassiveEffects
    // return this.toAddPassiveEffectsIdsFinal.map(id => this.getEffect(id))
  }


  @property({ type: [CCInteger], multiline: true })
  toAddPassiveEffectsIdsFinal: number[] = []

  @property([Effect])
  toAddPassiveEffects: Effect[] = []

  getPaidEffects() {
    return this.paidEffects
    // return this.paidEffectsIdsFinal.map(id => this.getEffect(id))
  }

  @property({ type: [CCInteger], multiline: true })
  paidEffectsIdsFinal: number[] = []

  @property([Effect])
  paidEffects: Effect[] = []

  getEffect<T extends Effect>(id: number) {
    return this.node.getComponents(Effect).find(effect => effect.EffectId == id) as T
  }

  @property
  hasMultipleEffects = false;

  isHandlingMultiEffectCollector = false

  getMultiEffectCollector() {
    return this.multiEffectCollector
    // if (this.multiEffectCollectorIdFinal != -1) {
    //   return this.getDataCollector(this.multiEffectCollectorIdFinal)
    // }
    // return null
  }

  getDataCollector<T extends DataCollector>(id: number) {
    return this.node.getComponents(DataCollector)[id] as T
  }

  getCost<T extends Cost>(id: number) {
    return this.node.getComponents(Cost).find(cost => cost.CostId == id) as T
  }

  getCondtion<T extends Condition>(id: number) {
    return this.node.getComponents(Condition).find(cond => cond.ConditionId == id) as T
  }

  getPreCondtion<T extends PreCondition>(id: number) {
    return this.node.getComponents(PreCondition).find(pre => pre.PreConditionId == id) as T
  }

  // @ts-ignore
  @property({
    type: CCInteger, visible: function (this: CardEffect) {
      if (this.hasMultipleEffects) { return true }
    }
  })
  multiEffectCollectorIdFinal = -1

  @property({
    type: DataCollector, visible: function (this: CardEffect) {
      return this.hasMultipleEffects
    }
  })
  multiEffectCollector: DataCollector | null = null

  effectData: ServerEffectData | null = null;


  concurentEffectData: ActiveEffectData | PassiveEffectData | null = null


  data: any = {};


  cardPlayerId = 0;

  serverEffectStack: ServerEffect[] = [];

  // addEffect(effect: Effect, effectType: ITEM_TYPE, addToEffectList: boolean) {
  //   const newEffect: Effect = this.node.addComponent(effect.constructor.name)
  //   newEffect.resetInEditor()
  //   return handleEffect(newEffect, effect, this.node, effectType, addToEffectList)
  // }

  /**
   * @throws an error if there is an empty active effect slot in the cardEffect
   * @returns true if any one of the effects can be activated, false otherwise
   */
  testEffectsPreConditions(withPassives: boolean) {
    const boolPool: boolean[] = []
    const itemComp = this.node.getComponent(Item)
    const activeEffects = this.getActiveEffects();
    const passiveEffects = this.getPassiveEffects();
    const toAddPassiveEffects = this.getToAddPassiveEffects();
    const paidEffects = this.getPaidEffects();
    let itemIsActivated: boolean
    if (itemComp != null) {
      itemIsActivated = itemComp.needsRecharge
    } else {
      itemIsActivated = false;
    }
    let innerBoolPool = []

    const multiEffectCollector = this.getMultiEffectCollector();
    const cost = multiEffectCollector?.getCost();
    // if (!itemIsActivated) {
    if (cost != undefined) {
      if (cost.testPreCondition()) {
        return true
      } else { return false }
    }


    for (const activeEffect of activeEffects) {
      if (!activeEffect) { throw new Error(`An Empty Active Effect Slot In ${this.node.name}`) }
      const preCondition = activeEffect.getPreCondition()
      if (itemComp) {
        if (itemComp.needsRecharge) {
          continue
        }
      }
      if (preCondition != null) {
        //console.log(`testing ${this.node.name} effect ${activeEffect.name} precondition ${preCondition.name}`)
        if (preCondition.testCondition()) {

          return true;
        }

      } else {
        return true
      }

    }

    if (innerBoolPool.length >= activeEffects.filter(effect => { if (effect.getPreCondition() == null) { return true } }).length) {
      boolPool.push(true)
    }
    // } else {
    //  boolPool.push(true)
    //}
    innerBoolPool = []
    if (withPassives) {
      for (const passiveEffect of passiveEffects) {
        if (!passiveEffect) { throw new Error(`An Empty Passive Effect Slot In ${this.node.name}`) }
        const preCondition = passiveEffect.getPreCondition()
        if (preCondition != null && preCondition.testCondition()) {

          return true;
        } else if (preCondition == null) {
          return true
        }
      }

      if (innerBoolPool.length >= passiveEffects.filter(effect => { if (effect.getPreCondition() == null) { return true } }).length) {
        boolPool.push(true)
      }
      innerBoolPool = []
    }
    for (const paidEffect of paidEffects) {
      if (!paidEffect) { throw new Error(`An Empty Paid Effect Slot In ${this.node.name}`) }
      const preCondition = paidEffect.getPreCondition()
      if (preCondition != null && preCondition.testCondition()) {

        return true;
      } else if (preCondition == null) {
        return true
      }
    }

    if (innerBoolPool.length >= paidEffects.filter(effect => { if (effect.getPreCondition() == null) { return true } }).length) {
      boolPool.push(true)
    }
    innerBoolPool = []
    for (const toAddPassiveEffect of toAddPassiveEffects) {
      if (!toAddPassiveEffect) { throw new Error(`An Empty ToAdd Passive Effect Slot In ${this.node.name}`) }
      const preCondition = toAddPassiveEffect.getPreCondition()
      if (preCondition != null && preCondition.testCondition()) {

        return true;
      } else if (preCondition == null) {
        return true
      }
    }

    if (innerBoolPool.length >= toAddPassiveEffects.filter(effect => { if (effect.getPreCondition() == null) { return true } }).length) {
      boolPool.push(true)
    }

    // if (boolPool.length == 4) {

    //   return true;
    // }
    console.log(`no effect passes pre-conditions on ${this.node.name}`)
    return false;
  }

  /**
   *
   * @param data {effect}
   */
  async doEffectByNumAndType(
    numOfEffect: number,
    type: ITEM_TYPE,
    effectData: EffectData) {
    let serverEffectStack: StackEffectInterface[] | EffectData | null = null;
    const chosenEffect: Effect | null = this.getEffectByNumAndType(numOfEffect, type)
    if (!chosenEffect) throw new Error("No Chosen Effect To Do!!");

    try {
      let doEffect = true
      if (chosenEffect.optionalAfterDataCollection) {
        console.log(chosenEffect)
        doEffect = await WrapperProvider.playerManagerWrapper.out.getPlayerById(this.cardPlayerId)!.giveYesNoChoice(chosenEffect.optionalFlavorText)
      }
      if (doEffect) {
        serverEffectStack = await EffectRunner.runEffect(chosenEffect, WrapperProvider.stackWrapper.out._currentStack, effectData)
        // serverEffectStack = await chosenEffect.doEffect(
        //   WrapperProvider.stackWrapper.out._currentStack,
        //   effectData
        // );

        // if (chosenEffect.hasDataConcurency) {
        //   chosenEffect.runDataConcurency(effectData, numOfEffect, type, true)
        // }
      } else {
        return effectData
      }
    } catch (error) {
      WrapperProvider.loggerWrapper.out.error(error)
      WrapperProvider.loggerWrapper.out.error(`effect ${chosenEffect.effectName} failed to execute`, effectData)
    }
    return serverEffectStack!
  }


  getEffectByNumAndType(effectNum: number, effectType: ITEM_TYPE) {
    switch (effectType) {
      case ITEM_TYPE.ACTIVE:
        const activeEffects = this.getActiveEffects();
        for (let i = 0; i < activeEffects.length; i++) {
          const effect = activeEffects[i]
          if (i == effectNum) {
            return effect
          }
        }
        break;
      case ITEM_TYPE.PASSIVE: {
        const passiveEffects = this.getPassiveEffects();
        for (let i = 0; i < passiveEffects.length; i++) {
          const effect = passiveEffects[i]
          if (i == effectNum) {
            return effect
          }
        }
      }
        break;
      case ITEM_TYPE.TO_ADD_PASSIVE:
        const toAddPassiveEffects = this.getToAddPassiveEffects();
        for (let i = 0; i < toAddPassiveEffects.length; i++) {
          const effect = toAddPassiveEffects[i]
          if (i == effectNum) {
            return effect
          }
        }
        break;
      case ITEM_TYPE.PAID:
        const paidEffects = this.getPaidEffects();
        for (let i = 0; i < paidEffects.length; i++) {
          const effect = paidEffects[i]
          if (i == effectNum) {
            return effect
          }
        }
        break
      default:
        WrapperProvider.loggerWrapper.out.error("effect type is not one of the registered ITEM_TYPE enum")
        return null
    }
    return null
    WrapperProvider.loggerWrapper.out.error(`no effect found for ${effectNum} and type ${effectType} in card ${this.node.name}`)
  }

  sendServerCardEffect(oldData: any) {
    const data = {
      cardId: this.node.getComponent(Card)!._cardId,
      effectData: oldData
    };
    WrapperProvider.serverClientWrapper.out.send(Signal.SERVER_CARD_EFFECT, data);
  }

  async collectEffectData(
    effect: Effect,
    oldData: { cardPlayerId: number; cardId: number },
    isFromChainCollector?: boolean
  ) {
    let data: any;
    let endData: ActiveEffectData | PassiveEffectData | null = null;
    // const isActive = (this.getEffectIndexAndType(effect).type == ITEM_TYPE.ACTIVE) ? true : false
    const isActive = effect.conditions.length == 0 ? true : false
    if (effect.dataCollectors.length > 0) {
      const dataCollectors = effect.getDataCollectors();
      for (let o = 0; o < dataCollectors.length; o++) {
        const dataCollector = dataCollectors[o];
        console.log(`collecting data for ${effect.name} with ${dataCollector.name}`)
        try {
          data = await dataCollector.collectData(oldData)

        } catch (error) {
          WrapperProvider.announcementLableWrapper.out.showAnnouncement(error.error, 3, true)
          WrapperProvider.loggerWrapper.out.error(error)
        }
        console.log(`data collected from ${dataCollector.collectorName}: `, data)

        if (endData == null) {
          console.log(`first data collected in ${effect.effectName} which have ${effect.dataCollectors.length} collectors`)
          if (dataCollector instanceof ChainCollector) {
            endData = WrapperProvider.dataInerpreterWrapper.out.makeEffectData(data, this.node, oldData.cardPlayerId, isActive, true)
          } else {
            endData = WrapperProvider.dataInerpreterWrapper.out.makeEffectData(data, this.node, oldData.cardPlayerId, isActive, false)
          }
        } else {
          console.log(`Not first collector , end data is `)
          console.log(endData)
          endData.addTarget(data)
          console.log(endData)
        }
      }
    } else if (!effect.noDataCollector) {
      // throw new Error(`tring to collect data for ${effect.effectName} but it has no data collector`)
      console.error(`tring to collect data for ${effect.effectName} but it has no data collector`)
    }

    // if (endData instanceof ActiveEffectData) data = WrapperProvider.dataInerpreterWrapper.out.convertToServerData(endData)
    try {

      data = WrapperProvider.dataInerpreterWrapper.out.convertToServerData(endData!)
    } catch (error) {
      WrapperProvider.loggerWrapper.out.error(error)
    }
    //  data = await effect.dataCollector.collectData(oldData);
    console.log(data)
    return data;
  }

  /**
   * @throws an error when there is an empty slot
   * @param effect an effect of this card
   */
  getEffectIndexAndType(effect: Effect) {
    if (!effect) {
      throw new Error(`Cant Get Effect Index And Type Of Null Effect`)
    }
    const activeEffects = this.getActiveEffects();
    const passiveEffects = this.getPassiveEffects();
    const toAddPassiveEffects = this.getToAddPassiveEffects();
    const paidEffects = this.getPaidEffects();
    //const splitName = effect.effectName
    for (let i = 0; i < activeEffects.length; i++) {
      if (!activeEffects[i]) { throw new Error(`Empty Active Effect Slot`) }
      const testedEffect = activeEffects[i]
      //const splitTestedName = testedEffect.effectName

      if (effect.uuid == testedEffect.uuid) {
        //  if (splitName[1] == splitTestedName[1]) {
        return { type: ITEM_TYPE.ACTIVE, index: i };
      }
    }
    for (let i = 0; i < passiveEffects.length; i++) {
      if (!passiveEffects[i]) { throw new Error(`Empty Passive Effect Slot`) }
      const passiveEffect = passiveEffects[i];
      // const splitTestedName = passiveEffect.effectName
      // if (splitName[1] == splitTestedName[1]) {

      if (effect.uuid == passiveEffect.uuid) {
        return { type: ITEM_TYPE.PASSIVE, index: i };
      }
    }
    for (let i = 0; i < toAddPassiveEffects.length; i++) {
      if (!toAddPassiveEffects[i]) { throw new Error(`Empty ToAdd Passive Effect Slot`) }
      const toAddPassiveEffect = toAddPassiveEffects[i]
      // const splitTestedName = toAddPassiveEffect.effectName
      //if (splitName[1] == splitTestedName[1]) {

      if (effect.uuid == toAddPassiveEffect.uuid) {
        return { type: ITEM_TYPE.TO_ADD_PASSIVE, index: i };
      }
    }
    for (let i = 0; i < paidEffects.length; i++) {
      if (!paidEffects[i]) { throw new Error(`Empty Paid Effect Slot`) }
      const paidEffect = paidEffects[i]
      // const splitTestedName = paidEffect.effectName
      // if (splitName[1] == splitTestedName[1]) {

      if (effect.uuid == paidEffect.uuid) {
        return { type: ITEM_TYPE.PAID, index: i };
      }
    }
    throw new Error(`No Effect was found on ${WrapperProvider.cardManagerWrapper.out.getCardNodeByChild(this.node)!.getComponent(Card)!.name} with the name ${effect.effectName}`)
  }

  async collectEffectFromNum(cardPlayed: Node, cardPlayerId: number) {
    const multiEffectCollector: DataCollector | null = this.getMultiEffectCollector()
    if (!multiEffectCollector) { debugger; throw new Error("should not be here") }
    const chosenEffect = await multiEffectCollector.collectData({
      cardPlayed: cardPlayed,
      cardPlayerId: cardPlayerId
    });
    return chosenEffect;
  }

  ///TEST!!
  async getServerEffect(cardEffect: Effect, cardPlayerId: number, collectEffectData: boolean) {
    if (cardEffect == null || cardEffect == undefined) { throw new Error("CardEffect is null") }
    const cardPlayed = this.node
    const effectData = this.getEffectIndexAndType(cardEffect);
    const serverEffect = new ServerEffect(
      cardEffect.effectName,
      effectData.index,
      cardPlayerId,
      cardPlayed.getComponent(Card)!._cardId,
      effectData.type
    );
    const cost = cardEffect.getCost()
    //pay costs like counters/destroing items and so on
    if (cost != null) {
      await cost.takeCost()
    }

    const cardPlayedData = { cardPlayerId: cardPlayerId, cardId: cardPlayed.getComponent(Card)!._cardId }

    if (collectEffectData) {
      if (cardEffect.dataCollectors.length > 0) {
        const data = await this.collectEffectData(cardEffect, cardPlayedData);
        //    console.log(data)
        this.effectData = data
      } else {
        if (cardEffect.dataCollectors.length > 0) {
          WrapperProvider.loggerWrapper.out.error(`need to collect data for ${cardEffect.name}  but cant!`)
        }
      }
    }
    if (this.effectData != null) {
      serverEffect.cardEffectData = this.effectData;
    }
    serverEffect.hasSubAction = false;

    return serverEffect;
  }

  async doEffectAnimation() {
    const particleSystem = this.node.getComponentInChildren(ParticleSystem)
    WrapperProvider.soundManagerWrapper.out.playSound(WrapperProvider.soundManagerWrapper.out.cardEffectActivate!)
    WrapperProvider.particleManagerWrapper.out.activateParticleEffect(this.node, PARTICLE_TYPES.ACTIVATE_EFFECT, true)
    setTimeout(() => {
      whevent.emit(GAME_EVENTS.CARD_EFFECT_ANIM_END, this.node)
    }, EFFECT_ANIMATION_TIME * 1000);
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.CARD_EFFECT_ANIM_END, (cardWithAnim: Node) => {
        if (cardWithAnim == this.node) {
          WrapperProvider.particleManagerWrapper.out.disableParticleEffect(this.node, PARTICLE_TYPES.ACTIVATE_EFFECT, true)
          resolve(true)
        }
      })

    })
  }

  async doServerEffect2(
    currentServerEffect: ServerEffect,
    allStackEffects: StackEffectInterface[]
  ) {
    console.log(
      "doing effect: " +
      currentServerEffect.effectName +
      " of card: " +
      this.node.name
    );

    await this.doEffectAnimation()

    //interpret data --- not for chainEffect effectData
    let effectData: EffectData | null = null
    if (currentServerEffect.cardEffectData != null) {
      if (!(currentServerEffect.cardEffectData instanceof EffectData)) {
        effectData = WrapperProvider.dataInerpreterWrapper.out.convertToEffectData(currentServerEffect.cardEffectData)
      } else {
        effectData = currentServerEffect.cardEffectData
      }
      //TODO: check!
      this.effectData = effectData as any;
      //if effect is chainEffects
    }
    this.cardPlayerId = currentServerEffect.cardPlayerId;
    let newStackOrPassiveData: StackEffectInterface[] | EffectData | null = null;

    // if (currentServerEffect.effctType == ITEM_TYPE.ACTIVE) {
    newStackOrPassiveData = await this.doEffectByNumAndType(
      currentServerEffect.cardEffectNum,
      currentServerEffect.effctType,
      effectData!
    );

    //TODO - TEST!!!! NEW!
    this.effectData = null

    return newStackOrPassiveData

  }

  // getOnlyEffect() {
  //   if ((this.activeEffects.length == 1) && (this.paidEffects.length == 0) && (this.passiveEffects.length == 0)) {
  //     return this.activeEffects[0].getComponent(Effect)
  //   }
  //   if ((this.activeEffects.length == 0) && (this.paidEffects.length == 1) && (this.passiveEffects.length == 0)) {
  //     return this.paidEffects[0].getComponent(Effect)
  //   }
  //   if ((this.activeEffects.length == 0) && (this.paidEffects.length == 0) && (this.passiveEffects.length == 1)) {
  //     return this.passiveEffects[0].getComponent(Effect)
  //   }
  // }

  // LIFE-CYCLE CALLBACKS:

  // update (dt) {}
}


import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import { whevent } from "../../ServerClient/whevent";
import Condition from "../CardEffectComponents/CardConditions/Condition";
import Effect from "../CardEffectComponents/CardEffects/Effect";
import Cost from "../CardEffectComponents/Costs/Cost";
import ChainCollector from "../CardEffectComponents/DataCollector/ChainCollector";
import DataCollector from "../CardEffectComponents/DataCollector/DataCollector";
import EffectDataConcurencyBase from "../CardEffectComponents/EffectDataConcurency/EffectDataConcurencyBase";
import IdAndName from "../CardEffectComponents/IdAndNameComponent";
import PreCondition from "../CardEffectComponents/PreConditions/PreCondition";
import { EFFECT_ANIMATION_TIME, GAME_EVENTS, ITEM_TYPE, PARTICLE_TYPES } from "../Constants";
import EffectsAndOptionalChoice from "../EffectAndOptionalChoice";
import AnnouncementLable from "../LableScripts/Announcement Lable";
import DataInterpreter, { ActiveEffectData, EffectData, PassiveEffectData, ServerEffectData } from "../Managers/DataInterpreter";
import ParticleManager from "../Managers/ParticleManager";
import PlayerManager from "../Managers/PlayerManager";
import SoundManager from "../Managers/SoundManager";
import { handleEffect } from "../reset";
import StackEffectInterface from "../StackEffects/StackEffectInterface";
import Item from "./CardTypes/Item";
import Card from "./GameEntities/Card";
import { Logger } from "./Logger";
import { ServerEffect } from "./ServerCardEffect";
import Stack from "./Stack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardEffect extends cc.Component {

  @property
  hasDestroySelfEffect: boolean = false;


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
    return this.activeEffectsIds.map(eid => eid.id).map(id => this.getEffect(id))
  }

  @property({ type: IdAndName, multiline: true })
  activeEffectsIds: IdAndName[] = []


  @property({ type: [cc.Integer], multiline: true })
  activeEffectsIdsFinal: number[] = []

  getPassiveEffects() {
    return this.passiveEffectsIds.map(eid => eid.id).map(id => this.getEffect(id))
  }

  @property({ type: IdAndName, multiline: true })
  passiveEffectsIds: IdAndName[] = []

  @property({ type: [cc.Integer], multiline: true })
  passiveEffectsIdsFinal: number[] = []


  getToAddPassiveEffects() {
    return this.toAddPassiveEffectsIds.map(eid => eid.id).map(id => this.getEffect(id))
  }

  @property({ type: IdAndName, multiline: true })
  toAddPassiveEffectsIds: IdAndName[] = []


  @property({ type: [cc.Integer], multiline: true })
  toAddPassiveEffectsIdsFinal: number[] = []


  getPaidEffects() {
    return this.paidEffectsIds.map(eid => eid.id).map(id => this.getEffect(id))
  }

  @property({ type: IdAndName, multiline: true })
  paidEffectsIds: IdAndName[] = []


  @property({ type: [cc.Integer], multiline: true })
  paidEffectsIdsFinal: number[] = []

  getEffect<T extends Effect>(id: number) {
    return this.node.getComponents(Effect).find(effect => effect.EffectId == id) as T
  }

  @property
  hasMultipleEffects: boolean = false;

  isHandlingMultiEffectCollector: boolean = false

  getMultiEffectCollector() {
    if (this.multiEffectCollectorId) {
      return this.getDataCollector(this.multiEffectCollectorId.id)
    }
    return null
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

  @property({
    type: IdAndName, visible: function (this: CardEffect) {
      if (this.hasMultipleEffects) { return true }
    }
  })
  private multiEffectCollectorId: IdAndName = null

  @property({
    type: cc.Integer, visible: function (this: CardEffect) {
      if (this.hasMultipleEffects) { return true }
    }
  })
  private multiEffectCollectorIdFinal: number = -1

  @property({ visible: false })
  effectData: ServerEffectData = null;

  @property({ visible: false })
  concurentEffectData: ActiveEffectData | PassiveEffectData = null

  @property({ visible: false })
  data: {} = {};

  @property({ visible: false })
  cardPlayerId: number = 0;

  @property
  serverEffectStack: ServerEffect[] = [];

  addEffect(effect: Effect, effectType: ITEM_TYPE, addToEffectList: boolean) {
    const newEffect: Effect = this.node.addComponent(effect.constructor.name)
    newEffect.resetInEditor()
    return handleEffect(newEffect, effect, this.node, effectType, addToEffectList)
  }

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
    // if (!itemIsActivated) {
    if (multiEffectCollector?.cost != undefined) {
      if (multiEffectCollector?.cost?.testPreCondition()) {
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
        //cc.log(`testing ${this.node.name} effect ${activeEffect.name} precondition ${preCondition.name}`)
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
    cc.log(`no effect passes pre-conditions on ${this.node.name}`)
    return false;
  }

  /**
   *
   * @param data {effect}
   */
  async doEffectByNumAndType(
    numOfEffect: number,
    type: ITEM_TYPE,
    effectData: any) {
    let serverEffectStack = null;
    const chosenEffect: Effect = this.getEffectByNumAndType(numOfEffect, type)
    try {
      let doEffect = true
      if (chosenEffect.optionalAfterDataCollection) {
        cc.log(chosenEffect)
        doEffect = await PlayerManager.getPlayerById(this.cardPlayerId).giveYesNoChoice(chosenEffect.optionalFlavorText)
      }
      if (doEffect) {
        serverEffectStack = await chosenEffect.doEffect(
          Stack._currentStack,
          effectData
        );

        if (chosenEffect.hasDataConcurency) {
          chosenEffect.runDataConcurency(effectData, numOfEffect, type, true)
        }
      } else {
        return effectData
      }
    } catch (error) {
      Logger.error(error)
      Logger.error(`effect ${chosenEffect.effectName} failed to execute`, effectData)
    }
    return serverEffectStack
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
      default:
        Logger.error("effect type is not one of the registered ITEM_TYPE enum")
        break;
    }
    Logger.error(`no effect found for ${effectNum} and type ${effectType} in card ${this.node.name}`)
  }

  sendServerCardEffect(oldData) {
    const data = {
      cardId: this.node.getComponent(Card)._cardId,
      effectData: oldData
    };
    ServerClient.$.send(Signal.SERVER_CARD_EFFECT, data);
  }

  async collectEffectData(
    effect: Effect,
    oldData: { cardPlayerId: number; cardId: number },
    isFromChainCollector?: boolean
  ) {
    let data: any;
    let endData: ActiveEffectData | PassiveEffectData = null;
    // const isActive = (this.getEffectIndexAndType(effect).type == ITEM_TYPE.ACTIVE) ? true : false
    const isActive = effect.conditionsIds.length == 0 ? true : false
    if (effect.dataCollectorsIds.length > 0) {
      const dataCollectors = effect.getDataCollectors();
      for (let o = 0; o < dataCollectors.length; o++) {
        const dataCollector = dataCollectors[o];
        cc.log(`collecting data for ${effect.name} with ${dataCollector.name}`)
        try {
          data = await dataCollector.collectData(oldData)

        } catch (error) {
          AnnouncementLable.$.showAnnouncement(error.error, 3, true)
          Logger.error(error)
        }
        cc.log(`data collected from ${dataCollector.collectorName}: `, data)

        if (endData == null) {
          cc.log(`first data collected in ${effect.effectName} which have ${effect.dataCollectorsIds.length} collectors`)
          if (dataCollector instanceof ChainCollector) {
            endData = DataInterpreter.makeEffectData(data, this.node, oldData.cardPlayerId, isActive, true)
          } else {
            endData = DataInterpreter.makeEffectData(data, this.node, oldData.cardPlayerId, isActive, false)
          }
        } else {
          cc.log(`Not first collector , end data is `)
          cc.log(endData)
          endData.addTarget(data)
          cc.log(endData)
        }
      }
    } else if (!effect.noDataCollector) {
      // throw new Error(`tring to collect data for ${effect.effectName} but it has no data collector`)
      cc.error(`tring to collect data for ${effect.effectName} but it has no data collector`)
    }

    // if (endData instanceof ActiveEffectData) data = DataInterpreter.convertToServerData(endData)
    try {

      data = DataInterpreter.convertToServerData(endData)
    } catch (error) {
      Logger.error(error)
    }
    //  data = await effect.dataCollector.collectData(oldData);
    cc.log(data)
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
    throw new Error(`No Effect was found on ${Card.getCardNodeByChild(this.node).getComponent(Card).name} with the name ${effect.effectName}`)
  }

  async collectEffectFromNum(cardPlayed: cc.Node, cardPlayerId: number) {
    const multiEffectCollector: DataCollector = this.getMultiEffectCollector()
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
      cardPlayed.getComponent(Card)._cardId,
      effectData.type
    );
    const cost = cardEffect.getCost()
    //pay costs like counters/destroing items and so on
    if (cost != null) {
      await cost.takeCost()
    }

    const cardPlayedData = { cardPlayerId: cardPlayerId, cardId: cardPlayed.getComponent(Card)._cardId }

    if (collectEffectData) {
      if (cardEffect.dataCollectorsIds.length > 0) {
        const data = await this.collectEffectData(cardEffect, cardPlayedData);
        //    cc.log(data)
        this.effectData = data
      } else {
        if (cardEffect.dataCollectorsIds.length > 0) {
          Logger.error(`need to collect data for ${cardEffect.name}  but cant!`)
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
    const particleSystem = this.node.getComponentInChildren(cc.ParticleSystem)
    SoundManager.$.playSound(SoundManager.$.cardEffectActivate)
    ParticleManager.activateParticleEffect(this.node, PARTICLE_TYPES.ACTIVATE_EFFECT, true)
    setTimeout(() => {
      whevent.emit(GAME_EVENTS.CARD_EFFECT_ANIM_END, this.node)
    }, EFFECT_ANIMATION_TIME * 1000);
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.CARD_EFFECT_ANIM_END, (cardWithAnim: cc.Node) => {
        if (cardWithAnim == this.node) {
          ParticleManager.disableParticleEffect(this.node, PARTICLE_TYPES.ACTIVATE_EFFECT, true)
          resolve(true)
        }
      })

    })
  }

  async doServerEffect2(
    currentServerEffect: ServerEffect,
    allStackEffects: StackEffectInterface[]
  ) {
    cc.log(
      "doing effect: " +
      currentServerEffect.effectName +
      " of card: " +
      this.node.name
    );

    await this.doEffectAnimation()

    //interpret data --- not for chainEffect effectData
    let effectData
    if (currentServerEffect.cardEffectData != null) {
      if (!(currentServerEffect.cardEffectData instanceof EffectData)) {
        effectData = DataInterpreter.convertToEffectData(currentServerEffect.cardEffectData)
      } else {
        effectData = currentServerEffect.cardEffectData
      }
      this.effectData = effectData;
      //if effect is chainEffects
    }
    this.cardPlayerId = currentServerEffect.cardPlayerId;
    let newStack;

    // if (currentServerEffect.effctType == ITEM_TYPE.ACTIVE) {
    newStack = await this.doEffectByNumAndType(
      currentServerEffect.cardEffectNum,
      currentServerEffect.effctType,
      effectData
    );

    //TODO - TEST!!!! NEW!
    this.effectData = null

    return newStack

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

  onLoad() {

  }

  //  }

  start() { }

  // update (dt) {}
}


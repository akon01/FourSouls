import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import Effect from "../CardEffectComponents/CardEffects/Effect";
import MultiEffectRoll from "../CardEffectComponents/MultiEffectChooser/MultiEffectRoll";
import { ARGS_TYPES, PASSIVE_EVENTS, PASSIVE_TYPE, GAME_EVENTS } from "../Constants";
import CardEffect from "../Entites/CardEffect";
import Monster from "../Entites/CardTypes/Monster";
import Card from "../Entites/GameEntities/Card";
import Player from "../Entites/GameEntities/Player";
import Stack from "../Entites/Stack";
import ActivatePassiveEffect from "../StackEffects/Activate Passive Effect";
import CardManager from "./CardManager";
import DataInterpreter, { ServerEffectData } from "./DataInterpreter";
import PlayerManager from "./PlayerManager";
import MultiEffectRollEffect from "../CardEffectComponents/CardEffects/MultiEffectRollAsEffect";
import TurnsManager from "./TurnsManager";
import { Logger } from "../Entites/Logger";




const { ccclass, property } = cc._decorator;

@ccclass

export default class PassiveManager extends cc.Component {
  static passiveItems: cc.Node[] = [];

  static allBeforeEffects: Effect[] = [];
  static allAfterEffects: Effect[] = [];
  static oneTurnBeforeEffects: Effect[] = [];
  static oneTurnAfterEffects: Effect[] = [];
  static inPassivePhase: boolean = false;

  static inRegisterPhase: boolean = false

  // static passiveMethodData: PassiveMeta

  static beforeActivationMap: Map<number, PassiveMeta> = new Map();
  static afterActivationMap: Map<number, PassiveMeta> = new Map();

  static beforeActivationIndex: number = 0;
  static afterActivationIndex: number = 0;


  static updatePassiveMethodData(newData: PassiveMeta, isAfterActivation: boolean, sendToServer: boolean) {
    let index = newData.index;
    if (index == null) {
      // cc.error(`passiveMeta has no index, give him one`)
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
      ServerClient.$.send(Signal.UPDATE_PASSIVE_DATA, { passiveData: serverData, isAfterActivation: isAfterActivation, index: index })
    }
    return index
  }

  static clearPassiveMethodData(index: number, isAfterActivation: boolean, sendToServer: boolean) {
    if (index) {
      if (isAfterActivation) {
        this.afterActivationMap.delete(index)
      } else {
        this.beforeActivationMap.delete(index)
      }

      if (sendToServer) {
        ServerClient.$.send(Signal.CLEAR_PASSIVE_DATA, { index: index, isAfterActivation: isAfterActivation })
      }
    }
  }


  static getPassivesinfo() {
    let passiveItemsCardIds = this.passiveItems.map(card => card.getComponent(Card)._cardId)
    return {
      allBeforeEffects: this.allBeforeEffects,
      allAfterEffects: this.allAfterEffects,
      oneTurnBeforeEffects: this.oneTurnBeforeEffects,
      oneTurnAfterEffects: this.oneTurnAfterEffects,
      passiveItemsCardIds: passiveItemsCardIds
    }
  }

  static updateInfo(info) {
    this.allAfterEffects = info.allAfterEffects;
    this.allBeforeEffects = info.allBeforeEffects;
    this.oneTurnAfterEffects = info.oneTurnAfterEffects;
    this.oneTurnBeforeEffects = info.oneTurnBeforeEffects;
    this.passiveItems = info.passiveItemsCardIds.map(id => { CardManager.getCardById(id, true) })
  }

  static async registerPassiveItem(itemToRegister: cc.Node, sendToServer: boolean) {
    if (this.inRegisterPhase) {
      let phaseOver = await this.waitForRegister()
    }
    this.inRegisterPhase = true;
    let cardEffect = itemToRegister.getComponent(CardEffect)
    if (itemToRegister.getComponent(CardEffect) != null) {

      if (cardEffect.passiveEffects.length > 0) {
        if (this.passiveItems.find(passiveItem => passiveItem == itemToRegister) == undefined) {
          this.passiveItems.push(itemToRegister);
          let cardPassives = cardEffect.passiveEffects.map(effectNode => {
            if (effectNode) return effectNode.getComponent(Effect);
          });

          //this.allPassiveEffects.concat(cardPassives);
          for (let passive of cardPassives) {
            if (!passive) continue
            if (passive.passiveType == PASSIVE_TYPE.AFTER) {

              this.allAfterEffects.push(passive);

            } else {

              this.allBeforeEffects.push(passive);
            }
          }
          if (sendToServer) {
            let cardId = itemToRegister.getComponent(Card)._cardId
            ServerClient.$.send(Signal.REGISTER_PASSIVE_ITEM, { cardId: cardId })
          }
        }

      }
    }
    this.inRegisterPhase = false;

  }

  static async registerOneTurnPassiveEffect(effect: Effect, sendToServer: boolean) {
    if (this.inRegisterPhase) {
      let phaseOver = await this.waitForRegister()
    }
    this.inRegisterPhase = true;
    if (effect.passiveType == PASSIVE_TYPE.AFTER) {

      this.oneTurnAfterEffects.push(effect);

    } else {

      this.oneTurnBeforeEffects.push(effect);
    }

    if (sendToServer) {
      let card = effect.node.parent.getComponent(Card)
      let effectIndex = card.node.getComponent(CardEffect).getEffectIndexAndType(effect)
      let conditionsData: ServerEffectData[] = [];
      for (let i = 0; i < effect.conditions.length; i++) {
        const condition = effect.conditions[i];
        conditionsData.push(DataInterpreter.convertToServerData(condition.conditionData))

      }
      // let serverEffectData = DataInterpreter.convertToServerData(effect.conditions.conditionData)
      //let srvData = { cardId: card._cardId, effectIndex: effectIndex, conditionData: serverEffectData }
      let srvData = { cardId: card._cardId, effectIndex: effectIndex, conditionData: conditionsData }
      ServerClient.$.send(Signal.REGISTER_ONE_TURN_PASSIVE_EFFECT, srvData)
    }

    this.inRegisterPhase = false;
  }

  static async waitForRegister(): Promise<boolean> {
    //w8 for a server message with a while,after the message is recived (should be a stack of effects with booleans) resolve with stack of effects.
    return new Promise((resolve, reject) => {
      whevent.onOnce(GAME_EVENTS.PASSIVE_MAN_PASSIVE_PHASE_OVER, (params) => {
        resolve(true);
      })
    });
  }

  static isCardRegistered(card: cc.Node) {
    return this.passiveItems.includes(card);
  }

  static clearAllListeners() {
    this.allAfterEffects = [];
    this.passiveItems = [];
  }

  static async testPassivesCondtions(passivesToCheck: Effect[], passiveMeta: PassiveMeta) {
    let allPassiveEffects = passivesToCheck;
    let allPassivesToActivate: Effect[] = []
    for (let i = 0; i < allPassiveEffects.length; i++) {
      const passiveEffect = allPassiveEffects[i];
      const effectCard = passiveEffect.node.parent;
      cc.log(`effect card tested is ${effectCard.name}`)

      let isTrue = true;
      if (passiveEffect.conditions.length == 0) {
        cc.error(`passive effect has no conditions`)
        isTrue = false;
      }
      cc.log(`start testing condition for ${effectCard.name}`)
      for (let i = 0; i < passiveEffect.conditions.length; i++) {
        const condition = passiveEffect.conditions[i];
        if (!condition) throw 'Empty condition space in Effect'
        if (condition.event) {
          condition.event == passiveMeta.passiveEvent ? isTrue = true : isTrue = false
        } else if (condition.events.length > 0) {
          let isOneOfTheEvents: boolean = false

          for (const event of condition.events) {
            if (event == passiveMeta.passiveEvent) isOneOfTheEvents = true
          }

          if (!isOneOfTheEvents) isTrue = false
        }

        if (isTrue && condition.dataCollector != null) {

          let cardOwner
          cardOwner = PlayerManager.getPlayerByCard(effectCard)
          cardOwner = cardOwner.character
          if (!cardOwner) cardOwner = effectCard
          let x = await condition.dataCollector.collectData({ cardPlayerId: cardOwner.getComponent(Card)._cardId, cardId: effectCard.getComponent(Card)._cardId })
          condition.conditionData = DataInterpreter.makeEffectData(x, effectCard, cardOwner.getComponent(Card)._cardId, false, false)
        }
        if (isTrue) cc.log(`test condition for ${passiveEffect.name} on ${effectCard.name} card`)
        try {
          if (isTrue && (await condition.testCondition(passiveMeta) == false)) isTrue = false;
        } catch (error) {
          cc.error(error)
          Logger.error(error)
          isTrue = false
        }
      }
      //  let isConditionTrue = await passiveEffect.conditions.testCondition(passiveMeta);
      //if (isConditionTrue) {
      if (isTrue) {
        cc.log('condition true')
        allPassivesToActivate.push(passiveEffect)
      } else {
        //condition wasnt true, do nothning
      }
    }
    return allPassivesToActivate
  }

  static async checkB4Passives(passiveMeta: PassiveMeta) {


    // if (!PlayerManager.mePlayer.getComponent(Player)._hasPriority) return { continue: true, args: passiveMeta.args };


    PassiveManager.inPassivePhase = true;
    let allPassiveEffects = PassiveManager.allBeforeEffects;
    allPassiveEffects = allPassiveEffects.concat(PassiveManager.oneTurnBeforeEffects)
    let allPassivesToActivate: Effect[] = [];
    cc.log(PassiveManager.allBeforeEffects)
    cc.log(allPassiveEffects)
    try {
      allPassivesToActivate = await this.testPassivesCondtions(allPassiveEffects, passiveMeta)
    } catch (error) {
      cc.error(error)
      Logger.error(error)
    }
    cc.log(allPassivesToActivate.map(effect => effect.name))
    let methodData = { continue: false, args: [] }
    let passiveData: PassiveMeta
    if (allPassivesToActivate.length > 0) {
      passiveData = await this.activateB4Passives(passiveMeta, allPassivesToActivate)
      methodData.continue = !passiveData.preventMethod
      methodData.args = passiveData.args;
    } else {
      methodData.continue = true
      methodData.args = passiveMeta.args;
    }
    if (passiveData) {
      this.clearPassiveMethodData(passiveData.index, false, true)
    }
    whevent.emit(GAME_EVENTS.PASSIVE_MAN_PASSIVE_PHASE_OVER)
    PassiveManager.inPassivePhase = false;

    return methodData;
  }

  static async activateB4Passives(passiveMeta: PassiveMeta, passivesToActivate: Effect[]) {
    let cardToActivate: cc.Node;
    let passiveIndex
    let cardActivatorId;

    let index = this.updatePassiveMethodData(passiveMeta, false, true)
    passiveMeta.index = index
    // this.passiveMethodData = passiveMeta
    let isPlayer = false;
    for (let i = 0; i < passivesToActivate.length; i++) {
      const effect = passivesToActivate[i];
      cc.log(`doing b4 passive effect ${effect.name}`)
      cardToActivate = effect.node.parent;

      passiveIndex = cardToActivate
        .getComponent(CardEffect)
        .getEffectIndexAndType(effect);
      if (cardToActivate.getComponent(Monster) == null) {
        let player = PlayerManager.getPlayerByCard(cardToActivate);
        cardActivatorId = player.playerId;
        isPlayer = true
      } else {

        let monster = cardToActivate.getComponent(Card)
        cardActivatorId = monster._cardId;
        //  monster.activatePassive(monster.cardId, passiveIndex, false)
      }
      let activatePassiveEffect: ActivatePassiveEffect
      let hasLockingEffect;
      let multiEffectRollEffect = cardToActivate.getComponent(CardEffect).passiveEffects[0];
      if (multiEffectRollEffect != null && multiEffectRollEffect.getComponent(Effect) instanceof MultiEffectRollEffect) {
        hasLockingEffect = true;
      } else hasLockingEffect = false;
      if (isPlayer) {
        let player = PlayerManager.getPlayerByCard(cardToActivate);
        cc.log(effect)
        activatePassiveEffect = new ActivatePassiveEffect(player.character.getComponent(Card)._cardId, hasLockingEffect, cardActivatorId, cardToActivate, effect, false, false, index)

      } else {
        cc.log(effect)
        activatePassiveEffect = new ActivatePassiveEffect(cardToActivate.getComponent(Card)._cardId, hasLockingEffect, cardActivatorId, cardToActivate, effect, false, false, index)
      }
      if (passivesToActivate.length - i == 1) {
        cc.log(`should be last passive effect to be added to the stack for this action, begin resolving`)
        // if (Stack._currentStackEffectsResolving.length == 0) {
        await Stack.addToStack(activatePassiveEffect, true)
        // } else {
        //   await Stack.addToStackAbove(activatePassiveEffect) 
        // }
      } else {
        cc.log(`should be more passives to add to stack, do not start resolving.`)
        await Stack.addToStackAbove(activatePassiveEffect)
      }

    }


    return this.beforeActivationMap.get(passiveMeta.index)
  }


  static async testForPassiveAfter(meta: PassiveMeta) {

    //  if (!PlayerManager.mePlayer.getComponent(Player)._hasPriority) return meta.result;


    cc.log(`passive after check`)
    let index = this.updatePassiveMethodData(meta, true, true)
    meta.index = index
    PassiveManager.inPassivePhase = true;
    let allPassiveEffects = PassiveManager.allAfterEffects;
    let passivesToActivate = [];
    try {
      passivesToActivate = await this.testPassivesCondtions(allPassiveEffects, meta)
    } catch (error) {
      cc.error(error)
      Logger.error(error)
    }
    for (let i = 0; i < passivesToActivate.length; i++) {
      const passiveEffect = passivesToActivate[i];
      cc.log(`doing passive after ${passiveEffect.name}`)

      let activated: boolean


      let cardActivated = passiveEffect.node.parent;
      let passiveIndex = cardActivated
        .getComponent(CardEffect)
        .getEffectIndexAndType(passiveEffect);
      let hasLockingEffect;
      let multiEffectRollEffect = cardActivated.getComponent(CardEffect).passiveEffects[0];
      if (multiEffectRollEffect != null && multiEffectRollEffect.getComponent(Effect) instanceof MultiEffectRollEffect) {
        hasLockingEffect = true;
      } else hasLockingEffect = false;
      let activatePassiveEffect: ActivatePassiveEffect;

      if (cardActivated.getComponent(Monster) == null) {
        let player = PlayerManager.getPlayerByCard(cardActivated);
        activatePassiveEffect = new ActivatePassiveEffect(player.character.getComponent(Card)._cardId, hasLockingEffect, player.playerId, cardActivated, passiveEffect, false, true, index)

      } else {
        let monster = cardActivated.getComponent(Card)
        activatePassiveEffect = new ActivatePassiveEffect(monster._cardId, hasLockingEffect, monster._cardId, cardActivated, passiveEffect, false, true, index)
      }
      if (passivesToActivate.length - i == 1) {
        cc.log(`should be last passive effect to be added to the stack for this action, begin resolving`)
        await Stack.addToStack(activatePassiveEffect, true)
      } else {
        cc.log(`should be more passives to add to stack, do not start resolving.`)
        await Stack.addToStackAbove(activatePassiveEffect)
      }
    }

    whevent.emit(GAME_EVENTS.PASSIVE_MAN_PASSIVE_PHASE_OVER)
    PassiveManager.inPassivePhase = false;
    let result = this.afterActivationMap.get(meta.index).result
    this.clearPassiveMethodData(meta.index, true, true)
    return result;

  };


  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }


  // update (dt) {}
}

export class PassiveMeta {

  constructor(passiveEvent: PASSIVE_EVENTS, args: any[], result: any, methodScope: cc.Node) {
    this.args = args
    this.passiveEvent = passiveEvent;
    this.methodScope = methodScope;
    this.preventMethod = false;
    this.result = result;
  }

  passiveEvent: PASSIVE_EVENTS = null;
  args: any[] = [];
  result: any = null;
  preventMethod: boolean = false;
  methodScope: cc.Node = null;
  index: number = null

  convertToServerPassiveMeta() {
    let serverPassiveMeta = new ServerPassiveMeta();
    serverPassiveMeta.passiveEvent = this.passiveEvent;
    serverPassiveMeta.preventMethod = this.preventMethod;
    serverPassiveMeta.result = this.result
    if (this.args) {
      for (let i = 0; i < this.args.length; i++) {
        const arg = this.args[i];
        if (arg instanceof cc.Node) {
          if (arg.getComponent(Card)) {
            serverPassiveMeta.args.push({ type: ARGS_TYPES.CARD, number: arg.getComponent(Card)._cardId })
          } else if (arg.getComponent(Player)) {
            serverPassiveMeta.args.push({ type: ARGS_TYPES.PLAYER, number: arg.getComponent(Player).character.getComponent(Card)._cardId })
          }
        } else {
          serverPassiveMeta.args.push({ type: ARGS_TYPES.NUMBER, number: arg })
        }
      }
    }
    if (this.methodScope.getComponent(Card)) {
      serverPassiveMeta.methodScopeId = this.methodScope.getComponent(Card)._cardId
    } else if (this.methodScope.getComponent(Player)) {
      serverPassiveMeta.methodScopeId = this.methodScope.getComponent(Player).character.getComponent(Card)._cardId
      serverPassiveMeta.scopeIsPlayer = true
    }
    serverPassiveMeta.index = this.index
    return serverPassiveMeta
  }

}


export class ServerPassiveMeta {

  passiveEvent: PASSIVE_EVENTS = null;
  args: { type: ARGS_TYPES, number: number }[] = [];
  result: any = null;
  preventMethod: boolean = false;
  methodScopeId: number = null;
  scopeIsPlayer: boolean = false;
  index: number = null

  convertToPassiveMeta() {
    let args = [];
    for (let i = 0; i < this.args.length; i++) {
      const arg = this.args[i];
      switch (arg.type) {
        case ARGS_TYPES.CARD:
          args.push(CardManager.getCardById(arg.number, true))
          break;
        case ARGS_TYPES.PLAYER:
          args.push(PlayerManager.getPlayerByCard(CardManager.getCardById(arg.number, true)))
          break;
        case ARGS_TYPES.NUMBER:
          args.push(arg)
        default:
          break;
      }
    }
    let scope;
    this.scopeIsPlayer ? scope = PlayerManager.getPlayerByCard(CardManager.getCardById(this.methodScopeId, true)) : scope = CardManager.getCardById(this.methodScopeId, true)
    let passiveMeta = new PassiveMeta(this.passiveEvent, args, this.result, scope)
    passiveMeta.index = this.index
    return passiveMeta
  }

}




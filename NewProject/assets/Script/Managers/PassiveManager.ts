import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import Effect from "../CardEffectComponents/CardEffects/Effect";
import MultiEffectRollEffect from "../CardEffectComponents/CardEffects/MultiEffectRollAsEffect";
import MultiEffectRoll from "../CardEffectComponents/MultiEffectChooser/MultiEffectRoll";
import { ARGS_TYPES, GAME_EVENTS, PASSIVE_EVENTS, PASSIVE_TYPE, CARD_TYPE } from "../Constants";
import CardEffect from "../Entites/CardEffect";
import Monster from "../Entites/CardTypes/Monster";
import Card from "../Entites/GameEntities/Card";
import Player from "../Entites/GameEntities/Player";
import { Logger } from "../Entites/Logger";
import Stack from "../Entites/Stack";
import ActivatePassiveEffect from "../StackEffects/Activate Passive Effect";
import CardManager from "./CardManager";
import DataInterpreter, { ServerEffectData } from "./DataInterpreter";
import PlayerManager from "./PlayerManager";
import TurnsManager from "./TurnsManager";
import { CardSet } from "../Entites/Card Set";
import { whevent } from "../../ServerClient/whevent";
import Item from "../Entites/CardTypes/Item";

const { ccclass, property } = cc._decorator;

@ccclass

export default class PassiveManager extends cc.Component {
  static passiveItems: CardSet = new CardSet()

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
    const passiveItemsCardIds = this.passiveItems.map(card => card.getComponent(Card)._cardId)
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
      const phaseOver = await this.waitForRegister()
    }
    this.inRegisterPhase = true;
    const cardEffect = itemToRegister.getComponent(CardEffect)
    if (itemToRegister.getComponent(CardEffect) != null) {

      if (cardEffect.passiveEffects.length > 0) {
        if (!this.isCardRegistered(itemToRegister)) {
          this.passiveItems.push(itemToRegister);
          const cardPassives = cardEffect.passiveEffects.map(effectNode => {
            if (effectNode) { return effectNode.getComponent(Effect); }
          });
          for (const passive of cardPassives) {
            if (!passive) { continue }
            //test check to see if any effects are registered with condition data already collected, if so , when registering on server, convert to ActiveEffectData\PassiveEffectData
            if (passive.conditions.find(condition => condition.conditionData != null) != undefined) {
              throw new Error(`trying to register a passive effect with condition data, change algorithm to pass the data thru the server`)
            }
            if (passive.passiveType == PASSIVE_TYPE.AFTER) {

              this.allAfterEffects.push(passive);

            } else {

              this.allBeforeEffects.push(passive);
            }
          }
          if (sendToServer) {
            cc.log(`regstered ${itemToRegister.name} to passive manager`)
            const cardId = itemToRegister.getComponent(Card)._cardId
            ServerClient.$.send(Signal.REGISTER_PASSIVE_ITEM, { cardId: cardId })
          }
        } else {
          cc.log(`card already registered`)
        }

      }
    }
    this.inRegisterPhase = false;
  }

  static removePassiveItemEffects(item: cc.Node, sendToServer: boolean) {
    if (this.isCardRegistered(item)) {
      const cardPassives = item.getComponent(CardEffect).passiveEffects.map(effectNode => effectNode.getComponent(Effect));
      this.passiveItems.splice(this.passiveItems.indexOf(item), 1)
      for (const passive of cardPassives) {
        if (!passive) { continue };
        if (passive.passiveType == PASSIVE_TYPE.AFTER) {

          this.allAfterEffects.splice(this.allAfterEffects.indexOf(passive), 1)

        } else {

          this.allBeforeEffects.splice(this.allBeforeEffects.indexOf(passive), 1)
        }
      }
      cc.log(`removed ${item.name} from passive effects`)
      cc.log(this.passiveItems)
      if (sendToServer) {
        ServerClient.$.send(Signal.REMOVE_FROM_PASSIVE_MANAGER, { cardId: item.getComponent(Card)._cardId })
      }
    } else {
      return
    }
  }

  static async registerOneTurnPassiveEffect(effect: Effect, sendToServer: boolean) {
    if (this.inRegisterPhase) {
      const phaseOver = await this.waitForRegister()
    }
    this.inRegisterPhase = true;
    if (effect.passiveType == PASSIVE_TYPE.AFTER) {

      this.oneTurnAfterEffects.push(effect);

    } else {

      this.oneTurnBeforeEffects.push(effect);
    }

    if (sendToServer) {
      const card = effect.node.parent.getComponent(Card)
      if (!card) { effect.node.parent.parent.getComponent(Card) }
      const effectIndex = card.node.getComponent(CardEffect).getEffectIndexAndType(effect)
      const conditionsData: ServerEffectData[] = [];
      for (let i = 0; i < effect.conditions.length; i++) {
        const condition = effect.conditions[i];
        try {
          conditionsData.push(DataInterpreter.convertToServerData(condition.conditionData))
        } catch (error) {
          Logger.error(error)
        }

      }
      // let serverEffectData = DataInterpreter.convertToServerData(effect.conditions.conditionData)
      //let srvData = { cardId: card._cardId, effectIndex: effectIndex, conditionData: serverEffectData }
      const srvData = { cardId: card._cardId, effectIndex: effectIndex, conditionData: conditionsData }
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
    this.passiveItems.clear();
  }

  static async testPassivesCondtions(passivesToCheck: Effect[], passiveMeta: PassiveMeta) {
    cc.error(`test passive Conditions for Event: ${passiveMeta.passiveEvent}`)
    const allPassiveEffects = passivesToCheck;
    const allPassivesToActivate: Effect[] = []
    for (let i = 0; i < allPassiveEffects.length; i++) {
      const passiveEffect = allPassiveEffects[i];
      const effectCard = passiveEffect.node.parent;

      let isTrue = true;
      if (passiveEffect.conditions.length == 0) {
        cc.error(`passive effect ${passiveEffect.effectName} on ${Card.getCardNodeByChild(passiveEffect.node).name} has no conditions`)
        isTrue = false;
      }
      for (let i = 0; i < passiveEffect.conditions.length; i++) {
        const condition = passiveEffect.conditions[i];
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

        if (isTrue && condition.dataCollector != null) {
          cc.log(`${condition.name} is true and has data collector`)
          let cardOwner
          cardOwner = PlayerManager.getPlayerByCard(effectCard)
          if (cardOwner == null) {
            cardOwner = effectCard
          } else {
            cardOwner = cardOwner.character
          }
          const x = await condition.dataCollector.collectData({ cardPlayerId: cardOwner.getComponent(Card)._cardId, cardId: effectCard.getComponent(Card)._cardId })
          condition.conditionData = DataInterpreter.makeEffectData(x, effectCard, cardOwner.getComponent(Card)._cardId, false, false)
        } else if (condition.isAddPassiveEffect && !condition.conditionData && condition.needsDataCollector) {
          throw new Error(`Effect ${passiveEffect.effectName} is an "Add Passive Effect", its condition ${condition.name} doesn't have condition data`)
        }

        if (isTrue) { cc.log(`test condition ${condition.name} for ${passiveEffect.name} on ${effectCard.name} card`) }
        try {
          if (isTrue && (await condition.testCondition(passiveMeta) == false)) { isTrue = false; }
        } catch (error) {
          Logger.error(error, passiveMeta)
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

  static async checkB4Passives(passiveMeta: PassiveMeta) {

    // if (!PlayerManager.mePlayer.getComponent(Player)._hasPriority) return { continue: true, args: passiveMeta.args };

    const originalStackEffect = Stack._currentStack.find(effect => effect.entityId == passiveMeta.originStackId)
    PassiveManager.inPassivePhase = true;
    let allPassiveEffects = PassiveManager.allBeforeEffects;
    allPassiveEffects = allPassiveEffects.concat(PassiveManager.oneTurnBeforeEffects)

    let allPassivesToActivate: Effect[] = [];
    try {
      allPassivesToActivate = await this.testPassivesCondtions(allPassiveEffects, passiveMeta)
    } catch (error) {
      Logger.error(error)
    }

    const methodData = { continue: false, args: [] }
    let newPassiveMeta: PassiveMeta
    if (allPassivesToActivate.length > 0) {
      newPassiveMeta = await this.activateB4Passives(passiveMeta, allPassivesToActivate)
      if (originalStackEffect) {
        if (originalStackEffect.checkForFizzle()) {
          cc.log(`1`)
          methodData.continue = false
          methodData.args = newPassiveMeta.args;
        } else {
          cc.log(`2`)
          methodData.continue = !newPassiveMeta.preventMethod
          methodData.args = newPassiveMeta.args;
          cc.log(methodData)
        }
      } else {
        cc.log(`3`)
        methodData.continue = !newPassiveMeta.preventMethod
        methodData.args = newPassiveMeta.args;
        cc.log(methodData)
      }
    } else {
      cc.log(`4`)
      methodData.continue = true
      methodData.args = passiveMeta.args;
    }
    // if (newPassiveMeta) {
    //   this.clearPassiveMethodData(newPassiveMeta.index, false, true)
    // }
    whevent.emit(GAME_EVENTS.PASSIVE_MAN_PASSIVE_PHASE_OVER)
    PassiveManager.inPassivePhase = false;
    return methodData;
  }

  static async activateB4Passives(passiveMeta: PassiveMeta, passivesToActivate: Effect[]) {
    let cardToActivate: cc.Node;
    let passiveIndex
    let cardActivatorId;

    const index = this.updatePassiveMethodData(passiveMeta, false, true)
    passiveMeta.index = index
    // this.passiveMethodData = passiveMeta
    let isPlayer = false;
    for (let i = 0; i < passivesToActivate.length; i++) {
      const effect = passivesToActivate[i];
      cc.log(effect)
      cardToActivate = Card.getCardNodeByChild(effect.node);

      passiveIndex = cardToActivate
        .getComponent(CardEffect)
        .getEffectIndexAndType(effect);
      let player: Player
      if (cardToActivate.getComponent(Monster) == null) {
        player = PlayerManager.getPlayerByCard(cardToActivate);
        isPlayer = true
      } else {
        player = PlayerManager.getPlayerByCard(passiveMeta.methodScope);
        if (!player) {
          player = TurnsManager.getCurrentTurn().getTurnPlayer();
        }
      }
      cardActivatorId = player.playerId;
      let activatePassiveEffect: ActivatePassiveEffect
      let hasLockingEffect;
      const multiEffectRollEffect = cardToActivate.getComponent(CardEffect).passiveEffects[0];
      if (multiEffectRollEffect != null && multiEffectRollEffect.getComponent(Effect) instanceof MultiEffectRollEffect) {
        hasLockingEffect = true;
      } else { hasLockingEffect = false; }
      let hasDataBeenColleced: boolean
      if (effect.effectData) {
        hasDataBeenColleced = true
      } else { hasDataBeenColleced = false }
      player = null
      if (isPlayer) {
        player = PlayerManager.getPlayerByCard(cardToActivate);
        if (!player) { throw new Error(`no player was found for card ${cardToActivate.name}, can't make new ActivatePassiveEffect of the card`) }

        //   activatePassiveEffect = new ActivatePassiveEffect(player.character.getComponent(Card)._cardId, hasLockingEffect, cardActivatorId, cardToActivate, effect, hasDataBeenColleced, false, index)

      } else {
        player = PlayerManager.mePlayer.getComponent(Player)
      }
      activatePassiveEffect = new ActivatePassiveEffect(player.character.getComponent(Card)._cardId, hasLockingEffect, cardActivatorId, cardToActivate, effect, hasDataBeenColleced, false, index)
      if (passivesToActivate.length - i == 1) {

        // if (Stack._currentStackEffectsResolving.length == 0) {
        await Stack.addToStack(activatePassiveEffect, true)
        // } else {
        //   await Stack.addToStackAbove(activatePassiveEffect)
        // }
      } else {
        await Stack.addToStackAbove(activatePassiveEffect)
      }

    }

    return this.beforeActivationMap.get(passiveMeta.index)
  }

  static async testForPassiveAfter(meta: PassiveMeta) {

    //  if (!PlayerManager.mePlayer.getComponent(Player)._hasPriority) return meta.result;
    const originalStackEffect = Stack._currentStack.find(effect => effect.entityId == meta.originStackId)

    const index = this.updatePassiveMethodData(meta, true, true)
    meta.index = index
    PassiveManager.inPassivePhase = true;
    let allPassiveEffects = PassiveManager.allAfterEffects;
    allPassiveEffects = allPassiveEffects.concat(PassiveManager.oneTurnAfterEffects)
    let passivesToActivate: Effect[] = [];
    try {
      cc.log(allPassiveEffects)
      passivesToActivate = await this.testPassivesCondtions(allPassiveEffects, meta)
    } catch (error) {
      Logger.error(error)
    }
    cc.log(passivesToActivate)
    for (let i = 0; i < passivesToActivate.length; i++) {
      const passiveEffect = passivesToActivate[i];
      const cardActivated: cc.Node = Card.getCardNodeByChild(passiveEffect.node);
      const passiveIndex = cardActivated
        .getComponent(CardEffect)
        .getEffectIndexAndType(passiveEffect);
      let hasLockingEffect;
      const multiEffectRollEffect = cardActivated.getComponent(CardEffect).passiveEffects[0];
      if (multiEffectRollEffect != null && multiEffectRollEffect.getComponent(Effect) instanceof MultiEffectRollEffect) {
        hasLockingEffect = true;
      } else { hasLockingEffect = false; }
      let activatePassiveEffect: ActivatePassiveEffect;
      let player: Player
      cc.log(cardActivated)
      if (cardActivated.getComponent(Monster) == null && cardActivated.getComponent(Card).type != CARD_TYPE.BONUS_SOULS) {
        player = PlayerManager.getPlayerByCard(cardActivated);
      } else {
        cc.log(meta.methodScope)
        player = meta.methodScope.getComponent(Player);
        cc.log(`is scope`)
        if (!player) {
          player = TurnsManager.getCurrentTurn().getTurnPlayer();
          cc.log(`is turn player`)
        }
      }
      activatePassiveEffect = new ActivatePassiveEffect(player.character.getComponent(Card)._cardId, hasLockingEffect, player.playerId, cardActivated, passiveEffect, false, true, index)
      if (passivesToActivate.length - i == 1) {
        await Stack.addToStack(activatePassiveEffect, true)
      } else {
        await Stack.addToStackAbove(activatePassiveEffect)
      }
    }

    whevent.emit(GAME_EVENTS.PASSIVE_MAN_PASSIVE_PHASE_OVER)
    PassiveManager.inPassivePhase = false;
    const result = this.afterActivationMap.get(meta.index).result
    //this.clearPassiveMethodData(meta.index, true, true)
    return result;

  };

  // LIFE-CYCLE CALLBACKS:

  // onLoad () {}

  start() { }

  // update (dt) {}
}

export class PassiveMeta {

  constructor(passiveEvent: PASSIVE_EVENTS, args: any[], result: any, methodScope: cc.Node, originStackId?: number) {
    this.args = args
    this.passiveEvent = passiveEvent;
    this.methodScope = methodScope;
    this.preventMethod = false;
    this.result = result;
    if (originStackId) { this.originStackId = originStackId }
  }

  passiveEvent: PASSIVE_EVENTS = null;
  args: any[] = [];
  result: any = null;
  preventMethod: boolean = false;
  methodScope: cc.Node = null;
  index: number = null
  originStackId: number = -1

  convertToServerPassiveMeta() {
    const serverPassiveMeta = new ServerPassiveMeta();
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
    serverPassiveMeta.originStackId = this.originStackId
    return serverPassiveMeta
  }

}

export class ServerPassiveMeta {

  passiveEvent: PASSIVE_EVENTS = null;
  args: Array<{ type: ARGS_TYPES, number: number }> = [];
  result: any = null;
  preventMethod: boolean = false;
  methodScopeId: number = null;
  scopeIsPlayer: boolean = false;
  index: number = null
  originStackId: number

  convertToPassiveMeta() {
    const args = [];
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
    const passiveMeta = new PassiveMeta(this.passiveEvent, args, this.result, scope)
    passiveMeta.index = this.index
    passiveMeta.originStackId = this.originStackId
    return passiveMeta
  }

}

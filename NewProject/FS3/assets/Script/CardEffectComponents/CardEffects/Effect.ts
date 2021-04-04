import { CCInteger, Component, Enum, Node, _decorator } from 'cc';
import { CHOOSE_CARD_TYPE, ITEM_TYPE, PASSIVE_TYPE } from "../../Constants";
import { EffectPosition } from "../../EffectPosition";
import { ActiveEffectData } from '../../Managers/ActiveEffectData';
import { EffectData } from '../../Managers/EffectData';
import { PassiveEffectData } from '../../Managers/PassiveEffectData';
import { StackEffectInterface } from "../../StackEffects/StackEffectInterface";
import { Condition } from '../CardConditions/Condition';
import { Cost } from '../Costs/Cost';
import { DataCollector } from '../DataCollector/DataCollector';
import { EffectDataConcurencyBase } from '../EffectDataConcurency/EffectDataConcurencyBase';
import { PreCondition } from '../PreConditions/PreCondition';
import { EffectInterface } from "./EffectInterface";

const { ccclass, property } = _decorator;


@ccclass('Effect')
export class Effect extends Component implements EffectInterface {

      /**
       *
       */
      constructor() {
            super();

      }


      noDataCollector = false;

      hasBeenHandled: boolean = false

      @property({ type: EffectPosition })
      effectPosition: EffectPosition = new EffectPosition()

      @property
      EffectId: number = -1

      @property
      isSilent: boolean = false;

      effectData: ActiveEffectData | PassiveEffectData | null = null;


      @property({ type: CCInteger, multiline: true })
      costIdFinal: number = -1

      @property({ type: Component, multiline: true })
      cost: Cost | null = null

      getCost() {
            return this.cost
            // if (this.costIdFinal != -1) {
            //       return this.node.getComponent(CardEffect)!.getCost(this.costIdFinal)
            // }
            // return null
      }


      @property({ type: CCInteger, multiline: true })
      preConditionIdFinal: number = -1;


      @property({ type: Component, multiline: true })
      preCondition: PreCondition | null = null


      getPreCondition() {
            return this.preCondition
            // if (this.preConditionIdFinal != -1) {
            //       return this.node.getComponent(CardEffect)!.getPreCondtion(this.preConditionIdFinal)
            // }
            // return null
      }

      hasSubAction: boolean = false;

      @property({ type: [CCInteger], multiline: true })
      conditionsIdsFinal: number[] = []

      @property({ type: [Component], multiline: true })
      conditions: Condition[] = []

      getConditions() {
            return this.conditions
            // const cardEffectComp = this.node.getComponent(CardEffect)!;
            // return this.conditionsIdsFinal.map(conditionId => cardEffectComp.getCondtion(conditionId))
      }

      @property({ type: Enum(PASSIVE_TYPE) })
      passiveType: PASSIVE_TYPE = 1;


      @property({ type: CCInteger, multiline: true })
      passiveEffectToAddIdFinal: number = -1

      @property(Component)
      passiveEffectToAdd: Effect | null = null

      @property({ tooltip: "Only If This Effect Is A 'Passive Effect To Add'" })
      isOneTimeUse: boolean = false

      getPassiveEffectToAdd() {
            return this.passiveEffectToAdd
            // if (this.passiveEffectToAddIdFinal != -1) {
            //       return this.node.getComponent(CardEffect)!.getEffect(this.passiveEffectToAddIdFinal)
            // }
            // return null
      }

      effectName: string = "";

      chooseType: CHOOSE_CARD_TYPE | null = null;

      @property({ type: [CCInteger], multiline: true })
      dataCollectorsIdsFinal: number[] = []

      @property({ type: [Component], multiline: true })
      dataCollectors: DataCollector[] = []

      getDataCollectors() {
            return this.dataCollectors
            // const cardEffectComp = this.node.getComponent(CardEffect)!;
            // return this.dataCollectorsIdsFinal.map(dataCollectorId => cardEffectComp.getDataCollector(dataCollectorId))
      }


      @property
      private _effectCard: Node | null = null;

      getEffectCard() {
            if (this._effectCard) {
                  return this._effectCard
            } else {
                  return this.node
            }
      }

      @property
      optionalAfterDataCollection: boolean = false;

      @property
      optionalBeforeDataCollection: boolean = false;

      @property
      hasPlayerChoiceToActivateInChainEffects: boolean = false;

      @property
      hasLockingResolve: boolean = false;

      lockingResolve = 0;

      @property
      hasDataConcurency: boolean = false;

      // @property({ type: CCInteger, multiline: true })
      // dataConcurencyComponentIdFinal: number = -1

      @property({ type: Component, multiline: true })
      dataConcurencyComponent: EffectDataConcurencyBase | null = null


      getDataConcurencyComponent() {
            return this.dataConcurencyComponent
            // if (this.dataConcurencyComponentIdFinal != -1) {
            //       return this.node.getComponent(CardEffect)!.getDataConcurency(this.dataConcurencyComponentIdFinal)
            // }
            // return null
      }


      @property
      optionalFlavorText: string = ''


      @property
      isContinuousEffect = false

      @property({
            visible: function (this: Effect) {
                  return this.isContinuousEffect
            }
      })
      markAsRunningOrNotRunning: boolean = false

      effectRunning = false

      isEffectRunning() {
            if (!this.isContinuousEffect && this.effectRunning) {
                  throw new Error(`Effect ${this.effectName} is marked as running but not "IsContinousEffect"`);
            }
            return this.effectRunning
      }

      setEffectId() {
            if (this.node && this.EffectId == -1) {
                  const comps = this.node.getComponents(Effect);
                  this.EffectId = comps.findIndex(ed => ed == this);
            }
      }

      /**
       *
       * @param data {target:Player}
       */
      async doEffect(Stack: StackEffectInterface[], data?: any): Promise<StackEffectInterface[] | EffectData> { return new PassiveEffectData() }

      reverseEffect() {

      }

      runDataConcurency(effectData: ActiveEffectData | PassiveEffectData, numOfEffect: number, type: ITEM_TYPE, sendToServer: boolean) {
            this.getDataConcurencyComponent()!.runDataConcurency(effectData, numOfEffect, type, sendToServer)
      }

      onLoad() {
            console.log(`on load effect`);

            this._effectCard = this.node;
      }

      // static async runEffect(chosenEffect: Effect, stack: StackEffectInterface[], data?: any) {
      //       const serverEffectStack = await chosenEffect.doEffect(stack, data);
      //       const effectCard = chosenEffect._effectCard!;
      //       const cardEffectComp = effectCard.getComponent(CardEffect)!
      //       const effectDetails = cardEffectComp.getEffectIndexAndType(chosenEffect);
      //       if (chosenEffect.hasDataConcurency) {
      //             chosenEffect.runDataConcurency(data, effectDetails.index, effectDetails.type, true)
      //       }
      //       if (chosenEffect.isContinuousEffect) {
      //             if (chosenEffect.markAsRunningOrNotRunning) {
      //                   chosenEffect.effectRunning = true;
      //             } else {
      //                   chosenEffect.effectRunning = false;
      //             }
      //             WrapperProvider.serverClientWrapper.out.send(Signal.MARK_EFFECT_AS_RUNNING, { cardId: effectCard.getComponent(Card)?._cardId, effectIndex: effectDetails.index, effectType: effectDetails.type, markBool: chosenEffect.markAsRunningOrNotRunning })
      //       }
      //       return serverEffectStack
      // }

      // // toString() {
      // //   return `${this.hasSubAction},${this.passiveType},${this.passiveEffectToAdd.toString()},${this.effectName}.${this.chooseType}`
      // // }
}

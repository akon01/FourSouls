
import { Node, _decorator } from 'cc';
import { whevent } from '../../../../ServerClient/whevent';
import { GAME_EVENTS, STACK_EFFECT_TYPE } from '../../../Constants';
import { CardEffect } from '../../../Entites/CardEffect';
import { Card } from '../../../Entites/GameEntities/Card';
import { WrapperProvider } from '../../../Managers/WrapperProvider';
import { ActivateItem } from '../../../StackEffects/ActivateItem';
import { PlayLootCardStackEffect } from '../../../StackEffects/PlayLootCard';
import { StackEffectInterface } from '../../../StackEffects/StackEffectInterface';
import { StackEffectPreview } from '../../../StackEffects/StackEffectVisualRepresentation/StackEffectPreview';
import { ChooseStackEffect } from '../ChooseStackEffect';
import { DataCollector } from '../DataCollector';
const { ccclass, property } = _decorator;

@ccclass('ICantBeliveItsNotButterBeanCollector')
export class ICantBeliveItsNotButterBeanCollector extends DataCollector {
    collectorName = "ICantBeliveItsNotButterBeanCollector";

    chooseStackEffect: ChooseStackEffect = new ChooseStackEffect()

    async collectData(data: {
        cardPlayerId: number;
    }) {
        const types = [STACK_EFFECT_TYPE.ACTIVATE_ITEM, STACK_EFFECT_TYPE.PLAY_LOOT_CARD]
        const stackEffects = WrapperProvider.stackWrapper.out._currentStack.filter(effect => {
            if (types.includes(effect.stackEffectType)) {
                return true
            }
        })
        const playerManager = WrapperProvider.playerManagerWrapper.out;
        const owner = playerManager.getPlayerByCard(this.getEffectCard())!
        const filteredStackEffect: Set<StackEffectInterface> = new Set()
        for (const stackEffect of stackEffects) {
            if (stackEffect instanceof ActivateItem || stackEffect instanceof PlayLootCardStackEffect) {
                if (stackEffect.effectToDo && stackEffect.hasDataBeenCollectedYet) {
                    const serverEffectData = stackEffect.effectToDo.node.getComponent(CardEffect)!.effectData
                    if (serverEffectData) {
                        const effectData = WrapperProvider.dataInerpreterWrapper.out.convertToEffectData(serverEffectData)
                        if (effectData) {
                            const targets = effectData.getAllTargets()
                            for (const target of targets.nodes) {
                                const targetOwner = playerManager.getPlayerByCard(target)
                                if (targetOwner === owner) {
                                    filteredStackEffect.add(stackEffect)
                                }
                            }
                            for (const target of targets.stackEffects) {
                                if (owner.character?.getComponent(Card)!._cardId == target.creatorCardId) {
                                    filteredStackEffect.add(stackEffect)
                                }
                            }
                        }
                    }
                }
            }
        }

        const chosenStackEffect = await this.requireChoosingAnEffect(Array.from(filteredStackEffect) as StackEffectInterface[])

        return WrapperProvider.effectTargetFactoryWrapper.out.getNewEffectTarget(chosenStackEffect.getComponent(StackEffectPreview)!)

    }

    async requireChoosingAnEffect(stackEffectsToChooseFrom: StackEffectInterface[]) {

        if (stackEffectsToChooseFrom.length == 1) {
            return WrapperProvider.stackEffectVisManagerWrapper.out.getPreviewByStackId(stackEffectsToChooseFrom[0].entityId)!.node

        } let stackEffectsPreviews: StackEffectPreview[] = []

        stackEffectsPreviews = stackEffectsToChooseFrom.map(stackEffect => WrapperProvider.stackEffectVisManagerWrapper.out.getPreviewByStackId(stackEffect.entityId)!)
        stackEffectsPreviews = stackEffectsPreviews.filter(preview => {
            if (preview != undefined) { return true }
        })
        for (const stackEffectPreview of stackEffectsPreviews) {
            WrapperProvider.stackEffectVisManagerWrapper.out.makeRequiredForDataCollector(stackEffectPreview, this)
        }
        WrapperProvider.stackEffectVisManagerWrapper.out.showPreviews()
        console.log(`wait for effect to be chosen `)
        const stackEffectChosen = await this.waitForEffectToBeChosen()
        console.log(`effect chosen is ${stackEffectChosen}`)
        for (const stackEffectPreview of stackEffectsPreviews) {
            WrapperProvider.stackEffectVisManagerWrapper.out.makeNotRequiredForDataCollector(stackEffectPreview)
        }
        return stackEffectChosen

    }

    async waitForEffectToBeChosen(): Promise<Node> {
        return new Promise((resolve) => {
            whevent.onOnce(GAME_EVENTS.CHOOSE_STACK_EFFECT_CHOSEN, (data: any) => {
                if (data) {
                    resolve(this.cardChosen!);
                }
            })
        })
    }



    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */

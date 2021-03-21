
import { Component, find, Node, _decorator } from 'cc';
import { ServerClient } from '../../ServerClient/ServerClient';
import { DecisionMarker } from '../Entites/DecisionMarker';
import { Store } from '../Entites/GameEntities/Store';
import { GenericNonComponentWrapper, GenericWrapper } from '../Entites/GenericWrapper';
import { Logger } from '../Entites/Logger';
import { MonsterField } from '../Entites/MonsterField';
import { Stack } from '../Entites/Stack';
import { ActionLable } from '../LableScripts/ActionLable';
import { AdminConsole } from '../LableScripts/AdminConsole';
import { AnnouncementLable } from '../LableScripts/AnnouncementLable';
import { Menu } from '../LableScripts/Menu';
import { StackLable } from '../LableScripts/StackLable';
import { MainScript } from '../MainScript';
import { ActionManager } from './ActionManager';
import { AnimationManager } from './AnimationManager';
import { BattleManager } from './BattleManager';
import { ButtonManager } from './ButtonManager';
import { CardManager } from './CardManager';
import { CardPreviewManager } from './CardPreviewManager';
import { DataInterpreter } from './DataInterpreter';
import { ParticleManager } from './ParticleManager';
import { PassiveManager } from './PassiveManager';
import { PileManager } from './PileManager';
import { PlayerManager } from './PlayerManager';
import { SoundManager } from './SoundManager';
import { StackEffectVisManager } from './StackEffectVisManager';
import { TurnsManager } from './TurnsManager';
const { ccclass, property } = _decorator;

@ccclass('WrapperProvider')
export class WrapperProvider extends Component {
    // [1]
    // dummy = '';

    static playerManagerWrapper: GenericWrapper<PlayerManager>
    static actionLableWrapper: GenericWrapper<ActionLable>
    static actionManagerWrapper: GenericWrapper<ActionManager>
    static adminConsoleWrapper: GenericWrapper<AdminConsole>
    static animationManagerWrapper: GenericWrapper<AnimationManager>
    static announcementLableWrapper: GenericWrapper<AnnouncementLable>
    static battleManagerWrapper: GenericWrapper<BattleManager>
    static buttonManagerWrapper: GenericWrapper<ButtonManager>
    static cardManagerWrapper: GenericWrapper<CardManager>
    static dataInerpreterWrapper: GenericWrapper<DataInterpreter>
    static decisionMarkerWrapper: GenericWrapper<DecisionMarker>
    static loggerWrapper: GenericNonComponentWrapper<Logger>
    static mainScriptWrapper: GenericWrapper<MainScript>
    static menuWrapper: GenericWrapper<Menu>
    static monsterFieldWrapper: GenericWrapper<MonsterField>
    static particleManagerWrapper: GenericWrapper<ParticleManager>
    static passiveManagerWrapper: GenericWrapper<PassiveManager>
    static pileManagerWrapper: GenericWrapper<PileManager>
    static serverClientWrapper: GenericWrapper<ServerClient>
    static soundManagerWrapper: GenericWrapper<SoundManager>
    static stackEffectVisManagerWrapper: GenericWrapper<StackEffectVisManager>
    static stackLableWrapper: GenericWrapper<StackLable>
    static stackWrapper: GenericWrapper<Stack>
    static storeWrapper: GenericWrapper<Store>
    static turnsManagerWrapper: GenericWrapper<TurnsManager>
    static cardPreviewManagerWrapper: GenericWrapper<CardPreviewManager>

    static CanvasNode: Node
    static MainScriptNode: Node


    start() {

    }

    onLoad() {

        try { WrapperProvider.CanvasNode = find("RenderRoot2D/Canvas")! } catch { }
        try { WrapperProvider.MainScriptNode = find("MainScript")! } catch { }
        try { WrapperProvider.playerManagerWrapper = new GenericWrapper("MainScript/PlayerManager", { inCtor: PlayerManager }) } catch { }
        try { WrapperProvider.actionLableWrapper = new GenericWrapper("RenderRoot2D/Canvas/Action Lable", { inCtor: ActionLable }) } catch { }
        try { WrapperProvider.actionManagerWrapper = new GenericWrapper("MainScript/ActionManager", { className: "ActionManager" }) } catch { }
        try { WrapperProvider.adminConsoleWrapper = new GenericWrapper("RenderRoot2D/Canvas/Admin Console", { inCtor: AdminConsole }) } catch { }
        try { WrapperProvider.animationManagerWrapper = new GenericWrapper("MainScript/Animation Manager", { inCtor: AnimationManager }) } catch { }
        try { WrapperProvider.announcementLableWrapper = new GenericWrapper("RenderRoot2D/Canvas/AnnounceMent Text", { inCtor: AnnouncementLable }) } catch { }
        try { WrapperProvider.battleManagerWrapper = new GenericWrapper("MainScript/BattleManager", { inCtor: BattleManager }) } catch { }
        try { WrapperProvider.buttonManagerWrapper = new GenericWrapper("MainScript/ButtonManager", { inCtor: ButtonManager }) } catch { }
        try { WrapperProvider.cardManagerWrapper = new GenericWrapper("MainScript/CardManager", { inCtor: CardManager }) } catch { }
        try { WrapperProvider.dataInerpreterWrapper = new GenericWrapper("MainScript/DataInterpreter", { className: "DataInterpreter" }) } catch { }
        try { WrapperProvider.decisionMarkerWrapper = new GenericWrapper("RenderRoot2D/Canvas/ArrowGFX", { inCtor: DecisionMarker }) } catch { }
        try { WrapperProvider.loggerWrapper = new GenericNonComponentWrapper(Logger) } catch { }
        try { WrapperProvider.mainScriptWrapper = new GenericWrapper("MainScript", { inCtor: MainScript }) } catch { }
        try { WrapperProvider.menuWrapper = new GenericWrapper("RenderRoot2D/Canvas/Menu BG/Menu Layout", { inCtor: Menu }) } catch { }
        try { WrapperProvider.monsterFieldWrapper = new GenericWrapper("RenderRoot2D/Canvas/MonsterField", { inCtor: MonsterField }) } catch { }
        try { WrapperProvider.particleManagerWrapper = new GenericWrapper("MainScript/ParticleManager", { inCtor: ParticleManager }) } catch { }
        try { WrapperProvider.passiveManagerWrapper = new GenericWrapper("MainScript/PassiveManager", { inCtor: PassiveManager }) } catch { }
        try { WrapperProvider.pileManagerWrapper = new GenericWrapper("MainScript/PileManager", { inCtor: PileManager }) } catch { }
        try { WrapperProvider.serverClientWrapper = new GenericWrapper("ServerClient", { inCtor: ServerClient }) } catch { }
        try { WrapperProvider.soundManagerWrapper = new GenericWrapper("MainScript/SoundManager", { inCtor: SoundManager }) } catch { }
        try { WrapperProvider.stackEffectVisManagerWrapper = new GenericWrapper("MainScript/StackEffectVisManager", { inCtor: StackEffectVisManager }) } catch { }
        try { WrapperProvider.stackLableWrapper = new GenericWrapper("RenderRoot2D/Canvas/StackShow", { inCtor: StackLable }) } catch { }
        try { WrapperProvider.stackWrapper = new GenericWrapper("MainScript/Stack", { inCtor: Stack }) } catch { }
        try { WrapperProvider.storeWrapper = new GenericWrapper("RenderRoot2D/Canvas/Store", { inCtor: Store }) } catch { }
        try { WrapperProvider.turnsManagerWrapper = new GenericWrapper("MainScript/TurnsManager", { inCtor: TurnsManager }) } catch { }
        try { WrapperProvider.cardPreviewManagerWrapper = new GenericWrapper("MainScript/CardPreviewManager", { inCtor: CardPreviewManager }) } catch { }
    }

    // update (deltaTimeWrapper: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scriptingWrapper: httpsWrapper://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClassWrapper: httpsWrapper://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacksWrapper: httpsWrapper://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */

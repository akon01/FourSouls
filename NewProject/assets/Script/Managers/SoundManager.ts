import { GAME_EVENTS } from "../Constants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SoundManager extends cc.Component {


    static $: SoundManager = null

    BGVolume: number = 0;

    @property({ type: cc.AudioClip })
    coinGetSound: cc.AudioClip = null

    @property({ type: cc.AudioClip })
    coinLoseSound: cc.AudioClip = null

    @property({ type: cc.AudioClip })
    cardEffectActivate: cc.AudioClip = null

    @property({ type: cc.AudioClip })
    playerGetHit: cc.AudioClip = null

    @property({ type: cc.AudioClip })
    monsterGetHit: cc.AudioClip = null

    @property({ type: cc.AudioClip })
    rollDice: cc.AudioClip = null

    @property({ type: cc.AudioSource })
    effectSource: cc.AudioSource = null

    @property({ type: cc.AudioSource })
    BGSource: cc.AudioSource = null

    @property({ type: cc.AudioClip })
    BasicBGMusic: cc.AudioClip = null


    setEffectsVolume(volume: number) {
        cc.audioEngine.setEffectsVolume(volume)
    }
    setBGVolume(volume: number) {
        cc.log(`set BG volume to ${volume}`)
        cc.audioEngine.setMusicVolume(volume)
        if (!cc.audioEngine.isMusicPlaying()) {
            this.playBGMusic(this.BasicBGMusic)
        }
    }

    playBGMusic(BGclip: cc.AudioClip) {
        cc.error(`play BG music`)
        cc.audioEngine.playMusic(BGclip, true)
    }

    stopBGMusic() {
        cc.audioEngine.stopMusic()
    }


    playLoopedSound(soundClip: cc.AudioClip) {
        const clipId = cc.audioEngine.playEffect(soundClip, true)
        cc.log(clipId)
        cc.log(soundClip)
        cc.log(`play looped sound ${soundClip.name}`)
        cc.log(cc.audioEngine.getState(clipId))
        cc.log(cc.audioEngine.isLoop(clipId))
        cc.log(cc.audioEngine.getCurrentTime(clipId))
        return clipId
    }

    stopLoopedSound(clipId: number) {
        cc.log(`stop looped sound`)
        cc.log(cc.audioEngine.getState(clipId))
        cc.log(cc.audioEngine.AudioState.PLAYING)
        cc.log(`stop looped sound`)
        cc.audioEngine.stopEffect(clipId)
    }

    playSound(soundClip: cc.AudioClip) {
        cc.log(soundClip)
        cc.log(`play sound ${soundClip.name}`)
        const clipId = cc.audioEngine.playEffect(soundClip, false)
        cc.log(clipId)
        cc.audioEngine.setFinishCallback(clipId, () => {
            cc.log(cc.audioEngine.getState(clipId))
            cc.log(`sound effect ended`)
            whevent.emit(GAME_EVENTS.SOUND_OVER)
        })
        // this.effectSource.clip = soundClip;
        // this.effectSource.play()

        //  await this.waitForSoundOver()
    }


    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        SoundManager.$ = this
    }

    start() {

    }

    // update (dt) {}
}

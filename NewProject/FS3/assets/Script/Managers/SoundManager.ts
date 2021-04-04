import { AudioClip, AudioSource, Component, _decorator } from 'cc';
import { WrapperProvider } from './WrapperProvider';
const { ccclass, property } = _decorator;


@ccclass('SoundManager')
export class SoundManager extends Component {


    BGVolume: number = 0;

    @property({ type: AudioClip })
    coinGetSound: AudioClip | null = null

    @property({ type: AudioClip })
    coinLoseSound: AudioClip | null = null

    @property({ type: AudioClip })
    cardEffectActivate: AudioClip | null = null

    @property({ type: AudioClip })
    playerGetHit: AudioClip | null = null

    @property({ type: AudioClip })
    monsterGetHit: AudioClip | null = null

    @property({ type: AudioClip })
    rollDice: AudioClip | null = null

    @property({ type: AudioSource })
    effectSource: AudioSource | null = null

    @property({ type: AudioSource })
    BGSource: AudioSource | null = null

    @property({ type: AudioClip })
    BasicBGMusic: AudioClip | null = null
    menuWrapper: any;




    setEffectsVolume(volume: number) {
        if (WrapperProvider.menuWrapper.out) {
            WrapperProvider.menuWrapper.out.effectSoundSlider!.progress = volume
        }
        // audioEngine!.setEffectsVolume(volume)
    }
    setBGVolume(volume: number) {
        if (WrapperProvider.menuWrapper.out) {
            WrapperProvider.menuWrapper.out.BGsoundSlider!.progress = volume
        }
        //  audioEngine!.setMusicVolume(volume)

        //   if (!audioEngine!.isMusicPlaying()) {
        //      this.playBGMusic(this.BasicBGMusic)
        // }
    }

    playBGMusic(BGclip: AudioClip) {
        //  audioEngine!.playMusic(BGclip, true)
    }

    stopBGMusic() {
        // audioEngine!.stopMusic()
    }


    playLoopedSound(soundClip: AudioClip) {
        // const clipId = audioEngine!.playEffect(soundClip, true)
        // console.log(clipId)
        // console.log(soundClip)
        // console.log(`play looped sound ${soundClip.name}`)
        // console.log(audioEngine!.getState(clipId))
        // console.log(audioEngine!.isLoop(clipId))
        // console.log(audioEngine!.getCurrentTime(clipId))
        // return clipId

        return 1
    }

    stopLoopedSound(clipId: number) {
        // audioEngine!.stopEffect(clipId)
    }

    playSound(soundClip: AudioClip) {
        // const clipId = audioEngine!.playEffect(soundClip, false)
        // console.log(clipId)
        // audioEngine!.setFinishCallback(clipId, () => {
        //     whevent.emit(GAME_EVENTS.SOUND_OVER)
        // })
        // this.effectSource.clip = soundClip;
        // this.effectSource.play()

        //  await this.waitForSoundOver()
    }


    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    }

    start() {

    }

    // update (dt) {}
}

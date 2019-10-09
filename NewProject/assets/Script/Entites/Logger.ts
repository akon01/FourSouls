import ServerClient from "../../ServerClient/ServerClient";
import Signal from "../../Misc/Signal";
import CardManager from "../Managers/CardManager";
import PlayerManager from "../Managers/PlayerManager";
import MonsterField from "./MonsterField";
import AdminConsole from "../LableScripts/Admin Console";

export class Logger {

    static log(logData) {
        ServerClient.$.send(Signal.LOG, logData)
    }



    static printMethodSignal(methodArgs: any[], isSending: boolean) {
        if (methodArgs[1] != null) {
            let signalData = Object.entries(methodArgs[1])
            let sentData: { name: string, data: string[] }[] = []
            let t: any

            for (let dataEntry of signalData) {
                let name;
                let data: string[] = []
                let dataObj: { name: string, data: string[] } = { name: '', data: [] };
                t = dataEntry[1]

                switch (dataEntry[0]) {
                    case 'cardId':
                    case 'cardToShowId':
                    case 'drawnCardId':
                    case 'charCardId':
                    case 'itemCardId':
                        name = 'Card';
                        data.push(CardManager.getCardById(t, true).name)
                        break;
                    case 'deckType':
                        name = 'Deck';
                        data.push(CardManager.getDeckByType(t).name)
                        break;
                    case 'playerId':
                    case 'activePlayerId':
                    case 'originPlayerId':
                    case 'sendToPlayerId':
                        name = 'Player';
                        data.push(PlayerManager.getPlayerById(t).name)
                        break
                    case 'monsterPlaceId':
                    case 'holderId':
                    case 'cardHolderId':
                        name = 'Monster Holder';
                        data.push(MonsterField.getMonsterPlaceById(t).name)
                        break;
                    case 'numOfCoins':
                        name = 'Number Of Coins'
                        data.push(t)
                        break;
                    case 'numberRolled':
                        name = 'Dice Number Rolled';
                        data.push(t)
                        break
                    case 'monsterId':
                    case 'attackedMonsterId':
                        name = 'Monster'
                        data.push(CardManager.getCardById(t, true).name)
                        break
                    case 'placeID':
                        name = 'Place To Move To';
                        let place = PlayerManager.getPlayerById(t)
                        if (place != null) {
                            data.push(`Player ${place.name} Hand/Desk`)
                        }
                        if (place == null) {
                            data.push(CardManager.getCardById(t, true).name)
                        }
                        data.push(t)
                        break
                    case 'moveIndex':
                        name = 'Card Movement Index';
                        data.push(t)
                        break
                    case 'isReward':
                        name = 'Is Reward?'
                        data.push(t)
                        break;
                    case 'type':
                        name = 'Card Type';
                        data.push(t)
                        break
                    case 'damage':
                    case 'DMGToGain':
                        name = 'DMG Points';
                        data.push(t)
                        break
                    case 'hpToGain':
                        name = 'HP Points';
                        data.push(t)
                        break
                    case 'bonusToGain':
                        name = 'Roll Bonus Points';
                        data.push(t)
                        break
                    case 'effectIndex':
                        name = 'Card Effect Index';
                        data.push(JSON.stringify(t))
                        break;
                    case 'conditionData':
                        name = 'Condition Data'
                        data.push(JSON.stringify(t))
                        break;
                    case 'stackEffectResponse':
                        name = 'Has Other Player Responded';
                        data.push(t)
                        break;
                    case 'stackEffect':
                        name = 'Stack Effect'
                        data.push(JSON.stringify(t))
                        break
                    case 'currentStack':
                    case 'newStack':
                        name = 'Stack'
                        data.push(t.map(item => JSON.stringify(item)))
                        // data.push(t.map(item => typeof item))
                        break;
                    case 'stackVis':
                        name = 'Stack Effect Visualization';
                        data.push(t)
                        break;
                    case 'flipIfFlipped':
                        name = 'Flip Card';
                        data.push(t)
                        break;
                    case 'firstPos':
                        name = 'First Position';
                        data.push(JSON.stringify(t))
                        break;
                    default:
                        name = dataEntry[0]
                        data.push(JSON.stringify(t))
                        break;
                }


                sentData.push({ name: name, data: data })



            }
            let time = new Date().toTimeString().substring(0, 8)
            let dataString = '';
            for (const dataObj of sentData) {
                dataString = dataString + dataObj.name + ': '
                for (const inData of dataObj.data) {
                    dataString = dataString + inData + ' \n'
                }
            }
            if (!AdminConsole.noPrintSignal.includes(methodArgs[0])) {
                if (isSending) {
                    cc.log(
                        "%c" + "Sending Signal :" + methodArgs[0] + " Time:" + time + '\n' + dataString,
                        "color:#36F"
                    );
                } else
                    cc.log(
                        "%c" + "Receiving Signal :" + methodArgs[0] + " Time:" + time + '\n' + dataString,
                        "color:rgb(60%, 0%, 10%)"
                    );
            }
            // cc.log(
            //     methodArgs[1],
            // );

            // cc.log('%c' + dataString, "color:rgb(60%, 0%, 10%)")
        }


    }
}
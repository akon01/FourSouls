import Signal from "../../Misc/Signal";
import ServerClient from "../../ServerClient/ServerClient";
import AdminConsole from "../LableScripts/Admin Console";
import CardManager from "../Managers/CardManager";
import PlayerManager from "../Managers/PlayerManager";
import ServerStackEffectConverter from "../StackEffects/ServerSideStackEffects/ServerStackEffectConverter";
import MonsterField from "./MonsterField";
import AnnouncementLable from "../LableScripts/Announcement Lable";

export class Logger {

    static log(logData) {
        ServerClient.$.send(Signal.LOG, logData)
    }

    static error(logData, extraData?) {
        if (logData instanceof Error) {
            ServerClient.$.send(Signal.LOG_ERROR, { message: JSON.stringify(logData.message), stack: JSON.stringify(logData.stack) })
            cc.error(logData.message)
            cc.error(logData.stack)
            AnnouncementLable.$.showAnnouncement(JSON.stringify(logData.message), 3, true)
        } else {
            ServerClient.$.send(Signal.LOG_ERROR, logData)
            cc.error(logData)
            AnnouncementLable.$.showAnnouncement(logData, 3, true)
        }
        if (extraData) { cc.error(extraData) }
    }

    static printMethodSignal(methodArgs: any[], isSending: boolean) {
        if (methodArgs[1] != null) {
            const signalData = Object.entries(methodArgs[1])
            const sentData: Array<{ name: string, data: string[] }> = []
            let t: any

            const time = new Date().toTimeString().substring(0, 8)

            if (methodArgs[0] == Signal.LOG_ERROR) {
                cc.error(`!!!Error!!! Time:${time}\nMessage:\n\n${JSON.stringify(methodArgs[1])}`)
            } else {

                try {

                    for (const dataEntry of signalData) {
                        let name;
                        const data: string[] = []
                        const dataObj: { name: string, data: string[] } = { name: "", data: [] };
                        t = dataEntry[1]

                        switch (dataEntry[0]) {
                            case "cardId":
                            case "cardToShowId":
                            case "drawnCardId":
                            case "charCardId":
                            case "itemCardId":
                                name = "Card";
                                data.push(CardManager.getCardById(t, true).name)
                                break;
                            case "deckType":
                                name = "Deck";
                                data.push(CardManager.getDeckByType(t).name)
                                break;
                            case "playerId":
                            case "activePlayerId":
                            case "originPlayerId":
                            case "sendToPlayerId":
                                name = "Player";
                                data.push(PlayerManager.getPlayerById(t).name)
                                break
                            case "monsterPlaceId":
                            case "holderId":
                            case "cardHolderId":
                                name = "Monster Holder";
                                data.push(MonsterField.getMonsterPlaceById(t).name)
                                break;
                            case "numOfCoins":
                                name = "Number Of Coins"
                                data.push(t)
                                break;
                            case "numberRolled":
                                name = "Dice Number Rolled";
                                data.push(t)
                                break
                            case "monsterId":
                            case "attackedMonsterId":
                                name = "Monster"
                                data.push(CardManager.getCardById(t, true).name)
                                break
                            case "placeID":
                                name = "Place To Move To";
                                //  cc.log(t)
                                const place = PlayerManager.getPlayerById(t)
                                if (place != null) {
                                    data.push(`Player ${place.name} Hand/Desk`)
                                }
                                if (place == null) {
                                    data.push(CardManager.getCardById(t, true).name)
                                }
                                data.push(t)
                                break
                            case "moveIndex":
                                name = "Card Movement Index";
                                data.push(t)
                                break
                            case "isReward":
                                name = "Is Reward?"
                                data.push(t)
                                break;
                            case "type":
                                name = "Card Type";
                                data.push(t)
                                break
                            case "damage":
                            case "DMGToGain":
                                name = "DMG Points";
                                data.push(t)
                                break
                            case "hpToGain":
                                name = "HP Points";
                                data.push(t)
                                break
                            case "bonusToGain":
                                name = "Roll Bonus Points";
                                data.push(t)
                                break
                            case "effectIndex":
                                name = "Card Effect Index";
                                data.push(JSON.stringify(t))
                                break;
                            case "conditionData":
                                name = "Condition Data"
                                data.push(JSON.stringify(t))
                                break;
                            case "stackEffectResponse":
                                name = "Has Other Player Responded";
                                data.push(t)
                                break;
                            case `stackText`:
                                name = `Stack Effect Text Update`
                                data.push(t)
                                break
                            case "stackEffect":
                                name = "Stack Effect"
                                // const convertor = new ServerStackEffectConverter();
                                // const stackEffect = convertor.convertToStackEffect(t)
                                // if (stackEffect) {
                                //     data.push(stackEffect.toString())
                                // } else { data.push(t.toString()) }
                                data.push(t)
                                break
                            case "currentStack":
                            case "newStack":
                                name = "Stack"
                                data.push(t.map(stack => {
                                    // const c = new ServerStackEffectConverter();
                                    // const stackEffect = c.convertToStackEffect(stack)
                                    // if (stackEffect) {
                                    //     data.push(stackEffect.toString())
                                    // } else { data.push(stack.toString()) }
                                    data.push(stack.toString())
                                }))
                                // data.push(t.map(item => typeof item))
                                break;
                            case "stackVis":
                                name = "Stack Effect Visualization";
                                data.push(t)
                                break;
                            case "flipIfFlipped":
                                name = "Flip Card";
                                data.push(t)
                                break;
                            case "firstPos":
                                name = "First Position";
                                data.push(JSON.stringify(t))
                                break;
                            case "massage":
                                name = "Massage";
                                data.push(t)
                                break;
                            default:
                                try {
                                    name = dataEntry[0]
                                    if (typeof t != "string") {
                                        data.push(JSON.stringify(t))
                                    } else { data.push(t) }
                                } catch (e) {
                                    cc.error(e)
                                }
                                break;
                        }
                        sentData.push({ name: name, data: data })
                    }
                    let dataString = "";
                    for (const dataObj of sentData) {
                        dataString = dataString + dataObj.name + ": "
                        for (const inData of dataObj.data) {
                            dataString = dataString + inData + " \n"
                        }
                    }
                    if (!AdminConsole.noPrintSignal.includes(methodArgs[0])) {
                        if (isSending) {
                            cc.log(
                                "%c" + "Sending Signal :" + methodArgs[0] + " Time:" + time + "\n" + dataString,
                                "color:#36F"
                            );
                        } else {
                            cc.log(
                                "%c" + "Receiving Signal :" + methodArgs[0] + " Time:" + time + '\n' + dataString,
                                "color:rgb(60%, 0%, 10%)"
                            );
                        }
                    }
                } catch (error) {
                    const regex = new RegExp(`No (\\s*\\S*)* found (\\s*\\S*)*`, `g`)
                    cc.log(error)
                    if (regex.test((error as Error).message)) {
                        cc.log(`message is test`)
                    } else { cc.error(error) }
                }

            }
        }

    }
}

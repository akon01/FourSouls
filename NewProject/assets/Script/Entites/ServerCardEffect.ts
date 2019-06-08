export class ServerCardEffect {

effectName:string;
cardEffectData;
cardEffectNum:number;
cardPlayerId:number
currentServerCardEffectStack:ServerCardEffect[] = [];
cardId:number

constructor(name:string,cardEffectData,cardEffectNum:number,cardPlayerId:number,cardId:number) {
    this.effectName = name;
    this.cardEffectData = cardEffectData;
    this.cardEffectNum = cardEffectNum;
    this.cardPlayerId = cardPlayerId;
    this.cardId = cardId;
}

}
export class ServerEffect {
  effectName: string;
  cardEffectData;
  cardEffectNum: number;
  cardPlayerId: number;
  cardId: number;
  serverEffectStack: ServerEffect[];

  constructor(
    name: string,
    cardEffectData,
    cardEffectNum: number,
    cardPlayerId: number,
    cardId: number
  ) {
    this.effectName = name;
    this.cardEffectData = cardEffectData;
    this.cardEffectNum = cardEffectNum;
    this.cardPlayerId = cardPlayerId;
    this.cardId = cardId;
  }
}

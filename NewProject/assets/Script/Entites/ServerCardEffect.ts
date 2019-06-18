import { ITEM_TYPE } from "../Constants";

export class ServerEffect {
  effectName: string;
  cardEffectData;
  cardEffectNum: number;
  cardPlayerId: number;
  cardId: number;
  serverEffectStack: ServerEffect[];
  effctType: ITEM_TYPE;

  constructor(
    name: string,
    cardEffectData,
    cardEffectNum: number,
    cardPlayerId: number,
    cardId: number,
    effectType: ITEM_TYPE;
  ) {
    this.effectName = name;
    this.cardEffectData = cardEffectData;
    this.cardEffectNum = cardEffectNum;
    this.cardPlayerId = cardPlayerId;
    this.cardId = cardId;
    this.effctType = effectType
  }
}

import { _decorator } from 'cc';
import { ITEM_TYPE } from "../Constants";

export class ServerEffect {
  effectName: string;
  cardEffectData: any;
  cardEffectNum: number;
  cardPlayerId: number;
  cardId: number;
  serverEffectStack: ServerEffect[] = [];
  effctType: ITEM_TYPE;
  hasSubAction!: boolean;

  constructor(
    name: string,
    cardEffectNum: number,
    cardPlayerId: number,
    cardId: number,
    effectType: ITEM_TYPE
  ) {
    this.effectName = name;
    this.cardEffectNum = cardEffectNum;
    this.cardPlayerId = cardPlayerId;
    this.cardId = cardId;
    this.effctType = effectType;
  }
}

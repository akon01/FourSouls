import { Node, _decorator } from 'cc';
import { Effect } from "../CardEffectComponents/CardEffects/Effect";
import { TARGETTYPE } from "../Constants";
import { Item } from "../Entites/CardTypes/Item";
import { Deck } from "../Entites/GameEntities/Deck";
import { PassiveEffectData } from '../Managers/PassiveEffectData';
import { ActiveEffectData } from '../Managers/ActiveEffectData';
import { StackEffectInterface } from "../StackEffects/StackEffectInterface";
import { WrapperProvider } from '../Managers/WrapperProvider';
const { ccclass } = _decorator;


@ccclass('CursedChestEffect')
export class CursedChestEffect extends Effect {

  effectName = "CursedChestEffect";

  /**
   *
   * @param data {target:PlayerId}
   */

  //@printMethodStarted(COLORS.RED)
  async doEffect(
    stack: StackEffectInterface[],
    data?: ActiveEffectData | PassiveEffectData
  ) {
    if (!data) { debugger; throw new Error("No Data"); }

    const activatingPlayer = WrapperProvider.playerManagerWrapper.out.getPlayerByCard(data.getTarget(TARGETTYPE.PLAYER) as Node)
    if (activatingPlayer == null) {
      throw new Error("No Player Found For Cursed Chest Effect")
    }
    const deck: Deck = WrapperProvider.cardManagerWrapper.out.treasureDeck.getComponent(Deck)!
    const guppyItems: Item[] = [];
    deck.getCards().forEach(card => {
      if (card.getComponent(Item)!.isGuppyItem) {
        guppyItems.push(card.getComponent(Item)!)
      }
    });
    const itemChosen = await WrapperProvider.cardPreviewManagerWrapper.out.selectFromCards(guppyItems.map(item => item.node), 1)
    await activatingPlayer.addItem(itemChosen[0], true, true)
    deck.shuffleDeck()

    if (data instanceof PassiveEffectData) { return data }
    return WrapperProvider.stackWrapper.out._currentStack
  }
}

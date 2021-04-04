import { CCString, _decorator } from 'cc';
import { WrapperProvider } from '../../Managers/WrapperProvider';
import { PreCondition } from "./PreCondition";
const { ccclass, property } = _decorator;


@ccclass('HasSpecificActiveMonster')
export class HasSpecificActiveMonster extends PreCondition {

  @property([CCString])
  monsterNames: string[] = []

  testCondition(meta: any) {
    const activeMonsters = WrapperProvider.monsterFieldWrapper.out.getActiveMonsters()
    let answer = false
    for (const activeMonster of activeMonsters) {
      if (this.monsterNames.includes(activeMonster.name)) {
        answer = true
        break
      }
    }
    return answer
  }
}
import { _decorator, CCString, Enum } from 'cc';
const { ccclass, property } = _decorator;

import { SIGNS } from "../../Constants";
import { IFilter } from "./FilterInterface";
enum LOGIC_GATES {
    AND, OR, NONE
}

@ccclass('FilterStatementMaker')
export class FilterStatementMaker implements IFilter {
    @property(CCString)
    testedValue = '';
    @property({ type: Enum(SIGNS) })
    sign: SIGNS = SIGNS.EQUAL;
    @property(CCString)
    expectedValue = '';
    @property({ type: Enum(LOGIC_GATES) })
    logicGate: LOGIC_GATES = 2;
    getStatement() {
        let statement = `comp.${this.testedValue} ${this.getSignString(this.sign)} ${this.expectedValue}`
        switch (this.logicGate) {
            case LOGIC_GATES.AND:
                statement += `&&`
                break;
            case LOGIC_GATES.OR:
                statement += `||`
                break;
            case LOGIC_GATES.NONE:
                break;
        }
        return statement
    }
    getSignString(sign: SIGNS) {
        switch (sign) {
            case SIGNS.EQUAL:
                return `==`
            case SIGNS.NOT_EQUAL:
                return `!=`
            case SIGNS.GREATER_EQUAL_THAN:
                return `>=`
            case SIGNS.GREATER_THAN:
                return `>`
            case SIGNS.SMALLER_EQUAL_THAN:
                return `<=`
            case SIGNS.SMALLER_THAN:
                return `<`
        }
    }
}
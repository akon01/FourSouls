import { EDOM } from "constants";



export default class EffectTextPos  {


    Ystart: number = 0;


    Yend: number = 0;

    constructor(start:number,end:number) {
        this.Ystart = start;
        this.Yend = end
    }
}

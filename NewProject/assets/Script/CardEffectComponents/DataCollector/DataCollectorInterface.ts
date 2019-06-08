import { COLLECTORTYPE } from "../../Constants";

export default interface DataCollectorInterface {

    collectorName:string;
    

   collectData(data?):Promise<{}>;

}

/**
 * Configuration loader.
 * @author wheatup
 */

import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

import { Events } from "../Misc/Events";
import { whevent } from "./whevent";

@ccclass('Config')
export class Config extends Component {
        loadConfig() {
                //return new Promise((resolve, reject) => {
                //cc.loader.loadRes('config.json', (err, data: cc.JsonAsset) => {
                //if (err) {
                //reject(err);
                //} else {
                //resolve(data.json);
                //}
                //});
                //});
        }
        async start() {
                //whevent.emit(Events.LOAD_CONFIG);
                //let config: any = await this.loadConfig();

                //Config.server = config.server;
                //whevent.emit(Events.LOADED_CONFIG, config);
        }
}

/**
 * Note: The original script has been commented out, due to the large number of changes in the script, there may be missing in the conversion, you need to convert it manually
 */
// /**
//  * Configuration loader.
//  * @author wheatup
//  */
// import Events from "../Misc/Events";
// import { whevent } from "./whevent";
// 
// const { ccclass, property } = cc._decorator;
// 
// @ccclass
// export class Config extends cc.Component {
// 	static server: any = null;
// 
// 	loadConfig() {
// 		return new Promise((resolve, reject) => {
// 			cc.loader.loadRes('config.json', (err, data: cc.JsonAsset) => {
// 				if (err) {
// 					reject(err);
// 				} else {
// 					resolve(data.json);
// 				}
// 			});
// 		});
// 	}
// 
// 	async start() {
// 		whevent.emit(Events.LOAD_CONFIG);
// 		let config: any = await this.loadConfig();
// 
// 		Config.server = config.server;
// 		whevent.emit(Events.LOADED_CONFIG, config);
// 	}
// }

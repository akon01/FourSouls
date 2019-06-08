
import { CardLayout } from "../Entites/CardLayout"
import { getHandCards, isInHand, removeFromHand, addCardToCardLayout } from "./HandModule"
import { LANDING_NODES } from "../Constants";


export function getUniqeLandNode(landedZones: cc.Node[]) {
    let deskBool: boolean = false;
    let handBool: boolean = false;
    let deskNode: cc.Node;
    let handNode: cc.Node



    for (let i = 0; i < landedZones.length; i++) {
        const landedZone = landedZones[i];

        if (landedZone.name == 'Desk') {
            deskBool = true
            deskNode = landedZone
        }
        if (landedZone.name == 'Hand') {
            handBool = true;
            handNode = landedZone
        }
    }

    if ((handBool && deskBool) || handBool) {
        return LANDING_NODES.HAND
    }
    if (deskBool && (handBool == false)) {

        return LANDING_NODES.DESK
    }

}
export function getLandedNode(card: cc.Node, landingZones: cc.Node[],desierdType:LANDING_NODES): { type: LANDING_NODES, zone: cc.Node } {
    let cardBoundingBox = card.getBoundingBoxToWorld();
    let landedZoneType: LANDING_NODES = null;
    let landingZonesNode: { type: LANDING_NODES, zone: cc.Node };
    let foundLandZone:boolean = false;
    for (let i = 0; i < landingZones.length; i++) {
        const landingZone = landingZones[i];
        switch (landingZone.name) {
            case 'Hand':        
                landedZoneType = LANDING_NODES.HAND
                break;
            case 'Desk':
                landedZoneType = LANDING_NODES.DESK
                break;
            case 'LootCardPile':
                landedZoneType = LANDING_NODES.LOOTCARDPILE
                break;
            default:
                break;
        }
        if (landingZone.getComponent('CardLayout') != null) {
            //hand bounding box is diffrent with children
            let landingZoneComp: CardLayout = landingZone.getComponent('CardLayout');
            if (cardBoundingBox.intersects(landingZoneComp.getBoundingBoxToWorldWithoutChildren())) {
              
                let data = { type: landedZoneType, zone: landingZone }
                landingZonesNode = data
                foundLandZone=true
            }
        } else if (cardBoundingBox.intersects(landingZone.getBoundingBoxToWorld())) {
            let data = { type: landedZoneType, zone: landingZone }
            landingZonesNode = data
            foundLandZone=true
        }
        if(foundLandZone && desierdType==landingZonesNode.type){
            return landingZonesNode
        }

    }
   
    if(!foundLandZone){
        let data = { type: LANDING_NODES.TABLE, zone: cc.find('Canvas') }
        landingZonesNode =data;
    }
    //cc.log(landingZonesNode)
    return landingZonesNode
}


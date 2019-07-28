import Card from "./GameEntities/Card";
import ActionManager from "../Managers/ActionManager";

const { ccclass, property } = cc._decorator;

var Type = cc.Enum({
  /**
   * !#en None Layout
   * !#zh 取消布局
   *@property {Number} NONE
   */
  NONE: 0,
  /**
   * !#en Horizontal Layout
   * !#zh 水平布局
   * @property {Number} HORIZONTAL
   */
  HORIZONTAL: 1,

  /**
   * !#en Vertical Layout
   * !#zh 垂直布局
   * @property {Number} VERTICAL
   */
  VERTICAL: 2,
  /**
   * !#en Grid Layout
   * !#zh 网格布局
   * @property {Number} GRID
   */
  GRID: 3
});

var ResizeMode = cc.Enum({
  /**
   * !#en Don't do any scale.
   * !#zh 不做任何缩放
   * @property {Number} NONE
   */
  NONE: 0,
  /**
   * !#en The container size will be expanded with its children's size.
   * !#zh 容器的大小会根据子节点的大小自动缩放。
   * @property {Number} CONTAINER
   */
  CONTAINER: 1,
  /**
   * !#en Child item size will be adjusted with the container's size.
   * !#zh 子节点的大小会随着容器的大小自动缩放。
   * @property {Number} CHILDREN
   */
  CHILDREN: 2
});

@ccclass
export class CardLayout extends cc.Component {
  @property
  isResized: boolean = false;

  @property
  spacingX: number = 0;

  @property
  paddingLeft: number = 0;

  @property
  paddingRight: number = 0;

  @property
  _layoutDirty = true;

  @property
  type: number = 1;

  @property
  resizeMode: number = ResizeMode.NONE;

  @property([cc.Node])
  layoutCards: cc.Node[] = [];

  @property
  playerId: number = 0;

  @property
  handId: number = 0;

  @property
  handPosition: cc.Vec2 = null;

  @property
  boundingBoxWithoutChildren: cc.Rect = null;

  @property
  originalChildWidth: number = 0;

  @property
  overflow: boolean = false;

  @property(Number)
  localSign = 1;

  addCardToLayout(newCard: cc.Node) {
    let newCardComp = newCard.getComponent(Card);
    // newCardComp.currentCardLayout = this;

    this.layoutCards.push(newCard);


    this.node.emit("HandCardAdded", newCard);
    //  ActionManager.updateActions();
  }

  removeCardFromLayout(cardToRemove: cc.Node) {
    let cardToRemoveComp = cardToRemove.getComponent(Card);
    // cardToRemoveComp.currentCardLayout = null;
    this.layoutCards.splice(this.layoutCards.indexOf(cardToRemove), 1);
    this.node.emit("HandCardRemoved", cardToRemove);
  }

  getBoundingBoxToWorldWithoutChildren() {
    return this.boundingBoxWithoutChildren;
  }

  showHandLayout() {
    if (this.isResized == false) {
      //enlarge hand when dragging above it
      this.node.runAction(cc.moveBy(0.2, 0, 50));
      this.node.runAction(cc.scaleTo(0.2, 1.5));
      this.node.emit("ResizeHand");

      this.isResized = true;
    }
  }

  hideHandLayout() {
    if (this.isResized == true) {
      this.node.runAction(cc.moveBy(0.2, 0, -50));
      this.node.runAction(cc.scaleTo(0.2, 1));
      this.node.emit("ResizeHand");

      this.isResized = false;
    }
  }

  _doLayoutDirty(func: string) {
    this._layoutDirty = true;

  }

  _doLayout() {
    this._doLayoutHorizontally(this.node.width * this.node.scaleY, true);
  }

  _getHorizontalBaseWidth(children) {
    var newWidth = 0;
    var activeChildCount = 0;

    for (var i = 0; i < children.length; ++i) {
      var child = children[i];
      if (child.activeInHierarchy) {
        activeChildCount++;
        newWidth += child.width * child.scaleX;
      }
      newWidth +=
        (activeChildCount - 1) * this.spacingX +
        this.paddingLeft +
        this.paddingRight;
    }

    return newWidth;
  }

  _doLayoutHorizontally(baseWidth, applyChildren) {
    var afterChangeChildWidth: number = 0;

    var layoutAnchor = this.node.getAnchorPoint();

    var children = this.layoutCards;
    var nodeX;
    var sign = this.localSign;
    var layoutY = this.node.y;
    var paddingX = this.paddingLeft;

    var cardHeight;

    if (this.node.parent.name == "PlayerItems") {
      let layout = this.node.parent.getComponent(cc.Layout);
      let widget = this.node.parent.getComponent(cc.Widget);
      if (children[0]) {
        cardHeight = children[0].height;
      } else cardHeight = 0;

      nodeX = this.node.parent.parent.x;
      if (this.node.name == "ActiveItems") {
        layoutY =
          this.node.convertToNodeSpaceAR(this.node.getPosition()).y -
          cardHeight * 0.25 +
          layout.spacingY;
      } else {
        layoutY =
          this.node.convertToNodeSpaceAR(this.node.getPosition()).y
          -
          cardHeight * 1.25;
      }
    } else {
      nodeX = this.node.x;
      layoutY = this.node.y;
    }
    var leftBoundaryOfLayout = nodeX - layoutAnchor.x * baseWidth * sign;

    var nextX = leftBoundaryOfLayout + sign * paddingX - sign * this.spacingX;

    var containerResizeBoundary = 0;

    let childrenWidth = 0;

    let overflow: Boolean = false;
    for (let k = 0; k < children.length; k++) {
      childrenWidth += this.originalChildWidth + this.spacingX;

      // childrenWidth += children[k].width + this.spacingX;
    }
    childrenWidth -= this.spacingX;
    if (childrenWidth > baseWidth) {
      overflow = true;
    } else overflow = false;

    for (var i = 0; i < children.length; ++i) {
      var child = children[i];
      if (!child.activeInHierarchy) {
        continue;
      }
      //for resizing  children

      if (overflow) {
        let removeEachBy = (childrenWidth - baseWidth) / children.length;
        child.width = this.originalChildWidth - removeEachBy;
      } else child.width = this.originalChildWidth;

      var anchorX = child.anchorX;
      var childBoundingBoxWidth = child.width * child.scaleX;

      nextX =
        nextX + sign * anchorX * childBoundingBoxWidth + sign * this.spacingX;
      var rightBoundaryOfChild = sign * (1 - anchorX) * childBoundingBoxWidth;

      if (
        baseWidth >=
        childBoundingBoxWidth + this.paddingLeft + this.paddingRight
      ) {
        if (applyChildren) {
          // child.runAction(cc.moveTo(0.5,nextX, 0))
          let newPos = cc.v2(nextX, 0);


          child.setPosition(cc.v2(nextX, layoutY));
        }
      }

      nextX += rightBoundaryOfChild;
    }

    return containerResizeBoundary;
  }

  _addChildrenEventListeners() {
    var children = this.layoutCards;
    for (var i = 0; i < children.length; ++i) {
      var child = children[i];
      child.on(
        cc.Node.EventType.SIZE_CHANGED,
        event => {
          this._doLayoutDirty("_addChildrenEventListeners");

        },
        this
      );
      child.on(
        cc.Node.EventType.POSITION_CHANGED,
        event => {
          this._doLayoutDirty("_addChildrenEventListeners POSITION_CHANGED");
        },
        this
      );
      child.on(
        cc.Node.EventType.ANCHOR_CHANGED,
        event => {
          this._doLayoutDirty("_addChildrenEventListeners ANCHOR_CHANGED");
        },
        this
      );
      child.on(
        "active-in-hierarchy-changed",
        event => {
          this._doLayoutDirty(
            "_addChildrenEventListeners active-in-hierarchy-changed"
          );
        },
        this
      );
    }
  }

  _removeChildrenEventListeners() {
    var children = this.layoutCards;
    for (var i = 0; i < children.length; ++i) {
      var child = children[i];
      child.off(
        cc.Node.EventType.SIZE_CHANGED,
        event => {
          this._doLayoutDirty("_removeChildrenEventListeners SIZE_CHANGED");
        },
        this
      );
      child.off(
        cc.Node.EventType.POSITION_CHANGED,
        event => {
          this._doLayoutDirty("_removeChildrenEventListeners POSITION_CHANGED");
        },
        this
      );
      child.off(
        cc.Node.EventType.ANCHOR_CHANGED,
        event => {
          this._doLayoutDirty("_removeChildrenEventListeners ANCHOR_CHANGED");
        },
        this
      );
      child.off(
        "active-in-hierarchy-changed",
        event => {
          this._doLayoutDirty(
            "_removeChildrenEventListeners active-in-hierarchy-changed"
          );
        },
        this
      );
    }
  }

  updateLayout() {
    if (this._layoutDirty && this.layoutCards.length > 0) {
      if (this.node.children.length == 1 && this.originalChildWidth == 0) {
        this.originalChildWidth = this.node.children[0].width;
      }
      this._doLayout();
      this._layoutDirty = false;
    }
  }

  _childRemoved(child: cc.Node) {
    child.off(
      cc.Node.EventType.SIZE_CHANGED,
      event => {
        this._doLayoutDirty("_childRemoved SIZE_CHANGED");
      },
      this
    );
    child.off(
      cc.Node.EventType.POSITION_CHANGED,
      event => {
        this._doLayoutDirty("_childRemoved POSITION_CHANGED");
      },
      this
    );
    child.off(
      cc.Node.EventType.ANCHOR_CHANGED,
      event => {
        this._doLayoutDirty("_childRemoved ANCHOR_CHANGED");
      },
      this
    );
    child.off(
      "active-in-hierarchy-changed",
      event => {
        this._doLayoutDirty("_childRemoved active-in-hierarchy-changed");
      },
      this
    );
    if (this.originalChildWidth == 0) {
      this.originalChildWidth = child.width;
    }
    this.layoutCards.forEach(child2 => {
      child2.width = this.originalChildWidth;
    });
    child.width = this.originalChildWidth;
    this._doLayoutDirty("_childRemoved");

  }

  _addEventListeners() {
    cc.director.on(cc.Director.EVENT_AFTER_UPDATE, this.updateLayout, this);

    this.node.on(cc.Node.EventType.SCALE_CHANGED, this.resizeChildren, this);
    this.node.on(cc.Node.EventType.POSITION_CHANGED, this._doLayoutDirty, this);
    this.node.on(
      "HandCardAdded",
      addedChild => {
        this._childAdded(addedChild);
      },
      this
    );
    this.node.on(
      "HandCardRemoved",
      removedChild => {
        this._childRemoved(removedChild);
      },
      this
    );
    //this.node.on(cc.Node.EventType.CHILD_REORDER, (event) => { this._doLayoutDirty(); 
    this._addChildrenEventListeners();
  }

  resizeChildren() {
    var children = this.layoutCards;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      child.scaleX = this.node.scaleX;
      child.scaleY = this.node.scaleY;
      this._doLayoutDirty("resizeChildren");
    }
  }

  _removeEventListeners() {
    cc.director.off(cc.Director.EVENT_AFTER_UPDATE, this.updateLayout, this);
    this.node.off(cc.Node.EventType.SIZE_CHANGED, this.updateLayout, this);
    this.node.off(
      cc.Node.EventType.ANCHOR_CHANGED,
      event => {
        this._doLayoutDirty("_removeEventListeners ANCHOR_CHANGED");
      },
      this
    );
    this.node.off(
      "HandCardAdded",
      addedChild => {
        this._childAdded(addedChild);
      },
      this
    );
    this.node.off(
      "HandCardRemoved",
      removedChild => {
        this._childRemoved(removedChild);
      },
      this
    );
    //  this.node.off(cc.Node.EventType.CHILD_REORDER, (event) => { this._doLayoutDirty('_removeEventListeners CHILD_REORDER'); 
    this._removeChildrenEventListeners();
  }

  _childAdded(child: cc.Node) {
    child.on(
      cc.Node.EventType.ANCHOR_CHANGED,
      event => {
        this._doLayoutDirty("_childAdded ANCHOR_CHANGED");
      },
      this
    );
    child.on("active-in-hierarchy-changed", this._doLayoutDirty, this);
    if (this.originalChildWidth == 0) {
      this.originalChildWidth = child.width;
    }
    this._doLayoutDirty("_childAdded");
  }

  // LIFE-CYCLE CALLBACKS:

  onEnable() {
    this._addEventListeners();
    this._doLayoutDirty("onEnable");
  }

  onLoad() {
    //       //set hand position based on player
    //    let parentNode:cc.Node = this.node.parent;
    //    let canvas:cc.Node = cc.find('Canvas')
    //    let playerComp:Player =  parentNode.getComponent('Player');
    //     switch (this.handId) {
    //         case 1:
    //             this.handPosition = canvas.convertToNodeSpaceAR(new cc.Vec2(HAND_POSITIONS.FIRST_X,HAND_POSITIONS.FIRST_Y)) ;
    //             this.node.setPosition(this.handPosition)
    //             playerComp.hand = this.node.getComponent('CardLayout');
    //             break;
    //         case 2:
    //         this.handPosition = canvas.convertToNodeSpaceAR(new cc.Vec2(HAND_POSITIONS.SECOND_X,HAND_POSITIONS.SECOND_Y)) ;
    //         this.node.setPosition(this.handPosition)
    //         playerComp.hand = this.node.getComponent('CardLayout');
    //         break;
    //         default:
    //             break;
    //     }
    //     this.boundingBoxWithoutChildren = this.node.getBoundingBoxToWorld();
  }

  start() { }

  update(dt) { }
}

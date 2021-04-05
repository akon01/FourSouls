import { _decorator, Enum, Component, Node, Vec2, Rect, CCInteger, tween, math, UITransform, director, Director, find, v2, v3, UI } from 'cc';
const { ccclass, property } = _decorator;

import { Card } from "./GameEntities/Card";
import { ActionManager } from "../Managers/ActionManager";
import { WrapperProvider } from '../Managers/WrapperProvider';
import { Signal } from '../../Misc/Signal';
const Type = Enum({
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
const ResizeMode = Enum({
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

@ccclass('CardLayout')
export class CardLayout extends Component {
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

      @property([Node])
      layoutCards: Node[] = [];

      @property
      playerId: number = 0;

      @property
      handId: number = 0;

      @property
      handPosition: Vec2 | null = null;

      @property
      boundingBoxWithoutChildren: Rect | null = null;

      @property
      originalChildWidth: number = 0;

      @property
      overflow: boolean = false;

      @property(CCInteger)
      localSign = 1;

      private showCardsBack: boolean = false

      handleCardSprite(card: Card) {
            if (this.showCardsBack) {
                  const cardComp = card.getComponent(Card)!
                  if (cardComp._isShowingBack) {
                        cardComp.flipCard(false)
                  }
            } else {
                  const cardComp = card.getComponent(Card)!
                  if (!cardComp._isShowingBack) {
                        cardComp.flipCard(false)
                  }
            }
      }

      setShowCardsBack(isShow: boolean, sendToServer: boolean) {
            this.showCardsBack = isShow
            if (sendToServer) {
                  WrapperProvider.serverClientWrapper.out.send(Signal.PLAYER_SET_HAND_SHOW_CARD_BACK, { playerId: this.playerId, isShow })
            }
            this.layoutCards.forEach(c => {
                  const cardComp = c.getComponent(Card)!
                  this.handleCardSprite(cardComp)
            })

      }

      addCardToLayout(newCard: Node) {
            const newCardComp = newCard.getComponent(Card)!;
            // newCardComp.currentCardLayout = this;

            this.layoutCards.push(newCard);
            this.handleCardSprite(newCardComp)

            this.node.emit("HandCardAdded", newCard);
            //  WrapperProvider.actionManagerWrapper.out.updateActions();
      }

      removeCardFromLayout(cardToRemove: Node) {
            const cardToRemoveComp = cardToRemove.getComponent(Card);
            // cardToRemoveComp.currentCardLayout = null;
            this.layoutCards.splice(this.layoutCards.indexOf(cardToRemove), 1);
            this.node.emit("HandCardRemoved", cardToRemove);
      }

      getBoundingBoxToWorldWithoutChildren() {
            return this.boundingBoxWithoutChildren;
      }

      hideHandLayout() {
            if (this.isResized == true) {
                  tween(this.node)
                        .by(0.2, { position: math.v3(0, -50) })
                        .by(0.2, { scale: math.v3(1) })
                        .start()
                  // this.node.runAction(moveBy(0.2, 0, -50));
                  // this.node.runAction(scaleTo(0.2, 1));
                  this.node.emit("ResizeHand");

                  this.isResized = false;
            }
      }

      _doLayoutDirty(func: string) {
            this._layoutDirty = true;

      }

      _doLayout() {
            this._doLayoutHorizontally(this.node.getComponent(UITransform)!.width * this.node.scale.y, true);
      }

      _getHorizontalBaseWidth(children: Node[]) {
            let newWidth = 0;
            let activeChildCount = 0;

            for (let i = 0; i < children.length; ++i) {
                  const child = children[i];
                  const childTrans = child.getComponent(UITransform)!
                  if (child.activeInHierarchy) {
                        activeChildCount++;
                        newWidth += childTrans.width * child.scale.y;
                  }
                  newWidth +=
                        (activeChildCount - 1) * this.spacingX +
                        this.paddingLeft +
                        this.paddingRight;
            }

            return newWidth;
      }

      _doLayoutHorizontally(baseWidth: number, applyChildren: boolean) {
            const afterChangeChildWidth: number = 0;

            const canvas = WrapperProvider.CanvasNode
            const thisTrans = (this.node.getComponent(UITransform)!);
            const layoutAnchor = thisTrans.anchorPoint;

            const children = this.layoutCards;

            const canvasTrans = (canvas?.getComponent(UITransform)!);
            let nodeX = canvasTrans.convertToNodeSpaceAR(thisTrans.convertToWorldSpaceAR(v3(this.node.position.x, 0))).x;
            const sign = this.localSign;
            const nodeWorldSpace = thisTrans.convertToWorldSpaceAR(v3(0, this.node.position.y))
            const canvasNodeSpace = canvasTrans.convertToNodeSpaceAR(this.node.getPosition())
            const canvasNodeAndNodeWorld = canvasTrans.convertToNodeSpaceAR(thisTrans.convertToNodeSpaceAR(this.node.getPosition()))
            let layoutY: number = canvasTrans.convertToNodeSpaceAR(this.node.parent!.getComponent(UITransform)!.convertToWorldSpaceAR(v3(0, this.node.position.y))).y;
            const paddingX = this.paddingLeft;

            let cardHeight;

            // if (this.node.parent.name == "PlayerItems") {
            //   const layout = this.node.parent.getComponent(Layout);
            //   const widget = this.node.parent.getComponent(Widget);
            //   if (children[0]) {
            //     cardHeight = children[0].height;
            //   } else { cardHeight = 0; }

            //   // nodeX = this.node.parent.parent.x;
            //   if (this.node.name == "ActiveItems") {
            //     layoutY =
            //       this.node.convertToNodeSpaceAR(this.node.getPosition()).y - cardHeight * 0.25 + layout.spacingY;
            //   } else {
            //     layoutY =
            //       this.node.convertToNodeSpaceAR(this.node.getPosition()).y - cardHeight * 1.25;
            //   }
            // } else {
            //   // nodeX = this.node.x;
            //   layoutY = this.node.y;
            // }
            const topBoundry = layoutY - layoutAnchor.y * thisTrans.height * sign


            const leftBoundaryOfLayout = nodeX - layoutAnchor.x * baseWidth * sign;

            let nextX = leftBoundaryOfLayout + sign * paddingX - sign * this.spacingX;


            const containerResizeBoundary = 0;

            let childrenWidth = 0;

            let overflow: Boolean = false;
            for (let k = 0; k < children.length; k++) {
                  childrenWidth += this.originalChildWidth + this.spacingX;

                  // childrenWidth += children[k].width + this.spacingX;
            }
            childrenWidth -= this.spacingX;
            if (childrenWidth > baseWidth) {
                  overflow = true;
            } else { overflow = false; }

            for (let i = 0; i < children.length; ++i) {
                  const child = children[i];
                  const childTrans = child.getComponent(UITransform)!
                  if (!child.activeInHierarchy) {
                        continue;
                  }
                  //for resizing  children

                  if (overflow) {
                        const removeEachBy = (childrenWidth - baseWidth) / children.length;
                        childTrans.width = this.originalChildWidth - removeEachBy;
                  } else { childTrans.width = this.originalChildWidth; }

                  const anchorX = childTrans.anchorX;
                  const childBoundingBoxWidth = childTrans.width * child.scale.x;
                  let multi = sign == 1 ? 1 : 2
                  nextX = nextX + sign * anchorX * childBoundingBoxWidth + sign * this.spacingX;
                  const rightBoundaryOfChild = sign * (1 - anchorX) * childBoundingBoxWidth;

                  if (
                        baseWidth >=
                        childBoundingBoxWidth + this.paddingLeft + this.paddingRight
                  ) {
                        if (applyChildren) {
                              const newPos = v2(nextX, 0);
                              child.setPosition(v3(nextX, layoutY));

                        }
                  }

                  nextX += rightBoundaryOfChild;
            }

            return containerResizeBoundary;
      }

      _addChildrenEventListeners() {
            const children = this.layoutCards;
            for (let i = 0; i < children.length; ++i) {
                  const child = children[i];
                  child.on(
                        Node.EventType.SIZE_CHANGED,
                        (event: any) => {
                              this._doLayoutDirty("_addChildrenEventListeners");

                        },
                        this
                  );
                  child.on(
                        Node.EventType.TRANSFORM_CHANGED,
                        (event: any) => {
                              if (event & Node.TransformBit.POSITION)
                                    this._doLayoutDirty("_addChildrenEventListeners POSITION_CHANGED");
                        },
                        this
                  );
                  child.on(
                        Node.EventType.ANCHOR_CHANGED,
                        (event: any) => {
                              this._doLayoutDirty("_addChildrenEventListeners ANCHOR_CHANGED");
                        },
                        this
                  );
                  child.on(
                        "active-in-hierarchy-changed",
                        (event: any) => {
                              this._doLayoutDirty(
                                    "_addChildrenEventListeners active-in-hierarchy-changed"
                              );
                        },
                        this
                  );
            }
      }

      _removeChildrenEventListeners() {
            const children = this.layoutCards;
            for (let i = 0; i < children.length; ++i) {
                  const child = children[i];
                  child.off(
                        Node.EventType.SIZE_CHANGED,
                        (event: any) => {
                              this._doLayoutDirty("_removeChildrenEventListeners SIZE_CHANGED");
                        },
                        this
                  );
                  child.off(
                        Node.EventType.TRANSFORM_CHANGED,
                        (event: any) => {
                              if (event & Node.TransformBit.POSITION)
                                    this._doLayoutDirty("_removeChildrenEventListeners POSITION_CHANGED");
                        },
                        this
                  );
                  child.off(
                        Node.EventType.ANCHOR_CHANGED,
                        (event: any) => {
                              this._doLayoutDirty("_removeChildrenEventListeners ANCHOR_CHANGED");
                        },
                        this
                  );
                  child.off(
                        "active-in-hierarchy-changed",
                        (event: any) => {
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
                        this.originalChildWidth = this.node.children[0].getComponent(UITransform)!.width;
                  }
                  this._doLayout();
                  this._layoutDirty = false;
            }
      }

      _childRemoved(child: Node) {
            child.off(
                  Node.EventType.SIZE_CHANGED,
                  (event: any) => {
                        this._doLayoutDirty("_childRemoved SIZE_CHANGED");
                  },
                  this
            );
            child.off(
                  Node.EventType.TRANSFORM_CHANGED,
                  (event: any) => {
                        if (event & Node.TransformBit.POSITION)
                              this._doLayoutDirty("_childRemoved POSITION_CHANGED");
                  },
                  this
            );
            child.off(
                  Node.EventType.ANCHOR_CHANGED,
                  (event: any) => {
                        this._doLayoutDirty("_childRemoved ANCHOR_CHANGED");
                  },
                  this
            );
            child.off(
                  "active-in-hierarchy-changed",
                  (event: any) => {
                        this._doLayoutDirty("_childRemoved active-in-hierarchy-changed");
                  },
                  this
            );
            if (this.originalChildWidth == 0) {
                  this.originalChildWidth = child.getComponent(UITransform)!.width;
            }
            this.layoutCards.forEach(child2 => {
                  child2.getComponent(UITransform)!.width = this.originalChildWidth;
            });
            child.getComponent(UITransform)!.width = this.originalChildWidth;
            this._doLayoutDirty("_childRemoved");

      }

      _addEventListeners() {
            director.on(Director.EVENT_AFTER_UPDATE, this.updateLayout, this);

            this.node.on(Node.EventType.TRANSFORM_CHANGED,
                  (event: any) => {
                        if (event & Node.TransformBit.SCALE)
                              this.resizeChildren
                  }, this
            );
            this.node.on(Node.EventType.TRANSFORM_CHANGED,
                  (event: any) => {
                        if (event & Node.TransformBit.POSITION)
                              this._doLayoutDirty
                  },
                  this);
            this.node.on(
                  "HandCardAdded",
                  (addedChild: Node) => {
                        this._childAdded(addedChild);
                  },
                  this
            );
            this.node.on(
                  "HandCardRemoved",
                  (removedChild: Node) => {
                        this._childRemoved(removedChild);
                  },
                  this
            );
            //this.node.on(Node.EventType.CHILD_REORDER, (event) => { this._doLayoutDirty();
            this._addChildrenEventListeners();
      }

      resizeChildren() {
            const children = this.layoutCards;
            for (let i = 0; i < children.length; i++) {
                  const child = children[i];
                  child.scale.set(this.node.scale.x, this.node.scale.y)
                  this._doLayoutDirty("resizeChildren");
            }
      }

      _removeEventListeners() {
            director.off(Director.EVENT_AFTER_UPDATE, this.updateLayout, this);
            this.node.off(Node.EventType.SIZE_CHANGED, this.updateLayout, this);
            this.node.off(
                  Node.EventType.ANCHOR_CHANGED,
                  (event: any) => {
                        this._doLayoutDirty("_removeEventListeners ANCHOR_CHANGED");
                  },
                  this
            );
            this.node.off(
                  "HandCardAdded",
                  (addedChild: Node) => {
                        this._childAdded(addedChild);
                  },
                  this
            );
            this.node.off(
                  "HandCardRemoved",
                  (removedChild: Node) => {
                        this._childRemoved(removedChild);
                  },
                  this
            );
            //  this.node.off(Node.EventType.CHILD_REORDER, (event) => { this._doLayoutDirty('_removeEventListeners CHILD_REORDER');
            this._removeChildrenEventListeners();
      }

      _childAdded(child: Node) {
            child.on(
                  Node.EventType.ANCHOR_CHANGED,
                  (event: any) => {
                        this._doLayoutDirty("_childAdded ANCHOR_CHANGED");
                  },
                  this
            );
            child.on("active-in-hierarchy-changed", this._doLayoutDirty, this);
            if (this.originalChildWidth == 0) {
                  this.originalChildWidth = child.getComponent(UITransform)!.width;
            }
            this._doLayoutDirty("_childAdded");
      }

      // LIFE-CYCLE CALLBACKS:

      onEnable() {
            this._addEventListeners();
            this._doLayoutDirty("onEnable");
      }


}

/**
 * Server events
 * @author wheatup
 */

export default {

  //board signals
  UPDATEPASSIVESOVER: "$UPDATEPASSIVESOVER",
  REGISTERPASSIVEITEM: "$REGISTERPASSIVEITEM",
  REGISTERONETURNPASSIVEEFFECT: "$REGISTERONETURNPASSIVEEFFECT",
  //Deck siganls
  ADDSTORECARD: '$ADDSTORECARD',
  DRAWCARD: '$DRAWCARD',
  //


  //Player signals
  ENDROLLACTION: "$ENDROLLACTION",
  CHANGEMONEY: '$CHANGEMONEY',
  SETMONEY: "$SETMONEY",
  //

  UPDATEACTIONS: "$UPDATEACTIONS",
  FINISHLOAD: "$FINISHLOAD",
  REMOVEMONSTER: "$REMOVEMONSTER",
  ADDMONSTER: '$ADDMONSTER',
  GETSOUL: '$GETSOUL',
  GETNEXTMONSTER: "$GETNEXTMONSTER",
  MOVECARDTOPILE: "$MOVECARDTOPILE",
  ROLLDICEENDED: "$ROLLDICEENDED",
  ROLLDICE: "$ROLLDICE",
  SHOWCARDPREVIEW: "$SHOWCARDPREVIEW",
  NEWMONSTERONPLACE: "$NEWMONSTERONPLACE",
  DISCRADLOOT: "$DISCARDLOOT",
  LOOTPLAYEDINACTION: "$LOOTPLAYEDINACTION",
  ACTIVATEPASSIVE: "$ACTIVATEPASSIVE",
  ACTIVATEITEM: "$ACTIVATEITEM",
  SERVERCARDEFFECT: "$SERVERCARDEFFECT",
  OTHERPLAYERRESOLVEREACTION: "$OTHERPLAYERRESOLVEREACTION",
  RESOLVEACTIONS: "$RESOLVEACTIONS",
  FIRSTGETREACTION: "$FIRSTGETREACTION",
  GETREACTION: "$GETREACTION",
  REACTION: "$REACTION",
  DECLAREATTACK: "$DECLAREATTACK",
  ADDANITEM: "$ADDANITEM",
  PLAYLOOTCARD: "$PLAYLOOTCARD",
  CARDDRAWED: "$CARDDARWED",
  NEXTTURN: "$NEXTTURN",
  STARTGAME: "$STARTGAME",
  MOVETOTABLE: "$MOVETOTABLE",
  /**
   * @server
   * @summary Successfully logged into the server
   * @params the uuid of current player
   */
  UUID: "$UUID",

  /**
   * @server
   * @summary When someone joined the room
   * @param uuid the uuid of the player whom joined
   */
  JOIN: "$JOIN",

  /**
   * @server
   * @summary When someone left the room
   * @param uuid the uuid of the player whom left
   */
  LEAVE: "$LEAVE",

  /**
   * @server
   * @summary When the match starts
   * @param level the level of the game
   * @param text the text of the puzzle
   * @param time the time limit of the game
   *
   * @client
   * @summary Request the server to start a match
   * @param level the level requested
   */
  MATCH: "$MATCH",

  /**
   * @server
   * @summary Game ended.
   * @param interrupted is the game got interrupted
   * @param score player scores
   */
  RESULT: "$RESULT",

  /**
   * @server
   * @summary When player got a word correctly
   * @param uuid this player id of the winner
   * @param word the word that player got
   * @param ids the ids of the hexagons
   * @param letters the new replacing letters
   */
  CORRECT: "$CORRECT",

  /**
   * @server
   * @summary When player got a word wrong
   * @param uuid who got it wrong
   * @param word the word that player got
   * @param ids the ids of the hexagons
   */
  WRONG: "$WRONG",

  /**
   * @client
   * @summray validate a word
   * @param ids the array of chain numbers
   */
  VALIDATE: "$VALIDATE"
};

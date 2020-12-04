'use strict';

module.exports = {
  load () {
    // When the package loaded
  },

  unload () {
    // When the package unloaded
  },

  messages: {
    'say-hello' () {
      Editor.log('Hello World!');
    },
    'open' (){
      Editor.Panel.open('hello-world');
    }
  },
};
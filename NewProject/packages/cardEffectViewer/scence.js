module.exports = {
    'get-canvas-children': function (event) {
        var canvas = cc.director.getScene();
        Editor.log('children length:' + canvas.children.length);

        if (event.reply) {
            event.reply(null, canvas.name);
        }
    }
}
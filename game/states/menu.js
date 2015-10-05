
'use strict';
function Menu() {
}

Menu.prototype = {
    preload: function () {
        this.loadLocal();
        //this.loadWP();
    },
    create: function () {
        var style = {font: '65px Arial', fill: '#ffffff', align: 'center'};
        this.add.image(0, 0, 'sky');
        this.add.image(0, 0, 'title');
    },
    update: function () {
        if (this.game.input.activePointer.justPressed()) {
            this.game.state.start('play');
        }
    },
    loadLocal: function () {
        this.loadThings('');
    },
    loadWP: function () {
        var tempurl = SITEINFO.base_url;
        this.loadThings(tempurl + "/");
    },
    loadThings: function (base) {
        this.game.load.image('sky', base + 'assets/sky.png');
        this.game.load.image('title', base + 'assets/title.png');
    }
};

module.exports = Menu;

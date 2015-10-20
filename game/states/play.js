'use strict';
//Plugins

var EncounterCreator = require('../generation/encountercreator');
var Player = require('../player/player');

function Play() {
}
Play.prototype = {
    preload: function () {
        this.loadLocal();
        //this.loadWP();

        this.game.time.advancedTiming = true;
        this.game.plugins.add(new Phaser.Plugin.Isometric(this.game));
        this.game.iso.anchor.setTo(0.5, 0.2);
    },
    create: function () {
        // Create a group for our tiles.
        this.add.image(0, 0, 'bigsky');

        // Provide a 3D position for the cursor
        this.cursorPos = new Phaser.Plugin.Isometric.Point3();

        //Level Stuff
        this.encountercreator = new EncounterCreator();
        this.encountercreator.configuration.size = 'large';
        this.encounter = this.encountercreator.getEncounter();

        this.levelGroup = this.encounter.getLevelGroup( this.game );
        this.levelGrid = this.encounter.getLevelGrid();


        //Unit Stuff
        this.player = new Player( this.game, this.levelGrid );

        //Input stuff
        this.game.input.onDown.add( this.clickListener, this );

        //Camera Follow Player

        var bounds = {
            x: 40*38*2*1.2,
            y: 55*38*2*1.2
        };

        this.game.world.setBounds(0, 0, bounds.x, bounds.y);
        //this.game.physics.startSystem(Phaser.Physics.P2JS);
        //this.game.physics.p2.enable(this.player.sprite);
        this.game.camera.follow( this.player.sprite );


        //Make a combination group for ordering
        this.fullgroup = this.levelGroup;
        this.fullgroup.add( this.player.sprite );
        this.game.iso.simpleSort(this.fullgroup);
        this.waterheight = this.encounter.water[0].isoZ;
    },
    update: function () {
        if( this.player.update() ){
            this.game.iso.simpleSort( this.fullgroup );
        }
        this.encounter.water.forEach(function (w) {
            w.isoZ = (-2 * Math.sin((this.game.time.now + (w.isoX * 7)) * 0.004)) + (-1 * Math.sin((this.game.time.now + (w.isoY * 8)) * 0.005))+this.waterheight;
            w.alpha = Phaser.Math.clamp(1 + (w.isoZ * 0.1), 0.2, 1);
        }.bind(this));

    },
    clickListener: function () {
        //this.game.state.start('play');
        console.log('OMG CLICK');
        this.levelGroup.removeAll();


        this.encounter = this.encountercreator.getEncounter();
        this.levelGroup = this.encounter.getLevelGroup( this.game );
        this.levelGrid = this.encounter.getLevelGrid();

        this.player.reset( this.levelGrid );
        this.game.camera.follow( this.player.sprite );
        this.fullgroup = this.levelGroup;
        this.fullgroup.add( this.player.sprite );
        this.game.iso.simpleSort(this.fullgroup);
        this.waterheight = this.encounter.water[0].isoZ;
    },
    loadLocal: function(){
        this.loadThings( '' );
    },
    loadWP: function(){
        var tempurl = SITEINFO.base_url;
        this.loadThings( tempurl+"/" );
    },
    loadThings: function( base ){
        this.game.load.image('bigsky', base+'assets/largesky.png');
        this.game.load.image('grass', base+'assets/tile.png');
        this.game.load.image('dirt', base+'assets/dirt.png');
        this.game.load.image('water', base+'assets/water.png')

        this.game.load.image('towerbase', base+'assets/towerbase.png');
        this.game.load.image('towertop', base+'assets/towertop.png');

        this.game.load.image('wall_ud', base+'assets/wall_updown.png');
        this.game.load.image('wall_lr', base+'assets/wall_leftright.png');
//        this.game.load.image('grass', base+'assets/wall_updown.png');
//        this.game.load.image('dirt', base+'assets/wall_leftright.png');

        this.game.load.spritesheet( 'player_ne', base+'assets/knight_ne.png', 64, 64 );
        this.game.load.spritesheet( 'player_nw', base+'assets/knight_nw.png', 64, 64 );
        this.game.load.spritesheet( 'player_se', base+'assets/knight_se.png', 64, 64 );
        this.game.load.spritesheet( 'player_sw', base+'assets/knight_sw.png', 64, 64 );

        //this.game.load.atlas( 'knight', base+'assets/knightwalking.png', base+'assets/knightwalking.json' );
        this.game.load.spritesheet( 'knight', base+'assets/knightwalking.png', 64, 64 );
    }
};

module.exports = Play;

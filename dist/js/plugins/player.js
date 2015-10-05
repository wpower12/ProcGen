/* 
 *  Player
 */
function Player(game, level) {
    this.loc = {x: 15, y: 15, z: 0};
    this.facing = 0;
    this.tile = {isowidth: 38,
        isoheight: 8};
    this.g = game;
    this.l = level;

    //Before we add the sprite, we need to figure out what level its at.
    this.addSprite(level);

    //Add controls
    this.inputopen = true;
    this.timer = 0;
    this.max = 5;
    this.controls = game.input.keyboard.createCursorKeys();
    game.input.keyboard.addKeyCapture([
        Phaser.Keyboard.LEFT,
        Phaser.Keyboard.RIGHT,
        Phaser.Keyboard.UP,
        Phaser.Keyboard.DOWN
    ]);
}
Player.prototype = {
    reset: function (level) {
        this.sprite.kill();
        this.addSprite(level);
    },
    addSprite: function (level) {
        var zheight = level[this.loc.x][this.loc.y].height;
        this.loc.z = zheight;

        var xs = this.loc.x * this.tile.isowidth;
        var ys = this.loc.y * this.tile.isowidth;
        var zs = this.loc.z * this.tile.isoheight;

        this.sprite = this.g.add.isoSprite(xs, ys, zs, 'knight');
        this.sprite.anchor.set(0.5, 0.45);
        
        this.sprite.animations.add('walk_ne', [0,1,2,3,4,5,6,7]);
        this.sprite.animations.add('walk_nw', [8,9,10,11,12,13,14,15]);
        this.sprite.animations.add('walk_se', [16,17,18,19,20,21,22,23]);
        this.sprite.animations.add('walk_sw', [24,25,26,27,28,29,30,31]);
        this.sprite.animations.play('walk_ne', 10, true);
    },
    update: function () {
        if (this.inputopen) {
            if (this.controls.up.isDown) {
                this.loc.y = this.constrain(0, this.l[0].length-1, this.loc.y-1);
                this.updateZ();
                this.inputopen = false;
                this.sprite.animations.play('walk_ne', 10, true);
            }
            else if (this.controls.down.isDown) {
                this.loc.y = this.constrain(0, this.l[0].length-1, this.loc.y+1);
                this.updateZ();
                this.inputopen = false;
                this.sprite.animations.play('walk_sw', 10, true);
            }

            if (this.controls.left.isDown) {
                this.loc.x = this.constrain(0, this.l.length-1, this.loc.x-1);
                this.updateZ();
                this.inputopen = false;
                this.sprite.animations.play('walk_nw', 10, true);
            }
            else if (this.controls.right.isDown) {
                this.loc.x = this.constrain(0, this.l.length-1, this.loc.x+1);
                this.updateZ();
                this.inputopen = false;
                this.sprite.animations.play('walk_se', 10, true);
            }
            this.moveSprite();
            return true;
        } else {
            this.timer++;
            if( this.timer > this.max ){
                this.timer = 0;
                this.inputopen = true;
            }
            return false;
        }
    },
    moveSprite: function () {
        this.sprite.isoX = this.loc.x * this.tile.isowidth;
        this.sprite.isoY = this.loc.y * this.tile.isowidth;
        this.sprite.isoZ = this.loc.z * this.tile.isoheight;      
    },
    updateZ: function () {
        this.loc.z = this.l[this.loc.x][this.loc.y].height;
    },
    constrain: function( min, max, value ){
        if( value <= min ){
            return min;
        } else if ( value >= max ){
            return max;
        } else {
            return value;
        }
    }
};
module.exports = Player;

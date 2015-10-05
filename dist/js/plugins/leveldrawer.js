/* 
 * LevelDrawer - draws a level
 */
function Leveldrawer(l, game) {
    this.level = l;
    this.size = {
        width: l.length,
        length: l[0].length
    };
    this.game = game;
    this.tiles = game.add.group();
    this.tops = game.add.group();

    this.tile = {isowidth: 38,
        isoheight: 8};
}
Leveldrawer.prototype = {
    addSprites: function () {
        var sprite, type, cell;
        for (var x = 0; x < this.size.width; x++) {
            for (var y = 0; y < this.size.length; y++) {
                cell = this.level[x][y];
                type = this.getType(cell);
                sprite = this.game.add.isoSprite(x * this.tile.isowidth, y * this.tile.isowidth, 0, type, 0, this.tiles);
                sprite.anchor.set(0.5, 0);
                for (var h = 1; h < cell.height; h++) {
                    sprite = this.game.add.isoSprite(x * this.tile.isowidth, y * this.tile.isowidth, h * this.tile.isoheight, type, 0, this.tiles);
                    sprite.anchor.set(0.5, 0);
                }
                
                if (cell.top === 3) {
                    sprite = this.game.add.isoSprite((x-1) * this.tile.isowidth,
                            (y-1) * this.tile.isowidth,
                            (cell.height - 2) * this.tile.isoheight,
                            'towerbase',
                            0,
                            this.tiles);
                    sprite.anchor.set(0.5, 0);
                    sprite = this.game.add.isoSprite((x-1) * this.tile.isowidth,
                            (y-1) * this.tile.isowidth,
                            (cell.height - 2) * this.tile.isoheight + this.tile.isoheight * 4,
                            'towertop',
                            0,
                            this.tiles);
                    sprite.anchor.set(0.5, 0);
                    console.log(x, y);
                }
            }
        }
        return this.tiles;
    },
    changeLevel: function(l){
        this.level = l;
    },
    getType: function (cell) {
        var type = cell.type;
        var ret;

        switch (type) {
            case 0:
                ret = 'tile';
                break;
            case 1:
                ret = 'dirt';
                break;

            default:
                ret = 'tile';
        }
        return ret;
    }
};

module.exports = Leveldrawer;
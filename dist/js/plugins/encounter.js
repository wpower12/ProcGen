/* 
 * Encounter - An encounter defines a level and enemy units for a battle
 *           - Object that stores units, level sprites
 *           - holds collections of above? extend sprite class to include
 *             your methods?
 */
function Encounter(l, e) {
    this.level = l;
    this.enemies = e;

    this.size = {
        width: l.length,
        length: l[0].length
    };
    this.tile = {isowidth: 38,
        isoheight: 8};
}
Encounter.prototype = {
    getLevelGroup: function (game) {
        //Returns the group of level tile sprites that were added to the game.  
        var sprite, type, cell;
        this.tiles = game.add.group();
        for (var x = 0; x < this.size.width; x++) {
            for (var y = 0; y < this.size.length; y++) {
                cell = this.level[x][y];
                sprite = game.add.isoSprite(x * this.tile.isowidth, y * this.tile.isowidth, 0, cell.type, 0, this.tiles);
                sprite.anchor.set(0.5, 0);
                for (var h = 1; h < cell.height; h++) {
                    sprite = game.add.isoSprite(x * this.tile.isowidth, y * this.tile.isowidth, h * this.tile.isoheight, cell.type, 0, this.tiles);
                    sprite.anchor.set(0.5, 0);
                }
                
                //Add top if there is one
                if( !(cell.top === "") ){
                    sprite = game.add.isoSprite(x * this.tile.isowidth, y * this.tile.isowidth, (cell.height+1) * this.tile.isoheight, cell.top, 0, this.tiles);
                    sprite.anchor.set(0.5, 0);
                }
            }
        }
        
        return this.tiles;
    },
    getUnitGroup: function () {
        
    },
    getLevelGrid: function(){
        //Returns the grid representation of the level that can be used for other stuff
        return this.level;
    }
};
module.exports = Encounter;

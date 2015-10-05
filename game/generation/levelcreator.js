/* 
 * Makes a level - For now a level is just an array of cells that carry info
 *    
 */
function LevelCreator() {
    var Noise = require('../plugins/perlin');
    this.noise = new Noise();
    this.grid = [];

    //'Public' properties (ew) for configuration - defaults
    this.setSize({x: 12, y: 12});
    this.terrain = 'dirt';
    this.doodads = 'fantasy';
}
LevelCreator.prototype = {
    /**
     * genLevel 
     * 
     * This is the main callback that is ran to return a grid 
     * representation of a levels terrain. 
     * 
     * There are a collection of functions available to operate on the grid, 
     * and you can compose these with your own to generate new types of
     * terrain.
     * 
     * This is the function where you should chain procedures together
     * to create your final product.
     * 
     * The this object holds a reference to the grid at all times.  This is the
     * grid you should read and write to to make changes to the actual
     * terrain.
     * 
     * this.grid[x][y] = {
     *                  type: <String> tilename,
     *                  height: <int> tileheight,
     *                  top: <String> toptilename
     *          };
     *           
     * tilename:
     *       'grass','dirt'
     * toptilename:
     *      'wall_lr', 'wall_td'
     * height:
     *      int from 1 to 30ish (gets weird after?)
     *      
     *      //TODO - Make all the functions actually functional, dont hide 
     *      //that theyre changing the grid, make them return a new one.
     * */
    
    genLevel: function () {
        //Add a smooth base of the default texture (dirt)
        this.getSmooth();

        //Add some patches of grass
        this.addPatches();

        //Add some towns
        var townCount = Math.floor(Math.random() * 5) + 1;
        this.addTowns(townCount);

        return this.grid;
    },
    getSmooth: function ( ) {
        this.noise.seed(Math.random());
        var offsetx = this.randInt(0, 1000);
        var offsety = this.randInt(0, 1000);
        for (var x = 0; x < this.size.w; x++) {
            for (var y = 0; y < this.size.l; y++) {
                this.grid[x][y] = {
                    type: this.terrain,
                    height: this.getPerlinHeight(x + offsetx, y + offsety),
                    top: ""
                };
            }
        }
    },
    addPatches: function () {
        var patchcount = this.randInt(8, 20);
        var cell = {
            x: this.randInt(0, this.size.w),
            y: this.randInt(0, this.size.l)
        };
        var patchsize = this.randInt(10, 20);
        for (var i = 0; i < patchcount; i++) {
            this.grid[cell.x][cell.y].type = 'grass';
            for (var j = 0; j < patchsize; j++) {
                cell = this.newCell(cell);
                this.grid[cell.x][cell.y].type = 'grass';
            }
            patchsize = this.randInt(10, 20);
            cell = {
                x: this.randInt(0, this.size.w),
                y: this.randInt(0, this.size.l)
            };
        }
    },
    addTowns: function (count) {
        var towns = [];
        var candidateTown;
        for (var i = 0; i < count; i++) {
            //Create a new town that doesnt intersect others
            candidateTown = this.randomTown();
            if (!(towns.length === 0)) {
                while (this.colliding(candidateTown, towns)) {
                    candidateTown = this.randomTown();
                }
            }
            towns.push(candidateTown);

            this.levelGround(candidateTown);
            this.placeTown(candidateTown);
        }
    },
    levelGround: function (town) {
        //Makes the ground in the given town all the same height
        var loc = {
            x: this.randInt(town.left, town.right),
            y: this.randInt(town.bottom, town.top)
        };
        var newheight = this.grid[loc.x][loc.y].height + 2;
        for (var i = 0; i < town.w; i++) {
            for (var j = 0; j < town.l; j++) {
                this.grid[town.right + i][town.bottom + j].height = newheight;
            }
        }


    },
    placeTown: function (town) {
        //For now this means just adding a wall around the edge.

        for (var i = 1; i < town.w - 1; i++) {
            this.grid[town.right + i][town.top-1].top = 'wall_lr';
            this.grid[town.right + i][town.bottom].top = 'wall_lr';
        }
        for (var j = 1; j < town.l - 1; j++) {
            this.grid[town.right][town.bottom + j].top = 'wall_ud';
            this.grid[town.left-1][town.bottom + j].top = 'wall_ud';
        }

    },
    randomTown: function () {
        //Return an object with
        // left, right, top, bottom all within game bounds.
        // in the future include shit for buildinds
        // also include a zheight, this will be used to set all the zheights in the bounds

        var width = Math.floor(Math.random() * 4) * 4 + 5;
        var length = Math.floor(Math.random() * 4) * 4 + 5;

        var x = Math.floor(Math.random() * (this.size.w - width - 1));
        var y = Math.floor(Math.random() * (this.size.l - length - 1));

        return {
            top: y + length,
            bottom: y,
            left: x + width,
            right: x,
            w: width,
            l: length
        };

    },
    colliding: function (town, towns) {
        for (var i = 0; i < towns.length; i++) {
            if (this.intersecting(town, towns[i])) {
                return true;
            }
        }
        return false;
    },
    getPerlinHeight: function (x, y) {
        var ret = Math.floor(Math.abs(this.noise.perlin2(x / 25, y / 25)) * 10);
        return ret;
    },
    newCell: function (oldcell) {
        var newcell = {
            x: oldcell.x,
            y: oldcell.y
        };
        var delta = {
            x: 0,
            y: 0
        };
        var timer = 0;
        var maxtries = 200;
        while (newcell.x < 0
                || newcell.y < 0
                || newcell.x >= this.size.w
                || newcell.y >= this.size.l
                || (newcell.x === oldcell.x && newcell.y === oldcell.y)) {

            if (timer++ > maxtries) {
                return oldcell;
            }

            delta = {
                x: this.randInt(-1, 2),
                y: this.randInt(-1, 2)
            };
            newcell = {
                x: newcell.x + delta.x,
                y: newcell.y + delta.y
            };
        }
        return newcell;
    },
    intersecting: function (r1, r2) {
        return !(r2.left > r1.right ||
                r2.right < r1.left ||
                r2.top > r1.bottom ||
                r2.bottom < r1.top);
    },
    setSize: function (s) {
        this.size = {w: s.x, l: s.y};
        this.grid = [];
        for (var x = 0; x < this.size.w; x++) {
            this.grid[x] = [];
        }
    },
    randInt: function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
};
module.exports = LevelCreator;

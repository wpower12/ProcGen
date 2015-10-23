(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
        var sprite, type, cell, delay;
        this.water = [];
        var A = 10;
        this.tiles = game.add.group();
        for (var x = 0; x < this.size.width; x++) {
            for (var y = 0; y < this.size.length; y++) {
                cell = this.level[x][y];
                if( cell.type == 'water' ){
                  sprite = game.add.isoSprite(x * this.tile.isowidth, y * this.tile.isowidth, ((cell.height)* this.tile.isoheight), cell.type, 0, this.tiles);
                  sprite.anchor.set(0.5, 0);
                  this.water.push(sprite);
                } else{
                  for (var h = 0; h < cell.height; h++) {
                      sprite = game.add.isoSprite(x * this.tile.isowidth, y * this.tile.isowidth, h * this.tile.isoheight, cell.type, 0, this.tiles);
                      sprite.anchor.set(0.5, 0);
                  }

                  //Add top if there is one
                  if( !(cell.top === "") ){
                      sprite = game.add.isoSprite(x * this.tile.isowidth, y * this.tile.isowidth, (cell.height) * this.tile.isoheight, cell.top, 0, this.tiles);
                      sprite.anchor.set(0.5, 0);
                      //sprite.anchor.set(0, 0);
                  }
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

},{}],2:[function(require,module,exports){
/* 
 * EncounterCreator - Creating the above.
 *           - Should be able to create a random one
 *           - Or a configured one.  
 *           - Holy shit im bad at class design.  I need a real OO education
 */
var Encounter = require('../generation/encounter');
var LevelCreator = require('../generation/levelcreator');

function EncounterCreator() {
    this.configuration = this.randomConfig();
    this.levelcreator = new LevelCreator();
}
EncounterCreator.prototype = {
    getEncounter: function () {
        this.setParameters();

        var level = this.levelcreator.genLevel();
        return new Encounter(level);
    },
    setParameters: function () {
        //Uses the current configuration to set parameters for generation
        this.levelcreator.terrain = this.configuration.terrain;
        this.levelcreator.doodads = this.configuration.doodads;
        this.levelcreator.setSize(this.getLevelSize());
},
    randomConfig: function () {   //Generates a random configuration for an encounter
        //These are the parameters I want to expose for the procedural generation
        //TODO - Replace test config with actual randomly selected values
        //TODO - Need to wait till I have more of each type defined, with assets.
        return {
            size: 'small',
            terrain: 'dirt',
            doodads: 'fantasy',
            enemytype: 'fantasy',
            difficulty: 'easy'
        };
    },
    getLevelSize: function () {
        var ret = {x: 12, y: 12};
        switch (this.configuration.size) {
            case 'small':
                ret = {x: 12, y: 12};
                break;
            case 'medium':
                ret = {x: 15, y: 15};
                break;
            case 'large':
                ret = {x: 33, y: 33};
                break;
            default:
                ret = {x: 12, y: 12};
                break;
        }
        return ret;
    }
};
module.exports = EncounterCreator;
},{"../generation/encounter":1,"../generation/levelcreator":3}],3:[function(require,module,exports){
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
        this.MountainTerrain();
        return this.grid;
    },
    /**
     * General Terrain Procedures
     * */
    BasicTerrain: function () {
        if (this.randInt(0, 2) == 1) {
            this.setHeightSmooth('dirt');
            this.addPatches('grass');
        } else {
            this.setHeightSmooth('grass');
            this.addPatches('dirt');
        }
        this.addWaterTable(2);
        this.addRandomDoodads();
    },
    VillageTerrain: function () {
        if (this.randInt(0, 2) == 1) {
            this.setHeightSmooth('dirt');
            this.addPatches('grass');
        } else {
            this.setHeightSmooth('grass');
            this.addPatches('dirt');
        }
        this.addRandomDoodads();
        //We'll define a village as a road, with several rectangles representing
        //buildings adjacent to it.  
        //We'll represent roads as lines from one point to another
        var road = this.randPerpLine(30, 40);    //{ pt1: pa, pt2: pb }
        this.setTileTypeRect(road, 'stone');
        this.placeBuildings(road);
    },
    MountainTerrain: function () {
        if (this.randInt(0, 2) == 1) {
            this.setHeightSmooth('dirt');
            this.addPatches('grass');
        } else {
            this.setHeightSmooth('grass');
            this.addPatches('dirt');
        }

        this.setHeightDSM();

//        var count = this.randInt(4, 10);
//        var pt, rad, h, zpt;
//        for (count; count > 0; count--) {
//            var pt = this.randPoint();
//            rad = this.randInt(5, 8);
//            h = this.randInt(8, 20);
//            zpt = this.grid[pt.x][pt.y].height;
//            this.spiralOnPoint(pt, rad, h + zpt);
//        }
    },
    /**
     * Sub Procedures
     * */
    placeBuildins: function (road) {
        //Assuming the road is perpline
        //Pick a random building size
        //Try to place it at a location off of one side of the road, if it fits, place it
        //continue around road until you've tried along both sides or you hit a limit.

    },
    spiralOnPoint: function (pt, rad, h) {
        var x = 0, y = 0, i, curmax = h;
        var dx = 0, dy = -1, t;
        var gx, gy;
        for (i = 0; i < 2 * rad * rad; i++) {
            gx = pt.x + x;
            gy = pt.y + y;
            if ((gx > 0) && (gy > 0) && (gy < this.size.l) && (gx < this.size.w)) {
                this.grid[gx][gy].height = curmax;
                curmax = Math.max(this.randInt(curmax - 2, curmax), 1);
            }
            if ((x == y) || ((x < 0) && (x == -y)) || ((x > 0) && (x == 1 - y))) {
                t = dx;
                dx = -dy;
                dy = t;
            }
            x += dx;
            y += dy;
        }
    },
    /**
     * 'Atomic' and Helper Functions
     * */
    setHeightSmooth: function (terrain) {
        this.noise.seed(Math.random());
        var offsetx = this.randInt(0, 1000);
        var offsety = this.randInt(0, 1000);
        for (var x = 0; x < this.size.w; x++) {
            for (var y = 0; y < this.size.l; y++) {
                this.grid[x][y] = {
                    type: terrain,
                    height: this.getPerlinHeight(x + offsetx, y + offsety) + 1,
                    top: ""
                };
            }
        }
    },
    setHeightDSM: function () {
        //Use the diamond square method to generate a height map for the grid.
        //Set corners
        this.grid[0][0] = this.randInt(3, 6);
        this.grid[0][this.size.l - 1] = this.randInt(3, 6);
        this.grid[this.size.w - 1][0] = this.randInt(3, 6);
        this.grid[this.size.w - 1][this.size.l - 1] = this.randInt(3, 6);

        //Recrusivly Apply Algo
        this.divide(this.size.w-1);
    },
    divide: function (size) {
        var x, y, half = size / 2;
        var max = this.size.w;
        var roughness = 0.5;
        var scale = roughness * size;
        if (half < 1)
            return;

        for (y = half; y < max; y += size) {
            for (x = half; x < max; x += size) {
                this.square(x, y, half, Math.random() * scale * 2 - scale);
            }
        }
        for (y = 0; y <= max; y += half) {
            for (x = (y + half) % size; x <= max; x += size) {
                this.diamond(x, y, half, Math.random() * scale * 2 - scale);
            }
        }
        this.divide(size / 2);
    },
    square: function (x, y, size, offset) {
        var ave = this.average([
            this.grid[(x - size)%size][(y - size)%size].height,
            this.grid[(x + size)%size][(y - size)%size].height,
            this.grid[(x + size)%size][(y + size)%size].height,
            this.grid[(x - size)%size][(y + size)%size].height
        ]);
        this.grid[x][y].height = ave + offset;
    },
    diamond: function (x, y, size, offset) {
        var ave = this.average([
            this.grid[x][(y - size)%size].height, // top
            this.grid[(x + size)%size][y].height, // right
            this.grid[x][(y + size)%size].height, // bottom
            this.grid[(x - size)%size][y].height // left
        ]);
        this.grid[x][y].height = ave + offset;

    },
    average: function (values) {
        var valid = values.filter(function (val) {
            return val !== -1;
        });
        var total = valid.reduce(function (sum, val) {
            return sum + val;
        }, 0);
        return total / valid.length;

    },
    addPatches: function (terrain) {
        var patchcount = this.randInt(8, 20);
        var cell = {
            x: this.randInt(0, this.size.w),
            y: this.randInt(0, this.size.l)
        };
        var patchsize = this.randInt(10, 20);
        for (var i = 0; i < patchcount; i++) {
            this.grid[cell.x][cell.y].type = terrain;
            for (var j = 0; j < patchsize; j++) {
                cell = this.newCell(cell);
                this.grid[cell.x][cell.y].type = terrain;
            }
            patchsize = this.randInt(10, 20);
            cell = {
                x: this.randInt(0, this.size.w),
                y: this.randInt(0, this.size.l)
            };
        }
    }
    ,
    addWaterTable: function (h) {
        var x = this.grid.length;
        var y = this.grid[0].length;
        var i, j, cell;
        for (i = 0; i < x; i++) {
            for (j = 0; j < y; j++) {
                cell = this.grid[i][j];
                if (cell.height < h) {
                    cell.type = 'water';
                }
            }
        }
    },
    addRandomDoodads: function () {
        var i, j, cell, t, p;
        for (i = 0; i < this.size.w; i++) {
            for (j = 0; j < this.size.l; j++) {
                cell = this.grid[i][j];
                if (cell.type !== 'water') {
                    t = this.randInt(0, 75);
                    switch (t) {
                        case 0:
                            p = 'trees_1';
                            break;
                        case 1:
                            p = 'trees_2';
                            break;
                        case 2:
                            p = 'trees_3';
                            break;
                        case 4:
                            p = 'rocks_1';
                            break;
                        case 5:
                            p = 'rocks_2';
                            break;
                        default:
                            p = '';
                    }
                    cell.top = p;
                }
            }
        }
    },
    setTileTypeRect: function (rect, t) {
        //Client responsible for sending an in-bounds line
        var i, j;
        for (i = rect.pt1.x; i <= rect.pt2.x; i++) {
            for (j = rect.pt1.y; j <= rect.pt2.y; j++) {
                this.grid[i][j].type = t;
            }
        }

    },
    randPoint: function () {
        var r = {x: 0, y: 0};
        r.x = this.randInt(0, this.size.w);
        r.y = this.randInt(0, this.size.l);
        return r;
    },
    randPerpLine: function (min_l, max_l) {
        var pt1 = {x: 0, y: 0}, pt2 = {x: 0, y: 0};
        var l = this.randInt(min_l, max_l + 1);
        do {
            pt1 = {
                x: this.randInt(0, this.size.w * 0.5),
                y: this.randInt(0, this.size.l * 0.5)
            };
            if (this.randInt(0, 2) === 1) {
                pt2 = {
                    x: pt1.x + l,
                    y: pt1.y
                };
            } else {
                pt2 = {
                    x: pt1.x,
                    y: pt1.y + l
                };
            }
        } while ((pt2.x >= this.size.w) || (pt2.y >= this.size.l));
        return {pt1: pt1, pt2: pt2};
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

},{"../plugins/perlin":6}],4:[function(require,module,exports){

'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'procgen');
  
  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('boot');
};
},{"./states/boot":7,"./states/gameover":8,"./states/menu":9,"./states/play":10,"./states/preload":11}],5:[function(require,module,exports){
/* 
 *  Player
 */
function Player(game) {
    this.loc = {x: 15, y: 15, z: 0};
    this.facing = 0;
    this.tile = {isowidth: 38,
        isoheight: 8};
    this.g = game;
    this.l  = [];
    
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
        this.l = level;
        if( this.sprite ){
            this.sprite.kill();
        }
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

},{}],6:[function(require,module,exports){
/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */

function Noise() {
    function Grad(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    Grad.prototype = {
        dot2: function (x, y) {
            return this.x * x + this.y * y;
        },
        dot3: function (x, y, z) {
            return this.x * x + this.y * y + this.z * z;
        }
    };
    this.grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
        new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
        new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];
    this.p = [151, 160, 137, 91, 90, 15,
        131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
        190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
        88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
        77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
        102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
        135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
        5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
        223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
        129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
        251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
        49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
        138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];

    this.perm = new Array(512);
    this.gradP = new Array(512);

    this.seed(0);

    this.F2 = 0.5 * (Math.sqrt(3) - 1);
    this.G2 = (3 - Math.sqrt(3)) / 6;
    this.F3 = 1 / 3;
    this.G3 = 1 / 6;
}
Noise.prototype = {
    seed: function (seed) {
        if (seed > 0 && seed < 1) {
            // Scale the seed out
            seed *= 65536;
        }
        seed = Math.floor(seed);
        if (seed < 256) {
            seed |= seed << 8;
        }

        for (var i = 0; i < 256; i++) {
            var v;
            if (i & 1) {
                v = this.p[i] ^ (seed & 255);
            } else {
                v = this.p[i] ^ ((seed >> 8) & 255);
            }

            this.perm[i] = this.perm[i + 256] = v;
            this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];
        }
    },
    simplex2: function (xin, yin) {
        var n0, n1, n2; // Noise contributions from the three corners
        // Skew the input space to determine which simplex cell we're in
        var s = (xin + yin) * this.F2; // Hairy factor for 2D
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var t = (i + j) * this.G2;
        var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
        var y0 = yin - j + t;
        // For the 2D case, the simplex shape is an equilateral triangle.
        // Determine which simplex we are in.
        var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
        if (x0 > y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
            i1 = 1;
            j1 = 0;
        } else {    // upper triangle, YX order: (0,0)->(0,1)->(1,1)
            i1 = 0;
            j1 = 1;
        }
        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
        // c = (3-sqrt(3))/6
        var x1 = x0 - i1 + this.G2; // Offsets for middle corner in (x,y) unskewed coords
        var y1 = y0 - j1 + this.G2;
        var x2 = x0 - 1 + 2 * this.G2; // Offsets for last corner in (x,y) unskewed coords
        var y2 = y0 - 1 + 2 * this.G2;
        // Work out the hashed gradient indices of the three simplex corners
        i &= 255;
        j &= 255;
        var gi0 = this.gradP[i + this.perm[j]];
        var gi1 = this.gradP[i + i1 + this.perm[j + j1]];
        var gi2 = this.gradP[i + 1 + this.perm[j + 1]];
        // Calculate the contribution from the three corners
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) {
            n0 = 0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * gi0.dot2(x0, y0);  // (x,y) of grad3 used for 2D gradient
        }
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) {
            n1 = 0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * gi1.dot2(x1, y1);
        }
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) {
            n2 = 0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * gi2.dot2(x2, y2);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 70 * (n0 + n1 + n2);
    },
    simplex3: function (xin, yin, zin) {
        var n0, n1, n2, n3; // Noise contributions from the four corners

        // Skew the input space to determine which simplex cell we're in
        var s = (xin + yin + zin) * this.F3; // Hairy factor for 2D
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var k = Math.floor(zin + s);

        var t = (i + j + k) * this.G3;
        var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
        var y0 = yin - j + t;
        var z0 = zin - k + t;

        // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
        // Determine which simplex we are in.
        var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
        var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
        if (x0 >= y0) {
            if (y0 >= z0) {
                i1 = 1;
                j1 = 0;
                k1 = 0;
                i2 = 1;
                j2 = 1;
                k2 = 0;
            }
            else if (x0 >= z0) {
                i1 = 1;
                j1 = 0;
                k1 = 0;
                i2 = 1;
                j2 = 0;
                k2 = 1;
            }
            else {
                i1 = 0;
                j1 = 0;
                k1 = 1;
                i2 = 1;
                j2 = 0;
                k2 = 1;
            }
        } else {
            if (y0 < z0) {
                i1 = 0;
                j1 = 0;
                k1 = 1;
                i2 = 0;
                j2 = 1;
                k2 = 1;
            }
            else if (x0 < z0) {
                i1 = 0;
                j1 = 1;
                k1 = 0;
                i2 = 0;
                j2 = 1;
                k2 = 1;
            }
            else {
                i1 = 0;
                j1 = 1;
                k1 = 0;
                i2 = 1;
                j2 = 1;
                k2 = 0;
            }
        }
        // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
        // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
        // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
        // c = 1/6.
        var x1 = x0 - i1 + this.G3; // Offsets for second corner
        var y1 = y0 - j1 + this.G3;
        var z1 = z0 - k1 + this.G3;

        var x2 = x0 - i2 + 2 * this.G3; // Offsets for third corner
        var y2 = y0 - j2 + 2 * this.G3;
        var z2 = z0 - k2 + 2 * this.G3;

        var x3 = x0 - 1 + 3 * this.G3; // Offsets for fourth corner
        var y3 = y0 - 1 + 3 * this.G3;
        var z3 = z0 - 1 + 3 * this.G3;

        // Work out the hashed gradient indices of the four simplex corners
        i &= 255;
        j &= 255;
        k &= 255;
        var gi0 = this.gradP[i + this.perm[j + this.perm[k   ]]];
        var gi1 = this.gradP[i + i1 + this.perm[j + j1 + this.perm[k + k1]]];
        var gi2 = this.gradP[i + i2 + this.perm[j + j2 + this.perm[k + k2]]];
        var gi3 = this.gradP[i + 1 + this.perm[j + 1 + this.perm[k + 1]]];

        // Calculate the contribution from the four corners
        var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 < 0) {
            n0 = 0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * gi0.dot3(x0, y0, z0);  // (x,y) of grad3 used for 2D gradient
        }
        var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 < 0) {
            n1 = 0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
        }
        var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 < 0) {
            n2 = 0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
        }
        var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 < 0) {
            n3 = 0;
        } else {
            t3 *= t3;
            n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
        }
        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [-1,1].
        return 32 * (n0 + n1 + n2 + n3);
    },
    perlin2: function (x, y) {
        // Find unit grid cell containing point
        var X = Math.floor(x), Y = Math.floor(y);
        // Get relative xy coordinates of point within that cell
        x = x - X;
        y = y - Y;
        // Wrap the integer cells at 255 (smaller integer period can be introduced here)
        X = X & 255;
        Y = Y & 255;

        // Calculate noise contributions from each of the four corners
        var n00 = this.gradP[X + this.perm[Y]].dot2(x, y);
        var n01 = this.gradP[X + this.perm[Y + 1]].dot2(x, y - 1);
        var n10 = this.gradP[X + 1 + this.perm[Y]].dot2(x - 1, y);
        var n11 = this.gradP[X + 1 + this.perm[Y + 1]].dot2(x - 1, y - 1);

        // Compute the fade curve value for x
        var u = this.fade(x);

        // Interpolate the four results
        return this.lerp(
                this.lerp(n00, n10, u),
                this.lerp(n01, n11, u),
                this.fade(y));
    },
    perlin3: function (x, y, z) {
        // Find unit grid cell containing point
        var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
        // Get relative xyz coordinates of point within that cell
        x = x - X;
        y = y - Y;
        z = z - Z;
        // Wrap the integer cells at 255 (smaller integer period can be introduced here)
        X = X & 255;
        Y = Y & 255;
        Z = Z & 255;

        // Calculate noise contributions from each of the eight corners
        var n000 = this.gradP[X + this.perm[Y + this.perm[Z  ]]].dot3(x, y, z);
        var n001 = this.gradP[X + this.perm[Y + this.perm[Z + 1]]].dot3(x, y, z - 1);
        var n010 = this.gradP[X + this.perm[Y + 1 + this.perm[Z  ]]].dot3(x, y - 1, z);
        var n011 = this.gradP[X + this.perm[Y + 1 + this.perm[Z + 1]]].dot3(x, y - 1, z - 1);
        var n100 = this.gradP[X + 1 + this.perm[Y + this.perm[Z  ]]].dot3(x - 1, y, z);
        var n101 = this.gradP[X + 1 + this.perm[Y + this.perm[Z + 1]]].dot3(x - 1, y, z - 1);
        var n110 = this.gradP[X + 1 + this.perm[Y + 1 + this.perm[Z  ]]].dot3(x - 1, y - 1, z);
        var n111 = this.gradP[X + 1 + this.perm[Y + 1 + this.perm[Z + 1]]].dot3(x - 1, y - 1, z - 1);

        // Compute the fade curve value for x, y, z
        var u = this.fade(x);
        var v = this.fade(y);
        var w = this.fade(z);

        // Interpolate
        return this.lerp(
                this.lerp(
                        this.lerp(n000, n100, u),
                        this.lerp(n001, n101, u), w),
                this.lerp(
                        this.lerp(n010, n110, u),
                        this.lerp(n011, n111, u), w),
                v);
    },
    fade: function (t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    },
    lerp: function (a, b, t) {
        return (1 - t) * a + t * b;
    }
};
module.exports = Noise;

},{}],7:[function(require,module,exports){

'use strict';

function Boot() {
}

Boot.prototype = {
  preload: function() {
    //this.load.image('preloader', 'assets/preloader.gif');
  },
  create: function() {
    this.game.input.maxPointers = 1;
    this.game.state.start('menu');
  }
};

module.exports = Boot;

},{}],8:[function(require,module,exports){

'use strict';
function GameOver() {}

GameOver.prototype = {
  preload: function () {

  },
  create: function () {
    var style = { font: '65px Arial', fill: '#ffffff', align: 'center'};
    this.titleText = this.game.add.text(this.game.world.centerX,100, 'Game Over!', style);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.congratsText = this.game.add.text(this.game.world.centerX, 200, 'You Win!', { font: '32px Arial', fill: '#ffffff', align: 'center'});
    this.congratsText.anchor.setTo(0.5, 0.5);

    this.instructionText = this.game.add.text(this.game.world.centerX, 300, 'Click To Play Again', { font: '16px Arial', fill: '#ffffff', align: 'center'});
    this.instructionText.anchor.setTo(0.5, 0.5);
  },
  update: function () {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};
module.exports = GameOver;

},{}],9:[function(require,module,exports){

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

},{}],10:[function(require,module,exports){
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

        //Unit Stuff
        this.player = new Player(this.game);

        this.resetLevel();

        //Input stuff
        this.game.input.onDown.add(this.clickListener, this);

        //Camera Follow Player

        var bounds = {
            x: 40 * 38 * 2 * 1.2,
            y: 55 * 38 * 2 * 1.2
        };

        this.game.world.setBounds(0, 0, bounds.x, bounds.y);
        this.game.camera.follow(this.player.sprite);
    },
    update: function () {
        if (this.player.update()) {
            this.game.iso.simpleSort(this.fullgroup);
        }
        this.encounter.water.forEach(function (w) {
            w.isoZ = (-2 * Math.sin((this.game.time.now + (w.isoX * 7)) * 0.004)) + (-1 * Math.sin((this.game.time.now + (w.isoY * 8)) * 0.005)) + this.waterheight;
            w.alpha = Phaser.Math.clamp(1 + (w.isoZ * 0.1), 0.2, 1);
        }.bind(this));

    },
    clickListener: function () {
        //this.game.state.start('play');
        console.log('OMG CLICK');

        this.resetLevel();

    },
    resetLevel: function () {
        if (this.levelGroup) {
            this.levelGroup.removeAll();
        }
        this.encounter = this.encountercreator.getEncounter();
        this.levelGroup = this.encounter.getLevelGroup(this.game);
        this.levelGrid = this.encounter.getLevelGrid();
        this.fullgroup = this.levelGroup;

        this.player.reset(this.levelGrid);
        this.game.camera.follow(this.player.sprite);

        this.fullgroup.add(this.player.sprite);
        this.game.iso.simpleSort(this.fullgroup);

        if (this.encounter.water.length) {
            this.waterheight = this.encounter.water[0].isoZ;
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
        this.game.load.image('bigsky', base + 'assets/largesky.png');
        this.game.load.image('grass', base + 'assets/tile.png');
        this.game.load.image('dirt', base + 'assets/dirt.png');
        this.game.load.image('stone', base + 'assets/stone.png');
        this.game.load.image('water', base + 'assets/water.png');

        this.game.load.image('towerbase', base + 'assets/towerbase.png');
        this.game.load.image('towertop', base + 'assets/towertop.png');


        //Doodad Tiles.
        this.game.load.image('wall_ud', base + 'assets/wall_updown.png');
        this.game.load.image('wall_lr', base + 'assets/wall_leftright.png');
        this.game.load.image('trees_1', base + 'assets/trees_1.png');
        this.game.load.image('trees_2', base + 'assets/trees_2.png');
        this.game.load.image('trees_3', base + 'assets/trees_6.png');
        this.game.load.image('rocks_1', base + 'assets/rocks_4.png');
        this.game.load.image('rocks_2', base + 'assets/rocks_5.png');

//        this.game.load.image('grass', base+'assets/wall_updown.png');
//        this.game.load.image('dirt', base+'assets/wall_leftright.png');

        this.game.load.spritesheet('player_ne', base + 'assets/knight_ne.png', 64, 64);
        this.game.load.spritesheet('player_nw', base + 'assets/knight_nw.png', 64, 64);
        this.game.load.spritesheet('player_se', base + 'assets/knight_se.png', 64, 64);
        this.game.load.spritesheet('player_sw', base + 'assets/knight_sw.png', 64, 64);

        //this.game.load.atlas( 'knight', base+'assets/knightwalking.png', base+'assets/knightwalking.json' );
        this.game.load.spritesheet('knight', base + 'assets/knightwalking.png', 64, 64);
    }
};

module.exports = Play;

},{"../generation/encountercreator":2,"../player/player":5}],11:[function(require,module,exports){

'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    this.asset = this.add.sprite(this.width/2,this.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    this.load.image('yeoman', 'assets/yeoman-logo.png');

  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(this.ready) {
      this.game.state.start('menu');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;

},{}]},{},[4])
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
        
        var count = this.randInt(4, 10);
        var pt, rad, h, zpt;
        for (count; count > 0; count--) {
            var pt = this.randPoint();
            rad = this.randInt(5, 8);
            h = this.randInt(8, 20);
            zpt = this.grid[pt.x][pt.y].height;
            this.spiralOnPoint(pt, rad, h + zpt);
        }
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
    },
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

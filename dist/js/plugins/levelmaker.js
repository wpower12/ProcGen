/* 
 * Makes a level - For now a level is just an array of cells that carry info
 *    
 */
function Levelmaker( width, length ) {
    var Noise = require('../plugins/perlin');
    this.noise = new Noise();
    this.size = { w: width, l: length };
    this.grid = [];
    for( var x = 0; x < this.size.w; x++ ){
        this.grid[x] = [];
    }
}
Levelmaker.prototype = {
    getRandom: function(){
        //Returns a map of random height
        for( var x = 0; x < this.size.w; x++){
            for( var y = 0; y < this.size.l; y++){
                this.grid[x][y] = {
                    type: this.randomInt(0, 2),
                    height: this.randomInt(0, 4)
                };
            }
        }
        return this.grid;
    },
    getSmooth: function(){
        this.noise.seed(Math.random());
        for( var x = 0; x < this.size.w; x++){
            for( var y = 0; y < this.size.l; y++){
                this.grid[x][y] = {
                    type: this.randomInt(0, 2),
                    height: this.getPerlinHeight( x, y ),
                    top: this.getTop()
                };
            }
        }
        return this.grid;
    },
    getPerlinHeight: function( x, y ){
        var ret = Math.floor(Math.abs( this.noise.perlin2(x/200, y/400) )*150);
        console.log(ret);
        return ret;
    },
    getTop: function( ){
        var ret;
        if( Math.random()*100 > 98 ){
            ret = 3;
        } else {
            ret = 0;
        }
        return ret;
    },
    randomInt: function( min, max ){
        return Math.floor(Math.random() * (max - min)) + min;
    }
};
module.exports = Levelmaker;

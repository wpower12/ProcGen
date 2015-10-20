/**
 * Atomic Operations
 *
 * These are the small, unit scale operations that form the basis for the
 * level generating procedures.
 *
 * For functions that generate a grid, they should accept one, and return one.
 *
 * Except for one, which just returns an empty 0-height grid.
 *
 * */
function AtomicOperations(){

}
AtomicOperations.prototype= {
    initial_grid: function( size, h, t ){
        var grid = [];
        for( var i = 0; i < size.w; i++ ){
          grid[i] = [];
          for( var j = 0; j < size.h; j++ ){
              grid[i][j] = {
                type: t,
                height: h,
                top: ""
              }
          }
        }
        return grid;
    },

    water_table: function( grid, h ){
        var x = grid.length;
        var y = grid[0].length;
        var i, j, cell;
        for( i = 0; i < x; i++ ){
          for( j = 0; j < y; j++ ){
            cell = grid[i][j];
            if( cell.height < h ){
                cell.type = 'water';
            }
          }
        }
    }

};
module.export = AtomicOperations;

/*
 * Creates a collection of enemies to use in an encounter.
 *      - Dummy class for now.
 */
function EnemiesCreator() {
    //Config properties
    this.enemytype = 'fantasy';
    this.difficulty = 'easy';
}
EnemiesCreator.prototype = {
    genEnemies: function( level ){       
        //For now were just gonna put one on some random square.
        
        var xsize = level.length;
        var ysize = level[0].length;
        
        var baddies = [];
        
        
        
        return 0;
    }
};

module.exports = EnemiesCreator;
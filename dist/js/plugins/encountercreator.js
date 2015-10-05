/* 
 * EncounterCreator - Creating the above.
 *           - Should be able to create a random one
 *           - Or a configured one.  
 *           - Holy shit im bad at class design.  I need a real OO education
 */
var Encounter = require('../plugins/encounter');
var LevelCreator = require('../plugins/levelcreator');
var EnemiesCreator = require('../plugins/enemiescreator');

function EncounterCreator() {
    this.configuration = this.randomConfig();
    this.levelcreator = new LevelCreator();
    this.enemiescreator = new EnemiesCreator();
}
EncounterCreator.prototype = {
    getEncounter: function () {
        this.setParameters();

        var level = this.levelcreator.genLevel();
        var enemies = this.enemiescreator.genEnemies(level);
        return new Encounter(level, enemies);
    },
    setParameters: function () {
        //Uses the current configuration to set parameters for generation
        this.levelcreator.terrain = this.configuration.terrain;
        this.levelcreator.doodads = this.configuration.doodads;
        this.levelcreator.setSize(this.getLevelSize());

        this.enemiescreator.enemytype = this.configuration.enemytype;
        this.enemiescreator.difficulty = this.configuration.difficulty;
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
                ret = {x: 40, y: 55};
                break;
            default:
                ret = {x: 12, y: 12};
                break;
        }
        return ret;
    }
};
module.exports = EncounterCreator;
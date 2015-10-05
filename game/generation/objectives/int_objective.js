/* 
    'interface' for the objectives. ill extend it to make real ones.
 *
 * 
 */
function Objective(){
    this.type = '';
    this.theme = '';
    this.size = { x:0, y:0 };
    this.location = {x:0, y:0};
    this.units = [];
    this.structures = [];
}

Objective.prototype = {    
    //Called to see if end condition is met.
    checkEndCondition: function(){
        
    },
    //Called when the objective is over.
    end: function(){
        
    }
};
modules.export = Objective;

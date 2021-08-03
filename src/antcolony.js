// Ant Colony Algorithm code

// Parameters
var alpha = document.getElementById('alpha').value; // Constant used to control the influence of pheromones
var beta = document.getElementById('beta').value; // Constant used to control the influence of move attractiveness
var Q = document.getElementById('qRate').value; // Constant used for pheromone updates
var p = document.getElementById('pRate').value; // Pheromone evaporation coefficient

/**
 * Called for each ant during updateAntTargets
 * @param {Ant} ant 
 */

function getTarget(ant) {
    var possibleMoves = ant.possibleMoves; //Get available ant move targets
    //P = (theromone deposited on transition) ^ (alpha) * (attractiveness of the move) ^ (Beta) / sum((theromone deposited on transition) ^ (alpha) + (attractiveness of the move) ^ (beta))
    //Attractiveness = constant - distance from nearest food source 
}

/**
 * Distance helper function
 */
export function distance(obj1x, obj1y, obj2x, obj2y){
    return Math.sqrt(Math.pow(obj1x - obj2x, 2) + Math.pow(obj1y - obj2y, 2));
}

/**
 * Called every visualization loop. Updates targets for ants to move to.
 * @param {list} antSources List of AntSource(s) which contain Ants for each source as .ants member
 * @param {list} foodSources List of FoodSource(s) which are targets for Ants
 */

export function updateAntTargets(antSources, foodSources){
    // Loop through all AntSources
    for(var sourceIndex = 0; sourceIndex < antSources.length; sourceIndex++){
        // Loop through every ant in each AntSource
        for(var antIndex = 0; antIndex < antSources[sourceIndex].ants.length; antIndex++){
            var ant = antSources[sourceIndex].ants[antIndex]; // Get ant
            var possibleMoves = ant.possibleMoves; // Get available ant move targets
            
            // As a placeholder, I am going to have the ant choose the action that leads to the closest food source
            if(possibleMoves.length > 0){
                let distances = [];
                for(let move of possibleMoves){
                    let closestDis = 100000;
                    let targetSources = ant.hasFood ? antSources : foodSources; // Chooses target source depending on if it has food
                    for(let source of targetSources){
                        closestDis = Math.min(closestDis, distance(source.x, source.y, move[0], move[1]));
                    }
                    distances.push(closestDis);
                }
                var bestTarget = possibleMoves[distances.indexOf(Math.min(...distances))];
                // var randomTarget = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]; // Choose random target as placeholder
                ant.setTarget(bestTarget); // Set target for ant to move to on this loop cycle
            }
            else{
                ant.setTarget([ant.x, ant.y]); // Ant has no possible moves, guess it can only stand still until end of time
            }
        }
    }
}

/**
 * Called after each ant has reached a solution. Updates phermones for each transition
 * @param {list} antSolutions List of Ant Solution Tours
 */

function updatePheromones(antSolutions){
    // Update parameters in case user changed them
    alpha = document.getElementById('alpha').value; // Constant used to control the influence of pheromones
    beta = document.getElementById('beta').value; // Constant used to control the influence of move attractiveness
    Q = document.getElementById('qRate').value; // Constant used for pheromone updates
    p = document.getElementById('pRate').value; // Pheromone evaporation coefficient
    //Theromone = (1-p) * Theromone + sum(pheromone deposited by ant k)
    //Pheromone deposited by ant k = Q/Lk if ant k uses curve xy in its tour (Lk = length of ant k's solution, Q = constant), 0 otherwise

}
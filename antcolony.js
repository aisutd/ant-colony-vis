// Ant Colony Algorithm code

// Parameters
var alpha = 0.8; // Constant used to control the influence of pheromones
var beta = 1.3; // Constant used to control the influence of move attractiveness
var Q = 5; // Constant used for pheromone updates
var p = 0.3; // Pheromone evaporation coefficient
var A = 100; // Constant used for calculating attraction

/**
 * Called for each ant during updateAntTargets
 * @param {Ant} ant 
 */

class AntSolution {
    constructor() {
        this.path = new list();
    }
}

class PheromoneGrid {
    constructor(width, height) {
        this.width = width
        this.height = height
        this.grid = new Array(height)
        for (var i = 0; i < height; i++)
        {
            this.grid[i] = new Array(width);
            for (var j = 0; j < width; j++)
            {
                this.grid[i][j] = 0.0
            }
        }
    }
    getPheromone(x,y) {
        return this.grid[y][x];
    }

    updatePheromones(antSolutions){
        //Pheromone deposited by ant k = Q/Lk if ant k uses curve xy in its tour (Lk = length of ant k's solution, Q = constant), 0 otherwise
        newPheromone = new Array(this.height)
        for (var i = 0; i < this.height; i++)
        {
            newPheromone[i] = new Array(this.width);
            for (var j = 0; j < this.width; j++)
            {
                newPheromone[i][j] = 0.0
            }
        }
        for (let solution of antSolutions)
        {
            length = solution.list.length
            for (let move of solution.path)
            {
                x = move[0]
                y = move[1]
                newPheromone[y][x] += Q / length
            }
        }
        for (var y = 0; y < height; y++)
        {
            for (var x = 0; x < width; x++)
            {
                //Pheromone = (1-p) * Pheromone + sum(pheromone deposited by ant k)
                this.grid[y][x] = (1 - p) * this.grid[y][x] + newPheromone[y][x];
            }
        }
    }
}

/**
 * Distance helper function
 */
function distance(obj1x, obj1y, obj2x, obj2y){
    return Math.sqrt(Math.pow(obj1x - obj2x, 2) + Math.pow(obj1y - obj2y, 2));
}

function getDistanceToNearestFoodSource(pos, foodSources) {
    var minDist = A;
    var posX = ant.x();
    var posY = ant.y();
    for (let source in foodSources)
    {
        x = source.x();
        y = source.y();
        dist = distance(posX, posY, x, y);
        if (dist < minDist)
        {
            minDist = dist;
        }
    }
    return minDist;
}

function getTarget(ant, foodSources) {
    var possibleMoves = ant.possibleMoves; //Get available ant move targets
    //Attractiveness = constant - distance from nearest food source 
    for (let move in possibleMoves)
    {
        //
    }
    attractiveness = A - getDistanceToNearestFoodSource(pos, foodSources);
    //P = (theromone deposited on transition) ^ (alpha) * (attractiveness of the move) ^ (Beta) / sum((theromone deposited on transition) ^ (alpha) + (attractiveness of the move) ^ (beta))
    
}



/**
 * Called every visualization loop. Updates targets for ants to move to.
 * @param {list} antSources List of AntSource(s) which contain Ants for each source as .ants member
 * @param {list} foodSources List of FoodSource(s) which are targets for Ants
 */

function updateAntTargets(antSources, foodSources){
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
    //Theromone = (1-p) * Theromone + sum(pheromone deposited by ant k)
    //Pheromone deposited by ant k = Q/Lk if ant k uses curve xy in its tour (Lk = length of ant k's solution, Q = constant), 0 otherwise

}
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



class PheromoneGrid {
    constructor(width, height) {
        this.width = width * 2;
        this.height = height * 2;
        this.grid = new Array(height * 2);
        for (var i = 0; i < height; i++)
        {
            this.grid[i] = new Array(width * 2);
            for (var j = 0; j < width * 2; j++)
            {
                this.grid[i][j] = 0.0;
            }
        }
    }
    getPheromone(x,y) {
        return this.grid[y * 2][x * 2];
    }

    updatePheromones(solution){
        //Pheromone deposited by ant k = Q/Lk if ant k uses curve xy in its tour (Lk = length of ant k's solution, Q = constant), 0 otherwise
        newPheromone = new Array(this.height)
        for (var i = 0; i < this.height; i++)
        {
            newPheromone[i] = new Array(this.width);
            for (var j = 0; j < this.width; j++)
            {
                newPheromone[i][j] = 0.0;
            }
        }

        length = solution.list.length
        for (var a = 0; a < length; a++)
        {
            move = solution.nthMove(a);
            x = move[0];
            y = move[1];
            newPheromone[y * 2][x * 2] += Q / length;
        }
        for (var y = 0; y < height; y++)
        {
            for (var x = 0; x < width; x++)
            {
                //Pheromone = (1-p) * Pheromone + sum(pheromone deposited by ant k)
                this.grid[y * 2][x * 2] = (1 - p) * this.grid[y * 2][x * 2] + newPheromone[y * 2][x * 2];
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
    var antX = ant.x();
    var antY = ant.y();
    var tempSum = 0.0;
    var rawMoveProbs = new Array(8);
    var i = 0;
    for (let move in possibleMoves)
    {
        var xMove = move[0];
        var yMove = move[1];
        var x = xMove + antX;
        var y = yMove + anyY;
        var pos = [x, y];
        var attractiveness = A - getDistanceToNearestFoodSource(pos, foodSources);
        var theromone = getPheromone(x,y);
        //P = (theromone deposited on transition) ^ (alpha) * (attractiveness of the move) ^ (Beta) / sum((theromone deposited on transition) ^ (alpha) + (attractiveness of the move) ^ (beta))
        var prob = (theromone ^ alpha) * (attractiveness ^ beta); 
        rawMoveProbs[i] = prob;
        tempSum += prob;
        i++;
    }
    for (var a = 0; a < 8; a++)
    {
        rawMoveProbs[a] /= tempSum;
    }
    
    var randomVal = Math.random();
    var val = 0;
    for (var a = 0; a < 8; a++)
    {
        val += rawMoveProbs[a];
        if (randomVal < val)
        {
            return possibleMoves[a];
        }
    }
    
    
}

function getTargetReturn(ant, antSource) {
    var possibleMoves = ant.possibleMoves; //Get available ant move targets
    //Attractiveness = constant - distance from nearest food source 
    var antX = ant.x();
    var antY = ant.y();
    var tempSum = 0.0;
    var rawMoveProbs = new Array(8);
    var i = 0;
    for (let move in possibleMoves)
    {
        var xMove = move[0];
        var yMove = move[1];
        var x = xMove + antX;
        var y = yMove + anyY;
        var pos = [x, y];
        var attractiveness = A - distance(x,y,antSource.x(), antSource.y());
        var theromone = getPheromone(x,y);
        //P = (theromone deposited on transition) ^ (alpha) * (attractiveness of the move) ^ (Beta) / sum((theromone deposited on transition) ^ (alpha) + (attractiveness of the move) ^ (beta))
        var prob = (theromone ^ alpha) * (attractiveness ^ beta); 
        rawMoveProbs[i] = prob;
        tempSum += prob;
        i++;
    }
    for (var a = 0; a < 8; a++)
    {
        rawMoveProbs[a] /= tempSum;
    }
    
    var randomVal = Math.random();
    var val = 0;
    for (var a = 0; a < 8; a++)
    {
        val += rawMoveProbs[a];
        if (randomVal < val)
        {
            return possibleMoves[a];
        }
    }
    
    
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
                if (ant.hasFood())
                {
                    var bestTarget = getTargetReturn(ant, antSources[sourceIndex]);
                }
                else
                {
                    var bestTarget = getTarget(ant, foodSources);
                }
                // var randomTarget = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]; // Choose random target as placeholder
                ant.setTarget(bestTarget); // Set target for ant to move to on this loop cycle
            }
            else{
                ant.setTarget([ant.x, ant.y]); // Ant has no possible moves, guess it can only stand still until end of time
            }
        }
    }
}

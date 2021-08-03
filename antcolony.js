// Ant Colony Algorithm code

// Parameters
var alpha = 0.7; // Constant used to control the influence of pheromones
var beta = 0.6; // Constant used to control the influence of move attractiveness
var Q = 100; // Constant used for pheromone updates
var p = 0.4; // Pheromone evaporation coefficient

var explorationBias = 0.3;

/**
 * Distance helper function
 */
function distance(obj1x, obj1y, obj2x, obj2y){
    return Math.sqrt(Math.pow(Math.abs(obj1x - obj2x), 2) + Math.pow(Math.abs(obj1y - obj2y), 2));
}

function getDistanceToNearestFoodSource(pos, foodSources) {
    var minDist = 9999999;
    var posX = pos[0];
    var posY = pos[1];
    for (let i = 0; i < foodSources.length; i++)
    {
        x = foodSources[i].x;
        y = foodSources[i].y;
        dist = distance(posX, posY, x, y);
        if (dist < minDist)
        {
            minDist = dist;
        }
    }
    return minDist;
}

function getDistanceToNearestAntSource(pos, antSources) {
    var minDist = 9999999;
    var posX = pos[0];
    var posY = pos[1];
    for (let i = 0; i < antSources.length; i++)
    {
        x = antSources[i].x;
        y = antSources[i].y;
        dist = distance(posX, posY, x, y);
        if (dist < minDist)
        {
            minDist = dist;
        }
    }
    return minDist;
}

function getAttractiveness(moves, foodSources) {
    var maxDist = 0;
    var minDist = 9999999;
    var dists = new Array(moves.length);
    var attractivenesses = new Array(moves.length);
    for (let i = 0; i < moves.length; i++)
    {
        var move = moves[i];
        var x = move[0];
        var y = move[1];
        var newPos = [x, y];
        var dist = getDistanceToNearestFoodSource(newPos, foodSources);
        dists[i] = dist;
        if (dist < minDist)
        {
            minDist = dist;
        }
        if (dist > maxDist)
        {
            maxDist = dist;
        }
    }
    
    for (let i = 0; i < moves.length; i++)
    {
        attractivenesses[i] = ((maxDist - dists[i]) / (1 + maxDist - minDist)) + 1;
    }
    return attractivenesses;
}

function getAttractivenessReturn(moves, antSources) {
    var maxDist = 0;
    var minDist = 9999999;
    var dists = new Array(moves.length);
    var attractivenesses = new Array(moves.length);
    for (let i = 0; i < moves.length; i++)
    {
        var move = moves[i];
        var x = move[0];
        var y = move[1];
        var newPos = [x, y];
        var dist = getDistanceToNearestAntSource(newPos, antSources);
        dists[i] = dist;
        if (dist < minDist)
        {
            minDist = dist;
        }
        if (dist > maxDist)
        {
            maxDist = dist;
        }
    }
    
    for (let i = 0; i < moves.length; i++)
    {
        attractivenesses[i] = ((maxDist - dists[i]) / (1 + maxDist - minDist)) + 1;
    }
    return attractivenesses;
}

function getTarget(ant, foodSources, pheromoneGrid) {
    var possibleMoves = ant.possibleMoves; //Get available ant move targets


    if (ant._explorationTime <= 0)
    {
        ant._explorationTime = ant._explorationTimeStart;
        //Biased toward exploration
        if (Math.random() < explorationBias)
        {
            ant._exploring = true;
        }
        else
        {
            ant._exploring = false;
        }
    }
    else
    {
        ant._explorationTime--;
    }

    if (ant._exploring)
    {
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }



    //Attractiveness = constant - distance from nearest food source 
    var tempSum = 0.0;
    var rawMoveProbs = new Array(ant.possibleMoves.length);
    //pheromoneGrid.logGrid();
    var attractivenesses = getAttractiveness(possibleMoves, foodSources);
    for (let i = 0; i < possibleMoves.length; i++)
    {
        var move = possibleMoves[i];
        var x = move[0];
        var y = move[1];
        var attractiveness = attractivenesses[i];
        var theromone = pheromoneGrid.getPheromone(x,y);
        //P = (theromone deposited on transition) ^ (alpha) * (attractiveness of the move) ^ (Beta) / sum((theromone deposited on transition) ^ (alpha) + (attractiveness of the move) ^ (beta))
        var prob = Math.pow(theromone, alpha) * Math.pow(attractiveness, beta); 
        rawMoveProbs[i] = prob;
        tempSum += prob;
        
    }
    if (tempSum == 0.0)
    {
        for (var a = 0; a < ant.possibleMoves.length; a++)
        {
            rawMoveProbs[a] = 0.125;
        }
    }
    else
    {
        for (var a = 0; a < ant.possibleMoves.length; a++)
        {
            rawMoveProbs[a] /= tempSum;
        }
    }
    
    var randomVal = Math.random();
    val = 0;
    for (var a = 0; a < 8; a++)
    {
        val = val + rawMoveProbs[a];
        if (randomVal < val)
        {
            return possibleMoves[a];
        }
    } 
}

function getTargetReturn(ant, antSources, pheromoneGrid) {
    var possibleMoves = ant.possibleMoves; //Get available ant move targets


    if (ant._explorationTime <= 0)
    {
        ant._explorationTime = ant._explorationTimeStart;
        //Biased toward exploration
        if (Math.random() < explorationBias)
        {
            ant._exploring = true;
        }
        else
        {
            ant._exploring = false;
        }
    }
    else
    {
        ant._explorationTime--;
    }

    if (ant._exploring)
    {
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }


    //Attractiveness = constant - distance from nearest food source 
    var tempSum = 0.0;
    var rawMoveProbs = new Array(ant.possibleMoves.length);
    //pheromoneGrid.logGrid();
    var attractivenesses = getAttractivenessReturn(possibleMoves, antSources);
    for (let i = 0; i < possibleMoves.length; i++)
    {
        var move = possibleMoves[i];
        var x = move[0];
        var y = move[1];
        var attractiveness = attractivenesses[i];
        var theromone = pheromoneGrid.getPheromone(x,y);
        //P = (theromone deposited on transition) ^ (alpha) * (attractiveness of the move) ^ (Beta) / sum((theromone deposited on transition) ^ (alpha) + (attractiveness of the move) ^ (beta))
        var prob = Math.pow(theromone, alpha) * Math.pow(attractiveness, beta); 
        rawMoveProbs[i] = prob;
        tempSum += prob;
        
    }
    if (tempSum == 0.0)
    {
        for (var a = 0; a < ant.possibleMoves.length; a++)
        {
            rawMoveProbs[a] = 0.125;
        }
    }
    else
    {
        for (var a = 0; a < ant.possibleMoves.length; a++)
        {
            rawMoveProbs[a] /= tempSum;
        }
    }
    
    var randomVal = Math.random();
    val = 0;
    for (var a = 0; a < 8; a++)
    {
        val = val + rawMoveProbs[a];
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

function updateAntTargets(antSources, foodSources, pheromoneGrid){
    // Loop through all AntSources
    for(var antIndex = 0; antIndex < ants.length; antIndex++){
        var ant = ants[antIndex]; // Get ant
        var possibleMoves = ant.possibleMoves; // Get available ant move targets
        
        // As a placeholder, I am going to have the ant choose the action that leads to the closest food source
        if(possibleMoves.length > 0){
            if (ant.hasFood)
            {
                var bestTarget = getTargetReturn(ant, antSources, pheromoneGrid);
                ant.setTarget(bestTarget, true);
            }
            else
            {
                var bestTarget = getTarget(ant, foodSources, pheromoneGrid);
                ant.setTarget(bestTarget, true);
            }
            // var randomTarget = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]; // Choose random target as placeholder
             // Set target for ant to move to on this loop cycle
        }
        else{
            ant.setTarget([ant.x, ant.y], false); // Ant has no possible moves, guess it can only stand still until end of time
        }
    }
}

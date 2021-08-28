// Ant Colony Algorithm code

const { getElementById } = require("domutils");
const { values } = require("lodash");

// Parameters
var alpha = document.getElementById('alpha').value; // Constant used to control the influence of pheromones
var beta = document.getElementById('beta').value; // Constant used to control the influence of move attractiveness
var explorationBias = 0.02;

/**
 * Distance helper function
 */
export function distance(obj1x, obj1y, obj2x, obj2y){
    return Math.sqrt(Math.pow(Math.abs(obj1x - obj2x), 2) + Math.pow(Math.abs(obj1y - obj2y), 2));
}

function getDistanceToNearestFoodSource(pos, foodSources) {
    var minDist = 9999999;
    var posX = pos[0];
    var posY = pos[1];
    for (let i = 0; i < foodSources.length; i++)
    {
        let x = foodSources[i].x;
        let y = foodSources[i].y;
        let dist = distance(posX, posY, x, y);
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
        let x = antSources[i].x;
        let y = antSources[i].y;
        let dist = distance(posX, posY, x, y);
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
            // Choose a random location.
            ant._explorationX = ant.x + (Math.random() * 200) - 100;
            ant._explorationY = ant.y + (Math.random() * 200) - 100;
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
        var bestMove = -1;
        var maxAttractiveness = 9999;
        for (let i = 0; i < possibleMoves.length; i++)
        {
            var move = possibleMoves[i];
            var x = move[0];
            var y = move[1];
            var attractiveness = distance(x, y, ant._explorationX, ant._explorationY);
            if (attractiveness < maxAttractiveness)
            {
                bestMove = i;
                maxAttractiveness = attractiveness;
            }
        }
        return possibleMoves[bestMove];
    }
    else
    {
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
        let val = 0;
        for (var a = 0; a < 8; a++)
        {
            val = val + rawMoveProbs[a];
            if (randomVal < val)
            {
                return possibleMoves[a];
            }
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
            // Choose a random location.
            ant._explorationX = ant.x + (Math.random() * 200) - 100;
            ant._explorationY = ant.y + (Math.random() * 200) - 100;
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
        var bestMove = -1;
        var maxAttractiveness = 9999;
        for (let i = 0; i < possibleMoves.length; i++)
        {
            //P = (theromone deposited on transition) ^ (alpha) * (attractiveness of the move) ^ (Beta) / sum((theromone deposited on transition) ^ (alpha) + (attractiveness of the move) ^ (beta))
            var move = possibleMoves[i];
            var x = move[0];
            var y = move[1];
            var attractiveness = distance(x, y, ant._explorationX, ant._explorationY);
            if (attractiveness < maxAttractiveness)
            {
                bestMove = i;
                maxAttractiveness = attractiveness;
            }
        }
        return possibleMoves[bestMove];
    }
    else
    {
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
        let val = 0;
        for (var a = 0; a < 8; a++)
        {
            val = val + rawMoveProbs[a];
            if (randomVal < val)
            {
                return possibleMoves[a];
            }
        }    
    }
}

/**
 * Called every visualization loop. Updates targets for ants to move to.
 * @param {list} antSources List of AntSource(s) which contain Ants for each source as .ants member
 * @param {list} foodSources List of FoodSource(s) which are targets for Ants
 */

export function updateAntTargets(antSources, foodSources, pheromoneGrid, ants){
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

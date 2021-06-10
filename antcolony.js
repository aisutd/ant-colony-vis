// Ant Colony Algorithm code

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
            var randomTarget = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]; // Choose random target as placeholder
            ant.setTarget(randomTarget); // Set target for ant to move to on this loop cycle
        }
    }
}
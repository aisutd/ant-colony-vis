import { distance, updateAntTargets } from './antcolony.js'
import { Application, Graphics, Container, Stage } from 'pixi.js'

//Create a Pixi Application
var visualizationDiv = document.getElementById('visualization');

let dims = visualizationDiv.getBoundingClientRect();
let app = new Application({
    width: dims.width,
    height: dims.height,
    backgroundColor: 0xbbbbbb
});

//Add the canvas that Pixi automatically created for you to the HTML document
visualizationDiv.appendChild(app.view);

var antSourceRadius = 25;
var foodSourceRadius = 10;
var antRadius = 5;
var wallRadius = 10;

var pheromoneRadius = 15;

var numberOfAntSources = 1;
var numberOfFoodSources = 1;

var id = 0;
var deleteIds = [];

var antSourceId = 0;

var defaultAntLimit = Number(document.getElementById('antNum').value);
var defaultFoodAmount = Number(document.getElementById('foodNum').value);

var Q = Number(document.getElementById('qRate').value); // Constant used for pheromone updates
var p = Number(document.getElementById('pRate').value); // Pheromone evaporation coefficient
var A = Number(document.getElementById('attraction').value);

var foodSources = [];
var antSources = [];
var walls = [];

var ants = [];

var gridResolution = 4;

var speed = 5;

class AntSolution {
    constructor() {
        this._pathx = [];
        this._pathy = [];
        this._length = 0;
    }
    get length(){
        return this._length;
    }
    nthMove(n){
        return [this._pathx[n], this._pathy[n]];
    }
    addMove(move){
        this._pathx.push(move[0]);
        this._pathy.push(move[1]);
        this._length += 1;
    }
}

class PheromoneGrid {
    constructor() {
        //Add a plus one to catch high outlier, handle low negatives
        this._width = Math.floor(dims.width);
        this._height = Math.floor(dims.height);
        this._grid = new Array(this._height);
        for (let i = 0; i < this._height; i++)
        {
            this._grid[i] = new Array(this._width).fill(0.001);
        }
        this.vis = new Graphics();
        this.vis.beginFill(0xbbbbbb);
        this.vis.drawRect(0, 0, this._width, this._height);
        this.vis.x = this._x;
        this.vis.y = this._y;

        //Current Solution for the Ant
        this._solutions = [];

        app.stage.addChild(this.vis);
    }
    get grid() {
        return this._grid;
    }
    
    addSolution(solution)
    {
        this._solutions.push(solution);
    }

    clearSolutions()
    {
        this._solutions = [];
    }

    getPheromone(x,y) {
        if (x < 0.0) 
        {
            x = 0;
        }
        if (x > this._width - 1)
        {
            x = this._width - 1;
        }
        if (y < 0.0)
        {
            y = 0;
        }
        if (y > this._height - 1)
        {
            y = this._height - 1;
        }
        return this._grid[y][x];
    }

    setPheromone(x,y, pheromone) {
        if (x < 0.0) 
        {
            x = 0;
        }
        if (x > this._width - 1)
        {
            x = this._width - 1;
        }
        if (y < 0.0)
        {
            y = 0;
        }
        if (y > this._height - 1)
        {
            y = this._height - 1;
        }
        this._grid[y][x] = pheromone;
    }

    addPheromone(x,y, pheromone)
    {
        if (x < 0.0) 
        {
            x = 0;
        }
        if (x > this._width - 1)
        {
            x = this._width - 1;
        }
        if (y < 0.0)
        {
            y = 0;
        }
        if (y > this._height - 1)
        {
            y = this._height - 1;
        }
        this._grid[y][x] += pheromone;
    }

    decayPheromone(x,y)
    {
        if (x < 0.0) 
        {
            x = 0;
        }
        if (x > this._width - 1)
        {
            x = this._width - 1;
        }
        if (y < 0.0)
        {
            y = 0;
        }
        if (y > this._height - 1)
        {
            y = this._height - 1;
        }
        this._grid[y][x] *= 1-p;
    }

    updatePheromones(){
        var solutions = this._solutions;
        //Pheromone deposited by ant k = Q/Lk if ant k uses curve xy in its tour (Lk = length of ant k's solution, Q = constant), 0 otherwise
        this.vis.destroy();
        this.vis = new Graphics();
        for (var a = 0; a < solutions.length; a++)
        {
            for (var b = 0; b < solutions[a].length; b++)
            {
                var move = solutions[a].nthMove(b);
                var x = move[0];
                var y = move[1];
                for (var x2 = -pheromoneRadius; x2 < pheromoneRadius + 1; x2++)
                {
                    for (var y2 = -pheromoneRadius; y2 < pheromoneRadius + 1; y2++)
                    {
                        var newX = x + x2;
                        var newY = y + y2;
                        this.addPheromone(newX, newY, Q / solutions[a].length);
                    }
                }      
            }
        }
        for (var x = 0; x < this._width / gridResolution; x ++)
        {
            for (var y = 0; y < this._height / gridResolution; y++)
            {
                var total = 0.0;
                var num = 0.0;
                for (var x1 = x * gridResolution; x1 < (x + 1) * gridResolution; x1++)
                {
                    for (var y1 = y * gridResolution; y1 < (y + 1) * gridResolution; y1++)
                    {
                        total += this.getPheromone(x1, y1);
                        this.decayPheromone(x1, y1);
                        num++;
                    }
                }
                var avg = (total / num).toFixed(3);
                var color = 0xbbbbbb - Math.ceil(0x010001 * avg * 0.4);
                this.vis.beginFill(color);
                this.vis.drawRect(x * gridResolution, y * gridResolution, gridResolution, gridResolution);
                
            }
        }

        app.stage.addChild(this.vis);
        this.clearSolutions();
    }
}

var grid = new PheromoneGrid();

var lifespan = 2000 / speed;

class Ant {
    constructor(x, y, spawnId){
        this._radius = antRadius;
        this._moves = [
            [0, speed],
            [0, -speed],
            [speed, 0],
            [-speed, 0],
            [Math.ceil(speed / 2), Math.ceil(speed / 2)],
            [Math.ceil(speed / 2), -Math.ceil(speed / 2)],
            [-Math.ceil(speed / 2), Math.ceil(speed / 2)],
            [-Math.ceil(speed / 2), -Math.ceil(speed / 2)]
        ]
        this._targetX = x;
        this._targetY = y;
        this._x = x;
        this._y = y;
        this.vis = new Graphics();
        this.vis.beginFill(0xff0000);
        this.vis.drawCircle(0, 0, this._radius);
        this.vis.x = this._x;
        this.vis.y = this._y;
        this._hasFood = false;
        this._moveBackIndex = 0;
        this._timeLeft = lifespan;
        this._id = id;
        id += 1;
        this._explorationTimeStart = 10;
        this._explorationTime = this._explorationTimeStart;
        this._exploring = false;
        this._explorationX = -1;
        this._explorationY = -1;
        this._spawnId = spawnId;
        this._moveAwayX = this._x;
        this._moveAwayY = this._y;
        this._moveAwayRadius = 20;
        this._moveAwayTimeStart = 50;
        this._moveAwayTime = this._moveAwayTimeStart;

        //Current Solution for the Ant
        this._solution = new AntSolution();

        app.stage.addChild(this.vis);
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get hasFood() {
        return this._hasFood;
    }
    get solution() {
        return this._solution;
    }

    get possibleMoves() {
        let moves = [];
        for(let move of this._moves){
            let validMove = true;
            for(let wall of walls){
                if(distance(this._x + move[0], this._y + move[1], wall.x, wall.y) < wall.radius + this._radius){
                    validMove = false;
                    break;
                }

            }
            if(Math.floor(this._x + move[0] >= grid._width) || this._x + move[0] < 0.0 || Math.floor(this._y + move[1] >= grid._height) || this._y + move[1] < 0.0)
            {
                validMove = false;
            }

            if (distance(this._x + move[0], this._y + move[1], this._moveAwayX, this._moveAwayY) <= this._moveAwayRadius)
            {
                if (distance(this._x + move[0], this._y + move[1], this._moveAwayX, this._moveAwayY) < distance(this._x, this._y, this._moveAwayX, this._moveAwayY))
                {
                    validMove = false;
                }
            }

            if(validMove){
                moves.push([this._x + move[0], this._y + move[1]]);
            }
        }
        if(moves.length == 0){
            console.log('No valid moves (Ant Crushed)');
            this.destroy();
        }
        return moves;
    }

    clearSolution(){
        this._solution = AntSolution();
        this._moveBackIndex = 0;
    }

    update(delta){
        // TODO: Fix non-straight ant speed

        /*
        if (this._timeLeft <= 0)
        {
            this.destroy();
            console.log("Ant died");
        }
        else
        {
            this._timeLeft--;
        }
        */

        this._moveAwayTime--;
        if (this._moveAwayTime <= 0)
        {
            this._moveAwayTime = this._moveAwayTimeStart;
            this._moveAwayX = this._x;
            this._moveAwayY = this._y;
        }

        if (this._targetX > dims.width - 1)
        {
            this._x = dims.width - 1;
        }
        else if (this._targetX < 0)
        {
            this._x = 0;
        }
        else
        {
            this._x = this._targetX;
        }
        if (this._targetY > dims.height - 1)
        {
            this._y = dims.height - 1;
        }
        else if (this._targetY < 0)
        {
            this._y = 0;
        }
        else
        {
            this._y = this._targetY
        }
        this.vis.x = this._x;
        this.vis.y = this._y;
        for(let source of foodSources){
            if(distance(this._x, this._y, source.x, source.y) < source.radius && !this._hasFood){
                this._hasFood = true;
                source.takeFood();
                
                this.vis.beginFill(0x0000ff);
                this.vis.drawCircle(0, 0, this._radius);
                break;
            }
        }
        for(let source of antSources){
            if(distance(this._x, this._y, source.x, source.y) < source.radius && this._hasFood){
                grid.addSolution(this._solution);
                for (let source2 of antSources)
                {
                    if (source2._id == this._spawnId)
                    {
                        source2._antsToSave--;
                        if (source2._antsToSave <= 0)
                        {
                            source2.deleteSourceAnts();
                        }
                        this.destroy();
                        break;
                    }
                }
                this._hasFood = false;
                //source.increaseAntCount();
                break;
            }
        }
    }
    setTarget(target, addToSolution){
        this._targetX = target[0];
        this._targetY = target[1];
        if (addToSolution)
        {
            this._solution.addMove(target);
        }        
    }

    addGraphics()
    {
        app.stage.removeChild(this.vis);
        app.stage.addChild(this.vis);
    }

    destroy(){
        app.stage.removeChild(this.vis);
        deleteIds.push(this._id);
    }
    
}

class AntSource {
    constructor(x, y, antLimit){
        this._radius = antSourceRadius;
        this._x = x;
        this._y = y;
        this._antLimit = antLimit;
        this._antsCreated = 0;
        this._newAnts = 0;
        this.vis = new Graphics();
        this.vis.beginFill(0x000000);
        this.vis.drawCircle(0, 0, this._radius);
        this.vis.x = this._x;
        this.vis.y = this._y;
        this._id = antSourceId;
        this._antsToSaveStart = 1;
        this._antsToSave = this._antsToSaveStart;
        antSourceId++;
        app.stage.addChild(this.vis);
    }
    get x(){
        return this._x;
    }
    get y(){
        return this._y;
    }
    get ants(){
        return this._ants;
    }
    get radius(){
        return this._radius;
    }


    increaseAntCount()
    {
        this._newAnts++;
    }

    resetAntCount()
    {
        this._antsCreated = 0;
        this._newAnts = 0;
        this._antsToSave = this._antsToSaveStart;
        //this._antLimit = this._newAnts;
        //this._newAnts = 0;
    }
    get antsCreated()
    {
        return this._antsCreated;
    }
    get antLimit()
    {
        return this._antLimit;
    }
    addGraphics()
    {
        app.stage.removeChild(this.vis);
        app.stage.addChild(this.vis);
    }
    createAnt(){
        if(this._antsCreated < this._antLimit){
            ants.push(new Ant(this._x, this._y, this._id));
            this._antsCreated++;
            return true;
        }
        return false;
    }
    deleteSourceAnts()
    {
        for (var a = 0; a < ants.length; a++)
        {
            if (ants[a]._spawnId == this._id)
            {
                ants[a].destroy();
            }
        }
    }
    destroy(){
        app.stage.removeChild(this.vis);
        var i = antSources.indexOf(this);
        antSources.splice(i,1);
        /*
        for(var antIndex = 0; antIndex < this._ants.length; antIndex++){

        }
        */
        // TODO: Handle remaining ants - assign to nearest Source if it exists
    }


}
class FoodSource {
    constructor(x, y){
        this._radius = foodSourceRadius;
        this._x = x;
        this._y = y;
        this._foodAmount = defaultFoodAmount;
        
        this.vis = new Graphics();
        this.vis.beginFill(0x00dd00);
        this.vis.drawCircle(0, 0, this._radius);
        this.vis.x = this._x;
        this.vis.y = this._y;
        app.stage.addChild(this.vis);
    }
    get x(){
        return this._x;
    }
    get y(){
        return this._y;
    }
    get foodRemaining(){
        return this._foodAmount;
    }
    get radius(){
        return this._radius;
    }
    takeFood(){
        this._foodAmount = Math.min(document.getElementById('foodNum').value, this._foodAmount);
        this._foodAmount -= 1;
        // TODO: Have food source shrink when food taken
        if(this._foodAmount < 0){
            this.destroy();
            return false;
        }
        return true;
    }
    addGraphics()
    {
        app.stage.removeChild(this.vis);
        app.stage.addChild(this.vis);
    }
    destroy(){
        app.stage.removeChild(this.vis);
        var i = foodSources.indexOf(this);
        foodSources.splice(i,1);
    }
}

class Wall {
    constructor(x, y){
        this._radius = foodSourceRadius;
        this._x = x;
        this._y = y;
        
        this.vis = new Graphics();
        this.vis.beginFill(0x964b00);
        this.vis.drawCircle(0, 0, this._radius);
        this.vis.x = this._x;
        this.vis.y = this._y;
        app.stage.addChild(this.vis);
    }
    get x(){
        return this._x;
    }
    get y(){
        return this._y;
    }
    get radius(){
        return this._radius;
    }
    addGraphics()
    {
        app.stage.removeChild(this.vis);
        app.stage.addChild(this.vis);
    }
    destroy(){
        app.stage.removeChild(this.vis);
    }
}

for(let i = 0; i < numberOfFoodSources; i++){
    let newX = 0;
    let newY = 0;
    let done = false;
    while(!done){
        newX = Math.floor((Math.random() * 0.8 + 0.1) * app.renderer.width);
        newY = Math.floor((Math.random() * 0.8 + 0.1) * app.renderer.height);
        done = true;
        for(let source of foodSources){
            if(distance(source.x, source.y, newX, newY) < source.radius * 4.0){
                newX = Math.floor((Math.random() * 0.8 + 0.1) * app.renderer.width);
                newY = Math.floor((Math.random() * 0.8 + 0.1) * app.renderer.height);
                done = false;
                break;
            }
        }
    }
    foodSources.push(new FoodSource(newX, newY));
}

for(let i = 0; i < numberOfAntSources; i++){
    let newX = 0;
    let newY = 0;
    let done = false;
    while(!done){
        newX = Math.floor((Math.random() * 0.8 + 0.1) * app.renderer.width);
        newY = Math.floor((Math.random() * 0.8 + 0.1) * app.renderer.height);
        done = true;
        for(let source of antSources){
            if(distance(source.x, source.y, newX, newY) < source.radius * 4.0){
                newX = Math.floor((Math.random() * 0.8 + 0.1) * app.renderer.width);
                newY = Math.floor((Math.random() * 0.8 + 0.1) * app.renderer.height);
                done = false;
                break;
            }
        }
        if(done){
            for(let source of foodSources){
                if(distance(source.x, source.y, newX, newY) < source.radius * 4.0){
                    newX = Math.floor((Math.random() * 0.8 + 0.1) * app.renderer.width);
                    newY = Math.floor((Math.random() * 0.8 + 0.1) * app.renderer.height);
                    done = false;
                    break;
                }
            }
        }
    }
    antSources.push(new AntSource(newX, newY, defaultAntLimit));
}

app.stage.interactive = true;
let deleteObject = false;
document.addEventListener('keydown', (event) => {
    if(event.code == 'ControlLeft' || event.code == 'ControlRight'){
        deleteObject = true;
    }
});
document.addEventListener('keyup', (event) => {
    if(event.code == 'ControlLeft' || event.code == 'ControlRight'){
        deleteObject = false;
    }
});

app.renderer.plugins.interaction.on('pointerup', (event) => {
    if(deleteObject){
        walls = walls.filter(function(item){
            if(distance(item.x, item.y, event.data.global.x, event.data.global.y) < item.radius){
                item.destroy();
                return false;
            }
            return true;
        });
        foodSources = foodSources.filter(function(item){
            if(distance(item.x, item.y, event.data.global.x, event.data.global.y) < item.radius){
                item.destroy();
                return false;
            }
            return true;
        });
        antSources = antSources.filter(function(item){
            if(distance(item.x, item.y, event.data.global.x, event.data.global.y) < item.radius){
                item.destroy();
                return false;
            }
            return true;
        });
    }
    else{
        let allowPlacement = true;
        let placeFood = $('#selectorToggle input:radio:checked').val() == 2;
        let placeAnt = $('#selectorToggle input:radio:checked').val() == 3;
        let objectRadius = placeFood ? foodSourceRadius : (placeAnt ? antSourceRadius : wallRadius);
        for(let wall of walls){
            if(distance(wall.x, wall.y, event.data.global.x, event.data.global.y) < wall.radius + objectRadius){
                allowPlacement = false;
                break;
            }
        }
        if(allowPlacement){
            for(let source of foodSources){
                if(distance(source.x, source.y, event.data.global.x, event.data.global.y) < source.radius + objectRadius){
                    allowPlacement = false;
                    break;
                }
            }
            if(allowPlacement){
                for(let source of antSources){
                    if(distance(source.x, source.y, event.data.global.x, event.data.global.y) < source.radius + objectRadius){
                        allowPlacement = false;
                        break;
                    }
                }
                if(allowPlacement){
                    if(placeFood){
                        foodSources.push(new FoodSource(event.data.global.x, event.data.global.y));
                    }
                    else if(placeAnt){
                        antSources.push(new AntSource(event.data.global.x, event.data.global.y, defaultAntLimit));
                    }
                    else{
                        // TODO: Fix ant freezing when placing wall on top of them
                        walls.push(new Wall(event.data.global.x, event.data.global.y));
                    }
                }
            }
        }
    }
});

function destroyAnt(idToDelete)
{
    for (var a = 0; a < ants.length; a++)
    {
        var antId = ants[a]._id;
        if (antId == parseInt(idToDelete))
        {
            ants.splice(a,1);
            break;
        }
    }       
}
function deleteAnts()
{
    if (deleteIds.length > 0)
    {
        var length = deleteIds.length;
        for (var a = 0; a < length; a++)
        {
            destroyAnt(deleteIds[0]);
            deleteIds.splice(0, 1);
        }
    }
}


var loopCount = 0;
function gameLoop(delta){
    loopCount += 1;
    var isRoundDone = true;
    var antsCreated = 0;
    var fullAntLimit = 0;
    if (ants.length > 0)
    {
        isRoundDone = false;
    }
    else
    {
        for (var i = 0; i < antSources.length; i++)
        {
            antsCreated += antSources[i].antsCreated;
            fullAntLimit += antSources[i].antLimit;

            if (antsCreated < fullAntLimit)
            {
                isRoundDone = false;
                break;
            }
        }
    }
    

    if (isRoundDone)
    {
        grid.updatePheromones();
        for (var i = 0; i < antSources.length; i++)
        {
            antSources[i].resetAntCount();
            antSources[i].addGraphics();
        }
        for (var i = 0; i < foodSources.length; i++)
        {
            foodSources[i].addGraphics(); 
        }
        for (var i = 0; i < walls.length; i++)
        {
            walls[i].addGraphics();
        }
    }
    else
    {
        deleteAnts();
        updateAntTargets(antSources, foodSources, grid, ants);
        for(var i = 0; i < antSources.length; i++){
            //Produce an ant if need be
            while(antSources[i].createAnt());
        }
        //For each ant, check if the ant has completed a solution. If it has, update the pheromone grid and delete the ant. Otherwise, update the ant movement
    
        for(var antIndex = 0; antIndex < ants.length; antIndex++){
            ants[antIndex].update(delta);            
        }
    }

}

app.ticker.add(gameLoop);
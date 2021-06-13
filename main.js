//Create a Pixi Application
var visualizationDiv = document.getElementById('visualization');

let dims = visualizationDiv.getBoundingClientRect();
let app = new PIXI.Application({
    width: dims.width,
    height: dims.height,
    backgroundColor: 0xbbbbbb
});

//Add the canvas that Pixi automatically created for you to the HTML document
visualizationDiv.appendChild(app.view);

var antSourceRadius = 25;
var foodSourceRadius = 20;
var antRadius = 5;
var wallRadius = 10;

var defaultAntLimit = 3;

var foodSources = [];
var antSources = [];
var walls = [];

class Ant {
    constructor(x, y){
        this._radius = antRadius;
        this._moves = [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0],
            [0.5, 0.5],
            [0.5, -0.5],
            [-0.5, 0.5],
            [-0.5, -0.5]
        ]
        this._targetX = x;
        this._targetY = y;
        this._x = x;
        this._y = y;
        this.vis = new PIXI.Graphics();
        this.vis.beginFill(0xff0000);
        this.vis.drawCircle(0, 0, this._radius);
        this.vis.x = this._x;
        this.vis.y = this._y;
        this._hasFood = false;
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
    get possibleMoves() {
        let moves = [];
        for(let move of this._moves){
            let validMove = true;
            for(let wall of walls){
                if(distance(this._x + move[0], this._y + move[1], wall.x, wall.y) < wall.radius * 1.15 + this._radius){
                    validMove = false;
                    break;
                }
            }
            if(validMove){
                moves.push([this._x + move[0], this._y + move[1]]);
            }
        }
        if(moves.length == 0){
            console.log('No valid moves!');
        }
        return moves;
    }
    update(delta){
        // TODO: Fix non-straight ant speed
        this._x = this._x + 1 * Math.sign(this._targetX - this._x) * delta;
        this._y = this._y + 1 * Math.sign(this._targetY - this._y) * delta;
        this.vis.x = this._x;
        this.vis.y = this._y;
        for(let source of foodSources){
            if(distance(this._x, this._y, source.x, source.y) < source.radius){
                this._hasFood = true;
                break;
            }
        }
        for(let source of antSources){
            if(distance(this._x, this._y, source.x, source.y) < source.radius){
                this._hasFood = false;
                break;
            }
        }
    }
    setTarget(target){
        this._targetX = target[0];
        this._targetY = target[1];
    }
    destroy(){
        app.stage.removeChild(this.vis);
    }
}
class AntSource {
    constructor(x, y, antLimit){
        this._radius = antSourceRadius;
        this._x = x;
        this._y = y;
        this.antLimit = antLimit;
        this._ants = [];

        this.vis = new PIXI.Graphics();
        this.vis.beginFill(0x000000);
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
    get ants(){
        return this._ants;
    }
    get radius(){
        return this._radius;
    }
    createAnt(){
        if(this._ants.length < this.antLimit){
            this._ants.push(new Ant(this._x, this._y));
        }
    }
    destroy(){
        app.stage.removeChild(this.vis);
        // TODO: Handle remaning ants - assign to nearest Source if it exists
    }
}
class FoodSource {
    constructor(x, y){
        this._radius = foodSourceRadius;
        this._x = x;
        this._y = y;
        this.foodAmount = 100;
        
        this.vis = new PIXI.Graphics();
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
        return this.foodAmount;
    }
    get radius(){
        return this._radius;
    }
    takeFood(){
        this.foodAmount -= 1;
        // TODO: Have food source shrink when food taken
        if(this.foodAmount < 0){
            this.destroy();
            return false;
        }
        return true;
    }
    destroy(){
        app.stage.removeChild(this.vis);
    }
}

class Wall {
    constructor(x, y){
        this._radius = foodSourceRadius;
        this._x = x;
        this._y = y;
        
        this.vis = new PIXI.Graphics();
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
    destroy(){
        app.stage.removeChild(this.vis);
    }
}

for(i = 0; i < 5; i++){
    let newX = 0;
    let newY = 0;
    let done = false;
    while(!done){
        newX = (Math.random() * 0.8 + 0.1) * app.renderer.width;
        newY = (Math.random() * 0.8 + 0.1) * app.renderer.height;
        done = true;
        for(let source of foodSources){
            if(distance(source.x, source.y, newX, newY) < source.radius){
                newX = (Math.random() * 0.8 + 0.1) * app.renderer.width;
                newY = (Math.random() * 0.8 + 0.1) * app.renderer.height;
                done = false;
                break;
            }
        }
    }
    foodSources.push(new FoodSource(newX, newY));
}

for(i = 0; i < 1; i++){
    let newX = 0;
    let newY = 0;
    let done = false;
    while(!done){
        newX = (Math.random() * 0.8 + 0.1) * app.renderer.width;
        newY = (Math.random() * 0.8 + 0.1) * app.renderer.height;
        done = true;
        for(let source of antSources){
            if(distance(source.x, source.y, newX, newY) < source.radius){
                newX = (Math.random() * 0.8 + 0.1) * app.renderer.width;
                newY = (Math.random() * 0.8 + 0.1) * app.renderer.height;
                done = false;
                break;
            }
        }
        if(done){
            for(let source of foodSources){
                if(distance(source.x, source.y, newX, newY) < source.radius){
                    newX = (Math.random() * 0.8 + 0.1) * app.renderer.width;
                    newY = (Math.random() * 0.8 + 0.1) * app.renderer.height;
                    done = false;
                    break;
                }
            }
        }
    }
    antSources.push(new AntSource(newX, newY, defaultAntLimit));
}

app.stage.interactive = true;
placeFood = false;
placeAnt = false;
document.addEventListener('keydown', (event) => {
    if(event.code == 'ShiftLeft' || event.code == 'ShiftRight'){
        placeFood = true;
    }
    if(event.code == 'ControlLeft' || event.code == 'ControlRight'){
        placeAnt = true;
    }
});
document.addEventListener('keyup', (event) => {
    if(event.code == 'ShiftLeft' || event.code == 'ShiftRight'){
        placeFood = false;
    }
    if(event.code == 'ControlLeft' || event.code == 'ControlRight'){
        placeAnt = false;
    }
})
app.renderer.plugins.interaction.on('pointerup', (event) => {
    let allowPlacement = true;
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
});

loopCount = 0;
function gameLoop(delta){
    loopCount += 1;
    updateAntTargets(antSources, foodSources);
    for(var i = 0; i < antSources.length; i++){
        if((loopCount + ~~(Math.random() * 10)) % 15 == 0)
            antSources[i].createAnt();
        for(var antIndex = 0; antIndex < antSources[i].ants.length; antIndex++){
            antSources[i].ants[antIndex].update(delta);
        }
    }
}

app.ticker.add(gameLoop);
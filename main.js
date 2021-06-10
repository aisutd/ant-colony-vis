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

class Ant {
    constructor(x, y){
        this._moves = [
            [0, 1],
            [0, -1],
            [1, 0],
            [-1, 0]
        ]
        this._targetX = x;
        this._targetY = y;
        this._x = x;
        this._y = y;
        this.vis = new PIXI.Graphics();
        this.vis.beginFill(0xff0000);
        this.vis.drawCircle(0, 0, 5);
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
            // TODO: #1 Add walls and wall-checking
            let validMove = true;
            if(validMove){
                moves.push([this._x + move[0], this._y + move[1]]);
            }
        }
        return moves;
    }
    update(delta){
        // TODO: Fix non-straight ant speed
        this._x = this._x + 1 * Math.sign(this._targetX - this._x) * delta;
        this._y = this._y + 1 * Math.sign(this._targetY - this._y) * delta;
        this.vis.x = this._x;
        this.vis.y = this._y;
    }
    setFoodStatus(status){
        this._hasFood = status;
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
        this._radius = 25;
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
        this._radius = 20;
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

var hitTest = function(s2, s1)
{
    var x1 = s1.x + (s1.width/2),
    y1 = s1.y + (s1.height/2),
    w1 = s1.width,
    h1 = s1.height,
    x2 = s2.x + ( s2.width / 2 ),
    y2 = s2.y + ( s2.height / 2 ),
    w2 = s2.width,
    h2 = s2.height;
    
    if(Math.abs(x2 - x1) + Math.abs(y2 - y1) < Math.max(w1 + 5, w2 + 5)){
        return true;
    }
    return false;
};

var foodSources = [];
var antSources = [];
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
    antSources.push(new AntSource(newX, newY, 1));
}

function distance(obj1x, obj1y, obj2x, obj2y){
    return Math.sqrt(Math.pow(obj1x - obj2x, 2) + Math.pow(obj1y - obj2y, 2));
}

loopCount = 0;
function gameLoop(delta){
    loopCount += 1;
    console.log(antSources);
    updateAntTargets(antSources, foodSources);
    for(var i = 0; i < antSources.length; i++){
        if((loopCount + ~~(Math.random() * 10)) % 15 == 0)
            antSources[i].createAnt();
        for(var antIndex = 0; antIndex < antSources[i].ants.length; antIndex++){
            antSources[i].ants[antIndex].update(delta);
            // Ant code
            // let targetX = 0;
            // let targetY = 0;
            // if(!antSources[i].ants[antIndex].hasFood){
            //     // Go to closest food source
            //     let closestFoodX = 0;
            //     let closestFoodY = 0;
            //     let closestFoodDis = 100000;
            //     for(let food of foodSources){
            //         if(distance(antSources[i].ants[antIndex].x, antSources[i].ants[antIndex].y, food.x, food.y) < closestFoodDis){
            //             closestFoodDis = distance(antSources[i].ants[antIndex].x, antSources[i].ants[antIndex].y, food.x, food.y);
            //             closestFoodX = food.x;
            //             closestFoodY = food.y;
            //             if(closestFoodDis < food.radius){
            //                 antSources[i].ants[antIndex].setFoodStatus(true);
            //             }
            //         }
            //     }
            //     targetX = closestFoodX;
            //     targetY = closestFoodY;
            // }
            // else{
            //     // Go back to source
            //     targetX = antSources[i].x;
            //     targetY = antSources[i].y;
            //     if(distance(antSources[i].ants[antIndex].x, antSources[i].ants[antIndex].y, antSources[i].x, antSources[i].y) < antSources[i].radius){
            //         antSources[i].ants[antIndex].setFoodStatus(false);
            //     }
            // }
            // antSources[i].ants[antIndex].moveTo(targetX, targetY, delta);
        }
    }
}

app.ticker.add(gameLoop);
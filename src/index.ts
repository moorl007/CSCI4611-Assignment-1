/* Assignment 1: Space Minesweeper
 * CSCI 4611, Spring 2022, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as paper from 'paper';
import {random, randomInt} from 'mathjs';

class Game 
{
    // Width and height are defined in project coordinates
    // This is different than screen coordinates!
    private width : number;
    private height : number;
    private bigStarNode : paper.Group;
    private medStarNode : paper.Group;
    private smallStarNode : paper.Group;
    private velocity : paper.Point | undefined;
    private secCounter : number;
    private mineSymbols : paper.SymbolItem[];
    private score : number;
    private gameOver : boolean;
    private gameOverScreen : paper.Group;
    private gameOverSymbol : paper.SymbolItem;

    private pointTxt : paper.PointText; 
    private pointGame : paper.PointText;


    private explosionNode : paper.Group | undefined;
    private explosions : paper.SymbolItem[];

    private laserNode : paper.Group;
    private laserSymbols : paper.SymbolItem[];
    private laserVelocities : paper.Point[];

    // TypeScript will throw an error if you define a type but don't initialize in the constructor
    // This can be prevented by including undefined as a second possible type
    private ship : paper.Group | undefined;
    private mine : paper.Group | undefined;
    
    constructor()
    {
        paper.setup('canvas');
        this.width = 1200;
        this.height = 800;
        this.secCounter = 0;
        this.score = 0;
        this.gameOver = false;

        this.bigStarNode = new paper.Group();
        this.medStarNode = new paper.Group();
        this.smallStarNode = new paper.Group();


        this.mineSymbols = [];
        this.explosionNode = new paper.Group();
        this.explosions = [];

        this.laserVelocities = []

        this.laserNode = new paper.Group();
        this.laserSymbols = [];

        var laser = new paper.Path.Line(new paper.Point(400,-100), new paper.Point(430,-100));

        //var laser = new paper.Path.Rectangle(new paper.Rectangle(new paper.Point(400,400), new paper.Size(40, 2)));
        //laser.fillColor = new paper.Color('red');
        laser.strokeColor = new paper.Color('red');
        laser.strokeWidth = 7;

        var explosion = new paper.Path.Star(new paper.Point(600,200), 10, 10, 25);
        var innerExplosion = new paper.Path.Star(new paper.Point(600,200), 10, 2*3, 5*3);
        explosion.fillColor = new paper.Color('red');
        innerExplosion.fillColor = new paper.Color('yellow');

        this.explosionNode.addChild(explosion);
        this.explosionNode.addChild(innerExplosion);

        this.laserNode.addChild(laser);

        this.gameOverScreen = new paper.Group();

        var blackScreen = new paper.Rectangle(new paper.Point(0,0), new paper.Size(1200,800));
        // var restart = new paper.Rectangle(new paper.Point(450,525), new paper.Size(300,150));
        // var restartPath = new paper.Path.Rectangle(restart);
        var blackScreenPath = new paper.Path.Rectangle(blackScreen);
        var gameOverText = new paper.PointText(new paper.Point(480,200));
        gameOverText.fontFamily = 'Impact';
        gameOverText.fontSize = 50;
        gameOverText.fillColor = new paper.Color('red');
        gameOverText.content = 'GAME OVER'

        var line2 = new paper.PointText(new paper.Point(480,500));
        line2.fontFamily = 'Courier';
        line2.fontSize = 15;
        line2.fillColor = new paper.Color('white');
        line2.content = 'click anywhere to restart';

        var line3 = new paper.PointText(new paper.Point(480,350));
        line3.fontFamily = 'Courier';
        line3.fontSize = 35;
        line3.fillColor = new paper.Color('white');
        line3.content = 'Points:';

        // restartPath.fillColor = new paper.Color('white');
        blackScreenPath.fillColor = new paper.Color('black');
        
        
        this.gameOverScreen.addChild(blackScreenPath);
        //this.gameOverScreen.addChild(restartPath);
        this.gameOverScreen.addChild(gameOverText);
        this.gameOverScreen.addChild(line2);
        this.gameOverScreen.addChild(line3);
        var dummy = new paper.SymbolDefinition(this.gameOverScreen);
        this.gameOverSymbol = dummy.place(new paper.Point(600,400));
        this.gameOverSymbol.visible = false;
        this.pointTxt = new paper.PointText(new paper.Point(650,350));
        this.pointTxt.fontFamily = 'Courier';
        this.pointTxt.fontSize = 35;
        this.pointTxt.fillColor = new paper.Color('white');
        this.pointTxt.visible = false;
        this.pointGame = new paper.PointText(new paper.Point(1120,80));
        this.pointGame.fontFamily = 'Courier';
        this.pointGame.fontSize = 35;
        this.pointGame.fillColor = new paper.Color('white');
        this.pointGame.visible = true;
        this.pointGame.content = this.score.toString();

    }

    start() : void 
    {
        this.createScene();
        this.resize();

        // This registers the event handlers for window and mouse events
        paper.view.onResize = () => {this.resize();};
        paper.view.onMouseMove = (event: paper.MouseEvent) => {this.onMouseMove(event);};
        paper.view.onMouseDown = (event: paper.MouseEvent) => {this.onMouseDown(event);};
        paper.view.onFrame = (event: GameEvent) => {this.update(event);};

    }

    private createScene() : void 
    {
        // Create a new group to hold the ship graphic
        this.ship = new paper.Group();
        this.mine = new paper.Group();
        

        // This line prevents the transformation matrix from being baked directly into its children
        // Instead, will be applied every frame
        this.ship.applyMatrix = false;
        

        // This code block loads an SVG file asynchronously
        // It uses an arrow function to specify the code that gets executed after the file is loaded
        // We will go over this syntax in class
        paper.project.importSVG('./assets/ship.svg', (item: paper.Item) => {
            // The exclamation point tells TypeScript you are certain the variable has been defined
            item.addTo(this.ship!);
            this.ship!.scale(3);
            this.ship!.position.x = this.width / 2;
            this.ship!.position.y = this.height / 2;
        });

        paper.project.importSVG('./assets/mine.svg', (item: paper.Item) => {
            item.addTo(this.mine!);
            this.mine!.scale(3);
            this.mine!.position = new paper.Point(400,400);
            // this.mine!.visible = false;      
        });
        

        // Add more code here
        var bigStar = new paper.Path.Star(new paper.Point(200,200), 5, 4, 10);
        bigStar.strokeWidth = 2;
        bigStar.fillColor = new paper.Color('gold');
        bigStar.opacity = .5;

        var medStar = new paper.Path.Star(new paper.Point(800, 300), 5, 2, 5);
        medStar.fillColor = new paper.Color('red');
        medStar.opacity = .5;
        


        var dot = new paper.Path.Circle(new paper.Point(500, 300), 1);
        dot.fillColor = new paper.Color('white');

        this.velocity = new paper.Point(0,0);
        
       

        var bigStarSymbol = new paper.SymbolDefinition(bigStar);
        var medStarSymbol = new paper.SymbolDefinition(medStar);
        var dotSymbol = new paper.SymbolDefinition(dot);

        var bigStarSymbols : paper.SymbolItem[] = [];
        var medStarSymbols : paper.SymbolItem[] = [];
        var smallStarSymbols : paper.SymbolItem[] = [];

        for (let i = 0; i < 25;i++){
            //10 big
            //15 med
            //25 small
            if (i<10){
                //add big
                bigStarSymbols.push(bigStarSymbol.place(new paper.Point(random(1200), random(800))));
                bigStarSymbols[i].addTo(this.bigStarNode);
            }
            if (i<15){
                //add med
                medStarSymbols.push(medStarSymbol.place(new paper.Point(random(1200) , random(800))));
                medStarSymbols[i].addTo(this.medStarNode);
            }
            //add small

            smallStarSymbols.push(dotSymbol.place(new paper.Point(random(1200), random(800))));
            smallStarSymbols[i].addTo(this.smallStarNode);
        }

        //four corners
        dotSymbol.place(new paper.Point(1200,775));
        dotSymbol.place(new paper.Point(1200,25));
        dotSymbol.place(new paper.Point(0,775));
        dotSymbol.place(new paper.Point(0,25));
    }

    // This method will be called once per frame
    private update(event: GameEvent) : void
    {
        if(!this.gameOver){
            this.pointGame.content = this.score.toString();
            this.ship!.visible = true;
            if(this.gameOverSymbol.visible){
                this.pointGame.visible = true;
                this.gameOverSymbol.visible = false;
                this.pointTxt.visible = false;
            }
            // Add code here
            var mineSymbol = new paper.SymbolDefinition(this.mine!);
            var explosionsymbol = new paper.SymbolDefinition(this.explosionNode!);

            //do laser movement
            for(var i = 0; i<this.laserSymbols.length; i++){

                //remove if laser is out of the window
                if(this.laserSymbols[i].position.x>1450 || this.laserSymbols[i].position.x<-150 || this.laserSymbols[i].position.y>950 || this.laserSymbols[i].position.y<-150){
                    this.laserSymbols[i].visible = false;
                    console.log("it should disappear");
                    this.laserSymbols.splice(i,1);
                    this.laserVelocities.splice(i,1);
                    break;      
                }

                this.laserSymbols[i].translate(this.laserVelocities[i].multiply(20));
                this.laserSymbols[i].translate(this.velocity!.multiply(-event.delta).multiply(1.1))
            }

            //expand explosions and remove if they get too big
            for(var i = 0; i<this.explosions.length; i++){
                // console.log(this.explosions.length);
                this.explosions[i].scaling.length += 0.4;
                this.explosions[i].translate(this.velocity!.multiply(-event.delta).multiply(1.1));

                if(this.explosions[i].scaling.length > 4){
                    //remove the explosion from the screen and the arrya
                    this.explosions[i].visible = false;
                    this.explosions.splice(i,1);
                }
            }

    
            //add mine every 0.5 seconds
            if(event.time > this.secCounter + 0.5){   
                var location = randomInt(4);
                this.secCounter = event.time;
                // console.log(this.secCounter);

                if(location == 0){
                    //add to top of screen
                    this.mineSymbols.push(mineSymbol.place(new paper.Point(random(1200),-10)));
                    console.log("top of screen");
                }else if(location ==1 ){
                    //add to right of screen
                    this.mineSymbols.push(mineSymbol.place(new paper.Point(1220,random(800))));
                    console.log("right of screen");

                }else if(location == 2){
                    //add to bottom of screen
                    this.mineSymbols.push(mineSymbol.place(new paper.Point(random(1200),810)));
                    console.log("bottom of screen");

                }else if(location == 3){
                    //add to left of screen
                    this.mineSymbols.push(mineSymbol.place(new paper.Point(-20,random(800))));
                    console.log("left of screen");

                }
                console.log(this.mineSymbols.length);
                if(this.mineSymbols.length > 25){
                    //remove the first mine in the array
                    // delete this.mineSymbols[0];
                    this.mineSymbols[0].visible = false;
                    // this.mineSymbols = this.mineSymbols.splice(1,25);
                    this.mineSymbols.splice(0,1);
                    console.log("deleted mine");
                }


                
            }

            //move stars based on mouse movement
            this.bigStarNode.translate(this.velocity!.multiply(-event.delta));
            this.medStarNode.translate(this.velocity!.multiply(-event.delta).multiply(0.25));
            this.smallStarNode.translate(this.velocity!.multiply(-event.delta).multiply(0.1));

            //mvoe mines towards ship, 
            for(var i = 0; i<this.mineSymbols.length; i++){
                this.mineSymbols[i].translate((this.mineSymbols[i].position.subtract(this.ship!.position)).divide(-this.mineSymbols[i].position.subtract(this.ship!.position).length));
                this.mineSymbols[i].rotate(1);
                this.mineSymbols[i].translate(this.velocity!.multiply(-event.delta).multiply(1.1));
            }

            for(var i = 0; i<(this.mineSymbols.length); i++){
                var toShip = this.mineSymbols[i].position.subtract(this.ship!.position).length;
                if(toShip<30){
                    this.gameOver = true;
                    this.mineSymbols[i].visible = false;

                    // create explosion
                    this.explosions.push(explosionsymbol.place(this.mineSymbols[i].position));
                    this.explosions[this.explosions.length-1].applyMatrix = false;
                    this.explosions[this.explosions.length-1].scaling.length = 1;

                    this.mineSymbols.splice(i, 1);
                    break;

                }
                for(var t = 0; t<this.laserSymbols.length; t++){
                    var distance = this.laserSymbols[t].position.subtract(this.mineSymbols[i].position).length;
                    if(distance<30){
                        this.score++;
                        console.log(this.score);
                        this.mineSymbols[i].visible = false;

                        // create explosion
                        this.explosions.push(explosionsymbol.place(this.mineSymbols[i].position));
                        this.explosions[this.explosions.length-1].applyMatrix = false;
                        this.explosions[this.explosions.length-1].scaling.length = 1;

                        this.laserSymbols[t].visible = false;
                        this.laserSymbols.splice(t,1);
                        this.laserVelocities.splice(t,1);

                        this.mineSymbols.splice(i, 1);
                        break;
                    }
                }
            }
            


            //destray mines if they get too close to each other
            for(var i = 0 ; i<(this.mineSymbols.length-1) ; i++){
                console.log(this.score);
                for(var j = i+1; j<this.mineSymbols.length; j++){
                    var distance = this.mineSymbols[i].position.subtract(this.mineSymbols[j].position).length;
                    if(distance < 0){
                        distance = -distance;
                    }
                    if(distance < 44){
                        //remove the mines
                        this.mineSymbols[i].visible = false;
                        this.mineSymbols[j].visible = false;
                        // create explosion
                        this.explosions.push(explosionsymbol.place(this.mineSymbols[i].position));
                        this.explosions[this.explosions.length-1].applyMatrix = false;
                        this.explosions[this.explosions.length-1].scaling.length = 1;
                        this.explosions.push(explosionsymbol.place(this.mineSymbols[j].position));
                        this.explosions[this.explosions.length-1].applyMatrix = false;
                        this.explosions[this.explosions.length-1].scaling.length = 1;

                        this.mineSymbols.splice(j, 1);
                        this.mineSymbols.splice(i, 1);
                        break;
                    }
                }
            }

            //game over if a mine hits the ship

            //expand any explosions and remove them once they get too big


            
            //make stars pull a pac-man if they go off screen
            for(var i = 0; i<25; i++){
                if(i<10){
                    if (this.bigStarNode.children[i].position.x<0){
                        this.bigStarNode.children[i].position.x = 1220;
                    }
                    if (this.bigStarNode.children[i].position.x>1220){
                        this.bigStarNode.children[i].position.x = 0;
                    }
                    if (this.bigStarNode.children[i].position.y<0){
                        this.bigStarNode.children[i].position.y = 800;
                    }
                    if (this.bigStarNode.children[i].position.y>800){
                        this.bigStarNode.children[i].position.y = 0;
                    }

                }
                if(i<15){
                    //test
                    if (this.medStarNode.children[i].position.x<0){
                        this.medStarNode.children[i].position.x = 1220;
                    }
                    if (this.medStarNode.children[i].position.x>1220){
                        this.medStarNode.children[i].position.x = 0;
                    }
                    if (this.medStarNode.children[i].position.y<0){
                        this.medStarNode.children[i].position.y = 800;
                    }
                    if (this.medStarNode.children[i].position.y>800){
                        this.medStarNode.children[i].position.y = 0;
                    }
                }

                if (this.smallStarNode.children[i].position.x<0){
                    this.smallStarNode.children[i].position.x = 1220;
                }
                if (this.smallStarNode.children[i].position.x>1220){
                    this.smallStarNode.children[i].position.x = 0;
                }
                if (this.smallStarNode.children[i].position.y<0){
                    this.smallStarNode.children[i].position.y = 800;
                }
                if (this.smallStarNode.children[i].position.y>800){
                    this.smallStarNode.children[i].position.y = 0;
                }
                
            }
        }else{
            this.ship!.visible = false;
            
            if(!this.gameOverSymbol.visible){
                this.pointGame.visible = false;
                this.pointTxt.content = this.score.toString();
                this.gameOverSymbol.visible = true;
                this.pointTxt.visible = true;
            }

            for(var i = 0; i<this.mineSymbols.length; i++){
                this.mineSymbols[i].visible = false;
            }
            for(var i = 0; i<this.explosions.length; i++){
                this.explosions[i].visible = false;
            }

            for(var i = 0; i<this.laserSymbols.length; i++){
                this.laserSymbols[i].visible = false;
            }
            this.mineSymbols = [];
            this.explosions = [];
            this.score = 0;
        }
    }

    // This handles dynamic resizing of the browser window
    // You do not need to modify this function
    private resize() : void
    {
        var aspectRatio = this.width / this.height;
        var newAspectRatio = paper.view.viewSize.width / paper.view.viewSize.height;
        if(newAspectRatio > aspectRatio)
            paper.view.zoom = paper.view.viewSize.width  / this.width;    
        else
            paper.view.zoom = paper.view.viewSize.height / this.height;
        
        paper.view.center = new paper.Point(this.width / 2, this.height / 2);
        
    }

    private onMouseMove(event: paper.MouseEvent) : void
    {
        // Get the vector from the center of the screen to the mouse position
        var mouseVector = event.point.subtract(paper.view.center);
        // console.log(mouseVector);

        // this.velocity = mouseVector.subtract(this.ship!.position);
        this.velocity = mouseVector;
        // console.log(this.velocity);



        // Point the ship towards the mouse cursor by converting the vector to an angle
        // This only works if applyMatrix is set to false
        this.ship!.rotation = mouseVector.angle + 90;
    }

    private onMouseDown(event: paper.MouseEvent) : void
    {
        console.log("Mouse click!");
        var laserSymbol = new paper.SymbolDefinition(this.laserNode);
        this.laserSymbols.push(laserSymbol.place(this.ship!.position));
        this.laserSymbols[this.laserSymbols.length-1].rotation = this.velocity!.angle;
        this.laserVelocities.push(new paper.Point(this.velocity!).divide(this.velocity!.length));
        if(this.gameOver){
            this.gameOver = false;
            //this.createScene();
        }
    } 
}

// This is included because the paper is missing a TypeScript definition
// You do not need to modify it
class GameEvent
{
    readonly delta: number;
    readonly time: number;
    readonly count: number;

    constructor()
    {
        this.delta = 0;
        this.time = 0;
        this.count = 0;
    }
}
    
// Start the game
var game = new Game();
game.start();
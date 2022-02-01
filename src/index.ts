/* Assignment 1: Space Minesweeper
 * CSCI 4611, Spring 2022, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 
​
import * as paper from 'paper';
import { Group, Path, Point, SymbolDefinition, SymbolItem, view, View } from 'paper/dist/paper-core';
​
class Game 
{
    // Width and height are defined in project coordinates
    // This is different than screen coordinates!
    private width : number;
    private height : number;
​
    // TypeScript will throw an error if you define a type but don't initialize in the constructor
    // This can be prevented by including undefined as a second possible type
    private ship : paper.Group | undefined;
​
    private sStar! : paper.Path.Circle;
    private lStar! : paper.Path.Circle;
    private smallStar! : paper.SymbolDefinition;
    private largeStar! : paper.SymbolDefinition;
    private mouseVector! : paper.Point;
    private starGroup! : paper.Item;
    
    constructor()
    {
        paper.setup('canvas');
        this.width = 1200;
        this.height = 800;
    }
​
    start() : void 
    {
        this.createScene();
        this.resize();
​
        // This registers the event handlers for window and mouse events
        paper.view.onResize = () => {this.resize();};
        paper.view.onMouseMove = (event: paper.MouseEvent) => {this.onMouseMove(event);};
        paper.view.onMouseDown = (event: paper.MouseEvent) => {this.onMouseDown(event);};
        paper.view.onFrame = (event: GameEvent) => {this.update(event);};
​
    }
​
    private createScene() : void 
    {
        // Create a new group to hold the ship graphic
        this.ship = new paper.Group();
​
        // This line prevents the transformation matrix from being baked directly into its children
        // Instead, will be applied every frame
        this.ship.applyMatrix = false;
​
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
​
        // Add more code here
        //Used to initialize star
        
​
        /* this.lStar = new paper.Path.Circle(new paper.Point(300,400), 3);
        this.lStar.strokeColor = new paper.Color("white");
        this.lStar.fillColor = new paper.Color("white"); */
​
        //Uses symbols to create instances of smaller stars throughout the canvas
        this.starGroup = new paper.Group();
        for(var i = 0 ; i < 120 ; i++){
            this.sStar = new paper.Path.Circle(new paper.Point(300,400), Math.random()*3);
            this.sStar.strokeColor = new paper.Color("white");
            this.sStar.fillColor = new paper.Color("white");
​
            this.smallStar = new paper.SymbolDefinition(this.sStar);
            this.starGroup.addChild(this.sStar);
​
            var maxPoint = new Point(1200,800);
            var randomPoint = Point.random();
​
            this.smallStar.place(maxPoint.multiply(randomPoint));
        }
        
        /* this.largeStar = new paper.SymbolDefinition(this.lStar);
        for(var i = 0 ; i < 120 ; i++){
            var maxPoint = new Point(1200,800);
            var randomPoint = Point.random();
            this.largeStar.place(maxPoint.multiply(randomPoint));
        } */
​
​
    }
​
    // This method will be called once per frame
    private update(event: GameEvent) : void
    {
        //Add code here
        if(this.smallStar){
            //used to reset x position for stars
            this.smallStar.item.translate(this.mouseVector);
            if(this.smallStar.item.position.x > 1200){
                this.smallStar.item.position.x = 0;
            }else if(this.smallStar.item.position.x < 0){
                this.smallStar.item.position.x = 1200;
            }
    
            //used to reset y position for stars 
            if(this.smallStar.item.position.y > 800){
                this.smallStar.item.position.y = 0;
            }else if(this.smallStar.item.position.y < 0){
                this.smallStar.item.position.y = 800;
            }
        }
​
        /* if(this.largeStar){
            //used to reset x position for stars
            this.largeStar.item.translate(this.mouseVector);
            if(this.largeStar.item.position.x > 1200){
                this.largeStar.item.position.x = 0;
            }else if(this.largeStar.item.position.x < 0){
                this.largeStar.item.position.x = 1200;
            }
    
            //used to reset y position for stars
            if(this.largeStar.item.position.y > 800){
                this.largeStar.item.position.y = 0;
            }else if(this.smallStar.item.position.y < 0){
                this.largeStar.item.position.y = 800;
            }
        } */
​
    }
​
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
​
    private onMouseMove(event: paper.MouseEvent) : void
    {
        // Get the vector from the center of the screen to the mouse position
        this.mouseVector = event.point.subtract(paper.view.center);
​
        // Point the ship towards the mouse cursor by converting the vector to an angle
        // This only works if applyMatrix is set to false
        this.ship!.rotation = this.mouseVector.angle + 270; //was + 90
    }
​
    private onMouseDown(event: paper.MouseEvent) : void
    {
        console.log("Mouse click!");
    } 
}
​
// This is included because the paper is missing a TypeScript definition
// You do not need to modify it
class GameEvent
{
    readonly delta: number;
    readonly time: number;
    readonly count: number;
​
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
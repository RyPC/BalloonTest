
//acceleration due to gravity
const gravity = 0.025;
//spring constant of the "bonds"
const ke = 0.05;
//pressure constant of inside
const kp = 3;
//refresh rate
const fps = 60;
//max speed
const maxSpeed = 5;
//number of shapes
const totalShapes = 3;
//right barrier
var maxX = 1480;
//bottom barrier
var maxY = 790;

//weird randomness
var random = true;
//collisions
var collide = true;
//dark mode
var dark = true;
//showing white center dot
var center = false;

var numShapes = 0;
var shapes = [];
var interval;


function start() {
    console.log("start");

    for (var i = 0; i < totalShapes; i++) {
        shapes[i] = new Shape((100 + Math.random() * 1300), (100 + Math.random() * 600), parseInt((20 + Math.random() * 35)));
        shapes[i].setVel((Math.random() * 20 - 10), (Math.random() * 20 - 10));
    }
    interval = setInterval(function () {
        update();
    }, (1000 / fps));
}

function update() {
    //setting barriers dependent on window size
    maxX = window.innerWidth * 0.9 - 10;
    maxY = window.innerHeight * 0.95 - 10;

    collide = document.getElementById("collide").checked;
    center = document.getElementById("center").checked;

    //console.log("updated");

    let style = document.getElementById("body").style;
    dark = document.getElementById("dark").checked
    style.backgroundColor = dark ? "black" : "white";
    style.color = dark ? "white" : "black";
    document.getElementById("screen").style.borderColor = dark ? "white" : "black";

    shapes.forEach(shape => shape.update());
}

function stopAll() {
    clearInterval(interval);
}




class Shape {

    constructor(x, y, numPoints) {
        this.id = numShapes;
        this.x = x;
        this.y = y;
        this.numPoints = numPoints;
        this.points = Array(this.numPoints);
        this.center;//center point

        //make all of the points
        let colors = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256));
        for (var i = 0; i < this.numPoints; i++) {
            //transitioning colors
            let color =
                `rgb(
                    ${Math.abs(colors[0] - (colors[0] / (numPoints / 2) * i)) + colors[3] - Math.abs(colors[3] - (colors[3] / (numPoints / 2) * i))},
                    ${Math.abs(colors[1] - (colors[1] / (numPoints / 2) * i)) + colors[4] - Math.abs(colors[4] - (colors[4] / (numPoints / 2) * i))},
                    ${Math.abs(colors[2] - (colors[2] / (numPoints / 2) * i)) + colors[5] - Math.abs(colors[5] - (colors[5] / (numPoints / 2) * i))})`;

            var rad = i / this.numPoints * 2 * Math.PI;
            //adds randomness to spawning
            if (random) rad += Math.random();
            this.points[i] = new Point(this.x + (this.numPoints * 4 * Math.cos(rad)), (this.y + (this.numPoints * 4 * Math.sin(rad))), `s${numShapes}p${i}`, this, color);
            this.points[i].create();
        }
        this.originalArea = this.calculateArea();

        //set all connecting bits between points
        for (var i = 1; i < this.numPoints - 1; i++) {
            this.points[i].setPoint1(this.points[i - 1]);
            this.points[i].setPoint2(this.points[i + 1]);
        }
        this.points[0].setPoint1(this.points[this.numPoints - 1]);
        this.points[0].setPoint2(this.points[1]);
        this.points[this.numPoints - 1].setPoint1(this.points[this.numPoints - 2]);
        this.points[this.numPoints - 1].setPoint2(this.points[0]);


        this.center = this.centerPoint(`s${numShapes}Center`);
        this.center.create();

        this.update();

        numShapes++;
    }

    //sets velocity of every point
    setVel(xVel, yVel) {
        this.points.forEach(point => {
            point.xVel = xVel;
            point.yVel - yVel;
        });
    }

    //returns center of all points in shape
    centerPoint(id) {
        let totalX = 0;
        let totalY = 0;
        this.points.forEach(point => {
            totalX += point.x;
            totalY += point.y;
        });
        return new Point((totalX / this.numPoints), (totalY / this.numPoints), id, this, "white");
    }

    update() {
        let area = this.calculateArea();
        let perimeter = this.calcluatePerimeter();
        let centerPoint = this.centerPoint();
        this.points.forEach(point => {
            point.shapeArea = area;
            point.shapePerimeter = perimeter;
            point.centerPoint = centerPoint;
            point.update();
        });

        //updating and displaying center points
        this.center.x = centerPoint.x;
        this.center.y = centerPoint.y;
        this.center.changeColor(center ? (dark ? "white" : "black") : "transparent");
        this.center.display();
    }

    //calculate area of shape by divding it into (sides - 2) triangles
    //Example: 5-sided shape, making triangles with points (1,2,3), (1,3,4), (1,4,5)
    calculateArea() {
        var totalArea = 0;
        for (var i = 2; i < this.numPoints; i++) {
            //Using Heron's Formula for area of triangle
            let a = Math.sqrt(Math.pow((this.points[0].x - this.points[i - 1].x), 2) + Math.pow((this.points[0].y - this.points[i - 1].y), 2));
            let b = Math.sqrt(Math.pow((this.points[0].x - this.points[i].x), 2) + Math.pow((this.points[0].y - this.points[i].y), 2));
            let c = Math.sqrt(Math.pow((this.points[i].x - this.points[i - 1].x), 2) + Math.pow((this.points[i].y - this.points[i - 1].y), 2));
            let s = (a + b + c) / 2;
            let area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
            totalArea += area;
        }
        return totalArea ? totalArea : 0;
    }

    //calculates perimeter, pretty simple
    calcluatePerimeter() {
        let totalPerimeter = 0;
        for (var i = 0; i < this.numPoints - 1; i++) {
            totalPerimeter += Math.sqrt(Math.pow((this.points[i].x - this.points[i + 1].x), 2) + Math.pow((this.points[i].y - this.points[i + 1].y), 2));
        }
        return totalPerimeter ? totalPerimeter : 0;
    }

}


class Point {
    constructor(x, y, id, parent, color) {
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.size = 10;
        this.id = id;
        this.point1;
        this.point2;
        this.xVel = 0;
        this.yVel = 0;
        this.xAcc = 0;
        this.yAcc = gravity;
        this.shapeArea = 0;
        this.shapePerimeter = 0;
        this.centerPoint;
        this.color = color;
    }

    //sets which point comes "before" it
    setPoint1(point) {
        this.point1 = point;
    }
    //sets which point comes "after" it 
    setPoint2(point) {
        this.point2 = point;
    }

    distanceFromPoint1() {
        return Math.sqrt(Math.pow((this.x - this.point1.x), 2) + Math.pow((this.y - this.point1.y), 2));
    }

    //creates point and displays it on screen
    create() {
        let html = `<div class="s${this.parent.id}" id="${this.id}" style="position: fixed; background-color: ${this.color}; height: ${this.size}px; width: ${this.size}px; border-radius: ${this.size}px; transform: translate(${this.x}px, ${this.y}px);"> </div>`;
        document.getElementById("screen").innerHTML += html;
    }

    update() {

        //calculate "bond" forces from surrounding points
        //find difference in distances from points 1 and 2
        let xDist = (this.point1.x - this.x) + (this.point2.x - this.x);
        let yDist = (this.point1.y - this.y) + (this.point2.y - this.y);
        //set x and y accelerations
        this.xAcc = xDist * ke;
        this.yAcc = yDist * ke;

        //gravity
        if (document.getElementById("gravity").checked)
            this.yAcc += gravity;

        ////add forces from pressure inside in the direction opposing the center point
        ////3D: PV = nRT => PV = k => (F/A)*V = k => F = Ak/V
        ////2D: (F/x)*A = k => a = kx/A
        ////where... a = acceleration, k = constant, x = perimeter, a = area
        //let acc = kp * this.shapePerimeter / this.shapeArea;
        //let hyp = Math.sqrt(Math.pow((this.centerPoint.x - this.x), 2) + Math.pow((this.centerPoint.y - this.y), 2));
        //this.xAcc -= (this.centerPoint.x - this.x) / hyp * acc;
        //this.yAcc -= (this.centerPoint.y - this.y) / hyp * acc;

        //forces from inside, version 2
        let acc = kp * (this.parent.calculateArea() - this.parent.originalArea) / this.parent.originalArea;
        //acc *= Math.abs(acc);
        let hyp = Math.sqrt(Math.pow((this.centerPoint.x - this.x), 2) + Math.pow((this.centerPoint.y - this.y), 2));
        this.xAcc += (this.centerPoint.x - this.x) / hyp * acc;
        this.yAcc += (this.centerPoint.y - this.y) / hyp * acc;


   
        //update all velocity and position values
        this.yVel += this.yAcc;
        this.xVel += this.xAcc;
        //max speed
        let speed = Math.sqrt(Math.pow(this.yVel, 2) + Math.pow(this.xVel, 2));
        if (speed > maxSpeed) {
            this.yVel = this.yVel / speed * maxSpeed;
            this.xVel = this.xVel / speed * maxSpeed;
        }
        this.y += this.yVel;
        this.x += this.xVel;

        if (collide) {
            //barriers
            if (this.x > maxX) {
                this.x = maxX;
                //this.xVel = 0;
            }
            else if (this.x < 0) {
                this.x = 0;
                //this.xVel = 0;
            }

            if (this.y > maxY) {
                this.y = maxY;
                //this.yVel = 0;
            }
            else if (this.y < 0) {
                this.y = 0;
                //this.yVel = 0;
            }
        }
        this.display();
    }

    display() {
        //update display
        document.getElementById(this.id).style.transform = `translate(${this.x}px, ${this.y}px)`;
    }

    changeColor(color) {
        this.color = color;
        document.getElementById(this.id).style.background = this.color;
    }

}
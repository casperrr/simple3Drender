const canvas = document.getElementById("canvas");
const c = canvas.getContext('2d');

// Globals
const pi = Math.PI;

let cube;
let hypercube;
let render;
let render4D;

let projecTo3D;



function init(){
    c.translate(canvas.width/2,canvas.height/2);
    //cube = new Cube();
    hypercube = new Cube4D();
    hypercube.makeCube();
    render = new Render3D(false,4);
    render4D = new Render4D(false,2.5);
    projecTo3D = new Cube();
    //cube.makeCube();

}

function bg(){
    c.fillStyle = '#000000';
    c.fillRect(canvas.width*-0.5,canvas.height*-0.5,canvas.width,canvas.height);
}

function loop(){
    bg();

    //render.drawShape(cube);
    hypercube.makeCube();
    render4D.draw4D(hypercube);

    // hypercube.xrot += 0.001;
    // hypercube.xrot = pi/2;
    // hypercube.yrot = -90;
    hypercube.zrot += 0.001;
    hypercube.wrot += 0.003;
    //projecTo3D.yrot += 0.003;
    //cube.xrot += 0.01;
    //cube.yrot += 0.01;

    requestAnimationFrame(loop);
}


function make2D(rows,cols){
    let arr = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
    return arr;
}

class Matrix{
    constructor(rows, cols){
        this.mat = make2D(rows,cols);
    }

    dotProd(matrix){
        let newMat = new Matrix(matrix.length,this.mat[0].length);
        for(let i = 0; i < matrix.length; i++){
            let sum = 0;
            for(let j = 0; j < this.mat.length; j++){
                sum += matrix[i][j] * this.mat[j][0];
            }
            newMat.mat[i][0] = sum;
        }
        return newMat;
    }

    scalar(scl){
        for(let i = 0; i < this.mat.length; i++){
            for(let j = 0; j < this.mat[0].length; j++){
                this.mat[i][j] *= scl;
            }
        }
    }
}

class Cube{
    constructor(){
        this.points = [];
        this.xrot = 0;
        this.yrot = 0;
        this.zrot = 0;
        this.scl = 400;
        //this.pos = ima not worry about this for now. 
    }

    makeCube(){
        let arr = [];
        for(let i = 0; i < 8; i++){
            arr.push(new Matrix(3,1));
            arr[i].mat = [
                [(i&1) == 0 ? -1 : 1],
                [(i&2) == 0 ? -1 : 1],
                [(i&4) == 0 ? -1 : 1]];
        }
        this.points = arr;
    }
}
class Cube4D{
    constructor(){
        this.points = [];
        this.xrot = 0;
        this.yrot = 0;
        this.zrot = 0;
        this.wrot = 0;
        this.scl = 300;
        //this.pos = ima not worry about this for now. 
    }

    makeCube(){
        let arr = [];
        for(let i = 0; i < 16; i++){
            arr.push(new Matrix(4,1));
            arr[i].mat = [
                [(i&1) == 0 ? -1 : 1],
                [(i&2) == 0 ? -1 : 1],
                [(i&4) == 0 ? -1 : 1],
                [(i&8) == 0 ? -1 : 1]];
        }
        this.points = arr;
    }
}


class Render4D{
    //Renders 4D to 3D
    constructor(ortho,distance){
        this.ortho = ortho;
        this.distance = distance;
        
    }

    draw4D(shape){
        let rotatedShape = shape.points;
        //Rotate shape.
        rotatedShape = this.#rotX(shape.xrot,rotatedShape);
        rotatedShape = this.#rotY(shape.yrot,rotatedShape);
        rotatedShape = this.#rotZ(shape.zrot,rotatedShape);
        rotatedShape = this.#rotZW(shape.wrot,rotatedShape);
        //Project shape to 3D
        let projectedShape = this.#projectShape(rotatedShape);
        //Send 3D projection to 3D render.
        projecTo3D.points = projectedShape;
        render.drawShape(projecTo3D);

    }

    #projectShape(shape){
        let projShape = shape;
        projShape.forEach((mat,i)=>{
            let x=this.#projectPoint(mat);
            projShape[i] = x;
        });
        return projShape;
    }

    #projectPoint(point){
        let w;
        this.ortho ? w=1:w = 1/(this.distance-point.mat[3]);
        let projMat = [
            [w,0,0,0],
            [0,w,0,0],
            [0,0,w,0]
        ];
        return point.dotProd(projMat);
    }

    #applyRotMat(matrix,arr){
        let newArr = [];
        for(let i = 0; i < arr.length; i++){
            newArr[i] = arr[i].dotProd(matrix);
        }
        return newArr;
    } 

    #rotX(ang,arr){
        let rXmat = [
            [1,0,0,0],
            [0,Math.cos(ang),-Math.sin(ang),0],
            [0,Math.sin(ang),Math.cos(ang),0],
            [0,0,0,1]
        ];
        return this.#applyRotMat(rXmat,arr);
    }
    
    #rotY(ang,arr){
        let rYmat = [
            [Math.cos(ang),0,Math.sin(ang),0],
            [0,1,0,0],
            [-Math.sin(ang),0,Math.cos(ang),0],
            [0,0,0,1]
        ];
        return this.#applyRotMat(rYmat,arr);
    }
    
    #rotZ(ang,arr){
        let rZmat = [
            [Math.cos(ang),-Math.sin(ang),0,0],
            [Math.sin(ang),Math.cos(ang),0,0],
            [0,0,1,0],
            [0,0,0,1]
        ];
        return this.#applyRotMat(rZmat,arr);
    }

    #rotXW(ang,arr){
        let rWmat = [
            [Math.cos(ang),0,0,-Math.sin(ang)],
            [0,1,0,0],
            [0,0,1,0],
            [Math.sin(ang),0,0,Math.cos(ang)]
        ];
        return this.#applyRotMat(rWmat,arr);
    }

    #rotZW(ang,arr){
        let rWmat = [
            [1,0,0,0],
            [0,1,0,0],
            [0,0,Math.cos(ang),-Math.sin(ang)],
            [0,0,Math.sin(ang),Math.cos(ang)]
        ];
        return this.#applyRotMat(rWmat,arr);
    }
}

class Render3D{
    constructor(ortho,distance){
        this.ortho = ortho;
        this.distance = distance;
        this.pointSize = 3;
        this.drawColors = true;
    }


    drawShape(shape){
        let rotatedShape = shape.points;
        //Rotate shape.
        rotatedShape = this.#rotX(-pi/2,rotatedShape);
        rotatedShape = this.#rotY(shape.yrot,rotatedShape);
        rotatedShape = this.#rotZ(shape.zrot,rotatedShape);
        //Project shape.
        let projectedShape = this.#projectShape(rotatedShape);
        //Scale shape.
        projectedShape.forEach(i => i.scalar(shape.scl));
        //Draw shape.
        //this.#drawPoints(projectedShape);
        this.#connectPointsHypercube(projectedShape);
    }

    #connectPointsCube(shape){
        let order = [0,1,3,2]
        for(let i = 0; i < 4; i++){
            this.#connectPoints(shape[order[i]],shape[order[(i+1)%4]]);
            this.#connectPoints(shape[order[i]+4],shape[order[(i+1)%4]+4]);
            this.#connectPoints(shape[i],shape[i+4]);
        }
    }
    
    #connectPointsHypercube(shape){
        let order = [0,1,3,2]
        for(let i = 0; i < 4; i++){
            //inner cube
            this.#connectPoints(shape[order[i]],shape[order[(i+1)%4]],'#ff00aa');
            this.#connectPoints(shape[order[i]+4],shape[order[(i+1)%4]+4],'#ff00aa');
            this.#connectPoints(shape[i],shape[i+4],'#ff00aa');
            //outer cube
            this.#connectPoints(shape[order[i]+8],shape[order[(i+1)%4]+8],'#4477ff');
            this.#connectPoints(shape[order[i]+8+4],shape[order[(i+1)%4]+8+4],'#4477ff');
            this.#connectPoints(shape[i+8],shape[i+8+4],'#4477ff');
            //connect inner to outer
            this.#connectPoints(shape[i],shape[i+8],'#22fe88');
            this.#connectPoints(shape[i+4],shape[i+8+4],'#22fe88');
        }

    }

    #connectPoints(a,b,col){
        if(col === undefined || !this.drawColors){
            c.strokeStyle = '#ffffff';
        } else{
            c.strokeStyle = col;
        }
            
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(a.mat[0],a.mat[1]);
        c.lineTo(b.mat[0],b.mat[1]);
        c.stroke();
    }

    #drawPoints(shape){
        shape.forEach((i)=>{
                let x = i.mat[0];
                let y = i.mat[1];
                let r = this.pointSize;
                c.fillStyle = '#ffffff';
                c.beginPath();
                c.arc(x,y,r,0,2*Math.PI);
                c.fill();
                c.closePath();
        });
    }

    #projectShape(shape){
        let projShape = shape;
        projShape.forEach((mat,i)=>{
            let x=this.#projectPoint(mat);
            projShape[i] = x;
        });
        return projShape;
    }

    #projectPoint(point){
        let z;
        this.ortho ? z=1:z = 1/(this.distance-point.mat[2]);
        let projMat = [
            [z,0,0],
            [0,z,0]
        ];
        return point.dotProd(projMat);
    }


    #applyRotMat(matrix,arr){
        let newArr = [];
        for(let i = 0; i < arr.length; i++){
            newArr[i] = arr[i].dotProd(matrix);
        }
        return newArr;
    } 

    #rotX(ang,arr){
        let rXmat = [
            [1,0,0],
            [0,Math.cos(ang),-Math.sin(ang)],
            [0,Math.sin(ang),Math.cos(ang)]
        ];
        return this.#applyRotMat(rXmat,arr);
    }
    
    #rotY(ang,arr){
        let rYmat = [
            [Math.cos(ang),0,Math.sin(ang)],
            [0,1,0],
            [-Math.sin(ang),0,Math.cos(ang)]
        ];
        return this.#applyRotMat(rYmat,arr);
    }
    
    #rotZ(ang,arr){
        let rZmat = [
            [Math.cos(ang),-Math.sin(ang),0],
            [Math.sin(ang),Math.cos(ang),0],
            [0,0,1]
        ];
        return this.#applyRotMat(rZmat,arr);
    }


    
}

init();
loop();
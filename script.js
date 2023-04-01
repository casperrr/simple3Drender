const canvas = document.getElementById("canvas");
const c = canvas.getContext('2d');

// Globals
let cube;
let render;



function init(){
    c.translate(canvas.width/2,canvas.height/2);
    cube = new Cube();
    render = new Render3D(false,4);
    cube.makeCube();
}

function bg(){
    c.fillStyle = '#000000';
    c.fillRect(canvas.width*-0.5,canvas.height*-0.5,canvas.width,canvas.height);
}

function loop(){
    bg();

    render.drawShape(cube);

    //cube.xrot += 0.01;
    cube.yrot += 0.01;

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
        this.scl = 300;
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




class Render3D{
    constructor(ortho,distance){
        this.ortho = ortho;
        this.distance = distance;
        this.pointSize = 3;
    }


    drawShape(shape){
        let rotatedShape = shape.points;
        //Rotate shape.
        rotatedShape = this.#rotX(shape.xrot,rotatedShape);
        rotatedShape = this.#rotY(shape.yrot,rotatedShape);
        rotatedShape = this.#rotZ(shape.zrot,rotatedShape);
        //Project shape.
        let projectedShape = this.#projectShape(rotatedShape);
        //Scale shape.
        projectedShape.forEach(i => i.scalar(shape.scl));
        //Draw shape.
        this.#drawPoints(projectedShape);
        this.#connectPointsCube(projectedShape);
    }

    #connectPointsCube(shape){
        let order = [0,1,3,2]
        for(let i = 0; i < 4; i++){
            this.#connectPoints(shape[order[i]],shape[order[(i+1)%4]]);
            this.#connectPoints(shape[order[i]+4],shape[order[(i+1)%4]+4]);
            this.#connectPoints(shape[i],shape[i+4]);
        }
    }

    #connectPoints(a,b){
        c.strokeStyle = '#ffffff';
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
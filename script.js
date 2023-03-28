const canvas = document.getElementById("canvas");
const c = canvas.getContext('2d');

// Globals
let points = [];
let angle = 0;
let scale = 300; //tip: when using perspective use distance*100
let distance = 3;

//Matrixes:
let orthoProjMat = [
    [1,0,0],
    [0,1,0]
];

function usePerspective(matrix,z){
    for(let i = 0; i < matrix.length; i++){
        for(let j = 0; j < matrix[0].length; j++){
            matrix[i][j] != 0 ? matrix[i][j] = z : matrix[i][j] = 0;
        }
    }
}


function init(){
    c.translate(canvas.width/2,canvas.height/2);
    points = makeCube();
}

function bg(){
    c.fillStyle = '#000000';
    c.fillRect(canvas.width*-0.5,canvas.height*-0.5,canvas.width,canvas.height);
}

function loop(){
    bg();

    let rotArr = points;
    rotArr = rotX(angle,rotArr);
    rotArr = rotY(angle,rotArr);
    rotArr = rotZ(angle,rotArr);


    arr = aplyMat(orthoProjMat,rotArr);
    arr.forEach(i => i.scalar(scale)); //Scale Points Up
    //draw(arr);
    conCube(arr);

    angle += 0.01;
    requestAnimationFrame(loop);
}

function draw(arr){
    for(let i = 0; i < points.length;i++){
        drawPoint(arr[i].mat[0][0],arr[i].mat[1][0],5);
        
    }
}


function drawPoint(x,y,r){
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(x,y,r,0,2*Math.PI);
    c.fill();
    c.closePath();
}

function conCube(arr){
    //Only works for cube!
    let order = [0,1,3,2]
    for(let i = 0; i < 4; i++){
        connectPnts(arr,arr[order[i]],arr[order[(i+1)%4]]);
        connectPnts(arr,arr[order[i]+4],arr[order[(i+1)%4]+4]);
        connectPnts(arr,arr[i],arr[i+4]);
    }
}

function connectPnts(arr,a,b){
    c.strokeStyle = '#ffffff';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(a.mat[0],a.mat[1]);
    c.lineTo(b.mat[0],b.mat[1]);
    c.stroke();
}

function make2D(rows,cols){
    let arr = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
    return arr;
}

function makeCube(){
    let arr = [];
    for(let i = 0; i < 8; i++){
        arr.push(new Matrix(3,1));
        arr[i].mat = [
            [(i&1) == 0 ? -1 : 1],
            [(i&2) == 0 ? -1 : 1],
            [(i&4) == 0 ? -1 : 1]];
    }
    return arr;
}

function aplyMat(matrix, arr){
    let newArr = [];
    for(let i = 0; i < arr.length; i++){
        let z = 1/(distance-arr[i].mat[2]);
        usePerspective(matrix,z)
        newArr[i] = arr[i].dotProd(matrix);
    }
    return newArr;
}

function rotX(ang,arr){
    let rXmat = [
        [1,0,0],
        [0,Math.cos(ang),-Math.sin(ang)],
        [0,Math.sin(ang),Math.cos(ang)]
    ];
    return applyRotMat(rXmat,arr);
}

function rotY(ang,arr){
    let rYmat = [
        [Math.cos(ang),0,Math.sin(ang)],
        [0,1,0],
        [-Math.sin(ang),0,Math.cos(ang)]
    ];
    return applyRotMat(rYmat,arr);
}

function rotZ(ang,arr){
    let rZmat = [
        [Math.cos(ang),-Math.sin(ang),0],
        [Math.sin(ang),Math.cos(ang),0],
        [0,0,1]
    ];
    return applyRotMat(rZmat,arr);
}


function applyRotMat(matrix,arr){
    let newArr = [];
    for(let i = 0; i < arr.length; i++){
        newArr[i] = arr[i].dotProd(matrix);
    }
    return newArr;
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

init();
loop();
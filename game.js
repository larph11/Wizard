const socket = io();
let room = location.hash.substring(1);
if(!room){
    room=Math.random().toString(36).substring(2,7);
    location.hash=room;
}

socket.emit("joinRoom", room);

let playerWizard=null;
let currentSkill=null;
let board=document.getElementById("board");
let log=document.getElementById("log");
let tiles=[];
let state=null;

function pick(type){
    playerWizard=type;
    document.getElementById("select").style.display="none";
    document.getElementById("game").style.display="block";
    createBoard();
}

function createBoard(){
    board.innerHTML="";
    tiles=[];
    for(let y=0;y<8;y++){
        for(let x=0;x<8;x++){
            let t=document.createElement("div");
            t.className="tile";
            t.dataset.x=x;
            t.dataset.y=y;
            t.onclick=()=>clickTile(x,y);
            board.appendChild(t);
            tiles.push(t);
        }
    }
}

function clickTile(x,y){
    if(!currentSkill) return;

    if(currentSkill==='fake'){
        log.innerText="Fake cast! Mind game activated.";
        socket.emit("action",{room:room,type:"fake"});
        currentSkill=null;
        return;
    }

    animateSpell(x,y);
    // Example: always target opponent for demo
    let target = 1; // opponent index
    let damage=0;
    if(currentSkill==='spear') damage=100;
    else if(currentSkill==='rook'||currentSkill==='bishop') damage=35;
    else if(currentSkill==='queen') damage=15;

    socket.emit("action",{room:room,type:"damage",target:target,amount:damage});
    currentSkill=null;
}

function skill(s){currentSkill=s;}

function animateSpell(x,y){
    let tile=[...document.querySelectorAll(".tile")].find(t=>t.dataset.x==x && t.dataset.y==y);
    let proj=document.createElement("div");
    proj.className="projectile";
    proj.style.background="yellow";
    tile.appendChild(proj);
    setTimeout(()=>proj.remove(),500);
}

// Socket handlers
socket.on("startGame", s=>{
    state=s;
    render();
});

socket.on("update", s=>{
    state=s;
    render();
});

function render(){
    tiles.forEach(t=>t.innerHTML="");
    // Place wizards
    const w1=tiles.find(t=>t.dataset.x==state.pos[0][0] && t.dataset.y==state.pos[0][1]);
    const w2=tiles.find(t=>t.dataset.x==state.pos[1][0] && t.dataset.y==state.pos[1][1]);
    w1.innerHTML="<img src='assets/fire.png' width='50'>";
    w2.innerHTML="<img src='assets/water.png' width='50'>";
    // HP bars
    document.getElementById("hp1").style.width=state.hp[0]+"%";
    document.getElementById("hp2").style.width=state.hp[1]+"%";
}
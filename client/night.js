let sound1 = document.getElementById("sewk");
let sound2 = document.getElementById("skwp");
let sound3 = document.getElementById("spwe");
let turnOnFrontend = 'starting';

sound1.play();

async function checkTurn (){
	let response = await fetch('http://' + location.host + '/turncheck');
    let turn = await response.json();
    console.log(turnOnFrontend);
    console.log(turn.currentTurn);
    if (turnOnFrontend != turn.currentTurn){
        turnOnFrontend = turn.currentTurn;
        if (turnOnFrontend == "Rendőr"){
            sound1.pause();
            sound2.play();
        }
        if (turnOnFrontend == "gameMaster"){
            sound2.pause();
            sound3.play();
        }
    }
    setTimeout(checkTurn, 1000);
};

setTimeout(checkTurn, 1000);
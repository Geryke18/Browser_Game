let myName;
let myRole;
let selectlist;
let amIAlive;
let turnOnFrontend = myRole;

let showRoleBtn = document.getElementById("showRole");
let roleText = document.getElementById("role");

function hide (){
	roleText.classList.remove("visible");
};

async function getRole() {
    let response = await fetch('http://' + location.host + '/database');
    let myDatas = await response.json();
    console.log(myDatas.jsonData.role);
    myName = myDatas.jsonData.name
    myRole = myDatas.jsonData.role;
    amIAlive = myDatas.jsonData.isAlive;
    roleText.textContent = myRole;
};
getRole();

function shouldISelect(){
    console.log(myRole);
    console.log(turnOnFrontend);
    if (myRole == turnOnFrontend){
        players.innerHTML = selectlist;
        
        let selected = document.getElementById("selected");
        let toKill = document.getElementById("toKill");
        if(myRole == "Gyilkos"){
            if(amIAlive == true){
                selected.onclick = async function kill() {
                    let response = await fetch('http://' + location.host + '/kill', {
                        method: 'POST',
                        body: toKill.value,
                        headers: {'Content-Type': ' text/plain'}
                    });
                    let sameVictim = await response.json();
                    console.log(sameVictim);
                    if (sameVictim.checkResult == true){
                        alert(toKill.value + " reggelre halott lesz");
                        players.innerHTML = "";
                    }else{
                        alert("Különböző szavazatot adtatok");
                    }
                }
            }else{
                players.innerHTML = "Sajnos halott vagy";
            }
        };
    
        if(myRole == "Rendőr"){
            if(amIAlive == true){
                selected.onclick = async function askRole() {
                    let response = await fetch('http://' + location.host + '/askRole', {
                        method: 'POST',
                        body: toKill.value,
                        headers: {'Content-Type': ' text/plain'}
                    });
                    let isKiller = await response.json();
                    console.log(isKiller);
                    if (isKiller.checkResult == true){
                        alert("Igen, ő gyilkos");
                    }else{
                        alert("Nem, ő nem gyilkos");
                    }
                    players.innerHTML = "";
                }
            }else{
                players.innerHTML = "Sajnos halott vagy";
                setTimeout(nextTurn, 9000);
                async function nextTurn() {
                    let response = await fetch('http://' + location.host + '/askRole', {
                        method: 'POST',
                        body: "",
                        headers: {'Content-Type': ' text/plain'}
                    });
                    players.innerHTML = "";
                }
            }
        };
    }else {
        players.innerHTML = "";
    };
}

showRoleBtn.onclick = async function showRole() {
    let response = await fetch('http://' + location.host + '/database');
    let myDatas = await response.json();
    myRole = myDatas.jsonData.role;
    roleText.textContent = myRole;
    amIAlive = myDatas.jsonData.isAlive;
    roleText.classList.add("visible");
    setTimeout(hide, 1000);
};

let players = document.getElementById("players2");

async function checkTurn (){
	let response = await fetch('http://' + location.host + '/turncheck');
    let turn = await response.json();
    getRole();
    selectlist = 'Válassz az élő játékosok közül!<br><select name="toKill" id="toKill">';
    for (var i=0 ; i < turn.usersAlive.length ; i++){
        if (myName != turn.usersAlive[i] && myRole != "Orvos"){
            selectlist = selectlist + '<option>' + turn.usersAlive[i] + '</option>';
        }
    }
    selectlist = selectlist + "</select><br><br><a class='pointer' id='selected'>Kiválasztom</a><br>";
    console.log(turnOnFrontend);
    if (turnOnFrontend != turn.currentTurn){
        turnOnFrontend = turn.currentTurn;
        shouldISelect();
    }


    setTimeout(checkTurn, 1000);
};

setTimeout(checkTurn, 1000);

// a fenti a GET ez meg a POST
// const userAction = async () => {
//     const response = await fetch('http://example.com/movies.json', {
//       method: 'POST',
//       body: myBody, // string or object
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     });
//     const myJson = await response.json(); //extract JSON from the http response
//     // do something with myJson
//     }

if (document.getElementById("hideButton") != null){
    let hideBtn = document.getElementById("hideButton");
    hideBtn.onclick = function hideHelp() {
        fetch('http://' + location.host + '/hidehelp');
        location.reload();
    };
};

let regBtn = document.getElementById("regButton");
let inputField = document.getElementById("player");

regBtn.onclick = async function registration() {
    let pattern1 = /^ *$/;
    let pattern2 = /^Erről/;
    if (pattern1.test(inputField.value)){
        alert("Nem megfelelő név.\nPróbáld másik névvel!"); 
    }else{
        let response = await fetch('http://' + location.host + '/reg', {
            method: 'POST',
            body: inputField.value,
            headers: {'Content-Type': ' text/plain'}
        });
        let myJson = await response.json();
        console.log(myJson);
        if (myJson.checkResult != true){
            alert(myJson.checkResult);
            if (pattern2.test(myJson.checkResult)){
                window.location.href = 'http://' + location.host + '/userpage';
            }
        }else{
            window.location.href = 'http://' + location.host + '/userpage'; 
        };
    };
};

let players = document.getElementById("players");

async function checkUsers (){
	let response = await fetch('http://' + location.host + '/userscheck');
    var myJson = await response.json();
    var userlist = 'Játékosok:';
    for (var i=0 ; i < myJson.users.length ; i++){
      var isDead = '';
      if (!myJson.users[i].isAlive){
        isDead = ' <b style="color: red">X</b>'
      }
      userlist = userlist + "<br>" +myJson.users[i].name + isDead;
    }
    players.innerHTML = userlist;
    setTimeout(checkUsers, 1500);
};
setTimeout(checkUsers, 1000);

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
//   }
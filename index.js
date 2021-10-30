const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const ip = require("ip");
const os = require("os");

const serverIP = ip.address()
const serverHostName = os.hostname();

app.use(express.static(__dirname + '/client'));
app.use(bodyParser.text());

class User {
  constructor(name, ipAddress){
    this.name = name;
    this.ipAddress = ipAddress;
    this.isAlive= true;
    this.role = 'Polgár';  // ezt majd erre visszairni: '¯\\_(ツ)_/¯'
    this.targetUser = "";
  }
};

function whichIP (currentIP){
  for (var i=0 ; i < users.length ; i++){
    if (users[i].ipAddress == currentIP) {
      return i;
    }
  }
}

let users = [];
let userNames = [];
let userIPs = [];
let whosTurn = 'starting';
let usersAlive = [];
let whoToKill;
let whoToSave;


let htmlStart = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0"><title>Gyilkosos</title><link href="style.css" rel="stylesheet"><script src="/socket.io/socket.io.js"></script><script>var socket = io();</script></head><body><br>';
let htmlEnd = '</body></html>';
let registrationHtml = '<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><div id="regDiv"><form><label class="glow1" for="player">Új játékos neve:</label><br><input type="text" id="player" name="player"><br><br><input id="regButton" type="submit" value="Regisztrálok"></form></div><br><br>';
let roleRoll = "<div id='container1'><div id='buttons'><a href='roles'>Szerepek sorsolása</a> ";
let hanging = "";
let reset = "<br><br><br><br><a href='reset'>Újrakezdés</a></div>";
let helpText = "<div id='help'>A telefonotok böngészőjének kereső mezőjébe írjátok be hogy: <b>" + serverIP + ":3000</b><br>A szervergép neve: " + serverHostName + "<br><br><a class='pointer' id='hideButton'>Elrejt</a></div>";
let sleepEverybodyWakeUpKiller = "<audio id='sewk'><source src='sound1.mp3' /></audio>";
let sleepKillerWakeUpPolice = "<audio id='skwp'><source src='sound2.mp3' /></audio>";
let sleepPoliceWakeUpEverybody = "<audio id='spwe'><source src='sound3.mp3' /></audio>";

// ezt a for-t is majd torolni kell
for (var i=1 ; i < 2 ; i++){
  users.push(new User("user"+i, "xyz123"))
  userNames.push("user"+i);
}

for (var i=0 ; i < users.length ; i++){
  if (users[i].isAlive){
    usersAlive.push(users[i].name);
  }
}

function checkCityWon(){
  let cityWon = false;

  if (users.length > 0){
    if (users[0].role != 'Polgár'){  // ezt 'Polgár' majd erre visszairni: '¯\\_(ツ)_/¯'
      cityWon = true;
      for (var i=0 ; i < users.length ; i++){
        if (users[i].role == "Gyilkos" && users[i].isAlive == true){
          cityWon = false;
        }
      }
    }
  }
  return cityWon;
}

function checkKillersWon(){
  let killersWon = false;
  usersAlive = [];
  for (var i=0 ; i < users.length ; i++){
    if (users[i].isAlive){
      usersAlive.push(users[i].name);
    }
  } 
  if (users.length > 0){
    let killersAlive = 0;
    for (var i=0 ; i < users.length ; i++){
      if (users[i].role == "Gyilkos" && users[i].isAlive == true){
        killersAlive = killersAlive + 1;
      }
    }
    if (usersAlive.length <= killersAlive){
      killersWon = true;
    }
  }
  // console.log(killersWon + ' ha ez igaz akkor nyertek a gyilkosok');
  return killersWon;
}

app.get('/', (req, res) => {
  if (whoToSave != whoToKill){
    console.log("Who to kill: " + whoToKill);
    for (var i=0 ; i < users.length ; i++){
      if (users[i].name == whoToKill){
        users[i].isAlive = false;
      }
    }
  }
  res.write(htmlStart);
  if (checkCityWon()){
    res.write("<h1 class='mobile'>Nyert a Város!</h1>");
    res.write(reset);
  }else if (checkKillersWon()){
    res.write("<h1 class='mobile'>Nyertek a Gyilkosok!</h1>");
    res.write(reset);
  } else {
    res.write("<h2 class='glow1'>Gyilkosos játék</h2><br>");
    res.write(helpText);
    res.write(roleRoll + hanging);
    res.write(reset);
    res.write('<div id="players">Játékosok:');
    res.write("</div></div>");
    res.write(registrationHtml);
    res.write("<script src='home.js'></script>");
  }

  res.write(htmlEnd);
  console.log(users);
  return res.end();
});


app.post('/reg', (req, res) => {
  if (userIPs.includes(req.ip)){
    var userIndex = whichIP(req.ip);
    var toFrontEnd = "Erről az eszközről már csatlakoztál a játékhoz " + users[userIndex].name + " névvel.";
    res.json({'checkResult': toFrontEnd});
    return res.end();
  }else if(roleRoll != "<div id='container1'><div id='buttons'><a href='roles'>Szerepek sorsolása</a> "){
    var toFrontEnd = 'Már megtörtént a sorsolás.\nKérj újrakezdést a játékmestertől!';
    res.json({'checkResult': toFrontEnd});
    return res.end();
  }else if (userNames.includes(req.body)){
    var toFrontEnd = "A név már foglalt.\nPróbáld másik névvel!";
    res.json({'checkResult': toFrontEnd});
    return res.end();
  }else{
    users.push(new User(req.body, req.ip));
    userNames.push(req.body);
    usersAlive.push(req.body);
    userIPs.push(req.ip);
    var toFrontEnd = true;
    res.json({'checkResult': toFrontEnd});
    return res.end();
  }
});

app.get('/userpage', (req, res) => {
  var userIndex = whichIP(req.ip);
  if (typeof userIndex !== 'undefined'){
    res.write(htmlStart);
    res.write("<div class='mobile'>Szia " + users[userIndex].name + "!<br><br>");
    res.write("<br><a class='pointer' id='showRole'>Mutasd meg a szerepem!</a><br><br><div id='role'></div></div>");
    res.write("<br><div class='mobile' id='players2'></div>");
    res.write("<script src='userpage.js'></script>");
    res.write(htmlEnd);
    return res.end();
  }else{
    res.write(htmlStart);
    res.write("<div class='mobile'>Még nem regisztráltál a játékba</div>");
    res.write(htmlEnd);
    
  }
});

app.get('/database', (req, res) => {
  var userIndex = whichIP(req.ip);
  var toFrontEnd = users[userIndex];
  res.json({'jsonData': toFrontEnd});
  console.log(toFrontEnd);
  return res.end();
});

app.get('/turncheck', (req, res) => {
  usersAlive = [];
  for (var i=0 ; i < users.length ; i++){
    if (users[i].isAlive){
      usersAlive.push(users[i].name);
    }
  } 
  res.json({'currentTurn': whosTurn, 'usersAlive': usersAlive});
  return res.end();
});

app.post('/askRole', (req, res) => {
  for (var i=0 ; i < users.length ; i++){
    if (users[i].name == req.body){
      if(users[i].role == "Gyilkos"){
        toFrontEnd = true;
      }else{
        toFrontEnd = false;
      }
    }
  }
  res.json({'checkResult': toFrontEnd});
  whosTurn = 'gameMaster';
  return res.end();
});

app.post('/kill', (req, res) => {
  whoToKill = req.body
//  if ("Mind2 gyilkos ugyanazt választotta"){
  toFrontEnd = true;
//}
  res.json({'checkResult': toFrontEnd});
  whosTurn = actionRoles[1];
  return res.end();
});

app.post('/hang', (req, res) => {
  hanging = "";
  for (var i=0 ; i < users.length ; i++){
    if (users[i].name == req.body){
      users[i].isAlive = false;
    }
  }
  return res.end();
});

app.get('/userscheck', (req, res) => {
  res.json({'users': users});
  return res.end();
});

app.get('/hidehelp', (req, res) => {
  helpText = "";
});

let roleList = ["Gyilkos", "Rendőr", "Gyilkos", "Polgár", "Gyilkos", "Orvos", "Csonkoló", "Igor", "Bolond", "Polgár", "Polgár", "Polgár", "Polgár"] // 2. gyilkost polgárra majd árírni
let actionRoles = ["Gyilkos", "Rendőr", "Orvos", "Csonkoló"];
function addRoles (){
  let actualRoleList = roleList;
  while (users.length-1 != actualRoleList.length){  // a "-1"-et kitorolni
    actualRoleList.pop();
  }
  console.log(actualRoleList);
  for (var i=1 ; i < users.length ; i++){   // 1-et nullara atirni
    var randInt = Math.floor(Math.random() * actualRoleList.length);
    users[i].role = actualRoleList[randInt];
    actualRoleList[randInt] ="z";
    actualRoleList.sort();
    actualRoleList.pop();
  }
}


app.get('/roles', (req, res) => {
  if (userNames.length < 2){        // ezt majd atirni 4-re
    res.write(htmlStart);
    res.write("Nincs elég játékos.<br>");
    res.write("<br><br><a href='/'>Vissza</a>");
    res.write(htmlEnd);
    return res.end();
  }else{
    addRoles();
    roleRoll = "<div id='container1'><div id='buttons'><a class='pointer' href='/night' id='sleep'>Aludjon a város</a> ";
    res.write(htmlStart);
    res.write("Szerepek kiosztva.<br>Nézzétek meg a játékosotok oldalán!<br>Közeleg az éjszaka...<br><br>");
    res.write("<form class='pointer' action='/night' method='get' id='roleRoll'><input type='submit' value='Aludjon a város!'></form>");
    res.write(htmlEnd);
    return res.end();
  }
});


app.get('/night', (req, res) => {
  hanging = " <a href='hanging_page'>Akasztás</a>";
  whosTurn = actionRoles[0];
  res.write(htmlStart);
  res.write("Mindenki csukja be a szemét!<br><br>");
  res.write("<form class='pointer' action='/' method='get' id='sleep'><input type='submit' value='Ébredjen a város!'></form>");
  res.write(sleepEverybodyWakeUpKiller);
  res.write(sleepKillerWakeUpPolice);
  res.write(sleepPoliceWakeUpEverybody);
  res.write("<script src='night.js'></script>");
  res.write(htmlEnd);
  return res.end();
});

function doReset (){
  roleRoll = "<div id='container1'><div id='buttons'><a href='roles'>Szerepek sorsolása</a> ";
  users = [];
  userNames = [];
  userIPs = [];
  whoToKill = "";
  whosTurn = 'starting';
  hanging = "";
};

app.get('/reset', (req, res) => {
  doReset();
  res.write(htmlStart);
  res.write("Az adatbázis törölve lett");
  res.write("<br><br><a href='/'>Vissza</a>");
  res.write(htmlEnd);
  return res.end();
});

app.get('/hanging_page', (req, res) => {
  usersAlive = [];
  for (var i=0 ; i < users.length ; i++){
    if (users[i].isAlive){
      usersAlive.push(users[i].name);
    }
  } 
  selectlist = 'Kit akartok felakasztani?<br><select name="toHang" id="toHang">';
  for (var i=0 ; i < usersAlive.length ; i++){
      selectlist = selectlist + '<option>' + usersAlive[i] + '</option>';
  }
  selectlist = selectlist + "</select><br><br><a class='pointer' id='selected'>Kiválasztom</a><br>";
  res.write(htmlStart);
  res.write(selectlist);
  res.write("<script src='hang.js'></script>");
  res.write(htmlEnd);
  return res.end();
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

http.listen(3000, () => {
  console.log('listening on http://' + serverIP + ':3000');
});

// Szirén

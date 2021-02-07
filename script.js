'use strict'

function AudioController() {
  let self=this;
  self.bgMusic = new Audio("Content/Audio/cosmictheme"+(Math.floor(Math.random() * 7 + 1))+".mp3");
  self.flipSound = new Audio("Content/Audio/flip.mp3");
  self.matchSound = new Audio("Content/Audio/match.mp3");
  self.victorySound = new Audio("Content/Audio/victory.mp3");
  self.gameOverSound = new Audio("Content/Audio/gameover.mp3");
  self.clickSound = new Audio("Content/Audio/click.mp3");
  self.bgMusic.volume = 0.1;
  self.flipSound.volume = 0.2;
  self.victorySound.volume = 0.3;
  self.gameOverSound.volume = 0.2;
  self.matchSound.volume = 0.5;
  self.clickSound.volume = 0.3;
  self.bgMusic.loop = true;

  self.startMusic = function() {
    self.bgMusic.play();
  }
  self.endMusic = function() {
    self.bgMusic.pause();
  }
  self.flip = function() {
    self.flipSound.play();
  }
  self.match = function() {
    self.matchSound.play();
  }
  self.click = function() {
    self.clickSound.play();
  }
  self.victory = function() {
    self.victorySound.play();
  }
  self.gameOver = function() {
    self.gameOverSound.play();
  }
}

function GAME(totalTime, cards, level) {
  let self=this;
  self.cardsArray = cards;
  self.level = level;
  self.totalTime = totalTime;
  self.gameSounds = new AudioController();
  self.records = new RECORDS();
  self.timeRemaining = totalTime;
  self.timer = document.getElementById("time-remaining");
  self.timeInfo = document.getElementById("time-indicator");
  self.ticker = document.getElementById('flips');
  self.pausedGameWindow = document.getElementById("game-paused");
  self.gameOverWindow = document.getElementById("game-over-text");
  self.victoryWindow = document.getElementById("victory-text");
  self.saveResultBlock = document.getElementById("save-result-block");
  self.musicOffButton = document.getElementById("music-control-img");
  self.touchX = null;

  self.startGame = function() {
    self.totalClicks = 0;
    self.timeRemaining = self.totalTime;
    self.cardToCheck = null;
    self.matchedCards = [];
    self.busy = true;
    self.timeInfo.style.color = "white";
    self.timeInfo.style.textShadow = "none";
    setTimeout(() => {
      self.shuffleCards(self.cardsArray);
      self.countDown = self.startCountdown();
      self.busy = false;
      document.addEventListener("keydown", self.keyDetector);
      document.addEventListener("touchstart", self.swipeStart);
    }, 500);
    self.hideCards();
    self.timer.innerText = self.timeRemaining;
    self.ticker.innerText = self.totalClicks;
    self.gameSounds.startMusic();
    self.musicOffButton.onclick = self.switchMusic;
    document.getElementById("music-control-img").setAttribute("src", "Content/Images/music_on.png");
  }
  self.swipeStart = function(EO) {
    EO = EO || window.event;
    self.touchX = EO.targetTouches[0].pageX;
    document.addEventListener("touchend", self.swipeEnd);
  }
  self.swipeEnd = function(EO) {
    EO = EO || window.event;
    document.removeEventListener("touchend", self.swipeEnd);
    if (EO.changedTouches[0].pageX - self.touchX > 50) self.openPauseWindow();
  }
  self.swipeStartBack = function(EO) {
    EO = EO || window.event;
    self.touchX = EO.targetTouches[0].pageX;
    document.addEventListener("touchend", self.swipeEndBack);
  }
  self.swipeEndBack = function(EO) {
    EO = EO || window.event;
    document.removeEventListener("touchend", self.swipeEndBack);
    if (self.touchX - EO.changedTouches[0].pageX > 50) self.resumeGame();
  }
  self.keyDetector = function(EO) {
    if (EO.key === "Escape") 
      if (self.pausedGameWindow.classList.value.indexOf("visible") === -1) self.openPauseWindow();
        else self.resumeGame();
  }
  self.openPauseWindow = function() {
    clearInterval(self.countDown);
      self.pausedGameWindow.classList.add("visible");
      document.getElementById("resume-game").onclick = self.resumeGame;
      document.getElementById("restart-game").onclick = self.restartGame;
      document.getElementById("to-main-menu").onclick = self.endGame;
      document.removeEventListener("touchstart", self.swipeStart);
      document.addEventListener("touchstart", self.swipeStartBack);
  }
  self.resumeGame = function() {
    self.countDown = self.startCountdown();
    self.pausedGameWindow.classList.remove("visible");
    document.removeEventListener("touchstart", self.swipeStartBack);
    document.addEventListener("touchstart", self.swipeStart);
  }
  self.restartGame = function() {
    self.gameSounds.click();
    self.gameOverWindow.classList.remove("visible");
    self.victoryWindow.classList.remove("visible");
    self.pausedGameWindow.classList.remove("visible");
    document.removeEventListener("keydown", self.keyDetector);
    document.removeEventListener("touchstart", self.swipeStartBack);
    self.startGame();
  }
  self.endGame = function() {
    self.gameSounds.click();
    self.gameOverWindow.classList.remove("visible");
    self.victoryWindow.classList.remove("visible");
    self.saveResultBlock.classList.remove("visible");
    self.pausedGameWindow.classList.remove("visible");
    document.getElementById("GAME").classList.remove("visible");
    document.removeEventListener("keydown", self.keyDetector);
    document.removeEventListener("touchstart", self.swipeStartBack);
    document.getElementById("MENU").classList.add("visible");
    document.getElementById("save-button").removeEventListener("click", self.saveResult);
    self.gameSounds.endMusic();
  }
  self.gameOver = function() {
    clearInterval(self.countDown);
    self.gameSounds.gameOver();
    document.removeEventListener("keydown", self.keyDetector);
    document.removeEventListener("touchstart", self.swipeStart);
    self.gameOverWindow.classList.add("visible");
    let textSmall = document.getElementById("game-over-text-small");
    let startAgain = document.getElementById("game-over-text").getElementsByClassName("start-again")[0];
    textSmall.onclick = self.endGame;
    startAgain.onclick = self.restartGame;
  }
  self.victory = function() {
    clearInterval(self.countDown);
    self.gameSounds.victory();
    document.removeEventListener("keydown", self.keyDetector);
    document.removeEventListener("touchstart", self.swipeStart);
    self.victoryWindow.classList.add("visible");
    let textSmall = document.getElementById("victory-text-small");
    let startAgain = document.getElementById("victory-text").getElementsByClassName("start-again")[0];
    let toSaveResult = document.getElementById("to-save-result");
    textSmall.onclick = self.endGame;
    startAgain.onclick = self.restartGame;
    toSaveResult.onclick = self.toSaving;
  }
  self.toSaving = function () {
    self.gameSounds.click();
    self.victoryWindow.classList.remove("visible");
    self.saveResultBlock.classList.add("visible");
    let nameForm = document.getElementById("name-form");
    let username = document.getElementById("username");
    let saveBtn = document.getElementById("save-button");
    function testInput() {
      if (username.value.length == 0 ||
        username.value.length > 20 ||
        username.value[0] === " " ||
        username.value.match(/['`\~^;:,/.()%$#@&*+?!"-]/g) !== null ||
        username.value.includes("  ") === true)
        {
          saveBtn.setAttribute("disabled", "disabled");
          saveBtn.classList.remove("enable");
          return false;
      } else {
          saveBtn.removeAttribute("disabled");
          saveBtn.classList.add("enable");
          return true;
        }
    }
    function saveResult() {
        self.gameSounds.click();
        nameForm.removeEventListener("input", testInput);
        document.removeEventListener("keydown", testKeyEnter);
        let currentInfo = {nickname : username.value, time : document.getElementById("time-remaining").textContent, flips : document.getElementById('flips').textContent, level : self.level};
        username.value = null;
        saveBtn.setAttribute("disabled", "disabled");
        saveBtn.classList.remove("enable");
        self.records.storeInfo(currentInfo);
        self.endGame();
    }
    function testKeyEnter(EO) {
      EO = EO || window.event;
      if ((EO.key === "Enter") && (testInput() === true)) {
        saveResult();
      }
    }
    username.focus();
    document.addEventListener("keydown", testKeyEnter);
    nameForm.addEventListener("input", testInput);
    saveBtn.onclick = saveResult;
  }
  self.switchMusic = function() {
    let soundIcon = document.getElementById("music-control-img");
    if(self.gameSounds.bgMusic.paused) { 
      self.gameSounds.startMusic();
      soundIcon.setAttribute("src", "Content/Images/music_on.png");
    }
    else {
      self.gameSounds.endMusic();
      soundIcon.setAttribute("src", "Content/Images/music_off.png");
    }
  }
  self.hideCards = function() {
    self.cardsArray.forEach(card => {
      card.classList.remove("visible");
      card.classList.remove("matched");
    });
  }
  self.startCountdown = function() {
    return setInterval(() => {
      self.timeRemaining--;
      self.timer.innerText = self.timeRemaining;
        if(self.timeRemaining === 0) self.gameOver();
        if(self.timeRemaining <= 10) {
          self.timeInfo.style.color = "red";
          self.timeInfo.style.textShadow = "0 0 1.5vmin red";
          window.navigator.vibrate(100);
        }
    }, 1000);
  }
  self.flipCard = function(card) {
    if (self.canFlipCard(card)) {
      self.gameSounds.flip();
      if(self.cardToCheck) self.totalClicks++;
      self.ticker.innerText = self.totalClicks;
      card.classList.add("visible");
      if (self.cardToCheck)
      self.checkForCardMatch(card);
      else self.cardToCheck = card;
    }
  }
  self.checkForCardMatch = function(card) {
    if (self.getCardType(card) === self.getCardType(self.cardToCheck))
    self.cardMatch(card, self.cardToCheck);
    else self.cardMisMatch(card, self.cardToCheck);
    self.cardToCheck = null;
  }
  self.cardMatch = function(card1, card2) {
    self.matchedCards.push(card1);
    self.matchedCards.push(card2);
    setTimeout(()=>{
      card1.classList.add("matched");
      card2.classList.add("matched");
      self.gameSounds.match();
    }, 400);
    if (self.matchedCards.length === self.cardsArray.length)
      self.victory();
  }
  self.cardMisMatch = function(card1, card2) {
    self.busy = true;
    setTimeout(()=>{
      card1.classList.add("mismatch");
      card2.classList.add("mismatch");
    }, 400);
    setTimeout(()=>{
      card1.classList.remove("mismatch");
      card2.classList.remove("mismatch");
      card1.classList.remove("visible");
      card2.classList.remove("visible");
      self.busy = false;
    }, 1000);
  }
  self.getCardType = function(card) {
    return card.getElementsByClassName("card-front")[0].style.backgroundImage;
  }
  self.shuffleCards = function() {
    for (let i = self.cardsArray.length - 1; i > 0; i--) {
      let randIndex = Math.floor(Math.random() * (i + 1));
      self.cardsArray[randIndex].style.order = i;
      self.cardsArray[i].style.order = randIndex;
    }
  }
  self.canFlipCard = function(card) {
    return (!self.busy && !self.matchedCards.includes(card) && card !== self.cardToCheck);
  }
}

function MENU() {
  let self = this;
  self.tableRecords = new RECORDS();
  self.menuSounds = new AudioController();
  self.mainMenu = document.getElementById("main-menu");
  self.newGame = document.getElementById("new-game");
  self.records = document.getElementById("records-table");
  self.rules = document.getElementById("rules-text");
  self.rulesButton = document.getElementById("rules-button");
  self.recordsButton = document.getElementById("records-button");
  self.levels = document.getElementById("levels");
  self.easy = document.getElementById("easy");
  self.medium = document.getElementById("medium");
  self.hard = document.getElementById("hard");

  self.openRules = function() {
    $.ajax("rules.txt",
            { type:'GET', dataType:'html', success:dataLoaded, error:errorFunc }
        );
      function dataLoaded(data) {
        console.log("AJAX сработал");
          document.getElementsByClassName('rules')[0].innerHTML=data;
      }
      function errorFunc(jqXHR,statusStr,errorStr) {
        console.log("AJAX не сработал!");
        document.getElementsByClassName('rules')[0].innerHTML="Просим прощение, файл с информацией отсутствует :(";
      }
    self.menuSounds.click();
    self.mainMenu.classList.remove("visible");
    self.rules.classList.add("visible");
    self.rules.getElementsByClassName("button-close")[0].onclick = self.backToMenu;
  }
  self.openRecords = function() {
    self.menuSounds.click();
    self.mainMenu.classList.remove("visible");
    self.records.classList.add("visible");
    self.records.getElementsByClassName("button-close")[0].onclick = self.backToMenu;
    function clickedEasy() {
      self.menuSounds.click();
      document.getElementById("easy-records").classList.add("visible");
      document.getElementById("medium-records").classList.remove("visible");
      document.getElementById("hard-records").classList.remove("visible");
    }
    function clickedMedium() {
      self.menuSounds.click();
      document.getElementById("easy-records").classList.remove("visible");
      document.getElementById("medium-records").classList.add("visible");
      document.getElementById("hard-records").classList.remove("visible");
    }
    function clickedHard() {
      self.menuSounds.click();
      document.getElementById("easy-records").classList.remove("visible");
      document.getElementById("medium-records").classList.remove("visible");
      document.getElementById("hard-records").classList.add("visible");
    }
    document.getElementById("show-easy-table").onclick = clickedEasy;
    document.getElementById("show-medium-table").onclick = clickedMedium;
    document.getElementById("show-hard-table").onclick = clickedHard;
    self.tableRecords.openTable();
  }
  self.backToMenu = function() {
    self.menuSounds.click();
    self.rules.classList.remove("visible");
    self.records.classList.remove("visible");
    self.levels.classList.remove("visible");
    self.mainMenu.classList.add("visible");
  }
  self.openLevels = function() {
    self.menuSounds.click();
    self.mainMenu.classList.remove("visible");
    self.levels.classList.add("visible");
    self.easy.onclick = playEasy;
    self.medium.onclick = playMedium;
    self.hard.onclick = playHard;
    self.levels.getElementsByClassName("button-close")[0].onclick = self.backToMenu;
    function playEasy() {
      self.levels.getElementsByClassName("button-close")[0].removeEventListener("click", self.backToMenu);
      return self.letsGo("easy");
    }
    function playMedium() {
      self.levels.getElementsByClassName("button-close")[0].removeEventListener("click", self.backToMenu);
      return self.letsGo("medium");
    }
    function playHard() {
      self.levels.getElementsByClassName("button-close")[0].removeEventListener("click", self.backToMenu);
      return self.letsGo("hard");
    }
  }
  self.getTimeRemaining = function(lvl) {
    let timeLevel;
    if (lvl==="hard") timeLevel = 80;
    else if (lvl==="medium") timeLevel = 100;
    else timeLevel = 120;
    return timeLevel;
  }
  self.getCards = function(lvl) {
    let complexity;
    if (lvl==="hard") complexity = 32 / 2;
    else if (lvl==="medium") complexity = 24 / 2;
    else complexity = 16 /2;
    let container = document.getElementsByClassName("game-board")[0];
    let pictures = ["cosmonaut-1", "cosmonaut-2", "earth", "jupiter", "mars", "mercury", "moon", "rocket-1", "rocket-2", "saturn", "sputnik-1", "sputnik-2", "sun", "uranus", "venus", "asteroid"];
    container.innerHTML = null;
    for (let i=0; i<complexity; i++) {
      for (let j=1; j<=2; j++) {
        let card = document.createElement("div");
        card.classList.add("card");
        let cardBack = document.createElement("div");
        cardBack.classList.add("card-back");
        cardBack.classList.add("card-face");
        let cardFace = document.createElement("div");
        cardFace.classList.add("card-front");
        cardFace.classList.add("card-face");
        cardFace.style.backgroundImage = 'url("Content/Images/'+pictures[i]+'.png"), url("Content/Images/value-bg.jpg")';
        card.appendChild(cardBack);
        card.appendChild(cardFace);
        container.appendChild(card);
      }
    }
    return Array.from(document.getElementsByClassName("card"));
  }
  self.letsGo = function(lvl) {
    self.menuSounds.click();
    let timeLevel = self.getTimeRemaining(lvl);
    let cards = self.getCards(lvl)
    let game = new GAME(timeLevel, cards, lvl);
    self.levels.classList.remove("visible");
    self.mainMenu.classList.add("visible");
    document.getElementById("MENU").classList.remove("visible");
    document.getElementById("GAME").classList.add("visible");
    cards.forEach(card => {
      card.onclick = () => {
        game.flipCard(card)
      };
      });
    game.startGame();
  }
}

function RECORDS() {
  let self=this;
  self.recordsInfo = [];
  self.ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";
  self.updatePassword = null;
  self.stringName='SVIRSKY_TEST_INFO';

  self.openTable = function() {
    $.ajax(
      {
          url : self.ajaxHandlerScript, type : 'POST', cache : false, dataType:'json',
          data : { f : 'READ', n : self.stringName },
          success : showTables, error : self.errorHandler
      }
  );
    function showTables(callresult) {
      self.recordsInfo=JSON.parse(callresult.result);
      let strEasy = "<tr><th>Имя</th><th>Количество попыток</th><th>Оставшееся время</th><th>Уровень сложности</th></tr>", recordsEasy = document.getElementById("easy-records");
      let strMedium = "<tr><th>Имя</th><th>Количество попыток</th><th>Оставшееся время</th><th>Уровень сложности</th></tr>", recordsMedium = document.getElementById("medium-records");
      let strHard = "<tr><th>Имя</th><th>Количество попыток</th><th>Оставшееся время</th><th>Уровень сложности</th></tr>", recordsHard = document.getElementById("hard-records");
      let limitE = 0, limitM = 0, limitH = 0, i=0;
      while ((limitE<10 || limitM<10 || limitH<10) && i<self.recordsInfo.length) {
        if (self.recordsInfo[i].level === "easy" && limitE<10) {
          strEasy=strEasy+"<tr><td>"+self.recordsInfo[i].nickname+"</td><td>"+self.recordsInfo[i].flips+"</td><td>"+self.recordsInfo[i].time+"</td><td>Easy</td></tr>";
          limitE++;
          i++;
        } else if (self.recordsInfo[i].level === "medium" && limitM<10) {
          strMedium=strMedium+"<tr><td>"+self.recordsInfo[i].nickname+"</td><td>"+self.recordsInfo[i].flips+"</td><td>"+self.recordsInfo[i].time+"</td><td>Medium</td></tr>";
          limitM++;
          i++;
        } else if (self.recordsInfo[i].level === "hard" && limitH<10) {
          strHard=strHard+"<tr><td>"+self.recordsInfo[i].nickname+"</td><td>"+self.recordsInfo[i].flips+"</td><td>"+self.recordsInfo[i].time+"</td><td>Hard</td></tr>";
          limitH++;
          i++;
        } else i++;
        recordsEasy.innerHTML = strEasy ;
        recordsMedium.innerHTML = strMedium ;
        recordsHard.innerHTML = strHard ;
      }
    }
  }
  self.storeInfo = function(currentInfo) {
    self.updatePassword=Math.random();
    $.ajax( {
      url : self.ajaxHandlerScript, type : 'POST', cache : false, dataType:'json',
      data : { f : 'LOCKGET', n : self.stringName, p : self.updatePassword },
      success : lockGetReady, error : self.errorHandler
  }
);
    function lockGetReady (callresult) {
      if ( callresult.error!=undefined ) 
        alert(callresult.error);
      else {
        self.recordsInfo=JSON.parse(callresult.result);
        self.recordsInfo.push(currentInfo);
        self.recordsInfo.sort(function(a,b) {
          if (a.flips>b.flips) return 1;
          if (a.flips<b.flips) return -1;
          if (a.time<b.time) return 1;
          if (a.time>b.time) return -1;
          return 0;
        });
      $.ajax( {
              url : self.ajaxHandlerScript, type : 'POST', cache : false, dataType:'json',
              data : { f : 'UPDATE', n : self.stringName, v : JSON.stringify(self.recordsInfo), p : self.updatePassword },
              success : updateReady, error : self.errorHandler
          }
      );
      }
    }
    function updateReady(callresult) {
        if ( callresult.error!=undefined )
            alert(callresult.error);
    }
  }
  self.errorHandler = function(jqXHR,statusStr,errorStr) {
      alert(statusStr+' '+errorStr);
  }
}

function ready() {
  let menu = new MENU();
  menu.newGame.onclick = menu.openLevels;
  menu.recordsButton.onclick = menu.openRecords;
  menu.rulesButton.onclick = menu.openRules;
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ready());
} else {
  ready();
}
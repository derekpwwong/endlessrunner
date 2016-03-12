var ZPlat = ZPlat || {};

//setting game configuration and loading the assets for the loading screen
ZPlat.MenuState = {
  init: function() {
  this.levelSpeed = 500; 
  },
  create: function() {

    this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'menuBackground');
    this.background.tileScale.y = 2;
    this.background.autoScroll(-this.levelSpeed/8, 0);
    this.game.world.sendToBack(this.background);  
    this.game.add.audio('backgroundAudio');
    this.startGame();
    this.selectCharacter();
    this.selectStage();
    this.selectOption();
    this.game.sound.play('backgroundAudio');
   
  },
  //create GUI Text Start
    startGame: function(){
        var text = "Start";
        var style = { font: "65px Arial", fill: "#ff0044", align: "center" };

        this.startGame = this.game.add.text(this.game.world.centerX-100, this.game.world.centerY-175, text, style);
        this.startGame.inputEnabled = true;
        this.startGame.events.onInputDown.add(function(){
        console.log('game');
        this.state.start('Game');
        }, this);  
    },
    //create GUI Text Character
    selectCharacter: function(){
        var text = "Character";
        var style = { font: "65px Arial", fill: "#ff0044", align: "center" };

        this.selectCharacter = this.game.add.text(this.game.world.centerX-100, this.game.world.centerY-87.5, text, style);        this.selectCharacter.inputEnabled = true;
        this.selectCharacter.events.onInputDown.add(function(){
        console.log('char');
        localStorage.setItem("character", "Smith");
        this.state.start('Game');
        }, this);  
    },
    //create GUI Text Stage
     selectStage: function(){
    var text = "Stage";
    var style = { font: "65px Arial", fill: "#ff0044", align: "center" };

    this.selectStage = this.game.add.text(this.game.world.centerX-100, this.game.world.centerY+87.5, text, style);
    this.selectStage.inputEnabled = true;
    this.selectStage.events.onInputDown.add(function(){
    console.log('stage');
    localStorage.setItem("stage", "background");
    this.state.start('Game');
    }, this);  
    },
     //create GUI Text Stage
     selectOption: function(){
    var text = "Option";
    var style = { font: "65px Arial", fill: "#ff0044", align: "center" };

    this.selectOption = this.game.add.text(this.game.world.centerX-100, this.game.world.centerY+175, text, style);
    this.selectOption.inputEnabled = true;
    this.selectOption.events.onInputDown.add(function(){
    console.log('option');
    this.state.start('Game');
    }, this);  
    },
};

var ZPlat = ZPlat || {};

ZPlat.GameState = {
//level is passed from state manager
  init: function(level) {    

    this.currentLevel = level || 'level4';
    
    
    //constants
    this.RUNNING_SPEED = 100;
    this.DASH_SPEED = 800;
    this.JUMPING_SPEED = 200;
    this.BOUNCING_SPEED = 150;
    

    //gravity
    this.game.physics.arcade.gravity.y = 300;    
    
    
    //flags
    this.numJump=0;
    this.hasDash=true;
    this.count=0;
    this.text='';
    //game time
    this.gameTime=0;
    this.levelSpeed = 500;
    //cursor keys to move the player
    this.cursors = this.game.input.keyboard.createCursorKeys();
  },
  create: function() {
    //load current level
    this.loadLevel();
    this.globalTimer=0;
    //show on-screen touch controls
    this.createOnscreenControls();    
    this.count = 0;
    this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'background');
    this.background.tileScale.y = 2;
    this.background.autoScroll(-this.levelSpeed/8, 0);
    this.game.world.sendToBack(this.background);
    
    this.text = this.game.add.text(800, this.game.height-650, "0:00", {
        font: "32px Arial",
        fill: "#ff0044"
        
    });
    this.text.fixedToCamera = true;
    
    
  },   
  update: function() {    
     
      
    //collision between the player, enemies and the collision layer
    this.game.physics.arcade.collide(this.player, this.collisionLayer); 
    this.game.physics.arcade.collide(this.enemies, this.collisionLayer); 
    
    //collision between player and enemies
    this.game.physics.arcade.collide(this.player, this.enemies, this.hitEnemy, null, this);
    
    //overlap between player and goal
    this.game.physics.arcade.overlap(this.player, this.goal, this.changeLevel, null, this);
    
    //Forces Character to move on the x axis
    this.player.body.velocity.x = 300;
   

    //total time in milliseconds
    this.count= this.globalTimer;
    console.log(this.milliseconds);
    this.milliseconds = Math.floor(this.count %1000);
    
    this.filterMilliseconds = Math.floor(this.count / 1000);
    
    this.filterMinute = Math.floor(this.filterMilliseconds/60);
    this.filterSecond = Math.floor(this.filterMilliseconds%60);
    if(this.filterSecond <10 ){
        this.text.setText(this.filterMinute+':0'+this.filterSecond);    
    }
    else{
        this.text.setText(this.filterMinute+':'+this.filterSecond);
    }
    
    this.globalTimer+=100;
     

    if(this.cursors.left.isDown || this.player.customParams.isMovingLeft) {
      this.player.body.velocity.x = -this.RUNNING_SPEED;
      this.player.scale.setTo(1, 1);
      this.player.play('walking');
    //   this.game.paused = true;
    //   console.log('pause');
    }
    else if(this.cursors.right.isDown || this.player.customParams.isMovingRight) {
      this.player.body.velocity.x = this.RUNNING_SPEED;
      this.player.scale.setTo(-1, 1);
      this.player.play('walking');
      console.log('unpause');
      this.game.paused = false;
    }
    else {
      this.player.animations.stop();
      this.player.frame = 3;
    }
    //dash
    if(this.player.customParams.mustDash){
        if (this.hasDash) {
            this.gameTime = this.game.time.now +100;
            console.log(this.gameTime,' ',this.game.time.now);
            this.hasDash = false;    
        }
        else if(!this.hasDash && (this.gameTime - this.game.time.now)>0){
        console.log(this.gameTime,' ',this.game.time.now);
        this.player.body.velocity.x = this.DASH_SPEED;
        // this.player.play('walking');
        }
        else if(!this.hasDash && Math.abs(this.gameTime - this.game.time.now)>600){
            this.hasDash = true;
        }
                
    }
    
    //count num of jumps
    if(this.player.customParams.mustJump && this.numJump !=1) {
        console.log(this.numJump);
      this.player.body.velocity.y = -this.JUMPING_SPEED;
      this.numJump+=1;
      console.log(this.player.body.velocity.y);   
       this.player.customParams.mustJump = false;
    }
   
   //check if char on the ground
    if(this.player.body.blocked.down || this.player.body.touching.down){
        
        this.numJump =0;
    }
    
    //kill enemy if it falls off
    if(this.player.bottom == this.game.world.height){
      
      this.gameOver();
      
    }
  },
  loadLevel: function(){  
    //create a tilemap object
    this.map = this.add.tilemap(this.currentLevel);

    //join the tile images to the json data
    this.map.addTilesetImage('tiles_spritesheet', 'gameTiles');
    
    //create tile layers
    this.backgroundLayer = this.map.createLayer('backgroundLayer');
    this.collisionLayer = this.map.createLayer('collisionLayer');
    
    //send background to the back
    this.game.world.sendToBack(this.backgroundLayer);
    
    //collision layer should be collisionLayer
    this.map.setCollisionBetween(1, 160, true, 'collisionLayer');
    
    //resize the world to fit the layer
    this.collisionLayer.resizeWorld();
    
    //create the goal
    var goalArr = this.findObjectsByType('goal', this.map, 'objectsLayer');
    this.goal = this.add.sprite(goalArr[0].x, goalArr[0].y, goalArr[0].properties.key);
    this.game.physics.arcade.enable(this.goal);
    this.goal.body.allowGravity = false;
    this.goal.nextLevel = goalArr[0].properties.nextLevel;
    
    //create player
    var playerArr = this.findObjectsByType('player', this.map, 'objectsLayer');
    this.player = this.add.sprite(playerArr[0].x, playerArr[0].y, 'player', 3);
    this.player.anchor.setTo(0.5);
    this.player.animations.add('walking', [0, 1, 2, 1], 6, true);
    this.game.physics.arcade.enable(this.player);
    this.player.customParams = {};
    this.player.body.collideWorldBounds = true;
    this.player.isInvincible= false;

    //follow player with the camera
    this.game.camera.follow(this.player);
    
    //create enemies
    this.enemies = this.add.group();
    this.createEnemies();
    
  },
  
  createOnscreenControls: function(){
    this.leftArrow = this.add.button(20, this.game.height - 60, 'arrowButton');
    this.rightArrow = this.add.button(110, this.game.height - 60, 'arrowButton');
    this.actionButton = this.add.button(this.game.width - 250, this.game.height - 60, 'actionButton');
    this.dashButton = this.add.button(this.game.width - 100, this.game.height - 60, 'actionButton');

    this.leftArrow.alpha = 0.5;
    this.rightArrow.alpha = 0.5;
    this.actionButton.alpha = 0.5;
    this.dashButton.alpha=0.5;

    this.leftArrow.fixedToCamera = true;
    this.rightArrow.fixedToCamera = true;
    this.actionButton.fixedToCamera = true;
    this.dashButton.fixedToCamera = true;

    this.actionButton.events.onInputDown.add(function(){
      this.player.customParams.mustJump = true;
    }, this);

    this.actionButton.events.onInputUp.add(function(){
      this.player.customParams.mustJump = false;
    }, this);
    
    //dash
    this.dashButton.events.onInputDown.add(function(){
        this.player.customParams.mustDash = true;
    }, this);
    
    this.dashButton.events.onInputUp.add(function(){
        this.player.customParams.mustDash = false;
    },this);
    
    //left
    this.leftArrow.events.onInputDown.add(function(){
      this.player.customParams.isMovingLeft = true;
    }, this);

    this.leftArrow.events.onInputUp.add(function(){
      this.player.customParams.isMovingLeft = false;
    }, this);

    this.leftArrow.events.onInputOver.add(function(){
      this.player.customParams.isMovingLeft = true;
    }, this);

    this.leftArrow.events.onInputOut.add(function(){
      this.player.customParams.isMovingLeft = false;
    }, this);

    //right
    this.rightArrow.events.onInputDown.add(function(){
      this.player.customParams.isMovingRight = true;
    }, this);

    this.rightArrow.events.onInputUp.add(function(){
      this.player.customParams.isMovingRight = false;
    }, this);

    this.rightArrow.events.onInputOver.add(function(){
      this.player.customParams.isMovingRight = true;
    }, this);

    this.rightArrow.events.onInputOut.add(function(){
      this.player.customParams.isMovingRight = false;
    }, this);
  },
  findObjectsByType: function(targetType, tilemap, layer){
    var result = [];
    
    tilemap.objects[layer].forEach(function(element){
      if(element.properties.type == targetType) {
        element.y -= tilemap.tileHeight;        
        result.push(element);
      }
    }, this);
    
    return result;
  },
  changeLevel: function(player, goal){
      this.game.world.remove(this.background);
    this.game.state.start('Game', true, false, goal.nextLevel);
  },
  createEnemies: function(){
    var enemyArr = this.findObjectsByType('enemy', this.map, 'objectsLayer');
    var enemy;
    
    enemyArr.forEach(function(element){
      enemy = new ZPlat.Enemy(this.game, element.x, element.y, 'slime', +element.properties.velocity, this.map);
      this.enemies.add(enemy);
    }, this);
  },
  hitEnemy: function(player, enemy){
    if(enemy.body.touching.up){
      enemy.kill();
      player.body.velocity.y = -this.BOUNCING_SPEED;
    }
    else {
      this.gameOver();
    }
  },
  gameOver: function(){
    this.game.world.remove(this.background);
    this.game.state.start('Game', true, false, this.currentLevel);
  }
  
};

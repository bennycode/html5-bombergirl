GameEngine = Class.extend({
    tileSize: 32,
    tilesX: Math.floor(window.innerWidth / 32),
    tilesY: Math.floor(window.innerHeight / 32) - 2,
    size: {},
    fps: 50,
    botsCount: 0, /* 0 - 3 */
    playersCount: 0, /* 1 - 2 */
    bonusesPercent: 22,

    stage: null,
    menu: null,
    players: [],
    bots: [],
    tiles: [],
    bombs: [],
    bonuses: [],

    playerBoyImg: null,
    playerGirlImg: null,
    playerGirl2Img: null,
    tilesImgs: {},
    bombImg: null,
    fireImg: null,
    bonusesImg: null,

    playing: false,
    mute: false,
    soundtrackLoaded: false,
    soundtrackPlaying: false,
    soundtrack: null,

    init: function () {
        this.size = {
            w: this.tileSize * this.tilesX,
            h: this.tileSize * this.tilesY
        };
    },

    load: function () {
        // Init canvas
        this.stage = new createjs.Stage("canvas");
        this.stage.canvas.width = window.innerWidth;
        this.stage.canvas.height = window.innerHeight;
        //this.stage.enableMouseOver();

        // Load assets
        var queue = new createjs.LoadQueue();
        var that = this;
        queue.addEventListener("complete", function () {
            that.playerBoyImg = queue.getResult("playerBoy");
            that.playerGirlImg = queue.getResult("playerGirl");
            that.playerGirl2Img = queue.getResult("playerGirl2");
            that.tilesImgs.grass = queue.getResult("tile_grass");
            that.tilesImgs.wall = queue.getResult("tile_wall");
            that.tilesImgs.wood = queue.getResult("tile_wood");
            that.bombImg = queue.getResult("bomb");
            that.fireImg = queue.getResult("fire");
            that.bonusesImg = queue.getResult("bonuses");
            that.setup();
        });
        queue.loadManifest([
            {id: "playerBoy", src: "img/george.png"},
            {id: "playerGirl", src: "img/betty.png"},
            {id: "playerGirl2", src: "img/betty2.png"},
            {id: "tile_grass", src: "img/tile_grass.png"},
            {id: "tile_wall", src: "img/tile_wall.png"},
            {id: "tile_wood", src: "img/tile_wood.png"},
            {id: "bomb", src: "img/bomb.png"},
            {id: "fire", src: "img/fire.png"},
            {id: "bonuses", src: "img/bonuses.png"}
        ]);

        createjs.Sound.addEventListener("fileload", this.onSoundLoaded);
        createjs.Sound.alternateExtensions = ["mp3"];
        createjs.Sound.registerSound("sound/bomb.ogg", "bomb");
        createjs.Sound.registerSound("sound/game.ogg", "game");

        // Create menu
        this.menu = new Menu();

    },

    setup: function () {
        if (!gInputEngine.bindings.length) {
            gInputEngine.setup();
        }

        this.bombs = [];
        this.tiles = [];
        this.bonuses = [];

        // Draw tiles
        this.drawTiles();
        this.drawBonuses();

        //this.spawnBots();
        //this.spawnPlayers();

        // Toggle sound
        gInputEngine.addListener('mute', this.toggleSound);

        // Restart listener
        // Timeout because when you press enter in address bar too long, it would not show menu
        setTimeout(function () {
            gInputEngine.addListener('restart', function () {
                if (gGameEngine.playersCount == 0) {
                    gGameEngine.menu.setMode('single');
                } else {
                    gGameEngine.menu.hide();
                    gGameEngine.restart();
                }
            });
        }, 200);

        // Escape listener
        gInputEngine.addListener('escape', function () {
            if (!gGameEngine.menu.visible) {
                gGameEngine.menu.show();
            }
        });

        // Start loop
        if (!createjs.Ticker.hasEventListener('tick')) {
            createjs.Ticker.addEventListener('tick', gGameEngine.update);
            createjs.Ticker.setFPS(this.fps);
        }

        if (this.soundtrackLoaded) {
            this.playSoundtrack();
        }

        if (!this.playing) {
            this.menu.show();
        }
        CF.init();
    },

    onSoundLoaded: function (sound) {
        if (sound.id == 'game') {
            gGameEngine.soundtrackLoaded = true;
            gGameEngine.playSoundtrack();
        }
    },

    playSoundtrack: function () {
        if (!gGameEngine.soundtrackPlaying) {
            gGameEngine.soundtrack = createjs.Sound.play("game", "none", 0, 0, -1);
            gGameEngine.soundtrack.setVolume(1);
            gGameEngine.soundtrackPlaying = true;
        }
    },

    update: function () {
        // Player
        for (var i = 0; i < gGameEngine.players.length; i++) {
            var player = gGameEngine.players[i];
            player.update();
        }

        // Bots
        for (var i = 0; i < gGameEngine.bots.length; i++) {
            var bot = gGameEngine.bots[i];
            bot.update();
        }

        // Bombs
        for (var i = 0; i < gGameEngine.bombs.length; i++) {
            var bomb = gGameEngine.bombs[i];
            bomb.update();
        }

        // Menu
        gGameEngine.menu.update();

        // Stage
        gGameEngine.stage.update();
    },

    drawTiles: function () {
        for (var i = 0; i < this.tilesY; i++) {
            for (var j = 0; j < this.tilesX; j++) {

                // Make sure player can spawn
                if ((i == 1 && j == 1) ||
                    (i == 1 && j == this.tilesX - 2) ||
                    (i == this.tilesY - 2 && j == this.tilesX - 2) ||
                    (i == this.tilesY - 2 && j == 1) ||
                        // Center top
                    (j == Math.floor(this.tilesX / 2) && i == 1) ||
                    (j == Math.floor(this.tilesX / 2) - 1 && i == 1) ||
                    (j == Math.floor(this.tilesX / 2) + 1 && i == 1) ||
                    (j == Math.floor(this.tilesX / 2) && i == 2) ||
                        // Center bottom
                    (j == Math.floor(this.tilesX / 2) && i == this.tilesY - 2) ||
                    (j == Math.floor(this.tilesX / 2) - 1 && i == this.tilesY - 2) ||
                    (j == Math.floor(this.tilesX / 2) + 1 && i == this.tilesY - 2) ||
                    (j == Math.floor(this.tilesX / 2) && i == this.tilesY - 3)
                ) {

                    var tile = new Tile('grass', {x: j, y: i});
                    this.stage.addChild(tile.bmp);

                }
                else if ((i == 0 || j == 0 || i == this.tilesY - 1 || j == this.tilesX - 1)
                    || (j % 2 == 0 && i % 2 == 0)) {
                    // Wall tiles
                    var tile = new Tile('wall', {x: j, y: i});
                    this.stage.addChild(tile.bmp);
                    this.tiles.push(tile);
                } else {
                    // Grass tiles
                    var tile = new Tile('grass', {x: j, y: i});
                    this.stage.addChild(tile.bmp);

                    // Wood tiles
                    if (!(i <= 2 && j <= 2)
                        && !(i >= this.tilesY - 3 && j >= this.tilesX - 3)
                        && !(i <= 2 && j >= this.tilesX - 3)
                        && !(i >= this.tilesY - 3 && j <= 2)) {

                        var wood = new Tile('wood', {x: j, y: i});
                        this.stage.addChild(wood.bmp);
                        this.tiles.push(wood);
                    }
                }
            }
        }
    },

    drawBonuses: function () {
        // Cache woods tiles
        var woods = [];
        for (var i = 0; i < this.tiles.length; i++) {
            var tile = this.tiles[i];
            if (tile.material == 'wood') {
                woods.push(tile);
            }
        }

        // Sort tiles randomly
        woods.sort(function () {
            return 0.5 - Math.random();
        });

        // Distribute bonuses to quarters of map precisely fairly
        for (var j = 0; j < 4; j++) {
            var bonusesCount = Math.round(woods.length * this.bonusesPercent * 0.01 / 4);
            var placedCount = 0;
            for (var i = 0; i < woods.length; i++) {
                if (placedCount > bonusesCount) {
                    break;
                }

                var tile = woods[i];
                if ((j == 0 && tile.position.x < this.tilesX / 2 && tile.position.y < this.tilesY / 2)
                    || (j == 1 && tile.position.x < this.tilesX / 2 && tile.position.y > this.tilesY / 2)
                    || (j == 2 && tile.position.x > this.tilesX / 2 && tile.position.y < this.tilesX / 2)
                    || (j == 3 && tile.position.x > this.tilesX / 2 && tile.position.y > this.tilesX / 2)) {

                    var typePosition = placedCount % 3;
                    var bonus = new Bonus(tile.position, typePosition);
                    this.bonuses.push(bonus);

                    // Move wood to front
                    this.moveToFront(tile.bmp);

                    placedCount++;
                }
            }
        }
    }
    ,

    getSpawnPosition: function () {
        var availablePositions = [
            {x: Math.floor(this.tilesX / 2), y: 1}, // center top
            {x: Math.floor(this.tilesX / 2), y: this.tilesY - 2}, // center bottom
            {x: 1, y: 1},
            {x: this.tilesX - 2, y: this.tilesY - 2},
            {x: 1, y: this.tilesY - 2},
            {x: this.tilesX - 2, y: 1}
        ];
        var position = availablePositions[Math.floor(Math.random() * availablePositions.length)];
        return position;
    },

    /**
     * Spawn a single player and return its object
     */
    spawnPlayer: function () {
        this.players = [];

        var position = this.getSpawnPosition();

        var player = new Player(position);
        this.players.push(player);
        return player;

    },

    /**
     * Remove player
     * @param player
     */
    removePlayer: function (player) {

        var indexOf = this.players.indexOf(player);
        if (indexOf >= 0) {
            gGameEngine.stage.removeChild(player.bmp);
            this.players.splice(indexOf, 1);
        }
    },

    /**
     * Checks whether two rectangles intersect.
     */
    intersectRect: function (a, b) {
        return (a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom);
    }
    ,

    /**
     * Returns tile at given position.
     */
    getTile: function (position) {
        for (var i = 0; i < this.tiles.length; i++) {
            var tile = this.tiles[i];
            if (tile.position.x == position.x && tile.position.y == position.y) {
                return tile;
            }
        }
    },

    /**
     * Returns tile material at given position.
     */
    getTileMaterial: function (position) {
        var tile = this.getTile(position);
        return (tile) ? tile.material : 'grass';
    },

    restart: function () {
        gInputEngine.removeAllListeners();
        gGameEngine.stage.removeAllChildren();
        gGameEngine.setup();
    },

    /**
     * Moves specified child to the front.
     */
    moveToFront: function (child) {
        var children = gGameEngine.stage.getNumChildren();
        gGameEngine.stage.setChildIndex(child, children - 1);
    },

    toggleSound: function () {
        if (gGameEngine.mute) {
            gGameEngine.mute = false;
            gGameEngine.soundtrack._resume();
        } else {
            gGameEngine.mute = true;
            gGameEngine.soundtrack._pause();
        }
    },

    countPlayersAlive: function () {
        var playersAlive = 0;
        for (var i = 0; i < gGameEngine.players.length; i++) {
            if (gGameEngine.players[i].alive) {
                playersAlive++;
            }
        }
        return playersAlive;
    }
    ,

    getPlayersAndBots: function () {
        var players = [];

        for (var i = 0; i < gGameEngine.players.length; i++) {
            players.push(gGameEngine.players[i]);
        }

        for (var i = 0; i < gGameEngine.bots.length; i++) {
            players.push(gGameEngine.bots[i]);
        }

        return players;
    }
})
;

gGameEngine = new GameEngine();
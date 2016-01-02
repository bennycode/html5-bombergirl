/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Couchfriends
 * www.couchfriends.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var CF = CF || {
        players: [],
        init: function () {
            COUCHFRIENDS.settings.apiKey = 'bomber-1234'; // Not needed for testing purposes
            COUCHFRIENDS.connect();

            COUCHFRIENDS.on('connect', function () {
                var jsonData = {
                    topic: 'game',
                    action: 'host',
                    data: {
                        sessionKey: 'bomber-1234'
                    }
                };
                COUCHFRIENDS.send(jsonData);
            });
            COUCHFRIENDS.on('playerJoined', function (data) {
                gGameEngine.menu.hide();
                var bomberGirl = gGameEngine.spawnPlayer();
                var player = {
                    id: data.id,
                    bomberGirl: bomberGirl
                };
                CF.players.push(player);
                var jsonData = {
                    topic: 'interface',
                    action: 'buttonAdd',
                    data: {
                        id: 'a-b-x-y',
                        playerId: data.id // The id of the connected player. See 'playerJoined' callback.
                    }
                };
                COUCHFRIENDS.send(jsonData);
                var jsonData = {
                    topic: 'interface',
                    action: 'buttonAdd',
                    data: {
                        id: 'directional',
                        playerId: data.id // The id of the connected player. See 'playerJoined' callback.
                    }
                };
                COUCHFRIENDS.send(jsonData);
                var jsonData = {
                    topic: 'interface',
                    action: 'buttonRemove',
                    data: {
                        id: 'orientation',
                        playerId: data.id // The id of the connected player. See 'playerJoined' callback.
                    }
                };
                COUCHFRIENDS.send(jsonData);
                var jsonData = {
                    topic: 'player',
                    action: 'identify',
                    data: {
                        id: data.id,
                        color: '#ff0000' // Change the color of the player's controller
                    }
                };
                COUCHFRIENDS.send(jsonData);
            });

            /**
             * Callback when a player disconnect from the game.
             *
             * @param {object} data list with the player information
             * @param {int} data.id the unique identifier of the player that left
             */
            COUCHFRIENDS.on('playerLeft', function (data) {
                for (var i = 0; i < CF.players.length; i++) {
                    var player = CF.players[i];
                    if (player.id == data.id) {
                        gGameEngine.removePlayer(player.bomberGirl);
                        CF.players.splice(i, 1);
                        return;
                    }
                }
            });
            COUCHFRIENDS.on('playerOrientation', function (data) {
                for (var i = 0; i < CF.players.length; i++) {
                    var player = CF.players[i];
                    if (player.id == data.id) {
                        player.bomberGirl.controls.left = false;
                        player.bomberGirl.controls.up = false;
                        player.bomberGirl.controls.right = false;
                        player.bomberGirl.controls.down = false;
                        if (data.x >= -.1 && data.x <= .1 && data.y > -.1 && data.y < .1) {
                            // Not moving
                        }
                        var max = 0;
                        var move = '';
                        if (data.x < -.1) {
                            if (max < Math.abs(data.x)) {
                                move = 'left';
                                max = Math.abs(data.x);
                            }
                        }
                        if (data.x > .1) {
                            if (max < data.x) {
                                move = 'right';
                                max = data.x;
                            }
                        }
                        if (data.y < -.1) {
                            if (max < Math.abs(data.y)) {
                                move = 'up';
                                max = Math.abs(data.y);
                            }
                        }
                        if (data.y > .1) {
                            if (max < data.y) {
                                move = 'down';
                            }
                        }
                        player.bomberGirl.movingPos.x = (data.x * 2);
                        player.bomberGirl.movingPos.y = (data.y * 2);
                        if (move != '') {
                            player.bomberGirl.controls[move] = true;
                        }
                        return;
                    }
                }
            });
            COUCHFRIENDS.on('buttonClick', function (data) {
                for (var i = 0; i < CF.players.length; i++) {
                    var player = CF.players[i];
                    if (player.id == data.playerId) {
                        if (data.id == 'button-left') {
                            player.bomberGirl.controls.left = false;
                        }
                        else if (data.id == 'button-right') {
                            player.bomberGirl.controls.right = false;
                        }
                        else if (data.id == 'button-up') {
                            player.bomberGirl.controls.up = false;
                        }
                        else if (data.id == 'button-down') {
                            player.bomberGirl.controls.down = false;
                        }
                        else {
                            // Either button-a, button-b, button-x, button-y
                            player.bomberGirl.placeBomb();
                        }
                        return;
                    }
                }
            });
            COUCHFRIENDS.on('playerClickUp', function (data) {
                for (var i = 0; i < CF.players.length; i++) {
                    var player = CF.players[i];
                    if (player.id == data.playerId) {
                        if (data.id == 'button-left') {
                            player.bomberGirl.controls.left = false;
                        }
                        else if (data.id == 'button-right') {
                            player.bomberGirl.controls.right = false;
                        }
                        else if (data.id == 'button-up') {
                            player.bomberGirl.controls.up = false;
                        }
                        else if (data.id == 'button-down') {
                            player.bomberGirl.controls.down = false;
                        }
                        else {
                            // Either button-a, button-b, button-x, button-y
                            player.bomberGirl.placeBomb();
                        }
                        return;
                    }
                }
            });
            COUCHFRIENDS.on('buttonUp', function(data) {
                for (var i = 0; i < CF.players.length; i++) {
                    var player = CF.players[i];
                    if (player.id == data.playerId) {
                        if (data.id == 'button-left') {
                            player.bomberGirl.controls.left = false;
                        }
                        else if (data.id == 'button-right') {
                            player.bomberGirl.controls.right = false;
                        }
                        else if (data.id == 'button-up') {
                            player.bomberGirl.controls.up = false;
                        }
                        else if (data.id == 'button-down') {
                            player.bomberGirl.controls.down = false;
                        }
                        else {
                            // Either button-a, button-b, button-x, button-y
                            player.bomberGirl.placeBomb();
                        }
                        return;
                    }
                }
            });
            COUCHFRIENDS.on('playerClickDown', function (data) {
                for (var i = 0; i < CF.players.length; i++) {
                    var player = CF.players[i];
                    if (player.id == data.playerId) {
                        if (data.id == 'button-left') {
                            player.bomberGirl.controls.left = true;
                        }
                        else if (data.id == 'button-right') {
                            player.bomberGirl.controls.right = true;
                        }
                        else if (data.id == 'button-up') {
                            player.bomberGirl.controls.up = true;
                        }
                        else if (data.id == 'button-down') {
                            player.bomberGirl.controls.down = true;
                        }
                        return;
                    }
                }
            });
        }
    };
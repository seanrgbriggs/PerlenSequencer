/*
Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
Perlenspiel is Copyright © 2009-17 Worcester Polytechnic Institute.
This file is part of Perlenspiel.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with Perlenspiel. If not, see <http://www.gnu.org/licenses/>.
*/

// game.js for Perlenspiel 3.2.x
// This is a template for creating new Perlenspiel games

// The following comment lines are for JSLint/JSHint. Don't remove them!

// The "use strict" directive in the following line is important. Don't remove it!
"use strict";
/*jslint nomen: true, white: true */
/*global PS */

//var LIT_COLORS = [0xff0080, 0xff0000, 0xff8000, 0xffff00,
  //  0x80ff00, 0x00ff00, 0x00ff80, 0x00ffff,
////0x0080ff, 0x0000ff, 0x8000ff, 0xff00ff];

var G= (function () {
    var MIDDLE_C = 60;
    var BG_COL = PS.COLOR_BLACK;
	var HIGHLIGHT_COL = 0xF0F0F0;
    var BEAD_RADIUS = 20;
	var MAX_WIDTH = 32;
	var LIT_COLORS = [0xff0080, 0xff0000, 0xff8000, 0xffff00,
        0x80ff00, 0x00ff00];
    LIT_COLORS = LIT_COLORS.concat(LIT_COLORS.reverse());

    var UNLIT_COLORS = LIT_COLORS.map(function (col) {
		function dim(col, mask) {
			return ((col & mask) / 2) & mask;
        }
		return dim(col, 0xff)+dim(col,0xff00)+dim(col,0xff0000);
    })
    var HEIGHT = LIT_COLORS.length;

    var PLAY_BUTTON = {x:16, y:HEIGHT, playglyph:"▶", pauseglyph:"⏸"};


	var width, columns, currentColumn, tempo, octave,tempoTimerPtr;
    width = 4;
	columns = [];
    for(var q = 0; q < 31; q++){
            columns.push(0);
	}
	tempo = 50;
	currentColumn = -1;


    function GridIterator(sizeX, sizeY) {
        return {
			x:0,y:0,width:sizeX,height:sizeY,
			isDone: function () {
				return this.y >= this.height;
            },
			next: function () {
				this.x++;
				if(this.x >= this.width){
					this.x = 0;
					this.y++;
				}
            }
		};
    }

    function addCol() {
        width++;
        columns.push(0x0);
    }

    function switchBead(x, y) {

		var rowMask, isBeadLit;
        if(x > columns.length){
            return;
        }

        rowMask = 0x1 << y;

		columns[x] = columns[x] ^ (rowMask);
        isBeadLit = columns[x] & rowMask;
        PS.debug(isBeadLit+"\n");
        if(isBeadLit){
            PS.color(x,y,LIT_COLORS[y]);
            PS.alpha (x, y, 255);
        }else{
            PS.color(x,y,UNLIT_COLORS[y]);
            PS.alpha ( x, y, 60 )
        }
    }

    function playCol() {
        var y;
        for(y = 0; y<HEIGHT; y++){
            //if the square is lit

            if(columns[currentColumn] & (1 << y)) {
                PS.debug(columns[currentColumn] ^ (1 << y)+"\n");
                PS.audioPlay(PS.piano(MIDDLE_C + y));
            }
            /*
            if(LIT_COLORS.indexOf(PS.color(currentColumn, y)) !== -1){
                //PS.debug(y+"\n");
                PS.audioPlay( PS.piano( MIDDLE_C + y ) );
            }*/
        }
    }

    function remCol() {

    }

    //function for the tempo and playing the music
    function tempoTimer(){
        currentColumn += 1; // decrement counter
        if ( currentColumn < G.constants.MAX_WIDTH) {
        }
        else {
            currentColumn = 0;
        }
        PS.borderColor(currentColumn, G.constants.HEIGHT, PS.DEFAULT);

        G.playCol(currentColumn);
		PS.borderColor(PS.ALL, PS.ALL, PS.DEFAULT);

        PS.borderColor(currentColumn, PS.ALL, PS.COLOR_BLACK);
    }

	function pausePlay() {
		if(!tempoTimerPtr){
            tempoTimerPtr = PS.timerStart(tempo, tempoTimer)
			PS.glyph(PLAY_BUTTON.x, PLAY_BUTTON.y, PLAY_BUTTON.playglyph);
		}else{
			PS.timerStop(tempoTimerPtr);
			tempoTimerPtr = false;
            PS.glyph(PLAY_BUTTON.x, PLAY_BUTTON.y, PLAY_BUTTON.pauseglyph);
		}
    }
    return {
		constants:{
			MAX_WIDTH:MAX_WIDTH,
            LIT_COLORS:LIT_COLORS,
			UNLIT_COLORS:UNLIT_COLORS,
			HEIGHT:HEIGHT,

            BG_COL:BG_COL
		},
		GridIterator:GridIterator,
		switchBead:switchBead,
		playCol:playCol,
		pausePlay:pausePlay
	};
}());

// All of the functions below MUST exist, or the engine will complain!

// PS.init( system, options )
// Initializes the game
// This function should normally begin with a call to PS.gridSize( x, y )
// where x and y are the desired initial dimensions of the grid
// [system] = an object containing engine and platform information; see documentation for details
// [options] = an object with optional parameters; see documentation for details

// Add any other initialization code you need here
// Use PS.gridSize( x, y ) to set the grid to
// Otherwise you will get the default 8x8 grid
// the initial dimensions you want (32 x 32 maximum)
// Do this FIRST to avoid problems!

PS.init = function( system, options ) {

	PS.gridSize( G.constants.MAX_WIDTH, G.constants.HEIGHT + 1 );
    PS.gridColor (G.BG_COL);
    for(var gi = new G.GridIterator(G.constants.MAX_WIDTH, G.constants.HEIGHT); !gi.isDone(); gi.next()){
        PS.color(gi.x, gi.y, G.constants.UNLIT_COLORS[gi.y]);
    }
    PS.alpha (PS.ALL, PS.ALL, 60);
    G.pausePlay();
    PS.border(PS.ALL, G.constants.HEIGHT, 0);
};


// PS.touch ( x, y, data, options )
// Called when the mouse button is clicked on a bead, or when a bead is touched
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details


PS.touch = function( x, y, data, options ) {
	// Uncomment the following line to inspect parameters
	PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );
	if(y < G.constants.HEIGHT) {
        G.switchBead(x, y);
    }else{
        G.pausePlay();
	}
	// Add code here for mouse clicks/touches over a bead
};


// PS.release ( x, y, data, options )
// Called when the mouse button is released over a bead, or when a touch is lifted off a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.release = function( x, y, data, options ) {
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead
};

// PS.enter ( x, y, button, data, options )
// Called when the mouse/touch enters a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.enter = function( x, y, data, options ) {
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead
};

// PS.exit ( x, y, data, options )
// Called when the mouse cursor/touch exits a bead
// It doesn't have to do anything
// [x] = zero-based x-position of the bead on the grid
// [y] = zero-based y-position of the bead on the grid
// [data] = the data value associated with this bead, 0 if none has been set
// [options] = an object with optional parameters; see documentation for details

PS.exit = function( x, y, data, options ) {
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead
};

// PS.exitGrid ( options )
// Called when the mouse cursor/touch exits the grid perimeter
// It doesn't have to do anything
// [options] = an object with optional parameters; see documentation for details

PS.exitGrid = function( options ) {
	// Uncomment the following line to verify operation
	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid
};

// PS.keyDown ( key, shift, ctrl, options )
// Called when a key on the keyboard is pressed
// It doesn't have to do anything
// [key] = ASCII code of the pressed key, or one of the PS.KEY constants documented at:
// http://users.wpi.edu/~bmoriarty/ps/constants.html
// [shift] = true if shift key is held down, else false
// [ctrl] = true if control key is held down, else false
// [options] = an object with optional parameters; see documentation for details

PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following line to inspect parameters
	//	PS.debug( "DOWN: key = " + key + ", shift = " + shift + "\n" );

	// Add code here for when a key is pressed
};

// PS.keyUp ( key, shift, ctrl, options )
// Called when a key on the keyboard is released
// It doesn't have to do anything
// [key] = ASCII code of the pressed key, or one of the PS.KEY constants documented at:
// http://users.wpi.edu/~bmoriarty/ps/constants.html
// [shift] = true if shift key is held down, false otherwise
// [ctrl] = true if control key is held down, false otherwise
// [options] = an object with optional parameters; see documentation for details

PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following line to inspect parameters
	// PS.debug( "PS.keyUp(): key = " + key + ", shift = " + shift + ", ctrl = " + ctrl + "\n" );

	// Add code here for when a key is released
};

// PS.input ( sensors, options )
// Called when an input device event (other than mouse/touch/keyboard) is detected
// It doesn't have to do anything
// [sensors] = an object with sensor information; see documentation for details
// [options] = an object with optional parameters; see documentation for details

PS.input = function( sensors, options ) {
	// Uncomment the following block to inspect parameters
	/*
	 PS.debug( "PS.input() called\n" );
	 var device = sensors.wheel; // check for scroll wheel
	 if ( device )
	 {
	 PS.debug( "sensors.wheel = " + device + "\n" );
	 }
	 */

	// Add code here for when an input event is detected
};

// PS.swipe ( data, options )
// Called when the player swipes a held-down mouse or finger across or around the grid.
// It doesn't have to do anything
// [data] = an object with swipe information; see documentation for details
// [options] = an object with optional parameters; see documentation for details

PS.swipe = function( data, options ) {

	// Add code here for when a swipe event is detected
};

// PS.shutdown ( options )
// Called when the browser window running Perlenspiel is about to close
// It doesn't have to do anything
// [options] = an object with optional parameters; see documentation for details

PS.shutdown = function( options ) {

	// Add code here for when Perlenspiel is about to close
};
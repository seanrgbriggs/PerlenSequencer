// game.js for Perlenspiel 3.2.x

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

// The "use strict" directive in the following line is important. Don't remove it!
"use strict";

// The following comment lines are for JSLint/JSHint. Don't remove them!

/*jslint nomen: true, white: true */
/*global PS */

var G= (function () {
	var MIDDLE_C = 60;
	var BG_COL = 0x303030;
	var HIGHLIGHT_COL = 0xF0F0F0;
	var BEAD_RADIUS = 20;
	var MAX_WIDTH = 31;
	var HEIGHT = 12;
	var LIT_COLORS = [0xff0080, 0xff0000, 0xff8000, 0xffff00, 0x80ff00, 0x00ff00, 0x00ff80, 0x00ffff, 0x0080ff, 0x0000ff, 0x8000ff, 0xff00ff];
	var UNLIT_COLORS = LIT_COLORS.map(function (col) {
		function dim(col, mask) {
			return ((col & mask) / 2) & mask;
        }
		return dim(col, 0xff)+dim(col,0xff00)+dim(col,0xff0000);
    })

	var width, columns, currentColumn, tempo, octave;
	width = 4;
	columns = [];
	//DEBUG STATEMENT REMOVE LATER
		for(var q = 0; q < 31; q++){
			columns.push(0);
		}
	//
	currentColumn = 0;

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

	function prepBeadData() {
		var gi;
		for(gi = new GridIterator(MAX_WIDTH, HEIGHT); !gi.isDone(); gi.next()){

		}
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

    function playCol(x) {
		var y;
		for(y = 0; y<HEIGHT; y++){
			//if the square is lit
			if(LIT_COLORS.indexOf(PS.color(x, y)) !== -1){
				PS.debug(y+"\n");
			}
		}
    }

    function remCol() {

    }
	return {
		constants:{
			MAX_WIDTH:MAX_WIDTH,
            LIT_COLORS:LIT_COLORS,
			UNLIT_COLORS:UNLIT_COLORS,
			HEIGHT:HEIGHT
		},
		GridIterator:GridIterator,
		switchBead:switchBead,
		playCol:playCol
	};
}());


// This is a template for creating new Perlenspiel games

// All of the functions below MUST exist, or the engine will complain!

// PS.init( system, options )
// Initializes the game
// This function should normally begin with a call to PS.gridSize( x, y )
// where x and y are the desired initial dimensions of the grid
// [system] = an object containing engine and platform information; see documentation for details
// [options] = an object with optional parameters; see documentation for details

PS.init = function( system, options ) {
	// Use PS.gridSize( x, y ) to set the grid to
	// the initial dimensions you want (32 x 32 maximum)
	// Do this FIRST to avoid problems!
	// Otherwise you will get the default 8x8 grid

	PS.gridSize( G.constants.MAX_WIDTH, G.constants.HEIGHT );
    PS.gridColor (PS.COLOR_GRAY);
	for(var gi = new G.GridIterator(G.constants.MAX_WIDTH, G.constants.HEIGHT); !gi.isDone(); gi.next()){
		PS.color(gi.x, gi.y, G.constants.UNLIT_COLORS[gi.y]);
	}
    PS.alpha (PS.ALL, PS.ALL, 60);
	PS.timerStart(20, tempoTimer);
	// Add any other initialization code you need here
};

//function for the tempo
var tempoCounter = -1;
function tempoTimer(){
    if ( tempoCounter < G.constants.MAX_WIDTH-1) {
        tempoCounter += 1; // decrement counter
    }
    else {
        tempoCounter = 0;
    }
    PS.borderColor(tempoCounter, PS.ALL, PS.COLOR_RED);
    G.playCol(tempoCounter);
    if(tempoCounter === 0){
        PS.borderColor(30, PS.ALL, PS.DEFAULT);
	}
	else{
        PS.borderColor(tempoCounter-1, PS.ALL, PS.DEFAULT);
	}
}

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
	G.switchBead(x,y);
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
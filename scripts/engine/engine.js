var Engine = (
	function()
	{
		var CANVAS_WIDTH = 800;
		var CANVAS_HEIGHT = 600;
		
		var MAX_LAPSE = 100;
		
		var _log = true;
		var _warn = true;
		var _debug = false;
		var lastTime = null;
		var paused = true;
		
		var canvas;
		var context;
		var canvasBoundingRectangle;
		
		var settings = {};
		
		var mousePosition = {x:0, y:0};
		var keysPressed = {
			"up":false,	
			"down":false,	
			"left":false,	
			"right":false,	
		};
		return {
			get _debug() {return _debug;},
			
			get context() {return context;},
			
			get keysPressed() {return keysPressed;},
			
			get mouseX() {return mousePosition.x;},
			get mouseY() {return mousePosition.y;},
			
			initialize: function()
			{	
				paused = false;
				
				canvas = document.createElement("canvas");
				canvas.width = CANVAS_WIDTH;
				canvas.height = CANVAS_HEIGHT;
				document.body.appendChild(canvas);
				context = canvas.getContext("2d");
				canvasBoundingRectangle = canvas.getBoundingClientRect();
				
				// settings 
				settings["notification"] = {};
				settings["notification"]["notify"] = true;
				
				// helper initializing
				State_manager.initialize();
				UIHandler.initialize();
				// listeners
				document.body.addEventListener("mousedown",Engine.handle_mousedown, false);
				document.body.addEventListener("mouseup",Engine.handle_mouseup, false);
				document.body.addEventListener("mousemove",Engine.handle_mousemove, false);
				
				document.body.addEventListener("keydown",Engine.handle_keydown, false);
				document.body.addEventListener("keyup",Engine.handle_keyup, false);
				
				window.requestAnimationFrame(Engine.draw);
			},
			
			log: function(message)
			{
				if(_log)
				{
					console.log(message);
				}
			},
			
			warn: function(message)
			{
				if(_warn)
				{
					console.warn(message);
				}
			},
			
			notify: function(message)
			{
				if(settings["notification"]["notify"])
				{
					// do whatever to notify the player 
					// temporary logging
					console.log(message);
				}
			},
			
			draw: function(time)
			{
				// reset 
				context.clearRect(0,0,canvas.width,canvas.height);
				context.strokeStyle = "black";
				context.fillStyle = "black";
				// canvas bounds
				context.beginPath();
				context.rect(0,0,canvas.width,canvas.height);
				context.closePath();
				context.stroke();
								
				// draw UI over everything
				UIHandler.draw(context);
				
				// customary ticking and preparation for next tick
				if(!lastTime)
				{
					lastTime = time;
				}
				var lapse = time - lastTime;
				lastTime = time;
				// this prevents lagging that is damaging
				if(lapse > MAX_LAPSE) 
				{
					Engine.log("Engine: Lapse " + lapse + "ms is too high! Setting it back to " + MAX_LAPSE + "ms.");
					lapse = MAX_LAPSE;
				}
				Engine.tick(lapse);
				
				window.requestAnimationFrame(Engine.draw);
			},
			
			tick: function(lapse)
			{
				if(!paused)
				{
					Shop.tick(lapse);
				}
			},
			
			handle_mousedown: function(event)
			{
				var mouseX = event.clientX - canvasBoundingRectangle.x;
				var mouseY = event.clientY - canvasBoundingRectangle.y;
				
				UIHandler.handle_mousedown(mouseX, mouseY);
			},
			
			handle_mouseup: function(event)
			{
				var mouseX = event.clientX - canvasBoundingRectangle.x;
				var mouseY = event.clientY - canvasBoundingRectangle.y;
				
				UIHandler.handle_mouseup(mouseX, mouseY);
			},
			
			handle_mousemove: function(event)
			{
				var mouseX = event.clientX - canvasBoundingRectangle.x;
				var mouseY = event.clientY - canvasBoundingRectangle.y;
				
				mousePosition.x = mouseX;
				mousePosition.y = mouseY;
			},
			
			handle_keydown: function(keyevent)
			{
				var key = keyevent.key;
				if(key.length === 1 || key === "Backspace" || key === "Enter")
				{
					UIHandler.handle_keydown(key);
				}
				switch(keyevent.keyCode)
				{
					case 37:
					case 65:
						keysPressed["left"] = true;
						break;
					case 39:
					case 68:
						keysPressed["right"] = true;
						break;
					case 40:
					case 83:
						keysPressed["down"] = true;
						break;
					case 38:
					case 87:
						keysPressed["up"] = true;
						break;
				}
			},
			
			handle_keyup: function(keyevent)
			{
				var key = keyevent.key;
				if(key.length === 1 || key === "Backspace" || key === "Enter")
				{
					UIHandler.handle_keyup(key);
				}
				switch(keyevent.keyCode)
				{
					case 37:
					case 65:
						keysPressed["left"] = false;
						break;
					case 39:
					case 68:
						keysPressed["right"] = false;
						break;
					case 40:
					case 83:
						keysPressed["down"] = false;
						break;
					case 38:
					case 87:
						keysPressed["up"] = false;
						break;
				}
			},
		}
	}
)();

function Point(x,y)
{
	this.x = x;
	this.y = y;
}

function Rectangle(x,y,width,height)
{
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

Rectangle.prototype.isInBounds = function(x,y)
{
	if(x >= this.x && y >= this.y && x < this.x + this.width && y < this.y + this.height) return true;
	return false;
}

function create_image(path) 
{
	var image = document.createElement("img");
	image.src = path;

	return image;
}
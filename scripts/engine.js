var Engine = (
	function()
	{
		var _log = true;
		var lastTime = null;
		var paused = true;
		
		var CANVAS_WIDTH = 800;
		var CANVAS_HEIGHT = 600;
		
		var canvas;
		var context;
		var canvasBoundingRectangle;
		
		var settings = {};
		
		var mousePosition = {x:0, y:0};
		return {
			get context() {return context;},
			
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
				UIHandler.initialize();
				
				//
				document.body.addEventListener("mousedown",Engine.handle_mousedown, false);
				document.body.addEventListener("mouseup",Engine.handle_mouseup, false);
				document.body.addEventListener("mousemove",Engine.handle_mousemove, false);
				
				window.requestAnimationFrame(Engine.draw);
			},
			
			log: function(message)
			{
				if(_log)
				{
					console.log(message);
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
				Engine.tick(lapse);
				
				window.requestAnimationFrame(Engine.draw);
			},
			
			tick: function(lapse)
			{
				if(!paused)
				{
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
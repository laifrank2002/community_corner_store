/**
	A set of graphing components.
	We save space and computation by saving all results to a hidden off canvas first.
	
	function UIGraph(width, height, data)
	function UIGraphLine(width, height, data)
	function UIGraphMultiLine(width, height, data)
	function UIGraphBar(width, height, data, direction = "vertical")
	function UIGraphOverlayBar(width, height, data, direction = "vertical", overlay = "overlap")

	@date 12-06-2020
	@author laifrank2002
 */
function UIGraph(width, height, data)
{
	UIElement.call(this, null, null, width, height, "graph");
	
	this.buffer = document.createElement("canvas");
	this.bufferContext = this.buffer.getContext("2d");
	
	this.data = data;
	this.buffer.width = width;
	this.buffer.height = height;
}

UIGraph.prototype = Object.create(UIElement.prototype);
Object.defineProperty(UIGraph.prototype, 'constructor', {
	value: UIGraph,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UIGraph.prototype.draw = function(context)
{
	UIElement.prototype.draw.call(this, context);
	
	context.drawImage(this.buffer, this.x, this.y);
}

// blank interface to be implemented by children
UIGraph.prototype.drawBuffer = function() {}

UIGraph.prototype.drawData = function(context) {}

// @overrides
UIGraph.prototype.resize = function(width, height)
{
	UIElement.prototype.resize.call(this,width,height);
	
	this.buffer.width = width;
	this.buffer.height = height;
	
	this.drawBuffer();
}

UIGraph.prototype.setData = function(data)
{
	this.data = data;
	if(this.onsetdata) this.onsetdata.call(this);
	this.resize(this.width, this.height);
}

UIGraph.prototype.addData = function(data) {}

/**
	An axis graph is the base class for bar graphs, line graphs,
	scatter graphs, etc etc... basically anything that needs 
	to normalize data and etc works.
	
	Takes in data as... really anything. This won't matter; 
	Children will override default functions.
	Normally takes in data as array of points x,y.
	
	This saves us a lot of repeat code when it comes to remaking the axis.
	
	@date 12-06-2020
	@author laifrank2002
 */
function UIGraphAxis(width, height, data)
{
	UIGraph.call(this, width, height, data);
	
	this.xAxis;
	this.yAxis;
	
	this.graphWidth = this.width - this.xMargin;
	this.graphHeight = this.height - this.yMargin;
	
	this.horizontalGridlinesVisible = true;
	this.verticalGridlinesVisible = true;
	
	this.drawBuffer();
}

UIGraphAxis.prototype = Object.create(UIGraph.prototype);
Object.defineProperty(UIGraphAxis.prototype, 'constructor', {
	value: UIGraphAxis,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
UIGraphAxis.prototype.xAxisLabelCount = 20;
UIGraphAxis.prototype.yAxisLabelCount = 10;

UIGraphAxis.prototype.xAxisDecimalPlaces = 2;
UIGraphAxis.prototype.yAxisDecimalPlaces = 2;

UIGraphAxis.prototype.xMargin = 80;
UIGraphAxis.prototype.yMargin = 30;

UIGraphAxis.prototype.tickMarkLength = 10;

UIGraphAxis.prototype.isDataValid = function()
{
	if(this.data && this.data.length > 1) return true;
	return false;
}

UIGraphAxis.prototype.convertXAxisLabel = function(value)
{
	return (value).toFixed(this.xAxisDecimalPlaces);
}

UIGraphAxis.prototype.convertYAxisLabel = function(value)
{
	return (value).toFixed(this.yAxisDecimalPlaces);
}

UIGraphAxis.prototype.setGridlines = function(horizontalEnabled, verticalEnabled)
{
	this.horizontalGridlinesVisible = horizontalEnabled;
	this.verticalGridlinesVisible = verticalEnabled;
	
	this.drawBuffer();
}

UIGraphAxis.prototype.addData = function(data)
{
	if(!this.data) return;
	
	if(!Array.isArray(this.data)) return;
	
	if(data.x === undefined || data.y === undefined) return;
	
	this.data.push(data);
	this.setData(this.data);
}

UIGraphAxis.prototype.drawBuffer = function()
{
	this.normalizeAxis();
	
	// default canvas operations 
	var context = this.bufferContext;
	context.clearRect(0, 0, this.width, this.height);
	context.strokeStyle = this.font_colour;
	context.fillStyle = this.font_colour;
	
	// check if data is valid 
	if(!this.isDataValid())
	{
		UIDrawer.draw_text(context
			,"Not enough data."
			,0 + this.width / 2
			,0 + this.height / 2);
		return;
	}
	
	/*
	 * either one of these is zero 
	 * or we haven't initialized yet
	 * in which case, don't draw because 
	 * this is the first pass around.
	 */
	if(!this.graphWidth || !this.graphHeight) return;
	
	/*
	 * begin drawing operations; 
	 * we use one BIG path to save 
	 * on the expensive stroking operation
	 */
	context.beginPath();
	
	// horizontal line 
	context.moveTo(Math.floor(this.xMargin)
		,Math.floor(0 + this.graphHeight));
	context.lineTo(Math.floor(this.xMargin + this.graphWidth)
		,Math.floor(0 + this.graphHeight));
	// horizontal tick marks 
	for(var index = 0, length = this.xAxis.length; index < length; index++)
	{
		context.moveTo(Math.floor(this.xMargin + (this.graphWidth/this.xAxis.length) * index)
			,Math.floor(0 + this.graphHeight + this.tickMarkLength));
		context.lineTo(Math.floor(this.xMargin + (this.graphWidth/this.xAxis.length) * index)
			,Math.floor(0 + this.graphHeight));
	}
	// x axis labels
	for(var index = 0, length = this.xAxis.length; index < length; index++)
	{
		/* we reversed the y but not for the same reason as in map
		 * this is on a seperate axis and should have no impact on any outside modules 
		 * unless you want your map upside down that is.
		 */
		var text = this.convertXAxisLabel(this.xAxis[index]);
		var textMetric = context.measureText(text);
		UIDrawer.draw_text(context
			,text
			,Math.floor(this.xMargin + (this.graphWidth/this.xAxis.length) * index - textMetric.width/2)
			,Math.floor(0 + this.graphHeight + this.tickMarkLength)
			,"left");
	}
	// vertical line 
	context.moveTo(Math.floor(this.xMargin)
		,Math.floor(0 + this.graphHeight));
	context.lineTo(Math.floor(this.xMargin)
		,Math.floor(0));
	// vertical tick marks 
	for(var index = 0, length = this.yAxis.length; index < length; index++)
	{
		context.moveTo(Math.floor(this.xMargin - this.tickMarkLength)
			,Math.floor(0 + this.graphHeight - (this.graphHeight / this.yAxis.length) * index));
		context.lineTo(Math.floor((this.xMargin))
			,Math.floor(0 + this.graphHeight - (this.graphHeight / this.yAxis.length) * index));
	}
	// y axis labels 
	for(var index = 0, length = this.yAxis.length; index < length; index++)
	{
		var text = this.convertYAxisLabel(this.yAxis[index]);
		var textMetric = context.measureText(text);
		UIDrawer.draw_text(context 
			,text
			,this.xMargin - this.tickMarkLength - textMetric.width - 2
			,-2 - UIElement.prototype.font_size/2 + this.graphHeight - (this.graphHeight / this.yAxis.length) * index
			,"left");
	}
	
	// optional: draw gridlines minor 
	// vertical
	if(this.verticalGridlinesVisible)
	{
		for(var index = 0, length = this.xAxis.length; index < length; index++)
		{
			context.moveTo(Math.floor(this.xMargin + (this.graphWidth/this.xAxis.length) * index)
				,Math.floor(0 + this.graphHeight));
			context.lineTo(Math.floor(this.xMargin + (this.graphWidth/this.xAxis.length) * index)
				,Math.floor(0));
		}
	}
	// horizontal
	if(this.horizontalGridlinesVisible)
	{
		for(var index = 0, length = this.yAxis.length; index < length; index++)
		{
			context.moveTo(Math.floor(this.xMargin)
				,Math.floor(0 + this.graphHeight - (this.graphHeight / this.yAxis.length) * index));
			context.lineTo(Math.floor((this.xMargin + this.graphWidth))
				,Math.floor(0 + this.graphHeight - (this.graphHeight / this.yAxis.length) * index));
		}
	}
	
	// then we are done, and set the canvas down now.
	context.closePath();
	context.stroke();
	
	// delegate the inner contents to children
	this.drawData(context);
}

UIGraphAxis.prototype.drawData = function(context) {}

UIGraphAxis.prototype.normalizeAxis = function()
{
	/* 
	 * this fails silently because it is non-mission critical. 
	 * but more importantly: it is part of the normal use case!
	 */
	if(!this.isDataValid()) return;
	
	this.xAxis = [];
	this.yAxis = [];
	
	this.xMin = this.data[0].x;
	this.yMin = this.data[0].y;
	this.xMax = this.data[0].x;
	this.yMax = this.data[0].y;
	
	// get the smollest and biggest
	for(var index = 0, length = this.data.length; index < length; index++)
	{
		var point = this.data[index];
		
		if(point.x < this.xMin) this.xMin = point.x;
		if(point.y < this.yMin) this.yMin = point.y;
		if(point.x > this.xMax) this.xMax = point.x;
		if(point.y > this.yMax) this.yMax = point.y;
	}
	
	this.xRange = this.xMax - this.xMin;
	this.yRange = this.yMax - this.yMin;
	
	// now we configure scale labels naively
	for(var index = 0; index < this.xAxisLabelCount - 1; index++)
	{
		this.xAxis.push(this.xMin + (this.xRange / (this.xAxisLabelCount - 1)) * index);
	}
	this.xAxis.push(this.xMax);
	
	for(var index = 0; index < this.yAxisLabelCount - 1; index++)
	{
		this.yAxis.push(this.yMin + (this.yRange / (this.yAxisLabelCount - 1)) * index);
	}
	this.yAxis.push(this.yMax);
}

/**
	A line graph! Simple as can be.
	Takes in data as an array of points ordered by x ascending.
	@date 06-06-2020
	@author laifrank2002
 */
function UIGraphLine(width, height, data)
{
	UIGraphAxis.call(this, width, height, data);
}

UIGraphLine.prototype = Object.create(UIGraphAxis.prototype);
Object.defineProperty(UIGraphLine.prototype, 'constructor', {
	value: UIGraphLine,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });

UIGraphLine.prototype.xAxisLabelCount = 20;
UIGraphLine.prototype.yAxisLabelCount = 10;

UIGraphLine.prototype.xAxisDecimalPlaces = 2;
UIGraphLine.prototype.yAxisDecimalPlaces = 2;

UIGraphLine.prototype.xMargin = 80;
UIGraphLine.prototype.yMargin = 30;

UIGraphLine.prototype.tickMarkLength = 10;

UIGraphLine.prototype.drawData = function(context)
{
	// and draw the line!
	context.beginPath();
	context.lineWidth = 2;
	for(var index = 0, length = this.data.length; index < length; index++)
	{
		var point = this.data[index];
		// the reason we must divide by the weird fraction is because of the promise we've previously made to keep the axis label counts correct.
		var x = this.xMargin + ( (point.x - this.xMin) / this.xRange) * this.graphWidth * ((this.xAxis.length - 1) / this.xAxis.length);
		var y = -this.yMargin + this.height - ( (point.y  - this.yMin) / this.yRange) * this.graphHeight * ((this.yAxis.length - 1) / this.yAxis.length);
		
		if(index === 0)
		{
			context.moveTo(x,y);
		}
		else 
		{
			context.lineTo(x,y);
		}
	}
	context.stroke();
}

/**
	Many lines, one axis, one graph.
	Takes in data as an array of arrays.
	
	@date 12-06-2020
	@author laifrank2002
 */
function UIGraphMultiLine(width, height, data)
{
	UIGraphLine.call(this, width, height, data);
}

UIGraphMultiLine.prototype = Object.create(UIGraphLine.prototype);
Object.defineProperty(UIGraphMultiLine.prototype, 'constructor', {
	value: UIGraphMultiLine,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
// ooh! pretty colours! it cycles through them when it runs out gosh forbid.
// for ref: orange, green, red, blue, yellow, violet
UIGraphMultiLine.prototype.lineColours = ["#f5c43d","#40f252","#f06842","#6ae6f6","#eff14b","#ef4dca"];

UIGraphMultiLine.prototype.isDataValid = function()
{
	if(!this.data) return false;
	
	if(this.data.length < 1 || !Array.isArray(this.data)) return false;
	
	if(!Array.isArray(this.data[0]) || this.data[0].length < 1) return false;
	
	return true;
}

UIGraphMultiLine.prototype.drawData = function(context)
{
	var data = this.data;
	// and draw the lines!
	
	for(var lineIndex = 0, lineCount = data.length; lineIndex < lineCount; lineIndex++)
	{
		var line = data[lineIndex];
		
		context.beginPath();
		context.lineWidth = 2;
		context.strokeStyle = this.lineColours[lineIndex % this.lineColours.length];
		for(var index = 0, length = line.length; index < length; index++)
		{
			var point = line[index];
			// the reason we must divide by the weird fraction is because of the promise we've previously made to keep the axis label counts correct.
			var x = this.xMargin + ( (point.x - this.xMin) / this.xRange) * this.graphWidth * ((this.xAxis.length - 1) / this.xAxis.length);
			var y = -this.yMargin + this.height - ( (point.y  - this.yMin) / this.yRange) * this.graphHeight * ((this.yAxis.length - 1) / this.yAxis.length);
			
			if(index === 0)
			{
				context.moveTo(x,y);
			}
			else 
			{
				context.lineTo(x,y);
			}
		}
		context.stroke();
	}
}

UIGraphMultiLine.prototype.normalizeAxis = function()
{
	/* 
	 * this fails silently because it is non-mission critical. 
	 * but more importantly: it is part of the normal use case!
	 */
	if(!this.isDataValid()) return false;
	
	// we'll normalize based on the biggest and smallest of EVERYTHING's y 
	// be careful with this.
	this.xAxis = [];
	this.yAxis = [];
	
	this.xMin = this.data[0][0].x;
	this.yMin = this.data[0][0].y;
	this.xMax = this.data[0][0].x;
	this.yMax = this.data[0][0].y;
	
	// get the smollest and biggest
	for(var lineIndex = 0, lineCount = this.data.length; lineIndex < lineCount; lineIndex++)
	{
		var line = this.data[lineIndex];
		
		for(var index = 0, length = line.length; index < length; index++)
		{
			var point = line[index];
			
			if(point.x < this.xMin) this.xMin = point.x;
			if(point.y < this.yMin) this.yMin = point.y;
			if(point.x > this.xMax) this.xMax = point.x;
			if(point.y > this.yMax) this.yMax = point.y;
		}
	}
	
	this.xRange = this.xMax - this.xMin;
	this.yRange = this.yMax - this.yMin;
	
	// now we configure scale labels naively
	for(var index = 0; index < this.xAxisLabelCount - 1; index++)
	{
		this.xAxis.push(this.xMin + (this.xRange / (this.xAxisLabelCount - 1)) * index);
	}
	this.xAxis.push(this.xMax);
	
	for(var index = 0; index < this.yAxisLabelCount - 1; index++)
	{
		this.yAxis.push(this.yMin + (this.yRange / (this.yAxisLabelCount - 1)) * index);
	}
	this.yAxis.push(this.yMax);
}

UIGraphMultiLine.prototype.addData = function(data)
{
	if(!this.data) return;
	
	if(!Array.isArray(this.data)) return;
	
	if(!Array.isArray(this.data[0])) return;
	
	if(!Array.isArray(data)) return;
	
	if(!data[0] || data[0].x === undefined || data[0].y === undefined) return;
	
	this.data.forEach( (line, index) => line.push(data[index]) );
	this.setData(this.data);
}

/**
	Many lines, two axis, one graph.
	Takes in data as an array of objects which contain a data array, 
	and an argument pertaining to which axis it follows.
 */
function UIGraphDoubleAxisLine()
{
	// NOT IMPLEMENTED YET!
}

/**
	Bar graph! Takes in data as a dict of values.
	Direction determines which way the bars face.
	
	@date 12-06-2020
	@author laifrank2002
 */
function UIGraphBar(width, height, data, direction = "vertical")
{
	UIGraphAxis.call(this, width, height, data);
	
	this.direction = direction;
	
	this.drawBuffer();
}

UIGraphBar.prototype = Object.create(UIGraphAxis.prototype);
Object.defineProperty(UIGraphBar.prototype, 'constructor', {
	value: UIGraphBar,
	enumerable: false, // so that it does not appear in 'for in' loop
    writable: true });
	
UIGraphBar.prototype.dataAxisLabelCount = 10;
UIGraphBar.prototype.dataAxisDecimalPlaces = 2;

UIGraphBar.prototype.xMargin = 80;
UIGraphBar.prototype.yMargin = 30;

UIGraphBar.prototype.tickMarkLength = 10;

UIGraphBar.prototype.isDataValid = function()
{
	if(this.data && Object.keys(this.data).length > 0) return true;
	return false;
}

UIGraphBar.prototype.convertXAxisLabel = function(value)
{
	switch(this.direction)
	{
		case "horizontal":
			return (value).toFixed(this.xAxisDecimalPlaces);
			break;
		case "vertical":
		default:
			return value;
			break;
	}
}

UIGraphBar.prototype.convertYAxisLabel = function(value)
{
	switch(this.direction)
	{
		case "horizontal":
			return value;
			break;
		case "vertical":
		default:
			return (value).toFixed(this.yAxisDecimalPlaces);
			break;
	}
}

UIGraphBar.prototype.drawData = function(context)
{
	// which one is data or which one is naught, it'll depend.
	switch(this.direction)
	{
		case "horizontal":
			var barAxisLength = this.graphHeight / this.yAxis.length;
			
			for(var index = 0, length = this.yAxis.length; index < length; index++)
			{
				var contactCenterX = this.xMargin;
				var contactCenterY = this.graphHeight - (this.graphHeight / this.yAxis.length) * index;
				// the reason we must divide by the weird fraction is because of the promise we've previously made to keep the axis label counts correct.
				var barLength = ((this.data[this.yAxis[index]] - this.dataMin) / this.dataRange) * this.graphWidth * ((this.xAxis.length - 1) / this.xAxis.length);
				
				context.beginPath();
				context.rect(contactCenterX
					,contactCenterY - barAxisLength
					,barLength
					,barAxisLength);
				context.stroke();
				context.fill();
			}
			break;
		case "vertical":
		default:
			var barAxisLength = this.graphWidth / this.xAxis.length;
			
			for(var index = 0, length = this.xAxis.length; index < length; index++)
			{
				var contactCenterX = this.xMargin + (this.graphWidth / this.xAxis.length) * index;
				var contactCenterY = this.graphHeight;
				// the reason we must divide by the weird fraction is because of the promise we've previously made to keep the axis label counts correct.
				var barLength = ((this.data[this.xAxis[index]] - this.dataMin) / this.dataRange) * this.graphHeight * ((this.yAxis.length - 1) / this.yAxis.length);
				
				context.beginPath();
				context.rect(contactCenterX
					,contactCenterY - barLength
					,barAxisLength
					,barLength);
				context.stroke();
				context.fill();
			}
			break;
	}
}

UIGraphBar.prototype.normalizeAxis = function()
{
	if(!this.isDataValid()) return;
	
	this.dataMin = this.data[Object.keys(this.data)[0]];
	this.dataMax = this.data[Object.keys(this.data)[0]];
	
	for(var key in this.data)
	{
		if(this.data[key] < this.dataMin) this.dataMin = this.data[key];
		if(this.data[key] > this.dataMax) this.dataMax = this.data[key];
	}
	
	this.dataRange = this.dataMax - this.dataMin;
	
	// configure axis 
	this.xAxis = [];
	this.yAxis = [];
	
	switch(this.direction)
	{
		case "horizontal":
			this.xAxisLabelCount = this.dataAxisLabelCount;
			this.xAxisDecimalPlaces = this.dataAxisDecimalPlaces;
			this.xMin = this.dataMin;
			this.xMax = this.dataMax;
			this.xRange = this.dataRange;
			for(var index = 0; index < this.xAxisLabelCount - 1; index++)
			{
				this.xAxis.push(this.xMin + (this.xRange / (this.xAxisLabelCount - 1)) * index);
			}
			this.xAxis.push(this.xMax);
			
			for(var key in this.data)
			{
				this.yAxis.push(key);
			}
			break;
		case "vertical": 
		default: 
			this.yAxisLabelCount = this.dataAxisLabelCount;
			this.yAxisDecimalPlaces = this.dataAxisDecimalPlaces;
			this.yMin = this.dataMin;
			this.yMax = this.dataMax;
			this.yRange = this.dataRange;
			for(var index = 0; index < this.yAxisLabelCount - 1; index++)
			{
				this.yAxis.push(this.yMin + (this.yRange / (this.yAxisLabelCount - 1)) * index);
			}
			this.yAxis.push(this.yMax);
			
			for(var key in this.data)
			{
				this.xAxis.push(key);
			}
			break;
	}
}

// this just means we add a new bar; using a {key:key, value:value} pair
UIGraphBar.prototype.addData = function(data)
{
	this.data[data.key] = data.value;
}

/**
	Bar graph with a twist!
	Takes in data as a dict of arrays of values.
	There are options for either 
		- overlap (which will be done SMARTLY) so that all bars as possible are visible
		- or for stacked, where they will be added on top of each other
		
	@date 12-06-2020
	@author laifrank2002.
 */
function UIGraphOverlayBar(width, height, data, direction = "vertical", overlay = "overlap")
{
	
}

/**
	Mmmm... graph pie.
 */
function UIGraphPie()
{
	
}
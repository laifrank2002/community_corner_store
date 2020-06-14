/*
	Data displayer. Takes yer data and makes it pretty, and stores old data.
	Note that this is purely a presenter. This means that it should NEVER modify data at all.
 */

var Reports = (
	function()
	{
		// the BIG tabbed pane!
		var reportsDisplay;
		
		// sales 
		var salesOverviewTab;
		
		var salesCountGraph;
		var salesValueGraph;
		
		// item breakdown
		var itemBreakdownTab;
		
		var itemBreakdownTitle;
		
		var itemBreakdownSelector;
		var itemBreakdownItemSelected;
		
		var itemBreakdownSalesCountGraph;
		var itemBreakdownSalesValueGraph;
		
		// demand 
		var demandOverviewTab;
		
		return {
			initialize: function()
			{
				reportsDisplay = new UITabbedPanel(null, null, ReportsElement.width, ReportsElement.height);
				ReportsElement.addSubElement(reportsDisplay, 0, 0);
				
				// sales overview 
				// remember that it's going to be set by tabbed panel anyways so we don't care about width and height
				salesOverviewTab = new UIPanel(null,null,1,1);
				reportsDisplay.addSubPanel("Sales",salesOverviewTab);
				salesCountGraph = new UIGraphLine(700,200,[]);
				salesCountGraph.xAxisDecimalPlaces = 0;
				salesOverviewTab.addSubElement(salesCountGraph,50,50);
				salesValueGraph = new UIGraphLine(700,200,[]);
				salesValueGraph.xAxisDecimalPlaces = 0;
				salesOverviewTab.addSubElement(salesValueGraph,50,250);
				
				// item breakdown 
				itemBreakdownTab = new UIPanel(null,null,1,1);
				reportsDisplay.addSubPanel("Items",itemBreakdownTab);
				
				itemBreakdownTitle = new UILabel("","center");
				itemBreakdownTab.addSubElement(itemBreakdownTitle, itemBreakdownTab.width/2, 10 + 10);
				
				itemBreakdownSelector = new UIComboBox(250,25,Object.keys(items).map(key => items[key].name),
					function(value)
					{
						// reverse lookup name into key (I'm sorry not sorry).
						var key = findValueInPropertyInObject(items,"name",value);
						
						// for some strange reason if it doesn't exist...
						if(!items[key]) return;
						
						Reports.setItemBreakdownItemSelected(key);
						
						// and now display da data!
						Reports.updateItemBreakdown();
					});
				itemBreakdownTab.addSubElement(itemBreakdownSelector,10,10);
				
				itemBreakdownSalesCountGraph = new UIGraphMultiLine(700,200,[[]]);
				itemBreakdownSalesCountGraph.xAxisDecimalPlaces = 0;
				itemBreakdownTab.addSubElement(itemBreakdownSalesCountGraph,50, 50);
				itemBreakdownSalesValueGraph = new UIGraphMultiLine(700,200,[[]]);
				itemBreakdownSalesValueGraph.xAxisDecimalPlaces = 0;
				itemBreakdownTab.addSubElement(itemBreakdownSalesValueGraph,50, 250);
				
				// demand overview 
				demandOverviewTab = new UIPanel(null,null,1,1);
				reportsDisplay.addSubPanel("Demand", demandOverviewTab);
				
				demandOverviewGraph = new UIGraphBar(700,400,{}, "horizontal");
				demandOverviewTab.addSubElement(demandOverviewGraph, 50, 50);
			},
			
			onOpen: function()
			{
				// only refresh when we need to.
				// IFF the user opens the tab do we generate all those pretty graphs
				Reports.update();
			},
			
			update: function()
			{
				salesCountGraph.setData(History.getAllDaysStatistic("sales_count").map((statistic, index) => {return {x:index+1,y:statistic}}));
				salesValueGraph.setData(History.getAllDaysStatistic("sales_value").map((statistic, index) => {return {x:index+1,y:statistic}}));
				
				Reports.updateItemBreakdown();
				
				var demandData = History.getRecentItemBreakdownOverviewStatistic("demand");
				var polishedDemandData = {};
				for(var key in demandData)
				{
					polishedDemandData[items[key].name] = demandData[key];
				}
				
				demandOverviewGraph.setData(polishedDemandData);
			},
			
			updateItemBreakdown: function()
			{
				var item = items[itemBreakdownItemSelected];
				if(item)
				{
					itemBreakdownTitle.setText(`Sales data for ${item.name}`);
					itemBreakdownSelector.set_selected(item.name);
					
					// oh boy... this mapping is going to take a long time...
					try 
					{
						itemBreakdownSalesCountGraph.setData([History.getAllDaysItemBreakdownStatistic(itemBreakdownItemSelected,"demand").map((statistic, index) => {return {x: index + 1, y: statistic}})
							,History.getAllDaysItemBreakdownStatistic(itemBreakdownItemSelected,"sales_count").map( (statistic, index) => {return {x:index+1, y:statistic}} )]); 
							
						itemBreakdownSalesValueGraph.setData([History.getAllDaysItemBreakdownStatistic(itemBreakdownItemSelected,"sales_value").map((statistic, index) => {return {x: index + 1, y: statistic}})
							,History.getAllDaysItemBreakdownStatistic(itemBreakdownItemSelected,"profit_value").map( (statistic, index) => {return {x:index+1, y:statistic}} )]); 
					}
					catch(exception)
					{
						Engine.log(`Reports: unable to parse item data.`);
						Engine.log(exception);
					}
				}
			},
			
			setItemBreakdownItemSelected: function(key)
			{
				itemBreakdownItemSelected = key;
			},
		}
	}
)();

// Graphing submodule.
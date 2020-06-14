/**
	Composites and keeps track of all relevant data.
	NOTE: We don't need a fromData or toData,
	because it ALREADY IS data, and can be safely stringified.
	
	@date 2020-06-05
 */
var History = (
	function()
	{
		var day = 0;
		
		return {
			initialize: function()
			{
				day = State_manager.get_state("world","day");
			},
			
			addDay: function(data)
			{
				day = State_manager.get_state("world","day");
				
				var stats = {day: day};
				for(var key in data)
				{
					stats[key] = data[key];
				}
				
				State_manager.add_state("statistics","history",stats);
			},
			
			getDay: function(day)
			{
				var days = State_manager.get_state("statistics","history");
				return days[day];
			},
			
			getDayCount: function()
			{
				return day;
			},
			
			// returns a dict of item breakdown and values
			getRecentItemBreakdownOverviewStatistic: function(statisticName)
			{
				var overview = {};
				var days = State_manager.get_state("statistics","history");
				if(days.length < 1) return;
				var mostRecentDay = days[days.length - 1];
				
				for(var key in mostRecentDay["item_breakdown"])
				{
					overview[key] = mostRecentDay["item_breakdown"][key][statisticName];
				}
				
				return overview;
			},
			
			getAllDays: function()
			{
				var days = State_manager.get_state("statistics","history");
				return days;
			},
			
			getAllDaysStatistic: function(statisticName)
			{
				var days = State_manager.get_state("statistics","history");
				return days.map( day => day[statisticName] );
			},
			
			getAllDaysItemBreakdownStatistic: function(itemKey, statisticName)
			{
				var days = State_manager.get_state("statistics","history");
				return days.map( day => day["item_breakdown"][itemKey][statisticName] );
			},
			
		}
	}
)();
/**
	Stores all player based data. Stores it in a special data variable.
	A reminder to please only save AT THE END OF A TICK.
	Stores 
		- User Data
 */
var State_manager = (
	function()
	{
		var categories = ["shop","player","settings"];
		var data = {};
		
		return {
			get data() {return data},
			
			initialize: function()
			{
				/* takes the categories and initializes them */
				categories.forEach(category => data[category] = {});
				
				// temp until saving and loading is figured out 
				State_manager.start_new_game();
			},
			
			// if there are no previous saves, population data with defaults.
			start_new_game: function()
			{
				data["world"] = {}
			},
			
			set_state: function(category,id,value)
			{
				if(data[category])
				{
					data[category][id] = value;
					listeners.forEach(listener => listener.trigger(category,id));
				}
				else 
				{
					Engine.log("Set Data: No such category: " + category + " exists.");
				}
			},
			
			/**
				For convienience
			 */
			add_state: function(category,id,value)
			{
				if(data[category])
				{
					if(typeof data[category][id] !== "object")
					{
						State_manager.set_state(category,id
							,State_manager.get_state(category,id) + value);
					}
				}
				else 
				{
					Engine.log("Add Data: No such category: " + category + " exists.");
				}
			},
			
			get_state: function(category,id)
			{
				if(data[category])
				{
					// if no id, we assume it's the category being requested
					if(id === undefined) return data[category]
					return data[category][id];
				}
				else 
				{
					Engine.log("Get Data: No such category: " + category + " exists.");
				}
			},
			
			export_data: function()
			{
				Engine.log("Stringifying data for pasta... ");
				try 
				{
					return JSON.stringify(data);
				}
				catch(exception)
				{
					Engine.log(`Unable to stringify data, exception: ${exception.message}`);
				}
			},
			
			import_data: function(data_string)
			{
				var imported_data;
				
				Engine.log("Importing pasta...");
				
				try 
				{
					imported_data = JSON.parse(data_string);
				}
				catch(exception)
				{
					Engine.log(`Unable to parse data, exception: ${exception.message}`);
				}
				
				for(var key in imported_data)
				{
					Engine.log(`Pasta ${key} is being added`);
					// this will add unnecessary info, but that's fine. What's important is that we get the right initializations in.
					data[key] = imported_data[key];
				}
			},
			
			load: function()
			{
				
			},
			
			save: function()
			{
				
			},
		}
	}
)();
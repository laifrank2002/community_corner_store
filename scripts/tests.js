/**
	Testing module, makes sure everything comes up correctly AUTOMATICALLY.
		- Tests every module and object 
		- Alerts programmer to every mistake 
		- Otherwise report all clear 
	Attachable, which means CAN BE DELETED WITH ZERO CONSEQUENCES!
 */

var ShopTestingModule = (
	function()
	{
		var tests = 0;
		var successfulTests = 0;
		
		function test(description, test)
		{
			tests++;
			try {
				if(test())
				{
					Engine.log(`\u2713 ${description}`);
					successfulTests++;
					return true;
				}
				throw 'Does not match expected value.';
			}
			catch(exception)
			{
				Engine.log(`\u2717 ${description}\n 	${exception}`);
				return false;
			}
		}
		
		function assertEqual(processingValue, expectedValue)
		{
			if(processingValue === expectedValue)
			{
				return true;
			}
			return false;
		}
		
		return {
			run: function()
			{
				test("indicates GridMap's length is correct",() => {
					assertEqual((new GridMap(5,10)).map.length,50);
				});
				
				Engine.log(`ShopTestingModule...\n	${successfulTests} out of ${tests} tests.`);
			},
			
		}
	}
)();


// test maps
if(Engine._debug)
{
	ShopTestingModule.run();
}


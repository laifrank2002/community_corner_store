/**
	Bundles together tests for simplifying processing 
	- Summarizes test pass fail rates for human display.
	- Note to the enterprising player who decides to open up the code: tests CAN BE DESTRUCTIVE. 
	- These are run in integrated object scenarios, where StateManager is automatically included in any such system.
	@author laifrank2002
	@date 2020-05-21
 */

var TestingManager = (
	function()
	{
		var tests = [];
		
		/**
			Wraps a test to make it easier to write tests 
			- checks a test result against a specific expected value
			@param name - a descriptive name for what the test tests for 
			@param test - a function that when run, returns a specific output value 
			@param expected - the expected value to be used
			@author laifrank2002
			@date 2020-05-21
		 */
		function Test(name, test, expected, condition = "assertEquals", repeat = 1)
		{
			this.name = name;
			this.test = test;
			this.expected = expected;
			
			switch(condition)
			{
				case "assertContains": 
					this.condition = this.assertContains;
					break;
				case "assertEquals": 
					this.condition = this.assertEquals;
					break;
				case "assertGreaterThanExclusive":
					this.condition = this.assertGreaterThanExclusive;
					break;
				case "assertGreaterThanInclusive":
					this.condition = this.assertGreaterThanInclusive;
					break;
				case "assertLessThanExclusive":
					this.condition = this.assertLessThanExclusive;
					break;
				case "assertLessThanInclusive":
					this.condition = this.assertLessThanInclusive;
					break;
				case "assertNotEquals":
					this.condition = this.assertNotEquals;
					break;
				case "assertObjectEquals": 
					this.condition = this.assertObjectEquals;
					break;
				case "assertObjectDeepEquals": 
					this.condition = this.assertObjectDeepEquals;
					break;
				case "assertWithinRange":
					this.condition = this.assertWithinRange;
					break;
				default:
					// custom conditions 
					this.condition = condition;
					break;
			}
			
			this.repeat = repeat;
		}
		
		/**
			Runs the test and checks if the output value is the same as the expected value.
			@return boolean - if the test passes or not
			@author laifrank2002
			@date 2019-12-29
		 */
		Test.prototype.run = function()
		{
			// ensure repeat integrity 
			if(!(this.repeat > 0 && Number.isInteger(this.repeat))) this.logError(`repeat '${this.repeat}' is invalid, only integers greater than 0 allowed.`);
			
			for(var index = 0; index < this.repeat; index++)
			{
				try 
				{
					var output = this.test();
				}
				catch(error)
				{
					this.logError(error.message);
					return false;
				}
				// if it fails just once, then it's already failed 
				if(!this.condition(output))
				{
					Engine.log(`failed: ${this.name} at repeat ${index}`);
					Engine.log(`	expected: ${JSON.stringify(this.expected)}`);
					Engine.log(`	output: ${JSON.stringify(output)}`);
					return false;
				}
			}
			
			Engine.log(`passed: ${this.name}`);
			return true;
		}
		
		/**
			Checks if the output is equal to the expectation.
			@return boolean - if it's equal or not 
			@author laifrank2002
			@date 2019-12-29
		 */
		Test.prototype.assertEquals = function(output)
		{
			if(output === this.expected)
			{
				return true;
			}
			return false;
		}
		
		/**
			Checks if the output is NOT equal to the expectation.
			@param the output
			@return boolean - if it's not equal or not 
			@author laifrank2002
			@date 2019-12-29
		 */
		Test.prototype.assertNotEquals = function(output)
		{
			if(output !== this.expected)
			{
				return true;
			}
			return false;
		}
		
		/**
			Checks if the output is within a set range of the expectation.
			Min side inclusive, max side exclusive.
			Only for integers.
			Expected must be in the format: 
				{min: min, max: max}
			Min must be greater than max.
			@param the output
			@return boolean - if it's within range or not 
			@author laifrank2002 
			@date 2019-12-29
		 */
		Test.prototype.assertWithinRange = function(output)
		{
			if(!(this.expected.min < this.expected.max))
			{
				this.logError(`expected minimum '${this.expected.min}' is greater than or equal to expected maximum '${this.expected.max}'.`);
			}
			
			if(output >= this.expected.min && output < this.expected.max)
			{
				return true;
			}
			return false;
		}
		
		/**
			Checks if output is greater than a value exclusive from expected
			@param the output
			@return boolean - if it's greater than exclusive the number or not 
			@author laifrank2002 
			@date 2019-12-29
		 */
		Test.prototype.assertGreaterThanExclusive = function(output)
		{
			if(output > this.expected)
			{
				return true;
			}
			return false;
		}
		
		/**
			Checks if output is greater than a value inclusive from expected
			@param the output
			@return boolean - if it's greater than inclusive the number or not 
			@author laifrank2002 
			@date 2019-12-29
		 */
		Test.prototype.assertGreaterThanInclusive = function(output)
		{
			if(output >= this.expected)
			{
				return true;
			}
			return false;
		}
		
		/**
			Checks if output is less than a value exclusive from expected
			@param the output
			@return boolean - if it's less than exclusive the number or not 
			@author laifrank2002 
			@date 2019-12-29
		 */
		Test.prototype.assertLessThanExclusive = function(output)
		{
			if(output < this.expected)
			{
				return true;
			}
			return false;
		}
		
		/**
			Checks if output is less than a value inclusive from expected
			@param the output
			@return boolean - if it's less than inclusive the number or not 
			@author laifrank2002 
			@date 2019-12-29
		 */
		Test.prototype.assertLessThanInclusive = function(output)
		{
			if(output <= this.expected)
			{
				return true;
			}
			return false;
		}
		
		/**
			Checks if the expectation contains the output 
			Can be for objects OR arrays (it's all one big object anyways) 
			@param the output 
			@return boolean - if the expectation contains the output 
			@author laifrank2002 
			@date 2019-12-29
		 */
		Test.prototype.assertContains = function(output)
		{
			for(var key in this.expected)
			{
				if(this.expected[key] === output)
				{
					return true;
				}
			}
			return false;
		}
		
		/**
			Checks if every single property is equal to each other using the === operator.
			Is not a deep comparison, so [] === [] returns false.
			@param the output 
			@return boolean - if each key matches between two objects
			@author laifrank2002 
			@date 2020-05-21
		 */
		Test.prototype.assertObjectEquals = function(output)
		{
			for(var key in this.expected)
			{				
				if(!(this.expected[key] === output[key]))
				{
					return false;
				}
			}
			return true;
		}
		
		/**
			Checks if every single property is equal to each other using the === operator. 
			When it encounters a more complex construct, like [] or {}, it runs recursively. In this case, [] === [] returns true.
			
			@param the output 
			@return boolean - if each key matches between two objects AND if the same operation applies to every level deeper
			@author laifrank2002 
			@date 2020-05-21
		 */
		Test.prototype.assertObjectDeepEquals = function(output)
		{
			function CompareRecursively(left, right)
			{
				if(left instanceof Object)
				{
					if(left !== right)
					{
						// compare each key 
						for(var key in left)
						{
							if(!CompareRecursively(left[key], right[key])) return false;
						}
					}
				}
				else if(left instanceof Array)
				{
					if(left.length !== right.length) return false;
					// compare each element
					for(var index = 0, length = left.length; index < length; index++)
					{
						if(!CompareRecursively(left[index], right[index])) return false;
					}
				}
				else 
				{
					// compare the properties 
					if(left !== right) return false;
				}
				
				return true;
			}
			
			return CompareRecursively(this.expected, output);
		}
		
		/**
			Logs an error.
			@param the error message.
			@author laifrank2002 
			@date 2019-12-29
		 */
		Test.prototype.logError = function(errorMessage)
		{
			Engine.log(`error: ${this.name}`);
			Engine.log(`	${errorMessage}`);
		}
		
		return {
			/**
				Runs all the tests and aggregates results
				- logs results to the console
				@author laifrank2002
				@date 2019-12-02
			 */
			runTests: function()
			{
				var totalTestCount = tests.length;
				var passedTestCount = 0;
				
				Engine.log(`Testing everything! Running a total of ${totalTestCount} tests.`);
				
				tests.forEach(test => 
				{
					if(test.run())
					{
						passedTestCount++;
					}
				});
				
				Engine.log(`Testing complete. ${passedTestCount}/${totalTestCount} passed, which is a success rate of ${(100 * passedTestCount/totalTestCount).toFixed(2)}%.`);
			},
			
			/**
				Adds and creates a new test 
				@param name - a descriptive name for what the test tests for 
				@param test - a function that when run, returns a specific output value 
				@param expected - the expected value to be used
				@author laifrank2002
				@date 2019-12-29
			 */
			addTest: function(name, test, expected, condition, repeat)
			{
				tests.push(new Test(name, test, expected, condition, repeat));
			},
		}
	}
)();
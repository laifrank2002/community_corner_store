/**
	Defines
	This is not the final item used in game. 
	This is used as a template
	
	Community Stats:
	health: 2,
	wealth: 2,
	environment: 3,
	entertainment: 2,
	security: 2,
	education: 1,
	
	@author laifrank2002
	@date 2020-04-16
 */
var items = {
	"beer": {
		key: "beer",
		name: "Beer",
		buy_price: {min: 50, max: 100, start: 75},
		effects: {health: -0.005},
	},
	"book": {
		key: "book",
		name: "Book",
		buy_price: {min: 300, max: 500, start: 350},
		effects: {education: +0.005},
	},
	"candy": {
		key: "candy",
		name: "Candy",
		buy_price: {min: 50, max: 100, start: 75},
		effects: {health: -0.001},
	},
	"canned_tuna": {
		key: "canned_tuna",
		name: "Canned Tuna",
		buy_price: {min: 100, max: 300, start: 150},
		effects: {health: -0.001},
	},
	"chips": {
		key: "chips",
		name: "Chips",
		buy_price: {min: 50, max: 125, start: 75},
		effects: {health: -0.001},
	},
	"cigarettes": {
		key: "cigarettes",
		name: "Cigarettes",
		buy_price: {min: 150, max: 300, start: 150},
		effects: {health: -0.010},
	},
	"cooking_oil": {
		key: "cooking_oil",
		name: "Cooking Oil",
		buy_price: {min: 100, max: 500, start: 250},
		effects: {},
	},
	"cough_medicine": {
		key: "cough_medicine",
		name: "Cough Medicine",
		buy_price: {min: 400, max: 600, start: 550},
		effects: {},
	},
	"eggs": {
		key: "eggs",
		name: "Eggs",
		buy_price: {min: 100, max: 150, start: 150},
		effects: {health: 0.001},
	},
	"flour": {
		key: "flour",
		name: "Flour",
		buy_price: {min: 200, max: 500, start: 250},
		effects: {},
	},
	"fruits": {
		key: "fruits",
		name: "Fruits",
		buy_price: {min: 200, max: 300, start: 250},
		effects: {health:0.005},
	},
	"hard_liquor": {
		key: "hard_liquor",
		name: "Hard Liquor",
		buy_price: {min: 500, max: 1000, start: 750},
		effects: {health: -0.02},
	},
	"lottery_ticket": {
		// SPECIAL!!!
		key: "lottery_ticket",
		name: "Lottery Ticket",
		buy_price: {min: 0, max: 0, start: 0},
		effects: {wealth:-0.0005},
	},
	"milk": {
		key: "milk",
		name: "Milk",
		buy_price: {min: 150, max: 300, start: 200},
		effects: {health:0.005},
	},
	"phone": {
		key: "phone",
		name: "Phone",
		buy_price: {min:500*100,max:600*100,start:550*100},
		effects: {education: 0.01, health: -0.005},
	},
	"phone_accessories": {
		key: "phone_accessories",
		name: "Phone Accessories",
		buy_price: {min:1000,max:2000,start:1500},
		effects: {},
	},
	"soda": {
		key: "soda",
		name: "Soda",
		buy_price: {min: 50, max: 100, start: 75},
		effects: {health: -0.001},
	},
	"snacks": {
		key: "snacks",
		name: "Snacks",
		buy_price: {min: 75, max: 150, start: 100},
		effects: {health: -0.0005},
	},
	"stationery": {
		key: "stationery",
		name: "Stationery",
		buy_price: {min: 300, max: 400, start: 350},
		effects: {},
	},
	"school_supplies": {
		key: "school_supplies",
		name: "School Supplies",
		buy_price: {min: 200, max: 300, start: 250},
		effects: {education: +0.004},
	},
	"vegetables": {
		key: "vegetables",
		name: "Vegetables",
		buy_price: {min: 100, max: 200, start: 150},
		effects: {health: 0.008},
	},
	"wine": {
		key: "wine",
		name: "Wine",
		buy_price: {min: 500, max: 2000, start: 850},
		effects: {health: -0.003},
	},
}
var calc = require("../lib/calculate.js");

var fs = require("fs");
var engines = JSON.parse(fs.readFileSync("engines.json"));
var assert = require('assert');

var plan = JSON.parse(fs.readFileSync("plan.json"));

describe("Calculate", () => {
  describe("#calculateThrust", () => {
    it("Should calculate difficulty 3, a soyuz correctly with thrust of 7 and mass of 9", () => {
        var [thrust,enginemass]= calc.calculateThrust("soyuz", 3, engines);
        assert.equal(thrust, 7);
        assert.equal(enginemass, 9);
    });
    it("Should calculate difficulty 3, 3 soyuz correctly with thrust of 21 and mass of 27", () => {
        var [thrust,enginemass] = calc.calculateThrust([3,"soyuz"], 3, engines);
        assert.equal(thrust, 21);
        assert.equal(enginemass, 27);
    });
    it("Should calculate difficulty 3, 4 saturns and 3 soyuz correctly with a thrust of 101 and mass of 107", () => {
        var [thrust,enginemass] = calc.calculateThrust([[4, "saturn"], [3,"soyuz"]], 3, engines);
        assert.equal(thrust, 101);
        assert.equal(enginemass, 107);
    });

  });
  describe("#calculatePlan", () => {
    it("Should add and remove mass correctly", () => {
        calc.calculatePlan(plan);
        console.log(plan);
    });
  });
});




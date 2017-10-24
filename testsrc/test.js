var calc = require("../lib/calculate.js");

var fs = require("fs");
var engines = JSON.parse(fs.readFileSync("engines.json"));
var assert = require('assert');

var plan = JSON.parse(fs.readFileSync("plan.json"));
/* Next steps

1. Move the calculator to an object to hide the rockets.
2. Implement burn for calculatePlan
3. Change calculateThrust to take object/dict
*/

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
        var data={ "steps" : [ { "step" : "add", "mass" : 10 }, { "step" :
        "remove", "mass": 5 } ] }
        calc.calculatePlan(data, engines);
        assert.equal(data.steps[0].currentMass, 10);
        assert.deepEqual(data.steps[0].currentRockets, []);
        assert.equal(data.steps[1].currentMass, 5);
        assert.deepEqual(data.steps[1].currentRockets, []);
    });
    it("Should add and remove rockets correctly and calculate mass", () => {
      var data={ "steps" : [
        { "step" : "add", "mass" : 0, "rockets":{"soyuz":3,"saturn":1}},
        { "step" : "remove", "mass": 0,  "rockets": {"soyuz": 2}}
      ] };
      calc.calculatePlan(data, engines);
      assert.equal(data.steps[0].currentMass, 3*9+20);
      assert.deepEqual(data.steps[0].currentRockets, {"soyuz":3,"saturn":1});
      assert.equal(data.steps[1].currentMass, 9+20);
      assert.deepEqual(data.steps[1].currentRockets, {"soyuz":1,"saturn":1});
    });

  });
});

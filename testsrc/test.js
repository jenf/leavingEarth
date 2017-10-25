var calc = require("../lib/calculate.js");

var fs = require("fs");
var engines = JSON.parse(fs.readFileSync("engines.json"));
var assert = require('assert');

var plan = JSON.parse(fs.readFileSync("plan.json"));
/* Next steps

2. Implement burn for calculatePlan
*/

describe("Calculate", () => {
  describe("#calculateThrust", () => {
    it("Should calculate difficulty 3, a soyuz correctly with thrust of 7 and mass of 9", () => {
        var lec = new calc.LeavingEarthCalculator(engines);
        var [thrust,enginemass]= lec.calculateThrustAndMass("soyuz", 3);
        assert.equal(thrust, 7);
        assert.equal(enginemass, 9);
    });
    it("Should calculate difficulty 3, 3 soyuz correctly with thrust of 21 and mass of 27", () => {
        var lec = new calc.LeavingEarthCalculator(engines);
        var [thrust,enginemass]= lec.calculateThrustAndMass([3,"soyuz"], 3, engines);
        assert.equal(thrust, 21);
        assert.equal(enginemass, 27);
    });
    it("Should calculate difficulty 3, 4 saturns and 3 soyuz correctly with a thrust of 101 and mass of 107", () => {
        var lec = new calc.LeavingEarthCalculator(engines);
        var [thrust,enginemass]= lec.calculateThrustAndMass([[4, "saturn"], [3,"soyuz"]], 3, engines);
        assert.equal(thrust, 101);
        assert.equal(enginemass, 107);
    });
    it("Should calculate difficulty 3, 4 saturns and 3 soyuz correctly in an object with a thrust of 101 and mass of 107", () => {
        var lec = new calc.LeavingEarthCalculator(engines);
        var [thrust,enginemass]= lec.calculateThrustAndMass({"saturn":4, "soyuz":3}, 3, engines);
        assert.equal(thrust, 101);
        assert.equal(enginemass, 107);
    });

  });
  describe("#calculatePlan", () => {
    it("Should add and remove mass correctly", () => {
        var data={ "steps" : [ { "step" : "add", "mass" : 10 }, { "step" :
        "remove", "mass": 5 } ] };
        var lec = new calc.LeavingEarthCalculator(engines);
        lec.calculatePlan(data);
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
      var lec = new calc.LeavingEarthCalculator(engines);
      lec.calculatePlan(data);
      assert.equal(data.steps[0].currentMass, 3*9+20);
      assert.deepEqual(data.steps[0].currentRockets, {"soyuz":3,"saturn":1});
      assert.equal(data.steps[1].currentMass, 9+20);
      assert.deepEqual(data.steps[1].currentRockets, {"soyuz":1,"saturn":1});
    });

  });
});

var LeavingEarthCalculator = require("../src/lib/leavingEarth.js").LeavingEarthCalculator;

var fs = require("fs");
var engines = JSON.parse(fs.readFileSync("src/engines.json"));
var assert = require('assert');

describe("Calculate", () => {
  describe("#getEngines", () => {
    it("Should return all engines and other things when filter is false", () => {
    var lec = new LeavingEarthCalculator(engines);
    assert.deepEqual(lec.getEngines(false).sort(), ["juno","atlas","soyuz","saturn","proton","ion", "shuttle", "daedalus", "otherMass","largeFuelTank", "smallFuelTank"].sort());
    });
      it("Should return all engines when filter is true", () => {
      var lec = new LeavingEarthCalculator(engines);
      assert.deepEqual(lec.getEngines(true).sort(), ["juno","atlas","soyuz","saturn","proton","ion", "shuttle", "daedalus"].sort());
      });
  });

  describe("#calculateThrust", () => {
    it("Should calculate difficulty 5, a soyuz correctly with thrust of 7 and mass of 9", () => {
        var lec = new LeavingEarthCalculator(engines);
        var [thrust,enginemass]= lec.calculateThrustAndMass("soyuz", 5);
        assert.equal(thrust, 7);
        assert.equal(enginemass, 9);
    });

    it("Should calculate difficulty 5, 3 soyuz correctly with thrust of 21 and mass of 27", () => {
        var lec = new LeavingEarthCalculator(engines);
        var [thrust,enginemass]= lec.calculateThrustAndMass([3,"soyuz"], 5);
        assert.equal(thrust, 21);
        assert.equal(enginemass, 27);
    });

    it("Should calculate difficulty 5, 4 saturns and 3 soyuz correctly with a thrust of 101 and mass of 107", () => {
        var lec = new LeavingEarthCalculator(engines);
        var [thrust,enginemass]= lec.calculateThrustAndMass([[4, "saturn"], [3,"soyuz"]], 5);
        assert.equal(thrust, 101);
        assert.equal(enginemass, 107);
    });

    it("Should calculate difficulty 5, 4 saturns and 3 soyuz correctly in an object with a thrust of 101 and mass of 107", () => {
        var lec = new LeavingEarthCalculator(engines);
        var [thrust,enginemass]= lec.calculateThrustAndMass({"saturn":4, "soyuz":3}, 5);
        assert.equal(thrust, 101);
        assert.equal(enginemass, 107);
    });

    it("Should calculate difficulty 1, 1 ion engine over 3 time with a thrust of 14 and mass of 1", () => {
        var lec = new LeavingEarthCalculator(engines);
        var [thrust,enginemass]= lec.calculateThrustAndMass({"ion":1}, 1, 3);
        assert.equal(thrust, 14);
        assert.equal(enginemass, 0); // Ion engines are not single use so cause a mass change
    });
  });

  describe("#calculatePlan", () => {
    it("Should add and remove mass correctly", () => {
        var data={ "steps" : [ { "step" : "add", "items":{"otherMass":10}}, { "step" :
        "remove", "items":{"otherMass":5} } ] };
        var lec = new LeavingEarthCalculator(engines);
        assert.equal(lec.calculatePlan(data), true);
        assert.equal(data.steps[0].currentMass, 10);
        assert.deepEqual(data.steps[0].currentItems, {"otherMass":10});
        assert.equal(data.steps[1].currentMass, 5);
        assert.deepEqual(data.steps[1].currentItems, {"otherMass":5});
    });

    it("Should add and remove rockets correctly and calculate mass", () => {
      var data={ "steps" : [
        { "step" : "add", "items":{"soyuz":3,"saturn":1}},
        { "step" : "remove", "items": {"soyuz": 2}}
      ] };
      var lec = new LeavingEarthCalculator(engines);
      assert.equal(lec.calculatePlan(data), true);
      assert.equal(data.steps[0].currentMass, 3*9+20);
      assert.deepEqual(data.steps[0].currentItems, {"soyuz":3,"saturn":1});
      assert.equal(data.steps[1].currentMass, 9+20);
      assert.deepEqual(data.steps[1].currentItems, {"soyuz":1,"saturn":1});
    });

    it("Should add and remove multiple times correctly", () => {
      var data={ "steps" : [
        { "step" : "add", "items":{"otherMass":1, "soyuz":3,"saturn":1}},
        { "step" : "add", "items":{"otherMass":1, "soyuz":3,"saturn":1}},
        { "step" : "remove", "items": {"otherMass":1, "soyuz": 2}},
        { "step" : "remove", "items": {"otherMass":1, "soyuz": 2}}
      ] };
      var lec = new LeavingEarthCalculator(engines);
      assert.equal(lec.calculatePlan(data), true);
      assert.equal(data.steps[0].currentMass, 3*9+20+1);
      assert.deepEqual(data.steps[0].currentItems, {"otherMass":1, "soyuz":3,"saturn":1});
      assert.equal(data.steps[1].currentMass, 6*9+2*20+2);
      assert.deepEqual(data.steps[1].currentItems, {"otherMass":2, "soyuz":6,"saturn":2});
      assert.equal(data.steps[2].currentMass, 4*9+2*20+1);
      assert.deepEqual(data.steps[2].currentItems, {"otherMass":1, "soyuz":4,"saturn":2});
      assert.equal(data.steps[3].currentMass, 2*9+2*20);
      assert.deepEqual(data.steps[3].currentItems, {"otherMass":0, "soyuz":2,"saturn":2});
    });
    it("Should add and calculate burns correctly and calculate mass", () => {
      var data={ "steps" : [
        { "step" : "add", "items":{"soyuz":3,"saturn":1}},
        { "step" : "burn", "items": {"soyuz":2}, "difficulty":3}
      ] };
      var lec = new LeavingEarthCalculator(engines);
      assert.equal(lec.calculatePlan(data), true);
      assert.equal(data.steps[0].currentMass, 3*9+20);
      assert.deepEqual(data.steps[0].currentItems, {"soyuz":3,"saturn":1});
      assert.equal(data.steps[1].currentMass, 1*9+20);
      assert.deepEqual(data.steps[1].currentItems, {"soyuz":1,"saturn":1});
      assert.equal(data.steps[1].totalThrust, 35.34)
      assert.equal(data.steps[1].spareThrust, 6.340000000000003);
    });

    it("Burning less rockets than needed should return failure", () => {
      var data={ "steps" : [
        { "step" : "add", "items":{"soyuz":3,"saturn":1}},
        { "step" : "burn", "items": {"soyuz":1}, "difficulty":3}
      ] };
      var lec = new LeavingEarthCalculator(engines);
      assert.equal(lec.calculatePlan(data), false);

      assert.equal(data.steps[0].currentMass, 3*9+20);
      assert.deepEqual(data.steps[0].currentItems, {"soyuz":3,"saturn":1});

      assert.equal(data.steps[1].currentMass, 2*9+20);
      assert.deepEqual(data.steps[1].currentItems, {"soyuz":2,"saturn":1});
      assert.equal(data.steps[1].totalThrust, 17.67)
      assert.equal(data.steps[1].spareThrust, -20.33);
      assert.notEqual(data.steps[1].error, undefined);
    });

    it("Removing non-existant rockets should return failure", () => {
      var data={ "steps" : [
        { "step" : "add", "items":{"soyuz":3,"saturn":1}},
        { "step" : "remove", "items": {"otherMass":1, "soyuz": 4, "juno": 1}},
        { "step" : "remove", "items": {"otherMass":1, "saturn": 1}}
      ] };
      var lec = new LeavingEarthCalculator(engines);
      assert.equal(lec.calculatePlan(data), false);
      assert.equal(data.steps[0].currentMass, 3*9+20);
      assert.deepEqual(data.steps[0].currentItems, {"soyuz":3,"saturn":1});
      assert.equal(data.steps[1].currentMass, (-1*9)+20+(-1)+(-1));
      assert.deepEqual(data.steps[1].currentItems, {"otherMass":-1, "soyuz":-1,"saturn":1, "juno":-1});
      assert.notEqual(data.steps[1].error, undefined);
      assert.equal(data.steps[2].currentMass, (-1*9)+(-1)+(-2));
      assert.deepEqual(data.steps[2].currentItems, {"otherMass":-2, "soyuz":-1, "saturn":0, "juno":-1});
      assert.notEqual(data.steps[2].error, undefined);
    });

    it("An ion thruster should lift mass with time and not remove itself", () => {
      var data={ "steps" : [
        { "step" : "add", "items":{"otherMass":10, "ion":1}},
        { "step" : "burn", "items": {"ion": 1}, "time":3, "difficulty":1}
      ] };
      var lec = new LeavingEarthCalculator(engines);
      assert.equal(lec.calculatePlan(data), true);
      assert.equal(data.steps[0].currentMass, 11);
      assert.deepEqual(data.steps[0].currentItems, {"otherMass":10, "ion":1});
      assert.equal(data.steps[1].currentMass, 11); // Ion rockets are not single use.
      assert.deepEqual(data.steps[1].currentItems, {"otherMass":10, "ion":1});
      assert.equal(data.steps[1].totalThrust, 14)
      assert.equal(data.steps[1].spareThrust, 4);
      assert.equal(data.steps[1].error, undefined);

    });

    it("An shuttle should lift mass and remove largeFuelTanks", () => {
      var data={ "steps" : [
        { "step" : "add", "items":{"shuttle":1, "largeFuelTank":2}},
        { "step" : "burn", "items": {"shuttle": 1}, "difficulty":1}
      ] };
      var lec = new LeavingEarthCalculator(engines);
      assert.equal(lec.calculatePlan(data), true);
      assert.equal(data.steps[0].currentMass, 12);
      assert.deepEqual(data.steps[0].currentItems, {"shuttle":1, "largeFuelTank":2});
      assert.equal(data.steps[1].currentMass, 8); // Shuttles are not single use, but the fuel tanks are
      assert.deepEqual(data.steps[1].currentItems, {"shuttle":1, "largeFuelTank":1});
      assert.equal(data.steps[1].totalThrust, 67)
      assert.equal(data.steps[1].spareThrust, (67-4));
      assert.equal(data.steps[1].error, undefined);

    });

    it("Burning ion thrusters when non-exist should error", () => {
      var data={ "steps" : [
        { "step" : "add", "items": {"otherMass":10}},
        { "step" : "burn", "items": {"ion": 1}, "time":3, "difficulty":1}
      ] };
      var lec = new LeavingEarthCalculator(engines);
      assert.equal(lec.calculatePlan(data), false);
      assert.equal(data.steps[0].currentMass, 10);
      assert.equal(data.steps[1].currentMass, 10); // Ion rockets are not single use.
      assert.equal(data.steps[1].totalThrust, 14)
      assert.equal(data.steps[1].spareThrust, 5);
      assert.notEqual(data.steps[1].error, undefined);

    });
    it("Burning 0 ion thrusters and 0 soyuz should not error when non-exist", () => {
      var data={ "steps" : [
        { "step" : "add", "items": {"otherMass":10}},
        { "step" : "burn", "items": {"ion": 0, "soyuz":0}, "time":3, "difficulty":1}
      ] };
      var lec = new LeavingEarthCalculator(engines);
      assert.equal(lec.calculatePlan(data), true);
      assert.equal(data.steps[0].currentMass, 10);
      assert.equal(data.steps[1].currentMass, 10); // Ion rockets are not single use.
      assert.equal(data.steps[1].error, undefined);

    });
    it("Plan with unknown step should error", () => {
      var data={ "steps" : [
        { "step" : "add", "items": {"otherMass":10}},
        { "step" : "fred", "items": {"ion": 0, "soyuz":0}, "time":3, "difficulty":1}
      ] };
      var lec = new LeavingEarthCalculator(engines);
      assert.equal(lec.calculatePlan(data), false);
      assert.notEqual(data.steps[1].error, undefined);
    });
    it("Burning -1 ion thrusters should error", () => {
      var data={ "steps" : [
        { "step" : "add", "items": {"otherMass":10}},
        { "step" : "burn", "items": {"ion": -1}, "time":3, "difficulty":1}
      ] };
      var lec = new LeavingEarthCalculator(engines);
      assert.equal(lec.calculatePlan(data), false);
      assert.equal(data.steps[0].currentMass, 10);
      assert.equal(data.steps[1].currentMass, 10); // Ion rockets are not single use.
      assert.notEqual(data.steps[1].error, undefined);

    });
  });
});

class LeavingEarthCalculator {
  constructor(engines) {
    this.engines=engines;
  }

  calculatePlan(plan) {
      var currentMass=0;
      var currentRockets={}
      var success = true;
      plan.steps.forEach(x => {

          switch (x.step) {
          case 'add':
              if (x.mass !== undefined) {
                currentMass+=x.mass;
              }
              if (x.rockets!==undefined) {
                for (const key of Object.keys(x.rockets)) {
                  if (key in currentRockets) {
                    currentRockets[key]+=x.rockets[key];
                  }
                  else {
                    currentRockets[key]=x.rockets[key];
                  }
                  currentMass+=this.engines.rockets[key].weight*x.rockets[key];
                }
              }
              break;
          case 'remove':
          case 'burn':
              if (x.mass !== undefined) {
                currentMass-=x.mass;
              }
              if (x.rockets!== undefined) {
                for (const key of Object.keys(x.rockets)) {
                  if (key in currentRockets) {
                    currentRockets[key]-=x.rockets[key];
                  }
                  else {
                    currentRockets[key]=-x.rockets[key];
                  }
                  if (currentRockets[key] < 0) {
                    success = false;
                    x.error = "Negative rockets remain";
                  }
                  currentMass-=this.engines.rockets[key].weight*x.rockets[key];
                }
              }
              if (x.step==='burn') {
                var [thrust, mass] = this.calculateThrustAndMass(x.rockets, x.difficulty);
                x.totalThrust = thrust;
                x.spareThrust = thrust-currentMass;
                if (x.spareThrust < 0) {
                  success = false;
                  x.error = "Thrust needs to be greater than 0";
                }
              }
              break;
          default:
            console.log("Unknown plan step "+x.step);
          }

          x.currentMass=currentMass;
          if (x.currentMass < 0) {
            success = false;
            x.error = "Mass is less than 0";
          }
          x.currentRockets=Object.assign({}, currentRockets);
      });
      return success;
  }

  getEngineThrustMass(selEngine, difficulty, number) {
      var engine = this.engines.rockets[selEngine];
      var thrust = engine.difficulty[difficulty-1]*number;
      var mass = engine.weight*number;
      return [thrust, mass];
  }

  calculateThrustAndMass(item, difficulty) {
      var selEngine = item;
      var multiplier = 1;
      if (Array.isArray(item)) {
          if (typeof(item[0])=="number") {
              return this.getEngineThrustMass(item[1], difficulty, item[0])
          } else {
              var sum=0;
              var mass=0;
              item.forEach(i => {
                  var v=this.calculateThrustAndMass(i, difficulty);
                  sum+=v[0];
                  mass+=v[1];
              });
              return [sum,mass];
          }
      } else if (typeof item === "string") {
        return this.getEngineThrustMass(selEngine, difficulty, 1)
      } else {
          var sum=0;
          var mass=0;
          for (const key of Object.keys(item)) {
             var v=this.getEngineThrustMass(key, difficulty, item[key]);
             sum+=v[0];
             mass+=v[1];
          }
          return [sum,mass];
      }
  }
}

exports.LeavingEarthCalculator = LeavingEarthCalculator;

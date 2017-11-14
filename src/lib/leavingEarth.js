class LeavingEarthCalculator {
  constructor(engines) {
    this.engines=engines;
  }

  getEngines() {
    return Object.keys(this.engines.rockets).sort();
  }

  calculatePlan(plan) {
      var currentMass=0;
      var currentRockets={}
      var success = true;
      var index=1;
      plan.error=undefined;
      plan.steps.forEach(x => {
          x.error=undefined;
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
              var originalMass = currentMass;

              if (x.rockets!== undefined) {
                for (const key of Object.keys(x.rockets)) {
                  if (x.step==="burn") {
                    if (!this.engines.rockets[key].singleUse) {
                      if (!(currentRockets[key] > 0)) {
                        success = false;
                        x.error = "More "+key+" rockets used than onboard";
                      }
                      continue;
                    }
                  }
                  if (key in currentRockets) {
                    currentRockets[key]-=x.rockets[key];
                  }
                  else {
                    currentRockets[key]=-x.rockets[key];
                  }
                  if (currentRockets[key] < 0) {
                    success = false;
                    x.error = "More "+key+" rockets used than onboard";
                  }
                  currentMass-=this.engines.rockets[key].weight*x.rockets[key];
                }
              }
              if (x.step==='burn') {
                var time = x.time;
                if (time === undefined) {
                  time=1;
                }
                var [thrust, mass] = this.calculateThrustAndMass(x.rockets, x.difficulty, time);
                x.totalThrust = thrust;
                x.spareThrust = thrust-(originalMass-mass);
                if (x.spareThrust < 0) {
                  success = false;
                  if (x.error === undefined) {
                    x.error = "Thrust needs to be greater than 0";
                  }
                }
              }
              break;
          default:
            console.log("Unknown plan step "+x.step);
          }

          x.currentMass=currentMass;
          if (x.currentMass < 0) {
            success = false;
            if (x.error === undefined) {
              x.error = "Mass is less than 0";
            }
          }
          x.currentRockets=Object.assign({}, currentRockets);
          x.index=index;
          if (success=== false && plan.error===undefined) {
            plan.error=index+": "+x.error;
          }
          index++
      });
      return success;
  }

  getEngineThrustMass(selEngine, difficulty, number, time=1) {
      var engine = this.engines.rockets[selEngine];
      var engineThrust = engine.difficulty[difficulty-1];
      console.log("Thrust "+engineThrust);
      if (Array.isArray(engineThrust)) {
        engineThrust = engineThrust[time-1];
        console.log(engineThrust);
      }
      var thrust = engineThrust*number;
      var mass = 0;
      if (engine.singleUse) {
        mass = engine.weight*number;
      }
      return [thrust, mass];
  }

  calculateThrustAndMass(item, difficulty, time=1) {
      var sum=0;
      var mass=0;
      var selEngine = item;
      if (Array.isArray(item)) {
          if (typeof(item[0])==="number") {
              return this.getEngineThrustMass(item[1], difficulty, item[0], time)
          } else {
              item.forEach(i => {
                  var v=this.calculateThrustAndMass(i, difficulty, time);
                  sum+=v[0];
                  mass+=v[1];
              });
              return [sum,mass];
          }
      } else if (typeof item === "string") {
        return this.getEngineThrustMass(selEngine, difficulty, 1, time)
      } else {
          for (const key of Object.keys(item)) {
             var v=this.getEngineThrustMass(key, difficulty, item[key], time);
             sum+=v[0];
             mass+=v[1];
          }
          return [sum,mass];
      }
  }
}

exports.LeavingEarthCalculator = LeavingEarthCalculator;

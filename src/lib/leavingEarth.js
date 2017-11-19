class LeavingEarthCalculator {
  constructor(engines) {
    this.engines=engines;
    for (let engine of Object.keys(this.engines.rockets)) {
      if (!this.engines.rockets[engine].printable) {
        this.engines.rockets[engine].printable=engine[0].toUpperCase() + engine.slice(1);
      }
    }
  }

  getEngine(engine) {
    return this.engines.rockets[engine];
  }
  getEngines(burnable=true) {
    var rockets=Object.keys(this.engines.rockets).sort();
    if (burnable) {
      return rockets.filter(x => {
        return this.engines.rockets[x].rocket!==false;
      });
    }
    return rockets;
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
              var excludedMass = 0;
              var actualBurn = false;
              if (x.rockets!== undefined) {
                for (var key of Object.keys(x.rockets)) {
                  const originalKey = key;
                  var availableRockets = currentRockets[key];
                  if (availableRockets == undefined) {
                    availableRockets = 0;
                  }
                  var usedRockets = x.rockets[key];
                  if (usedRockets === 0) {
                    continue;
                  }
                  actualBurn = true;
                  if (x.step==="burn") {
                    if (!this.engines.rockets[key].singleUse) {

                      if (availableRockets < usedRockets) {
                        x.error = "More "+key+" rockets used than onboard";
                      }
                      // Engines that are single use do not count towards the mass needed
                      excludedMass+=this.engines.rockets[key].weight*x.rockets[key];
                      if (this.engines.rockets[key].uses!=undefined) {
                        key = this.engines.rockets[key].uses;
                        // Because the getEngineThrustMass() function doesn't know about the fuel tanks, exclude them here
                        excludedMass+=this.engines.rockets[key].weight*x.rockets[originalKey];
                      } else {
                        continue;
                      }
                    }
                  }
                  if (key in currentRockets) {
                    currentRockets[key]-=usedRockets;
                  }
                  else {
                    currentRockets[key]=-usedRockets;
                  }
                  if (currentRockets[key] < 0) {
                    x.error = "More "+this.engines.rockets[key].printable+" "+(x.step==="burn"?"burnt":"removed")+" than onboard";
                  }
                  currentMass-=this.engines.rockets[key].weight*x.rockets[originalKey];
                }
              }
              if (x.step==='burn') {
                var time = x.time;
                if (time === undefined) {
                  time=1;
                }
                if (actualBurn) {
                  var [thrust, mass] = this.calculateThrustAndMass(x.rockets, x.difficulty, time);
                  x.totalThrust = thrust;
                  x.spareThrust = thrust-(originalMass-(mass+excludedMass));
                  if (x.spareThrust < 0) {
                    if (x.error === undefined) {
                      x.error = "Thrust needs to be greater than 0";
                    }
                  }
                }
              }
              break;
          default:
            x.error = "Unknown plan step "+x.step;
          }

          x.currentMass=currentMass;
          if (x.currentMass < 0) {
            if (x.error === undefined) {
              x.error = "Mass is less than 0";
            }
          }
          x.currentRockets=Object.assign({}, currentRockets);
          x.index=index;
          if (x.error !==undefined && plan.error===undefined) {
            success=false;
            plan.error=index+": "+x.error;
            //console.log(x.error);
          }
          index++
      });
      return success;
  }

  getEngineThrustMass(selEngine, difficulty, number, time) {
      var engine = this.engines.rockets[selEngine];
      if (engine.rocket === false) {
        return [0,0];
      }
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

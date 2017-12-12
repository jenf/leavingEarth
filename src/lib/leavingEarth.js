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

  calculateNeeds(plan) {

  }

  addItems(from, to, mul=1, burnmode=false) {
    var mass = 0;
    var error = undefined;
    for (const originalKey of Object.keys(from)) {

      var key=originalKey;
      var engine=this.engines.rockets[key];
/*
      if (burnmode) {
        if (!engine.singleUse) {

          if (availableRockets < usedRockets) {
            x.error = "More "+key+" rockets used than onboard";
          }
          // Engines that are single use do not count towards the mass needed
          excludedMass+=this.engines.rockets[key].weight*x.items[key];
          if (this.engines.rockets[key].uses!=undefined) {  // eslint-disable-line eqeqeq
            key = this.engines.rockets[key].uses;
            // Because the getEngineThrustMass() function doesn't know about the fuel tanks, exclude them here
            excludedMass+=this.engines.rockets[key].weight*x.items[originalKey];
          } else {
            continue;
          }
        }
      }
*/
      var number = from[key]*mul;
      if (key in to) {
        to[key]+=number;
      }
      else {
        to[key]=number;
      }

      if (to[key] < 0) {
        error = "Not enough "+engine.printable+" are onboard";
      }
      mass+=engine.weight*number;
    }
    return [mass,0, error];
  }

  calculatePlan(plan) {
      var currentMass=0;
      var currentItems={}
      var success = true;
      var index=1;
      plan.error=undefined;

      // Forward propagate
      plan.steps.forEach(x => {
          x.error=undefined;
          if (x.rockets!==undefined) {
            x.items=x.rockets;
            x.rockets=undefined;
          }
          switch (x.step) {
          case 'end':
            break;
          case 'add':
          case 'start':
              if (x.items!==undefined) {
                var [mass, excludedMass, error]=this.addItems(x.items, currentItems);
                currentMass+=mass;
              }
              break;
          case 'remove':
            if (x.items!==undefined) {
              var [mass, excludedMass, error]=this.addItems(x.items, currentItems, -1);
              x.error=error;
              currentMass+=mass;
            }
            break;
          case 'burn':
              var originalMass = currentMass;
              var excludedMass = 0;
              var actualBurn = false;
              if (x.items!== undefined) {
                for (var key of Object.keys(x.items)) {
                  const originalKey = key;
                  var availableRockets = currentItems[key];
                  if (availableRockets == undefined) { // eslint-disable-line eqeqeq
                    availableRockets = 0;
                  }
                  var usedRockets = x.items[key];
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
                      excludedMass+=this.engines.rockets[key].weight*x.items[key];
                      if (this.engines.rockets[key].uses!=undefined) {  // eslint-disable-line eqeqeq
                        key = this.engines.rockets[key].uses;
                        // Because the getEngineThrustMass() function doesn't know about the fuel tanks, exclude them here
                        excludedMass+=this.engines.rockets[key].weight*x.items[originalKey];
                      } else {
                        continue;
                      }
                    }
                  }
                  if (key in currentItems) {
                    currentItems[key]-=usedRockets;
                  }
                  else {
                    currentItems[key]=-usedRockets;
                  }
                  if (currentItems[key] < 0) {
                    x.error = "More "+this.engines.rockets[key].printable+" "+(x.step==="burn"?"burnt":"removed")+" than onboard";
                  }
                  currentMass-=this.engines.rockets[key].weight*x.items[originalKey];
                }
              }
              if (x.step==='burn') {
                var time = x.time;
                if (time === undefined) {
                  time=1;
                }
                if (x.difficulty == undefined) { // eslint-disable-line eqeqeq
                    if (x.error === undefined) {
                      x.error = "Difficulty is not set";
                    }
                }
                if (actualBurn) {
                  var [thrust, mass, error] = this.calculateThrustAndMass(x.items, x.difficulty, time);

                  if (error.length!==0 && x.error === undefined) {
                    x.error=error[0];
                  }
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
          x.currentItems=Object.assign({}, currentItems);
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
        return [0,0, ["Attempting to burn a non-rocket"]];
      }
      if (!((difficulty-1) in engine.difficulty)) {
        return [0,0, ["Cannot burn at difficulty "+(difficulty)+" for "+selEngine]];
      }
      var engineThrust = engine.difficulty[difficulty-1];
      //console.log("Thrust "+engineThrust);
      if (Array.isArray(engineThrust)) {
        if (!((time-1) in engineThrust)) {
          return [0,0, ["cannot burn for time "+(time)+" for "+selEngine]];
        }
        engineThrust = engineThrust[time-1];
      }
      var thrust = engineThrust*number;
      var mass = 0;
      if (engine.singleUse) {
        mass = engine.weight*number;
      }
      return [thrust, mass, []];
  }

  calculateThrustAndMass(item, difficulty, time=1) {
      var sum=0;
      var mass=0;
      var error=[];
      var selEngine = item;
      if (Array.isArray(item)) {
          if (typeof(item[0])==="number") {
              return this.getEngineThrustMass(item[1], difficulty, item[0], time)
          } else {
              item.forEach(i => {
                  var v=this.calculateThrustAndMass(i, difficulty, time);
                  sum+=v[0];
                  mass+=v[1];
                  error = error.concat(v[2])
              });
              return [sum,mass,error];
          }
      } else if (typeof item === "string") {
        return this.getEngineThrustMass(selEngine, difficulty, 1, time)
      } else {
          for (const key of Object.keys(item)) {
             var v=this.getEngineThrustMass(key, difficulty, item[key], time);
             sum+=v[0];
             mass+=v[1];
             error = error.concat(v[2])
          }
          return [sum,mass, error];
      }
  }
}

exports.LeavingEarthCalculator = LeavingEarthCalculator;

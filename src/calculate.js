



class LeavingEarthCalculator {
  constructor(engines) {
    this.engines=engines;
  }

  calculatePlan(plan) {
      var currentMass=0;
      var currentRockets={}
      plan.steps.forEach(x => {

          if (x.step=='add') {
              currentMass+=x.mass;
              if (x.rockets!=null) {
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
          } else if (x.step=='remove') {
              currentMass-=x.mass;
              if (x.rockets!=null) {
                for (const key of Object.keys(x.rockets)) {
                  if (key in currentRockets) {
                    currentRockets[key]-=x.rockets[key];
                  }
                  else {
                    currentRockets[key]=-x.rockets[key];
                  }
                  currentMass-=this.engines.rockets[key].weight*x.rockets[key];
                }
              }
          }

          x.currentMass=currentMass;
          x.currentRockets=Object.assign({}, currentRockets);
      });

  }

  getEngineThrustMass(selEngine, difficulty, number) {
      var engine = this.engines.rockets[selEngine];
      var thrust = engine.difficulty[difficulty+1]*number;
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

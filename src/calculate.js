exports.calculatePlan=function(plan) {
    var currentMass=0;
    plan.steps.forEach(x => {

        if (x.step=='add') {
            currentMass+=x.mass;
        } else if (x.step=='remove') {
            currentMass-=x.mass;
        }
        
        x.currentMass=currentMass;
        console.log(x);
    });

}

function calculateThrust(item, difficulty, engines) {
    var selEngine = item;
    var multiplier = 1;
    if (Array.isArray(item)) {
        if (typeof(item[0])=="number") {
            multiplier = item[0];
            selEngine = item[1];
        } else {
            sum=0;
            mass=0;
            item.forEach(i => {
                v=calculateThrust(i, difficulty, engines);
                sum+=v[0];
                mass+=v[1];
            });
            return [sum,mass];
        }
    }
    var engine = engines.rockets[selEngine];
    var thrust = engine.difficulty[difficulty+1]*multiplier;
    var mass = engine.weight*multiplier;
    return [thrust, mass];
}

exports.calculateThrust=calculateThrust;

import React, { Component } from 'react';
import './App.css';
import LeavingEarth from './lib/leavingEarth.js';
import engines from './engines.json';
import pluralize from 'pluralize';
pluralize.addIrregularRule("soyuz", "soyuzes")

var data={ "steps" : [
  { "step" : "add", "mass" : 1, "rockets":{"juno":3}},
  { "step" : "burn", "rockets": {"juno":3}, "difficulty":3, "time":1}
] };

class Rocket extends Component {
    constructor(props) {
      super(props);
      this.handleNoRocketChange = this.handleNoRocketChange.bind(this);
      this.handleRocketTypeChange = this.handleRocketTypeChange.bind(this);
    }

    handleNoRocketChange(event) {
      this.props.onChange(this.props.rocket, this.props.rocket, event.target.value);
    }

    handleRocketTypeChange(event) {
      console.log(event.target.value);
      this.props.onChange(this.props.rocket, event.target.value, this.props.noRockets);
    }

    render() {
      const rocket = this.props.rocket;
      return <div>
      <input type="number" value={this.props.noRockets} onChange={this.handleNoRocketChange}/>
      <select value={rocket} onChange={this.handleRocketTypeChange}>
         {this.props.lec.getEngines().map((rocket, index) => {
          return <option value={rocket} key={index}>{rocket}</option>
        })
       }
      </select></div>
    }
}

class Step extends Component {
  constructor(props) {
    super(props);

    this.handleDifficultyChange = this.handleDifficultyChange.bind(this);
    this.handleStepTypeChange = this.handleStepTypeChange.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handleRocketChange = this.handleRocketChange.bind(this);
    this.handleMassChange = this.handleMassChange.bind(this);
    this.handleAddStep = this.handleAddStep.bind(this);
    this.handleAddRocket = this.handleAddRocket.bind(this);
  }

  capitalize(str) {
    return str[0].toUpperCase() + str.slice(1)
  }

  handleMassChange(event) {
    this.props.step.mass=parseInt(event.target.value,10);
    if (isNaN(this.props.step.mass)) {
      this.props.step.mass=0;
    }
    this.props.onPlanChange(this.props.step);
  }

  handleDifficultyChange(event) {
    this.props.step.difficulty=event.target.value;

    this.props.onPlanChange(this.props.step);
  }


  handleTimeChange(event) {
    this.props.step.time=event.target.value;
    this.props.onPlanChange(this.props.step);
  }

  handleStepTypeChange(event) {
    this.props.step.step=event.target.value;
    this.props.onPlanChange(this.props.step);
  }

  handleRocketChange(rocketfrom,rocketto,no) {
    if (rocketfrom===rocketto) {
      this.props.step.rockets[rocketfrom]=no;
      this.props.onPlanChange(this.props.step);
    } else {
      if (rocketto in this.props.step.rockets) {
        no+=this.props.step.rockets[rocketto];
      }
      delete this.props.step.rockets[rocketfrom]
      this.props.step.rockets[rocketto]=no;
      this.props.onPlanChange(this.props.step);
    }
  }

  handleAddRocket(event) {
    event.preventDefault();
    for (let rocket of this.props.lec.getEngines()) {
      if (!(rocket in this.props.step.rockets)) {
        this.props.step.rockets[rocket]=0;
        this.props.onPlanChange(this.props.step);
        break;
      }
    }
  }

  handleAddStep(event) {
    event.preventDefault();
    this.props.onAddStep(this.props.step.index);

  }

  render() {
    const step = this.props.step;
    return (
      <tr>
      <td><button className="add" onClick={this.handleAddStep}>+</button></td>
      <td>{step.index}.</td>
      <td>
      <select value={step.step} onChange={this.handleStepTypeChange} >
       <option value="add">Add</option>
       <option value="burn">Burn</option>
       <option value="remove">Remove</option>
      </select>
      </td>
      <td>{(step.step==="burn" && <input type="number" value={step.difficulty} onChange={this.handleDifficultyChange} />) || "N/A"}</td>
      <td>{(step.step==="burn" && <input type="number" value={step.time} onChange={this.handleTimeChange} /> ) || "N/A"}</td>
      <td>{Object.keys(step.rockets).map((rocket, index) => {
        return <Rocket key={index} index={index} rocket={rocket} noRockets={step.rockets[rocket]} lec={this.props.lec} onChange={this.handleRocketChange} />
      })}
      {
        (step.step==="burn" && (<span>Total:{step.totalThrust?step.totalThrust.toFixed(0):"NaN"} Spare:{step.spareThrust?step.spareThrust.toFixed(0):"NaN"}</span>))
      }
      <button className="add" onClick={this.handleAddRocket}>+</button>
      </td>
      <td><input type="number" value={step.mass}  onChange={this.handleMassChange} /></td>
      <td class="nice">
        <div>Mass: {step.currentMass}</div>
        {Object.keys(step.currentRockets).map((rocket, index) => {
          return <div className="nice">{rocket} : {step.currentRockets[rocket]}</div>;
        })}
        {
          (step.error!==undefined && (<div className="error">{step.error}</div>))
        }
      </td>
      </tr>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.lec = new LeavingEarth.LeavingEarthCalculator(engines);
    var history=[];
    if (localStorage.getItem("history")) {
      const d=JSON.parse(localStorage.getItem("history"));
      if (d!=undefined) {
        history=d;
        // recalculate in case of a bug
        for (var plan of history) {
          this.lec.calculatePlan(plan);
        }
      }
    }

    if (history.length===0) {
      this.lec.calculatePlan(data);
      history=[data];
    }

    data = JSON.parse(JSON.stringify(history[history.length-1]))
    this.state = {plan: data, history: history, stepNumber: history.length-1};
    this.handlePlanChange=this.handlePlanChange.bind(this);
    this.handleAddStep=this.handleAddStep.bind(this);
    this.handleAddStepEnd=this.handleAddStepEnd.bind(this);
    this.handleUndo=this.handleUndo.bind(this);
    this.handleRedo=this.handleRedo.bind(this);
    this.handleClear=this.handleClear.bind(this);
  }

  setPlan(plan) {
    this.lec.calculatePlan(data);
    const history = this.state.history.slice(0, this.state.stepNumber + 1).concat(JSON.parse(JSON.stringify(data)));
    var v={plan: data,
       history: history,
       stepNumber: history.length-1,
     };
     console.log(v);
    this.setState(v);
    if (this.state.plan!=undefined) {
      localStorage.setItem("history", JSON.stringify(history));
    }
  }

  handlePlanChange(plan) {
    data = JSON.parse(JSON.stringify(this.state.plan));

    data.steps[plan.index-1]=plan;
    this.setPlan(data);
  }

  handleAddStep(step) {
    data = JSON.parse(JSON.stringify(this.state.plan));

    data.steps.splice(step-1, 0, { "step" : "add", "mass" : 0, "rockets":{}})
    this.setPlan(data);
  }

  handleAddStepEnd(event) {
    event.preventDefault();
    this.handleAddStep(data.steps.length+1);
  }

  handleUndo(event) {
    event.preventDefault();

    if (this.state.stepNumber!=0) {
      const plan = JSON.parse(JSON.stringify(this.state.history[this.state.stepNumber-1]));
      var v={plan: plan, stepNumber:this.state.stepNumber-1}
      console.log(v);
      this.setState(v);
    }
  }

  handleRedo(event) {
    event.preventDefault();

    if (this.state.stepNumber<this.state.history.length-1) {
      const plan = JSON.parse(JSON.stringify(this.state.history[this.state.stepNumber+1]));
      var v={plan: plan, stepNumber:this.state.stepNumber+1}
      console.log(v);
      this.setState(v);
    }
  }

  handleClear(event) {
    event.preventDefault();
    if (this.state.clear === true) {
      const plan = {"steps" : []}
      this.setState({clear:false, stepNumber:0, plan:plan, history:[plan]})
    } else {
      this.setState({clear:true})
    }
  }

  render() {

    var data = this.state.plan;

    return (
      <form onSubmit={this.handleSubmit}>

      <table className="App">
      <thead>
      <tr>
       <th colspan="4" className="history"><button className={(this.state.stepNumber==0)?"inactive":""} onClick={this.handleUndo}>Undo</button>
       {this.state.stepNumber}/{this.state.history.length-1}
       <button onClick={this.handleRedo} className={(this.state.stepNumber<this.state.history.length-1)?"":"inactive"}>Redo</button>
       <button onClick={this.handleClear} >{this.state.clear===true?"Confirm":"Clear"}</button></th>
       <th colspan="5">Leaving Earth</th>
      </tr>
      <tr>
      <th colspan="2">Step</th>
      <th>Move</th>
      <th>Diff.</th>
      <th>Time</th>
      <th>Rockets &Delta;</th>
      <th>Mass &Delta;</th>
      <th>Notes</th>
      </tr>
      </thead>
      <tbody>
      {data.steps.map((step,index) => { return <Step onPlanChange={this.handlePlanChange} onAddStep={this.handleAddStep} key={index} step={step} lec={this.lec} />}) }
      </tbody>
      <tfoot>
        <tr>
          <td><button className="add" onClick={this.handleAddStepEnd}>+</button></td><td colspan="2">Add extra step</td>
          {(data.error === undefined
            && <th colSpan="5" className="success">Success</th>)
            || <th colSpan="5" className="error">Error: {data.error}</th>}
        </tr>
      </tfoot>
      </table>
      </form>
    );
  }
}

export default App;

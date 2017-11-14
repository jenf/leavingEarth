import React, { Component } from 'react';
import './App.css';
import LeavingEarth from './lib/leavingEarth.js';
import engines from './engines.json';
import pluralize from 'pluralize';
pluralize.addIrregularRule("soyuz", "soyuzes")

var data={ "steps" : [
  { "step" : "add", "mass" : 0, "rockets":{"soyuz":3,"saturn":1}},
  { "step" : "burn", "rockets": {"soyuz":4}, "difficulty":3, "time":1}
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
  }

  capitalize(str) {
    return str[0].toUpperCase() + str.slice(1)
  }

  handleMassChange(event) {
    this.props.step.mass=parseInt(event.target.value);
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
      delete this.props.step.rockets[rocketfrom]
      this.props.step.rockets[rocketto]=no;
      this.props.onPlanChange(this.props.step);
    }
  }


  renderRocketList(rockets, editable=false) {
    return Object.keys(rockets).map((rocket, index) => {
      return (index!==0?", ":"")+pluralize(this.capitalize(rocket), rockets[rocket], true)
    });
  }

  render() {
    const step = this.props.step;
    return (
      <tr>

      <td>{step.index}.</td>
      <td>
      <select value={step.step} onChange={this.handleStepTypeChange} >
       <option value="add">Add</option>
       <option value="burn">Burn</option>
       <option value="remove">Remove</option>
      </select>
      </td>
      <td>{(step.step==="burn" && <input type="number" value={step.difficulty} onChange={this.handleDifficultyChange} />) || "N/A"}</td>
      <td>{(step.time!==undefined && <input type="number" value={step.time} onChange={this.handleTimeChange} /> ) || "N/A"}</td>
      <td>{step.currentMass}</td>
      <td>{Object.keys(step.rockets).map((rocket, index) => {
        return <Rocket key={index} index={index} rocket={rocket} noRockets={step.rockets[rocket]} lec={this.props.lec} onChange={this.handleRocketChange} />
      })}
      </td>
      <td><input type="number" value={step.mass}  onChange={this.handleMassChange} /></td>
      <td>{step.step==="burn" && (<span>{step.totalThrust.toFixed(0)}({step.spareThrust.toFixed(0)})</span>)}</td>
      <td>{(step.error===undefined
         && this.renderRocketList(step.currentRockets))
         || (<span className="error">{step.error}</span>)}</td>
      </tr>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.lec = new LeavingEarth.LeavingEarthCalculator(engines);
    this.lec.calculatePlan(data);
    this.state = {plan: data};
    this.handlePlanChange=this.handlePlanChange.bind(this);
  }

  handlePlanChange(plan) {
    data = JSON.parse(JSON.stringify(this.state.plan));

    data.steps[plan.index-1]=plan;
    this.lec.calculatePlan(data);
    this.setState({plan: data});
  }

  render() {
    var data = this.state.plan;

    return (
      <form onSubmit={this.handleSubmit}>
      <table className="App">
      <thead>
      <tr>
      <th>Step</th>
      <th>Move</th>
      <th>Difficulty</th>
      <th>Time</th>
      <th>Mass after step</th>
      <th>Rockets &Delta;</th>
      <th>Mass &Delta;</th>
      <th>Total thrust(Spare)</th>
      <th>Notes</th>
      </tr>
      </thead>
      <tbody>
      {data.steps.map((step,index) => { return <Step onPlanChange={this.handlePlanChange} key={index} step={step} lec={this.lec} />}) }
      </tbody>
      <tfoot>
       <tr>
       {(data.error === undefined
         && <td colSpan="9" className="success">Success</td>)
         || <td colSpan="9" className="error">Error: {data.error}</td>}
        </tr>
      </tfoot>
      </table>
      </form>
    );
  }
}

export default App;

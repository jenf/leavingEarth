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
      console.log(event);
      //this.props.step.step=event.target.value;
      //this.props.onPlanChange(this.props.step);
    }

    handleRocketTypeChange(event) {
      console.log(event);
    }

    render() {
      const rocket = this.props.rocket;
      return <span>{(this.props.index!==0?", ":"")}<input type="number" value={this.props.noRockets} onChange={this.handleNoRocketChange}/>
      <select value={rocket} onChange={this.handleRocketTypeChange}>
         {this.props.lec.getEngines().map((rocket, index) => {
          return <option value={rocket} key={index}>{rocket}</option>
        })
       }
      </select></span>
    }
}

class Step extends Component {
  constructor(props) {
    super(props);

    this.handleDifficultyChange = this.handleDifficultyChange.bind(this);
    this.handleStepTypeChange = this.handleStepTypeChange.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
  }

  capitalize(str) {
    return str[0].toUpperCase() + str.slice(1)
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



  renderRocketList(rockets, editable=false) {
    return Object.keys(rockets).map((rocket, index) => {
      return (index!==0?", ":"")+pluralize(this.capitalize(rocket), rockets[rocket], true)
    });
  }

  render() {
    const step = this.props.step;
    return (
      <tr>

      <td>{step.index}.
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
        return <Rocket key={index} index={index} rocket={rocket} noRockets={step.rockets[rocket]} lec={this.props.lec} />
      })}
      </td>
      <td>{step.step==="burn" && (<span>{step.totalThrust.toFixed(2)}({step.spareThrust.toFixed(2)})</span>)}</td>
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
      <th>Difficulty</th>
      <th>Time</th>
      <th>Mass after step</th>
      <th>Rockets changed</th>
      <th>Total thrust(Spare)</th>
      <th>Note</th>
      </tr>
      </thead>
      <tbody>
      {data.steps.map((step,index) => { return <Step onPlanChange={this.handlePlanChange} key={index} step={step} lec={this.lec} />}) }
      </tbody>
      <tfoot>
       <tr>
       {(data.error === undefined
         && <td colSpan="6" className="success">Success</td>)
         || <td colSpan="6" className="error">{data.error}</td>}
        </tr>
      </tfoot>
      </table>
      </form>
    );
  }
}

export default App;

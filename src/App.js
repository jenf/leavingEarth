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

class Step extends Component {
  constructor(props) {
    super(props);
    this.state=props.step;

    this.handleDifficultyChange = this.handleDifficultyChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  capitalize(str) {
    return str[0].toUpperCase() + str.slice(1)
  }
  renderRocketList(rockets) {
    return Object.keys(rockets).map((rocket, index) => { return (index!==0?", ":"")+pluralize(this.capitalize(rocket), rockets[rocket], true)});
  }

  handleSubmit(event) {

  }

  handleDifficultyChange(event) {
    console.log("Changed to "+event.target.value);
    this.props.step.difficulty=event.target.value;

    this.setState({difficulty: this.props.step.difficulty});
  }

  render() {
    const step = this.state;
    return (
      <tr>

      <td>{step.index+". "+this.capitalize(step.step)}</td>
      <td>{(step.step==="burn" && <input type="number" value={step.difficulty} onChange={this.handleDifficultyChange} />) || "N/A"}</td>
      <td>{(step.time!==undefined && step.time) || "N/A"}</td>
      <td>{step.currentMass}</td>
      <td>{this.renderRocketList(step.rockets)}</td>
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
  }
  render() {
    this.lec.calculatePlan(data);
    this.data=data;
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
      {data.steps.map((step,index) => { return <Step key={index} step={step} />}) }
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

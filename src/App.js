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
  capitalize(str) {
    return str[0].toUpperCase() + str.slice(1)
  }
  renderRocketList(rockets) {
    return Object.keys(rockets).map((rocket, index) => { return (index!==0?", ":"")+pluralize(this.capitalize(rocket), rockets[rocket], true)});
  }
  render() {
    var props = this.props;
    return (
      <tr>
      <td>{props.step.index+". "+this.capitalize(props.step.step)}</td>
      <td>{(props.step.step==="burn" && props.step.difficulty) || "N/A"}</td>
      <td>{(props.step.time!==undefined && props.step.time) || "N/A"}</td>
      <td>{props.step.currentMass}</td>
      <td>{this.renderRocketList(props.step.rockets)}</td>
      <td>{props.step.step==="burn" && (<span>{props.step.totalThrust.toFixed(2)}({props.step.spareThrust.toFixed(2)})</span>)}</td>
      <td>{(props.step.error===undefined
         && this.renderRocketList(props.step.currentRockets))
         || (<span className="error">{props.step.error}</span>)}</td>
      </tr>
    );
  }
}

class App extends Component {
  render() {
    var lec = new LeavingEarth.LeavingEarthCalculator(engines);
    lec.calculatePlan(data);
    return (
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
         && <td colspan="6" className="success">Success</td>)
         || <td colspan="6" className="error">{data.error}</td>}
        </tr>
      </tfoot>
      </table>
    );
  }
}

export default App;

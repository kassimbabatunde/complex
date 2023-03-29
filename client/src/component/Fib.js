import React, { Component } from "react";
import axios from 'axios';

class Fib extends Component {
    state = {
        index: '',
        seenIndexes: [],
        values: {}
    }

    componentDidMount(){
        this.fetchValues();
        this.fetchIndexes();
    }

    async fetchValues(){
        const value = await axios.get('/api/values/current');
        this.setState({values: value.data});
    }

    async fetchIndexes(){
        const seenIndex = await axios.get('/api/values/all');
        this.setState({seenIndexes:seenIndex.data});
    }

    handleSubmit = async (event) =>{
        event.preventDefault();
        await axios.post('/api/values', {index: this.index});
        this.setState({this: ''});
    }

    renderSeenIndexes = ()=>{
        return this.state.seenIndexes.map(number => number).join(', ')
    }

    renderValues = ()=>{
        const entries = [];

        for(let key in this.state.values){
            entries.push(
                <div key={key}>
                    For index {key} I calculated {this.state.values[key]}
                </div>
            );
        }
        return entries;
    }

    render(){
        return(
            <div>
                <form>
                    <lable>Enter your index: </lable>
                    <input 
                    value={this.state.index}
                    onChange={event => this.setState({ index: event.target.value })}
                    />
                    <button>Submit</button>
                </form>
                <h3>Indexes I have seen: </h3>
                <p>{this.renderSeenIndexes()}</p>
                <h3>calculated values:</h3>
                <p>{this.renderValues()}</p>
            </div>
        )
    }

}

export default Fib;
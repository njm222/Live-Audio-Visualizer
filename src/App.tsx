import React, { Component } from 'react';
import AudioAnalyser from './AudioAnalyser';
import './App.css';


interface Navigator {
  getUserMedia(
      options: { audio?: boolean; video?: boolean; },
      success: (stream: any) => void,
      error?: (error: string) => void
  ) : void;
}

interface IProps {
}

interface IState {
  audio?: any;
}

class App extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      audio: null
    };
    this.toggleMicrophone = this.toggleMicrophone.bind(this);
  }

  async getMicrophone() {
    const audio = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false
    });
    this.setState({ audio });
  }

  stopMicrophone() {
    this.state.audio.getTracks().forEach((track: { stop: () => any; }) => track.stop());
    this.setState({ audio: null });
  }

  toggleMicrophone() {
    if (this.state.audio) {
      this.stopMicrophone();
    } else {
      this.getMicrophone().then(console.log);
    }
  }

  render() {
    return (
        <div className="App">
          <div className="controls">
            <button onClick={this.toggleMicrophone}>
              {this.state.audio ? 'Stop microphone' : 'Get microphone input'}
            </button>
          </div>
          {
            // @ts-ignore
            this.state.audio ? <AudioAnalyser audio={this.state.audio} mode={2} /> : ''
          }
        </div>
    );
  }
}

export default App;

import React, { Component } from 'react';
import AudioVisualiser from './AudioVisualiser';

class AudioAnalyser extends Component {
  private audioContext: AudioContext | undefined;
  private analyser: AnalyserNode | undefined;
  private dataArray: Uint8Array | undefined;
  private source: MediaStreamAudioSourceNode | undefined;
  private rafId: number | undefined;
  constructor(props: any) {
    super(props);
    this.state = {
      audioData: new Uint8Array(0)
    };
    this.tick = this.tick.bind(this);
  }

  componentDidMount() {
    this.audioContext = new window.AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    // @ts-ignore
    this.source = this.audioContext.createMediaStreamSource(this.props.audio);
    this.source.connect(this.analyser);
    this.rafId = requestAnimationFrame(this.tick);
  }

  tick() {
    if (this.analyser && this.dataArray) {
      this.analyser.getByteTimeDomainData(this.dataArray);
    }
    this.setState({ audioData: this.dataArray });
    this.rafId = requestAnimationFrame(this.tick);
  }

  componentWillUnmount() {
    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.analyser) {
      this.analyser.disconnect();
    }
    if (this.source) {
      this.source.disconnect();
    }
  }

  render() {
    // @ts-ignore
    return <AudioVisualiser audioData={this.state.audioData} />;
  }
}

export default AudioAnalyser;

import React, {Component} from 'react';
import AudioVisualiser from './AudioVisualiser';

interface AnalysisObject {
  deviation: number,
  average: number,
  energy: number,
  arrayCounter: number,
  array: number[],
  arrayLength: number,
  lower: number,
  upper: number
}

class AudioAnalyser extends Component {
  private audioContext: AudioContext | undefined;
  private analyser: AnalyserNode | undefined;
  private dataArray: Uint8Array | undefined;
  private source: MediaStreamAudioSourceNode | undefined;
  private rafId: number | undefined;
  private bassObject: AnalysisObject
  private kickObject: AnalysisObject;
  private snareObject: AnalysisObject;
  private midsObject: AnalysisObject;
  private highsObject: AnalysisObject;
  private avFreq: number;
  private rms: number;
  private peak: number;
  private bufferLength: number;
  constructor(props: any) {
    super(props);
    this.state = {
      audioData: new Uint8Array(0),
    };
    this.bassObject = {
      deviation: 0,
      average: 0,
      energy: 0,
      arrayCounter: 0,
      array: [],
      arrayLength: 32,
      lower: 0,
      upper: 4
    }
    this.kickObject = {
      deviation: 0,
      average: 0,
      energy: 0,
      arrayCounter: 0,
      array: [],
      arrayLength: 32,
      lower: 1,
      upper: 3
    }
    this.snareObject = {
      deviation: 0,
      average: 0,
      energy: 0,
      arrayCounter: 0,
      array: [],
      arrayLength: 32,
      lower: 2,
      upper: 4
    }
    this.midsObject = {
      deviation: 0,
      average: 0,
      energy: 0,
      arrayCounter: 0,
      array: [],
      arrayLength: 32,
      lower: 4,
      upper: 32
    }
    this.highsObject = {
      deviation: 0,
      average: 0,
      energy: 0,
      arrayCounter: 0,
      array: [],
      arrayLength: 32,
      lower: 32,
      upper: 128
    }
    this.avFreq = 0
    this.rms = 0
    this.peak = 0
    this.bufferLength = 256
    this.tick = this.tick.bind(this);
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

  componentDidMount() {
    this.audioContext = new window.AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    // this.analyser.fftSize = 256
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    // @ts-ignore
    this.source = this.audioContext.createMediaStreamSource(this.props.audio);
    this.source.connect(this.analyser);
    this.rafId = requestAnimationFrame(this.tick);
  }

  tick() {
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
    }
    this.setState({ audioData: this.dataArray });
    this.getAvFreq()
    this.getFrequencySectionData(this.bassObject)
    this.getFrequencySectionData(this.kickObject)
    this.getFrequencySectionData(this.snareObject)
    this.getFrequencySectionData(this.midsObject)
    this.getFrequencySectionData(this.highsObject)
    this.rafId = requestAnimationFrame(this.tick);
  }


// reset on bar change
  resetData () {
    this.bassObject.energy = 0
    this.kickObject.energy = 0
    this.snareObject.energy = 0
    this.midsObject.energy = 0
    this.highsObject.energy = 0
    this.avFreq = 0
    this.rms = 0
    this.peak = 0
    /*this.bassObject.bassAv = 0
    this.bassObject.bassDeviation = 0
    this.kickObject.kickAv = 0
    this.kickObject.kickDeviation = 0
    this.snareObject.snareAv = 0
    this.snareObject.snareDeviation = 0
    this.midsObject.midsAv = 0
    this.midsObject.midsDeviation = 0
    this.highsObject.highsAv = 0
    this.highsObject.highsDeviation = 0*/
  }

  getAvFreq () {
    if (this.dataArray) {
      for (let i = 0; i < this.bufferLength; i++) {
        this.avFreq += this.dataArray[i]
        this.rms += this.dataArray[i] * this.dataArray[i]
        if (this.dataArray[i] > this.peak) {
          this.peak = this.dataArray[i]
        }
      }
      this.avFreq = this.avFreq / this.bufferLength
      this.rms = Math.sqrt(this.rms / this.bufferLength)
    }
  }

  getFrequencySectionData (section: AnalysisObject) {
    if (this.dataArray) {
      for (let i = section.lower; i < section.upper; i++) {
        section.energy += this.dataArray[i]
      }
      section.energy = section.energy / (section.upper - section.lower)
      section.array[section.arrayCounter++] = section.energy
      if (section.arrayCounter >= section.arrayLength) {
        section.arrayCounter = 0
      }
    }
  }

  render() {
    // @ts-ignore
    return <AudioVisualiser audioData={this.state.audioData} averageFreq={this.avFreq} />;
  }
}

export default AudioAnalyser;

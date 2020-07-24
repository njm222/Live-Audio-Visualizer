import React, {Component} from 'react';
import AudioVisualiser from './AudioVisualiser';

interface AnalysisSectionObject {
  name: string
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
  private bassObject: AnalysisSectionObject
  private kickObject: AnalysisSectionObject;
  private snareObject: AnalysisSectionObject;
  private midsObject: AnalysisSectionObject;
  private highsObject: AnalysisSectionObject;
  private avFreq: number;
  private rms: number;
  private peak: number;
  private bufferLength: number;

  constructor(props: any) {
    super(props);
    this.state = {
      audioData: new Uint8Array(0),
      avFreq: 0,
      peak: 0,
      rms: 0,
      bass: {
        average: 0,
        energy: 0,
        deviation: 0
      },
      kick: {
        average: 0,
        energy: 0,
        deviation: 0
      },
      snare: {
        average: 0,
        energy: 0,
        deviation: 0
      },
      mids: {
        average: 0,
        energy: 0,
        deviation: 0
      },
      highs: {
        average: 0,
        energy: 0,
        deviation: 0
      }
    };
    this.bassObject = {
      name: 'bass',
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
      name: 'kick',
      deviation: 0,
      average: 0,
      energy: 0,
      arrayCounter: 0,
      array: [],
      arrayLength: 16,
      lower: 1,
      upper: 3
    }
    this.snareObject = {
      name: 'snare',
      deviation: 0,
      average: 0,
      energy: 0,
      arrayCounter: 0,
      array: [],
      arrayLength: 16,
      lower: 2,
      upper: 4
    }
    this.midsObject = {
      name: 'mids',
      deviation: 0,
      average: 0,
      energy: 0,
      arrayCounter: 0,
      array: [],
      arrayLength: 8,
      lower: 4,
      upper: 32
    }
    this.highsObject = {
      name: 'highs',
      deviation: 0,
      average: 0,
      energy: 0,
      arrayCounter: 0,
      array: [],
      arrayLength: 8,
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
      this.setState({
        avFreq: this.avFreq,
        peak: this.peak,
        rms: this.rms
      })
    }
  }

  getFrequencySectionData (section: AnalysisSectionObject) {
    // reset data
    section.average = 0
    section.deviation = 0

    if (this.dataArray) {
      // Calculate section energy
      for (let i = section.lower; i < section.upper; i++) {
        section.energy += this.dataArray[i]
      }
      section.energy = section.energy / (section.upper - section.lower)
      section.array[section.arrayCounter++] = section.energy

      // Calculate average and deviation
      for (let i = 0; i < section.arrayLength; i++) {
        section.average += section.array[i]
        section.deviation += section.array[i] * section.array[i]
      }
      section.average = section.average / section.arrayLength
      section.deviation = Math.sqrt(section.deviation / section.arrayLength - section.average * section.average)

      // Reset arrayCounter
      if (section.arrayCounter >= section.arrayLength) {
        section.arrayCounter = 0
      }

      const objectToSet = {
        average: section.average,
        energy: section.energy,
        deviation: section.deviation
      }
      this.setState({
        [section.name]: objectToSet
      })
    }
  }

  render() {
    return <AudioVisualiser
        // @ts-ignore
        visualizerMode={this.props.mode}
        // @ts-ignore
        audioData={this.state.audioData}
        // @ts-ignore
        averageFreq={this.state.avFreq}
        // @ts-ignore
        bass={this.state.bass}
        // @ts-ignore
        kick={this.state.kick}
        // @ts-ignore
        snare={this.state.snare}
        // @ts-ignore
        mids={this.state.mids}
        // @ts-ignore
        highs={this.state.highs}
    />;
  }
}

export default AudioAnalyser;

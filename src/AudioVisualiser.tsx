import React, { Component } from 'react';

class AudioVisualiser extends Component {
  private canvas: React.RefObject<unknown>;
  constructor(props: any) {
    super(props);
    this.canvas = React.createRef();
  }

  componentDidUpdate() {
    this.draw();
  }

  draw() {
    // @ts-ignore
    const { audioData } = this.props;
    const canvas = this.canvas.current as any;
    const height = canvas.height;
    const width = canvas.width;
    const context = canvas.getContext('2d');
    let x = 0;
    const sliceWidth = (width * 1.0) / audioData.length;

    context.lineWidth = 2;
    context.strokeStyle = '#000000';
    context.clearRect(0, 0, width, height);

    context.beginPath();
    context.moveTo(0, height / 2);
    for (const item of audioData) {
      const y = (item / 255.0) * height;
      context.lineTo(x, y);
      x += sliceWidth;
    }
    context.lineTo(x, height / 2);
    context.stroke();
  }

  render() {
    // @ts-ignore
    return <canvas width="300" height="300" ref={this.canvas} />;
  }
}

export default AudioVisualiser;

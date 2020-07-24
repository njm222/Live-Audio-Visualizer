import React, { Component } from 'react';
import * as THREE from 'three';

interface AnalysisObject {
  average: number,
  energy: number,
  deviation: number
}

class AudioVisualiser extends Component {
  private readonly canvas: React.RefObject<unknown>;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private animationID: number | null;
  private meshes: THREE.Mesh[];
  constructor(props: any) {
    super(props);
    this.canvas = React.createRef();
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera()
    this.renderer = new THREE.WebGLRenderer()
    this.animationID = null
    this.meshes = []
  }

  componentDidUpdate() {
    this.draw();
  }

  componentDidMount() {
    this.setup();
  }

  private setup() {
    this.setupCanvas()
    this.setupCamera()
    this.setupLighting()
    this.experiment1Setup()
  }

  private canvasResizeListener () {
    window.addEventListener('resize', re => {
      const width = window.innerWidth
      const height = window.innerHeight
      this.camera.aspect = width / height
      this.renderer.setSize(width, height)
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.camera.updateProjectionMatrix()
    })
  }

  private setupCanvas() {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    const canvas = this.canvas.current as any;
    canvas.appendChild(this.renderer.domElement);
    this.canvasResizeListener()
  }

  private setupCamera() {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.aspect = window.innerWidth / window.innerHeight

    this.camera.position.set(0, 0, 5)
    // this.camera.rotation.set(0, Math.PI / 4, 0)
  }

  private setupLighting() {
    const pointLight = new THREE.PointLight(0xffffff)
    const spotLight = new THREE.SpotLight(0xffffff)

    pointLight.position.set(0, 0, window.innerHeight / 8)

    spotLight.position.set(0, -window.innerHeight / 2, window.innerHeight / 16)
    spotLight.castShadow = true
    spotLight.shadow.mapSize.width = window.innerWidth * 2
    spotLight.shadow.mapSize.height = window.innerHeight * 2

    this.scene.add(pointLight)
    this.scene.add(spotLight)
  }

  draw1() {
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

  private animate () {
    this.animationID = requestAnimationFrame(this.animate)
    this.draw()
  }

  private draw() {
    this.renderer.render( this.scene, this.camera )
    this.meshes[0].rotation.x += 0.01
    this.meshes[0].rotation.y += 0.01
    // @ts-ignore
    const avFreq = this.props.averageFreq
    // @ts-ignore
    const bass = this.props.bass
    // @ts-ignore
    const kick = this.props.kick
    // @ts-ignore
    const snare = this.props.snare
    // @ts-ignore
    const mids = this.props.mids
    // @ts-ignore
    const highs = this.props.highs

    //console.log(`bass: ${bass.average}`)
    //console.log(avFreq)

    this.experiment1(bass, kick, snare, mids, highs)
  }

  private experiment1(bass: AnalysisObject, kick: AnalysisObject, snare: AnalysisObject, mids: AnalysisObject, highs: AnalysisObject) {
    if (bass && bass.average) {
      // change shape size
      const scaleFactor = THREE.MathUtils.clamp((bass.average / 255) * 3, 0.5, 2)
      const geometry = this.meshes[0].geometry as THREE.BoxBufferGeometry
      const position = geometry.attributes.position.array
      for (let i = 0; i < geometry.attributes.position.array.length; i++) {
        // @ts-ignore
        position[i] = Math.sign(position[i]) * scaleFactor
      }
      console.log(scaleFactor)
      // @ts-ignore
      geometry.attributes.position.needsUpdate = true
    }
    if (mids && mids.average) {
      this.meshes[0].position.x = 2 * Math.sin(mids.average * 0.05)
    }
    if (kick && kick.average) {
      this.meshes[0].position.y = 2 * Math.sin(kick.average * 0.05)
    }
    if (highs && highs.average) {
      this.meshes[0].position.z = 2 * Math.sin(highs.average * 0.05)
    }
    if (snare && snare.average) {
      if (snare.energy > snare.average + (snare.deviation * 2)) {
        const material = this.meshes[0].material as THREE.MeshLambertMaterial
        material.wireframe = !material.wireframe
        material.needsUpdate = true
      }
    }
  }

  private experiment1Setup() {
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1)
    const material = new THREE.MeshLambertMaterial({ color: 0xFFFFFF })
    const mesh = new THREE.Mesh(geometry, material)
    this.meshes.push(mesh)
    this.scene.add(this.meshes[0])
  }

  render() {
    // @ts-ignore
    return <div ref={this.canvas} />;
  }
}

export default AudioVisualiser;

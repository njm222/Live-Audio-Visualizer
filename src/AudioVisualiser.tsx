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
  private texture: THREE.Texture;
  constructor(props: any) {
    super(props);
    this.texture = new THREE.TextureLoader().load('./textures/black-wave-halftone.jpg')
    this.texture.wrapS = THREE.RepeatWrapping
    this.texture.wrapT = THREE.RepeatWrapping
    this.texture.anisotropy = 8
    this.canvas = React.createRef();
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera()
    this.renderer = new THREE.WebGLRenderer()
    this.animationID = null
    this.meshes = []
    // this.texture.repeat = new THREE.Vector2(1, 0.75)
  }

  componentDidUpdate () {
    // @ts-ignore
    this.draw(this.props.visualizerMode);
  }

  componentDidMount () {
    // @ts-ignore
    this.setup(this.props.visualizerMode)
  }

  private setup (mode: number) {
    this.setupCanvas()
    this.setupCamera()
    this.setupLighting()
    if (mode === 1) {
      this.experiment1Setup()
    } else if (mode === 2) {
      this.experiment2Setup()
    } else if (mode === 3) {
      this.experiment3Setup()
    }
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

  private setupCanvas () {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    const canvas = this.canvas.current as any;
    canvas.appendChild(this.renderer.domElement);
    this.canvasResizeListener()
  }

  private setupCamera () {
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.aspect = window.innerWidth / window.innerHeight

    this.camera.position.set(0, 0, 15)
    // this.camera.rotation.set(0, Math.PI / 4, 0)
  }

  private setupLighting () {
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
    // @ts-ignore
    this.draw(this.props.visualizerMode)
  }

  private draw (mode: number) {
    this.renderer.render( this.scene, this.camera )
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
    if (mode === 1) {
      this.experiment1(bass, kick, snare, mids, highs)
    } else if (mode === 2) {
      this.experiment2(bass, kick, snare, mids, highs)
    } else if (mode === 3) {
      this.experiment3(bass, kick, snare, mids, highs)
    }
  }

  private experiment3 (bass: AnalysisObject, kick: AnalysisObject, snare: AnalysisObject, mids: AnalysisObject, highs: AnalysisObject) {
    // const xOffset = this.texture.offset.x
    let yOffset = 0
    if (this.texture.offset.y) {
      yOffset = this.texture.offset.y
    }
    let prevXRotation = 0
    if (this.meshes[0]) {
      prevXRotation = this.meshes[0].rotation.x
    }
    this.clearScene()
    const newRadialSegments = (bass.average + snare.average) / 4
    const newRadius = Math.max(mids.energy / 10, 20)
    const newTube = Math.max(newRadius - (kick.average / 155), 3)
    const geometry = new THREE.TorusBufferGeometry(newRadius, newTube , newRadialSegments, 64)
    this.texture.offset = new THREE.Vector2(0, (yOffset + ((bass.average - 50) / 25500)) % 1)
    const material = new THREE.MeshBasicMaterial({side: THREE.BackSide, color: 0xFFFFFF, map: this.texture })
    const mesh = new THREE.Mesh(geometry, material)
    if (kick.average) {
      mesh.rotation.set((prevXRotation + ((kick.energy - 120) / 25500)) % (Math.PI * 2), 0, 0)
    }
    this.meshes[0] = mesh
    this.scene.add(this.meshes[0])
  }

  private experiment3Setup () {
    console.log('experiment 3 setup')
    this.camera.position.set(0, -6, 18)
  }


  private experiment2 (bass: AnalysisObject, kick: AnalysisObject, snare: AnalysisObject, mids: AnalysisObject, highs: AnalysisObject) {
    // const xOffset = this.texture.offset.x
    let yOffset = 0
    if (this.texture.offset.y) {
      yOffset = this.texture.offset.y
    }
    let xOffset = 0
    if (this.texture.offset.x) {
      xOffset = this.texture.offset.x
    }
    this.clearScene()
    const newRadialSegments = (bass.average + snare.average) / 2
    const newRadius = Math.max(mids.energy / 5, 20)
    const newTube = newRadius - (kick.average / 200)
    const geometry = new THREE.TorusBufferGeometry(newRadius, newTube , newRadialSegments, 64)
    this.texture.offset = new THREE.Vector2(xOffset + ((kick.energy - 50) / 25500), (yOffset + ((bass.average - 50) / 25500)) % 1)
    const material = new THREE.MeshBasicMaterial({side: THREE.BackSide, color: 0xFFFFFF, map: this.texture })
    const mesh = new THREE.Mesh(geometry, material)
    this.meshes[0] = mesh
    this.scene.add(this.meshes[0])
  }

  private experiment2Setup () {
    console.log('experiment 2 setup')
    const geometry = new THREE.TorusBufferGeometry(20, 19, 30, 64)
    const material = new THREE.MeshLambertMaterial({side: THREE.BackSide, color: 0xFFFFFF })
    const mesh = new THREE.Mesh(geometry, material)
    this.meshes.push(mesh)
    this.scene.add(this.meshes[0])
    console.log(this.texture)
    console.log(mesh)
  }

  private experiment1 (bass: AnalysisObject, kick: AnalysisObject, snare: AnalysisObject, mids: AnalysisObject, highs: AnalysisObject) {
    this.meshes[0].rotation.x += 0.01
    this.meshes[0].rotation.y += 0.01
    if (bass && bass.average) {
      // change shape size
      const scaleFactor = THREE.MathUtils.clamp((bass.average / 85), 0.5, 1.5)
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

  private experiment1Setup () {
    const geometry = new THREE.BoxBufferGeometry(1, 1, 1)
    const material = new THREE.MeshLambertMaterial({ color: 0xFFFFFF })
    const mesh = new THREE.Mesh(geometry, material)
    this.meshes.push(mesh)
    this.scene.add(this.meshes[0])
  }

  private clearScene() {
    for (let i = 0; i < this.meshes.length; i++) {
      this.scene.remove(this.meshes[i])
      this.meshes[i].geometry.dispose()
      const material = this.meshes[i].material as THREE.Material
      material.dispose()
    }
    this.meshes = []
  }

  render () {
    // @ts-ignore
    return <div ref={this.canvas} />;
  }
}

export default AudioVisualiser;

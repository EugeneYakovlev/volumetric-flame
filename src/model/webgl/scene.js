// node-modules
import * as THREE from 'three'

export default function initScene() {
  // canvas
  this.canvas = document.createElement('canvas')
  // // this.element.appendChild(this.canvas);
  this.element.appendChild(this.renderer.domElement)

  return new THREE.Scene()
}
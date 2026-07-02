// node-modules
import * as THREE from 'three'

export const dpi = window.devicePixelRatio

export function initRenderer() {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  })

  renderer.setPixelRatio(Math.min(2, dpi))

  return renderer
}

export function render() {
  this.renderer.render(this.scene, this.camera)
}

export function resize(callback) {
  this.vw = window.innerWidth
  this.vh = window.innerHeight
  
  this.renderer.setSize(this.vw, this.vh)
  this.renderer.setPixelRatio(Math.min(dpi, 2))

  // calculate camera
  this.aspect = this.vw / this.vh
  this.camera.aspect = this.aspect
  this.camera.updateProjectionMatrix()

  if(callback) {
    callback()
  }
}

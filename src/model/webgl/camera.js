import * as THREE from 'three'

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}
export default function initCamera() {
  const camera = new THREE.PerspectiveCamera(
    50,
    sizes.width / sizes.height,
    1,
    1000
  )
  camera.position.x = 0
  camera.position.y = 0
  camera.position.z = 25
  return camera
}

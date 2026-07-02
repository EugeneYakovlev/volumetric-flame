import * as THREE from 'three'
import { noise } from '../assets/noise'

import { gsap, CustomEase } from 'gsap/all'

import {
  initRenderer,
  render,
  initCamera,
  initScene,
  resize
} from './webgl/index'

gsap.registerPlugin(CustomEase)

const defaults = {
  element: null
}

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

export default class FloatingModel {
  constructor(props) {
    const options = Object.assign({}, defaults, props)

    this.element = options.element

    this.renderer = initRenderer.call(this)

    this.renderer.setSize(sizes.width, sizes.height)
    this.renderer.setPixelRatio(Math.min(2, devicePixelRatio))

    this.scene = initScene.call(this)

    this.camera = initCamera.call(this)

    this.scene.add(this.camera)

    this.model = null

    this.render = this.render.bind(this)

    window.addEventListener('resize', this.resize.bind(this))

    this.initScene()
  }

  render() {
    render.call(this)
  }

  resize() {
    resize.call(this)
  }

  sceneOne() {
    gsap.to(this.model.position, {
      x: -6,
      y: -2,
      z: 0
    })
    gsap.to(this.model.rotation, {
      x: -0.2,
      y: -0.8,
      z: -Math.PI / 2.9
    })
    gsap.to(this.model.scale, {
      z: 1
    })
  }

  sceneTwo() {
    gsap.to(this.model.position, {
      x: -16,
      y: -6.4,
      z: -8
    })
    gsap.to(this.model.rotation, {
      x: 0.45,
      y: -1.1,
      z: -1
    })
    gsap.to(this.model.scale, {
      z: 0.9
    })
  }

  initScene() {
    const geometry = new THREE.CylinderGeometry(1, 1, 9, 200, 200, true)
    geometry.scale(1.0, 1.5, 1.15)

    let gu = {
      time: { value: 0 }
    }

    const material = new THREE.MeshBasicMaterial({
      // wireframe: true,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      onBeforeCompile: (shader) => {
        shader.uniforms.time = gu.time
        shader.vertexShader = `
      #define ss(a, b, c) smoothstep(a, b, c)
      uniform float time;
      varying vec3 nView;
      varying vec3 nNor;
      ${noise}
      
      vec3 getShaped(vec3 p){
        float curve = ss(0., 0.5, uv.y);
        curve += ss(0.5, 1., uv.y) * 3.5;
        p.xz *= 0.75 + curve;
        return p;
      }
      
      vec3 getNoised(vec3 p){
        float t = time * 0.5;
        float n = snoise(vec4(p * 0.4 - vec3(0, t, 0), 3.14));
        n *= 0.4 + 0.3 * (uv.y);
        p += normal * n;
        return p;
      }
      
      vec3 rotY(vec3 p, float a){
        float s = sin(a);
        float c = cos(a);
        p.xz *= mat2(c, -s, s, c);
        return p;
      }
      
      ${shader.vertexShader}
    `
          .replace(
            `#include <begin_vertex>`,
            `#include <begin_vertex>
        vec3 pos = getNoised(getShaped(position));
        vec3 pos2 = getNoised(getShaped(rotY(position, 3.1415926 * 0.001)));
        vec3 pos3 = getNoised(getShaped(position + vec3(0., 0.001, 0.)));
        transformed = pos;
        
        vec3 nor = cross(normalize(pos2 - pos),normalize(pos3 - pos));
        nNor = normalMatrix * nor;
      `
          )
          .replace(
            `#include <fog_vertex>`,
            `#include <fog_vertex>
        nView = normalize(mvPosition.xyz);
      `
          )
        shader.fragmentShader = `
      #define ss(a, b, c) smoothstep(a, b, c)
      varying vec3 nView;
      varying vec3 nNor;
      ${shader.fragmentShader}
    `.replace(
          `#include <color_fragment>`,
          `#include <color_fragment>
        diffuseColor.rgb = mix(vec3(1, 0.375, 0), vec3(0.06, 0.45, 1), pow(vUv.y, 2.));
        float alpha = ss(0.0, 0.6, vUv.y) - ss(0.85, 1., vUv.y);
        
        vec3 nor = nNor * (gl_FrontFacing ? 1. : -1.);
        float vAlpha = abs(dot(normalize(nView), nor));
        
        float angleAlpha = (1. - vAlpha) * 0.9 + 0.1;
        // angleAlpha = pow(angleAlpha, 2.);
        
        float totalAlpha = clamp(alpha * 0.5  +  angleAlpha * 0.5, 0., 1.) * alpha;
        diffuseColor.rgb += vec3(1) * totalAlpha * 0.1;
        diffuseColor.a *= totalAlpha;

        float noise = (fract(sin(dot(vUv, vec2(12.9898,78.233)*2.0)) * 43758.5453));

        // Output to screen
        diffuseColor *= 1.0 - noise/7.0;
      `
        )
      }
    })
    material.defines = {
      USE_UV: ''
    }
    
    this.model = new THREE.Mesh(geometry, material)
    this.scene.add(this.model)
    this.sceneOne()

    const clock = new THREE.Clock()

    const tick = () => {
      const elapsedTime = clock.getElapsedTime()
      gu.time.value = elapsedTime

      // Render
      this.render()

      // Call tick again on the next frame
      window.requestAnimationFrame(tick)
    }

    tick()
  }
}

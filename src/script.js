import './style.css'

import FloatingModel from './model'
import { gsap, ScrollTrigger } from 'gsap/all'

gsap.registerPlugin(ScrollTrigger)

window.onload = () => {
  const floating = new FloatingModel({
    element: document.querySelector('.webgl')
  })

  ScrollTrigger.create({
    trigger: '.scene-2',
    start: 'top center',
    onEnter: () => floating.sceneTwo(),
    onLeaveBack: () => floating.sceneOne()
  })
}

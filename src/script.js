import './style.css'

import FloatingModel from './model'

window.onload = () => {
  const floating = new FloatingModel({
    element: document.querySelector('.webgl')
  })

  document.querySelector('.scene-1').addEventListener('click', () => {
    floating.sceneOne()
  })
  document.querySelector('.scene-2').addEventListener('click', () => {
    floating.sceneTwo()
  })
}

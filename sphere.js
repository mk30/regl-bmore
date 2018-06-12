var regl = require('regl')()
var camera = require('regl-camera')(regl, {
  distance: 4, far: 100
})
var mat4 = require('gl-mat4')
var vec3 = require('gl-vec3')

function makesphere (regl) {
  var sphere = require('icosphere')(3)
  var model = []
  return regl({
    frag: `
      precision mediump float;
      varying vec3 vpos;
      void main () {
        gl_FragColor = vec4(vpos, 1.0);
      }
    `,
    vert: `
      precision mediump float;
      uniform mat4 projection, view, model;
      attribute vec3 position, normal;
      varying vec3 vpos;
      void main () {
        vpos = position;
        gl_Position = projection * view * model * vec4(position,1);
      }
    `,
    attributes: {
      position: sphere.positions
    },
    uniforms: {
      model: mat4.identity(model),
      time: regl.context('time')
    },
    primitive: "triangles",
    elements: sphere.cells
  })
}
var draw = {
  sphere: makesphere(regl)
}
regl.frame(function (context) {
  regl.clear({ color: [0,0,0,1], depth: true })
  camera(function () {
    draw.sphere()
  })
})

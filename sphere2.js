var regl = require('regl')()
var camera = require('regl-camera')(regl, {
  distance: 4, far: 100
})
var mat4 = require('gl-mat4')
var vec3 = require('gl-vec3')
var anormals = require('angle-normals')

function makesphere (regl) {
  var sphere = require('icosphere')(3)
  var model = []
  return regl({
    frag: `
      precision mediump float;
      uniform float time;
      varying vec3 vnorm, vpos;
      void main () {
        gl_FragColor = vec4(vpos, 1.0);
      }
    `,
    vert: `
      precision mediump float;
      uniform mat4 projection, view, model;
      uniform float time;
      attribute vec3 position, normal;
      varying vec3 vnorm, vpos;
      void main () {
        vnorm = normal;
        vpos = position;
        gl_Position = projection * view * model * vec4(position,1);
      }
    `,
    attributes: {
      position: sphere.positions,
      normal: anormals(sphere.cells, sphere.positions)
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

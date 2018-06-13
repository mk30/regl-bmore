var glsl = require('glslify')
var regl = require('regl')()
var camera = require('regl-camera')(regl, {
  distance: 4, far: 5000
})
var mat4 = require('gl-mat4')
var vec3 = require('gl-vec3')
var anormals = require('angle-normals')

function makesphere (regl) {
  var sphere = require('bunny')
  var model = []
  return regl({
    frag: glsl`
      precision mediump float;
      #pragma glslify: snoise = require('glsl-noise/simplex/3d')
      #pragma glslify: cnoise = require('glsl-curl-noise')
      uniform float time;
      varying vec3 vnorm, vpos;
      void main () {
        gl_FragColor =
        vec4(vpos*sin(time/2.0), 1.0);
      }
    `,
    vert: glsl`
      precision mediump float;
      #pragma glslify: snoise = require('glsl-noise/simplex/3d')
      uniform mat4 projection, view, model;
      uniform float time;
      attribute vec3 position, normal;
      varying vec3 vnorm, vpos, dvpos;
      void main () {
        vnorm = normal;
        //set ripplespeed low for faster ripples.
        float dxripplespeed = sin(time)*15.0;
        float dzripplespeed = cos(time/5.0)*5.0;
        float dx = snoise(position+2.0*
          pow(abs(sin(time/dxripplespeed)), 8.4))*0.1;
        float dz = snoise(position+
          pow(abs(cos(time/dzripplespeed)), 6.4))*0.1;
        vpos = position;
        dvpos = position +
          (vec3(dx,0,dz)
          + vec3(0,position.y/12.0-0.03*sin(time*2.0),position.z/12.0
          + 0.03*sin(time)));
        gl_Position = projection * view * model *
        vec4(dvpos,1);
      }
    `,
    attributes: {
      position: sphere.positions,
      normal: anormals(sphere.cells, sphere.positions)
    },
    uniforms: {
      model: function (context) {
        var theta = context.time
        mat4.rotateY(model, mat4.identity(model),
        Math.cos(theta))
        return model
      },
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

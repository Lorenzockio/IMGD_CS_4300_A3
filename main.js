import { default as gulls } from './gulls.js'
import { default as Video } from './video.js'
const sg   = await gulls.init()
await Video.init()
// a simple vertex shader to make a quad
let shader = gulls.constants.vertex

// our fragment shader, just returns blue
const fragmentShader = `
@group(0) @binding(0) var<uniform> res : vec2f;
@group(0) @binding(1) var videoSampler : sampler;
@group(1) @binding(0) var videoBuffer : texture_external;
@group(0) @binding(2) var<uniform> sliderX1: f32;
@group(0) @binding(3) var<uniform> sliderY1: f32;
@group(0) @binding(4) var<uniform> sliderX2: f32;
@group(0) @binding(5) var<uniform> sliderY2: f32;
@group(0) @binding(6) var<uniform> sliderR: f32;
@group(0) @binding(7) var<uniform> sliderC: f32;
@group(0) @binding(8) var<uniform> movement: f32;
@group(0) @binding(9) var<uniform> frame : f32;

fn warp(uv: vec2f, p1: vec2f, p2: vec2f, radius: f32) -> vec2f { 
  let d = distance(uv, p1);
  let w = smoothstep(radius, 0.0, d);
  let offset = (p2 - p1) * w;
  return uv - offset;
}

fn random2(st: vec2f) -> vec2f {
  return fract(sin(vec2f(dot(st, vec2f(127.1, 311.7)),dot(st, vec2f(269.5, 183.3)))) * 43758.5453);
}

@fragment
fn fs( @builtin(position) pos : vec4f ) -> @location(0) vec4f {
  var st = pos.xy / res;
  var uv = st;
  if (sliderC > 0){
    var i_st = floor(st * sliderC); 
    var f_st = fract(st * sliderC);
    var mDist = 20.;
    var closestDiff = vec2f(0.0);
    for (var y = -1; y <= 1; y++) {
      for(var x = -1; x <= 1; x++){
        let neighbor = vec2f(f32(x), f32(y)); 
        var point = random2(i_st + neighbor);
        if (movement > 0.5){
          point = 0.5 + 0.5*sin(vec2f(frame/60.) + 6.2831*point);
        }
        //point = 0.5 + 0.5*sin(vec2f(frame/60.) + 6.2831*point);
        let diff = neighbor + point - f_st; 
        let dist = length(diff); 
        if (dist < mDist) {
          mDist = dist;
          closestDiff = diff;
        }
      }
    }
    uv = closestDiff * 0.8 + vec2f(0.5);
    uv.y = 1. - uv.y;
  }
  var p1 = vec2f(sliderX1, 1. - sliderY1);
  var p2 = vec2f(sliderX2, 1. - sliderY2);
  uv = warp(uv, p1, p2, sliderR);
  let video = textureSampleBaseClampToEdge(videoBuffer, videoSampler, uv);
  var color = video.rgb;
  return vec4f(color, 1. );
}
`

// our vertex + fragment shader together
shader += fragmentShader

const x1 = document.querySelector('#x1')
let x1_u = sg.uniform( x1.value )
const y1 = document.querySelector('#y1')
let y1_u = sg.uniform( y1.value )
const x2 = document.querySelector('#x2')
let x2_u = sg.uniform( x2.value )
const y2 = document.querySelector('#y2')
let y2_u = sg.uniform( y2.value )
const warp_radius = document.querySelector('#radius')
let warp_r_u = sg.uniform( warp_radius.value )
const cells = document.querySelector('#cells')
let cells_u = sg.uniform( cells.value )
const movement = document.querySelector('#movement')
let move_u = sg.uniform( 0.0)
let frame_u = sg.uniform( 0 )
const resetButton = document.querySelector('#reset')

// create a render pass
const renderPass = await sg.render({
  shader,
  data: [
    sg.uniform([ window.innerWidth, window.innerHeight ]), //res
    sg.sampler(), //videosampler
    sg.video(Video.element), //videobuffer
    x1_u,
    y1_u,
    x2_u,
    y2_u,
    warp_r_u,
    cells_u,
    move_u,
    frame_u
  ],
  onframe() { frame_u.value++ }
})

x1.oninput = ()=> x1_u.value = parseFloat( x1.value )
y1.oninput = ()=> y1_u.value = parseFloat( y1.value )
x2.oninput = ()=> x2_u.value = parseFloat( x2.value )
y2.oninput = ()=> y2_u.value = parseFloat( y2.value )
warp_radius.oninput = ()=> warp_r_u.value = parseFloat( warp_radius.value )
cells.oninput = ()=> cells_u.value = parseFloat( cells.value )
movement.onchange = () => move_u.value = movement.checked ? 1.0 : 0.0
resetButton.onclick = () => {
  x1_u.value = 0.5;
  y1_u.value = 0.5; 
  x2_u.value = 0.5; 
  y2_u.value = 0.5; 
  warp_r_u.value = 0.5;
  cells_u.value = 0.0; 
  move_u.value = 0.0;
  x1.value = 0.5;
  y1.value = 0.5; 
  x2.value = 0.5; 
  y2.value = 0.5; 
  warp_radius.value = 0.5; 
  cells.value = 0.0;
  movement.checked = false;
};
// run our render pass
sg.run( renderPass )
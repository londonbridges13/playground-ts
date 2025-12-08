uniform float time;
uniform float angle;
uniform float progress;
uniform float mode; // 0 = single direction, 1 = center-out
uniform vec4 resolution;
varying vec2 vUv;
varying float vFrontShadow;

uniform sampler2D texture1;
uniform vec2 pixels;

const float pi = 3.1415925;

mat4 rotationMatrix(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;
  return mat4(
    oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
    0.0,                                0.0,                                0.0,                                1.0
  );
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
  mat4 m = rotationMatrix(axis, angle);
  return (m * vec4(v, 1.0)).xyz;
}

// Standard single-direction unroll
vec3 singleUnroll(vec3 pos, float finalAngle, float prog, float rad, float rolls) {
  vec3 newposition = pos;

  // Rotate to unroll angle
  newposition = rotate(newposition - vec3(-.5,.5,0.), vec3(0.,0.,1.),-finalAngle) + vec3(-.5,.5,0.);

  float offs = (newposition.x + 0.5)/(sin(finalAngle) + cos(finalAngle));
  float tProgress = clamp((prog - offs*0.99)/0.01, 0., 1.);

  // Shadows
  vFrontShadow = clamp((prog - offs*0.95)/0.05, 0.7, 1.);

  // Roll calculation
  newposition.z = rad + rad*(1. - offs/2.)*sin(-offs*rolls*pi - 0.5*pi);
  newposition.x = -0.5 + rad*(1. - offs/2.)*cos(-offs*rolls*pi + 0.5*pi);

  // Rotate back
  newposition = rotate(newposition - vec3(-.5,.5,0.), vec3(0.,0.,1.), finalAngle) + vec3(-.5,.5,0.);

  // Unroll animation
  newposition = rotate(newposition - vec3(-.5,0.5,rad), vec3(sin(finalAngle),cos(finalAngle),0.), -pi*prog*rolls);
  newposition += vec3(
    -.5 + prog*cos(finalAngle)*(sin(finalAngle) + cos(finalAngle)),
    0.5 - prog*sin(finalAngle)*(sin(finalAngle) + cos(finalAngle)),
    rad*(1.-prog/2.)
  );

  return mix(newposition, pos, tProgress);
}

// Center-outward double unroll (with angle support)
vec3 centerOutUnroll(vec3 pos, float finalAngle, float prog, float rad, float rolls) {
  vec3 newposition = pos;

  // First rotate the position to align with the unroll angle
  // This transforms the coordinate system so we can work in "unroll space"
  newposition = rotate(newposition, vec3(0., 0., 1.), -finalAngle);

  // Calculate the maximum extent along x after rotation
  // For a unit plane, corners extend further when rotated
  float maxExtent = 0.5 * (abs(cos(finalAngle)) + abs(sin(finalAngle)));

  // Distance from center along the unroll axis
  float distFromCenter = abs(newposition.x);
  // Normalize to 0-1 range based on actual extent (center = 0, edge = 1)
  float offs = clamp(distFromCenter / maxExtent, 0.0, 1.0);
  // Which side are we on? -1 for left/bottom, +1 for right/top
  float side = sign(newposition.x);
  // Handle center vertices (side = 0)
  if (abs(side) < 0.001) side = 1.0;

  // Store the perpendicular position (y in rotated space)
  float perpPos = newposition.y;

  float tProgress = clamp((prog - offs*0.99)/0.01, 0., 1.);

  // Shadows - darker near the center (still rolled), lighter at edges (unrolled)
  vFrontShadow = clamp((prog - offs*0.95)/0.05, 0.7, 1.);

  // Roll calculation - rolls outward from center
  // The roll spirals outward, so we use offs to determine how rolled up this vertex is
  float rollPhase = -offs * rolls * pi - 0.5 * pi;
  float rollRadius = rad * (1.0 - offs/2.0);

  newposition.z = rad + rollRadius * sin(rollPhase);
  // X position: start from center (0) and roll outward in the direction of 'side'
  newposition.x = side * rollRadius * cos(rollPhase);
  newposition.y = perpPos; // Preserve perpendicular position

  // Unroll animation - rotate around the center axis
  // The rotation axis is perpendicular to the unroll direction
  float unrollRotation = -pi * prog * rolls * side;

  // Apply unroll rotation around the center
  vec3 pivot = vec3(0.0, perpPos, rad);
  newposition = rotate(newposition - pivot, vec3(0., 1., 0.), unrollRotation) + pivot;

  // Translate outward as it unrolls (scaled by maxExtent for proper full unroll)
  newposition.x += side * prog * maxExtent;
  newposition.z = rad * (1.0 - prog/2.0) + newposition.z * (1.0 - prog);

  // Rotate back to original coordinate system
  newposition = rotate(newposition, vec3(0., 0., 1.), finalAngle);

  return mix(newposition, pos, tProgress);
}

void main() {
  vUv = uv;
  float pi = 3.14159265359;

  float finalAngle = angle - 0.*0.3*sin(progress*6.);

  float rad = 0.1;
  float rolls = 8.;

  vec3 finalposition;

  if (mode > 0.5) {
    // Center-outward mode (with angle support)
    finalposition = centerOutUnroll(position, finalAngle, progress, rad, rolls);
  } else {
    // Standard single-direction mode
    finalposition = singleUnroll(position, finalAngle, progress, rad, rolls);
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(finalposition, 1.0);
}


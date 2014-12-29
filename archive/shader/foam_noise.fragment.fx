#ifdef GL_ES
precision mediump float;
#endif

uniform float uTextureSize;
uniform float uTime;

float uInvTextureSize = 1./(uTextureSize);


vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float cnoise(vec3 v)
  {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  // x0 = x0 - 0.0 + 0.0 * C.xxx;
  // x1 = x0 - i1 + 1.0 * C.xxx;
  // x2 = x0 - i2 + 2.0 * C.xxx;
  // x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy; // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z); // mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ ); // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
  }

uniform vec3 uMinPosLeft;
uniform vec3 uMinPosRight;
uniform vec3 uMaxPosLeft;
uniform vec3 uMaxPosRight;

uniform vec3 uEyePosInWorld;
uniform float uUvLodPow;

float uNoiseFactor = 40.;

vec3 projectOnYPlane(vec3 pos)
{
   vec3 eyeToPosDir = pos-uEyePosInWorld;
   vec3 projectedPos = vec3(uEyePosInWorld.x, 0.0, uEyePosInWorld.z);
   projectedPos.xz -= uEyePosInWorld.y*eyeToPosDir.xz/eyeToPosDir.y;
   return projectedPos;
}

#extension GL_OES_standard_derivatives : enable

float getNoise(vec3 pos, float cellSize)
{
  float lodFactor1 = 1.;
  float lodFactor2 = 1.;
  float lodFactor3 = 1.;
  float lodFactor4 = 1.;

  float cellMin = 2.0;

  if (cellSize>8.*cellMin)
  {
    lodFactor1 = 1.-min(1., (cellSize-8.*cellMin)/(8.*cellMin));
  }
  if (cellSize>4.*cellMin)
  {
    lodFactor2 = 1.-min(1., (cellSize-4.*cellMin)/(4.*cellMin));
  }
  if (cellSize>2.*cellMin)
  {
    lodFactor3 = 1.-min(1., (cellSize-2.*cellMin)/(2.*cellMin));
  }
  if (cellSize>cellMin)
  {
    lodFactor4 = 1.-min(1., (cellSize-cellMin)/(cellMin));
  }

  float n1 = 1.2*cnoise(vec3(0.003*pos.x, 0.005*pos.z, 0.2*uTime));
  n1 += lodFactor1*1.*cnoise(vec3(0.007*pos.x, 0.01*pos.z, 0.3*uTime));
  n1 += lodFactor2*0.8*cnoise(vec3(0.016*pos.x, 0.02*pos.z, 0.4*uTime));
  n1 += lodFactor3*0.6*cnoise(vec3(0.032*pos.x, 0.04*pos.z, 0.6*uTime));
  n1 += lodFactor4*0.3*cnoise(vec3(0.065*pos.x, 0.08*pos.z, 0.8*uTime));
  return pow(abs(n1/3.9), 1.5);
}


void main(void) {
    vec2 uv = gl_FragCoord.xy*uInvTextureSize;
    uv.y = pow(abs(uv.y), uUvLodPow);

    vec3 minPos = uv.x*uMinPosLeft + (1.-uv.x)*uMinPosRight;
    vec3 maxPos = uv.x*uMaxPosLeft + (1.-uv.x)*uMaxPosRight;
    vec3 pos = projectOnYPlane(uv.y*minPos + (1.-uv.y)*maxPos);

    vec3 py = dFdy(pos);
    float cellSize =length(py.xz);

    float noise = getNoise(pos, cellSize);
    pos.y = noise*uNoiseFactor;

    vec3 dx = dFdx(pos);
    vec3 dy = dFdy(pos);

    vec3 normal = cross(-dx, dy);

    gl_FragColor = vec4(noise, normalize(normal)*0.5 + 0.5);
}

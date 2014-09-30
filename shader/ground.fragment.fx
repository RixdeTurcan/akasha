varying vec3 vNormal;
varying vec3 vVertexPosInWorld;
varying vec2 vUv;
varying float vDiffuseHeightOffset;

uniform vec3 uPlayerPos;
uniform vec3 uEyePosInWorld;
uniform float uClipHeight;

#ifndef PI
  #define PI 3.14159265359
#endif

#ifdef DIFFUSE
  uniform sampler2D uDiffuseSampler;

  #ifdef DIFFUSE2
    uniform sampler2D uDiffuse2Sampler;
    #ifdef BUMP2
      uniform vec2 uBump2Infos;
      uniform sampler2D uBump2Sampler;
    #endif
  #endif

  #ifdef BUMP
    #extension GL_OES_standard_derivatives : enable
    uniform vec2 uBumpInfos;
    uniform sampler2D uBumpSampler;

    // Thanks to http://www.thetenthplanet.de/archives/1180
    mat3 cotangent_frame(vec3 normal, vec3 p, vec2 uv)
    {
      // get edge vectors of the pixel triangle
      vec3 dp1 = dFdx(p);
      vec3 dp2 = dFdy(p);
      vec2 duv1 = dFdx(uv);
      vec2 duv2 = dFdy(uv);

      // solve the linear system
      vec3 dp2perp = cross(dp2, normal);
      vec3 dp1perp = cross(normal, dp1);
      vec3 tangent = dp2perp * duv1.x + dp1perp * duv2.x;
      vec3 binormal = dp2perp * duv1.y + dp1perp * duv2.y;

      // construct a scale-invariant frame
      float invmax = inversesqrt(max(dot(tangent, tangent), dot(binormal, binormal)));
      return mat3(tangent * invmax, binormal * invmax, normal);
    }

    vec3 perturbNormal(vec3 viewDir, vec3 normal, vec3 tex, vec2 uv)
    {
      vec3 map = tex * uBumpInfos.y;
      map = map * 255. / 127. - 128. / 127.;
      mat3 TBN = cotangent_frame(normal, -viewDir, uv);
      return normalize(TBN * map);
    }
  #endif
#endif

#ifdef CLIPPLANE
  varying float vClipDistance;
#endif



// Fog
#ifdef FOG
    #define FOGMODE_NONE    0.
    #define FOGMODE_EXP     1.
    #define FOGMODE_EXP2    2.
    #define FOGMODE_LINEAR  3.
    #define E 2.71828

    uniform vec4 uFogInfos;
    uniform vec3 uFogColor;

    float CalcFogFactor()
    {
      float vFogDistance = length(uEyePosInWorld-vVertexPosInWorld);
      float fogCoeff = 1.0;
      float fogStart = uFogInfos.y;
      float fogEnd = uFogInfos.z;
      float fogDensity = uFogInfos.w;

      if (FOGMODE_LINEAR == uFogInfos.x)
      {
        fogCoeff = (fogEnd - vFogDistance) / (fogEnd - fogStart);
      }
      else if (FOGMODE_EXP == uFogInfos.x)
      {
        fogCoeff = 1.0 / pow(E, vFogDistance * fogDensity);
      }
      else if (FOGMODE_EXP2 == uFogInfos.x)
      {
        fogCoeff = 1.0 / pow(E, vFogDistance * vFogDistance * vFogDistance * fogDensity * fogDensity * fogDensity);
      }

      return clamp(fogCoeff, 0.0, 1.0);
    }
#endif

//Sky
#ifdef SKY
    uniform sampler2D uSkySampler;
    uniform float uVerticalShift;
#endif


void main(void)
{
  if (vVertexPosInWorld.y<uClipHeight)
  {
    //discard;
  }

  // Clip plane
  #ifdef CLIPPLANE
    if (vClipDistance > 0.0)
      discard;
  #endif

  //Compute the direction and the distance eye -> vertex
  vec3 eyeToVertexDir = uEyePosInWorld-vVertexPosInWorld;
  float eyeToVertexDist = length(eyeToVertexDir);
  eyeToVertexDir = normalize(eyeToVertexDir);

  vec2 diffuseUv = mod(vVertexPosInWorld.xz+uPlayerPos.xz, 200.)/200.;
  vec2 diffuseUv2 = mod(vVertexPosInWorld.xz+uPlayerPos.xz, 100.)/100.;


  #ifdef DIFFUSE2
    float heightLimit = 90. + vDiffuseHeightOffset;
    float heightThreshold = 60.;
    float diffuseFactor = smoothstep(heightLimit-heightThreshold, heightLimit+heightThreshold, vVertexPosInWorld.y);
  #endif

  vec3 normal = vNormal;
  #ifdef BUMP
    vec3 bumpTex = texture2D(uBumpSampler, diffuseUv).rgb;
    vec3 normal1 = perturbNormal(eyeToVertexDir, normal, bumpTex, diffuseUv);

    #ifdef BUMP2
      vec3 bumpTex2 = texture2D(uBump2Sampler, diffuseUv).rgb;
      vec3 normal2 = perturbNormal(eyeToVertexDir, normal, bumpTex2, diffuseUv2);

      normal = mix(normal1, normal2, diffuseFactor);
    #else
      normal = normal1;
    #endif

  #endif

  //Compute the sky color
  vec3 skyColor = vec3(0., 0., 0.);

  #ifdef SKY
    vec2 uvSky = vec2(atan(eyeToVertexDir.z, -eyeToVertexDir.x)/(2.*PI),
                      (eyeToVertexDir.y*0.5+0.5)-uVerticalShift);
    vec4 skyTex = texture2D(uSkySampler, uvSky);
    skyColor = clamp(skyTex.rgb, 0., 1.);
  #endif

  vec3 color = vec3(0., 0., 0.);
  #ifdef DIFFUSE
    vec3 diffuseColor = texture2D(uDiffuseSampler, diffuseUv).rgb;

    #ifdef DIFFUSE2
      diffuseColor = mix(diffuseColor, texture2D(uDiffuse2Sampler, diffuseUv2).rgb, diffuseFactor);
    #endif

    color += diffuseColor*(0.5+0.5*dot(vNormal, vec3(1., 0.4, 1.)));
  #endif

  //Compute the fog color
  #ifdef FOG
    color = mix(clamp(skyColor, 0., 1.), color, CalcFogFactor());
  #endif

  gl_FragColor = vec4(color, 1.);

  //gl_FragColor = vec4(vUv, 0., 1.);
}

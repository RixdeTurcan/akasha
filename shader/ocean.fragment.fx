
uniform vec3 uEyePosInWorld;
vec2 uResolution = vec2(1200., 800.);

varying vec3 vVertexPosInWorld;
varying float vGroundHeight;

// Fog
#ifdef FOG
  uniform vec4 uFogInfos;
#endif

// Sky
#ifdef SKY
    uniform sampler2D uSkySampler;
    uniform float uVerticalShift;
#endif

// Seabed
#ifdef SEABED
    uniform sampler2D uSeabedSampler;
#endif

void main(void) {
  float clipEps = 10.;
  if (vGroundHeight > clipEps){
    discard;
    return;
  }

  vec2 screenUv = gl_FragCoord.xy / uResolution;

  vec4 color = vec4(0., 0., 0., 1.);

  //Compute the direction and the distance eye -> vertex
  vec3 eyeToVertexDir = uEyePosInWorld-vVertexPosInWorld;
  float eyeToVertexDist = length(eyeToVertexDir);
  eyeToVertexDir = normalize(eyeToVertexDir);

  vec3 normal = vec3(0., 1., 0.);

  //Compute the sky color
  vec3 skyColor = vec3(0., 0., 0.);

  #ifdef SKY
    vec2 uvSky = computeUv(-eyeToVertexDir, uVerticalShift);
    vec4 skyTex = texture2D(uSkySampler, uvSky);
    skyColor = skyTex.rgb;
  #endif

  //Compute the sky reflection color
  vec3 skyReflectionColor = vec3(0., 0., 0.);

  #ifdef SKY
    float uSkyReflectionAbsorbtion = 0.7;
    vec2 uvSkyReflection = computeUv(vec3(-eyeToVertexDir.x, eyeToVertexDir.y, -eyeToVertexDir.z), uVerticalShift);
    vec4 skyTexReflection = texture2D(uSkySampler, uvSkyReflection);
    skyReflectionColor = skyTexReflection.rgb * uSkyReflectionAbsorbtion;
  #endif

  //Compute the fresnel factor
  float fresnel = dot(eyeToVertexDir, normal);

  //Compute the refraction color
  vec3 seeWeedColor = vec3(0.03, 0.47, 0.12);
  vec3 seabedColor = seeWeedColor;

  #ifdef SEABED
    seabedColor = texture2D(uSeabedSampler, screenUv).rgb;
  #endif


  color.rgb = mix(skyReflectionColor, seabedColor, fresnel);

  //Compute the fog color
  #ifdef FOG
    color.rgb = mix(clamp(skyColor, 0., 1.), color.rgb, CalcFogFactor(eyeToVertexDist, uFogInfos));
  #endif

  gl_FragColor = color;
}

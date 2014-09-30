#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D uSampler;

uniform vec3 uMinPosLeft;
uniform vec3 uMinPosRight;
uniform vec3 uMaxPosLeft;
uniform vec3 uMaxPosRight;

uniform vec3 uEyePosInWorld;

#ifdef NOISE_DATA
    uniform sampler2D uNoiseDataSampler;
    uniform float uNoiseFactor;
    uniform float uDisplacementNoiseFactor;
#endif

#ifdef WAVE_DATA
    uniform sampler2D uWaveDataSampler;
    uniform float uWaveMaxHeight;
    uniform float uDisplacementWaveFactor;
#endif

vec3 projectOnYPlane(vec3 pos)
{
   vec3 eyeToPosDir = pos-uEyePosInWorld;
   vec3 projectedPos = vec3(uEyePosInWorld.x, 0.0, uEyePosInWorld.z);
   projectedPos.xz -= uEyePosInWorld.y*eyeToPosDir.xz/eyeToPosDir.y;
   return projectedPos;
}

vec3 computeVertexPos(vec2 coord)
{
    vec2 coord2 = coord;
    vec3 minPos = coord2.x*uMinPosLeft + (1.-coord2.x)*uMinPosRight;
    vec3 maxPos = coord2.x*uMaxPosLeft + (1.-coord2.x)*uMaxPosRight;
    vec3 pos = projectOnYPlane(coord2.y*minPos + (1.-coord2.y)*maxPos);

    vec4 tex = vec4(0., 0., 0., 0.);
    #ifdef WAVE_DATA
        tex = texture2D(uWaveDataSampler, coord);
        pos.y += uWaveMaxHeight*tex.r;
        pos.xz -= uDisplacementWaveFactor*(tex.gb*2.-1.);
    #endif

    #ifdef NOISE_DATA
        float noiseReduction = 1.;
        #ifdef WAVE_DATA
            noiseReduction = 2.*(1.-tex.a);
        #endif

        tex = texture2D(uNoiseDataSampler, coord);
        pos.y += uNoiseFactor*noiseReduction*tex.r;
        pos.xz -= uDisplacementNoiseFactor*noiseReduction*(tex.gb*2.-1.)*(tex.a*2.-0.5);
    #endif

    return pos;
}

void main(void)
{
  vec2 uv = gl_FragCoord.xy*INV_TEXTURE_SIZE;
  vec3 pos = computeVertexPos(uv);

  vec2 uvX = vec2(uv.x+INV_TEXTURE_SIZE, uv.y);
  vec3 posX = computeVertexPos(uvX);

  vec2 uvY = vec2(uv.x, uv.y+INV_TEXTURE_SIZE);
  vec3 posY = computeVertexPos(uvY);

  vec3 normal = normalize(cross(pos-posX, posY-pos));

  float foamFactor = 8.*pow(length(normal.xz), 4.);


  gl_FragColor = vec4(foamFactor, 0., 0., 1.);

}

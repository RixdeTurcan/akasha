uniform vec3 uMinPosLeft;
uniform vec3 uMinPosRight;
uniform vec3 uMaxPosLeft;
uniform vec3 uMaxPosRight;

uniform vec3 uEyePosInWorld;
uniform vec3 uPlayerPos;

float uShanonMargin = 0.5;
float meanHeight = 0.;

float computeOctave(float amplitude, vec2 period, vec2 params, vec2 deltaPos)
{
    //Detect if the noise frequency is greater than the sampling frequency
    float factorX = smoothstep(uShanonMargin/(2.*period.x), uShanonMargin/period.x, deltaPos.x);
    float factorY = smoothstep(uShanonMargin/(2.*period.y), uShanonMargin/period.y, deltaPos.y);

    return (1.-factorX)*(1.-factorY)*amplitude*snoise(period*params);
}

float getNoise(vec3 pos, vec3 pos2)
{
  vec2 deltaPos = abs(pos.xz-pos2.xz);
  vec2 params = 0.5*(pos.xz+pos2.xz) + uPlayerPos.xz;

  float n1 = computeOctave(10., vec2(0.0003, 0.0003), params, deltaPos)
           + computeOctave(1., vec2(0.001, 0.001), params, deltaPos)
           + computeOctave(0.5, vec2(0.002, 0.002), params, deltaPos)
           + computeOctave(0.35, vec2(0.004, 0.004), params, deltaPos);

  return n1/(10.+1.+0.5+0.35);
}

float getDiffuseNoise(vec3 pos, vec3 pos2)
{
  vec2 deltaPos = abs(pos.xz-pos2.xz);
  vec2 params = 0.5*(pos.xz+pos2.xz) + uPlayerPos.xz +4000.;

  float n1 = computeOctave(2., vec2(0.001, 0.001), params, deltaPos)
           + computeOctave(0.5, vec2(0.002, 0.002), params, deltaPos)
           + computeOctave(0.35, vec2(0.004, 0.004), params, deltaPos);

  return n1/(2.+0.5+0.35);
}


void main(void)
{
    //Radius of the sample area (assuming after that it is a rectangle)
    vec2 area = vec2(0.5, 0.5);

    //Uv position of the lower left point of the area
    vec2 uv = (gl_FragCoord.xy-area)*INV_TEXTURE_SIZE;
    uv.y = pow(uv.y, 0.3);
    vec3 pos = computePos(uv, uMinPosLeft, uMinPosRight, uMaxPosLeft, uMaxPosRight);

    //Uv position of the upper right point of the area
    vec2 uv2 = (gl_FragCoord.xy+area)*INV_TEXTURE_SIZE;
    uv2.y = pow(uv2.y, 0.3);
    vec3 pos2 = computePos(uv2, uMinPosLeft, uMinPosRight, uMaxPosLeft, uMaxPosRight);

    float height = getNoise(pos, pos2);
    float diffuseHeight = getDiffuseNoise(pos, pos2);

    gl_FragColor = vec4((height*550.), 0.5*(pos.xz+pos2.xz), diffuseHeight*100.);
}

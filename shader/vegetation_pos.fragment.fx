uniform sampler2D uGroundHeightSampler;

uniform float uSize;
uniform vec3 uDeltaPos;
uniform vec3 uPlayerPos;

uniform vec3 uMinPosLeftSwap;
uniform vec3 uMinPosRightSwap;
uniform vec3 uMaxPosLeftSwap;
uniform vec3 uMaxPosRightSwap;

varying vec2 vUv;

void main(void)
{
  vec2 uv = 1.-vUv;

  vec2 posXZ = (uv*2.-1.)*uSize;

  vec3 pos = vec3(posXZ.x, 0., posXZ.y) + uDeltaPos;

  vec2 uvSwap = computeUv(pos, uMinPosLeftSwap, uMinPosRightSwap,
                          uMaxPosLeftSwap, uMaxPosRightSwap);
  uvSwap.y = pow(uvSwap.y, 1./0.3);
  if (uvSwap.x > 0. && uvSwap.x <= 1. && uvSwap.y > 0. && uvSwap.y <= 1.)
  {
    vec4 tex = texture2D(uGroundHeightSampler, uvSwap);
    pos.y = tex.r;

    vec2 param = uPlayerPos.xz+posXZ;

    float angle = snoise(param*0.01)*20.;

    float presence = clamp(0.5+(0.4*snoise(param*0.004) + 0.4*snoise(param*0.002) + 0.2*snoise(param*0.001)), 0., 1.);

    gl_FragColor = vec4(pos.y, angle, tex.a, presence);
  }
  else
  {
    gl_FragColor = vec4(0., 0., 0., 1.);
  }

}

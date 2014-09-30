uniform sampler2D uSampler;

uniform float uNoiseFactor;
uniform float uDisplacementNoiseMinHeight;
uniform float uDisplacementNoiseMaxHeight;

uniform vec3 uMinPosLeft;
uniform vec3 uMinPosRight;
uniform vec3 uMaxPosLeft;
uniform vec3 uMaxPosRight;

uniform vec3 uEyePosInWorld;

void main(void)
{
    #ifdef TEXTURE
      vec2 uv = gl_FragCoord.xy*INV_TEXTURE_SIZE;
      vec4 tex = texture2D(uSampler, uv);
      vec3 pos = computeProjectedPos(uv,
                            uMinPosLeft, uMinPosRight, uMaxPosLeft, uMaxPosRight,
                            uEyePosInWorld, 0.);
      pos.y = tex.r*uNoiseFactor;

      vec2 uvX = vec2(uv.x+INV_TEXTURE_SIZE, uv.y);
      vec4 texX = texture2D(uSampler, uvX);
      vec3 posX = computeProjectedPos(uvX,
                            uMinPosLeft, uMinPosRight, uMaxPosLeft, uMaxPosRight,
                            uEyePosInWorld, 0.);
      posX.y = texX.r*uNoiseFactor;

      vec2 uvY = vec2(uv.x, uv.y+INV_TEXTURE_SIZE);
      vec4 texY = texture2D(uSampler, uvY);
      vec3 posY = computeProjectedPos(uvY,
                            uMinPosLeft, uMinPosRight, uMaxPosLeft, uMaxPosRight,
                            uEyePosInWorld, 0.);
      posY.y = texY.r*uNoiseFactor;

      vec3 normal = normalize(cross(pos-posX, posY-pos));

      float displacement = min(min(tex.r/uDisplacementNoiseMinHeight, 1.)*(1.0-tex.r/uDisplacementNoiseMaxHeight), 1.);

      gl_FragColor = vec4(tex.r, 0.5*(1.+normal.xz), displacement);
   #else
      gl_FragColor = vec4(0., 0., 0., 1.);
   #endif
}

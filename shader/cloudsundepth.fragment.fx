varying vec2 vUv;

uniform sampler2D uCloudHeightSampler;

uniform sampler2D uSwapSampler;

uniform vec3 uSunClampedDirection;

uniform float uInvCloudVerticalDepth;
uniform float uCloudVerticalDepth;
uniform float uCloudHeight;

void main(void) {

    vec3 eyeToPosDir = computeEyeToPosDir(vUv);

    if (eyeToPosDir.y<0.001)
    {
      discard;
    }

    vec3 cloudPos = vec3(0., 0., 0.);
    cloudPos.y = uCloudHeight;
    cloudPos.xz = cloudPos.y * eyeToPosDir.xz / eyeToPosDir.y;


    float dist = 0.;
    float distEye = 0.;

    vec4 tex0 = texture2D(uCloudHeightSampler, 1.-vUv);

    if (tex0.r>0.)
    {

      float alpha = uCloudVerticalDepth/uSunClampedDirection.y;
      vec3 maxPos = cloudPos + uSunClampedDirection*alpha;

      vec3 step = (maxPos-cloudPos)/NB_STEP_F;

      for (int i=STEP_START; i<STEP_END; ++i)
      {

        float fi = float(i);

        vec3 sampledPos = cloudPos + fi*step;

        vec3 eyeToSampledPosDir = normalize(sampledPos);
        vec2 uv = computeUv(eyeToSampledPosDir);

        vec4 tex = texture2D(uCloudHeightSampler, uv);

        float normalizedSampledHeight = (sampledPos.y-cloudPos.y)*uInvCloudVerticalDepth;

        if (tex.r > normalizedSampledHeight)
        {
          dist += 1./NB_STEP_F;
        }

      }


      alpha = uCloudVerticalDepth/eyeToPosDir.y;
      maxPos = cloudPos + eyeToPosDir*alpha;

      step = (maxPos-cloudPos)/NB_STEP_F;

      for (int i=STEP_START; i<STEP_END; ++i)
      {

        float fi = float(i);

        vec3 sampledPos = cloudPos + fi*step;

        vec3 eyeToSampledPosDir = normalize(sampledPos);
        vec2 uv = computeUv(eyeToSampledPosDir);

        vec4 tex = texture2D(uCloudHeightSampler, uv);

        float normalizedSampledHeight = (sampledPos.y-cloudPos.y)*uInvCloudVerticalDepth;

        if (tex.r > normalizedSampledHeight)
        {
          distEye += 1./NB_STEP_F;
        }

      }

    }

    #ifdef SWAP_TEXTURE
      #ifndef RESET
        vec4 tex1 = texture2D(uSwapSampler, 1.-vUv);
        dist += tex1.r;
        distEye += tex1.g;
      #endif
    #endif

    gl_FragColor = vec4(dist, distEye, 0., 1.);
    return;
}

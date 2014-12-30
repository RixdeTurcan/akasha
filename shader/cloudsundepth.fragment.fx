varying vec2 vUv;

uniform sampler2D uCloudHeightSampler;

uniform sampler2D uSwapSampler;

uniform vec3 uSunClampedDirection;
vec3 uMoonClampedDirection = -uSunClampedDirection;

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
    float distMoon = 0.;

    vec4 tex0 = texture2D(uCloudHeightSampler, 1.-vUv);

    float bump = tex0.g;

    if (tex0.r>0.)
    {
      //sun
      if (uSunClampedDirection.y > 0.)
      {
        float alpha = min(uCloudVerticalDepth/uSunClampedDirection.y, uCloudVerticalDepth*10.);

        vec3 maxPos = cloudPos + uSunClampedDirection*alpha;


        vec3 step = (maxPos-cloudPos)/NB_STEP_F;
        float stepDist = alpha/NB_STEP_F;

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
            dist += stepDist;
          }
        }
      }
      else
      {
        dist = uCloudVerticalDepth*10.;
      }

      //Moon
      if (uMoonClampedDirection.y > 0.)
      {

        float alpha = min(uCloudVerticalDepth/uMoonClampedDirection.y, uCloudVerticalDepth*10.);

        vec3 maxPos = cloudPos + uMoonClampedDirection*alpha;


        vec3 step = (maxPos-cloudPos)/NB_STEP_F;
        float stepDist = alpha/NB_STEP_F;

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
            distMoon += stepDist;
          }
        }
      }
      else
      {
        distMoon = uCloudVerticalDepth*10.;
      }


      //eye
      float alpha = uCloudVerticalDepth/eyeToPosDir.y;
      vec3 maxPos = cloudPos + eyeToPosDir*alpha;
      float stepDist = alpha/NB_STEP_F;

      vec3 step = (maxPos-cloudPos)/NB_STEP_F_EYE;

      for (int i=STEP_START_EYE; i<STEP_END_EYE; ++i)
      {
        float fi = float(i);

        vec3 sampledPos = cloudPos + fi*step;

        vec3 eyeToSampledPosDir = normalize(sampledPos);
        vec2 uv = computeUv(eyeToSampledPosDir);

        vec4 tex = texture2D(uCloudHeightSampler, uv);

        float normalizedSampledHeight = (sampledPos.y-cloudPos.y)*uInvCloudVerticalDepth;

        if (tex.r > normalizedSampledHeight)
        {
          distEye += stepDist;
        }

      }
    }


    dist /= uCloudVerticalDepth*12.;
    distEye /= uCloudVerticalDepth*6.;
    distMoon /= uCloudVerticalDepth*12.;

    #ifdef SWAP_TEXTURE
      #ifndef RESET
        vec4 tex1 = texture2D(uSwapSampler, 1.-vUv);
        dist += tex1.r;
        distEye += tex1.g;
        distMoon += tex1.b;
      #endif
    #endif



    gl_FragColor = vec4(dist, distEye, distMoon, bump);
    return;
}

float CalcFogFactor(float fogDist, vec4 fogInfos)
{
  float fogCoeff = 1.0;
  float fogStart = fogInfos.y;
  float fogEnd = fogInfos.z;
  float fogDensity = fogInfos.w;

  #ifdef FOGMODE_LINEAR
    fogCoeff = (fogEnd - fogDist) / (fogEnd - fogStart);
  #endif
  #ifdef FOGMODE_EXP
    fogCoeff = 1.0 / exp(fogDist * fogDensity);
  #endif
  #ifdef FOGMODE_EXP2
    fogCoeff = 1.0 / exp2(fogDist * fogDist * fogDist * fogDensity * fogDensity * fogDensity);
  #endif

  return clamp(fogCoeff, 0.0, 1.0);
}

#ifdef WITH_STANDARD_DERIVATIVES
  #extension GL_OES_standard_derivatives : enable

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

  vec3 perturbNormal(vec3 viewDir, vec3 normal, vec3 tex, vec2 bumpInfos, vec2 uv)
  {
    vec3 map = tex * bumpInfos.y;
    map = map * 255. / 127. - 128. / 127.;
    mat3 TBN = cotangent_frame(normal, -viewDir, uv);
    return normalize(TBN * map);
  }
#endif

float computeShadow(vec4 posFromLight, sampler2D shadowSampler, float darkness)
{
  vec3 depth = posFromLight.xyz / posFromLight.w;

  float sx = step(0., depth.x)*2.-1.;
  float sy = step(0., depth.y)*2.-1.;

  depth.x = sqrt(abs(depth.x))*sx;
  depth.y = sqrt(abs(depth.y))*sy;


  vec2 uv = 0.5 * depth.xy + vec2(0.5, 0.5);

  if (uv.x < 0. || uv.x > 1.0 || uv.y < 0. || uv.y > 1.0)
  {
    return 1.;
  }
  vec4 texel = texture2D(shadowSampler, uv);
  float shadow = texel.r+10.;

  if (depth.z > shadow)
  {
    return mix(1., darkness, texel.b);
  }
  return 1.;
}


float computeDiffuseFactor(vec3 lightVectorW, vec3 normal, float diffuseOffset, float diffuseFactor)
{
  return clamp(diffuseFactor * (diffuseOffset + dot(normal, lightVectorW)), 0., 1.);
}

float computeSpecularFactor(vec3 lightVectorW, vec3 viewVectorW, vec3 normal, float specFactor)
{
  vec3 angleW = normalize(viewVectorW + lightVectorW);
  float specComp = max(0., dot(normal, angleW));
  return pow(specComp, specFactor);
}

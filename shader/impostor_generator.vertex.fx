attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform vec3 uInvBoxLimits;
uniform float uOffsetY;

#ifdef DIFFUSE
  uniform mat4 uDiffuseMatrix;
  varying vec2 vDiffuseUV;
#endif

#ifndef RENDER_COLOR
  #ifdef BUMP
    uniform mat4 uBumpMatrix;
    varying vec2 vBumpUV;
    varying vec3 vNormal;
    varying vec3 vTangent;
    varying vec3 vBitangent;
  #endif
#endif

uniform float uAngle;
uniform float uRow;
uniform float uCol;
uniform float uNbRows;
uniform float uNbCols;

void main(void)
{

  #ifdef DIFFUSE
    vDiffuseUV = vec2(uDiffuseMatrix * vec4(uv, 1.0, 0.0));
  #endif

  #ifndef RENDER_COLOR
    #ifdef BUMP
      vBumpUV = vec2(uBumpMatrix * vec4(uv, 1.0, 0.0));
      vNormal = normal;
      vec3 t1 = cross(vNormal, vec3(0., 0., 1.));
      vec3 t2 = cross(vNormal, vec3(0., 1., 0.));
      if (length(t1) > length(t2))
      {
        vTangent = t1;
      }
      else
      {
        vTangent = t2;
      }
      vBitangent = cross(vNormal, vTangent);
    #endif
  #endif

  vec3 pos = position;
  pos.x = position.x*cos(uAngle)-position.z*sin(uAngle);
  pos.z = position.x*sin(uAngle)+position.z*cos(uAngle);

  pos.y += uOffsetY;

  vec3 screenPos = pos*uInvBoxLimits;

  screenPos.x = ((screenPos.x*0.5+0.5+uRow)/uNbRows)*2.-1.;
  screenPos.y = ((screenPos.y*0.5+0.5+uCol)/uNbCols)*2.-1.;

  gl_Position = vec4(screenPos, 1.);
}

#ifdef GL_ES
precision mediump float;
#endif

uniform float uTextureSize;
float uInvTextureSize = 1./uTextureSize;

#ifdef TEXTURE
    uniform sampler2D uSampler;
#endif

void main(void) {

    vec2 uv = gl_FragCoord.xy*uInvTextureSize;

    vec4 tex = vec4(0., 0., 0., 1.);

    vec4 t00 = texture2D(uSampler, vec2(clamp(uv.x-uInvTextureSize, 0., 1.), clamp(uv.y-uInvTextureSize, 0., 1.)));
    vec4 t01 = texture2D(uSampler, vec2(uv.x, clamp(uv.y-uInvTextureSize, 0., 1.)));
    vec4 t02 = texture2D(uSampler, vec2(clamp(uv.x+uInvTextureSize, 0., 1.), clamp(uv.y-uInvTextureSize, 0., 1.)));
    vec4 t10 = texture2D(uSampler, vec2(clamp(uv.x-uInvTextureSize, 0., 1.), uv.y));
    vec4 t12 = texture2D(uSampler, vec2(clamp(uv.x+uInvTextureSize, 0., 1.), uv.y));
    vec4 t20 = texture2D(uSampler, vec2(clamp(uv.x-uInvTextureSize, 0., 1.), clamp(uv.y+uInvTextureSize, 0., 1.)));
    vec4 t21 = texture2D(uSampler, vec2(uv.x, clamp(uv.y+uInvTextureSize, 0., 1.)));
    vec4 t22 = texture2D(uSampler, vec2(clamp(uv.x+uInvTextureSize, 0., 1.), clamp(uv.y+uInvTextureSize, 0., 1.)));
/*
    tex.r = (t02.r-t00.r) + 2.*(t12.r-t10.r) + (t22.r-t20.r);
    tex.g = (t00.r-t20.r) + 2.*(t01.r-t21.r) + (t02.r-t22.r);
    tex.b = sqrt(tex.r*tex.r+tex.g*tex.g);
*/

    tex.r = (t02.g-t00.g) + 2.*(t12.g-t10.g) + (t22.g-t20.g);
    tex.g = (t00.g-t20.g) + 2.*(t01.g-t21.g) + (t02.g-t22.g);
    tex.r = t00.r*0.5*(tex.r + (t02.b-t00.b) + 2.*(t12.b-t10.b) + (t22.b-t20.b));
    tex.g = t00.r*0.5*(tex.g + (t00.b-t20.b) + 2.*(t01.b-t21.b) + (t02.b-t22.b));
    
    tex.b = sqrt(tex.r*tex.r+tex.g*tex.g);   


    gl_FragColor = vec4(tex);
}

#ifdef GL_ES
precision mediump float;
#endif

uniform float invTextureSize;

uniform sampler2D sampler;

void main(void) {
    gl_FragColor = vec4(texture2D(sampler, gl_FragCoord.xy*invTextureSize));
}

_$document = $('document');
_$body = null;

_pi = 3.14159265359;
_toRad = 3.14/180.;
_toDeg = 180./3.14;

_enableTextureFloat = true;

_showFps = false;
_logger = new FpsLogger();

_getError = function(){};
_gl = null;

BABYLON.Engine.ShadersRepository = 'js/Babylon.js-1.12/Babylon/Shaders/';
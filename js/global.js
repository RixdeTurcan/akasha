_$document = $('document');
_$body = null;

_pi = 3.14159265359;
_toRad = 3.14/180.;
_toDeg = 180./3.14;

_showFps = false;
_logger = new FpsLogger();

_getError = function(){};
_gl = null;

_test = 0;

BABYLON.Engine.ShadersRepository = 'js/Babylon.js-1.12/Babylon/Shaders/';

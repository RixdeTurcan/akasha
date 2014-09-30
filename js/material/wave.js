function WaveMaterial(name, sea, scene) {
    this.name = name;
    this.id = name;
    this.sea = sea;

    this.textureSize = 1.;

    this.backFaceCulling = false;

    this.shader = new Shader('./shader/pass_through.vertex.fx',
                             './shader/wave.fragment.fx',
                             [],
                             ['./shader/grid.include.fx']);



    this._scene = scene;
    scene.materials.push(this);
};

WaveMaterial.prototype = Object.create(BABYLON.Material.prototype);

WaveMaterial.prototype.needAlphaBlending = function () {
    return false;
};

WaveMaterial.prototype.needAlphaTesting = function () {
    return false;
};

WaveMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

    defines.push('#define INV_TEXTURE_SIZE '+(1./this.textureSize));

    var join = defines.join('\n');
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = true;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.UVKind],
                                           ['uMinPosLeft', 'uMinPosRight', 'uMaxPosLeft', 'uMaxPosRight',
                                            'uEyePosInWorld', 'uTime', 'uWaveMaxHeight',
                                            'uDisplacementWaveMinHeight', 'uDisplacementWaveMaxHeight',
                                            'uNoiseReductionMinHeight', 'uNoiseReductionFactor',
                                            'uWave1Amplitude', 'uWave1Length', 'uWave1TotalLength',
                                            'uWave1RisingLength', 'uWave1Dir', 'uWave1Velocity',
                                            'uWave1EyePosPhase',
                                            'uWave2Amplitude', 'uWave2Length', 'uWave2TotalLength',
                                            'uWave2RisingLength', 'uWave2Dir', 'uWave2Velocity',
                                            'uWave2EyePosPhase',
                                            'uWave3Amplitude', 'uWave3Length', 'uWave3TotalLength',
                                            'uWave3RisingLength', 'uWave3Dir', 'uWave3Velocity',
                                            'uWave3EyePosPhase',
                                            'uShanonMargin'],
                                           [],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

WaveMaterial.prototype.bind = function (world, mesh) {
    var eyePos = _config.world.cameraPos;
    var transform = _config.world.transformMat;
    var invTransform = _config.world.invTransformMat;

    var period = _config.ocean.dataWave.period;
    var time = _config.time%period;


    var deltaEyePos = _config.world.realCameraPos.subtract(eyePos);
    var deltaTime = _config.time-time;
    deltaEyePos = new BABYLON.Vector2(deltaEyePos.x, deltaEyePos.z);

    var eyePosPhase1 = (BABYLON.Vector2.Dot(deltaEyePos,
                                           _config.ocean.dataWave.wave1.direction)
                        +deltaTime*_config.ocean.dataWave.wave1.velocity)
                     %(_config.ocean.dataWave.wave1.totalLength);
    var eyePosPhase2 = (BABYLON.Vector2.Dot(deltaEyePos,
                                           _config.ocean.dataWave.wave2.direction)
                        +deltaTime*_config.ocean.dataWave.wave2.velocity)
                     %(_config.ocean.dataWave.wave2.totalLength);
    var eyePosPhase3 = (BABYLON.Vector2.Dot(deltaEyePos,
                                           _config.ocean.dataWave.wave3.direction)
                        +deltaTime*_config.ocean.dataWave.wave3.velocity)
                     %(_config.ocean.dataWave.wave3.totalLength);

    this._effect.setFloat('uWave1Amplitude', _config.ocean.dataWave.wave1.amplitude);
    this._effect.setFloat('uWave1Length', _config.ocean.dataWave.wave1.length);
    this._effect.setFloat('uWave1TotalLength', _config.ocean.dataWave.wave1.totalLength);
    this._effect.setFloat('uWave1RisingLength', _config.ocean.dataWave.wave1.risingLength);
    this._effect.setVector2('uWave1Dir', _config.ocean.dataWave.wave1.direction);
    this._effect.setFloat('uWave1Velocity', _config.ocean.dataWave.wave1.velocity);
    this._effect.setFloat('uWave1EyePosPhase', eyePosPhase1);


    this._effect.setFloat('uWave2Amplitude', _config.ocean.dataWave.wave2.amplitude);
    this._effect.setFloat('uWave2Length', _config.ocean.dataWave.wave2.length);
    this._effect.setFloat('uWave2TotalLength', _config.ocean.dataWave.wave2.totalLength);
    this._effect.setFloat('uWave2RisingLength', _config.ocean.dataWave.wave2.risingLength);
    this._effect.setVector2('uWave2Dir', _config.ocean.dataWave.wave2.direction);
    this._effect.setFloat('uWave2Velocity', _config.ocean.dataWave.wave2.velocity);
    this._effect.setFloat('uWave2EyePosPhase', eyePosPhase2);

    this._effect.setFloat('uWave3Amplitude', _config.ocean.dataWave.wave3.amplitude);
    this._effect.setFloat('uWave3Length', _config.ocean.dataWave.wave3.length);
    this._effect.setFloat('uWave3TotalLength', _config.ocean.dataWave.wave3.totalLength);
    this._effect.setFloat('uWave3RisingLength', _config.ocean.dataWave.wave3.risingLength);
    this._effect.setVector2('uWave3Dir', _config.ocean.dataWave.wave3.direction);
    this._effect.setFloat('uWave3Velocity', _config.ocean.dataWave.wave3.velocity);
    this._effect.setFloat('uWave3EyePosPhase', eyePosPhase3);

    this._effect.setFloat('uWaveMaxHeight', _config.ocean.dataWave.wave1.amplitude+_config.ocean.dataWave.wave2.amplitude+_config.ocean.dataWave.wave3.amplitude);
    this._effect.setFloat('uNoiseReductionMinHeight', _config.ocean.dataNoise.reductionMinHeight);
    this._effect.setFloat('uNoiseReductionFactor', _config.ocean.dataNoise.reductionFactor);
    this._effect.setFloat('uDisplacementWaveMinHeight', _config.ocean.dataWave.displacementMinHeight);
    this._effect.setFloat('uDisplacementWaveMaxHeight', _config.ocean.dataWave.displacementMaxHeight);

    this._effect.setFloat('uTime', time);

    this._effect.setVector3('uEyePosInWorld', eyePos);

    this._effect.setVector3('uMinPosLeft', this.sea.projectedGrid.minPosLeft);
    this._effect.setVector3('uMinPosRight', this.sea.projectedGrid.minPosRight);
    this._effect.setVector3('uMaxPosLeft', this.sea.projectedGrid.maxPosLeft);
    this._effect.setVector3('uMaxPosRight', this.sea.projectedGrid.maxPosRight);

    this._effect.setFloat('uShanonMargin', _config.ocean.params.shanonMargin);
};

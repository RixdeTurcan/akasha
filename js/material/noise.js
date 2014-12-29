function NoiseMaterial(name, sea, scene) {
    this.name = name;
    this.id = name;
    this.sea = sea;

    this.textureSize = 1.;

    this.backFaceCulling = false;

    this.shader = new Shader('./shader/pass_through.vertex.fx',
                             './shader/noise.fragment.fx',
                             [],
                             ['./shader/noise.include.fx',
                              './shader/grid.include.fx']);

    this._scene = scene;
    scene.materials.push(this);
};

NoiseMaterial.prototype = Object.create(BABYLON.Material.prototype);

NoiseMaterial.prototype.needAlphaBlending = function () {
    return false;
};

NoiseMaterial.prototype.needAlphaTesting = function () {
    return false;
};

NoiseMaterial.prototype.isReady = function (mesh) {
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
                                            'uEyePosInWorld', 'uDeltaEyePosInWorld', 'uTime', 'uPeriod',
                                            'uNoiseFactor', 'uNoiseFactorPow', 'uDisplacementNoiseFactor',
                                            'uOctave1Period', 'uOctave1Amplitude',
                                            'uOctave2Period', 'uOctave2Amplitude',
                                            'uOctave3Period', 'uOctave3Amplitude',
                                            'uShanonMargin'],
                                           [],
                                           join);
    }
    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

NoiseMaterial.prototype.bind = function (world, mesh) {
    var eyePos = _config.world.cameraPos;
    var transform = _config.world.transformMat;
    var invTransform = _config.world.invTransformMat;



    var deltaEyePos = _config.world.realCameraPos.subtract(eyePos);
    var period = _config.ocean.dataNoise.period;
    deltaEyePos.x %= period;
    deltaEyePos.z %= period;

    this._effect.setFloat('uTime', _config.time%period);
    this._effect.setFloat('uPeriod', period);

    this._effect.setFloat('uNoiseFactor', _config.ocean.dataNoise.amplitude);
    this._effect.setFloat('uNoiseFactorPow', _config.ocean.dataNoise.amplitudePow);
    this._effect.setFloat('uDisplacementNoiseFactor', _config.ocean.dataNoise.displacementFactor);

    this._effect.setVector3('uEyePosInWorld', eyePos);
    this._effect.setVector3('uDeltaEyePosInWorld', deltaEyePos);

    this._effect.setVector3('uMinPosLeft', this.sea.projectedGrid.minPosLeft);
    this._effect.setVector3('uMinPosRight', this.sea.projectedGrid.minPosRight);
    this._effect.setVector3('uMaxPosLeft', this.sea.projectedGrid.maxPosLeft);
    this._effect.setVector3('uMaxPosRight', this.sea.projectedGrid.maxPosRight);

    this._effect.setVector3('uOctave1Period', _config.ocean.dataNoise.octave1.period);
    this._effect.setFloat('uOctave1Amplitude', _config.ocean.dataNoise.octave1.amplitude);

    this._effect.setVector3('uOctave2Period', _config.ocean.dataNoise.octave2.period);
    this._effect.setFloat('uOctave2Amplitude', _config.ocean.dataNoise.octave2.amplitude);

    this._effect.setVector3('uOctave3Period', _config.ocean.dataNoise.octave3.period);
    this._effect.setFloat('uOctave3Amplitude', _config.ocean.dataNoise.octave3.amplitude);

    this._effect.setFloat('uShanonMargin', _config.ocean.params.shanonMargin);
};

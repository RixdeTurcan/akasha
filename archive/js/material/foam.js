function FoamMaterial(name, sea, scene) {
    this.name = name;
    this.id = name;
    this.sea = sea;

    this.textureSize = 1.;

    this.backFaceCulling = false;

    this._scene = scene;
    scene.materials.push(this);
};

FoamMaterial.prototype = Object.create(BABYLON.Material.prototype);

FoamMaterial.prototype.needAlphaBlending = function () {
    return false;
};

FoamMaterial.prototype.needAlphaTesting = function () {
    return false;
};

FoamMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

    defines.push('#define INV_TEXTURE_SIZE '+(1./this.textureSize));

    if (this.noiseDataTexture) {
        if (!this.noiseDataTexture.isReady()) {
            return false;
        } else {
            defines.push('#define NOISE_DATA');
        }
    }

    if (this.waveDataTexture) {
        if (!this.waveDataTexture.isReady()) {
            return false;
        } else {
            defines.push('#define WAVE_DATA');
        }
    }

    var join = defines.join('\n');
    if (this._cachedDefines != join)
    {
        this._cachedDefines = true;
        this._effect = engine.createEffect({vertex: 'shader/pass_through',
                                            fragment: 'shader/foam'},
                                           [BABYLON.VertexBuffer.UVKind],
                                           ['uNoiseFactor', 'uEyePosInWorld',
                                            'uMinPosLeft', 'uMinPosRight',
                                            'uMaxPosLeft', 'uMaxPosRight',
                                            'uDisplacementNoiseFactor',
                                            'uWaveMaxHeight',
                                            'uDisplacementWaveFactor'],
                                           ['uNoiseDataSampler', 'uWaveDataSampler'],
                                           join);
    }

    if (!this._effect.isReady()) {
        return false;
    }

    return true;
};

FoamMaterial.prototype.bind = function (world, mesh) {
    var eyePos = _config.world.cameraPos;
    var transform = _config.world.transformMat;
    var invTransform = _config.world.invTransformMat;

    if (this.waveDataTexture) {
        this._effect.setTexture("uWaveDataSampler", this.waveDataTexture);
    }

    if (this.noiseDataTexture) {
        this._effect.setTexture("uNoiseDataSampler", this.noiseDataTexture);
    }

    this._effect.setFloat('uNoiseFactor', _config.ocean.dataNoise.displacementFactor);

    this._effect.setVector3('uEyePosInWorld', eyePos);
/*
    var minPosLeft = this.sea.projectOnYPlane(this.sea.minPosLeft, eyePos);
    var minPosRight = this.sea.projectOnYPlane(this.sea.minPosRight, eyePos);
    var maxPosLeft = this.sea.projectOnYPlane(this.sea.maxPosLeft, eyePos);
    var maxPosRight = this.sea.projectOnYPlane(this.sea.maxPosRight, eyePos);

    this._effect.setVector3('uMinPosLeft', minPosLeft);
    this._effect.setVector3('uMinPosRight', minPosRight);
    this._effect.setVector3('uMaxPosLeft', maxPosLeft);
    this._effect.setVector3('uMaxPosRight', maxPosRight);
*/

    this._effect.setVector3('uMinPosLeft', this.sea.projectedGrid.minPosLeft);
    this._effect.setVector3('uMinPosRight', this.sea.projectedGrid.minPosRight);
    this._effect.setVector3('uMaxPosLeft', this.sea.projectedGrid.maxPosLeft);
    this._effect.setVector3('uMaxPosRight', this.sea.projectedGrid.maxPosRight);

    this._effect.setFloat('uWaveMaxHeight', _config.ocean.dataWave.wave1.amplitude+_config.ocean.dataWave.wave2.amplitude+_config.ocean.dataWave.wave3.amplitude);
    this._effect.setFloat('uDisplacementWaveFactor', _config.ocean.dataWave.displacementFactor);
    this._effect.setFloat('uNoiseFactor', _config.ocean.dataNoise.amplitude);
    this._effect.setFloat('uDisplacementNoiseFactor', _config.ocean.dataNoise.displacementFactor);

};

FoamMaterial.prototype.unbind = function () {
    if (this.waveDataTexture) {
        this._effect.setTexture('uWaveDataSampler', null);
    }

    if (this.noiseDataTexture) {
        this._effect.setTexture('uNoiseDataSampler', null);
    }
};

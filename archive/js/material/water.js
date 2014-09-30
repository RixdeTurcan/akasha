
function WaterMaterial(name, scene) {
    BABYLON.StandardMaterial.call(this, name, scene);


    this._time = 0;
    this.windDirection = new BABYLON.Vector2(0.1, 0.9);
    this.windVelocity = 0.1;
    this.windWaveFactorLength = 0.06;
    this.windWaveFactorHeight = 0.1;

    this.datawind = {
        direction: new BABYLON.Vector2(1.0, 0.0),
        amplitude: 0.,
        velocity: 1.,
        length: 1.
    };

    this.dataWave1 = {
      direction: new BABYLON.Vector2(1.0, 0.0),
      amplitude: 0.,
      velocity: 1.,
      length: 1.
    };

    this.dataWave2 = {
      direction: new BABYLON.Vector2(1.0, 0.0),
      amplitude: 0.,
      velocity: 1.,
      length: 1.
    };

    this.dataWave3 = {
      direction: new BABYLON.Vector2(1.0, 0.0),
      amplitude: 0.,
      velocity: 1.,
      length: 1.
    };


    this.segmentLength = 1.0;
    this.seaWidth = 1.0;

    this.reflectionOffset = 0.;
    this.refractionFactor = 0.;
};

WaterMaterial.prototype = Object.create(BABYLON.StandardMaterial.prototype);



// Methods
WaterMaterial.prototype.getRenderTargetTextures = function () {
    this._renderTargets = BABYLON.StandardMaterial.prototype.getRenderTargetTextures.call(this);

    if (this.refractionTexture && this.refractionTexture.isRenderTarget) {
        this._renderTargets.push(this.refractionTexture);
    }

    if (this.previousFoamAndNoiseTexture && this.previousFoamAndNoiseTexture.isRenderTarget) {
        this._renderTargets.push(this.previousFoamAndNoiseTexture);
    }

    if (this.foamAndNoiseTexture && this.foamAndNoiseTexture.isRenderTarget) {
        this._renderTargets.push(this.foamAndNoiseTexture);
    }

    if (this.seabedTexture && this.seabedTexture.isRenderTarget) {
        this._renderTargets.push(this.seabedTexture);
    }

    if (this.reflectionTexture2 && this.reflectionTexture2.isRenderTarget) {
        this._renderTargets.push(this.reflectionTexture2);
    }

    return this._renderTargets;
};

WaterMaterial.prototype.unbind = function () {
    BABYLON.StandardMaterial.prototype.unbind.call(this);

    if (this.refractionTexture && this.refractionTexture.isRenderTarget) {
        this._effect.setTexture("refractionSampler", null);
    }

    if (this.foamAndNoiseTexture && this.foamAndNoiseTexture.isRenderTarget) {
        this._effect.setTexture("foamAndNoiseSampler", null);
    }

    if (this.reflectionTexture2 && this.reflectionTexture2.isRenderTarget) {
        this._effect.setTexture("reflection2DSampler2", null);
    }

    if (this.seabedTexture && this.seabedTexture.isRenderTarget) {
        this._effect.setTexture("seabed2DSampler", null);
    }
};

WaterMaterial.prototype.bind = function (world, mesh) {
    BABYLON.StandardMaterial.prototype.bind.call(this, world, mesh);

    this._time += 0.001 * this._scene.getAnimationRatio();

    this._effect.setFloat("windWaveFactorLength", this.datawind.length);
    this._effect.setFloat("windWaveFactorHeight", this.datawind.amplitude);

    this._effect.setFloat("time", this._time);
    this._effect.setFloat("seaWidth", this.seaWidth);
    this._effect.setFloat("reflectionOffset", this.reflectionOffset);
    this._effect.setFloat("refractionFactor", this.refractionFactor);


    this.dataWave1.direction.normalize();
    this.dataWave2.direction.normalize();
    this.dataWave3.direction.normalize();

    this._effect.setVector2("dataWave1Direction", this.dataWave1.direction);
    this._effect.setFloat("dataWave1Amplitude", 0.5*this.dataWave1.amplitude);
    this._effect.setFloat("dataWave1Velocity", 2*_pi*this.dataWave1.velocity);
    this._effect.setFloat("dataWave1Length", 2*_pi/this.dataWave1.length);
    this._effect.setMatrix2("rot1", [this.dataWave1.direction.x, -this.dataWave1.direction.y,
                                     this.dataWave1.direction.y, this.dataWave1.direction.x]);
    this._effect.setMatrix2("rotT1", [this.dataWave1.direction.x, this.dataWave1.direction.y,
                                     -this.dataWave1.direction.y, this.dataWave1.direction.x]);


    this._effect.setVector2("dataWave2Direction", this.dataWave2.direction);
    this._effect.setFloat("dataWave2Amplitude", 0.5*this.dataWave2.amplitude);
    this._effect.setFloat("dataWave2Velocity", 2*_pi*this.dataWave2.velocity);
    this._effect.setFloat("dataWave2Length", 2*_pi/this.dataWave2.length);
    this._effect.setMatrix2("rot2", [this.dataWave2.direction.x, -this.dataWave2.direction.y,
                                     this.dataWave2.direction.y, this.dataWave2.direction.x]);
    this._effect.setMatrix2("rotT2", [this.dataWave2.direction.x, this.dataWave2.direction.y,
                                     -this.dataWave2.direction.y, this.dataWave2.direction.x]);

    this._effect.setVector2("dataWave3Direction", this.dataWave3.direction);
    this._effect.setFloat("dataWave3Amplitude", 0.5*this.dataWave3.amplitude);
    this._effect.setFloat("dataWave3Velocity", 2*_pi*this.dataWave3.velocity);
    this._effect.setFloat("dataWave3Length", 2*_pi/this.dataWave3.length);
    this._effect.setMatrix2("rot3", [this.dataWave3.direction.x, -this.dataWave3.direction.y,
                                     this.dataWave3.direction.y, this.dataWave3.direction.x]);
    this._effect.setMatrix2("rotT3", [this.dataWave3.direction.x, this.dataWave3.direction.y,
                                     -this.dataWave3.direction.y, this.dataWave3.direction.x]);

    this._effect.setFloat('invMaxWaveAmplitude', 1./(this.dataWave1.amplitude+this.dataWave2.amplitude+this.dataWave3.amplitude));

        this._effect.setFloat("segmentLength", this.segmentLength);

    if (this.refractionTexture) {
        this._effect.setTexture("refractionSampler", this.refractionTexture);
    }

    if (this.foamAndNoiseTexture) {
        this._effect.setTexture("foamAndNoiseSampler", this.foamAndNoiseTexture);
    }

    if (this.reflectionTexture2) {
        this._effect.setTexture("reflection2DSampler2", this.reflectionTexture2);
    }

    if (this.seabedTexture) {
        this._effect.setTexture("seabed2DSampler", this.seabedTexture);
    }

    if (this.bumpTexture && this._scene.getEngine().getCaps().standardDerivatives) {
        this._effect.setMatrix("bumpMatrix", this.bumpTexture._computeTextureMatrix().multiply(
                    BABYLON.Matrix.Translation(this.datawind.direction.x * this.datawind.velocity * this._time,
                                               this.datawind.direction.y * this.datawind.velocity * this._time, 0)));
    }

    if (this.foamTexture) {
        this._effect.setTexture("foamSampler", this.foamTexture);

        this._effect.setFloat2("vFoamInfos", this.foamTexture.coordinatesIndex, this.foamTexture.level);
        this._effect.setMatrix("foamMatrix", this.foamTexture._computeTextureMatrix());
    }
};

WaterMaterial.prototype.getAnimatables = function () {
    var results = BABYLON.StandardMaterial.prototype.getAnimatables.call(this);

    if (this.refractionTexture && this.refractionTexture.animations && this.refractionTexture.animations.length > 0) {
        results.push(this.refractionTexture);
    }

    if (this.foamAndNoiseTexture && this.foamAndNoiseTexture.animations && this.foamAndNoiseTexture.animations.length > 0) {
        results.push(this.foamAndNoiseTexture);
    }

    if (this.reflectionTexture2 && this.reflectionTexture2.animations && this.reflectionTexture2.animations.length > 0) {
        results.push(this.reflectionTexture2);
    }

    if (this.seabedTexture && this.seabedTexture.animations && this.seabedTexture.animations.length > 0) {
        results.push(this.seabedTexture);
    }

    if (this.foamTexture && this.foamTexture.animations && this.foamTexture.animations.length > 0) {
        results.push(this.foamTexture);
    }


    return results;
};

WaterMaterial.prototype.dispose = function () {
    if (this.refractionTexture) {
        this.refractionTexture.dispose();
    }

    if (this.foamAndNoiseTexture) {
        this.foamAndNoiseTexture.dispose();
    }

    if (this.reflectionTexture2) {
        this.reflectionTexture2.dispose();
    }

    if (this.seabedTexture) {
        this.seabedTexture.dispose();
    }

    if (this.foamTexture) {
        this.foamTexture.dispose();
    }

    BABYLON.StandardMaterial.prototype.dispose.call(this);
};

WaterMaterial.prototype.isReady = function (mesh) {
    var defines = [];
    if (this.refractionTexture) {
        if (!this.refractionTexture.isReady() ) {
            return false;
        } else {
            defines.push('#define REFRACTION');
        }
    }

    if (this.foamAndNoiseTexture) {
        if (!this.foamAndNoiseTexture.isReady() ) {
            return false;
        } else {
            defines.push('#define FOAM_NOISE');
        }
    }

    if (this.reflectionTexture2) {
        if (!this.reflectionTexture2.isReady()) {
            return false;
        } else {
            defines.push("#define REFLECTION2");
        }
    }

    if (this.foamTexture) {
        if (!this.foamTexture.isReady()) {
            return false;
        } else {
            defines.push("#define FOAM_TEXTURE");
        }
    }

    if (this.seabedTexture) {
        if (!this.seabedTexture.isReady()) {
            return false;
        } else {
            defines.push("#define SEABED");
        }
    }


    var uniforms = ['windWaveFactorLength', 'windWaveFactorHeight', 'time', 'seaWidth', 'reflectionOffset', 'refractionFactor', 'segmentLength',
                     'dataWave1Direction', 'dataWave1Amplitude', 'dataWave1Velocity', 'dataWave1Length', 'rot1', 'rotT1',
                     'dataWave2Direction', 'dataWave2Amplitude', 'dataWave2Velocity', 'dataWave2Length', 'rot2', 'rotT2',
                     'dataWave3Direction', 'dataWave3Amplitude', 'dataWave3Velocity', 'dataWave3Length', 'rot3', 'rotT3',
                     'invMaxWaveAmplitude', 'vFoamInfos', 'foamMatrix'];

    var samplers = ['refractionSampler', 'reflection2DSampler2', 'foamAndNoiseSampler', 'foamSampler', 'seabed2DSampler'];

    return StandardMaterialIsReady(this, mesh, 'shader/water', defines, uniforms, samplers);

};

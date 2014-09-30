function FoamAccumulationMaterial(name, sea, scene) {
    this.name = name;
    this.id = name;
    this.sea = sea;

    this.textureSize = 1.;

    this.backFaceCulling = false;

    this.shader = new Shader('./shader/pass_through.vertex.fx',
                             './shader/foam_accumulation.fragment.fx',
                             [],
                             []);

    this._scene = scene;
    scene.materials.push(this);
};

FoamAccumulationMaterial.prototype = Object.create(BABYLON.Material.prototype);

FoamAccumulationMaterial.prototype.needAlphaBlending = function () {
    return false;
};

FoamAccumulationMaterial.prototype.needAlphaTesting = function () {
    return false;
};

FoamAccumulationMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

    defines.push('#define INV_TEXTURE_SIZE '+(1./this.textureSize));

    if (this.swapBufferTexture) {
        if (!this.swapBufferTexture.isReady()) {
            return false;
        } else {
            defines.push('#define SWAP');
        }
    }

    if (this.foamShoreTexture) {
        if (!this.foamShoreTexture.isReady()) {
            return false;
        } else {
            defines.push('#define SHORE');
        }
    }

    var join = defines.join('\n');
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = true;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.UVKind],
                                           ['uFoamWidth',
                                            'uDeltaCenterPos',
                                            'uTime',
                                            'uDispertion', 'uVelAbs', 'uViscosity',
                                            'uSourceAdd', 'uWaveBreakingAngle',
                                            'uWave1CenterPosPhase', 'uWave2CenterPosPhase', 'uWave3CenterPosPhase',
                                            'uWave1TotalLength', 'uWave1RisingLength', 'uWave1Dir', 'uWave1Velocity',
                                            'uWave2TotalLength', 'uWave2RisingLength', 'uWave2Dir', 'uWave2Velocity',
                                            'uWave3TotalLength', 'uWave3RisingLength', 'uWave3Dir', 'uWave3Velocity'],
                                           ['uSwapSampler', 'uFoamShoreSampler'],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};


FoamAccumulationMaterial.prototype.bind = function (world, mesh) {
    var eyePos = _config.world.cameraPos;
    var transform = _config.world.transformMat;
    var invTransform = _config.world.invTransformMat;

    var period = _config.ocean.dataWave.period;
    var time = _config.time%period;
    var deltaTime = _config.time-time;

    var deltaPos = new BABYLON.Vector2(this.sea.centerPos.x, this.sea.centerPos.z);

    var centerPosPhase1 = (BABYLON.Vector2.Dot(deltaPos,
                                           _config.ocean.dataWave.wave1.direction)
                        +deltaTime*_config.ocean.dataWave.wave1.velocity)
                     %(_config.ocean.dataWave.wave1.totalLength);
    var centerPosPhase2 = (BABYLON.Vector2.Dot(deltaPos,
                                           _config.ocean.dataWave.wave2.direction)
                        +deltaTime*_config.ocean.dataWave.wave2.velocity)
                     %(_config.ocean.dataWave.wave2.totalLength);
    var centerPosPhase3 = (BABYLON.Vector2.Dot(deltaPos,
                                           _config.ocean.dataWave.wave3.direction)
                        +deltaTime*_config.ocean.dataWave.wave3.velocity)
                     %(_config.ocean.dataWave.wave3.totalLength);


    if (this.swapBufferTexture) {
        this._effect.setTexture("uSwapSampler", this.swapBufferTexture);
        this._effect.setVector3('uDeltaCenterPos', this.sea.deltaCenterPos);
    }

    if (this.foamShoreTexture) {
        this._effect.setTexture("uFoamShoreSampler", this.foamShoreTexture);
    }

    this._effect.setFloat('uTime', time);

    this._effect.setFloat("uFoamWidth", _config.ocean.params.foamAccTextureWidth);

    this._effect.setFloat('uWave1TotalLength', _config.ocean.dataWave.wave1.totalLength);
    this._effect.setFloat('uWave1RisingLength', _config.ocean.dataWave.wave1.risingLength);
    this._effect.setVector2('uWave1Dir', _config.ocean.dataWave.wave1.direction);
    this._effect.setFloat('uWave1Velocity', _config.ocean.dataWave.wave1.velocity);
    this._effect.setFloat('uWave1CenterPosPhase', centerPosPhase1);


    this._effect.setFloat('uWave2TotalLength', _config.ocean.dataWave.wave2.totalLength);
    this._effect.setFloat('uWave2RisingLength', _config.ocean.dataWave.wave2.risingLength);
    this._effect.setVector2('uWave2Dir', _config.ocean.dataWave.wave2.direction);
    this._effect.setFloat('uWave2Velocity', _config.ocean.dataWave.wave2.velocity);
    this._effect.setFloat('uWave2CenterPosPhase', centerPosPhase2);

    this._effect.setFloat('uWave3TotalLength', _config.ocean.dataWave.wave3.totalLength);
    this._effect.setFloat('uWave3RisingLength', _config.ocean.dataWave.wave3.risingLength);
    this._effect.setVector2('uWave3Dir', _config.ocean.dataWave.wave3.direction);
    this._effect.setFloat('uWave3Velocity', _config.ocean.dataWave.wave3.velocity);
    this._effect.setFloat('uWave3CenterPosPhase', centerPosPhase3);

    this._effect.setFloat('uDispertion', _config.ocean.dataFoam.dispertion);
    this._effect.setFloat('uVelAbs', _config.ocean.dataFoam.velocityAbsorbtion);
    this._effect.setFloat('uViscosity', _config.ocean.dataFoam.viscosity);
    this._effect.setFloat('uSourceAdd', _config.ocean.dataFoam.sourceAddition);
    this._effect.setFloat('uWaveBreakingAngle', _config.ocean.dataFoam.waveBreakingAngle);
};

FoamAccumulationMaterial.prototype.unbind = function () {
    if (this.texture) {
        this._effect.setTexture('uFoamSampler', null);
    }

    if (this.swapBufferTexture) {
        this._effect.setTexture('uSwapSampler', null);
    }

    if (this.foamShoreTexture) {
        this._effect.setTexture('uFoamShoreSampler', null);
    }

    if (this.waveDataTexture) {
        this._effect.setTexture('uWaveDataSampler', null);
    }
};

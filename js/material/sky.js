function SkyMaterial(name, scene, camera) {
    this.name = name;
    this.id = name;

    this._scaledDiffuse = new BABYLON.Color3();
    this._scaledSpecular = new BABYLON.Color3()

    this._renderTargets = new BABYLON.SmartArray(16);

    this.projectedGrid = new ProjectedGrid(camera);
    this.projectedGrid.marginX = 1.0;
    this.projectedGrid.marginY = 1.0;
    this.projectedGrid.depth = 0.0;

    this.shader = new Shader('./shader/pass_through.vertex.fx',
                             './shader/sky.fragment.fx',
                             [],
                             ['./shader/sphere_grid.include.fx',
                              './shader/phong.include.fx']);

    this.backFaceCulling = false;
    this._scene = scene;
    scene.materials.push(this);
};

SkyMaterial.prototype = Object.create(BABYLON.Material.prototype);

// Properties
SkyMaterial.prototype.needAlphaBlending = function () {
    return false;
};

SkyMaterial.prototype.needAlphaTesting = function () {
    return false;
};

// Methods

SkyMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];
    if (_config.sky.params.outScatNbStep>1){
        defines.push('#define OUT_SCAT_NB_STEP '+_config.sky.params.outScatNbStep);
    }
    defines.push('#define DEPTH 1.');

    // Fog
    if (this._scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
        defines.push("#define FOG");
        if (this._scene.fogMode == BABYLON.Scene.FOGMODE_LINEAR){
            defines.push("#define FOGMODE_LINEAR");
        }else if (this._scene.fogMode == BABYLON.Scene.FOGMODE_EXP){
            defines.push("#define FOGMODE_EXP");
        }else if (this._scene.fogMode == BABYLON.Scene.FOGMODE_EXP2){
            defines.push("#define FOGMODE_EXP2");
        }
    }


    var join = defines.join("\n");
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = join;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.UVKind],
                                           ['uDeltaPlayerPos', 'uFogInfos',
                                            'uSunDirection', 'uSunLight', 'uSunColor',
                                            'uEarthRadius', 'uAtmosphereRadius', 'uDensity',
                                            'uBetaRayleigh', 'uBetaMie', 'uCloudHeight',
                                            'uBetaAerosol', 'uBetaOutScat', 'uCloudVerticalDepth',
                                            'uMieAerosolDistMax', 'uMieAerosolScaleMax', 'uMieExentricity',
                                            'uRayleighPolarization', 'uAerosolFactor', 'uOutScatFactor'],
                                           ['uCloudSampler'],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

SkyMaterial.prototype.bind = function (world, mesh) {

    var eyePos = this._scene.activeCamera.position;
    var transform = this._scene.getTransformMatrix();
    var invTransform = transform.clone();
    invTransform.invert();
    this.projectedGrid.compute(eyePos, transform, invTransform, false);

    _config.sky.params.sunDir.normalize();

    this._effect.setVector3('uSunDirection', _config.sky.params.sunDir);
    this._effect.setVector3('uSunLight', _config.sky.params.sunLight);
    this._effect.setVector3('uSunColor', _config.sky.params.sunColor);
    this._effect.setFloat('uEarthRadius', _config.sky.params.earthRadius);
    this._effect.setFloat('uAtmosphereRadius', _config.sky.params.atmosphereRadius);
    this._effect.setVector3('uBetaRayleigh', _config.sky.params.betaRayleight);
    this._effect.setVector3('uBetaMie', _config.sky.params.betaMie);
    this._effect.setVector3('uBetaAerosol', _config.sky.params.betaAerosol);
    this._effect.setVector3('uBetaOutScat', _config.sky.params.betaOutScat);
    this._effect.setFloat('uMieAerosolDistMax', _config.sky.params.mieAerosolDistMax);
    this._effect.setFloat('uMieAerosolScaleMax', _config.sky.params.mieAerosolScaleMax);
    this._effect.setFloat('uMieExentricity', _config.sky.params.mieExentricity);
    this._effect.setFloat('uRayleighPolarization', _config.sky.params.rayleighPolarization);
    this._effect.setFloat('uAerosolFactor', _config.sky.params.aerosolFactor);
    this._effect.setFloat('uOutScatFactor', _config.sky.params.outScatFactor);




    this._effect.setVector3('uDeltaPlayerPos', _config.sky.deltaPlayerPos);
    this._effect.setFloat('uCloudHeight', _config.sky.cloud.cloudHeight);
    this._effect.setFloat('uCloudVerticalDepth', _config.sky.cloud.verticalDepth);
    this._effect.setFloat('uDensity', _config.sky.cloud.density);

    // Fog
    if (this._scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
        var fogFactor = 0.3;
        this._effect.setFloat4('uFogInfos', this._scene.fogMode, this._scene.fogStart, this._scene.fogEnd, this._scene.fogDensity*fogFactor);
    }

    if (this.cloudTexture) {
        this._effect.setTexture('uCloudSampler', this.cloudTexture);
    }
};

SkyMaterial.prototype.dispose = function(){
};


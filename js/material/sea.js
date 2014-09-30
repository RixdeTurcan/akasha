function SeaMaterial(name, scene, ocean) {
    this.name = name;
    this.id = name;

    this.ocean = ocean;

    this._scaledDiffuse = new BABYLON.Color3();
    this._scaledSpecular = new BABYLON.Color3()

    this.projectedGrid = new ProjectedGrid(this.ocean.camera);
    this.projectedGrid.horizonFactor = 0.98;

    this._renderTargets = new BABYLON.SmartArray(32);
    this._lightMatrix = BABYLON.Matrix.Zero();


    this.centerPos = new BABYLON.Vector3(0., 0., 1000.);
    this.deltaFoamCenterPos = new BABYLON.Vector3(0., 0., 0.);
    this.previousCenterPos = new BABYLON.Vector3(0., 0., 0.);
    this.deltaCenterPos = new BABYLON.Vector3(0., 0., 0.);

    this.wireframe = false;

    this.shader = new Shader('./shader/sea.vertex.fx',
                             './shader/sea.fragment.fx',
                             ['./shader/grid.include.fx'],
                             ['./shader/sphere_grid.include.fx',
                              './shader/phong.include.fx']);

    this.swapBufferId = 0;

    this.backFaceCulling = false;
    this._scene = scene;
    scene.materials.push(this);
};

SeaMaterial.prototype = Object.create(BABYLON.Material.prototype);


SeaMaterial.prototype.update = function(eyePos) {

    var dist = _config.ocean.params.foamAccTextureWidth/8.;

    this.previousCenterPos = this.centerPos.clone();;

    if (this.centerPos.x-_config.player.position.x > dist){
        this.centerPos.x -= dist;
    }else if (this.centerPos.x-_config.player.position.x < -dist){
        this.centerPos.x += dist;
    }

    if (this.centerPos.z-_config.player.position.z > dist){
        this.centerPos.z -= dist;
    }else if (this.centerPos.z-_config.player.position.z < -dist){
        this.centerPos.z += dist;
    }

    this.deltaFoamCenterPos = _config.player.position.subtract(this.centerPos);
    this.deltaCenterPos = this.centerPos.subtract(this.previousCenterPos);

    _config.ocean.deltaFoamCenterPos = this.deltaFoamCenterPos;
}

// Properties
SeaMaterial.prototype.needAlphaBlending = function () {
    return false;
};

SeaMaterial.prototype.needAlphaTesting = function () {
    return false;
};

// Methods
SeaMaterial.prototype.getRenderTargetTextures = function () {
    this._renderTargets.reset();

    this.swapBufferId = (this.swapBufferId+1)%2;

    if (this.waveDataTexture && this.waveDataTexture.isRenderTarget) {
        this._renderTargets.push(this.waveDataTexture);
    }

    if (this.noiseDataTexture && this.noiseDataTexture.isRenderTarget) {
        this._renderTargets.push(this.noiseDataTexture);
    }

    if (this.noise2DataTexture && this.noise2DataTexture.isRenderTarget) {
        this._renderTargets.push(this.noise2DataTexture);
    }

    if (this.reflectionTexture && this.reflectionTexture.isRenderTarget) {
        this._renderTargets.push(this.reflectionTexture);
    }

    if (this.refractionTexture && this.refractionTexture.isRenderTarget) {
        this._renderTargets.push(this.refractionTexture);
    }

    if (this.seabedTexture && this.seabedTexture.isRenderTarget) {
        this._renderTargets.push(this.seabedTexture);
    }

    if (this.foamTexture && this.foamTexture.isRenderTarget) {
        this._renderTargets.push(this.foamTexture);
    }

    if (_config.step%2==0){
        if (this.foamAccTexture1 && this.foamAccTexture1.isRenderTarget) {
            this._renderTargets.push(this.foamAccTexture1);
        }
    }else{
        if (this.foamAccTexture2 && this.foamAccTexture2.isRenderTarget) {
            this._renderTargets.push(this.foamAccTexture2);
        }
    }

    if (this.foamShoreTexture && this.foamShoreTexture.isRenderTarget) {
        this._renderTargets.push(this.foamShoreTexture);
    }

    return this._renderTargets;
};

SeaMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

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

    var shadowsActivated = false;
    var lightIndex = 0;
    if (this._scene.lightsEnabled) {
        for (var index = 0; index < this._scene.lights.length; index++) {
            var light = this._scene.lights[index];

            if (!light.isEnabled()) continue;
            if (mesh && light.excludedMeshes.indexOf(mesh) !== -1) continue;

            defines.push("#define LIGHT" + lightIndex);

            if (light instanceof BABYLON.PointLight){
             defines.push("#define LIGHT" + lightIndex + "_TYPE_POINT");
            }
            if (light instanceof BABYLON.DirectionalLight){
             defines.push("#define LIGHT" + lightIndex + "_TYPE_DIR");
            }
            if (light instanceof BABYLON.HemisphericLight){
             defines.push("#define LIGHT" + lightIndex + "_TYPE_POINT");
            }

            // Shadows
            if (mesh && mesh.receiveShadows) {
                defines.push("#define SHADOW" + lightIndex);

                if (!shadowsActivated) {
                    defines.push("#define SHADOWS");
                    shadowsActivated = true;
                }
            }


            lightIndex++;
            if (lightIndex == 4)break;
        }
    }

    if (this._scene.getEngine().getCaps().standardDerivatives && this.bumpTexture) {
        if (!this.bumpTexture.isReady()) {
            return false;
        } else {
            defines.push("#define BUMP");
            defines.push("#define WITH_STANDARD_DERIVATIVES");
        }
    }

    if (this.foamDiffuseTexture) {
        if (!this.foamDiffuseTexture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE");
        }
    }

    if (this.noise2DataTexture) {
        if (!this.noise2DataTexture.isReady()) {
            return false;
        } else {
            defines.push("#define NOISE_DATA");
        }
    }

    if (this.waveDataTexture) {
        if (!this.waveDataTexture.isReady()) {
            return false;
        } else {
            defines.push("#define WAVE_DATA");
        }
    }

    if (this.reflectionTexture) {
        if (!this.reflectionTexture.isReady()) {
            return false;
        } else {
            defines.push("#define REFLECTION");
        }
    }

    if (this.refractionTexture) {
        if (!this.refractionTexture.isReady()) {
            return false;
        } else {
            defines.push("#define REFRACTION");
        }
    }

    if (this.seabedTexture) {
        if (!this.seabedTexture.isReady()) {
            return false;
        } else {
            defines.push("#define SEABED");
        }
    }

    if (this.foamAccTexture1 && this.foamAccTexture2) {
        if (!this.foamAccTexture1.isReady() || !this.foamAccTexture2.isReady()) {
            return false;
        } else {
            defines.push("#define FOAM");
        }
    }

    if (this.skyTexture) {
        if (!this.skyTexture.isReady()) {
            return false;
        } else {
            defines.push("#define SKY");
        }
    }

    if (this.cloudTexture) {
        if (!this.cloudTexture.isReady()) {
            return false;
        } else {
            defines.push("#define CLOUD");
        }
    }


    var join = defines.join("\n");
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = join;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.UVKind],
                                           ['uViewProjection', 'uEyePosInWorld', 'uDeltaFoamCenterPos', 'uView', 'uTime',
                                            'uFogInfos', 'uSkyReflectionFactor', 'uSkyReflectionAbsorbtion',
                                            'uMinPosLeft', 'uMinPosRight','uMaxPosLeft', 'uMaxPosRight',
                                            'uLightData0', 'uLightDiffuse0', 'uLightSpecular0',
                                            'uLightData1', 'uLightDiffuse1', 'uLightSpecular1',
                                            'uBumpInfos', 'uBumpMatrix',
                                            'uReflectionMatrix', 'uReflectionFactor',
                                            'uWindWaveFactorLength', 'uWindWaveFactorAmplitudeNormal',
                                            'uWindWaveFactorAmplitudeReflection',
                                            'uWaveMaxHeight', 'uDisplacementWaveFactor',
                                            'uNoiseFactor', 'uDisplacementNoiseFactor',
                                            'uTurbidityFactor', 'uFoamHeight', 'uFoamLength',
                                            'uTangentScreenDist', 'uHorizonDist',
                                            'uVerticalShift', 'uSunDir', 'uDeltaPlayerSkyPos',
                                            'uDiffuseInfos', 'uDiffuseMatrix',
                                            'uFoamWidth', 'uSeaColor',
                                            'uCloudHeight', 'uShadowDarkness', 'uShadowHardness',
                                            "lightMatrix0", "lightMatrix1", "lightMatrix2", "lightMatrix3",
                                            "darkness0", "darkness1", "darkness2", "darkness3"],
                                           ['uBumpSampler', 'uWaveDataSampler',
                                            'uNoiseDataSampler', 'uReflectionSampler', 'uRefractionSampler',
                                            'uSeabedSampler', 'uFoamSampler', 'uDiffuseSampler',
                                            'uSkySampler', 'uCloudSampler',
                                            "shadowSampler0", "shadowSampler1", "shadowSampler2", "shadowSampler3"],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

SeaMaterial.prototype.unbind = function ()
{
    if (this.waveDataTexture && this.waveDataTexture.isRenderTarget){
        this._effect.setTexture("uWaveDataSampler", null);
    }

    if (this.noise2DataTexture && this.noise2DataTexture.isRenderTarget){
        this._effect.setTexture("uNoiseDataSampler", null);
    }

    if (this.reflectionTexture && this.reflectionTexture.isRenderTarget) {
        this._effect.setTexture("uReflectionSampler", null);
    }

    if (this.refractionTexture && this.refractionTexture.isRenderTarget) {
        this._effect.setTexture("uRefractionSampler", null);
    }

    if (this.seabedTexture && this.seabedTexture.isRenderTarget) {
        this._effect.setTexture("uSeabedSampler", null);
    }

    if ( this.foamAccTexture1 && this.foamAccTexture1.isRenderTarget
      && this.foamAccTexture2 && this.foamAccTexture2.isRenderTarget) {
        this._effect.setTexture("uFoamSampler", null);
    }

    if (this.skyTexture && this.skyTexture.isRenderTarget) {
        this._effect.setTexture("uSkySampler", null);
    }

    if (this.cloudTexture && this.cloudTexture.isRenderTarget) {
        this._effect.setTexture("uCloudSampler", null);
    }
};

SeaMaterial.prototype.bind = function (world, mesh) {

    var eyePos = _config.world.cameraPos;
    var transform = _config.world.transformMat;
    var invTransform = _config.world.invTransformMat;
    var viewMat = _config.world.viewMat;

    this._effect.setMatrix('uWorld', world);
    this._effect.setMatrix('uViewProjection', transform);
    this._effect.setMatrix("uView", viewMat);

    this._effect.setFloat('uTime', _config.time);

    this._effect.setVector3('uEyePosInWorld', eyePos);
    this._effect.setVector3('uDeltaFoamCenterPos', this.deltaFoamCenterPos);



    this._effect.setFloat('uWaveMaxHeight', _config.ocean.dataWave.wave1.amplitude+_config.ocean.dataWave.wave2.amplitude+_config.ocean.dataWave.wave3.amplitude);
    this._effect.setFloat('uDisplacementWaveFactor', _config.ocean.dataWave.displacementFactor);
    this._effect.setFloat('uNoiseFactor', _config.ocean.dataNoise.amplitude);
    this._effect.setFloat('uDisplacementNoiseFactor', _config.ocean.dataNoise.displacementFactor);

    this._effect.setVector3('uMinPosLeft', this.projectedGrid.minPosLeft);
    this._effect.setVector3('uMinPosRight', this.projectedGrid.minPosRight);
    this._effect.setVector3('uMaxPosLeft', this.projectedGrid.maxPosLeft);
    this._effect.setVector3('uMaxPosRight', this.projectedGrid.maxPosRight);

    this._effect.setFloat('uHorizonDist', _config.ocean.params.horizonDist);

    this._effect.setFloat('uTangentScreenDist', _config.ocean.params.tangentScreenDist);

    this._effect.setColor3('uSeaColor', _config.ocean.params.seaColor);

    // Fog
    if (this._scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
        this._effect.setFloat4('uFogInfos', this._scene.fogMode, this._scene.fogStart, this._scene.fogEnd, this._scene.fogDensity);
    }

    // Lights
    if (this._scene.lightsEnabled) {
        var lightIndex = 0;
        for (var index = 0; index < this._scene.lights.length; index++) {
            var light = this._scene.lights[index];

            if (!light.isEnabled()) continue;
            if (mesh && light.excludedMeshes.indexOf(mesh) !== -1) continue;

            light.transferToEffect(this._effect, "uLightData" + lightIndex);
            light.diffuse.scaleToRef(light.intensity, this._scaledDiffuse);
            light.specular.scaleToRef(light.intensity, this._scaledSpecular);
            this._effect.setColor3("uLightDiffuse" + lightIndex, this._scaledDiffuse);
            this._effect.setColor3("uLightSpecular" + lightIndex, this._scaledSpecular);

            // Shadows
            var shadowGenerator = light.getShadowGenerator();
            if (mesh.receiveShadows && this.shadowTexture) {
                world.multiplyToRef(this.shadowTexture.material.getTransformMatrix(), this._lightMatrix);
                this._effect.setMatrix("lightMatrix" + lightIndex, this._lightMatrix);
                this._effect.setTexture("shadowSampler" + lightIndex, this.shadowTexture);
                this._effect.setFloat("darkness" + lightIndex, 0.5);
            }
            lightIndex++;
            if (lightIndex == 4) break;
        }
    }


    // Bump
    if (this.bumpTexture && this._scene.getEngine().getCaps().standardDerivatives) {
        this._effect.setTexture("uBumpSampler", this.bumpTexture);
        this._effect.setFloat2("uBumpInfos", this.bumpTexture.coordinatesIndex, this.bumpTexture.level);
        this._effect.setMatrix("uBumpMatrix", this.bumpTexture.getTextureMatrix().multiply(
                    BABYLON.Matrix.Translation((_config.ocean.dataWave.wind.direction.x * _config.ocean.dataWave.wind.velocity * _config.time + _config.player.position.x/_config.ocean.dataWave.wind.length)%1.,
                                               (_config.ocean.dataWave.wind.direction.y * _config.ocean.dataWave.wind.velocity * _config.time + _config.player.position.z/_config.ocean.dataWave.wind.length)%1., 0)));
        this._effect.setFloat("uWindWaveFactorLength", _config.ocean.dataWave.wind.length);
        this._effect.setFloat("uWindWaveFactorAmplitudeNormal", _config.ocean.dataWave.wind.amplitudeNormal);
        this._effect.setFloat("uWindWaveFactorAmplitudeReflection", _config.ocean.dataWave.wind.amplitudeReflection);
    }

    // Noise data
    if (this.noise2DataTexture) {
        this._effect.setTexture("uNoiseDataSampler", this.noise2DataTexture);
    }

    // Wave data
    if (this.waveDataTexture) {
        this._effect.setTexture("uWaveDataSampler", this.waveDataTexture);
    }

    // reflection and refraction
    if (this.reflectionTexture){
        this._effect.setTexture("uReflectionSampler", this.reflectionTexture);
        this._effect.setMatrix("uReflectionMatrix", this.reflectionTexture.getReflectionTextureMatrix());
        this._effect.setFloat("uReflectionFactor", _config.ocean.params.reflectionFactor);

        if (this.refractionTexture){
            this._effect.setTexture("uRefractionSampler", this.refractionTexture);
        }
    }

    // Seabed distance
    if (this.seabedTexture){
        this._effect.setTexture("uSeabedSampler", this.seabedTexture);
        this._effect.setFloat("uTurbidityFactor", _config.ocean.params.turbidityFactor);
    }

    // Foam
    if (this.foamAccTexture1 || this.foamAccTexture2){

        if (this.swapBufferId == 0){
            this._effect.setTexture("uFoamSampler", this.foamAccTexture1);
        }else{
            this._effect.setTexture("uFoamSampler", this.foamAccTexture2);
        }

        this._effect.setFloat("uFoamWidth", _config.ocean.params.foamAccTextureWidth);
        this._effect.setFloat("uFoamHeight", _config.ocean.dataFoam.foamHeight);
        var foamLength = 50;
        this._effect.setFloat("uFoamLength", foamLength);
        if (this.foamDiffuseTexture) {
            this._effect.setTexture("uDiffuseSampler", this.foamDiffuseTexture);

            this._effect.setFloat2("uDiffuseInfos", this.foamDiffuseTexture.coordinatesIndex, this.foamDiffuseTexture.level);
            this._effect.setMatrix("uDiffuseMatrix", this.foamDiffuseTexture.getTextureMatrix().multiply(
                    BABYLON.Matrix.Translation((_config.player.position.x/foamLength)%1.,
                                               (_config.player.position.z/foamLength)%1., 0)));
        }
    }

    //Sky
    if (this.skyTexture){
        this._effect.setTexture("uSkySampler", this.skyTexture);
        this._effect.setFloat("uVerticalShift", _config.sky.params.verticalShift);
        this._effect.setFloat("uSkyReflectionFactor", _config.ocean.params.skyReflectionFactor);
        this._effect.setFloat("uSkyReflectionAbsorbtion", _config.ocean.params.skyReflectionAbsorbtion);

    }

    //Cloud shadow
    if (this.cloudTexture){
        this._effect.setTexture("uCloudSampler", this.cloudTexture);
        this._effect.setVector3('uSunDir', _config.sky.params.sunDir);
        this._effect.setVector3('uDeltaPlayerSkyPos', _config.sky.deltaPlayerPos);
        this._effect.setFloat("uCloudHeight", _config.sky.cloud.cloudHeight);
        this._effect.setFloat("uShadowDarkness", _config.sky.cloud.shadowDarkness);
        this._effect.setFloat("uShadowHardness", _config.sky.cloud.shadowHardness);



    }
};

SeaMaterial.prototype.dispose = function(){
    if (this.bumpTexture) {
        this.bumpTexture.dispose();
    }

    if (this.noiseDataTexture) {
        this.noiseDataTexture.dispose();
    }

    if (this.noise2DataTexture) {
        this.noise2DataTexture.dispose();
    }

    if (this.waveDataTexture) {
        this.waveDataTexture.dispose();
    }

    if (this.reflectionTexture) {
        this.reflectionTexture.dispose();
    }

    if (this.refractionTexture) {
        this.refractionTexture.dispose();
    }

    if (this.seabedTexture) {
        this.seabedTexture.dispose();
    }

    if (this.foamTexture) {
        this.foamTexture.dispose();
    }

    if (this.foamAccTexture1) {
        this.foamAccTexture1.dispose();
    }

    if (this.foamAccTexture2) {
        this.foamAccTexture2.dispose();
    }

    if (this.foamDiffuseTexture) {
        this.foamDiffuseTexture.dispose();
    }

    this.baseDispose();
};


function SpritesMaterial(name, scene, nbCols, nbRows) {
    this.name = name;
    this.id = name;

    this._scaledDiffuse = new BABYLON.Color3();
    this._scaledSpecular = new BABYLON.Color3()

    this._renderTargets = new BABYLON.SmartArray(16);

    this.shader = new Shader('./shader/sprites.vertex.fx',
                             './shader/sprites.fragment.fx',
                             ['./shader/texture_noise.include.fx',
                              './shader/ground.include.fx',
                              './shader/sphere_grid.include.fx'],
                             ['./shader/sphere_grid.include.fx',
                              './shader/phong.include.fx']);
    this.alpha = 1.;

    this.nbCols = nbCols;
    this.nbRows = nbRows;


    this.backFaceCulling = false;
    this._scene = scene;
    scene.materials.push(this);
};

SpritesMaterial.prototype = Object.create(BABYLON.Material.prototype);

// Properties
SpritesMaterial.prototype.needAlphaBlending = function () {
    return true;
};

SpritesMaterial.prototype.needAlphaTesting = function () {
    return false;
};

// Methods
SpritesMaterial.prototype.getRenderTargetTextures = function () {
    this._renderTargets.reset();

    return this._renderTargets;
}
SpritesMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

    if (this.noiseTexture) {
        if (!this.noiseTexture.isReady()) {
            return false;
        } else {
            defines.push("#define NOISE_TEXTURE");
        }
    }

    if (this.diffuseTexture) {
        if (!this.diffuseTexture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE");
        }
    }

    if (this.bumpTexture) {
        if (!this.bumpTexture.isReady()) {
            return false;
        } else {
            defines.push("#define BUMP");
            defines.push("#define WITH_STANDARD_DERIVATIVES");
        }
    }

    if (this.skyTexture) {
        if (!this.skyTexture.isReady()) {
            return false;
        } else {
            defines.push("#define SKY");
        }
    }


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

    // Lights
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

            lightIndex++;
            if (lightIndex == 4)break;
        }
    }

    defines.push("#define DIFFUSE_1");
    defines.push("#define DIFFUSE_2");
    defines.push("#define DIFFUSE_3");

    defines.push("#define DIFFUSE_NORMAL_1");
    defines.push("#define DIFFUSE_NORMAL_2");
    defines.push("#define DIFFUSE_NORMAL_3");

    if (this.needAlphaBlending()){
      defines.push('#define PREMUL_ALPHA');
    }

    var join = defines.join("\n");
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = join;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.PositionKind,
                                            BABYLON.VertexBuffer.UVKind,
                                            BABYLON.VertexBuffer.UV2Kind],
                                           ['uViewProjection', 'uEyePosInWorld', 'uPlayerPos',
                                            'uFogInfos', 'uVerticalShift',
                                           'uLightData0', 'uLightDiffuse0',
                                           'uLightData1', 'uLightDiffuse1',
                                           'uNbCols', 'uNbRows'],
                                           ['uNoiseSampler', 'uSkySampler', 'uDiffuseSampler', 'uBumpSampler'],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

SpritesMaterial.prototype.bind = function (world, mesh) {
    var eyePos = this._scene.activeCamera.position;
    var transform = this._scene.getTransformMatrix();

    this._effect.setMatrix('uViewProjection', transform);

    this._effect.setVector3('uEyePosInWorld', eyePos);

    this._effect.setVector3('uPlayerPos', _config.player.position);

    this._effect.setFloat('uNbRows', this.nbRows);
    this._effect.setFloat('uNbCols', this.nbCols);


    //Noise
    if (this.noiseTexture) {
        this._effect.setTexture("uNoiseSampler", this.noiseTexture);
    }

    //Diffuse
    if (this.diffuseTexture) {
        this._effect.setTexture("uDiffuseSampler", this.diffuseTexture);
    }

    //Bump
    if (this.bumpTexture) {
        this._effect.setTexture("uBumpSampler", this.bumpTexture);
    }

    // Fog
    if (this._scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
        this._effect.setFloat4('uFogInfos', this._scene.fogMode, this._scene.fogStart, this._scene.fogEnd, this._scene.fogDensity);
    }

    //Sky
    if (this.skyTexture){
        this._effect.setTexture("uSkySampler", this.skyTexture);
        this._effect.setFloat("uVerticalShift", _config.sky.params.verticalShift);
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

            lightIndex++;
            if (lightIndex == 4) break;
        }
    }
};

SpritesMaterial.prototype.unbind = function () {
    if (this.diffuseTexture && this.diffuseTexture.isRenderTarget){
        this._effect.setTexture("uDiffuseSampler", null);
    }
    if (this.bumpTexture && this.bumpTexture.isRenderTarget){
        this._effect.setTexture("uBumpSampler", null);
    }

};

SpritesMaterial.prototype.dispose = function(){
    this.baseDispose();
};


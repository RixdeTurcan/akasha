function GroundMaterial(name, scene, ground) {
    this.name = name;
    this.id = name;

    this.ground = ground;

    this._scaledDiffuse = new BABYLON.Color3();
    this._scaledSpecular = new BABYLON.Color3()

    this._renderTargets = new BABYLON.SmartArray(32);
    this._lightMatrix = BABYLON.Matrix.Zero();

    this.wireframe = false;
    _$body.keypress(function(e){
        this.wireframe = e.which==119?!this.wireframe:this.wireframe;
    }.bind(this));


    this.shader = new Shader('./shader/ground.vertex.fx',
                             './shader/ground.fragment.fx',
                             ['./shader/texture_noise.include.fx'],
                             ['./shader/phong.include.fx',
                              './shader/sphere_grid.include.fx']);

    this.backFaceCulling = false;
    this._scene = scene;
    scene.materials.push(this);
};

GroundMaterial.prototype = Object.create(BABYLON.Material.prototype);


// Properties
GroundMaterial.prototype.needAlphaBlending = function () {
    return false;
};

GroundMaterial.prototype.needAlphaTesting = function () {
    return false;
};

// Methods
GroundMaterial.prototype.getRenderTargetTextures = function () {
    this._renderTargets.reset();

    return this._renderTargets;
};

GroundMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

    if (this.noiseTexture) {
        if (!this.noiseTexture.isReady()) {
            return false;
        } else {
            defines.push("#define NOISE_TEXTURE");
        }
    }

    if (this.diffuse1Texture) {
        if (!this.diffuse1Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_1");
        }
    }

    if (this.diffuseNormal1Texture) {
        if (!this.diffuseNormal1Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_NORMAL_1");
        }
    }

    if (this.diffuseFar1Texture) {
        if (!this.diffuseFar1Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_FAR_1");
        }
    }

    if (this.diffuse2Texture) {
        if (!this.diffuse1Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_2");
        }
    }

    if (this.diffuseNormal2Texture) {
        if (!this.diffuseNormal2Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_NORMAL_2");
        }
    }

    if (this.diffuseFar2Texture) {
        if (!this.diffuseFar2Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_FAR_2");
        }
    }

    if (this.diffuse3Texture) {
        if (!this.diffuse1Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_3");
        }
    }

    if (this.diffuseNormal3Texture) {
        if (!this.diffuseNormal3Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_NORMAL_3");
        }
    }

    if (this.diffuseFar3Texture) {
        if (!this.diffuseFar3Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_FAR_3");
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

    var join = defines.join("\n");
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = join;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.PositionKind],
                                           ['uViewProjection', 'uEyePosInWorld',
                                           'uFogInfos', 'uVerticalShift',
                                           'uTangentScreenDist', 'uPlayerPos',
                                           'uLightData0', 'uLightDiffuse0',
                                           'uLightData1', 'uLightDiffuse1'],
                                           ['uNoiseSampler', 'uSkySampler',
                                            'uDiffuse1Sampler', 'uDiffuse2Sampler', 'uDiffuse3Sampler',
                                            'uDiffuseFar1Sampler', 'uDiffuseFar2Sampler', 'uDiffuseFar3Sampler',
                                            'uDiffuseNormal1Sampler', 'uDiffuseNormal2Sampler', 'uDiffuseNormal3Sampler'],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

GroundMaterial.prototype.unbind = function ()
{
    if (this.skyTexture && this.skyTexture.isRenderTarget) {
        this._effect.setTexture("uSkySampler", null);
    }
};

GroundMaterial.prototype.bind = function (world, mesh) {

    var eyePos = this._scene.activeCamera.position;
    var transform = this._scene.getTransformMatrix();


    this._effect.setMatrix('uViewProjection', transform);

    this._effect.setVector3('uEyePosInWorld', eyePos);

    this._effect.setVector3('uPlayerPos', _config.player.position);


    // noise
    if (this.noiseTexture) {
        this._effect.setTexture("uNoiseSampler", this.noiseTexture);
    }

    // diffuse 1
    if (this.diffuse1Texture) {
        this._effect.setTexture("uDiffuse1Sampler", this.diffuse1Texture);
    }
    if (this.diffuseNormal1Texture) {
        this._effect.setTexture("uDiffuseNormal1Sampler", this.diffuseNormal1Texture);
    }
    if (this.diffuseFar1Texture) {
        this._effect.setTexture("uDiffuseFar1Sampler", this.diffuseFar1Texture);
    }

    // diffuse 2
    if (this.diffuse2Texture) {
        this._effect.setTexture("uDiffuse2Sampler", this.diffuse2Texture);
    }
    if (this.diffuseNormal2Texture) {
        this._effect.setTexture("uDiffuseNormal2Sampler", this.diffuseNormal2Texture);
    }
    if (this.diffuseFar2Texture) {
        this._effect.setTexture("uDiffuseFar2Sampler", this.diffuseFar2Texture);
    }

    // diffuse 3
    if (this.diffuse3Texture) {
        this._effect.setTexture("uDiffuse3Sampler", this.diffuse3Texture);
    }
    if (this.diffuseNormal3Texture) {
        this._effect.setTexture("uDiffuseNormal3Sampler", this.diffuseNormal3Texture);
    }
    if (this.diffuseFar3Texture) {
        this._effect.setTexture("uDiffuseFar3Sampler", this.diffuseFar3Texture);
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

GroundMaterial.prototype.dispose = function(){
    this.baseDispose();
};


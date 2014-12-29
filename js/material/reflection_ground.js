function ReflectionGroundMaterial(name, scene, ground) {
    this.name = name;
    this.id = name;

    this.ground = ground;

    this._scaledDiffuse = new BABYLON.Color3();
    this._scaledSpecular = new BABYLON.Color3()

    this._renderTargets = new BABYLON.SmartArray(32);
    this._lightMatrix = BABYLON.Matrix.Zero();

    this.wireframe = false;

    this.shader = new Shader('./shader/reflection_ground.vertex.fx',
                             './shader/ground.fragment.fx',
                             [],
                             []);

    this.swapBufferId = 0;

    this.backFaceCulling = false;
    this._scene = scene;
    scene.materials.push(this);
};

ReflectionGroundMaterial.prototype = Object.create(BABYLON.Material.prototype);


// Properties
ReflectionGroundMaterial.prototype.needAlphaBlending = function () {
    return false;
};

ReflectionGroundMaterial.prototype.needAlphaTesting = function () {
    return false;
};

ReflectionGroundMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

    if (this.heightTexture) {
        if (!this.heightTexture.isReady()) {
            return false;
        } else {
            defines.push("#define HEIGHT");
        }
    }

    if (this.diffuseTexture) {
        if (!this.diffuseTexture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE");
        }
    }


    if (this.diffuseTexture2) {
        if (!this.diffuseTexture2.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE2");
        }
    }
    // Fog
    if (this._scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
        defines.push("#define FOG");
    }

    if (this.waveDataTexture){
        if (!this.waveDataTexture.isReady()) {
            return false;
        } else {
            defines.push("#define WAVE");
        }
    }

    if (this._scene.clipPlane) {
        defines.push("#define CLIPPLANE");
    }

    var join = defines.join("\n");
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = join;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.UVKind],
                                           ['uViewProjection', 'uEyePosInWorld', 'uWaveMaxHeight',
                                           'uTangentScreenDist', 'uPlayerPos', "uClipPlane",
                                           'uFogInfos', 'uFogColor', 'uClipHeight'],
                                           ['uHeightSampler', 'uDiffuseSampler', 'uDiffuse2Sampler', 'uWaveDataSampler'],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

ReflectionGroundMaterial.prototype.unbind = function ()
{
    if (this.heightTexture && this.heightTexture.isRenderTarget) {
        this._effect.setTexture("uHeightSampler", null);
    }

    if (this.waveDataTexture && this.waveDataTexture.isRenderTarget) {
        this._effect.setTexture("uWaveDataSampler", null);
    }
};

ReflectionGroundMaterial.prototype.bind = function (world, mesh) {

    var eyePos = this._scene.activeCamera.position;
    var transform = this._scene.getTransformMatrix();


    this._effect.setMatrix('uViewProjection', transform);

    this._effect.setVector3('uEyePosInWorld', eyePos);
    this._effect.setFloat('uTangentScreenDist', _config.ground.params.tangentScreenDist);
    this._effect.setVector3('uPlayerPos', _config.player.position);

    this._effect.setFloat('uClipHeight', 0.);

    // height
    if (this.heightTexture) {
        this._effect.setTexture("uHeightSampler", this.heightTexture);
    }
    // wave
    if (this.waveDataTexture) {
        this._effect.setTexture("uWaveDataSampler", this.waveDataTexture);
        this._effect.setFloat('uWaveMaxHeight', _config.ocean.dataWave.wave1.amplitude+_config.ocean.dataWave.wave2.amplitude+_config.ocean.dataWave.wave3.amplitude);

    }

    // diffuse 1
    if (this.diffuseTexture) {
        this._effect.setTexture("uDiffuseSampler", this.diffuseTexture);
    }

    // diffuse 2
    if (this.diffuseTexture2) {
        this._effect.setTexture("uDiffuse2Sampler", this.diffuseTexture2);
    }

    // Fog
    if (this._scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
        this._effect.setFloat4('uFogInfos', this._scene.fogMode, this._scene.fogStart, this._scene.fogEnd, this._scene.fogDensity);
        this._effect.setColor3('uFogColor', this._scene.fogColor);
    }

    if (this._scene.clipPlane) {
        var clipPlane = this._scene.clipPlane;
        this._effect.setFloat4("uClipPlane", clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.d);
    }
};

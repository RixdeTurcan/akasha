function GroundMaterial(name, scene, ground) {
    this.name = name;
    this.id = name;

    this.ground = ground;

    this._scaledDiffuse = new BABYLON.Color3();
    this._scaledSpecular = new BABYLON.Color3()

    this.projectedGrid = new ProjectedGrid(this.ground.camera);
    this.projectedGrid.marginY = 2.5;
    this.projectedGrid.marginX = 2.;
    this.projectedGrid.horizonFactor = 0.99;

    this._renderTargets = new BABYLON.SmartArray(32);
    this._lightMatrix = BABYLON.Matrix.Zero();

    this.wireframe = false;

    this.shader = new Shader('./shader/ground.vertex.fx',
                             './shader/ground.fragment.fx',
                             [],
                             []);


    this.swapBufferId = 0;

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

    if (this.heightTexture && this.heightTexture.isRenderTarget) {
        this._renderTargets.push(this.heightTexture);
    }

    if (this.shadowHeightTexture && this.shadowHeightTexture.isRenderTarget) {
        this._renderTargets.push(this.shadowHeightTexture);
    }

    if (this.shadowTexture && this.shadowTexture.isRenderTarget) {
        this._renderTargets.push(this.shadowTexture);
    }


    return this._renderTargets;
};

GroundMaterial.prototype.isReady = function (mesh) {
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


    if (this._scene.clipPlane) {
        defines.push("#define CLIPPLANE");
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
    }

    var join = defines.join("\n");
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = join;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.UVKind],
                                           ['uViewProjection', 'uEyePosInWorld',
                                           'uBumpInfos', 'uBump2Infos',
                                           'uClipHeight',
                                           'uFogInfos', 'uFogColor', 'uVerticalShift',
                                           'uTangentScreenDist', 'uPlayerPos', "uClipPlane"],
                                           ['uHeightSampler', 'uSkySampler',
                                            'uDiffuseSampler',
                                            'uDiffuse2Sampler'],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

GroundMaterial.prototype.unbind = function ()
{
    if (this.heightTexture && this.heightTexture.isRenderTarget) {
        this._effect.setTexture("uHeightSampler", null);
    }

    if (this.skyTexture && this.skyTexture.isRenderTarget) {
        this._effect.setTexture("uSkySampler", null);
    }
};

GroundMaterial.prototype.bind = function (world, mesh) {

    var eyePos = this._scene.activeCamera.position;
    var transform = this._scene.getTransformMatrix();


    this._effect.setMatrix('uViewProjection', transform);

    this._effect.setVector3('uEyePosInWorld', eyePos);

    this._effect.setFloat('uTangentScreenDist', _config.ground.params.tangentScreenDist);
    this._effect.setVector3('uPlayerPos', _config.player.position);

    // height
    if (this.heightTexture) {
        this._effect.setTexture("uHeightSampler", this.heightTexture);
    }

    // diffuse 1
    if (this.diffuseTexture) {
        this._effect.setTexture("uDiffuseSampler", this.diffuseTexture);
    }

    // diffuse 2
    if (this.diffuseTexture2) {
        this._effect.setTexture("uDiffuse2Sampler", this.diffuseTexture2);
    }

    if (this._scene.clipPlane) {
        var clipPlane = this._scene.clipPlane;
        this._effect.setFloat4("uClipPlane", clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.d);
    }


    if (this._scene.renderingFbo){
        this._effect.setFloat('uClipHeight', -400.);
    }else{
        this._effect.setFloat('uClipHeight', 0.);
    }

    // Fog
    if (this._scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
        this._effect.setFloat4('uFogInfos', this._scene.fogMode, this._scene.fogStart, this._scene.fogEnd, this._scene.fogDensity);
        this._effect.setColor3('uFogColor', this._scene.fogColor);
    }

    //Sky
    if (this.skyTexture){
        this._effect.setTexture("uSkySampler", this.skyTexture);
        this._effect.setFloat("uVerticalShift", _config.sky.params.verticalShift);

    }

};

GroundMaterial.prototype.dispose = function(){
    if (this.heightTexture) {
        this.heightTexture.dispose();
    }

    if (this.diffuseTexture) {
        this.diffuseTexture.dispose();
    }

    if (this.diffuseTexture2) {
        this.diffuseTexture2.dispose();
    }

    this.baseDispose();
};


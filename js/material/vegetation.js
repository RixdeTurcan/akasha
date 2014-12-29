function VegetationMaterial(name, scene, vegetation) {
    this.name = name;
    this.id = name;

    this.vegetation = vegetation;

    this._scaledDiffuse = new BABYLON.Color3();
    this._scaledSpecular = new BABYLON.Color3()

    this._renderTargets = new BABYLON.SmartArray(32);
    this._lightMatrix = BABYLON.Matrix.Zero();

    this.wireframe = false;

    this.shader = new Shader('./shader/vegetation.vertex.fx',
                             './shader/vegetation.fragment.fx',
                             [],
                             []);


    this.swapBufferId = 0;

    this.alpha = 1.;



    this.backFaceCulling = false;
    this._scene = scene;
    scene.materials.push(this);
};

VegetationMaterial.prototype = Object.create(BABYLON.Material.prototype);


// Properties
VegetationMaterial.prototype.needAlphaBlending = function () {
    return true;
};

VegetationMaterial.prototype.needAlphaTesting = function () {
    return false;
};

// Methods
VegetationMaterial.prototype.getRenderTargetTextures = function () {
    this._renderTargets.reset();

    if (this.posTexture && this.posTexture.isRenderTarget) {
        this._renderTargets.push(this.posTexture);
    }

    return this._renderTargets;
};

VegetationMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];


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
                                           [BABYLON.VertexBuffer.UVKind,
                                            BABYLON.VertexBuffer.UV2Kind],
                                           ['uViewProjection', 'uDeltaPos', 'uEyePosInWorld',
                                            'uSize', 'uUMorphing', 'uUMin', 'uLod',
                                            'uTime', 'uPlayerPos',
                                            'uVerticalShift', 'uFogInfos', 'uFogColor'],
                                           ['uPosSampler', 'uDiffuseSampler', 'uSkySampler',],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

VegetationMaterial.prototype.unbind = function ()
{
    if (this.posTexture && this.posTexture.isRenderTarget) {
        this._effect.setTexture("uPosSampler", null);
    }


    if (this.skyTexture && this.skyTexture.isRenderTarget) {
        this._effect.setTexture("uSkySampler", null);
    }
};

VegetationMaterial.prototype.bind = function (world, mesh)
{
    var eyePos = _config.world.cameraPos;
    var transform = this._scene.getTransformMatrix();


    this._effect.setMatrix('uViewProjection', transform);

    if (this.posTexture) {
        this._effect.setTexture("uPosSampler", this.posTexture);
    }

    if (this.diffuseTexture) {
        this._effect.setTexture("uDiffuseSampler", this.diffuseTexture);
    }
    var deltaPos = _config.player.position.mod(2.*this.size/this.subdiv).scale(-1.);
    this._effect.setVector3('uDeltaPos', deltaPos);
    this._effect.setVector3('uPlayerPos', _config.player.position);

    this._effect.setVector3('uEyePosInWorld', eyePos);
    this._effect.setFloat('uSize', this.size);
    this._effect.setFloat('uUMin', this.uMin);
    this._effect.setFloat('uLod', this.lod);
    this._effect.setFloat('uUMorphing', this.uMorphing);
    this._effect.setFloat('uTime', _config.time);

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

VegetationMaterial.prototype.dispose = function()
{

    if (this.diffuseTexture) {
        this.diffuseTexture.dispose();
    }

    this.baseDispose();
};


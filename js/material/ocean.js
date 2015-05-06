function OceanMaterial(name, scene, ground) {
    this.name = name;
    this.id = name;

    this.ground = ground;

    this._scaledDiffuse = new BABYLON.Color3();
    this._scaledSpecular = new BABYLON.Color3()

    this._renderTargets = new BABYLON.SmartArray(32);
    this._lightMatrix = BABYLON.Matrix.Zero();

    this.treeTextures = {};
    this.renderImpostorTex = false;
    this.impostorTexRendered = false;


    this.wireframe = false;
    _$body.keypress(function(e){
        this.wireframe = e.which==119?!this.wireframe:this.wireframe;
    }.bind(this));


    this.shader = new Shader('./shader/ocean.vertex.fx',
                             './shader/ocean.fragment.fx',
                             [],
                             ['./shader/phong.include.fx',
                              './shader/sphere_grid.include.fx']);

    this.backFaceCulling = true;
    this._scene = scene;
    scene.materials.push(this);
};

OceanMaterial.prototype = Object.create(BABYLON.Material.prototype);


// Properties
OceanMaterial.prototype.needAlphaBlending = function () {
    return false;
};

OceanMaterial.prototype.needAlphaTesting = function () {
    return false;
};

// Methods
OceanMaterial.prototype.getRenderTargetTextures = function () {
    this._renderTargets.reset();

    return this._renderTargets;
};

OceanMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];


    if (this.skyTexture) {
        if (!this.skyTexture.isReady()) {
            return false;
        } else {
            defines.push("#define SKY");
        }
    }

    if (this.seabedTexture) {
        if (!this.seabedTexture.isReady()) {
            return false;
        } else {
            defines.push("#define SEABED");
        }
    }

    if (this.groundHeightTexture) {
        if (!this.groundHeightTexture.isReady()) {
            return false;
        } else {
            defines.push("#define GROUND_HEIGHT");
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

    var join = defines.join("\n");
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = join;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.PositionKind,
                                            BABYLON.VertexBuffer.ColorKind],
                                           ['uViewProjection', 'uPlayerPos', 'uEyePosInWorld',
                                            'uFogInfos', 'uVerticalShift'],
                                           ['uSkySampler', 'uSeabedSampler', 'uGroundHeightSampler'],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

OceanMaterial.prototype.unbind = function ()
{
    if (this.skyTexture && this.skyTexture.isRenderTarget) {
        this._effect.setTexture("uSkySampler", null);
    }

    if (this.seabedTexture && this.seabedTexture.isRenderTarget) {
        this._effect.setTexture("uSeabedSampler", null);
    }

    if (this.groundHeightTexture && this.groundHeightTexture.isRenderTarget) {
        this._effect.setTexture("uGroundHeightSampler", null);
    }
};

OceanMaterial.prototype.bind = function (world, mesh) {

    var eyePos = this._scene.activeCamera.position;
    var transform = this._scene.getTransformMatrix();


    this._effect.setMatrix('uViewProjection', transform);

    this._effect.setVector3('uPlayerPos', _config.player.position);
    this._effect.setVector3('uEyePosInWorld', eyePos);

    //Sky
    if (this.skyTexture){
        this._effect.setTexture("uSkySampler", this.skyTexture);
        this._effect.setFloat("uVerticalShift", _config.sky.params.verticalShift);
    }

    //Seabed color
    if (this.seabedTexture){
        this._effect.setTexture("uSeabedSampler", this.seabedTexture);
    }

    // ground height
    if (this.groundHeightTexture) {
        this._effect.setTexture("uGroundHeightSampler", this.groundHeightTexture);
    }

    // Fog
    if (this._scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
        this._effect.setFloat4('uFogInfos', this._scene.fogMode, this._scene.fogStart, this._scene.fogEnd, this._scene.fogDensity);
    }

};

OceanMaterial.prototype.dispose = function(){
    this.baseDispose();
};


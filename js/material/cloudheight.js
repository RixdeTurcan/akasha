function CloudHeightMaterial(name, scene) {
    this.name = name;
    this.id = name;

    this.stepStart = 0;
    this.stepEnd = 0;
    this.reset = false;
    this.end = false;

    this._scaledDiffuse = new BABYLON.Color3();
    this._scaledSpecular = new BABYLON.Color3()

    this.shader = new Shader('./shader/pass_through.vertex.fx',
                             './shader/cloudheight.fragment.fx',
                             [],
                             ['./shader/noise.include.fx',
                              './shader/sphere_grid.include.fx']);

    this._renderTargets = new BABYLON.SmartArray(16);

    this.backFaceCulling = false;
    this._scene = scene;
    scene.materials.push(this);
};

CloudHeightMaterial.prototype = Object.create(BABYLON.Material.prototype);

// Properties
CloudHeightMaterial.prototype.needAlphaBlending = function () {
    return false;
};

CloudHeightMaterial.prototype.needAlphaTesting = function () {
    return false;
};

// Methods

CloudHeightMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

    defines.push('#define DEPTH 1.');

    defines.push('#define INV_TEXTURE_SIZE '+(1./_config.sky.cloud.textureSize));

    if (this.reset){
        defines.push('#define RESET ');
    }

    if (this.end){
        defines.push('#define END ');
    }

    for (var i=this.octaveStart; i<this.octaveEnd; ++i){
        defines.push('#define OCTAVE'+i);
    }

    if (this.swapTexture) {
        if (!this.swapTexture.isReady()) {
            return false;
        } else {
            defines.push('#define SWAP_TEXTURE ');
        }
    }

    var join = defines.join("\n");
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = join;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.UVKind],
                                           ['uCloudPos', 'uPeriod',
                                           'uCloudHeight', 'uPresence'],
                                           ['uSwapSampler'],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

CloudHeightMaterial.prototype.bind = function (world, mesh) {

    var playerPos = new BABYLON.Vector2(_config.player.position.x, _config.player.position.z);

    var cloudPos = _config.sky.cloud.direction.scale(_config.sky.cloud.velocity*_config.time).add(playerPos).mod(_config.sky.cloud.period);


    this._effect.setVector2('uCloudPos', cloudPos);
    this._effect.setFloat('uPeriod', _config.sky.cloud.period);
    this._effect.setFloat('uPresence', _config.sky.cloud.presence);
    this._effect.setFloat('uCloudHeight', _config.sky.cloud.cloudHeight);


    if (this.swapTexture) {
        this._effect.setTexture('uSwapSampler', this.swapTexture);
    }

};

CloudHeightMaterial.prototype.dispose = function(){
    this.baseDispose();
};


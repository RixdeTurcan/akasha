function CloudSunDepthMaterial(name, scene) {
    this.name = name;
    this.id = name;

    this._scaledDiffuse = new BABYLON.Color3();
    this._scaledSpecular = new BABYLON.Color3()

    this._renderTargets = new BABYLON.SmartArray(16);

    this.stepStart = 0;
    this.stepEnd = 0;
    this.nbStepTotal = 0;
    this.reset = false;

    this.shader = new Shader('./shader/pass_through.vertex.fx',
                             './shader/cloudsundepth.fragment.fx',
                             [],
                             ['./shader/sphere_grid.include.fx']);


    this.backFaceCulling = false;
    this._scene = scene;
    scene.materials.push(this);
};

CloudSunDepthMaterial.prototype = Object.create(BABYLON.Material.prototype);

// Properties
CloudSunDepthMaterial.prototype.needAlphaBlending = function () {
    return false;
};

CloudSunDepthMaterial.prototype.needAlphaTesting = function () {
    return false;
};

// Methods

CloudSunDepthMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

    defines.push('#define DEPTH 1.');

    defines.push('#define INV_TEXTURE_SIZE '+(1./_config.sky.cloud.depthSize));

    defines.push('#define STEP_START '+this.stepStart);
    defines.push('#define STEP_END '+this.stepEnd);
    defines.push('#define NB_STEP_F '+(this.nbStepTotal)+'.');

    var ratioEye = 2;

    defines.push('#define STEP_START_EYE '+parseInt(this.stepStart/ratioEye));
    defines.push('#define STEP_END_EYE '+parseInt(this.stepEnd/ratioEye));
    defines.push('#define NB_STEP_F_EYE '+(this.nbStepTotal/ratioEye)+'.');

    if (this.reset){
        defines.push('#define RESET ');
    }
    if (this.swapTexture) {
        if (!this.swapTexture.isReady()) {
            return false;
        } else {
            defines.push('#define SWAP_TEXTURE');
        }
    }

    var join = defines.join("\n");
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = join;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.UVKind],
                                           ['uSunClampedDirection', 'uCloudHeight',
                                           'uCloudVerticalDepth', 'uInvCloudVerticalDepth'],
                                           ['uCloudHeightSampler', 'uSwapSampler'],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

CloudSunDepthMaterial.prototype.bind = function (world, mesh) {
    if (this.cloudHeightTexture) {
        this._effect.setTexture('uCloudHeightSampler', this.cloudHeightTexture);
    }

    if (this.swapTexture) {
        this._effect.setTexture('uSwapSampler', this.swapTexture);
    }

    var sunClampedDir = _config.sky.params.sunDir.clone();
    //sunClampedDir.y = Math.max(sunClampedDir.y, 0.1);
    this._effect.setVector3('uSunClampedDirection', sunClampedDir);

    this._effect.setFloat('uCloudHeight', _config.sky.cloud.cloudHeight);
    this._effect.setFloat('uCloudVerticalDepth', _config.sky.cloud.verticalDepth);
    this._effect.setFloat('uInvCloudVerticalDepth', 1./_config.sky.cloud.verticalDepth);

};

CloudSunDepthMaterial.prototype.dispose = function(){
    this.baseDispose();
};


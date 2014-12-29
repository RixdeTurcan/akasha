function TextureMaterial(name, scene) {
    this.name = name;
    this.id = name;

    this._scaledDiffuse = new BABYLON.Color3();
    this._scaledSpecular = new BABYLON.Color3()

    this._renderTargets = new BABYLON.SmartArray(16);

    this.projectedGrid = new ProjectedGrid();
    this.projectedGrid.marginX = 1.0;
    this.projectedGrid.marginY = 1.0;
    this.projectedGrid.depth = 1.0;


    this.shader = new Shader('./shader/pass_through.vertex.fx',
                             './shader/texture.fragment.fx',
                             [],
                             ['./shader/grid.include.fx',
                              './shader/sphere_grid.include.fx']);


    this.backFaceCulling = false;
    this._scene = scene;
    scene.materials.push(this);
};

TextureMaterial.prototype = Object.create(BABYLON.Material.prototype);

// Properties
TextureMaterial.prototype.needAlphaBlending = function () {
    return false;
};

TextureMaterial.prototype.needAlphaTesting = function () {
    return false;
};

// Methods
TextureMaterial.prototype.getRenderTargetTextures = function () {
    this._renderTargets.reset();

    if (this.cloudHeightTexture && this.cloudHeightTexture.isRenderTarget){
        this._renderTargets.push(this.cloudHeightTexture);
    }

    if (this.cloudSunDepthTexture && this.cloudSunDepthTexture.isRenderTarget) {
        this._renderTargets.push(this.cloudSunDepthTexture);
    }

    if (this.texture && this.texture.isRenderTarget) {
        this._renderTargets.push(this.texture);
    }


    return this._renderTargets;
}
TextureMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

    if (this.texture) {
        if (!this.texture.isReady()) {
            return false;
        } else {
            defines.push('#define TEXTURE');
        }
    }

    defines.push('#define DEPTH 1.');
    if (!this._scene.renderingFbo){
      defines.push('#define SCREEN');
    }

    var join = defines.join("\n");
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = join;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.UVKind],
                                           ['uEyePosInWorld', 'uVerticalShift',
                                            'uMinPosLeft', 'uMinPosRight',
                                            'uMaxPosLeft', 'uMaxPosRight',],
                                           ['uSampler'],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

TextureMaterial.prototype.bind = function (world, mesh) {
    var eyePos = this._scene.activeCamera.position;
    var transform = this._scene.getTransformMatrix();
    var invTransform = transform.clone();
    invTransform.invert();
    if (this._scene.renderingFbo){
        this.projectedGrid.depth = 1.0;
    }else{
        this.projectedGrid.depth = 0.0;
    }
    this.projectedGrid.compute(eyePos, transform, invTransform, false);
    this._effect.setVector3('uEyePosInWorld', eyePos);

    this._effect.setVector3('uMinPosLeft', this.projectedGrid.minPosLeft);
    this._effect.setVector3('uMinPosRight', this.projectedGrid.minPosRight);
    this._effect.setVector3('uMaxPosLeft', this.projectedGrid.maxPosLeft);
    this._effect.setVector3('uMaxPosRight', this.projectedGrid.maxPosRight);


    if (this.texture){
        this._effect.setTexture("uSampler", this.texture);
        this._effect.setFloat("uVerticalShift", _config.sky.params.verticalShift);

    }
};

TextureMaterial.prototype.unbind = function () {
    if (this.texture){
        this._effect.setTexture("uSampler", null);
    }
};

TextureMaterial.prototype.dispose = function(){

    if (this.texture) {
        this.texture.dispose();
    }

};


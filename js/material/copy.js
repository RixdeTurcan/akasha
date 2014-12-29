function CopyMaterial(name, scene) {
    this.name = name;
    this.id = name;

    this._scaledDiffuse = new BABYLON.Color3();
    this._scaledSpecular = new BABYLON.Color3()

    this._renderTargets = new BABYLON.SmartArray(16);

    this.shader = new Shader('./shader/pass_through.vertex.fx',
                             './shader/copy.fragment.fx',
                             [],
                             []);


    this.backFaceCulling = false;
    this._scene = scene;
    scene.materials.push(this);
};

CopyMaterial.prototype = Object.create(BABYLON.Material.prototype);

// Properties
CopyMaterial.prototype.needAlphaBlending = function () {
    return false;
};

CopyMaterial.prototype.needAlphaTesting = function () {
    return false;
};

// Methods
CopyMaterial.prototype.getRenderTargetTextures = function () {
    this._renderTargets.reset();

    if (this.texture && this.texture.isRenderTarget) {
        this._renderTargets.push(this.texture);
    }

    return this._renderTargets;
}
CopyMaterial.prototype.isReady = function (mesh) {
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
                                           [],
                                           ['uSampler'],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

CopyMaterial.prototype.bind = function (world, mesh) {
    if (this.texture){
        this._effect.setTexture("uSampler", this.texture);
    }
};

CopyMaterial.prototype.unbind = function () {
    if (this.texture){
        this._effect.setTexture("uSampler", null);
    }
};

CopyMaterial.prototype.dispose = function(){

    if (this.texture) {
        this.texture.dispose();
    }

    this.baseDispose();
};


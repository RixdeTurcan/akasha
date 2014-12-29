function SwapTextureMaterial(name, scene) {
    this.name = name;
    this.id = name;

    this.invTextureSize = 1.;

    this.backFaceCulling = false;

    this._scene = scene;
    scene.materials.push(this);
};

SwapTextureMaterial.prototype = Object.create(BABYLON.Material.prototype);

// Properties
SwapTextureMaterial.prototype.needAlphaBlending = function () {
    return false;
};

SwapTextureMaterial.prototype.needAlphaTesting = function () {
    return false;
};

// Methods
SwapTextureMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();

    this._effect = engine.createEffect('shader/swap_texture',
                                       [BABYLON.VertexBuffer.PositionKind],
                                       ['world', 'viewProjection',
                                        'invTextureSize'],
                                       ['sampler'],
                                       '');

    if (!this._effect.isReady()) {
        return false;
    }

    return true;
};

SwapTextureMaterial.prototype.bind = function (world, mesh) {
    this._effect.setMatrix("world", world);
    this._effect.setMatrix("viewProjection", this._scene.getTransformMatrix());
    this._effect.setFloat("invTextureSize", this.invTextureSize);

    if (this.texture) {
        this._effect.setTexture("sampler", this.texture);
    }
};

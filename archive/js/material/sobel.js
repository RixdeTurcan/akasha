function SobelMaterial(name, scene) {
    this.name = name;
    this.id = name;

    this.textureSize = 1.;

    this.backFaceCulling = false;

    this._scene = scene;
    scene.materials.push(this);
};

SobelMaterial.prototype = Object.create(BABYLON.Material.prototype);

// Properties
SobelMaterial.prototype.needAlphaBlending = function () {
    return false;
};

SobelMaterial.prototype.needAlphaTesting = function () {
    return false;
};

// Methods
SobelMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

    if (this.texture) {
        if (!this.texture.isReady()) {
            return false;
        } else {
            defines.push("#define TEXTURE");
        }
    }

    var join = defines.join("\n");
    if (this._cachedDefines != join)
    {
        this._cachedDefines = join;
        this._effect = engine.createEffect('shader/sobel',
                                           [BABYLON.VertexBuffer.PositionKind],
                                           ['uWorld', 'uViewProjection',
                                            'uTextureSize'],
                                           ['uSampler'],
                                           join);

    }
    if (!this._effect.isReady()) {
        return false;
    }

    return true;
};

SobelMaterial.prototype.bind = function (world, mesh) {
    this._effect.setMatrix("uWorld", world);
    this._effect.setMatrix("uViewProjection", this._scene.getTransformMatrix());
    this._effect.setFloat("uTextureSize", this.textureSize);

    if (this.texture) {
        this._effect.setTexture("uSampler", this.texture);
    }
};

SobelMaterial.prototype.unbind = function () {
    if (this.texture) {
        this._effect.setTexture("uSampler", null);
    }
};

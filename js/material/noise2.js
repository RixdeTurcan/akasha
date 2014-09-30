function Noise2Material(name, sea, scene) {
    this.name = name;
    this.id = name;
    this.sea = sea;

    this.textureSize = 1.;

    this.backFaceCulling = false;

    this.shader = new Shader('./shader/pass_through.vertex.fx',
                             './shader/noise2.fragment.fx',
                             [],
                             ['./shader/grid.include.fx']);

    this._scene = scene;
    scene.materials.push(this);
};

Noise2Material.prototype = Object.create(BABYLON.Material.prototype);

Noise2Material.prototype.needAlphaBlending = function () {
    return false;
};

Noise2Material.prototype.needAlphaTesting = function () {
    return false;
};

Noise2Material.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

    defines.push('#define INV_TEXTURE_SIZE '+(1./this.textureSize));

    if (this.texture) {
        if (!this.texture.isReady()) {
            return false;
        } else {
            defines.push('#define TEXTURE');
        }
    }

    var join = defines.join('\n');
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = true;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.UVKind],
                                           ['uNoiseFactor', 'uEyePosInWorld',
                                            'uMinPosLeft', 'uMinPosRight',
                                            'uMaxPosLeft', 'uMaxPosRight',
                                            'uDisplacementNoiseMinHeight', 'uDisplacementNoiseMaxHeight'],
                                           ['uSampler'],
                                           join);
    }
    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

Noise2Material.prototype.bind = function (world, mesh) {
    var eyePos = _config.world.cameraPos;
    var transform = _config.world.transformMat;
    var invTransform = _config.world.invTransformMat;

    if (this.texture) {
        this._effect.setTexture('uSampler', this.texture);
    }

    this._effect.setFloat('uNoiseFactor', _config.ocean.dataNoise.displacementFactor);
    this._effect.setFloat('uDisplacementNoiseMinHeight', _config.ocean.dataNoise.displacementMinHeight);
    this._effect.setFloat('uDisplacementNoiseMaxHeight', _config.ocean.dataNoise.displacementMaxHeight);

    this._effect.setVector3('uEyePosInWorld', eyePos);

    this._effect.setVector3('uMinPosLeft', this.sea.projectedGrid.minPosLeft);
    this._effect.setVector3('uMinPosRight', this.sea.projectedGrid.minPosRight);
    this._effect.setVector3('uMaxPosLeft', this.sea.projectedGrid.maxPosLeft);
    this._effect.setVector3('uMaxPosRight', this.sea.projectedGrid.maxPosRight);
};

Noise2Material.prototype.unbind = function () {
    if (this.texture) {
        this._effect.setTexture('uSampler', null);
    }
};

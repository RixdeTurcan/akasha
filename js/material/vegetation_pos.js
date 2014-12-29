function VegetationPosMaterial(name, vegetation, scene) {
    this.name = name;
    this.id = name;
    this.vegetation = vegetation;

    this.textureSize = 1.;

    this.shader = new Shader('./shader/pass_through.vertex.fx',
                             './shader/vegetation_pos.fragment.fx',
                             [],
                             ['./shader/grid.include.fx',
                              './shader/noise.include.fx']);

    this.backFaceCulling = false;

    this._scene = scene;
    scene.materials.push(this);
};

VegetationPosMaterial.prototype = Object.create(BABYLON.Material.prototype);

VegetationPosMaterial.prototype.needAlphaBlending = function () {
    return false;
};

VegetationPosMaterial.prototype.needAlphaTesting = function () {
    return false;
};

VegetationPosMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

    defines.push('#define INV_TEXTURE_SIZE '+(1./this.textureSize));

    if (this.groundHeightTexture) {
        if (Math.abs(_config.player.angle%_pi)<0.3){
                defines.push('#define USE_SECOND_AXIS');
        }
    }
    var join = defines.join('\n');
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = join;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.UVKind],
                                           ['uSize', 'uDeltaPos', 'uPlayerPos',
                                            'uMinPosLeftSwap', 'uMinPosRightSwap',
                                            'uMaxPosLeftSwap', 'uMaxPosRightSwap'],
                                           ['uGroundHeightSampler'],
                                           join);
    }
    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

VegetationPosMaterial.prototype.unbind = function ()
{
    if (this.groundHeightTexture && this.groundHeightTexture.isRenderTarget) {
        this._effect.setTexture("uGroundHeightSampler", null);
    }
};


VegetationPosMaterial.prototype.bind = function (world, mesh) {
    if (this.groundHeightTexture) {
        this._effect.setTexture("uGroundHeightSampler", this.groundHeightTexture);

        this._effect.setVector3('uMinPosLeftSwap', this.groundHeightTexture.material.projectedGrid.minPosLeft);
        this._effect.setVector3('uMinPosRightSwap', this.groundHeightTexture.material.projectedGrid.minPosRight);
        this._effect.setVector3('uMaxPosLeftSwap', this.groundHeightTexture.material.projectedGrid.maxPosLeft);
        this._effect.setVector3('uMaxPosRightSwap', this.groundHeightTexture.material.projectedGrid.maxPosRight);
    }

    this._effect.setFloat('uSize', this.size);
    var deltaPos = _config.player.position.mod(2.*this.size/this.subdiv).scale(-1.);
    this._effect.setVector3('uDeltaPos', deltaPos);
    this._effect.setVector3('uPlayerPos', _config.player.position.floor(2.*this.size/this.subdiv));
};


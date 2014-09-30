function GroundHeightMaterial(name, ground, scene) {
    this.name = name;
    this.id = name;
    this.ground = ground;

    this.deltaPos = new BABYLON.Vector3(0., 0., 0.);

    this.textureSize = 1.;

    this.shader = new Shader('./shader/pass_through.vertex.fx',
                             './shader/ground_height.fragment.fx',
                             [],
                             ['./shader/noise.include.fx',
                              './shader/grid.include.fx']);

    this.backFaceCulling = false;

    this._scene = scene;
    scene.materials.push(this);
};

GroundHeightMaterial.prototype = Object.create(BABYLON.Material.prototype);

GroundHeightMaterial.prototype.needAlphaBlending = function () {
    return false;
};

GroundHeightMaterial.prototype.needAlphaTesting = function () {
    return false;
};

GroundHeightMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

    defines.push('#define INV_TEXTURE_SIZE '+(1./this.textureSize));

    var join = defines.join('\n');
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = join;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.UVKind],
                                           ['uEyePosInWorld', 'uPlayerPos',
                                            'uMinPosLeft', 'uMinPosRight',
                                            'uMaxPosLeft', 'uMaxPosRight'],
                                           ['uNoiseSampler'],
                                           join);
    }
    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

GroundHeightMaterial.prototype.unbind = function ()
{
    if (this.noiseTexture && this.noiseTexture.isRenderTarget) {
        this._effect.setTexture("uNoiseSampler", null);
    }
};


GroundHeightMaterial.prototype.bind = function (world, mesh) {
    var eyePos = _config.world.cameraPos;

    this._effect.setVector3('uEyePosInWorld', eyePos);
    this._effect.setVector3('uPlayerPos', _config.player.position.add(this.deltaPos));

    this._effect.setVector3('uMinPosLeft', this.projectedGrid.minPosLeft);
    this._effect.setVector3('uMinPosRight', this.projectedGrid.minPosRight);
    this._effect.setVector3('uMaxPosLeft', this.projectedGrid.maxPosLeft);
    this._effect.setVector3('uMaxPosRight', this.projectedGrid.maxPosRight);

    if (this.noiseTexture && this.noiseTexture.isRenderTarget) {
        this._effect.setTexture("uNoiseSampler", this.noiseTexture);
    }
};


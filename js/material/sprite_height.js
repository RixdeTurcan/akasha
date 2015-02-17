function SpriteHeightMaterial(name, textureSize, ground, grid, scene) {
    this.name = name;
    this.id = name;

    this.textureSize = textureSize;

    this.ground = ground;

    this.grid = grid;

    this._scaledDiffuse = new BABYLON.Color3();
    this._scaledSpecular = new BABYLON.Color3()

    this._renderTargets = new BABYLON.SmartArray(32);
    this._lightMatrix = BABYLON.Matrix.Zero();


    this.shader = new Shader('./shader/pass_through.vertex.fx',
                             './shader/sprite_height.fragment.fx',
                             [],
                             ['./shader/sphere_grid.include.fx',
                              './shader/texture_noise.include.fx',
                              './shader/ground.include.fx',
                              './shader/ground_height.include.fx']);

    this.backFaceCulling = false;
    this._scene = scene;
    scene.materials.push(this);
};

SpriteHeightMaterial.prototype = Object.create(BABYLON.Material.prototype);


// Properties
SpriteHeightMaterial.prototype.needAlphaBlending = function () {
    return false;
};

SpriteHeightMaterial.prototype.needAlphaTesting = function () {
    return false;
};

// Methods
SpriteHeightMaterial.prototype.getRenderTargetTextures = function () {
    this._renderTargets.reset();
    return this._renderTargets;
};

SpriteHeightMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

    if (this.noiseTexture) {
        if (!this.noiseTexture.isReady()) {
            return false;
        } else {
            defines.push("#define NOISE_TEXTURE");
        }
    }

    defines.push('#define INV_TEXTURE_SIZE '+(1./this.textureSize));
    defines.push('#define TEXTURE_SIZE '+this.textureSize+'.');

    var join = defines.join("\n");
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = join;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.UVKind],
                                           ['uPlayerPos',
                                            'uBeta', 'uCosBeta', 'uSinBeta',
                                            'uTransitionSizeBot', 'uTransitionSizeTop',
                                            'uUnitSize', 'uNbHalfUnit', 'uNbUnit', 'uFinalNbHalfUnit',
                                            'uNbLod', 'uBetaRange', 'uBetaCenterDist', 'uDistMin'],
                                           ['uNoiseSampler'],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

SpriteHeightMaterial.prototype.unbind = function ()
{
    if (this.skyTexture && this.skyTexture.isRenderTarget) {
        this._effect.setTexture("uSkySampler", null);
    }
};

SpriteHeightMaterial.prototype.bind = function (world, mesh) {
    this._effect.setVector3('uPlayerPos', _config.player.position);

    var beta = this.ground.beta[this.ground.meshToDisplay];
    beta = beta%(2*_pi);
    if (beta>_pi){
        beta -= 2*_pi;
    }

    this._effect.setFloat('uBeta', beta);
    this._effect.setFloat('uCosBeta', Math.cos(beta));
    this._effect.setFloat('uSinBeta', Math.sin(beta));


    this._effect.setFloat('uTransitionSizeBot', this.grid.transitionSizeBot);
    this._effect.setFloat('uTransitionSizeTop', this.grid.transitionSizeTop);
    this._effect.setFloat('uUnitSize', this.grid.unitSize);
    this._effect.setFloat('uNbHalfUnit', this.grid.nbUnit+this.grid.transitionSizeBot+1.);
    this._effect.setFloat('uNbUnit', (this.grid.nbUnit+this.grid.transitionSizeBot+1.)*2.+1.);
    this._effect.setFloat('uFinalNbHalfUnit', this.grid.finalNbUnit);
    this._effect.setFloat('uNbLod', this.grid.nbLod);
    this._effect.setFloat('uBetaRange', this.grid.betaRange);
    this._effect.setFloat('uBetaCenterDist', this.grid.betaCenterDist);
    this._effect.setFloat('uDistMin', this.grid.distMin);

    // noise
    if (this.noiseTexture) {
        this._effect.setTexture("uNoiseSampler", this.noiseTexture);
    }
};

SpriteHeightMaterial.prototype.dispose = function(){
    this.baseDispose();
};


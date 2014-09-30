function SeabedGroundMaterial(name, scene, ground) {
    this.name = name;
    this.id = name;

    this.ground = ground;

    this._scaledDiffuse = new BABYLON.Color3();
    this._scaledSpecular = new BABYLON.Color3()

    this._renderTargets = new BABYLON.SmartArray(32);
    this._lightMatrix = BABYLON.Matrix.Zero();

    this.wireframe = false;

    this.shader = new Shader('./shader/seabed_ground.vertex.fx',
                             './shader/seabed.fragment.fx',
                             [],
                             []);

    this.swapBufferId = 0;

    this.backFaceCulling = false;
    this._scene = scene;
    scene.materials.push(this);
};

SeabedGroundMaterial.prototype = Object.create(BABYLON.Material.prototype);


// Properties
SeabedGroundMaterial.prototype.needAlphaBlending = function () {
    return false;
};

SeabedGroundMaterial.prototype.needAlphaTesting = function () {
    return false;
};

SeabedGroundMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

    if (this.heightTexture) {
        if (!this.heightTexture.isReady()) {
            return false;
        } else {
            defines.push("#define HEIGHT");
        }
    }

    var join = defines.join("\n");
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = join;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.UVKind],
                                           ['uViewProjection', 'uEyePosInWorld',
                                           'uTangentScreenDist', 'uPlayerPos'],
                                           ['uHeightSampler'],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

SeabedGroundMaterial.prototype.unbind = function ()
{
    if (this.heightTexture && this.heightTexture.isRenderTarget) {
        this._effect.setTexture("uHeightSampler", null);
    }

};

SeabedGroundMaterial.prototype.bind = function (world, mesh) {

    var eyePos = this._scene.activeCamera.position;
    var transform = this._scene.getTransformMatrix();


    this._effect.setMatrix('uViewProjection', transform);

    this._effect.setVector3('uEyePosInWorld', eyePos);
    this._effect.setFloat('uTangentScreenDist', _config.ground.params.tangentScreenDist);
    this._effect.setVector3('uPlayerPos', _config.player.position);

    // height
    if (this.heightTexture) {
        this._effect.setTexture("uHeightSampler", this.heightTexture);
    }

};

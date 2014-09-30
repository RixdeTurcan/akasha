function ShadowGroundMaterial(name, scene, ground, light) {
    this.name = name;
    this.id = name;

    this.ground = ground;
    this.light = light;

    this._scaledDiffuse = new BABYLON.Color3();
    this._scaledSpecular = new BABYLON.Color3()

    this._renderTargets = new BABYLON.SmartArray(32);
    this._lightMatrix = BABYLON.Matrix.Zero();


    this.projectedGrid = new ProjectedGrid(this.ground.camera);
    this.projectedGrid.marginY = 2.;
    this.projectedGrid.marginX = 2.;

    this.deltaPos = new BABYLON.Vector3(0., 0., 0.);

    this.wireframe = false;

    this.lastPlayerPos = new BABYLON.Vector3(0., 0., 0.);
    this.deltaPlayerPos = new BABYLON.Vector3(0., 0., 0.);
    this.mat = new BABYLON.Matrix();

    this.swapBufferId = 0;

    this.shader = new Shader('./shader/shadow_ground.vertex.fx',
                             './shader/shadowMap.fragment.fx',
                             [],
                             []);

    this.backFaceCulling = false;
    this._scene = scene;
    scene.materials.push(this);
};

ShadowGroundMaterial.prototype = Object.create(BABYLON.Material.prototype);


// Properties
ShadowGroundMaterial.prototype.needAlphaBlending = function () {
    return false;
};

ShadowGroundMaterial.prototype.needAlphaTesting = function () {
    return false;
};

ShadowGroundMaterial.prototype.isReady = function (mesh) {
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
                                           ['uViewProjection',
                                           'uTangentScreenDist', 'uDeltaPos'],
                                           ['uHeightSampler'],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

ShadowGroundMaterial.prototype.unbind = function ()
{
    if (this.heightTexture && this.heightTexture.isRenderTarget) {
        this._effect.setTexture("uHeightSampler", null);
    }

};

ShadowGroundMaterial.prototype.getTransformMatrix = function(first){

    var mat = computeOrthoTransformMatrix(_config.player.position.mod(500.).scale(-1),
                                          this.light.light.direction,
                                          2000.,
                                          2000.,
                                          2000.);

    if (first){
        this.deltaPlayerPos = _config.player.position.subtract(this.lastPlayerPos);
        this.lastPlayerPos = _config.player.position.clone();

        _config.player.deltaShadowUv = BABYLON.Vector3.TransformCoordinates(this.deltaPlayerPos, this.mat).scale(0.5);

        this.mat = mat;
    }
    return mat;

};

ShadowGroundMaterial.prototype.bind = function (world, mesh) {

    var eyePos = this._scene.activeCamera.position;
    var transform = this.getTransformMatrix();


    this._effect.setMatrix('uViewProjection', transform);

    this._effect.setFloat('uTangentScreenDist', _config.ground.params.tangentScreenDist);
    this._effect.setVector3('uDeltaPos', this.deltaPos);

    // height
    if (this.heightTexture) {
        this._effect.setTexture("uHeightSampler", this.heightTexture);
    }

};


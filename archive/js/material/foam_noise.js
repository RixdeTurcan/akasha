function FoamAndNoiseMaterial(name, sea, scene) {
    this.name = name;
    this.id = name;
    this.sea = sea;

    this.textureSize = 1.;
    this.uvLodPow = 1.;
    this.backFaceCulling = false;

    this._renderTargets = new BABYLON.Tools.SmartArray(16);


    this._scene = scene;
    scene.materials.push(this);
};

FoamAndNoiseMaterial.prototype = Object.create(BABYLON.Material.prototype);

// Properties
FoamAndNoiseMaterial.prototype.needAlphaBlending = function () {
    return false;
};

FoamAndNoiseMaterial.prototype.needAlphaTesting = function () {
    return false;
};

// Methods
FoamAndNoiseMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();

    var defines = [];

    this._effect = engine.createEffect('shader/foam_noise',
                                       [BABYLON.VertexBuffer.PositionKind],
                                       ['world', 'viewProjection',
                                        'uTextureSize', 'uTime',
                                        'uMinPosLeft', 'uMinPosRight', 'uMaxPosLeft', 'uMaxPosRight',
                                        'uEyePosInWorld', 'uUvLodPow'],
                                       ['foamAndNoiseSampler'],
                                       defines.join("\n"));

    if (!this._effect.isReady()) {
        return false;
    }

    return true;
};

FoamAndNoiseMaterial.prototype.bind = function (world, mesh) {
    var transform = this._scene.getTransformMatrix();
    var invTransform = transform.clone();
    invTransform.invert();
    
    var eyePos = this._scene.activeCamera.position;
   
    var minPosLeft = this.sea.clipSpaceToWorldSpace(new BABYLON.Vector3(0., 0.), invTransform);
    var minPosRight = this.sea.clipSpaceToWorldSpace(new BABYLON.Vector3(1., 0.), invTransform);
    var maxPosLeft = this.sea.clipSpaceToWorldSpace(new BABYLON.Vector3(0., 1.), invTransform);
    var maxPosRight = this.sea.clipSpaceToWorldSpace(new BABYLON.Vector3(1., 1.), invTransform);

    if (maxPosLeft.y-eyePos.y>-0.001)
    {
        var horizonFactor = 0.99;
        var alpha = horizonFactor*(eyePos.y-minPosLeft.y)/(maxPosLeft.y-minPosLeft.y);
        maxPosLeft = maxPosLeft.subtract(minPosLeft).scale(alpha).add(minPosLeft);
        maxPosRight = maxPosRight.subtract(minPosRight).scale(alpha).add(minPosRight);
    }
    
    
    this._effect.setMatrix("world", world);
    this._effect.setMatrix("viewProjection", transform);
    
    this._effect.setFloat("uTextureSize", this.textureSize);
    this._effect.setFloat("uTime", this.sea.time);

    this._effect.setVector3('uEyePosInWorld', eyePos);
    this._effect.setFloat("uUvLodPow", this.uvLodPow);
    
    this._effect.setVector3('uMinPosLeft', minPosLeft);
    this._effect.setVector3('uMinPosRight', minPosRight);
    this._effect.setVector3('uMaxPosLeft', maxPosLeft);
    this._effect.setVector3('uMaxPosRight', maxPosRight);
};

FoamAndNoiseMaterial.prototype.dispose = function () {
    this.baseDispose();
};

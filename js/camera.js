CameraType_ArcRotate = 1;

function Camera(cameraType, position){
    assert(function(){return position instanceof BABYLON.Vector3;}, 'position is not a BABYLON.Vector3');
    assert(function(){return cameraType!==null;}, 'cameraType can not be null');
    assert(function(){return cameraType === CameraType_ArcRotate;}, 'cameraType can not be a not defined value');

    this.cameraType = cameraType;

    if (cameraType == CameraType_ArcRotate){
        this.camera = new BABYLON.ArcRotateCamera(
                            "Camera",
                            _pi/2, _pi/2,
                            this.radius,
                            position,
                            _config.world.scene);
        this.camera.upperBetaLimit    = _config.camera.upperBetaLimit;
        this.camera.lowerBetaLimit    = _config.camera.lowerBetaLimit;
        this.radiusScaleFactor        = _config.camera.radiusScaleFactor;
        this.minRadius                = _config.camera.minRadius;
        this.camera.maxZ              = _config.camera.maxZ;

    }
}

Camera.prototype.update = function(){
    var factor = 1-(this.camera.beta-_pi/2)*this.radiusScaleFactor*this.radiusScaleFactor;
    this.camera.radius = this.minRadius*Math.sqrt(factor);
}

Camera.prototype.getMinHeight = function(){
    return this.camera.target.y + this.minRadius * Math.cos(this.camera.upperBetaLimit);
}

Camera.prototype.getMaxHeight = function(){
    var maxRadius = this.minRadius * Math.sqrt(1 + (_pi/2) * this.radiusScaleFactor*this.radiusScaleFactor);
    return this.camera.target.y + maxRadius * Math.cos(this.camera.lowerBetaLimit);
}

Camera.prototype.activate = function(){
    _config.world.scene.activeCamera = this.camera;
}

Camera.prototype.enableControl = function(){
    this.camera.attachControl(_config.world.canvas);
}
Camera.prototype.disableControl = function(){
    this.camera.detachControl(_config.world.canvas);
}

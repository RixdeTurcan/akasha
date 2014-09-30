
function SkyboxMaterial(name, scene) {
    BABYLON.StandardMaterial.call(this, name, scene);


    //BABYLON.Material.prototype.alpha = 0.5;
};

SkyboxMaterial.prototype = Object.create(BABYLON.StandardMaterial.prototype);



// Methods
SkyboxMaterial.prototype.getRenderTargetTextures = function () {
    return BABYLON.StandardMaterial.prototype.getRenderTargetTextures.call(this);
};

SkyboxMaterial.prototype.unbind = function () {
    BABYLON.StandardMaterial.prototype.unbind.call(this);
};

SkyboxMaterial.prototype.bind = function (world, mesh) {
    var clipPlane = BABYLON.clipPlane?BABYLON.clipPlane.clone():null;
    BABYLON.clipPlane = null;
    BABYLON.StandardMaterial.prototype.bind.call(this, world, mesh);
    BABYLON.clipPlane = clipPlane;
};

SkyboxMaterial.prototype.getAnimatables = function () {
    return BABYLON.StandardMaterial.prototype.getAnimatables.call(this);
};

SkyboxMaterial.prototype.dispose = function () {
    BABYLON.StandardMaterial.prototype.dispose.call(this);
};

SkyboxMaterial.prototype.isReady = function (mesh) {
    var defines = [];
    var uniforms = [];
    var samplers = [];

    var clipPlane = BABYLON.clipPlane?BABYLON.clipPlane.clone():null;
    BABYLON.clipPlane = null;

    var ret = StandardMaterialIsReady(this, mesh,
                                      {vertex: 'default',
                                       fragment: 'shader/skybox'},
                                      defines, uniforms, samplers);

    BABYLON.clipPlane = clipPlane;
    return ret;
};

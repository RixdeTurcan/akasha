function Ground(camera, light){
    assert(function(){return camera instanceof Camera;}, 'camera is not a Camera');
    assert(function(){return light instanceof Light;}, 'light is not a Light');

    this.camera = camera;
    this.light = light;

    var scaling = 1.;
    this.mesh = createGrid("ground", _config.ground.sampling.grid-1,
                           0., 1., 0., 1.,
                           _config.world.scene, false,
                           1., scaling, 1./scaling);

    this.meshLowDef = createGrid("ground", parseInt(_config.ground.sampling.gridLowDef)-1,
                           0., 1., 0., 1.,
                           _config.world.scene, false,
                           1., scaling, 1./scaling);
    this.meshLowDef.subMeshes = [];
    this.meshLowDef.material = null;

    this.material = new GroundMaterial("GroundMaterial", _config.world.scene, this);
    this.mesh.material = new BABYLON.MultiMaterial("groundMultiMat", _config.world.scene);
    this.mesh.subMeshes = [];
    addMaterialToMesh(this.material, this.mesh, false, false);
    this.mesh.isInFrustum = function(){return true;};
    this.mesh.subMeshes[0].isInFrustum = function(){return true;};


    this.meshLowDefRefraction = createGrid("ground", parseInt(_config.ground.sampling.gridLowDef)-1,
                                           0., 1., 0., 1.,
                                           _config.world.scene, false,
                                           1., scaling, 1./scaling);

    this.meshLowDefRefraction.material = new BABYLON.MultiMaterial("groundMultiMatLowDef", _config.world.scene);
    this.meshLowDefRefraction.subMeshes = [];
    addMaterialToMesh(this.material, this.meshLowDefRefraction, false, true);
    this.meshLowDefRefraction.isInFrustum = function(){return true;};
    this.meshLowDefRefraction.subMeshes[0].isInFrustum = function(){return true;};

    //Height
    this.heightTexture = createRenderTargetTexture('heightTexture',
                                                   _config.ground.sampling.height,
                                                   _config.world.scene,
                                                   {
                                                       generateMipMaps: false,
                                                       enableTextureFloat: true,
                                                       generateDepthBuffer: false
                                                   },
                                                   new GroundHeightMaterial('groundHeightMaterial',
                                                                            this.material,
                                                                            _config.world.scene),
                                                   this.material,
                                                   "passthrough");
    this.heightTexture.material.textureSize = _config.ground.sampling.height;
    this.heightTexture.material.projectedGrid = this.material.projectedGrid;
    this.material.heightTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    this.material.heightTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;


    //diffuse 1
    this.material.diffuseTexture = new BABYLON.Texture("asset/sand.jpg",
                                                       _config.world.scene);
    this.material.diffuseTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material.diffuseTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;

    //diffuse 2
    this.material.diffuseTexture2 = new BABYLON.Texture("asset/grass.jpg",
                                                        _config.world.scene);
    this.material.diffuseTexture2.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material.diffuseTexture2.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;

    //Reflection
    this.reflectionMaterial = new ReflectionGroundMaterial("ReflectionGround",
                                                           _config.world.scene,
                                                           this);
    this.reflectionMaterial.heightTexture = this.material.heightTexture;
    this.reflectionMaterial.diffuseTexture = this.material.diffuseTexture;
    this.reflectionMaterial.diffuseTexture2 = this.material.diffuseTexture2;
    this.reflectionMaterial.projectedGrid = this.material.projectedGrid;

    //Seabed
    this.seabedMaterial = new SeabedGroundMaterial("SeabedGround",
                                                   _config.world.scene,
                                                   this);
    this.seabedMaterial.heightTexture = this.material.heightTexture;
    this.seabedMaterial.projectedGrid = this.material.projectedGrid;

    //Foam shore
    this.foamShoreMaterial = new FoamShoreGroundMaterial("FoamShoreGround",
                                                         _config.world.scene,
                                                         this);
    this.foamShoreMaterial.heightTexture = this.material.heightTexture;
    this.foamShoreMaterial.projectedGrid = this.material.projectedGrid;

    //Shadow Height
    this.shadowHeightTexture = createRenderTargetTexture('shadowHeightTexture',
                                                         _config.ground.sampling.shadowHeight,
                                                         _config.world.scene,
                                                         {
                                                             generateMipMaps: false,
                                                             enableTextureFloat: true,
                                                             generateDepthBuffer: false
                                                         },
                                                         new GroundHeightMaterial('groundShadowHeightMaterial',
                                                                                  this.material,
                                                                                  _config.world.scene),
                                                         this.material,
                                                         "passthrough");
    this.shadowHeightTexture.material.textureSize = _config.ground.sampling.shadowHeight;
    this.material.shadowHeightTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    this.material.shadowHeightTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;

    //Shadow
    this.shadowTexture = createRenderTargetTexture('shadowTexture',
                                                   _config.ground.sampling.shadow,
                                                   _config.world.scene,
                                                   {
                                                       generateMipMaps: false,
                                                       enableTextureFloat: true,
                                                       generateDepthBuffer: true
                                                   },
                                                   new ShadowGroundMaterial('groundShadowMaterial',
                                                                            _config.world.scene,
                                                                            this, this.light),
                                                   this.material,
                                                   this.meshLowDef);
    this.shadowTexture.material.heightTexture = this.shadowHeightTexture;
    this.shadowHeightTexture.material.projectedGrid = this.shadowTexture.material.projectedGrid;

    this.shadowTexture.material.projectedGrid.minPosLeft.x = -_config.ground.params.shadowTextureWidth;
    this.shadowTexture.material.projectedGrid.minPosLeft.y = 0.;
    this.shadowTexture.material.projectedGrid.minPosLeft.z = -_config.ground.params.shadowTextureWidth;

    this.shadowTexture.material.projectedGrid.minPosRight.x = _config.ground.params.shadowTextureWidth;
    this.shadowTexture.material.projectedGrid.minPosRight.y = 0.;
    this.shadowTexture.material.projectedGrid.minPosRight.z = -_config.ground.params.shadowTextureWidth;

    this.shadowTexture.material.projectedGrid.maxPosLeft.x = -_config.ground.params.shadowTextureWidth;
    this.shadowTexture.material.projectedGrid.maxPosLeft.y = 0.;
    this.shadowTexture.material.projectedGrid.maxPosLeft.z = _config.ground.params.shadowTextureWidth;

    this.shadowTexture.material.projectedGrid.maxPosRight.x = _config.ground.params.shadowTextureWidth;
    this.shadowTexture.material.projectedGrid.maxPosRight.y = 0.;
    this.shadowTexture.material.projectedGrid.maxPosRight.z = _config.ground.params.shadowTextureWidth;

    this.shadowMapPreviousPos = _config.player.position;
}

Ground.prototype.addWavedataTexture = function(texture)
{
    this.reflectionMaterial.waveDataTexture = texture;
}

Ground.prototype.addSkyTexture = function(skyTexture)
{
    this.material.skyTexture = skyTexture;
}

Ground.prototype.addShadowTexture = function(shadowTexture)
{
    this.material.shadowTexture = shadowTexture;
}



Ground.prototype.update = function()
{
    this.material.projectedGrid.compute(_config.world.cameraPos,
                                        _config.world.transformMat,
                                        _config.world.invTransformMat,
                                        true, true);

    this.shadowMapPreviousPos = _config.player.position.mod(_config.ground.params.shadowTextureStep);

    this.shadowHeightTexture.material.deltaPos = this.shadowMapPreviousPos.scale(-1);
    this.shadowTexture.material.deltaPos = this.shadowMapPreviousPos.scale(-1);

}

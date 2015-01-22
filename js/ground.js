function Ground(camera, light){
    assert(function(){return camera instanceof Camera;}, 'camera is not a Camera');
    assert(function(){return light instanceof Light;}, 'light is not a Light');

    this.camera = camera;
    this.light = light;

    this.material = new GroundMaterial("GroundMaterial", _config.world.scene, this);

    this.nbQuadrant = 40;
    this.meshToDisplay = 0;

    this.mesh = [];
    this.grid = new Grid();
    this.grid.createGrid(20., 100, 100, 4, 1);


    for(var i = 0; i < this.nbQuadrant; i++){
        var beta = 2.*_pi*i/this.nbQuadrant;
        var betaRange = _pi/5.0;

        this.grid.clip(beta+_pi, betaRange, -750., 750.);
        this.mesh[i] = this.grid.makeClippedMesh("ground"+i, _config.world.scene);

        this.mesh[i].material = new BABYLON.MultiMaterial("groundMultiMat", _config.world.scene);
        this.mesh[i].subMeshes = [];
        addMaterialToMesh(this.material, this.mesh[i], false, false);
        this.mesh[i].isInFrustum = function(){return true;};
        this.mesh[i].subMeshes[0].isInFrustum = function(){return true;};
        this.mesh[i].subMeshes[0].isHiddenScreen = true;
    }
/*
    var scaling = 1.;
    this.meshLowDef = createGrid("ground", parseInt(_config.ground.sampling.gridLowDef)-1,
                           0., 1., 0., 1.,
                           _config.world.scene, false,
                           1., scaling, 1./scaling);
    this.meshLowDef.subMeshes = [];
    this.meshLowDef.material = null;



    this.meshLowDefRefraction = createGrid("ground", parseInt(_config.ground.sampling.gridLowDef)-1,
                                           0., 1., 0., 1.,
                                           _config.world.scene, false,
                                           1., scaling, 1./scaling);

    this.meshLowDefRefraction.material = new BABYLON.MultiMaterial("groundMultiMatLowDef", _config.world.scene);
    this.meshLowDefRefraction.subMeshes = [];
    addMaterialToMesh(this.material, this.meshLowDefRefraction, false, true);
    this.meshLowDefRefraction.isInFrustum = function(){return true;};
    this.meshLowDefRefraction.subMeshes[0].isInFrustum = function(){return true;};
*/

    //Noise texture
    this.noiseTexture = new BABYLON.Texture("asset/noise.png", _config.world.scene);
    this.noiseTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.noiseTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material.noiseTexture = this.noiseTexture;
/*
    //Grass texture
    this.grassTexture = new BABYLON.Texture("asset/grass.png", _config.world.scene);
    this.grassTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.grassTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material.grassTexture = this.grassTexture;
*/
    //diffuse 1
    this.material.diffuse1Texture = new BABYLON.Texture("asset/sand.png",
                                                       _config.world.scene);
    this.material.diffuse1Texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material.diffuse1Texture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;

    //diffuse 2
    this.material.diffuse2Texture = new BABYLON.Texture("asset/grass_far.png",
                                                        _config.world.scene);
    this.material.diffuse2Texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material.diffuse2Texture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;

    //diffuse normal 2
    this.material.diffuseNormal2Texture = new BABYLON.Texture("asset/dirt.png",
                                                        _config.world.scene);
    this.material.diffuseNormal2Texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material.diffuseNormal2Texture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
/*
    //Diffuse far 2
    this.material.diffuseFar2Texture = new BABYLON.Texture("asset/grass_far.png",
                                                        _config.world.scene);
    this.material.diffuseFar2Texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material.diffuseFar2Texture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
*/
    //diffuse 3
    this.material.diffuse3Texture = new BABYLON.Texture("asset/snow.png",
                                                        _config.world.scene);
    this.material.diffuse3Texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material.diffuse3Texture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;

    //diffuse normal 3
    this.material.diffuseNormal3Texture = new BABYLON.Texture("asset/stone.png",
                                                        _config.world.scene);
    this.material.diffuseNormal3Texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material.diffuseNormal3Texture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;

/*
    //Reflection
    this.reflectionMaterial = new ReflectionGroundMaterial("ReflectionGround",
                                                           _config.world.scene,
                                                           this);
    this.reflectionMaterial.heightTexture = this.material.heightTexture;
    this.reflectionMaterial.diffuseTexture = this.material.diffuseTexture;
    this.reflectionMaterial.diffuseTexture2 = this.material.diffuseTexture2;
    this.reflectionMaterial.diffuseTexture3 = this.material.diffuseTexture3;
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

    */
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
/*
    this.material.projectedGrid.compute(_config.world.cameraPos,
                                        _config.world.transformMat,
                                        _config.world.invTransformMat,
                                        true, true);

    this.shadowMapPreviousPos = _config.player.position.mod(_config.ground.params.shadowTextureStep);

    this.shadowHeightTexture.material.deltaPos = this.shadowMapPreviousPos.scale(-1);
    this.shadowTexture.material.deltaPos = this.shadowMapPreviousPos.scale(-1);
*/

    this.mesh[this.meshToDisplay].subMeshes[0].isHiddenScreen = true;
    this.meshToDisplay = Math.round((_config.player.angle.mod(2.*_pi))/(2.*_pi/this.nbQuadrant)).mod(this.nbQuadrant);
    this.mesh[this.meshToDisplay].subMeshes[0].isHiddenScreen = false;

}

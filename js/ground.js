function Ground(camera, light){
    assert(function(){return camera instanceof Camera;}, 'camera is not a Camera');
    assert(function(){return light instanceof Light;}, 'light is not a Light');

    this.camera = camera;
    this.light = light;

    this.loaded = false;
    this.loading = false;
    this.loaderCallback = function(){};
    this.loadingCallback = function(){};
    this.nbTextureToLoad = 6;
    this.nbTextureLoaded = 0;
    this.textureLoaded = false;
    this.groundMeshLoaded = false;
    this.treeMeshLoaded = false;
    this.loadingPercent = 0;
    this.impostorTexRendering = false;
}

Ground.prototype.load = function(loaderCallback, loadingCallback){
    this.loaderCallback = loaderCallback;
    this.loadingCallback = loadingCallback;

    this.material = new GroundMaterial("GroundMaterial", _config.world.scene, this);

    this.treeTex = {}
    this.treeTex.Eucalyptus = createImpostorTextures('asset/pine/', 'Eucalyptus', 4096, 8, 8, this.material,
                                                     _config.world.scene, function(){
                                                         this.loadingPercent += 0.2;
                                                         loadingCallback(this.loadingPercent);
                                                         this.material.renderImpostorTex = true;
                                                     }.bind(this));
/*
    this.treeTex.arvore = createImpostorTextures('asset/pine2/', 'arvore', 512, 1, 1,
                                                     this.material, _config.world.scene);

*/
    this.treeMaterial = new SpritesMaterial("TreeMaterial", _config.world.scene, 8, 8);

    this.nbQuadrant = 40;
    this.meshToDisplay = 0;

    this.mesh = [];
    this.grid = new Grid();
    this.grid.createGrid(20., 100, 70, 5, 1);

    //Ground
    var groundFunc = function(i){
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

        this.loadingPercent += 0.25/this.nbQuadrant;
        loadingCallback(this.loadingPercent);

        if (i<this.nbQuadrant){
            setTimeout(function(){
                groundFunc(i+1);
            }.bind(this), 10);
        }else{
            this.groundMeshLoaded = true;
        }
    }.bind(this);
    groundFunc(0);


    //Trees
    this.treeGrid = new Grid();
    this.treeGrid.createGrid(250., 80, 80, 1, 1);
    this.treeGrid.reorderPosition();
    this.treeMesh = [];

    var spritePos = [0, 0, 0,
                     0, 0, 0,
                     0, 0, 0,
                     0, 0, 0];
    var spiteUv = [0, 0,
                   0, 0.98,
                   0.98, 0,
                   0.98, 0.98];
    var spriteIndices = [0, 1, 2,
                         2, 3, 1];


    var treeFunc = function(i){
        var beta = 2.*_pi*i/this.nbQuadrant;
        var betaRange = _pi/4.0;

        this.treeGrid.clip(beta+_pi, betaRange, -750., 750., true, true);

        this.treeMesh[i] = this.treeGrid.makeLodMeshes("trees"+i, spritePos, spiteUv, spriteIndices,
                                                   _config.world.scene, false);

        this.treeMesh[i].material = new BABYLON.MultiMaterial("treeMultiMat", _config.world.scene);
        this.treeMesh[i].subMeshes = [];
        addMaterialToMesh(this.treeMaterial, this.treeMesh[i], false, false);
        this.treeMesh[i].isInFrustum = function(){return true;};
        this.treeMesh[i].subMeshes[0].isInFrustum = function(){return true;};
        this.treeMesh[i].subMeshes[0].isHiddenScreen = true;

        this.loadingPercent += 0.25/this.nbQuadrant
        loadingCallback(this.loadingPercent);

        if (i<this.nbQuadrant){
            setTimeout(function(){
                treeFunc(i+1);
            }.bind(this), 10);
        }else{
            this.treeMeshLoaded = true;
        }
    }.bind(this);
    treeFunc(0);


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

    var loadingFunction = function(){
        this.nbTextureLoaded++;
        this.loadingPercent += 0.1/this.nbTextureToLoad;
        if (this.nbTextureLoaded>=this.nbTextureToLoad){
            this.textureLoaded = true;
        }else{
            loadingCallback(this.loadingPercent);
        }
    }.bind(this);

    //Noise texture
    this.noiseTexture = new BABYLON.Texture("asset/noise.png", _config.world.scene, true, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, loadingFunction);
    this.noiseTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.noiseTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material.noiseTexture = this.noiseTexture;
    this.treeMaterial.noiseTexture = this.noiseTexture;
/*
    //Grass texture
    this.grassTexture = new BABYLON.Texture("asset/grass.png", _config.world.scene);
    this.grassTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.grassTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material.grassTexture = this.grassTexture;
*/
    //diffuse 1
    this.material.diffuse1Texture = new BABYLON.Texture("asset/sand.png", _config.world.scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, loadingFunction);
    this.material.diffuse1Texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material.diffuse1Texture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;

    //diffuse 2
    this.material.diffuse2Texture = new BABYLON.Texture("asset/grass_far.png",  _config.world.scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, loadingFunction);
    this.material.diffuse2Texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material.diffuse2Texture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;

    //diffuse normal 2
    this.material.diffuseNormal2Texture = new BABYLON.Texture("asset/dirt.png", _config.world.scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, loadingFunction);
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
    this.material.diffuse3Texture = new BABYLON.Texture("asset/snow.png", _config.world.scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, loadingFunction);
    this.material.diffuse3Texture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material.diffuse3Texture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;

    //diffuse normal 3
    this.material.diffuseNormal3Texture = new BABYLON.Texture("asset/stone.png",  _config.world.scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, loadingFunction);
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

    this.loaded = true;
    this.loading = true;
}

Ground.prototype.addWavedataTexture = function(texture)
{
    this.reflectionMaterial.waveDataTexture = texture;
}

Ground.prototype.addSkyTexture = function(skyTexture)
{
    this.material.skyTexture = skyTexture;
    this.treeMaterial.skyTexture = skyTexture;
}

Ground.prototype.addShadowTexture = function(shadowTexture)
{
    this.material.shadowTexture = shadowTexture;
}



Ground.prototype.update = function()
{
    if (!this.loaded){return;}
/*
    this.material.projectedGrid.compute(_config.world.cameraPos,
                                        _config.world.transformMat,
                                        _config.world.invTransformMat,
                                        true, true);

    this.shadowMapPreviousPos = _config.player.position.mod(_config.ground.params.shadowTextureStep);

    this.shadowHeightTexture.material.deltaPos = this.shadowMapPreviousPos.scale(-1);
    this.shadowTexture.material.deltaPos = this.shadowMapPreviousPos.scale(-1);
*/
    if (this.groundMeshLoaded && this.treeMeshLoaded){
        this.mesh[this.meshToDisplay].subMeshes[0].isHiddenScreen = true;
        this.treeMesh[this.meshToDisplay].subMeshes[0].isHiddenScreen = true;

        this.meshToDisplay = Math.round((_config.player.angle.mod(2.*_pi))/(2.*_pi/this.nbQuadrant)).mod(this.nbQuadrant);

        this.mesh[this.meshToDisplay].subMeshes[0].isHiddenScreen = false;
        this.treeMesh[this.meshToDisplay].subMeshes[0].isHiddenScreen = false;

        var impostorfunc = function(k, nb, color){
            if (k>=nb){
                if (color){
                    setTimeout(function(){
                        impostorfunc(0, nb, false);
                    }.bind(this), 10);
                }else{
                    for(var i in this.treeTex){
                        this.treeMaterial.diffuseTexture = this.treeTex[i].colorMipmap;
                        this.treeMaterial.bumpTexture = this.treeTex[i].normalMipmap;
                    }
                    this.loading = false;
                    this.loaderCallback();
                }
                return;
            }

            var j=0;
            var i;
            for(i in this.treeTex){
                j++;
                if (j>k){break;}
            }

            if (color){
                this.treeTex[i].colorMipmap = getImageFromTexture(this.treeTex[i].colorMap, this.treeTex[i].textureSize);
            }else{
                this.treeTex[i].normalMipmap = getImageFromTexture(this.treeTex[i].normalMap, this.treeTex[i].textureSize);
            }

            this.loadingPercent += 0.1/nb;
            this.loadingCallback(this.loadingPercent);

            setTimeout(function(){
                impostorfunc(k+1, nb, color);
            }.bind(this), 10);
        }.bind(this);
        if (this.loading && this.textureLoaded && this.material.impostorTexRendered && !this.impostorTexRendering){
            var nb = 0;
            for(var i in this.treeTex){
                nb++;
                this.material.treeTextures[i+"_color_texture"] = null;
                this.material.treeTextures[i+"_normal_texture"] = null;
            }
            this.impostorTexRendering = true;
            impostorfunc(0, nb, true);
        }
    }
}

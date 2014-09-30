function Ocean(camera){
    assert(function(){return camera instanceof Camera;}, 'camera is not a Camera');

    this.camera = camera;

    this.shadowRendering = false;

    this.seabedMesh = [];
    this.seabedMaterial = [];
    this.reflectionMesh = [];
    this.reflectionMaterial = [];
    this.refractionMesh = [];
    this.foamShoreMesh = [];
    this.foamShoreMaterial = [];

    this.material = new SeaMaterial("ocean", _config.world.scene, this);

    this.initMesh();
    this.initMaterials();

}

Ocean.prototype.initMaterials = function()
{
    var that = this;

    //Waves
    this.waveDataTexture = createRenderTargetTexture('waveDataTexture',
                                                     _config.ocean.sampling.wave,
                                                     _config.world.scene,
                                                     {
                                                         generateMipMaps: false,
                                                         enableTextureFloat: true,
                                                         generateDepthBuffer: false
                                                     },
                                                     new WaveMaterial('waveDataMaterial',
                                                                      this.material,
                                                                      _config.world.scene),
                                                     this.material,
                                                     "passthrough");
    this.waveDataTexture.material.textureSize = _config.ocean.sampling.wave;

    //Noise data 1st pass
    this.noiseDataTexture = createRenderTargetTexture('noiseDataTexture',
                                                     _config.ocean.sampling.noise,
                                                     _config.world.scene,
                                                     {
                                                         generateMipMaps: false,
                                                         enableTextureFloat: false,
                                                         generateDepthBuffer: false
                                                     },
                                                     new NoiseMaterial('noiseDataMaterial',
                                                                       this.material,
                                                                       _config.world.scene),
                                                     this.material,
                                                     "passthrough");
    this.noiseDataTexture.material.textureSize = _config.ocean.sampling.noise;

    //Noise data 2nd pass
    this.noise2DataTexture = createRenderTargetTexture('noise2DataTexture',
                                                     _config.ocean.sampling.noise,
                                                     _config.world.scene,
                                                     {
                                                         generateMipMaps: false,
                                                         enableTextureFloat: false,
                                                         generateDepthBuffer: false
                                                     },
                                                     new Noise2Material('noise2DataTexture',
                                                                       this.material,
                                                                       _config.world.scene),
                                                     this.material,
                                                     "passthrough");
    this.noise2DataTexture.material.textureSize = _config.ocean.sampling.noise;
    this.noise2DataTexture.material.texture = this.noiseDataTexture;

    //Foam shore
    this.foamShoreTexture = createRenderTargetTexture('foamShoreTexture',
                                                     _config.ocean.sampling.foam,
                                                     _config.world.scene,
                                                     {
                                                         generateMipMaps: false,
                                                         enableTextureFloat: false,
                                                         generateDepthBuffer: true
                                                     },
                                                     null,
                                                     this.material,
                                                     null);
    for (var i in this.foamShoreMesh){
        this.addCollisionMesh(this.foamShoreMesh[i], this.foamShoreMaterial[i], true);
    }


    //Foam accumulation first buffer
    this.foamAccTexture1 = createRenderTargetTexture('foamAccTexture1',
                                                     _config.ocean.sampling.foamAccumulation,
                                                     _config.world.scene,
                                                     {
                                                         generateMipMaps: false,
                                                         enableTextureFloat: true,
                                                         generateDepthBuffer: false
                                                     },
                                                     new FoamAccumulationMaterial('foamMaterial1',
                                                                                  this.material,
                                                                                  _config.world.scene),
                                                     this.material,
                                                     "passthrough");
    this.foamAccTexture1.material.textureSize = _config.ocean.sampling.foamAccumulation;
    this.foamAccTexture1.material.foamShoreTexture = this.foamShoreTexture;


    //Foam accumulation second buffer
    this.foamAccTexture2 = createRenderTargetTexture('foamAccTexture2',
                                                     _config.ocean.sampling.foamAccumulation,
                                                     _config.world.scene,
                                                     {
                                                         generateMipMaps: false,
                                                         enableTextureFloat: true,
                                                         generateDepthBuffer: false
                                                     },
                                                     new FoamAccumulationMaterial('foamMaterial2',
                                                                                  this.material,
                                                                                  _config.world.scene),
                                                     this.material,
                                                     "passthrough");
    this.foamAccTexture2.material.textureSize = _config.ocean.sampling.foamAccumulation;
    this.foamAccTexture2.material.foamShoreTexture = this.foamShoreTexture;


    this.foamAccTexture1.material.swapBufferTexture = this.foamAccTexture2;
    this.foamAccTexture2.material.swapBufferTexture = this.foamAccTexture1;


    //foam diffuse texture
    this.material.foamDiffuseTexture = new BABYLON.Texture("asset/foam.jpg",
                                                    _config.world.scene);
    this.material.foamDiffuseTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material.foamDiffuseTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;

    //Bump texture
    this.material.bumpTexture = new BABYLON.Texture("asset/water.bumpmap.png",
                                                    _config.world.scene);
    this.material.bumpTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material.bumpTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;


    //Reflection and refraction textures
    this.material.reflectionTexture = new BABYLON.MirrorTexture("waterReflexion", _config.ocean.sampling.reflection,
                                                                _config.world.scene, {generateMipMaps: false, enableTextureFloat: false});
    this.material.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, 0.);
    this.material.reflectionTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    this.material.reflectionTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
    this.material.reflectionTexture.subMeshIdList = [];
    this.material.reflectionTexture.onBeforeRender = onBeforeRenderMultiMatMesh(this.material.reflectionTexture, this.material.reflectionTexture.onBeforeRender.clone());
    this.material.reflectionTexture.onAfterRender = onAfterRenderMultiMatMesh(this.material.reflectionTexture, this.material.reflectionTexture.onAfterRender.clone());

    this.material.refractionTexture = new BABYLON.RenderTargetTexture("refraction", _config.ocean.sampling.reflection,
                                                                      _config.world.scene, {generateMipMaps: false, enableTextureFloat: false});
    this.material.refractionTexture.wrapU = BABYLON.Texture.MIRROR_ADDRESSMODE;
    this.material.refractionTexture.wrapV = BABYLON.Texture.MIRROR_ADDRESSMODE;
    this.material.refractionTexture.onBeforeRender = function () {
        var maxAmplitude = _config.ocean.dataWave.wave1.amplitude
                         + _config.ocean.dataWave.wave2.amplitude
                         + _config.ocean.dataWave.wave3.amplitude;
        BABYLON.clipPlane = new BABYLON.Plane(0, 1, 0, -maxAmplitude);
    };
    this.material.refractionTexture.onAfterRender = function () {
        BABYLON.clipPlane = null;
    };

    for (var i in this.reflectionMesh){
        this.addReflectionMesh(this.reflectionMesh[i], this.reflectionMaterial[i], true);

    }
    for (var i in this.refractionMesh){
        this.addRefractionMesh(this.refractionMesh[i], true);
    }

    //Seabed distance
    this.seabedTexture = createRenderTargetTexture('seabedTexture',
                                                   _config.ocean.sampling.seabed,
                                                   _config.world.scene,
                                                   {
                                                       generateMipMaps: false,
                                                       enableTextureFloat: true,
                                                       generateDepthBuffer: true
                                                   },
                                                   null,
                                                   this.material,
                                                   null);
    this.material.seabedTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    this.material.seabedTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
    for (var i in this.seabedMesh){
        this.addSeabedMesh(this.seabedMesh[i], this.seabedMaterial[i], true);
    }

}

Ocean.prototype.setShadowTexture = function(tex)
{
   this.shadowTexture.material.texture = tex;
   this.shadowTexture2.material.texture = tex;
}

Ocean.prototype.update = function()
{
    this.material.projectedGrid.compute(_config.world.cameraPos,
                                        _config.world.transformMat,
                                        _config.world.invTransformMat,
                                        true);


    this.material.update(_config.world.cameraPos);
}


Ocean.prototype.initMesh = function()
{
    if (this.mesh){
        for (var i in this.mesh){
            this.mesh[i].dispose(true);
        }
    }

    this.mesh = [];

    var scaling = 1.3;
    var reduction = 1.;

    var kDiv = 1.0;
    for(var k = 0.; k<1.; k+=kDiv)
    {
        var limitSubDivision = 256;
        if (_config.ocean.sampling.grid<limitSubDivision){
            this.mesh.push(createGrid("sea_"+k+"_0_0", _config.ocean.sampling.grid-1, k, k+kDiv, 0.0, 1.0,
                                           _config.world.scene, false, 1., reduction*scaling, reduction/scaling));
        }else{
            var delta = limitSubDivision/_config.ocean.sampling.grid;
            for (var i = limitSubDivision; i<=_config.ocean.sampling.grid; i+=limitSubDivision){
                for (var j = limitSubDivision; j<=_config.ocean.sampling.grid; j+=limitSubDivision){
                    var pi1 = i/_config.ocean.sampling.grid;
                    var pj1 = j/_config.ocean.sampling.grid;
                    this.mesh.push(createGrid("sea_"+k+"_"+i+"_"+j, limitSubDivision-1,
                                                   pi1-(1.-k)*delta, pi1-(1.-k-kDiv)*delta, pj1-delta, pj1,
                                                   _config.world.scene, false, 1., reduction*scaling, reduction/scaling));
                }
            }
        }
    }
    for (var i in this.mesh){
        this.mesh[i].material = new BABYLON.MultiMaterial("ocean_"+i, _config.world.scene);
        this.mesh[i].subMeshes = [];
        addMaterialToMesh(this.material, this.mesh[i], true, false);
        this.mesh[i].isInFrustum = function(){return true;};
    }

    if (this.shadowRendering)
    {
        this.enableShadowRendering();
    }

}

Ocean.prototype.setSampling = function(val)
{
    _config.ocean.sampling = val;
    this.initMesh();
    this.initMaterials();
}

Ocean.prototype.enableShadowRendering = function(shadowTexture)
{
    this.shadowRendering = true;
    for (var i in this.mesh){
        this.mesh[i].receiveShadows = true;
    }
    this.material.shadowTexture = shadowTexture;
}

Ocean.prototype.addSeabedMesh = function(mesh, material, dontStore)
{
    assert(function(){return mesh instanceof BABYLON.Mesh;}, 'mesh is not a BABYLON.Mesh');

    onReady(mesh, function(){
        this.material.seabedTexture.renderList.push(mesh);

        convertIntoMultiMaterialMesh(mesh, _config.world.scene);

        addMaterialToMesh(material, mesh, true, true);

        this.material.seabedTexture.subMeshIdList.push(mesh.subMeshes.length-1);

        if (!dontStore){
            this.seabedMesh.push(mesh);
            this.seabedMaterial.push(material);
        }
    }.bind(this));
}

Ocean.prototype.addSkyTexture = function(skyTexture)
{
    this.material.skyTexture = skyTexture;
}

Ocean.prototype.addCloudTexture = function(cloudTexture)
{
    this.material.cloudTexture = cloudTexture;
}

Ocean.prototype.addReflectionMesh = function(mesh, material, dontStore)
{
    assert(function(){return mesh instanceof BABYLON.Mesh;}, 'mesh is not a BABYLON.Mesh');

    onReady(mesh, function(){
        this.material.reflectionTexture.renderList.push(mesh);

        convertIntoMultiMaterialMesh(mesh, _config.world.scene);

        addMaterialToMesh(material, mesh, true, true);

        this.material.reflectionTexture.subMeshIdList.push(mesh.subMeshes.length-1);

        if (!dontStore){
            this.reflectionMesh.push(mesh);
            this.reflectionMaterial.push(material);
        }
    }.bind(this));
}

Ocean.prototype.addRefractionMesh = function(mesh, dontStore)
{
    assert(function(){return mesh instanceof BABYLON.Mesh;}, 'mesh is not a BABYLON.Mesh');

    this.material.refractionTexture.renderList.push(mesh);

    if (!dontStore){
        this.refractionMesh.push(mesh);
    }
}

Ocean.prototype.addCollisionMesh = function(mesh, material, dontStore)
{
    assert(function(){return mesh instanceof BABYLON.Mesh;}, 'mesh is not a BABYLON.Mesh');

    onReady(mesh, function(){
        this.material.foamShoreTexture.renderList.push(mesh);

        convertIntoMultiMaterialMesh(mesh, _config.world.scene);

       addMaterialToMesh(material, mesh, true, true);

        this.material.foamShoreTexture.subMeshIdList.push(mesh.subMeshes.length-1);

        if (!dontStore){
            this.foamShoreMesh.push(mesh);
            this.foamShoreMaterial.push(material);
        }
    }.bind(this));

}



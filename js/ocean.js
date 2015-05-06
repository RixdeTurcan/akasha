function Ocean(){

    this.loaded = false;
    this.loading = false;
    this.loaderCallback = function(){};
    this.loadingCallback = function(){};
    this.nbTextureToLoad = 1;
    this.nbTextureLoaded = 0;
    this.textureLoaded = false;
    this.gridMeshLoaded = false;
    this.loadingPercent = 0;
}

Ocean.prototype.load = function(loaderCallback, loadingCallback){
    this.loaderCallback = loaderCallback;
    this.loadingCallback = loadingCallback;

    var loadingFullCallback = function(percent){
        loadingCallback(percent);
        if (this.gridMeshLoaded && this.textureLoaded && this.loading){
            this.loading = false;
            loaderCallback();
        }
    }.bind(this);

    this.material = new OceanMaterial("OceanMaterial", _config.world.scene, this);

    this.nbQuadrant = 40;
    this.meshToDisplay = 0;

    //Grid
    this.mesh = [];
    this.grid = new Grid(512, 256);
    this.grid.createGrid(80., 125, 125, 2, 1);
    this.beta = [];

    var oceanFunc = function(i){
        var beta = 2.*_pi*i/this.nbQuadrant;
        var betaRange = _pi/5;

        this.grid.clip(beta+_pi, betaRange, -1150., 1050.);
        this.mesh[i] = this.grid.makeClippedMesh("ocean"+i, _config.world.scene);

        this.mesh[i].material = new BABYLON.MultiMaterial("oceanMultiMat", _config.world.scene);
        this.mesh[i].subMeshes = [];
        addMaterialToMesh(this.material, this.mesh[i], false, false);
        this.mesh[i].isInFrustum = function(){return true;};
        this.mesh[i].subMeshes[0].isInFrustum = function(){return true;};
        this.mesh[i].subMeshes[0].isHiddenScreen = true;
        setMeshRenderPriority(this.mesh[i], 2);

        this.beta[i] = beta+_pi;

        this.loadingPercent += 0.5/this.nbQuadrant;

        if (i<this.nbQuadrant){
            setTimeout(function(){
                oceanFunc(i+1);
            }.bind(this), 10);
        }else{
            this.gridMeshLoaded = true;
        }

        loadingFullCallback(this.loadingPercent);
    }.bind(this);
    oceanFunc(0);




    var loadingFunction = function(){
        this.nbTextureLoaded++;
        this.loadingPercent += 0.5/this.nbTextureToLoad;
        if (this.nbTextureLoaded>=this.nbTextureToLoad){
            this.textureLoaded = true;
        }
        loadingFullCallback(this.loadingPercent);
    }.bind(this);
    loadingFunction();

    this.loaded = true;
    this.loading = true;
}


Ocean.prototype.addSkyTexture = function(skyTexture)
{
    this.material.skyTexture = skyTexture;
}

Ocean.prototype.addSeabedTexture = function(seabedTexture)
{
    this.material.seabedTexture = seabedTexture;
}

Ocean.prototype.addGroundHeightTexture = function(groundHeightTexture)
{
    this.material.groundHeightTexture = groundHeightTexture;
}

Ocean.prototype.update = function()
{
    if (!this.loaded){return;}

    if (this.gridMeshLoaded){
        this.mesh[this.meshToDisplay].subMeshes[0].isHiddenScreen = true;

        this.meshToDisplay = Math.round((_config.player.angle.mod(2.*_pi))/(2.*_pi/this.nbQuadrant)).mod(this.nbQuadrant);

        this.mesh[this.meshToDisplay].subMeshes[0].isHiddenScreen = false;
    }
}

function SpriteGenerator(dir, name, size){
    this.loaderCallback = function(){};
    this.loadingCallback = function(){};

    this.name = name;
    this.dir = dir;

    this.size = size;
    this.nbRows = 8;

    this.tex = null;

    this.loadingPercent = 0.;
    this.loaded = false;
    this.impostorTexRendering = false;
    this.meshLoaded = false;
    this.loading = false;
}

SpriteGenerator.prototype.load = function(loaderCallback, loadingCallback){
    this.loaderCallback = loaderCallback;
    this.loadingCallback = loadingCallback;

    this.tex = createImpostorTextures(this.dir, this.name, this.size, this.nbRows, this.nbRows, {treeTextures: {}},
                                      _config.world.scene, function(){
                                          this.loadingPercent += 0.2;
                                          loadingCallback(this.loadingPercent);
                                          this.meshLoaded = true;
                                      }.bind(this));


    this.loaded = true;
    this.loading = true;
}

SpriteGenerator.prototype.update = function()
{
    if (!this.loaded){return;}
    if (this.loading){
        this.loading = false;
        this.loaderCallback();
    }
    if (this.meshLoaded){
        if (!this.impostorTexRendering){
            _config.world.scene.customRenderTargets.push(this.tex.colorMap);
            _config.world.scene.customRenderTargets.push(this.tex.normalMap);

            this.impostorTexRendering = true;
        }else{
            _config.world.scene.customRenderTargets = [];
        }
    }

}

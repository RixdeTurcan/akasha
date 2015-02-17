function SpriteGenerator(){
    this.loaderCallback = function(){};
    this.loadingCallback = function(){};

    this.loaded = false;
    this.loading = false;
}

SpriteGenerator.prototype.load = function(loaderCallback, loadingCallback){
    this.loaderCallback = loaderCallback;
    this.loadingCallback = loadingCallback;

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
}

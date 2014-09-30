function World($canvas){
    assert(function(){return $canvas instanceof $;}, '$canvas is not a jquery object');
    assert(function(){return $canvas[0].tagName == "CANVAS";}, '$canvas is not a Canvas');

    this.$canvas = $canvas;
    this.canvas = this.$canvas[0];
    _config.world.canvas = this.canvas;

    this.$canvas.css({width: _config.world.canvasWidth+'px', height: _config.world.canvasHeight +'px'});

    this.engine = new BABYLON.Engine(this.canvas, true, {});
    this.scene = new BABYLON.Scene(this.engine);
    _config.world.scene = this.scene;

    _getError = function(){
        for (var p in this.engine._compiledEffects)
            console.log(this.engine._compiledEffects[p].name+': '+this.engine._compiledEffects[p]._compilationError);
    }.bind(this);
    _gl = this.engine._gl;

    this.scene.clearColor = new BABYLON.Color3(0, 0, 0);

    this.scene.fogMode = _config.world.fogMode;
    this.scene.fogDensity = _config.world.fogDensity;

    this.isRendering = false;
    this.preProcess = function(){};

    this.date = Date.now();

}

World.prototype.update = function(){
    this.scene.setTransformMatrix(this.scene.activeCamera.getViewMatrix(),
                                  this.scene.activeCamera.getProjectionMatrix());

    _config.world.cameraPos = this.scene.activeCamera.position;

    _config.world.realCameraPos = _config.world.cameraPos .add(_config.player.position);

    _config.world.transformMat = this.scene.getTransformMatrix();

    _config.world.invTransformMat = _config.world.transformMat.clone();
    _config.world.invTransformMat.invert();

    _config.world.viewMat = this.scene.getViewMatrix();
}

World.prototype.renderLoop = function(){
    var date = Date.now();
    var delta = date - this.date;
    if (delta > _config.world.periodMs){
        _logger.reset();
        _logger.start('main loop');
        this.engine.beginFrame();
        this.preProcess();
        this.scene.render();
        this.engine.endFrame();

        _logger.end('main loop', true);

        this.date = date;// - (delta % this.fpsInterval);
    }

    if(this.isRendering){
        BABYLON.Tools.QueueNewFrame(this.renderLoop.bind(this));
    }

};

World.prototype.startRendering = function(preProcess){
    this.data = Date.now();

    if (preProcess == null) {
        preProcess = function(){};
    }
    if ($.isFunction(preProcess)) {
        this.preProcess = preProcess;
    }else{
        warning('preProcess is not a function');
    }

    if (!this.isRendering){
        this.isRendering = true;
        BABYLON.Tools.QueueNewFrame(this.renderLoop.bind(this));
    }
}

World.prototype.stopRendering = function(){
    this.isRendering = false;
}


function Test(number)
{
    this.RTTPrinterSize = 256;
    this.RTTBinded = false;

    this.skytest = {};
    this.addTest('Sky', 1);
    this.addTest('Cloud', 2);
    this.addTest('Ground', 3);
    this.addTest('Water', 4);


    this.startTest(number);

}

Test.prototype.addTest = function(name, num){

    _$body.append('<a id="test'+num+'" type="submit" href="index.php?num='+num+'">'+name+'</a>');
    $('#test'+num).button();

}

Test.prototype.startTest = function(num){
    if (num == 1){
      this.startSkyTest();
    }else if (num == 2){
      this.startCloudTest();
    }else if (num == 3){
      this.startGroundTest();
    }else if (num == 4){
      this.startWaterTest();
    }
}

Test.prototype.startWaterTest = function(){

    //Build the world
    this.skytest.world = new World($('#canvas'));
    this.skytest.camera = new Camera(CameraType_ArcRotate, new BABYLON.Vector3(0, 150, 0));
    this.skytest.player = new Player(this.skytest.camera);

    this.skytest.camera.activate();
    this.skytest.camera.enableControl();

    //Add a sky
    this.skytest.sky = new Sky(this.skytest.camera, true);


    //Add a wireframe grid ground
    this.skytest.groundWire = new BABYLON.Mesh.CreateGround("groundWire", 20000, 20000, 255,
                                                       this.skytest.world.scene, false);
    this.skytest.groundWire.dontLog = true;
    this.skytest.groundWire.material = new BABYLON.StandardMaterial("groundWireMat",
                                                                this.skytest.world.scene);
    this.skytest.groundWire.material.wireframe = true;
    this.skytest.groundWire.material.alpha = 0.2;
    this.skytest.groundWire.material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    this.skytest.groundWire.material.specularColor = new BABYLON.Color3(0.0, 0.0, 0.0);


    //Add the ground
    this.skytest.ground = new Ground(this.skytest.camera, this.skytest.sky.light);
    this.skytest.ground.addSkyTexture(this.skytest.sky.renderTexture);

    //Add the water
    this.skytest.ocean = new Ocean(this.skytest.camera);
    //this.skytest.ocean.addReflectionMesh(this.skytest.ground.meshLowDef, this.skytest.ground.reflectionMaterial);

    //this.skytest.ocean.addRefractionMesh(this.skytest.ground.meshLowDefRefraction);

    //this.skytest.ocean.addSeabedMesh(this.skytest.ground.meshLowDef, this.skytest.ground.seabedMaterial);

    //this.skytest.ocean.addCollisionMesh(this.skytest.ground.meshLowDef, this.skytest.ground.foamShoreMaterial);

    this.skytest.ocean.addSkyTexture(this.skytest.sky.renderTexture);
    this.skytest.ocean.addCloudTexture(this.skytest.sky.cloudSunDepthTexture3);


    //Add control panel
    this.createSkyTestControlPanel();
    this.createSkyTestProfiler();
    this.createGroundTestRTTPrinter();

    //Render loop
    this.skytest.world.startRendering(function(){
        this.skytest.player.update();
        this.skytest.camera.update();
        this.skytest.world.update();
        this.skytest.sky.update();
        this.skytest.ground.update();
        this.skytest.ocean.update();

        this.printRTT(this.rttTextureToRender);


        if (this.skytest.world.scene.getAnimationRatio()){
            _config.dt = 0.01 * this.skytest.world.scene.getAnimationRatio();
            _config.time += _config.dt;
            _config.step += 1;
        }

    }.bind(this));
}

Test.prototype.startGroundTest = function(){

    //Build the world
    this.skytest.world = new World($('#canvas'));
    this.skytest.camera = new Camera(CameraType_ArcRotate, new BABYLON.Vector3(0, 150, 0));
    this.skytest.player = new Player(this.skytest.camera);

    this.skytest.camera.activate();
    this.skytest.camera.enableControl();

    //Add a sky
    this.skytest.sky = new Sky(this.skytest.camera, true);


    //Add a wireframe grid ground
    this.skytest.groundWire = new BABYLON.Mesh.CreateGround("groundWire", 20000, 20000, 255,
                                                       this.skytest.world.scene, false);
    this.skytest.groundWire.dontLog = true;
    this.skytest.groundWire.material = new BABYLON.StandardMaterial("groundWireMat",
                                                                this.skytest.world.scene);
    this.skytest.groundWire.material.wireframe = true;
    this.skytest.groundWire.material.alpha = 0.2;
    this.skytest.groundWire.material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    this.skytest.groundWire.material.specularColor = new BABYLON.Color3(0.0, 0.0, 0.0);


    //Add the ground
    this.skytest.ground = new Ground(this.skytest.camera, this.skytest.sky.light);
    this.skytest.ground.addSkyTexture(this.skytest.sky.renderTexture);

    //Add control panel
    this.createSkyTestControlPanel();
    this.createSkyTestProfiler();
    this.createGroundTestRTTPrinter();

    //Render loop
    this.skytest.world.startRendering(function(){
        this.skytest.player.update();
        this.skytest.camera.update();
        this.skytest.world.update();
        this.skytest.sky.update();
        this.skytest.ground.update();

        this.printRTT(this.rttTextureToRender);


        if (this.skytest.world.scene.getAnimationRatio()){
            _config.dt = 0.01 * this.skytest.world.scene.getAnimationRatio();
            _config.time += _config.dt;
            _config.step += 1;
        }

    }.bind(this));
}

Test.prototype.startCloudTest = function(){

    //Build the world
    this.skytest.world = new World($('#canvas'));
    this.skytest.camera = new Camera(CameraType_ArcRotate, new BABYLON.Vector3(0, 150, 0));
    this.skytest.player = new Player(this.skytest.camera);

    this.skytest.camera.activate();
    this.skytest.camera.enableControl();

    //Add a sky
    this.skytest.sky = new Sky(this.skytest.camera, true);


    //Add a wireframe grid ground
    this.skytest.ground = new BABYLON.Mesh.CreateGround("ground", 20000, 20000, 255,
                                                       this.skytest.world.scene, false);
    this.skytest.ground.dontLog = true;
    this.skytest.ground.material = new BABYLON.StandardMaterial("groundMat",
                                                                this.skytest.world.scene);
    this.skytest.ground.material.wireframe = true;
    this.skytest.ground.material.alpha = 0.2;
    this.skytest.ground.material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    this.skytest.ground.material.specularColor = new BABYLON.Color3(0.0, 0.0, 0.0);

    //Add control panel
    this.createSkyTestControlPanel();
    this.createSkyTestProfiler();
    this.createCloudTestRTTPrinter();

    //Render loop
    this.skytest.world.startRendering(function(){
        this.skytest.player.update();
        this.skytest.camera.update();
        this.skytest.world.update();
        this.skytest.sky.update();

        this.printRTT(this.rttTextureToRender);


        if (this.skytest.world.scene.getAnimationRatio()){
            _config.dt = 0.01 * this.skytest.world.scene.getAnimationRatio();
            _config.time += _config.dt;
            _config.step += 1;
        }

    }.bind(this));
}

Test.prototype.startSkyTest = function(){

    //Build the world
    this.skytest.world = new World($('#canvas'));
    this.skytest.camera = new Camera(CameraType_ArcRotate, new BABYLON.Vector3(0, 150, 0));
    this.skytest.player = new Player(this.skytest.camera);

    this.skytest.camera.activate();
    this.skytest.camera.enableControl();

    //Add a sky
    this.skytest.sky = new Sky(this.skytest.camera);


    //Add a wireframe grid ground
    this.skytest.ground = new BABYLON.Mesh.CreateGround("ground", 20000, 20000, 255,
                                                       this.skytest.world.scene, false);
    this.skytest.ground.dontLog = true;
    this.skytest.ground.material = new BABYLON.StandardMaterial("groundMat",
                                                                this.skytest.world.scene);
    this.skytest.ground.material.wireframe = true;
    this.skytest.ground.material.alpha = 0.2;
    this.skytest.ground.material.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
    this.skytest.ground.material.specularColor = new BABYLON.Color3(0.0, 0.0, 0.0);

    //Add control panel
    this.createSkyTestControlPanel();
    this.createSkyTestProfiler();
    this.createSkyTestRTTPrinter();

    //Render loop
    this.skytest.world.startRendering(function(){
        this.skytest.player.update();
        this.skytest.camera.update();
        this.skytest.world.update();
        this.skytest.sky.update();

        this.printRTT(this.rttTextureToRender);


        if (this.skytest.world.scene.getAnimationRatio()){
            _config.dt = 0.01 * this.skytest.world.scene.getAnimationRatio();
            _config.time += _config.dt;
            _config.step += 1;
        }

    }.bind(this));
}

Test.prototype.createSkyTestProfiler = function(){
    this.initProfiler();
    this.startControlPanel(this.$profiler);

    this.$profilerButton.click(function(){
        if (_showFps){
            this.$profilerButton.prop("value", 'Profile');
        }else{
            this.$profilerButton.prop("value", 'Stop profiling');
        }
        _showFps = !_showFps;
    }.bind(this));
}

Test.prototype.createGroundTestRTTPrinter = function(){
    this.initRTTPrinter();
    this.initControlPanelSection(this.$rttPanel, this.$rttTitle, 'None');
    this.initControlPanelSection(this.$rttPanel, this.$rttTitle, 'ColorMap');
    this.initControlPanelSection(this.$rttPanel, this.$rttTitle, 'NormalMap');
    this.startControlPanel(this.$rttPanel);

    var f = function(name){
        this.RTTBinded = true;
        if (name=="ColorMap"){
            this.rttTextureToRender.material.texture = this.skytest.ground.treeTex['Eucalyptus'].colorMipmap;
        }else if (name=="NormalMap"){
            this.rttTextureToRender.material.texture = this.skytest.ground.treeTex['Eucalyptus'].normalMipmap;
        }else{
            this.rttTextureToRender.material.texture = null;
            this.RTTBinded = false;
        }
    }.bind(this)

    this.$rttPanel.on("tabsactivate", function(e, ui){
        f(ui.newTab.children().html());
    });
    f("None");
}

Test.prototype.createCloudTestRTTPrinter = function(){
    this.initRTTPrinter();
    this.initControlPanelSection(this.$rttPanel, this.$rttTitle, 'Cloudheight');
    this.initControlPanelSection(this.$rttPanel, this.$rttTitle, 'Clouddepth');
    this.initControlPanelSection(this.$rttPanel, this.$rttTitle, 'Skycolor');
    this.initControlPanelSection(this.$rttPanel, this.$rttTitle, 'None');
    this.startControlPanel(this.$rttPanel);

    var f = function(name){
        this.RTTBinded = true;
        if (name=="Cloudheight"){
            this.rttTextureToRender.material.texture = this.skytest.sky.cloudHeightTexture3;
        }else if (name=="Clouddepth"){
            this.rttTextureToRender.material.texture = this.skytest.sky.cloudSunDepthTexture3;
        }else if (name=="Skycolor"){
            this.rttTextureToRender.material.texture = this.skytest.sky.renderTexture;
        }else{
            this.rttTextureToRender.material.texture = null;
            this.RTTBinded = false;
        }
    }.bind(this)

    this.$rttPanel.on("tabsactivate", function(e, ui){
        f(ui.newTab.children().html());
    });
    f("Cloudheight");
}

Test.prototype.createSkyTestRTTPrinter = function(){
    this.initRTTPrinter();
    this.initControlPanelSection(this.$rttPanel, this.$rttTitle, 'Sky color');
    this.initControlPanelSection(this.$rttPanel, this.$rttTitle, 'None');
    this.startControlPanel(this.$rttPanel);

    var f = function(name){
        this.RTTBinded = true;
        if (name=="Sky color"){
            this.rttTextureToRender.material.texture = this.skytest.sky.renderTexture;
        }else{
            this.rttTextureToRender.material.texture = null;
            this.RTTBinded = false;
        }
    }.bind(this)

    this.$rttPanel.on("tabsactivate", function(e, ui){
        f(ui.newTab.children().html());
    });
    f("Sky color");
}

Test.prototype.createSkyTestControlPanel = function(){
    this.initControlPanel();
    this.skySection = this.initControlPanelSection(this.$controlpanel, this.$controlpanelTitle, 'Sky');
    this.$sunCategory = this.initControlPanelCategory(this.skySection, 'Sun');

    var updateSunDir = function(theta, phi){
        _config.sky.params.sunDir.y = Math.cos(phi);
        _config.sky.params.sunDir.x = Math.sin(phi)*Math.cos(theta);
        _config.sky.params.sunDir.z = Math.sin(phi)*Math.sin(theta);
    }

    this.ControlPanelAddSliderFunc(this.$sunCategory, 'Sun Phi',
                                   'sunPhi', 'waterControl', 'waterControlName',
                                   'waterControlValue', 'waterControlSlider',
                                   Math.floor(Math.acos(_config.sky.params.sunDir.y / _config.sky.params.sunDir.length())*_toDeg),
                                   (function(that){
                                       return function(e, ui){
                                           $('#sunPhiVal').html(ui.value);
                                           updateSunDir(parseInt($('#sunThetaVal').html())*_toRad, ui.value*_toRad);
                                       };
                                   })(this),
                                   0, 359, 0.05);

    this.ControlPanelAddSliderFunc(this.$sunCategory, 'Sun Theta',
                                   'sunTheta', 'waterControl', 'waterControlName',
                                   'waterControlValue', 'waterControlSlider',
                                   Math.floor(360+Math.atan2(_config.sky.params.sunDir.z, _config.sky.params.sunDir.x)*_toDeg),
                                   (function(that){
                                       return function(e, ui){
                                           $('#sunThetaVal').html(ui.value);
                                           updateSunDir(ui.value*_toRad, parseInt($('#sunPhiVal').html())*_toRad);
                                       };
                                   })(this),
                                   0, 359, 0.1);

    this.startControlPanelSection(this.skySection);
    this.startControlPanel(this.$controlpanel);
}






Test.prototype.initProfiler = function(){
    _$body.append('<div id="profiler" class="controlpanelBlock">\
                     <ul></ul>\
                     <div></div>\
                     \
                   </div>\
                   ');
    this.$profiler = $('#profiler');
    this.$profilerTitle = $('#profiler ul');
    this.$profilerResult = $('#profiler div');
    this.initControlPanelSection(this.$profiler, this.$profilerTitle, 'profile', '<input type="submit" value="Profile">');
    this.$profilerButton = $('#profiler ul input');

    this.$profilerButton.button();
    _profilerOutput = this.$profilerResult;


}
Test.prototype.initRTTPrinter = function(){
    _$body.append('<div id="rttprinter" class="controlpanelBlock">\
                     <ul></ul>\
                     <canvas class="controlpanelBlock" id="rttcanvas"></canvas>\
                   </div>\
                   ');
    this.$rttPanel = $('#rttprinter');
    this.$rttTitle = $('#rttprinter ul');
    this.$rttcanvas = $('#rttcanvas');
    this.$rttcanvas.css({width: this.RTTPrinterSize+'px', height: this.RTTPrinterSize+'px'});
    this.$rttcanvas[0].width = this.RTTPrinterSize;
    this.$rttcanvas[0].height = this.RTTPrinterSize;
    this.rttCtx = this.$rttcanvas[0].getContext("2d");

    this.rttTextureToRender = new BABYLON.RenderTargetTexture("RTTTEx", this.RTTPrinterSize,
                                                              _config.world.scene, false);
    this.rttTextureToRender.material = new CopyMaterial("RTTMaterial", _config.world.scene);
    this.rttMesh1 = createVertexPassthroughMesh(this.rttTextureToRender.material,
                                               _config.world.scene,
                                               true, false);
    this.rttTextureToRender.renderList.push(this.rttMesh1);
    this.rttTextureToRender.onBeforeRender = function () {
        this.renderList[0].subMeshes[0].isHidden = false;
    };
    this.rttTextureToRender.onAfterRender = function () {
        this.renderList[0].subMeshes[0].isHidden = true;
    };
    this.rttMesh2 = createVertexPassthroughMesh(new BABYLON.StandardMaterial("rttMat",
                                                                            this.skytest.world.scene),
                                               this.skytest.world.scene,
                                               false,
                                               true);
    this.rttMesh2.material.reflectionTexture = this.rttTextureToRender;

    this.rttMesh1.dontLog = true;
    this.rttMesh2.dontLog = true;

}


Test.prototype.printRTT = function(tex){
    if (this.RTTBinded){
        var texture = tex.getInternalTexture();
        var gl = _gl;
        // Create a framebuffer backed by the texture
        var framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        // Read the contents of the framebuffer
        var data = new Uint8Array(this.RTTPrinterSize * this.RTTPrinterSize * 4);
        gl.readPixels(0, 0, this.RTTPrinterSize, this.RTTPrinterSize, gl.RGBA, gl.UNSIGNED_BYTE, data);

        gl.deleteFramebuffer(framebuffer);

        var imageData = this.rttCtx.createImageData(this.RTTPrinterSize, this.RTTPrinterSize);
        imageData.data.set(data);
        this.rttCtx.putImageData(imageData, 0, 0);
        this.rttIsFilled = false;
    }else{
        if (!this.rttIsFilled){
            this.rttCtx.fillRect(0, 0, this.RTTPrinterSize, this.RTTPrinterSize);
            this.rttIsFilled = true;
        }
    }
}

Test.prototype.initTestPanel = function(){
    _$body.append('<div id="testpanel" class="controlpanelBlock">\
                     <ul></ul>\
                   </div>');
    this.$testpanel = $('#testpanel');
    this.$testpanelTitle = $('#testpanel ul');

}


Test.prototype.initControlPanel = function(){
    _$body.append('<div id="controlpanel" class="controlpanelBlock">\
                     <ul></ul>\
                   </div>');
    this.$controlpanel = $('#controlpanel');
    this.$controlpanelTitle = $('#controlpanel ul');

}

Test.prototype.initControlPanelSection = function($panel, $title, name, nameVisu){
    if (!nameVisu){
        nameVisu = name;
    }
    $panel.append('\
        <div id="'+name+'Accordion"  class="controlpanelFont">\
          <ul></ul>\
        </div>');
    $title.append('<li><a href="#'+name+'Accordion">'+nameVisu+'</a></li>');

    var elems = {
        $accordion: $('#'+name+'Accordion'),
        $title: $('#'+name+'Accordion ul')
    };

    return elems;
}

Test.prototype.initControlPanelCategory = function(section, name){
    section.$title.append('<li><a href="#skyControl'+name+'Category">'+name+'</a></li>');

    section.$accordion.append('\
        <div id="skyControl'+name+'Category">\
        </div>\
    ');

    return $('#skyControl'+name+'Category');
}



Test.prototype.startControlPanel = function($panel){
    $panel.tabs({
        event: 'click hoverintent',
        heightStyle: 'content'
    });
}

Test.prototype.startControlPanelSection = function(section){
    section.$accordion.tabs({
        event: 'click hoverintent',
        heightStyle: 'content'
    });
}



Test.prototype.ControlPanelAddSlider = function($elem, name, id, globalClass, className, classVal, classSlider,
                                                valueArray, valueName,
                                                sliderMin, sliderMax, sliderStep)
{
    this.ControlPanelAddSliderFunc($elem, name, id, globalClass, className, classVal, classSlider,
                                   valueArray[valueName],
                                   function(e, ui){
                                       $('#'+id+'Val').html(ui.value);
                                       valueArray[valueName] = ui.value;
                                   }.bind(this),
                                   sliderMin, sliderMax, sliderStep);
}

Test.prototype.ControlPanelAddSliderFunc = function($elem, name, id, globalClass, className, classVal, classSlider,
                                                    initVal, slideFunction,
                                                    sliderMin, sliderMax, sliderStep)
{
    this.ControlPanelAddSliderFunc2($elem, name, id, globalClass, className, classVal, classSlider,
                                    initVal, initVal, slideFunction,
                                    sliderMin, sliderMax, sliderStep)
}

Test.prototype.ControlPanelAddSliderFunc2 = function($elem, name, id, globalClass, className, classVal, classSlider,
                                                     initValSlider, initValVal, slideFunction,
                                                     sliderMin, sliderMax, sliderStep)
{
    $elem.append('\
            <div class="'+globalClass+' '+className+'">'+name+':</div>\
            <div id="'+id+'Val" class="'+globalClass+' '+classVal+'"></div>\
            <div id="'+id+'Slider" class="'+globalClass+' '+classSlider+'"></div>\
    ');

    $('#'+id+'Slider').slider({
                                  orientation: "horizontal",
                                  range: "min",
                                  min: sliderMin,
                                  max: sliderMax,
                                  step: sliderStep,
                                  value: initValSlider,
                                  slide: slideFunction
                              });
    $('#'+id+'Val').html(initValVal);
}

_$document.ready(function(){
    _$body = $('body');
    if (BABYLON.Engine.isSupported()) {

        var test = new Test(parseInt($('#testNumber').html()));
        /*

        var world = new World($('#canvas'));

        var camera = new Camera(CameraType_ArcRotate, new BABYLON.Vector3(0, 150, 0));
        var player = new Player(camera);

        var ocean = new Ocean(camera);

        var sky = new Sky(camera);

        var ground = new Ground(camera, sky.light);

        var vegetation = new Vegetation(camera);

        var controlPanel = new Controlpanel(camera, ocean, sky);
        var postProcess = new BABYLON.FxaaPostProcess("fxaa", 1., camera.camera,
                                                      BABYLON.Texture.NEAREST_SAMPLINGMODE,
                                                      world.engine, true);

        camera.activate();
        camera.enableControl();

        ground.addWavedataTexture(ocean.waveDataTexture);

        ocean.addReflectionMesh(ground.meshLowDef, ground.reflectionMaterial);

        ocean.addRefractionMesh(ground.meshLowDefRefraction);

        ocean.addSeabedMesh(ground.meshLowDef, ground.seabedMaterial);

        ocean.addCollisionMesh(ground.meshLowDef, ground.foamShoreMaterial);

        ocean.addSkyTexture(sky.renderTexture);
        ocean.addCloudTexture(sky.cloudSunDepthTexture3);
        ground.addSkyTexture(sky.renderTexture);
        vegetation.addSkyTexture(sky.renderTexture);

        ocean.enableShadowRendering(ground.shadowTexture);

        vegetation.addGroundHeightTexture(ground.heightTexture);

        world.startRendering(function(){
            player.update();
            camera.update();
            world.update();
            controlPanel.update();
            ocean.update();
            ground.update();
            vegetation.update();
            sky.update();

            if (world.scene.getAnimationRatio()){
                _config.dt = 0.01 * world.scene.getAnimationRatio();
                _config.time += _config.dt;
                _config.step += 1;
            }

        });
        */
    }
});

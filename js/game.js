_$document.ready(function(){
    _$body = $('body');
    if (BABYLON.Engine.isSupported()) {
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
    }
});

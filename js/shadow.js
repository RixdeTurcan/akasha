function Shadow(light, size){
    assert(function(){return light instanceof Light;}, 'light is not a Light');

    this.light = light;
    this.size = size;
    this.shadow = new BABYLON.ShadowGenerator(this.size, this.light.light);

    this.shadow.useVarianceShadowMap = false;
    this.shadow._darkness = 0.5;

    this.shadow._shadowMap.dispose();
    this.shadow._shadowMap = new BABYLON.RenderTargetTexture(
             this.light.light.name + "_shadowMap",
             this.size,
             this.light.light.getScene(),
             {generateMipMaps: false, enableTextureFloat: true});
    this.shadow._shadowMap.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    this.shadow._shadowMap.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
    this.shadow._shadowMap.renderParticles = false;

    var that = this.shadow;
    var otherThat = this;

    var renderSubMesh = function (subMesh) {
        var _this = that;
        var mesh = subMesh.getRenderingMesh();
        var scene = _this._scene;
        var engine = scene.getEngine();

        _logger.start("shadowMap"); //+++

        // Culling
        engine.setState(subMesh.getMaterial().backFaceCulling);

        // Managing instances
        var batch = mesh._getInstancesRenderList();

        if (batch.mustReturn) {
            return;
        }

        var hardwareInstancedRendering = (engine.getCaps().instancedArrays !== null) && (batch.visibleInstances !== null);

        if (_this.isReady(mesh, hardwareInstancedRendering)) {
            engine.enableEffect(_this._effect);
            mesh._bind(subMesh, _this._effect, false);

            //Compute transformMatrix

            _this._effect.setMatrix("viewProjection", _this.getTransformMatrix());

            // Alpha test
            if (mesh.material && mesh.material.needAlphaTesting()) {
                var alphaTexture = mesh.material.getAlphaTestTexture();
                _this._effect.setTexture("diffuseSampler", alphaTexture);
                _this._effect.setMatrix("diffuseMatrix", alphaTexture.getTextureMatrix());
            }

            // Bones
            var useBones = mesh.skeleton && mesh.isVerticesDataPresent(BABYLON.VertexBuffer.MatricesIndicesKind) && mesh.isVerticesDataPresent(BABYLON.VertexBuffer.MatricesWeightsKind);

            if (useBones) {
                _this._effect.setMatrices("mBones", mesh.skeleton.getTransformMatrices());
            }

            if (hardwareInstancedRendering) {
                mesh._renderWithInstances(subMesh, false, batch, _this._effect, engine);
            } else {
                if (batch.renderSelf) {
                    _this._effect.setMatrix("world", mesh.getWorldMatrix());

                    // Draw
                    mesh._draw(subMesh, true);
                }

                if (batch.visibleInstances) {
                    for (var instanceIndex = 0; instanceIndex < batch.visibleInstances.length; instanceIndex++) {
                        var instance = batch.visibleInstances[instanceIndex];

                        _this._effect.setMatrix("world", instance.getWorldMatrix());

                        // Draw
                        mesh._draw(subMesh, true);
                    }
                }
            }
        } else {
            // Need to reset refresh rate of the shadowMap
            _this._shadowMap.resetRefreshCounter();
        }

        _logger.end("shadowMap", true); //+++
    };

    this.shadow.getTransformMatrix = function(first){

        var mat = computeOrthoTransformMatrix(_config.player.position.mod(500.).scale(-1),
                                              otherThat.light.light.direction,
                                               2000.,
                                               2000.,
                                               2000.);

        if (first){
        if (this.lastPlayerPos){
            this.deltaPlayerPos = _config.player.position.subtract(this.lastPlayerPos);
        }
        this.lastPlayerPos = _config.player.position.clone();
        if (this.deltaPlayerPos && this.mat){
            _config.player.deltaShadowUv = BABYLON.Vector3.TransformCoordinates(this.deltaPlayerPos, this.mat).scale(0.5);
        }
        this.mat = mat;
        }
        return mat;

    }

    this.shadow._shadowMap.customRenderFunction = function (opaqueSubMeshes, alphaTestSubMeshes, transparentSubMeshes) {
        var index;

        for (index = 0; index < opaqueSubMeshes.length; index++) {
            renderSubMesh(opaqueSubMeshes.data[index]);
        }

        for (index = 0; index < alphaTestSubMeshes.length; index++) {
            renderSubMesh(alphaTestSubMeshes.data[index]);
        }

        if (that._transparencyShadow) {
            for (index = 0; index < transparentSubMeshes.length; index++) {
                renderSubMesh(transparentSubMeshes.data[index]);
            }
        }
    };

}

Shadow.prototype.addMesh = function(mesh){
    assert(function(){return mesh instanceof BABYLON.Mesh;}, 'mesh is not a BABYLON.Mesh');

    this.shadow.getShadowMap().renderList.push(mesh);
}




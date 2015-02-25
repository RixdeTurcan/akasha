BABYLON.SubMesh.prototype.render = function () {
    if (!this._mesh.dontLog){
        _logger.start(this._mesh.name+' '+this.getMaterial().name);
    }
    this._renderingMesh.render(this);
    if (!this._mesh.dontLog){
        _logger.end(this._mesh.name+' '+this.getMaterial().name, true);
    }
};

BABYLON.Scene.prototype._evaluateSubMesh = function (subMesh, mesh) {
    if (!subMesh.isHiddenScreen)//++
    {//++
        if (mesh.subMeshes.length == 1 || subMesh.isInFrustum(this._frustumPlanes)) {
            var material = subMesh.getMaterial();

            if (mesh.showSubMeshesBoundingBox) {
                this._boundingBoxRenderer.renderList.push(subMesh.getBoundingInfo().boundingBox);
            }

            if (material) {
                // Render targets
                if (material.getRenderTargetTextures) {
                    if (this._processedMaterials.indexOf(material) === -1) {
                        this._processedMaterials.push(material);

                        this._renderTargets.concat(material.getRenderTargetTextures());
                    }
                }

                // Dispatch
                this._activeVertices += subMesh.indexCount;
                this._renderingManager.dispatch(subMesh);
            }
        }
    }//++
};


BABYLON.RenderTargetTexture.prototype.render = function (useCameraPostProcess) {
    if (this.onBeforeRender) { //+++
        this.onBeforeRender(); //+++
    }        //+++

    var scene = this.getScene();
    var engine = scene.getEngine();
    if (this._waitingRenderList) {
        this.renderList = [];
        for (var index = 0; index < this._waitingRenderList.length; index++) {
            var id = this._waitingRenderList[index];
            this.renderList.push(scene.getMeshByID(id));
        }
        delete this._waitingRenderList;
    }
    if (this.renderList && this.renderList.length === 0) {
        if (this.onAfterRender) { //+++
            this.onAfterRender(); //+++
        } //+++
        return;
    }
    // Bind
    if (!useCameraPostProcess || !scene.postProcessManager._prepareFrame(this._texture)) {
        engine.bindFramebuffer(this._texture);
    }
    this._renderingManager.reset();
    var currentRenderList = this.renderList ? this.renderList : scene.getActiveMeshes().data;
    for (var meshIndex = 0; meshIndex < currentRenderList.length; meshIndex++) {
        var mesh = currentRenderList[meshIndex];
        if (mesh) {
            if (!mesh.isReady()) {
                // Reset _currentRefreshId
                this.resetRefreshCounter();
                continue;
            }
            if (mesh.isEnabled() && mesh.isVisible && mesh.subMeshes && ((mesh.layerMask & scene.activeCamera.layerMask) !== 0)) {
                mesh._activate(scene.getRenderId());
                for (var subIndex = 0; subIndex < mesh.subMeshes.length; subIndex++) {
                    var subMesh = mesh.subMeshes[subIndex];
                    if (!subMesh.isHidden)//++
                    {//++
                        scene._activeVertices += subMesh.indexCount;
                        this._renderingManager.dispatch(subMesh);
                    }//++
                }
            }
        }
    }
    if (this.onBeforeRender) {
        this.onBeforeRender();
    }
    // Clear
    engine.clear(scene.clearColor, true, true);
    if (!this._doNotChangeAspectRatio) {
        scene.updateTransformMatrix(true);
    }
    // Render
    this._renderingManager.render(this.customRenderFunction, currentRenderList, this.renderParticles, this.renderSprites);
    if (useCameraPostProcess) {
        scene.postProcessManager._finalizeFrame(false, this._texture);
    }
    if (!this._doNotChangeAspectRatio) {
        scene.updateTransformMatrix(true);
    }
    if (this.onAfterRender) {
        this.onAfterRender();
    }
    // Unbind
    engine.unBindFramebuffer(this._texture);
};

BABYLON.Engine.prototype.setInt = function (uniform, value) {
    if (!uniform)
        return;

    this._gl.uniform1i(uniform, value);
};

BABYLON.Effect.prototype.setInt = function (uniformName, value) {
    if (this._valueCache[uniformName] && this._valueCache[uniformName] === value)
        return;

    this._valueCache[uniformName] = value;

    this._engine.setInt(this.getUniform(uniformName), value);
};

BABYLON.Engine.prototype.setInts = function (uniform, value) {
    if (!uniform)
        return;

    this._gl.uniform1iv(uniform, value);
};

BABYLON.Effect.prototype.setInts = function (uniformName, value) {
    if (this._valueCache[uniformName] && this._valueCache[uniformName] === value)
        return;

    this._valueCache[uniformName] = value;

    this._engine.setInts(this.getUniform(uniformName), value);
};

BABYLON.Engine.prototype.setFloats2 = function (uniform, value) {
    if (!uniform)
        return;

    this._gl.uniform2fv(uniform, value);
};

BABYLON.Effect.prototype.setFloats2 = function (uniformName, value) {
    if (this._valueCache[uniformName] && this._valueCache[uniformName] === value)
        return;

    this._valueCache[uniformName] = value;

    this._engine.setFloats2(this.getUniform(uniformName), value);
};

BABYLON.Engine.prototype.setFloats = function (uniform, value) {
    if (!uniform)
        return;

    this._gl.uniform1fv(uniform, value);
};

BABYLON.Effect.prototype.setFloats = function (uniformName, value) {
    if (this._valueCache[uniformName] && this._valueCache[uniformName] === value)
        return;

    this._valueCache[uniformName] = value;

    this._engine.setFloats(this.getUniform(uniformName), value);
};

BABYLON.Engine.prototype.setMatrix2 = function (uniform, values) {
    if (!uniform)
        return;

    this._gl.uniformMatrix2fv(uniform, false, values);
};

BABYLON.Effect.prototype.setMatrix2 = function (uniformName, values) {
    if (this._valueCache[uniformName] && this._valueCache[uniformName] === values)
        return;

    this._valueCache[uniformName] = values;

    this._engine.setMatrix2(this.getUniform(uniformName), values);
};


BABYLON.Scene.prototype._renderForCamera = function (camera) {
    var engine = this._engine;

    this.activeCamera = camera;
    if (!this.activeCamera)
        throw new Error("Active camera not set");
    BABYLON.Tools.StartPerformanceCounter("Rendering camera " + this.activeCamera.name);
    // Viewport
    engine.setViewport(this.activeCamera.viewport);
    // Camera
    this._renderId++;
    this.updateTransformMatrix();
    if (this.beforeCameraRender) {
        this.beforeCameraRender(this.activeCamera);
    }
    // Meshes
    var beforeEvaluateActiveMeshesDate = BABYLON.Tools.Now;
    BABYLON.Tools.StartPerformanceCounter("Active meshes evaluation");
    this._evaluateActiveMeshes();
    this._evaluateActiveMeshesDuration += BABYLON.Tools.Now - beforeEvaluateActiveMeshesDate;
    BABYLON.Tools.EndPerformanceCounter("Active meshes evaluation");
    for (var skeletonIndex = 0; skeletonIndex < this._activeSkeletons.length; skeletonIndex++) {
        var skeleton = this._activeSkeletons.data[skeletonIndex];
        skeleton.prepare();
        this._activeBones += skeleton.bones.length;
    }
    // Render targets
    this.renderingFbo = true; //+++++
    var beforeRenderTargetDate = BABYLON.Tools.Now;
    if (this.renderTargetsEnabled) {
        BABYLON.Tools.StartPerformanceCounter("Render targets", this._renderTargets.length > 0);
        for (var renderIndex = 0; renderIndex < this._renderTargets.length; renderIndex++) {
            var renderTarget = this._renderTargets.data[renderIndex];
            if (renderTarget._shouldRender()) {
                this._renderId++;
                renderTarget.render();
            }
        }
        BABYLON.Tools.EndPerformanceCounter("Render targets", this._renderTargets.length > 0);
        this._renderId++;
    }

    this.renderingFbo = false; //+++++

    if (this._renderTargets.length > 0) {
        engine.restoreDefaultFramebuffer();
    }
    this._renderTargetsDuration += BABYLON.Tools.Now - beforeRenderTargetDate;
    // Prepare Frame
    this.postProcessManager._prepareFrame();
    var beforeRenderDate = BABYLON.Tools.Now;
    // Backgrounds
    if (this.layers.length) {
        engine.setDepthBuffer(false);
        var layerIndex;
        var layer;
        for (layerIndex = 0; layerIndex < this.layers.length; layerIndex++) {
            layer = this.layers[layerIndex];
            if (layer.isBackground) {
                layer.render();
            }
        }
        engine.setDepthBuffer(true);
    }
    // Render
    BABYLON.Tools.StartPerformanceCounter("Main render");
    this._renderingManager.render(null, null, true, true);
    BABYLON.Tools.EndPerformanceCounter("Main render");
    // Bounding boxes
    this._boundingBoxRenderer.render();
    // Lens flares
    if (this.lensFlaresEnabled) {
        BABYLON.Tools.StartPerformanceCounter("Lens flares", this.lensFlareSystems.length > 0);
        for (var lensFlareSystemIndex = 0; lensFlareSystemIndex < this.lensFlareSystems.length; lensFlareSystemIndex++) {
            this.lensFlareSystems[lensFlareSystemIndex].render();
        }
        BABYLON.Tools.EndPerformanceCounter("Lens flares", this.lensFlareSystems.length > 0);
    }
    // Foregrounds
    if (this.layers.length) {
        engine.setDepthBuffer(false);
        for (layerIndex = 0; layerIndex < this.layers.length; layerIndex++) {
            layer = this.layers[layerIndex];
            if (!layer.isBackground) {
                layer.render();
            }
        }
        engine.setDepthBuffer(true);
    }
    this._renderDuration += BABYLON.Tools.Now - beforeRenderDate;
    // Finalize frame
    this.postProcessManager._finalizeFrame(camera.isIntermediate);
    // Update camera
    this.activeCamera._updateFromScene();
    // Reset some special arrays
    this._renderTargets.reset();
    if (this.afterCameraRender) {
        this.afterCameraRender(this.activeCamera);
    }
    BABYLON.Tools.EndPerformanceCounter("Rendering camera " + this.activeCamera.name);
};


BABYLON.Vector3.prototype.mod = function (mod) {
    return new BABYLON.Vector3(this.x % mod,
                               this.y % mod,
                               this.z % mod);
};

BABYLON.Vector3.prototype.floor = function (precision) {
    var vec = new BABYLON.Vector3(Math.floor(Math.abs(this.x)/precision)*precision,
                               Math.floor(Math.abs(this.y)/precision)*precision,
                               Math.floor(Math.abs(this.z)/precision)*precision);
    if (this.x<0.){
        vec.x = -vec.x;
    }
    if (this.y<0.){
        vec.y = -vec.y;
    }
    if (this.z<0.){
        vec.z = -vec.z;
    }
    return vec;
};

BABYLON.Vector2.prototype.mod = function (mod) {
    return new BABYLON.Vector3(this.x % mod,
                               this.y % mod);
};

BABYLON.Engine.prototype.createEffect = function (baseName, attributesNames, uniformsNames, samplers, defines, optionalDefines, onCompiled, onError) {
    var vertex = baseName.vertexElement || (baseName.vertex?baseName.vertex.tagName:null) || baseName.vertex || baseName; //++
    var fragment = baseName.fragmentElement || (baseName.fragment?baseName.fragment.tagName:null) || baseName.fragment || baseName; //++

    var name = vertex + "+" + fragment + "@" + defines;
    if (this._compiledEffects[name]) {
        return this._compiledEffects[name];
    }

    var effect = new BABYLON.Effect(baseName, attributesNames, uniformsNames, samplers, this, defines, optionalDefines, onCompiled, onError);
    effect._key = name;
    this._compiledEffects[name] = effect;

    return effect;
};

//source
var getSamplingParameters = function (samplingMode, generateMipMaps, gl) {
    var magFilter = gl.NEAREST;
    var minFilter = gl.NEAREST;
    if (samplingMode === BABYLON.Texture.BILINEAR_SAMPLINGMODE) {
        magFilter = gl.LINEAR;
        if (generateMipMaps) {
            minFilter = gl.LINEAR_MIPMAP_NEAREST;
        }
        else {
            minFilter = gl.LINEAR;
        }
    }
    else if (samplingMode === BABYLON.Texture.TRILINEAR_SAMPLINGMODE) {
        magFilter = gl.LINEAR;
        if (generateMipMaps) {
            minFilter = gl.LINEAR_MIPMAP_LINEAR;
        }
        else {
            minFilter = gl.LINEAR;
        }
    }
    else if (samplingMode === BABYLON.Texture.NEAREST_SAMPLINGMODE) {
        magFilter = gl.NEAREST;
        if (generateMipMaps) {
            minFilter = gl.NEAREST_MIPMAP_LINEAR;
        }
        else {
            minFilter = gl.NEAREST;
        }
    }
    return {
        min: minFilter,
        mag: magFilter
    };
};
var prepareWebGLTexture = function (texture, gl, scene, width, height, invertY, noMipmap, isCompressed, processFunction, samplingMode) {
    if (typeof samplingMode === "undefined") { samplingMode = BABYLON.Texture.TRILINEAR_SAMPLINGMODE; }
    var engine = scene.getEngine();
    var potWidth = BABYLON.Tools.GetExponantOfTwo(width, engine.getCaps().maxTextureSize);
    var potHeight = BABYLON.Tools.GetExponantOfTwo(height, engine.getCaps().maxTextureSize);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, invertY === undefined ? 1 : (invertY ? 1 : 0));

    processFunction(potWidth, potHeight);

    var filters = getSamplingParameters(samplingMode, !noMipmap, gl);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filters.mag);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filters.min);

    if (!noMipmap && !isCompressed) {
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    gl.bindTexture(gl.TEXTURE_2D, null);

    engine._activeTexturesCache = [];
    texture._baseWidth = width;
    texture._baseHeight = height;
    texture._width = potWidth;
    texture._height = potHeight;
    texture.isReady = true;
    scene._removePendingData(texture);
};
//!source

BABYLON.Engine.prototype.createTexture = function (url, noMipmap, invertY, scene, samplingMode, onLoad, onError, buffer) {
    var _this = this;
    if (typeof samplingMode === void 0) { samplingMode = BABYLON.Texture.TRILINEAR_SAMPLINGMODE; }
    if (typeof onLoad === void 0) { onLoad = null; }
    if (typeof onError === void 0) { onError = null; }
    if (typeof buffer === void 0) { buffer = null; }
    var texture = this._gl.createTexture();

    var extension;
    var fromData = false;
    if (url.substr(0, 5) === "data:") {
        fromData = true;
    }

    if (!fromData)
        extension = url.substr(url.length - 4, 4).toLowerCase();
    else {
        var oldUrl = url;
        fromData = oldUrl.split(':');
        url = oldUrl;
        extension = fromData[1].substr(fromData[1].length - 4, 4).toLowerCase();
    }

    var isDDS = this.getCaps().s3tc && (extension === ".dds");
    var isTGA = (extension === ".tga");

    scene._addPendingData(texture);
    texture.url = url;
    texture.noMipmap = noMipmap;
    texture.references = 1;
    this._loadedTexturesCache.push(texture);

    var onerror = function () {
        scene._removePendingData(texture);

        if (onError) {
            onError();
        }
    };

    if (isTGA) {
        var callback = function (arrayBuffer) {
            var data = new Uint8Array(arrayBuffer);

            var header = BABYLON.Internals.TGATools.GetTGAHeader(data);

            prepareWebGLTexture(texture, _this._gl, scene, header.width, header.height, invertY, noMipmap, false, function () {
                BABYLON.Internals.TGATools.UploadContent(_this._gl, data);

                if (onLoad) {
                    onLoad();
                }
            }, samplingMode);
        };

        if (!(fromData instanceof Array))
            BABYLON.Tools.LoadFile(url, function (arrayBuffer) {
                callback(arrayBuffer);
            }, onerror, scene.database, true);
        else
            callback(buffer);
    } else if (isDDS) {
        callback = function (data) {
            var info = BABYLON.Internals.DDSTools.GetDDSInfo(data);

            var loadMipmap = (info.isRGB || info.isLuminance || info.mipmapCount > 1) && !noMipmap && ((info.width >> (info.mipmapCount - 1)) === 1);

            prepareWebGLTexture(texture, _this._gl, scene, info.width, info.height, invertY, !loadMipmap, info.isFourCC, function () {
                BABYLON.Internals.DDSTools.UploadDDSLevels(_this._gl, _this.getCaps().s3tc, data, info, loadMipmap, 1);

                if (onLoad) {
                    onLoad();
                }
            }, samplingMode);
        };

        if (!(fromData instanceof Array))
            BABYLON.Tools.LoadFile(url, function (data) {
                callback(data);
            }, onerror, scene.database, true);
        else
            callback(buffer);
    } else {


        if (!(fromData instanceof Array))
        {
            var onload = function (img) {
                prepareWebGLTexture(texture, _this._gl, scene, img.width, img.height, invertY, noMipmap, false, function (potWidth, potHeight) {
                    var isPot = (img.width == potWidth && img.height == potHeight);
                    if (!isPot) {
                        _this._workingCanvas.width = potWidth;
                        _this._workingCanvas.height = potHeight;
                        if (samplingMode === BABYLON.Texture.NEAREST_SAMPLINGMODE) {
                            _this._workingContext.imageSmoothingEnabled = false;
                            _this._workingContext.mozImageSmoothingEnabled = false;
                            _this._workingContext.oImageSmoothingEnabled = false;
                            _this._workingContext.webkitImageSmoothingEnabled = false;
                            _this._workingContext.msImageSmoothingEnabled = false;
                        }

                        _this._workingContext.drawImage(img, 0, 0, img.width, img.height, 0, 0, potWidth, potHeight);
                        if (samplingMode === BABYLON.Texture.NEAREST_SAMPLINGMODE) {
                            _this._workingContext.imageSmoothingEnabled = true;
                            _this._workingContext.mozImageSmoothingEnabled = true;
                            _this._workingContext.oImageSmoothingEnabled = true;
                            _this._workingContext.webkitImageSmoothingEnabled = true;
                            _this._workingContext.msImageSmoothingEnabled = true;
                        }

                    }

                    _this._gl.texImage2D(_this._gl.TEXTURE_2D, 0, _this._gl.RGBA, _this._gl.RGBA, _this._gl.UNSIGNED_BYTE, isPot ? img : _this._workingCanvas);

                    if (onLoad) {
                        onLoad();
                    }
                }, samplingMode);
            };
            BABYLON.Tools.LoadImage(url, onload, onerror, scene.database);
        }
        else
        {
            //+++
            var size = parseInt(Math.sqrt(buffer.data.length/4));

            prepareWebGLTexture(texture, _this._gl, scene, size, size, invertY, noMipmap, false, function (potWidth, potHeight) {
                _this._gl.texImage2D(_this._gl.TEXTURE_2D, 0, _this._gl.RGBA, _this._gl.RGBA, _this._gl.UNSIGNED_BYTE, buffer);
            }, samplingMode);

            if (onLoad) {
                onLoad();
            }
            //!++
        }
    }

    return texture;
};

BABYLON.SceneLoader.ImportMesh = function (meshesNames, rootUrl, sceneFilename, scene, onsuccess, progressCallBack, onerror) {
    var _this = this;
    var manifestChecked = function (success) {
        scene.database = database;

        var plugin = _this._getPluginForFilename(sceneFilename);

        var importMeshFromData = function (data) {
            var meshes = [];
            var particleSystems = [];
            var skeletons = [];

            try  {
                if (!plugin.importMesh(meshesNames, scene, data, rootUrl, meshes, particleSystems, skeletons)) {
                    if (onerror) {
                        nerror(scene, 'unable to load the scene');

                    }

                    return;
                }
            } catch (e) {
                if (onerror) {
                    onerror(scene);
                }

                return;
            }

            if (onsuccess) {
                scene.importedMeshesFiles.push(rootUrl + sceneFilename);
                onsuccess(meshes, particleSystems, skeletons);
            }
        };

        if (sceneFilename.substr && sceneFilename.substr(0, 5) === "data:") {

            importMeshFromData(sceneFilename.substr(5));
            return;
        }

        BABYLON.Tools.LoadFile(rootUrl + sceneFilename, function (data) {
            data = data.replace(/(,)\1+/gi, ",");  //+++
            importMeshFromData(data);
        }, progressCallBack, database);
    };


    var database = new BABYLON.Database(rootUrl + sceneFilename, manifestChecked);
};


BABYLON.Geometry.prototype._applyToMesh = function (mesh) {
    var numOfMeshes = this._meshes.length;

    for (var kind in this._vertexBuffers) {
        if (numOfMeshes === 1) {
            this._vertexBuffers[kind].create();
        }
        this._vertexBuffers[kind]._buffer.references = numOfMeshes;

        if (kind === BABYLON.VertexBuffer.PositionKind) {
            mesh._resetPointsArrayCache();

            //var extend = BABYLON.Tools.ExtractMinAndMax(this._vertexBuffers[kind].getData(), 0, this._totalVertices);
            //mesh._boundingInfo = new BABYLON.BoundingInfo(extend.minimum, extend.maximum);
            mesh._boundingInfo = new BABYLON.BoundingInfo(new BABYLON.Vector3(-10000., -10000., -10000.), new BABYLON.Vector3(10000., 10000., 10000.)); //+++

            mesh._createGlobalSubMesh();
            //bounding info was just created again, world matrix should be applied again.
            mesh._updateBoundingInfo();

        }
    }


    if (numOfMeshes === 1 && this._indices) {
        this._indexBuffer = this._engine.createIndexBuffer(this._indices);
    }
    if (this._indexBuffer) {
        this._indexBuffer.references = numOfMeshes;
    }
};

/*
BABYLON.Engine.prototype.setAlphaMode = function (mode) {
    switch (mode) {
    case BABYLON.Engine.ALPHA_DISABLE:
        this.setDepthWrite(true);
        this._alphaState.alphaBlend = false;
        break;
    case BABYLON.Engine.ALPHA_COMBINE:
        this.setDepthWrite(false);
        this._alphaState.setAlphaBlendFunctionParameters(this._gl.ONE, this._gl.ONE_MINUS_SRC_ALPHA, this._gl.ONE, this._gl.ONE);
        this._alphaState.alphaBlend = true;
        break;
    case BABYLON.Engine.ALPHA_ADD:
        this.setDepthWrite(false);
        this._alphaState.setAlphaBlendFunctionParameters(this._gl.ONE, this._gl.ONE, this._gl.ZERO, this._gl.ONE);
        this._alphaState.alphaBlend = true;
        break;
    }
};
*/

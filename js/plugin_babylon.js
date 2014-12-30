BABYLON.SubMesh.prototype.render = function () {
    if (!this._mesh.dontLog){
        _logger.start(this._mesh.name+' '+this.getMaterial().name);
    }
    this._renderingMesh.render(this);
    if (!this._mesh.dontLog){
        _logger.end(this._mesh.name+' '+this.getMaterial().name, true);
    }
};

//Babylon.engine.js
var getSamplingParameters = function (samplingMode, generateMipMaps, gl, enableTextureFloat) { //+++
    var magFilter = gl.NEAREST;
    var minFilter = gl.NEAREST;

    if (!enableTextureFloat){ //+++
        if (samplingMode === BABYLON.Texture.BILINEAR_SAMPLINGMODE) {
            magFilter = gl.LINEAR;
            if (generateMipMaps) {
                minFilter = gl.LINEAR_MIPMAP_NEAREST;
            } else {
                minFilter = gl.LINEAR;
            }
        } else if (samplingMode === BABYLON.Texture.TRILINEAR_SAMPLINGMODE) {
            magFilter = gl.LINEAR;
            if (generateMipMaps) {
                minFilter = gl.LINEAR_MIPMAP_LINEAR;
            } else {
                minFilter = gl.LINEAR;
            }
        } else if (samplingMode === BABYLON.Texture.NEAREST_SAMPLINGMODE) {
            magFilter = gl.NEAREST;
            if (generateMipMaps) {
                minFilter = gl.NEAREST_MIPMAP_LINEAR;
            } else {
                minFilter = gl.NEAREST;
            }
        }
    } //+++

    return {
        min: minFilter,
        mag: magFilter
    };
};

BABYLON.Engine.prototype.clear = function (color, backBuffer, depthStencil) {
    this.applyStates();

    //this._gl.clearColor(color.r, color.g, color.b, color.a !== undefined ? color.a : 1.0);
   // if (this._depthCullingState.depthMask) {
    //    this._gl.clearDepth(1.0);
   // }
   // var mode = 0;

   // if (backBuffer)
    //    mode |= this._gl.COLOR_BUFFER_BIT;

    //if (depthStencil && this._depthCullingState.depthMask)
    //    mode |= this._gl.DEPTH_BUFFER_BIT;

    //this._gl.clear(mode);
};

BABYLON.Engine.prototype.createRenderTargetTexture = function (size, options) {
    // old version had a "generateMipMaps" arg instead of options.
    // if options.generateMipMaps is undefined, consider that options itself if the generateMipmaps value
    // in the same way, generateDepthBuffer is defaulted to true
    var gl = this._gl; //+++

    var generateMipMaps = false;
    var generateDepthBuffer = true;
    var samplingMode = BABYLON.Texture.TRILINEAR_SAMPLINGMODE;
    var format = gl.RGBA; //+++
    if (options !== undefined) {
        generateMipMaps = options.generateMipMaps === undefined ? options : options.generateMipmaps;
        generateDepthBuffer = options.generateDepthBuffer === undefined ? true : options.generateDepthBuffer;
        if (options.samplingMode !== undefined) {
            samplingMode = options.samplingMode;
        }
        if (options.format !== undefined){ //+++
            format = options.format; //+++
        } //+++
    }

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    var width = size.width || size;
    var height = size.height || size;

    var enableTextureFloat = _enableTextureFloat && options.enableTextureFloat; //+++

    var filters = getSamplingParameters(samplingMode, generateMipMaps, gl, enableTextureFloat); //+++

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filters.mag);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filters.min);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    if (enableTextureFloat){ //+++
        gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, gl.FLOAT, null); //+++
    } //+++
    else //+++
    { //+++
        gl.texImage2D(gl.TEXTURE_2D, 0, format, width, height, 0, format, gl.UNSIGNED_BYTE, null); //+++
    } //+++

    var depthBuffer;

    // Create the depth buffer
    if (generateDepthBuffer) {
        depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    }

    // Create the framebuffer
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    if (generateDepthBuffer) {
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    }

    // Unbind
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    texture._framebuffer = framebuffer;
    if (generateDepthBuffer) {
        texture._depthBuffer = depthBuffer;
    }
    texture._width = width;
    texture._height = height;
    texture.isReady = true;
    texture.generateMipMaps = generateMipMaps;
    texture.references = 1;
    this._activeTexturesCache = [];

    this._loadedTexturesCache.push(texture);

    return texture;
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
                this._activeVertices += subMesh.verticesCount;
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

            if (!this.renderList) {
                if (this.onAfterRender) { //+++
                    this.onAfterRender(); //+++
                } //+++
                return;
            }

            // Bind
            if (!useCameraPostProcess || !scene.postProcessManager._prepareFrame(this._texture)) {
                engine.bindFramebuffer(this._texture);
            }

            // Clear
            engine.clear(scene.clearColor, true, true);

            this._renderingManager.reset();

            for (var meshIndex = 0; meshIndex < this.renderList.length; meshIndex++) {
                var mesh = this.renderList[meshIndex];

                if (mesh) {
                    if (!mesh.isReady() || (mesh.material && !mesh.material.isReady())) {
                        // Reset _currentRefreshId
                        this.resetRefreshCounter();
                        continue;
                    }

                    if (mesh.isEnabled() && mesh.isVisible && mesh.subMeshes && ((mesh.layerMask & scene.activeCamera.layerMask) != 0)) {
                        mesh._activate(scene.getRenderId());

                        for (var subIndex = 0; subIndex < mesh.subMeshes.length; subIndex++) {
                            var subMesh = mesh.subMeshes[subIndex];
                            if (!subMesh.isHidden)//++
                            {//++
                                scene._activeVertices += subMesh.verticesCount;
                                this._renderingManager.dispatch(subMesh);
                            }//++
                        }
                    }
                }
            }

            if (!this._doNotChangeAspectRatio) {
                scene.updateTransformMatrix(true);
            }

            // Render
            this._renderingManager.render(this.customRenderFunction, this.renderList, this.renderParticles, this.renderSprites);

            if (useCameraPostProcess) {
                scene.postProcessManager._finalizeFrame(false, this._texture);
            }

            if (this.onAfterRender) {
                this.onAfterRender();
            }

            // Unbind
            engine.unBindFramebuffer(this._texture);

            if (!this._doNotChangeAspectRatio) {
                scene.updateTransformMatrix(true);
            }
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

    // Viewport
    engine.setViewport(this.activeCamera.viewport);

    // Camera
    this._renderId++;
    this.updateTransformMatrix();

    if (this.beforeCameraRender) {
        this.beforeCameraRender(this.activeCamera);
    }

    // Meshes
    var beforeEvaluateActiveMeshesDate = new Date().getTime();
    this._evaluateActiveMeshes();
    this._evaluateActiveMeshesDuration += new Date().getTime() - beforeEvaluateActiveMeshesDate;

    for (var skeletonIndex = 0; skeletonIndex < this._activeSkeletons.length; skeletonIndex++) {
        var skeleton = this._activeSkeletons.data[skeletonIndex];

        skeleton.prepare();
    }

    // Render targets
    this.renderingFbo = true; //+++++
    var beforeRenderTargetDate = new Date().getTime();
    if (this.renderTargetsEnabled) {
        for (var renderIndex = 0; renderIndex < this._renderTargets.length; renderIndex++) {
            renderTarget = this._renderTargets.data[renderIndex];
            if (renderTarget._shouldRender()) {
                this._renderId++;
                renderTarget.render();
            }
        }
        this._renderId++;
    }
    this.renderingFbo = false; //+++++

    if (this._renderTargets.length > 0) {
        engine.restoreDefaultFramebuffer();
    }
    this._renderTargetsDuration = new Date().getTime() - beforeRenderTargetDate;

    // Prepare Frame
    this.postProcessManager._prepareFrame();

    var beforeRenderDate = new Date().getTime();

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
    this._renderingManager.render(null, null, true, true);

    // Bounding boxes
    this._boundingBoxRenderer.render();

    for (var lensFlareSystemIndex = 0; lensFlareSystemIndex < this.lensFlareSystems.length; lensFlareSystemIndex++) {
        this.lensFlareSystems[lensFlareSystemIndex].render();
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

    this._renderDuration += new Date().getTime() - beforeRenderDate;

    // Finalize frame
    this.postProcessManager._finalizeFrame(camera.isIntermediate);

    // Update camera
    this.activeCamera._updateFromScene();

    // Reset some special arrays
    this._renderTargets.reset();

    if (this.afterCameraRender) {
        this.afterCameraRender(this.activeCamera);
    }
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

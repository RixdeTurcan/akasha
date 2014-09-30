// Methods
StandardMaterialIsReady = function (that, mesh, shaderName, defines, uniforms, samplers) {
    if (that.checkReadyOnlyOnce) {
        if (that._wasPreviouslyReady) {
            return true;
        }
    }

    if (!that.checkReadyOnEveryCall) {
        if (that._renderId === that._scene.getRenderId()) {
            return true;
        }
    }

    var engine = that._scene.getEngine();
    var optionalDefines = [];

    // Textures
    if (that._scene.texturesEnabled) {
        if (that.diffuseTexture) {
            if (!that.diffuseTexture.isReady()) {
                return false;
            } else {
                defines.push("#define DIFFUSE");
            }
        }

        if (that.ambientTexture) {
            if (!that.ambientTexture.isReady()) {
                return false;
            } else {
                defines.push("#define AMBIENT");
            }
        }

        if (that.opacityTexture) {
            if (!that.opacityTexture.isReady()) {
                return false;
            } else {
                defines.push("#define OPACITY");
            }
        }

        if (that.reflectionTexture) {
            if (!that.reflectionTexture.isReady() ) {
                return false;
            } else {
                defines.push("#define REFLECTION");
            }
        }

        if (that.emissiveTexture) {
            if (!that.emissiveTexture.isReady()) {
                return false;
            } else {
                defines.push("#define EMISSIVE");
            }
        }

        if (that.specularTexture) {
            if (!that.specularTexture.isReady()) {
                return false;
            } else {
                defines.push("#define SPECULAR");
                optionalDefines.push(defines[defines.length - 1]);
            }
        }
    }

    if (that._scene.getEngine().getCaps().standardDerivatives && that.bumpTexture) {
        if (!that.bumpTexture.isReady()) {
            return false;
        } else {
            defines.push("#define BUMP");
            optionalDefines.push(defines[defines.length - 1]);
        }
    }

    // Effect
    if (BABYLON.clipPlane) {
        defines.push("#define CLIPPLANE");
    }

    if (engine.getAlphaTesting()) {
        defines.push("#define ALPHATEST");
    }

    // Fog
    if (that._scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
        defines.push("#define FOG");
        optionalDefines.push(defines[defines.length - 1]);
    }

    var shadowsActivated = false;
    var lightIndex = 0;
    if (that._scene.lightsEnabled) {
        for (var index = 0; index < that._scene.lights.length; index++) {
            var light = that._scene.lights[index];

            if (!light.isEnabled()) {
                continue;
            }

            if (mesh && light.excludedMeshes.indexOf(mesh) !== -1) {
                continue;
            }

            defines.push("#define LIGHT" + lightIndex);

            if (lightIndex > 0) {
                optionalDefines.push(defines[defines.length - 1]);
            }

            var type;
            if (light instanceof BABYLON.SpotLight) {
                type = "#define SPOTLIGHT" + lightIndex;
            } else if (light instanceof BABYLON.HemisphericLight) {
                type = "#define HEMILIGHT" + lightIndex;
            } else {
                type = "#define POINTDIRLIGHT" + lightIndex;
            }

            defines.push(type);
            if (lightIndex > 0) {
                optionalDefines.push(defines[defines.length - 1]);
            }

            // Shadows
            var shadowGenerator = light.getShadowGenerator();
            if (mesh && mesh.receiveShadows && shadowGenerator) {
                defines.push("#define SHADOW" + lightIndex);

                if (lightIndex > 0) {
                    optionalDefines.push(defines[defines.length - 1]);
                }

                if (!shadowsActivated) {
                    defines.push("#define SHADOWS");
                    shadowsActivated = true;
                }

                if (shadowGenerator.useVarianceShadowMap) {
                    defines.push("#define SHADOWVSM" + lightIndex);
                    if (lightIndex > 0) {
                        optionalDefines.push(defines[defines.length - 1]);
                    }
                }
            }

            lightIndex++;
            if (lightIndex == 4)
                break;
        }
    }

    var attribs = [BABYLON.VertexBuffer.PositionKind, BABYLON.VertexBuffer.NormalKind];
    if (mesh) {
        if (mesh.isVerticesDataPresent(BABYLON.VertexBuffer.UVKind)) {
            attribs.push(BABYLON.VertexBuffer.UVKind);
            defines.push("#define UV1");
        }
        if (mesh.isVerticesDataPresent(BABYLON.VertexBuffer.UV2Kind)) {
            attribs.push(BABYLON.VertexBuffer.UV2Kind);
            defines.push("#define UV2");
        }
        if (mesh.isVerticesDataPresent(BABYLON.VertexBuffer.ColorKind)) {
            attribs.push(BABYLON.VertexBuffer.ColorKind);
            defines.push("#define VERTEXCOLOR");
        }
        if (mesh.skeleton && mesh.isVerticesDataPresent(BABYLON.VertexBuffer.MatricesIndicesKind) && mesh.isVerticesDataPresent(BABYLON.VertexBuffer.MatricesWeightsKind)) {
            attribs.push(BABYLON.VertexBuffer.MatricesIndicesKind);
            attribs.push(BABYLON.VertexBuffer.MatricesWeightsKind);
            defines.push("#define BONES");
            defines.push("#define BonesPerMesh " + mesh.skeleton.bones.length);
            defines.push("#define BONES4");
            optionalDefines.push(defines[defines.length - 1]);
        }
    }

    // Get correct effect
    var join = defines.join("\n");
    if (that._cachedDefines != join) {
        that._cachedDefines = join;

        that._effect = that._scene.getEngine().createEffect(
                 shaderName,
                 attribs,
                 uniforms.concat(
                 ["world", "view", "viewProjection", "vEyePosition", "vLightsType", "vAmbientColor", "vDiffuseColor", "vSpecularColor", "vEmissiveColor",
                    "vLightData0", "vLightDiffuse0", "vLightSpecular0", "vLightDirection0", "vLightGround0", "lightMatrix0",
                    "vLightData1", "vLightDiffuse1", "vLightSpecular1", "vLightDirection1", "vLightGround1", "lightMatrix1",
                    "vLightData2", "vLightDiffuse2", "vLightSpecular2", "vLightDirection2", "vLightGround2", "lightMatrix2",
                    "vLightData3", "vLightDiffuse3", "vLightSpecular3", "vLightDirection3", "vLightGround3", "lightMatrix3",
                    "vFogInfos", "vFogColor",
                    "vDiffuseInfos", "vAmbientInfos", "vOpacityInfos", "vReflectionInfos", "vEmissiveInfos", "vSpecularInfos", "vBumpInfos",
                    "mBones",
                    "vClipPlane", "diffuseMatrix", "ambientMatrix", "opacityMatrix", "reflectionMatrix", "emissiveMatrix", "specularMatrix", "bumpMatrix"]
                 ), samplers.concat(
                 ["diffuseSampler", "ambientSampler", "opacitySampler", "reflectionCubeSampler", "reflection2DSampler", "emissiveSampler", "specularSampler", "bumpSampler",
                      "shadowSampler0", "shadowSampler1", "shadowSampler2", "shadowSampler3"
                 ]),
                 join, optionalDefines);
    }

    if (!that._effect.isReady()) {
        return false;
    }

    that._renderId = that._scene.getRenderId();
    that._wasPreviouslyReady = true;
    return true;
};

<!DOCTYPE html>

<html>
<head>
    <title>Morpheus Project</title>

    <script type="text/javascript" src="js/jquery.2.0.3/jquery.2.0.3.js"></script>
    <script type="text/javascript" src="js/jquery.2.0.3/jquery-ui-1.10.3.custom.js"></script>
    <script type="text/javascript" src="js/hand.1.3.0/Hand.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/babylon.node.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/babylon.mixins.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/babylon.engine.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/babylon.scene.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Materials/textures/babylon.baseTexture.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Materials/textures/babylon.texture.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Materials/textures/babylon.renderTargetTexture.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Materials/textures/babylon.cubeTexture.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Materials/textures/babylon.videoTexture.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Materials/textures/babylon.mirrorTexture.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Materials/textures/babylon.dynamicTexture.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Materials/babylon.material.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Materials/babylon.multiMaterial.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Materials/babylon.shaderMaterial.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Materials/babylon.effect.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Materials/babylon.standardMaterial.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Tools/babylon.sceneSerializer.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Tools/babylon.virtualJoystick.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Tools/babylon.gamepads.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Tools/babylon.tools.tga.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Tools/babylon.andOrNotEvaluator.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Tools/babylon.database.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Tools/babylon.filesInput.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Tools/babylon.tools.dds.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Tools/babylon.tags.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Tools/babylon.tools.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Tools/babylon.smartArray.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Math/babylon.math.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Particles/babylon.particle.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Particles/babylon.particleSystem.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/LensFlare/babylon.lensFlareSystem.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/LensFlare/babylon.lensFlare.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Physics/Plugins/babylon.cannonJSPlugin.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Physics/babylon.physicsEngine.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Collisions/babylon.pickingInfo.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Collisions/babylon.collider.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Bones/babylon.bone.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Bones/babylon.skeleton.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Sprites/babylon.spriteManager.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Sprites/babylon.sprite.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Animations/babylon.animatable.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Animations/babylon.animation.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Loading/babylon.sceneLoader.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Loading/Plugins/babylon.babylonFileLoader.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Layer/babylon.layer.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Rendering/babylon.renderingGroup.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Rendering/babylon.renderingManager.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Rendering/babylon.boundingBoxRenderer.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Cameras/babylon.camera.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Cameras/babylon.freeCamera.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Cameras/babylon.arcRotateCamera.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Cameras/babylon.anaglyphCamera.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Cameras/babylon.oculusOrientedCamera.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Cameras/babylon.deviceOrientationCamera.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Cameras/babylon.gamepadCamera.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Cameras/babylon.virtualJoysticksCamera.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Cameras/Controllers/babylon.inputController.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Cameras/Controllers/babylon.keyboardMoveController.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Cameras/Controllers/babylon.gravityInputController.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Cameras/Controllers/babylon.inputCollisionFilter.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Cameras/Controllers/babylon.globalAxisFactorsFilter.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Cameras/Controllers/babylon.oculusController.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Cameras/babylon.touchCamera.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/PostProcess/babylon.postProcess.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/PostProcess/babylon.postProcessManager.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/PostProcess/babylon.anaglyphPostProcess.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/PostProcess/babylon.oculusDistortionCorrectionPostProcess.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/PostProcess/babylon.displayPassPostProcess.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/PostProcess/babylon.filterPostProcess.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/PostProcess/babylon.passPostProcess.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/PostProcess/babylon.refractionPostProcess.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/PostProcess/babylon.convolutionPostProcess.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/PostProcess/RenderPipeline/babylon.postProcessRenderPipeline.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/PostProcess/RenderPipeline/babylon.postProcessRenderPass.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/PostProcess/RenderPipeline/babylon.postProcessRenderEffect.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/PostProcess/RenderPipeline/babylon.postProcessRenderPipelineManager.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/PostProcess/babylon.blackAndWhitePostProcess.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/PostProcess/babylon.fxaaPostProcess.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/PostProcess/babylon.blurPostProcess.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Lights/babylon.light.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Lights/Shadows/babylon.shadowGenerator.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Lights/babylon.directionalLight.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Lights/babylon.spotLight.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Lights/babylon.pointLight.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Lights/babylon.hemisphericLight.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Actions/babylon.action.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Actions/babylon.condition.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Actions/babylon.directActions.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Actions/babylon.interpolateValueAction.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Actions/babylon.actionManager.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Culling/babylon.boundingBox.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Culling/babylon.boundingInfo.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Culling/babylon.boundingSphere.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Culling/Octrees/babylon.octree.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Culling/Octrees/babylon.octreeBlock.js"></script>

    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Mesh/babylon.csg.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Mesh/babylon.abstractMesh.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Mesh/babylon.mesh.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Mesh/babylon.subMesh.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Mesh/babylon.mesh.vertexData.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Mesh/babylon.vertexBuffer.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Mesh/babylon.groundMesh.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Mesh/babylon.InstancedMesh.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.12/Babylon/Mesh/babylon.geometry.js"></script>

    <script type="text/javascript" src="js/tools.js"></script>
    <script type="text/javascript" src="js/shader.js"></script>
    <script type="text/javascript" src="js/global.js"></script>
    <script type="text/javascript" src="js/plugin_babylon.js"></script>

    <script type="text/javascript" src="js/material/reflection_ground.js"></script>
    <script type="text/javascript" src="js/material/foam_shore_ground.js"></script>
    <script type="text/javascript" src="js/material/seabed_ground.js"></script>
    <script type="text/javascript" src="js/material/shadow_ground.js"></script>
    <script type="text/javascript" src="js/material/vegetation_pos.js"></script>
    <script type="text/javascript" src="js/material/vegetation.js"></script>
    <script type="text/javascript" src="js/material/ground.js"></script>
    <script type="text/javascript" src="js/material/ground_height.js"></script>
    <script type="text/javascript" src="js/material/cloudheight.js"></script>
    <script type="text/javascript" src="js/material/cloudsundepth.js"></script>
    <script type="text/javascript" src="js/material/sea.js"></script>
    <script type="text/javascript" src="js/material/wave.js"></script>
    <script type="text/javascript" src="js/material/noise.js"></script>
    <script type="text/javascript" src="js/material/noise2.js"></script>
    <script type="text/javascript" src="js/material/foam_accumulation.js"></script>
    <script type="text/javascript" src="js/material/sky.js"></script>
    <script type="text/javascript" src="js/material/texture.js"></script>

    <script type="text/javascript" src="js/config.js"></script>
    <script type="text/javascript" src="js/world.js"></script>
    <script type="text/javascript" src="js/camera.js"></script>
    <script type="text/javascript" src="js/shadow.js"></script>
    <script type="text/javascript" src="js/player.js"></script>

    <script type="text/javascript" src="js/light.js"></script>
    <script type="text/javascript" src="js/ground.js"></script>
    <script type="text/javascript" src="js/vegetation.js"></script>
    <script type="text/javascript" src="js/sky.js"></script>
    <script type="text/javascript" src="js/ocean.js"></script>
    <script type="text/javascript" src="js/control_panel.js"></script>

    <script type="text/javascript" src="js/game.js"></script>

    <link type='text/css' rel='stylesheet' href='css/game.css' />
    <link type='text/css' rel='stylesheet' href='css/control_panel.css' />
    <link type='text/css' rel="stylesheet" href="css/dark-hive/jquery-ui-1.10.3.custom.css" />
</head>

<body>
    <canvas id="canvas"></canvas>
</body>
</html>

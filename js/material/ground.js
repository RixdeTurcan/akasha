function GroundMaterial(name, scene, ground) {
    this.name = name;
    this.id = name;

    this.ground = ground;

    this._scaledDiffuse = new BABYLON.Color3();
    this._scaledSpecular = new BABYLON.Color3()

    this._renderTargets = new BABYLON.SmartArray(32);
    this._lightMatrix = BABYLON.Matrix.Zero();

    this.treeTextures = {};
    this.renderImpostorTex = false;
    this.impostorTexRendered = false;

    this.nbTreeTestMax = 10;

    this.wireframe = false;
    _$body.keypress(function(e){
        this.wireframe = e.which==119?!this.wireframe:this.wireframe;
    }.bind(this));


    this.shader = new Shader('./shader/ground.vertex.fx',
                             './shader/ground.fragment.fx',
                             ['./shader/texture_noise.include.fx',
                              './shader/sphere_grid.include.fx',
                              './shader/ground.include.fx'],
                             ['./shader/phong.include.fx',
                              './shader/sphere_grid.include.fx',
                              './shader/texture_noise.include.fx',
                              './shader/ground.include.fx']);

    this.backFaceCulling = true;
    this._scene = scene;
    scene.materials.push(this);
};

GroundMaterial.prototype = Object.create(BABYLON.Material.prototype);


// Properties
GroundMaterial.prototype.needAlphaBlending = function () {
    return false;
};

GroundMaterial.prototype.needAlphaTesting = function () {
    return false;
};

// Methods
GroundMaterial.prototype.getRenderTargetTextures = function () {
    this._renderTargets.reset();

    if (this.renderImpostorTex){
        for(var i in this.treeTextures)
        {
            var tex = this.treeTextures[i];
            if (tex && tex.isRenderTarget) {
                this._renderTargets.push(tex);
            }
        }
        this.impostorTexRendered = true;
        this.renderImpostorTex = false;
    }

    if (this.groundHeightTexture && this.groundHeightTexture.isRenderTarget){
                this._renderTargets.push(this.groundHeightTexture);
    }

    if (this.spriteHeightTexture && this.spriteHeightTexture.isRenderTarget){
                this._renderTargets.push(this.spriteHeightTexture);
    }

    return this._renderTargets;
};

GroundMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

    if (this.noiseTexture) {
        if (!this.noiseTexture.isReady()) {
            return false;
        } else {
            defines.push("#define NOISE_TEXTURE");
        }
    }

    if (this.groundHeightTexture) {
        if (!this.groundHeightTexture.isReady()) {
            return false;
        } else {
            defines.push("#define GROUND_HEIGHT");
        }
    }

    if (this.grassTexture) {
        if (!this.grassTexture.isReady()) {
            return false;
        } else {
            defines.push("#define GRASS");
        }
    }

    if (this.diffuse1Texture) {
        if (!this.diffuse1Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_1");
        }
    }

    if (this.diffuseNormal1Texture) {
        if (!this.diffuseNormal1Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_NORMAL_1");
        }
    }

    if (this.diffuseFar1Texture) {
        if (!this.diffuseFar1Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_FAR_1");
        }
    }

    if (this.diffuse2Texture) {
        if (!this.diffuse1Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_2");
        }
    }

    if (this.diffuseNormal2Texture) {
        if (!this.diffuseNormal2Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_NORMAL_2");
        }
    }

    if (this.diffuseFar2Texture) {
        if (!this.diffuseFar2Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_FAR_2");
        }
    }

    if (this.diffuse3Texture) {
        if (!this.diffuse1Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_3");
        }
    }

    if (this.diffuseNormal3Texture) {
        if (!this.diffuseNormal3Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_NORMAL_3");
        }
    }

    if (this.diffuseFar3Texture) {
        if (!this.diffuseFar3Texture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE_FAR_3");
        }
    }

    if (this.skyTexture) {
        if (!this.skyTexture.isReady()) {
            return false;
        } else {
            defines.push("#define SKY");
        }
    }

    // Fog
    if (this._scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
        defines.push("#define FOG");
        if (this._scene.fogMode == BABYLON.Scene.FOGMODE_LINEAR){
            defines.push("#define FOGMODE_LINEAR");
        }else if (this._scene.fogMode == BABYLON.Scene.FOGMODE_EXP){
            defines.push("#define FOGMODE_EXP");
        }else if (this._scene.fogMode == BABYLON.Scene.FOGMODE_EXP2){
            defines.push("#define FOGMODE_EXP2");
        }
    }

    // Lights
    var lightIndex = 0;
    if (this._scene.lightsEnabled) {
        for (var index = 0; index < this._scene.lights.length; index++) {
            var light = this._scene.lights[index];

            if (!light.isEnabled()) continue;
            if (mesh && light.excludedMeshes.indexOf(mesh) !== -1) continue;

            defines.push("#define LIGHT" + lightIndex);

            if (light instanceof BABYLON.PointLight){
             defines.push("#define LIGHT" + lightIndex + "_TYPE_POINT");
            }
            if (light instanceof BABYLON.DirectionalLight){
             defines.push("#define LIGHT" + lightIndex + "_TYPE_DIR");
            }
            if (light instanceof BABYLON.HemisphericLight){
             defines.push("#define LIGHT" + lightIndex + "_TYPE_POINT");
            }

            lightIndex++;
            if (lightIndex == 4)break;
        }
    }

    defines.push("#define NB_TREE_TEST_MAX "+ this.nbTreeTestMax);

    var join = defines.join("\n");
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = join;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.PositionKind,
                                            BABYLON.VertexBuffer.ColorKind],
                                           ['uViewProjection', 'uEyePosInWorld',
                                           'uFogInfos', 'uVerticalShift',
                                           'uTangentScreenDist', 'uPlayerPos',
                                           'uSunDir', 'uTreeToTestX', 'uTreeToTestY', 'uTreeToTest',
                                           'uLightData0', 'uLightDiffuse0',
                                           'uLightData1', 'uLightDiffuse1'],
                                           ['uNoiseSampler', 'uGroundHeightSampler', 'uTreeHeightSampler',
                                            'uSkySampler', 'uGrassSampler', 'uTreeTextureSampler',
                                            'uDiffuse1Sampler', 'uDiffuse2Sampler', 'uDiffuse3Sampler',
                                            'uDiffuseFar1Sampler', 'uDiffuseFar2Sampler', 'uDiffuseFar3Sampler',
                                            'uDiffuseNormal1Sampler', 'uDiffuseNormal2Sampler', 'uDiffuseNormal3Sampler'],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

GroundMaterial.prototype.unbind = function ()
{
    if (this.skyTexture && this.skyTexture.isRenderTarget) {
        this._effect.setTexture("uSkySampler", null);
    }

    if (this.groundHeightTexture && this.groundHeightTexture.isRenderTarget) {
        this._effect.setTexture("uGroundHeightSampler", null);
    }

    if (this.spriteHeightTexture && this.spriteHeightTexture.isRenderTarget) {
        this._effect.setTexture("uTreeHeightSampler", null);
    }
};

GroundMaterial.prototype.computeTreeToTest = function()
{
  var result = {x:[], y:[], id:[]};

  var uTreeLength = 250.;
  var uTreeUnitSize = 320.;

  //Floor square around 0
  var posInit = [new BABYLON.Vector2(-0.5, -0.5).scale(uTreeUnitSize),
                 new BABYLON.Vector2(-0.5, 0.5).scale(uTreeUnitSize),
                 new BABYLON.Vector2(0.5, -0.5).scale(uTreeUnitSize),
                 new BABYLON.Vector2(0.5, 0.5).scale(uTreeUnitSize)];


  //Compute the occlusion radius
  var costheta =  _config.sky.params.sunDir.y;
  var ambiantShadowFactor = smoothstep(0.5, 1., costheta);
  var occlusionLength = mix(uTreeLength/3., uTreeLength/2.1, ambiantShadowFactor);

  //Compute the directionnal shadow rectangle
  var h = _config.sky.params.sunDir.y;
  var n = new BABYLON.Vector2(_config.sky.params.sunDir.x, _config.sky.params.sunDir.z);
  n.normalize();
  var t = new BABYLON.Vector2(-n.y, n.x);
  var shadowLength = 2.*uTreeLength*Math.sqrt(1.-h*h)/h;

  var posShadow = [t.scale(uTreeLength*0.5),
                   t.scale(-uTreeLength*0.5),
                   n.scale(shadowLength).add(t.scale(uTreeLength*0.5)),
                   n.scale(shadowLength).add(t.scale(-uTreeLength*0.5))]; //0.5 ?


  //Compute the convex hull points
  var convexHull = [];
  for(var i=0; i<posInit.length; i++){
    for(var j=0; j<posShadow.length; j++){
      convexHull.push(posInit[i].add(posShadow[j]));
    }
    convexHull.push(posInit[i].add(new BABYLON.Vector2(occlusionLength, occlusionLength)));
    convexHull.push(posInit[i].add(new BABYLON.Vector2(-occlusionLength, occlusionLength)));
    convexHull.push(posInit[i].add(new BABYLON.Vector2(occlusionLength, -occlusionLength)));
    convexHull.push(posInit[i].add(new BABYLON.Vector2(-occlusionLength, -occlusionLength)));

  }

  //Order the convex hull
/*
  if (_test==0){
          $('.p').remove();
          _$body.append('<div id="-1" class="p"></div>');
          $('#-1').css({position:'absolute',
                       top: (500.)+'px',
                       left: (500.)+'px',
                       width: '10px',
                       height: '10px',
                       background: 'white'});
      for(var i=0; i<convexHull.length; i++){
          _$body.append('<div id="'+i+'" class="p"></div>');
          $('#'+i).css({position:'absolute',
                       top: (convexHull[i].y/3.+500.)+'px',
                       left: (convexHull[i].x/3.+500.)+'px',
                       width: '10px',
                       height: '10px',
                       background: 'red',
                       zIndex: '10'});
      }
  }
*/
  var convexHull2 = getEnveloppeConvexe(convexHull, true);
  convexHull2.push(convexHull2[0]);
/*
  if (_test==0){
      for(var i=0; i<convexHull2.length; i++){
          _$body.append('<div id="'+i+'j" class="p"></div>');
          $('#'+i+'j').css({position:'absolute',
                       top: (convexHull2[i].y/3.+500.-3)+'px',
                       left: (convexHull2[i].x/3.+500.-3)+'px',
                       width: '16px',
                       height: '16px',
                       background: 'blue',
                       zIndex: '5'});
      }
  }
*/
  //Get the trees to test
  for(var i=-3; i<=3; i++){
    for (var j=-3; j<=3; j++){
      var p = new BABYLON.Vector2(i*uTreeUnitSize, j*uTreeUnitSize);
      var isInConvexHull = true;
      for (var k = 0; k<convexHull2.length-1; k++){
        var v1 = p.subtract(convexHull2[k]);
        var v2 = convexHull2[k+1].subtract(convexHull2[k]);

        if (BABYLON.Vector2.cross(v2, v1)<0.){
          isInConvexHull = false;
          break;
        }
      }
      if (isInConvexHull){
        result.x.push(i);
        result.y.push(j);
        result.id.push(1);
      }
    }
  }

/*
  if (_test==0){
    _test = 1;
      for(var i=0; i<result.x.length; i++){
          _$body.append('<div id="'+i+'jj" class="p"></div>');
          $('#'+i+'jj').css({position:'absolute',
                       top: (result.y[i]*uTreeUnitSize/3.+500.-6)+'px',
                       left: (result.x[i]*uTreeUnitSize/3.+500.-6)+'px',
                       width: '21px',
                       height: '21px',
                       background: 'green',
                       zIndex: '3'});
      }
  }*/
//console.log(result.x.length);
  //Fill the array
  for(var i=0; i<this.nbTreeTestMax-result.x.length; i++){
    result.x.push(0);
    result.y.push(0);
    result.id.push(0);
  }
  return result;
}

GroundMaterial.prototype.bind = function (world, mesh) {

    var eyePos = this._scene.activeCamera.position;
    var transform = this._scene.getTransformMatrix();


    this._effect.setMatrix('uViewProjection', transform);

    this._effect.setVector3('uEyePosInWorld', eyePos);

    this._effect.setVector3('uPlayerPos', _config.player.position);

    this._effect.setVector3('uSunDir', _config.sky.params.sunDir);

    var treeToTest = this.computeTreeToTest();

    this._effect.setFloats('uTreeToTestX', treeToTest.x);
    this._effect.setFloats('uTreeToTestY', treeToTest.y);
    this._effect.setFloats('uTreeToTest', treeToTest.id);

    // noise
    if (this.noiseTexture) {
        this._effect.setTexture("uNoiseSampler", this.noiseTexture);
    }

    // tree height
    if (this.spriteHeightTexture) {
        this._effect.setTexture("uTreeHeightSampler", this.spriteHeightTexture);
    }

    // tree texture
    if (this.treeTexture) {
        this._effect.setTexture("uTreeTextureSampler", this.treeTexture);
    }

    // grass
    if (this.grassTexture) {
        this._effect.setTexture("uGrassSampler", this.grassTexture);
    }

    // ground height
    if (this.groundHeightTexture) {
        this._effect.setTexture("uGroundHeightSampler", this.groundHeightTexture);
    }

    // diffuse 1
    if (this.diffuse1Texture) {
        this._effect.setTexture("uDiffuse1Sampler", this.diffuse1Texture);
    }
    if (this.diffuseNormal1Texture) {
        this._effect.setTexture("uDiffuseNormal1Sampler", this.diffuseNormal1Texture);
    }
    if (this.diffuseFar1Texture) {
        this._effect.setTexture("uDiffuseFar1Sampler", this.diffuseFar1Texture);
    }

    // diffuse 2
    if (this.diffuse2Texture) {
        this._effect.setTexture("uDiffuse2Sampler", this.diffuse2Texture);
    }
    if (this.diffuseNormal2Texture) {
        this._effect.setTexture("uDiffuseNormal2Sampler", this.diffuseNormal2Texture);
    }
    if (this.diffuseFar2Texture) {
        this._effect.setTexture("uDiffuseFar2Sampler", this.diffuseFar2Texture);
    }

    // diffuse 3
    if (this.diffuse3Texture) {
        this._effect.setTexture("uDiffuse3Sampler", this.diffuse3Texture);
    }
    if (this.diffuseNormal3Texture) {
        this._effect.setTexture("uDiffuseNormal3Sampler", this.diffuseNormal3Texture);
    }
    if (this.diffuseFar3Texture) {
        this._effect.setTexture("uDiffuseFar3Sampler", this.diffuseFar3Texture);
    }

    // Fog
    if (this._scene.fogMode !== BABYLON.Scene.FOGMODE_NONE) {
        this._effect.setFloat4('uFogInfos', this._scene.fogMode, this._scene.fogStart, this._scene.fogEnd, this._scene.fogDensity);
    }

    //Sky
    if (this.skyTexture){
        this._effect.setTexture("uSkySampler", this.skyTexture);
        this._effect.setFloat("uVerticalShift", _config.sky.params.verticalShift);
    }

    // Lights
    if (this._scene.lightsEnabled) {
        var lightIndex = 0;
        for (var index = 0; index < this._scene.lights.length; index++) {
            var light = this._scene.lights[index];

            if (!light.isEnabled()) continue;
            if (mesh && light.excludedMeshes.indexOf(mesh) !== -1) continue;

            light.transferToEffect(this._effect, "uLightData" + lightIndex);
            light.diffuse.scaleToRef(light.intensity, this._scaledDiffuse);
            light.specular.scaleToRef(light.intensity, this._scaledSpecular);
            this._effect.setColor3("uLightDiffuse" + lightIndex, this._scaledDiffuse);

            lightIndex++;
            if (lightIndex == 4) break;
        }
    }
};

GroundMaterial.prototype.dispose = function(){
    this.baseDispose();
};


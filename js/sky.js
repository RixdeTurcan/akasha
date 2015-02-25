function Sky(camera, withcloud){
    assert(function(){return camera instanceof Camera;}, 'camera is not a Camera');

    this.camera = camera;
    this.withcloud = withcloud;
}

Sky.prototype.load = function(loaderCallback, loadingCallback){
    if (this.withcloud){
        //Noise texture
        this.noiseTexture = new BABYLON.Texture("asset/noise.png", _config.world.scene);
        this.noiseTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
        this.noiseTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;

        //Cloud height
        this.cloudHeightMaterial = new CloudHeightMaterial("CloudHeightMaterial", _config.world.scene);

        this.cloudHeightTexture = new BABYLON.RenderTargetTexture("CloudHeightTexture",
                                                                  _config.sky.cloud.heightSize,
                                                                  _config.world.scene,
                                                                  {generateMipMaps: false,
                                                                   generateDepthBuffer: false},
                                                                  true, BABYLON.Engine.TEXTURETYPE_FLOAT);
        this.cloudHeightTexture.material = this.cloudHeightMaterial;
        this.cloudHeightTexture.material.noiseTexture = this.noiseTexture;
        this.cloudHeightMesh = createVertexPassthroughMesh(this.cloudHeightTexture.material,
                                                           _config.world.scene,
                                                           true, false);
        this.cloudHeightTexture.renderList.push(this.cloudHeightMesh);
        this.cloudHeightTexture.onBeforeRender = function () {
            this.renderList[0].subMeshes[0].isHidden = false;
        };
        this.cloudHeightTexture.onAfterRender = function () {
            this.renderList[0].subMeshes[0].isHidden = true;
        };

        //Cloud height swap texture
        this.cloudHeightMaterial2 = new CloudHeightMaterial("CloudHeightMaterial2", _config.world.scene);

        this.cloudHeightTexture2 = new BABYLON.RenderTargetTexture("CloudHeightTexture2",
                                                                   _config.sky.cloud.heightSize,
                                                                   _config.world.scene,
                                                                   {generateMipMaps: false,
                                                                    generateDepthBuffer: false},
                                                                   true, BABYLON.Engine.TEXTURETYPE_FLOAT);
        this.cloudHeightTexture2.material = this.cloudHeightMaterial2;
        this.cloudHeightTexture2.material.noiseTexture = this.noiseTexture;
        this.cloudHeightMesh2 = createVertexPassthroughMesh(this.cloudHeightTexture2.material,
                                                            _config.world.scene,
                                                            true, false);
        this.cloudHeightTexture2.renderList.push(this.cloudHeightMesh2);
        this.cloudHeightTexture2.onBeforeRender = function () {
            this.renderList[0].subMeshes[0].isHidden = false;
        };
        this.cloudHeightTexture2.onAfterRender = function () {
            this.renderList[0].subMeshes[0].isHidden = true;
        };


        //Cloud height swap texture public
        this.cloudHeightMaterial3 = new CloudHeightMaterial("CloudHeightMaterial3", _config.world.scene);

        this.cloudHeightTexture3 = new BABYLON.RenderTargetTexture("CloudHeightTexture3",
                                                                   _config.sky.cloud.heightSize,
                                                                   _config.world.scene,
                                                                   {generateMipMaps: false,
                                                                    generateDepthBuffer: false},
                                                                  true, BABYLON.Engine.TEXTURETYPE_FLOAT);
        this.cloudHeightTexture3.material = this.cloudHeightMaterial3;
        this.cloudHeightTexture3.material.noiseTexture = this.noiseTexture;
        this.cloudHeightMesh3 = createVertexPassthroughMesh(this.cloudHeightTexture3.material,
                                                            _config.world.scene,
                                                            true, false);
        this.cloudHeightTexture3.renderList.push(this.cloudHeightMesh3);
        this.cloudHeightTexture3.onBeforeRender = function () {
            this.renderList[0].subMeshes[0].isHidden = false;
        };
        this.cloudHeightTexture3.onAfterRender = function () {
            this.renderList[0].subMeshes[0].isHidden = true;
        };



        this.cloudHeightTexture.material.swapTexture = this.cloudHeightTexture2;
        this.cloudHeightTexture2.material.swapTexture = this.cloudHeightTexture;
        this.cloudHeightTexture3.material.swapTexture = this.cloudHeightTexture2;

        //Cloud sun depth
        this.cloudSunDepthMaterial = new CloudSunDepthMaterial("CloudSunDepthMaterial", _config.world.scene);

        this.cloudSunDepthTexture = new BABYLON.RenderTargetTexture("CloudSunDepthTexture",
                                                                    _config.sky.cloud.depthSize,
                                                                    _config.world.scene,
                                                                    {generateMipMaps: false,
                                                                     generateDepthBuffer: false},
                                                                    true, BABYLON.Engine.TEXTURETYPE_FLOAT);
        this.cloudSunDepthTexture.material = this.cloudSunDepthMaterial;
        this.cloudSunDepthTexture.material.cloudHeightTexture = this.cloudHeightTexture3;
        this.cloudSunDepthMesh = createVertexPassthroughMesh(this.cloudSunDepthTexture.material,
                                                             _config.world.scene,
                                                             true, false);
        this.cloudSunDepthTexture.renderList.push(this.cloudSunDepthMesh);
        this.cloudSunDepthTexture.onBeforeRender = function () {
            this.renderList[0].subMeshes[0].isHidden = false;
        };
        this.cloudSunDepthTexture.onAfterRender = function () {
            this.renderList[0].subMeshes[0].isHidden = true;
        };

        //Cloud sun depth swap texture
        this.cloudSunDepthMaterial2 = new CloudSunDepthMaterial("CloudSunDepthMaterial2", _config.world.scene);

        this.cloudSunDepthTexture2 = new BABYLON.RenderTargetTexture("CloudSunDepthTexture2",
                                                                     _config.sky.cloud.depthSize,
                                                                     _config.world.scene,
                                                                     {generateMipMaps: false,
                                                                      generateDepthBuffer: false},
                                                                     true, BABYLON.Engine.TEXTURETYPE_FLOAT);
        this.cloudSunDepthTexture2.material = this.cloudSunDepthMaterial2;
        this.cloudSunDepthTexture2.material.cloudHeightTexture = this.cloudHeightTexture3;
        this.cloudSunDepthMesh2 = createVertexPassthroughMesh(this.cloudSunDepthTexture2.material,
                                                              _config.world.scene,
                                                              true, false);
        this.cloudSunDepthTexture2.renderList.push(this.cloudSunDepthMesh2);
        this.cloudSunDepthTexture2.onBeforeRender = function () {
            this.renderList[0].subMeshes[0].isHidden = false;
        };
        this.cloudSunDepthTexture2.onAfterRender = function () {
            this.renderList[0].subMeshes[0].isHidden = true;
        };


        //Cloud sun depth public swap texture
        this.cloudSunDepthMaterial3 = new CloudSunDepthMaterial("CloudSunDepthMaterial3", _config.world.scene);

        this.cloudSunDepthTexture3 = new BABYLON.RenderTargetTexture("CloudSunDepthTexture3",
                                                                     _config.sky.cloud.depthSize,
                                                                     _config.world.scene,
                                                                     {generateMipMaps: false,
                                                                      generateDepthBuffer: false},
                                                                     true, BABYLON.Engine.TEXTURETYPE_FLOAT);
        this.cloudSunDepthTexture3.material = this.cloudSunDepthMaterial3;
        this.cloudSunDepthTexture3.material.cloudHeightTexture = this.cloudHeightTexture3;
        this.cloudSunDepthMesh3 = createVertexPassthroughMesh(this.cloudSunDepthTexture3.material,
                                                              _config.world.scene,
                                                              true, false);
        this.cloudSunDepthTexture3.renderList.push(this.cloudSunDepthMesh3);
        this.cloudSunDepthTexture3.onBeforeRender = function () {
            this.renderList[0].subMeshes[0].isHidden = false;
        };
        this.cloudSunDepthTexture3.onAfterRender = function () {
            this.renderList[0].subMeshes[0].isHidden = true;
        };


        this.cloudSunDepthTexture.material.swapTexture = this.cloudSunDepthTexture2;
        this.cloudSunDepthTexture2.material.swapTexture = this.cloudSunDepthTexture;
        this.cloudSunDepthTexture3.material.swapTexture = this.cloudSunDepthTexture;
    }
    //Sky
    this.renderMaterial = new SkyMaterial("SkyMaterial", _config.world.scene, this.camera);

    this.renderTexture = new BABYLON.RenderTargetTexture("skyTexture",
                                                         _config.sky.params.textureSize,
                                                         _config.world.scene,
                                                         {generateMipMaps: false,
                                                          generateDepthBuffer: false},
                                                         true, BABYLON.Engine.TEXTURETYPE_FLOAT);
    this.renderTexture.material = this.renderMaterial;
    this.renderTexture.material.cloudTexture = this.cloudSunDepthTexture3;
    this.renderMesh = createVertexPassthroughMesh(this.renderTexture.material,
                                                  _config.world.scene,
                                                  true, false);
    this.renderTexture.renderList.push(this.renderMesh);
    this.renderTexture.onBeforeRender = function () {
        this.renderList[0].subMeshes[0].isHidden = false;
    };
    this.renderTexture.onAfterRender = function () {
        this.renderList[0].subMeshes[0].isHidden = true;
    };


    //Render
    this.material = new TextureMaterial("skyTextureMaterial", _config.world.scene, this);
    this.material.texture = this.renderTexture;
    this.mesh = createVertexPassthroughMesh(this.material,
                                            _config.world.scene,
                                            true, true);

    var lightPos = _config.sky.params.sunDir.clone();
    lightPos.x *= 100;
    lightPos.y *= 100;
    lightPos.z *= 100;
    var lightDir = _config.sky.params.sunDir.clone();
    lightDir.x *= -1;
    lightDir.y *= -1;
    lightDir.z *= -1;

    this.light = new Light(LightType_Directionnal, lightPos, lightDir);
    this.light.light.diffuse = new BABYLON.Color3(0.73, 0.75, 0.78);
    this.light.light.specular = new BABYLON.Color3(0.73, 0.75, 0.78);

    this.ambientLight = new Light(LightType_Hemispheric,
                                  new BABYLON.Vector3(0., 0., 0.),
                                  new BABYLON.Vector3(0., 1., 0.));
    this.ambientLight.light.diffuse = new BABYLON.Color3(0.73, 0.75, 0.78);
    this.ambientLight.light.specular = new BABYLON.Color3(0., 0., 0.);


    this.step = 0;
    this.lastPlayerPos = _config.player.position.clone();
    this.lastPlayerPosComputed = this.lastPlayerPos.clone();

    this.loaded = true;
    this.loading = true;
    this.loaderCallback = loaderCallback;
    this.loadingCallback = loadingCallback;
    this.loadingId = 0;
}

Sky.prototype.update = function(){
    if (!this.loaded){return;}

    if (this.withcloud){

        var cloudVel = 140.;
        var cloudDir = new BABYLON.Vector3(-1.0, 0.0, 0.0);
        var time = _config.time;

        var cloudDeltaPosXY = _config.sky.cloud.direction.scale(_config.sky.cloud.velocity*_config.time);
        var cloudDeltaPos = new BABYLON.Vector3(cloudDeltaPosXY.x, 0., cloudDeltaPosXY.y);



        var heightNb = 2;
        var nbOctave = 12;
        var offsetLast = 1;

        var depthNb = 1;//8;//32;
        var depthSize = 114;//448;

        if (this.step>=heightNb+depthNb){
            this.step -= heightNb+depthNb;
        }
        var s = this.step;

        if (this.loading){
            if (this.loadingId>=depthNb){
                this.loading=false;
                this.loaderCallback();
            }else{
                this.loadingCallback(this.loadingId/depthNb);
                this.loadingId++;
            }
        }

        var t = s-heightNb;

        if (s<heightNb){

            this.material.cloudSunDepthTexture = null;

            if (s==heightNb-1){
                this.material.cloudHeightTexture = this.cloudHeightTexture3;
            }else if ((s+heightNb)%2==0){
                this.material.cloudHeightTexture = this.cloudHeightTexture2;
            }else{
                this.material.cloudHeightTexture = this.cloudHeightTexture;
            }

            if (s==0){
                this.material.cloudHeightTexture.material.reset = true;
            }else{
                this.material.cloudHeightTexture.material.reset = false;
            }

            if (s==heightNb-1){
                this.material.cloudHeightTexture.material.end = true;
            }else{
                this.material.cloudHeightTexture.material.end = false;
            }

            this.material.cloudHeightTexture.material.octaveStart = (nbOctave+offsetLast)*s/heightNb;
            this.material.cloudHeightTexture.material.octaveEnd = (nbOctave+offsetLast)*(s+1)/heightNb;

            if (s==heightNb-1){
                this.material.cloudHeightTexture.material.octaveEnd = nbOctave;
            }

            if (s==heightNb-1){
                this.lastPlayerPosComputed = _config.player.position.add(cloudDeltaPos);
            }

        }else{

            this.material.cloudHeightTexture = null;

            if (t==depthNb-1){
                this.material.cloudSunDepthTexture = this.cloudSunDepthTexture3;
            }else if ((t+depthNb)%2==0){
                this.material.cloudSunDepthTexture = this.cloudSunDepthTexture;
            }else{
                this.material.cloudSunDepthTexture = this.cloudSunDepthTexture2;
            }

            if (t==0){
                this.material.cloudSunDepthTexture.material.reset = true;
            }else{
                this.material.cloudSunDepthTexture.material.reset = false;
            }

            this.material.cloudSunDepthTexture.material.nbStepTotal = depthSize;
            this.material.cloudSunDepthTexture.material.stepStart = t*depthSize/depthNb;
            this.material.cloudSunDepthTexture.material.stepEnd = (t+1)*depthSize/depthNb;

            if (t==depthNb-1){
                this.lastPlayerPos = this.lastPlayerPosComputed.clone();
            }
        }

        _config.sky.deltaPlayerPos = _config.player.position.subtract(this.lastPlayerPos).add(cloudDeltaPos);
        this.step++;

    }
    else
    {
        this.loading=false;
        this.loaderCallback();
    }

    var sunColor = this.computeSunColor();



    this.light.light.diffuse.r = this.light.light.specular.r =
         5.*(0.1+Math.min(Math.max(_config.sky.params.sunDir.y, -0.1), 0.1))*sunColor.r;
    this.light.light.diffuse.g = this.light.light.specular.g =
         5.*(0.1+Math.min(Math.max(_config.sky.params.sunDir.y, -0.1), 0.1))*sunColor.g;
    this.light.light.diffuse.b = this.light.light.specular.b =
         5.*(0.1+Math.min(Math.max(_config.sky.params.sunDir.y, -0.1), 0.1))*sunColor.b;


    _config.sky.params.sunColor.x = this.light.light.diffuse.r;
    _config.sky.params.sunColor.y = this.light.light.diffuse.g;
    _config.sky.params.sunColor.z = this.light.light.diffuse.b;

    var ambientFactor = 0.45;
    this.ambientLight.light.diffuse.r = this.light.light.diffuse.r*ambientFactor;
    this.ambientLight.light.diffuse.g = this.light.light.diffuse.g*ambientFactor;
    this.ambientLight.light.diffuse.b = this.light.light.diffuse.b*ambientFactor;


    var lightPos = _config.sky.params.sunDir.clone();
    lightPos.x *= 1000;
    lightPos.y *= 1000;
    lightPos.z *= 1000;

    var period = 1.;

    lightPos.subtractInPlace(_config.player.position);//.mod(period));

    var lightDir = _config.sky.params.sunDir.clone();
    lightDir.x *= -1;
    lightDir.y *= -1;
    lightDir.z *= -1;

    this.light.light.position = lightPos;
    this.light.light.direction = lightDir;

}

Sky.prototype.atmosphereIntersectionPoint = function(pos, dir)
{

  var dp = new BABYLON.Vector3(pos.x, pos.y+_config.sky.params.earthRadius, pos.z);
  var r = _config.sky.params.earthRadius + _config.sky.params.atmosphereRadius;

  var a = dir.x*dir.x + dir.y*dir.y + dir.z*dir.z;
  var b = 2.*(dir.x*dp.x + dir.y*dp.y + dir.z*dp.z);
  var c = dp.x*dp.x + dp.y*dp.y + dp.z*dp.z - r*r;

  var d = Math.sqrt(b*b-4.0*a*c);

  var x1 = (-b-d)/(2.*a);
  var x2 = (-b+d)/(2.*a);

  var alpha = Math.max(x1, x2);

  return new BABYLON.Vector3(pos.x + alpha*dir.x,
                             pos.y + alpha*dir.y,
                             pos.z + alpha*dir.z);
}

Sky.prototype.computeSunColor = function(){
    var sunColor = new BABYLON.Color3(_config.sky.params.sunLight.x,
                                      _config.sky.params.sunLight.y,
                                      _config.sky.params.sunLight.z);

    var eyePos = _config.world.cameraPos;

    var atmPos = this.atmosphereIntersectionPoint(eyePos, _config.sky.params.sunDir);

    var dist = Math.sqrt( Math.pow(eyePos.x-atmPos.x, 2)
                        + Math.pow(eyePos.y-atmPos.y, 2)
                        + Math.pow(eyePos.z-atmPos.z, 2));


    var phaseRayleigh = (3.*2.)/(16.*_pi);

    var g = _config.sky.params.mieExentricity  - _config.sky.params.mieAerosolScaleMax * (1.-Math.max(Math.min(_config.sky.params.sunDir.y, _config.sky.params.mieAerosolDistMax), 0.)/_config.sky.params.mieAerosolDistMax);
    var a = 1.-g;
    var b = a*a/(4.*_pi);
    var c = 1.+g*g-2*g;
    var phaseMie = b/Math.pow(c, 1.5);

    var cosGamma = ((eyePos.y-atmPos.y)/dist);
    var phaseAerosol = Math.pow(Math.abs(1.-Math.max(cosGamma, 0.)), 4.) * _config.sky.params.aerosolFactor;

    var inScatX = _config.sky.params.betaRayleight.x * phaseRayleigh + _config.sky.params.betaMie.x * phaseMie + _config.sky.params.betaAerosol.x * phaseAerosol;
    var inScatY = _config.sky.params.betaRayleight.y * phaseRayleigh + _config.sky.params.betaMie.y * phaseMie + _config.sky.params.betaAerosol.y * phaseAerosol;
    var inScatZ = _config.sky.params.betaRayleight.z * phaseRayleigh + _config.sky.params.betaMie.z * phaseMie + _config.sky.params.betaAerosol.z * phaseAerosol;

    var factor = 0.35;

    sunColor.r *= Math.min(factor*inScatX*(Math.exp(dist*_config.sky.params.betaOutScat.x*_config.sky.params.outScatFactor)), 1.);
    sunColor.g *= Math.min(factor*inScatY*(Math.exp(dist*_config.sky.params.betaOutScat.y*_config.sky.params.outScatFactor)), 1.);
    sunColor.b *= Math.min(factor*inScatZ*(Math.exp(dist*_config.sky.params.betaOutScat.z*_config.sky.params.outScatFactor)), 1.);

    return sunColor;
}

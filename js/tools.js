var debug = true;

function assert(statement, text){
    if (debug){
        if (!statement()){
            try { throw new Error('dummy'); } catch (e) { $.error(text+'\n\n'+e.stack); }
        }
    }
}

function warning(text){
    if (debug){
        try { throw new Error('dummy'); } catch (e) { console.warn(text+'\n\n'+e.stack); }
    }
}

Number.prototype.mod = function(n){ return ((this%n)+n)%n; }

function sign(x) { return x > 0 ? 1 : -1; }

function onReady(elem, func, refreshTime)
{
   if (refreshTime==null){
       refreshTime = 200;
   }
   if (elem.isReady()){
       func();
   }else{
       var timeout = setTimeout(function()
       {
           clearTimeout(timeout);
           onReady(elem, func, refreshTime);
       }, refreshTime);
   }
}

function replaceStandardMaterial(materials, id, newMat, mesh, isHidden, isHiddenScreen)
{
    var diffuseTexture = materials[id].diffuseTexture;
    var bumpTexture = materials[id].bumpTexture;
    var backFaceCulling = materials[id].backFaceCulling;
    var alphaBlending = materials[id].needAlphaBlending();
    var alphaTesting = materials[id].needAlphaTesting();
    var alpha = materials[id].alpha;

    materials[id] = newMat;
    materials[id].diffuseTexture = diffuseTexture;
    materials[id].bumpTexture = bumpTexture;
    materials[id].backFaceCulling = backFaceCulling;
    materials[id].alphaBlending = alphaBlending;
    materials[id].alphaTesting = alphaTesting;
    materials[id].alpha = alpha;

    mesh.subMeshes[id].isHidden = isHidden;
    mesh.subMeshes[id].isHiddenScreen = isHiddenScreen;
}

function addMaterialToMesh(material, mesh, isHidden, isHiddenScreen)
{
    mesh.material.subMaterials.push(material);
    var submesh = new BABYLON.SubMesh(mesh.material.subMaterials.length-1,
                                      0, mesh.getTotalVertices(),
                                      0, mesh.getIndices().length,
                                      mesh);
    mesh.subMeshes[mesh.subMeshes.length-1].isHidden = isHidden;
    mesh.subMeshes[mesh.subMeshes.length-1].isHiddenScreen = isHiddenScreen;
}

function convertIntoMultiMaterialMesh(mesh, scene)
{
    if (!(mesh.material instanceof BABYLON.MultiMaterial)){
        var previousMaterial = mesh.material;

        mesh.material = new BABYLON.MultiMaterial("multi"+mesh.name, scene);

        if (previousMaterial){
            mesh.material.subMaterials.push(previousMaterial);
        }
    }
}

function onBeforeRenderMultiMatMesh(texture, func){
    return function(){
        for(var i=0; i<texture.subMeshIdList.length; ++i)
        {
            for(var j=0; j<texture.meshList[i].subMeshes.length; ++j)
            {
                if (j==texture.subMeshIdList[i])
                {
                    texture.meshList[i].subMeshes[j].isHidden = false;
                }
                else
                {
                    //texture.renderList[i].subMeshes[j].previousIsHidden = texture.renderList[i].subMeshes[j].isHidden;
                    //texture.renderList[i].subMeshes[j].isHidden = true;
                }
            }
        }
        if (func){
            func();
        }
    }
}
function onAfterRenderMultiMatMesh(texture, func){
    return function(){
        for(var i=0; i<texture.subMeshIdList.length; ++i)
        {
            for(var j=0; j<texture.meshList[i].subMeshes.length; ++j)
            {
                if (j==texture.subMeshIdList[i])
                {
                    texture.meshList[i].subMeshes[j].isHidden = true;
                }
                else
                {
                    //texture.renderList[i].subMeshes[j].isHidden = texture.renderList[i].subMeshes[j].previousIsHidden;
                }
            }
        }
        if (func){
            func();
        }
    }
}


function createVertexPassthroughMesh(material, scene, isVisible, isVisibleScreen)
{
    var mesh = new BABYLON.Mesh("passthrough", scene);
    var indices = [0, 2, 1,
                   0, 2, 3];
    var positions = [0, 0, 0,
                     0, 0, 0,
                     0, 0, 0,
                     0, 0, 0];
    var uvs = [-1, -1,
               -1,  1,
                1,  1,
                1, -1];

    mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions, false);
    mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs, false);
    mesh.setIndices(indices);

    mesh.material = material;
    mesh.subMeshes[0].isHidden = isVisible?false:true;
    mesh.subMeshes[0].isHiddenScreen = isVisibleScreen?false:true;
    mesh.isInFrustum = function(){return true;};
    return mesh;
}

function createRenderTargetTexture(name, sampling, scene, configs,
                                   material, renderMaterial,
                                   mesh)
{
    var tex = new BABYLON.RenderTargetTexture(name, sampling, scene, configs);
    tex.material = material;
    tex.subMeshIdList = [];
    tex.meshList = [];
    renderMaterial[name] = tex;

    if (mesh == "passthrough"){
        tex.renderList.push(createVertexPassthroughMesh(material, scene));
        tex.onBeforeRender = function () {
            this.renderList[0].subMeshes[0].isHidden = false;
        };
        tex.onAfterRender = function () {
            this.renderList[0].subMeshes[0].isHidden = true;
        };
    }else if(mesh instanceof BABYLON.Mesh){
        tex.renderList.push(mesh);
        tex.meshList.push(mesh);
        convertIntoMultiMaterialMesh(mesh, scene);
        addMaterialToMesh(material, mesh, true, true);
        tex.subMeshIdList.push(mesh.subMeshes.length-1);
        tex.onBeforeRender = onBeforeRenderMultiMatMesh(tex);
        tex.onAfterRender = onAfterRenderMultiMatMesh(tex);
    }else{
        tex.onBeforeRender = onBeforeRenderMultiMatMesh(tex);
        tex.onAfterRender = onAfterRenderMultiMatMesh(tex);
    }
    return tex;
}

function FpsLogger(){
    this.startTime = {};
    this.endTime = {};
    this.duration = {};
    this.itteration = {};

    this.lastLog = 0;
    this.shouldLog = false;
    this.logDelay = 500;
}

FpsLogger.prototype.start = function(id)
{
    if (_showFps){
        _gl.finish();
        //this.startTime[id] = (new Date).getTime();
        this.startTime[id] = performance.now();
    }
}

FpsLogger.prototype.end = function(id, log)
{
    if (_showFps){
        _gl.finish();
        //this.endTime[id] = (new Date).getTime();
        this.endTime[id] = performance.now();

        if (log){
            this.log(id);
        }
    }
}

FpsLogger.prototype.log = function(id)
{
    if (_showFps){
        var duration = this.endTime[id]-this.startTime[id];

        if (this.itteration[id]>0.){
            this.itteration[id]+=1.;
        }else{
            this.itteration[id]=1.;
        }


        if (this.duration[id]){
            this.duration[id] += duration;
        }else{
            this.duration[id] = duration;
        }
    }
}

FpsLogger.prototype.reset = function()
{
    if (_showFps){
        this.shouldLog = false;
        var t = (new Date).getTime();
        if (t>this.lastLog+this.logDelay){
            //console.clear();
            //console.log("\n\n");
            if (_profilerOutput){
                _profilerOutput.html('<div style="height:8px;"></div><table>');
            }

            this.lastLog = (new Date).getTime();
            this.shouldLog = true;

            for (var id in this.duration){
              var duration = (Math.ceil(this.duration[id]*100./this.itteration[id])/100.);

              var percent = (Math.ceil(duration*1000/_config.world.realPeriodMs)/10.);
              //console.log(id+": "+duration+" ms");
              if (_profilerOutput){
                  _profilerOutput.append('<tr><td style="padding-right:10px;padding-left:8px;">'+id+'</td>\
                                          <td style="padding-right:10px;">'+duration+' ms</td>\
                                          <td style="padding-right:8px;">'+percent+' %</td></tr>');
              }
              _profilerOutput.append('</table>');
            }
        }
    }
    else
    {
        this.duration = {};
        this.itteration = {};
    }
}


function ProjectedGrid(camera)
{
    this.minPosLeft = new BABYLON.Vector3(0., 0., 0.);
    this.minPosRight = new BABYLON.Vector3(0., 0., 0.);
    this.maxPosLeft = new BABYLON.Vector3(0., 0., 0.);
    this.maxPosRight = new BABYLON.Vector3(0., 0., 0.);

    this.depth = -1.;

    this.marginX = 1.1;
    this.planeHeight = 0.;

    this.marginY = null;
    this.marginYMax = 1.4;
    this.marginYMin = 1.2;

    this.alphaProjection = 1.;
    this.horizonFactor = 0.975;
    this.horizonEyePosY = 900.;

    this.camera = camera;
}

ProjectedGrid.prototype.compute = function(eyePos, transform, invTransform, clamp, project)
{
    var marginY = this.marginY;
    if (!marginY)
    {
      assert(function(){return this.camera instanceof Camera;}.bind(this), 'camera is not a Camera');

      var minHeight = this.camera.getMinHeight();
      var maxHeight = this.camera.getMaxHeight();
      marginY = this.marginYMin + (this.marginYMax-this.marginYMin)*(1.-(eyePos.y-minHeight)/(maxHeight-minHeight));
    }
    if (eyePos.y>this.planeHeight){
        this.minPosLeft = this.clipSpaceToWorldSpace(new BABYLON.Vector3(0., 0.), invTransform, marginY);
        this.minPosRight = this.clipSpaceToWorldSpace(new BABYLON.Vector3(1., 0.), invTransform, marginY);
        this.maxPosLeft = this.clipSpaceToWorldSpace(new BABYLON.Vector3(0., 1.), invTransform, marginY);
        this.maxPosRight = this.clipSpaceToWorldSpace(new BABYLON.Vector3(1., 1.), invTransform, marginY);

        if (clamp && this.maxPosLeft.y-eyePos.y>-this.horizonEyePosY)
        {
            var horizonFactor = this.horizonFactor;
            this.alphaProjection = horizonFactor*(eyePos.y-this.minPosLeft.y)/(this.maxPosLeft.y-this.minPosLeft.y);
            this.maxPosLeft = this.maxPosLeft.subtract(this.minPosLeft).scale(this.alphaProjection).add(this.minPosLeft);
            this.maxPosRight = this.maxPosRight.subtract(this.minPosRight).scale(this.alphaProjection).add(this.minPosRight);
        }
    }else{
        this.minPosLeft = this.clipSpaceToWorldSpace(new BABYLON.Vector3(0., 0.), invTransform, marginY);
        this.minPosRight = this.clipSpaceToWorldSpace(new BABYLON.Vector3(1., 0.), invTransform, marginY);
        this.maxPosLeft = this.clipSpaceToWorldSpace(new BABYLON.Vector3(0., 1.), invTransform, marginY);
        this.maxPosRight = this.clipSpaceToWorldSpace(new BABYLON.Vector3(1., 1.), invTransform, marginY);


        if (clamp && this.minPosLeft.y-eyePos.y<this.horizonEyePosY)
        {
            var horizonFactor = this.horizonFactor;
            this.alphaProjection = horizonFactor*(eyePos.y-this.maxPosLeft.y)/(this.minPosLeft.y-this.maxPosLeft.y);
            this.minPosLeft = this.minPosLeft.subtract(this.maxPosLeft).scale(this.alphaProjection).add(this.maxPosLeft);
            this.minPosRight = this.minPosRight.subtract(this.maxPosRight).scale(this.alphaProjection).add(this.maxPosRight);
        }
    }

    if (project){
        this.minPosLeft = this.projectOnYPlane(this.minPosLeft, eyePos);
        this.minPosRight = this.projectOnYPlane(this.minPosRight, eyePos);
        this.maxPosLeft = this.projectOnYPlane(this.maxPosLeft, eyePos);
        this.maxPosRight = this.projectOnYPlane(this.maxPosRight, eyePos);
    }

}

ProjectedGrid.prototype.clipSpaceToWorldSpace = function(uv, invTransform, marginY)
{
    var coord = new BABYLON.Vector3(2*uv.x-1, 2*uv.y-1, this.depth);
    coord.y = marginY*(coord.y-1.)+1.;
    coord.x = this.marginX*coord.x;
    coord = BABYLON.Vector3.TransformCoordinates(coord, invTransform);
    return coord;
};

ProjectedGrid.prototype.projectOnYPlane = function(pos, eyePos)
{
   var eyeToPosDir = pos.subtract(eyePos);
   var projectedPos = new BABYLON.Vector3(eyePos.x, 0.0, eyePos.z);
   projectedPos.x -= eyePos.y*eyeToPosDir.x/eyeToPosDir.y;
   projectedPos.z -= eyePos.y*eyeToPosDir.z/eyeToPosDir.y;
   return projectedPos;
};

$.event.special.hoverintent = {
    setup: function() {
        $( this ).bind( "mouseover", jQuery.event.special.hoverintent.handler );
    },
    teardown: function() {
        $( this ).unbind( "mouseover", jQuery.event.special.hoverintent.handler );
    },
    handler: function( event ) {
        var currentX, currentY, timeout,
                args = arguments,
                target = $( event.target ),
                previousX = event.pageX,
                previousY = event.pageY;
        function track( event ) {
            currentX = event.pageX;
            currentY = event.pageY;
        };
        function clear() {
            target
            .unbind( "mousemove", track )
            .unbind( "mouseout", clear );
            clearTimeout( timeout );
        }
        function handler() {
            var prop,
                    orig = event;
            if ( ( Math.abs( previousX - currentX ) +
                  Math.abs( previousY - currentY ) ) < 7 ) {
                clear();
                event = $.Event( "hoverintent" );
                for ( prop in orig ) {
                    if ( !( prop in event ) ) {
                        event[ prop ] = orig[ prop ];
                    }
                }
                // Prevent accessing the original event since the new event
                // is fired asynchronously and the old event is no longer
                // usable (#6028)
                delete event.originalEvent;
                target.trigger( event );
            } else {
                previousX = currentX;
                previousY = currentY;
                timeout = setTimeout( handler, 100 );
            }
        }
        timeout = setTimeout( handler, 100 );
        target.bind({
                        mousemove: track,
                        mouseout: clear
                    });
    }
};

Function.prototype.clone = function() {
    var that = this;
    function newThat() {
        return (new that(
                    arguments[0],
                    arguments[1],
                    arguments[2],
                    arguments[3],
                    arguments[4],
                    arguments[5],
                    arguments[6],
                    arguments[7],
                    arguments[8],
                    arguments[9]
                    ));
    }
    function __clone__() {
        if (this instanceof __clone__) {
            return newThat.apply(null, arguments);
        }
        return that.apply(this, arguments);
    }
    for(var key in this ) {
        if (this.hasOwnProperty(key)) {
            __clone__[key] = this[key];
        }
    }
    return __clone__;
};

function computeOrthoTransformMatrix(pos, dir, width, height, depth){

  var screenToWorld = new BABYLON.Matrix();


  var n = dir.clone();
  n.normalize();

  var t = new BABYLON.Vector3(0., 0., 0.);

  if (n.x==0.){
    t.x = 1.;
    t.y = 0.;
    t.z = 0.;
  }else if (n.y==0.){
    t.x = 0.;
    t.y = 1.;
    t.z = 0.;
  }else if (n.z==0.){
    t.x = 0.;
    t.y = 0.;
    t.z = 1.;
  }else{
    t.x = 1./n.x;
    t.y = -2./n.y;
    t.z = 1./n.z;
    t.normalize();
  }

  var b = BABYLON.Vector3.Cross(n, t);

  t.scaleInPlace(width);
  b.scaleInPlace(height);
  n.scaleInPlace(depth);

  screenToWorld.m[3] = 0.;
  screenToWorld.m[7] = 0.;
  screenToWorld.m[11] = 0.;

  screenToWorld.m[0] = t.x;
  screenToWorld.m[1] = t.y;
  screenToWorld.m[2] = t.z;

  screenToWorld.m[4] = b.x;
  screenToWorld.m[5] = b.y;
  screenToWorld.m[6] = b.z;

  screenToWorld.m[8] = n.x;
  screenToWorld.m[9] = n.y;
  screenToWorld.m[10] = n.z;

  screenToWorld.m[12] = pos.x;
  screenToWorld.m[13] = pos.y;
  screenToWorld.m[14] = pos.z;
  screenToWorld.m[15] = 1.;




  var worldToScreen = screenToWorld.clone();
  worldToScreen.invert();


  return worldToScreen;
}



function createGrid(name, subdivisions, uvXMin, uvXMax, uvYMin, uvYMax, scene, updatable, powY, scaleX, scaleY)
{
    if (!scaleX){scaleX = 1.};
    if (!scaleY){scaleY = 1.};

    var ground = new BABYLON.Mesh(name, scene);

    var indices = [];
    var positions = [];
    var uvs = [];
    var row, col;

    var subX = parseInt(subdivisions*scaleX);
    var subY = parseInt(subdivisions*scaleY);

    for (row = 0; row <= subY; row++) {
        for (col = 0; col <= subX; col++) {
            positions.push(0, 0, 0);
            var uvX = uvXMin + (uvXMax - uvXMin) * col / subX;
            var uvY = uvYMin + (uvYMax - uvYMin) * row / subY;
            uvX = uvX * 0.99;
            uvY = uvY * 0.99;
            if (powY!=null){
                uvY = Math.pow(uvY, powY);
            }
            uvs.push(uvX, uvY);
        }
    }

    for (row = 0; row < subY; row++) {
        for (col = 0; col < subX; col++) {
            indices.push(col + 1 + (row + 1) * (subX + 1));
            indices.push(col + 1 + row * (subX + 1));
            indices.push(col + row * (subX + 1));

            indices.push(col + (row + 1) * (subX + 1));
            indices.push(col + 1 + (row + 1) * (subX + 1));
            indices.push(col + row * (subX + 1));
        }
    }

    ground.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions, updatable);
    ground.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs, updatable);
    ground.setIndices(indices);

    return ground;
}

function Grid()
{
    this.positions = [];
    this.indices = [];
    this.uv2s = [];

    this.clippedPositions = [];
    this.clippedIndices = [];
    this.clippedUv2s = [];

    this.reorderedPositions = [];
    this.reorderedUv2s = [];

    this.transitionSizeBot = 1;
    this.transitionSizeTop = 2;
    this.nbUnit = 2;
}

//Number of points in a square of radius r
Grid.prototype.n = function(r)
{
    return 4*r*r+4*r+1;
}

//Number of points in a square of radius r and lod l
Grid.prototype.N = function(r, l)
{
    if (l==0){
        return 0;
    }else if (l==1){
        return this.n(r);
    }else{
        var lMin = parseInt(this.nbUnit/2-this.transitionSizeTop);
        var t = this.n(this.nbUnit+this.transitionSizeBot);

        for(var m=2; m<l; m++){
            t += this.n(this.nbUnit+this.transitionSizeBot) - this.n(lMin)
        }

        t += this.n(r) - this.n(lMin);

        return t;
    }
}

//Position of a point i in the ring of radius r and lod l
Grid.prototype.p = function(i, r, l)
{
    if (r==0){
        return 0;
    }else{
        return this.N(r-1, l)+i%(8*r);
    }
}

//Push the indices of a normal square
Grid.prototype.f4 = function(a0, a1, b0, b1, invert)
{
    if (!invert){
        this.indices.push(a0, a1, b0);
        this.indices.push(b0, a1, b1);
    }else{
        this.indices.push(a0, a1, b1);
        this.indices.push(b0, a0, b1);
    }
}

//Push the indices of a corner square
Grid.prototype.f4s = function(a0, b0, b1, b2, invert)
{
    if (!invert){
        this.indices.push(a0, b0, b2);
        this.indices.push(b1, b0, b2);
    }else{
        this.indices.push(a0, b0, b1);
        this.indices.push(b1, a0, b2);
    }
}

Grid.prototype.createGrid = function(unitSize, nbUnit, finalNbUnit, nbLod, lodMin, withoutIndices)
{

    this.positions = [];
    this.indices = [];
    this.uv2s = [];
    this.nbUnit = nbUnit;

    this.positions.push(0., 0., 0.);

    for (var l = 1; l <= nbLod; l++){
        var s = unitSize * Math.pow(2, l-1);
        var radiusMin = 1;
        var radiusMax = this.nbUnit+this.transitionSizeBot;
        if (l>1){
            radiusMin = parseInt(this.nbUnit/2+1-this.transitionSizeTop);
        }
        if (l==nbLod){
            var radiusMax = finalNbUnit;
        }

        for(var r = radiusMin; r <= radiusMax; r++){
            var factor = Math.min(1., (r-radiusMin)/(radiusMax-radiusMin));
            var s3 = Math.floor(s*(1.5+1.5*Math.pow(factor, 2.)));

            //Parameters
            for(var j = 0; j < 8*r; j++){
                this.uv2s.push(s, s3);
            }

            //Positions
            for(var j = 0; j < r; j++){
                this.positions.push(j*s,
                                    0.,
                                    r*s);
            }
            for(var j = 0; j < 2*r; j++){
                this.positions.push(r*s,
                                    0.,
                                    (r-j)*s);
            }
            for(var j = 0; j < 2*r; j++){
                this.positions.push((r-j)*s,
                                    0.,
                                    -r*s);
            }
            for(var j = 0; j < 2*r; j++){
                this.positions.push(-r*s,
                                    0.,
                                    (-r+j)*s);
            }
            for(var j = 0; j < r; j++){
                this.positions.push((-r+j)*s,
                                    0.,
                                    r*s);
            }

            //Triangles
            if (!(l>1 && r == radiusMin) && !withoutIndices){
                for(var j = 0; j < r-1; j++){
                    this.f4(this.p(j  , r-1, l),
                            this.p(j+1, r-1, l),
                            this.p(j  , r, l),
                            this.p(j+1, r, l));
                }
                this.f4s(this.p(r-1, r-1, l),
                         this.p(r-1, r, l),
                         this.p(r  , r, l),
                         this.p(r+1, r, l));
                for(var j = 0; j < 2*r-2; j++){
                    this.f4(this.p(r+j-1, r-1, l),
                            this.p(r+j  , r-1, l),
                            this.p(r+j+1, r, l),
                            this.p(r+j+2, r, l), true);
                }
                this.f4s(this.p(3*r-3, r-1, l),
                         this.p(3*r-1, r, l),
                         this.p(3*r  , r, l),
                         this.p(3*r+1, r, l), true);
                for(var j = 0; j < 2*r-2; j++){
                    this.f4(this.p(3*r+j-3, r-1, l),
                            this.p(3*r+j-2, r-1, l),
                            this.p(3*r+j+1, r, l),
                            this.p(3*r+j+2, r, l));
                }
                this.f4s(this.p(5*r-5, r-1, l),
                         this.p(5*r-1, r, l),
                         this.p(5*r  , r, l),
                         this.p(5*r+1, r, l));
                for(var j = 0; j < 2*r-2; j++){
                    this.f4(this.p(5*r+j-5, r-1, l),
                       this.p(5*r+j-4, r-1, l),
                       this.p(5*r+j+1, r, l),
                       this.p(5*r+j+2, r, l), true);
                }
                this.f4s(this.p(7*r-7, r-1, l),
                         this.p(7*r-1, r, l),
                         this.p(7*r  , r, l),
                         this.p(7*r+1, r, l), true);
                for(var j = 0; j < r-1; j++){
                    this.f4(this.p(7*r+j-7, r-1, l),
                            this.p(7*r+j-6, r-1, l),
                            this.p(7*r+j+1, r, l),
                            this.p(7*r+j+2, r, l));
                }
            }
        }
    }
}

Grid.prototype.isInFrustrum = function(x, z, beta, betaRange, betaCenterDist, distMin)
{
    x -= Math.cos(beta)*betaCenterDist;
    z -= Math.sin(beta)*betaCenterDist;

    var angle = Math.atan2(z, x);
    var distAngle = Math.min(Math.abs(angle+beta), Math.abs(angle-beta));

    var dist = x*Math.cos(beta)+z*Math.sin(beta);

    return (distAngle<betaRange && dist>distMin);
}

Grid.prototype.clip = function(beta, betaRange, betaCenterDist, distMin, withoutIndices, useReorderedPositions)
{
    var position = useReorderedPositions ? this.reorderedPositions : this.positions;
    var uv2s = useReorderedPositions ? this.reorderedUv2s : this.uv2s;

    beta = beta%(2*_pi);
    if (beta>_pi){
        beta -= 2*_pi;
    }

    this.clippedPositions = [];
    this.clippedUv2s = [];
    this.clippedIndices = [];

    var positionToPositionClamped = [];
    {
        var s = parseInt(position.length/3);
        var j = 0;
        for(var i=0; i<s; i++){
            if (this.isInFrustrum(position[3*i], position[3*i+2],
                                  beta, betaRange, betaCenterDist, distMin)
            ){
                this.clippedPositions.push(position[3*i], position[3*i+1], position[3*i+2]);
                this.clippedUv2s.push(uv2s[2*i], uv2s[2*i+1]);
                positionToPositionClamped[i] = j;
                j++;
            }
        }
    }

    if (!withoutIndices || useReorderedPositions){
        var s = parseInt(this.indices.length/3);
        for(var i=0; i<s; ++i){
            if ( positionToPositionClamped[this.indices[3*i]]!==undefined
              && positionToPositionClamped[this.indices[3*i+1]]!==undefined
              && positionToPositionClamped[this.indices[3*i+2]]!==undefined
            ){
                this.clippedIndices.push(positionToPositionClamped[this.indices[3*i]],
                                         positionToPositionClamped[this.indices[3*i+1]],
                                         positionToPositionClamped[this.indices[3*i+2]]);
            }
        }
    }
}

Grid.prototype.reorderPosition = function()
{
    var positions = this.positions;
    var uv2s = this.uv2s;

    var radius = 0.;
    var count = [];
    for(var i=0; i<positions.length/3.; i++){
        count.push({
                       val:Math.sqrt(positions[3*i]*positions[3*i]+positions[3*i+2]*positions[3*i+2]),
                       id: i
        });
    }
    count.sort(function(a, b){
        if (a.val<b.val){
            return 1;
        }
        if (a.val>b.val){
            return -1;
        }
        return 0;
    });

    this.reorderedPositions = [];
    this.reorderedUv2s = [];

    for (var i=0; i<count.length; i++){
        this.reorderedPositions.push(positions[3*count[i].id],
                                     positions[3*count[i].id+1],
                                     positions[3*count[i].id+2]);
        this.reorderedUv2s.push(uv2s[2*count[i].id],
                                uv2s[2*count[i].id+1]);
    }
}

Grid.prototype.makeLodMeshes = function(name, relativePositions, relativeUvs, relativeIndices,
                                        scene, updatable)
{
    var positions = this.clippedPositions;
    var uv2s = this.clippedUv2s;

    var meshesPositions = [];
    var meshesUv2s = [];
    var meshesUvs = [];
    var meshesIndices = [];

    var verticesNumber = relativePositions.length/3;
    for (var i=0; i<positions.length/3; i++){
        for(var j=0; j<verticesNumber; j++){
            meshesPositions.push(0*relativePositions[3*j]+positions[3*i],
                                 relativePositions[3*j],//0.*relativePositions[3*j+1]+positions[3*i+1],
                                 0*relativePositions[3*j+2]+positions[3*i+2]);
            meshesUv2s.push(uv2s[2*i],
                            uv2s[2*i+1]);
            meshesUvs.push(relativeUvs[2*j],
                           relativeUvs[2*j+1]);
        }
        for(var j=0; j<relativeIndices.length; j++){
            meshesIndices.push(relativeIndices[j]+verticesNumber*i);
        }
    }


    var mesh = new BABYLON.Mesh(name, scene);
    mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, meshesPositions, updatable);
    mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, meshesUvs, updatable);
    mesh.setVerticesData(BABYLON.VertexBuffer.UV2Kind, meshesUv2s, updatable);
    mesh.setIndices(meshesIndices);
    //console.log(Math.round(Math.sqrt(meshesPositions.length/3))+"^2");

    return mesh;
}

Grid.prototype.makeClippedMesh = function(name, scene, updatable)
{
    var mesh = new BABYLON.Mesh(name, scene);
    mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, this.clippedPositions, updatable);
    mesh.setVerticesData(BABYLON.VertexBuffer.UV2Kind, this.clippedUv2s, updatable);
    mesh.setIndices(this.clippedIndices);
    //console.log(Math.round(Math.sqrt(this.clippedPositions.length/3))+"^2");
    return mesh;
}


function createImpostorTextures(dir, name, textureSize, renderMat, scene)
{
    var tex = {
      colorMap: null,
      normalMap: null
    };

    tex.colorMap = createRenderTargetTexture(name+"_color_texture",
                                             textureSize,
                                             scene,
                                             {
                                                 generateMipMaps: true,
                                                 enableTextureFloat: false,
                                                 generateDepthBuffer: false
                                             },
                                             null,
                                             renderMat,
                                             null);

    tex.normalMap = createRenderTargetTexture(name+"_normal_texture",
                                             textureSize,
                                             scene,
                                             {
                                                 generateMipMaps: true,
                                                 enableTextureFloat: false,
                                                 generateDepthBuffer: false
                                             },
                                             null,
                                             renderMat,
                                             null);

    BABYLON.SceneLoader.ImportMesh("", dir, name+".babylon", scene, function (newMeshes, particleSystems) {
        for( var i=0; i<newMeshes.length; i++){
          convertIntoMultiMaterialMesh(newMeshes[i], scene);
          newMeshes[i].isInFrustum = function(){return true;};

          var nbSubMeshes = newMeshes[i].subMeshes.length;
          for (var j=0; j<nbSubMeshes; j++){
            newMeshes[i].subMeshes[j].isInFrustum = function(){return true;};

            //Duplicate the materials (we have 2 maps)
            newMeshes[i].subMeshes[j].clone(newMeshes[i], newMeshes[i]);
            newMeshes[i].subMeshes[j+nbSubMeshes].materialIndex+=nbSubMeshes;
            newMeshes[i].material.subMaterials.push(newMeshes[i].material.subMaterials[j].clone());
            //Add the color map material
            replaceStandardMaterial(newMeshes[i].material.subMaterials, j,
                                    new ImpostorGeneratorMaterial(name+"_"+j+"_color", scene, true),
                                    newMeshes[i], true, true);
            tex.colorMap.subMeshIdList.push(j);
            tex.colorMap.meshList.push(newMeshes[i]);

            //Add the normal map material
            replaceStandardMaterial(newMeshes[i].material.subMaterials, j+nbSubMeshes,
                                    new ImpostorGeneratorMaterial(name+"_"+j+"_normal", scene,
                                                                  false),
                                    newMeshes[i], true, true);
            tex.normalMap.subMeshIdList.push(j+nbSubMeshes);
            tex.normalMap.meshList.push(newMeshes[i]);
          }
          //Add the mesh to the render list
          tex.colorMap.renderList.push(newMeshes[i]);
          tex.normalMap.renderList.push(newMeshes[i]);
        }
    });

    return tex;
}








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

function sign(x) {
    return x > 0 ? 1 : -1;
}

function log(x, i) {
    return Math.log(x) / Math.log(i);
}

var clamp = function(num, min, max) {
    return num < min ? min : (num > max ? max : num);
};

function smoothstep(edge0, edge1, x)
{
    // Scale, bias and saturate x to 0..1 range
    var t = clamp((x - edge0)/(edge1 - edge0), 0.0, 1.0);
    // Evaluate polynomial
    return t*t*(3 - 2*t);
}

function mix(x, y, a)
{
  return x*(1.-a)+y*a;
}

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
    //materials[id].alphaBlending = alphaBlending;
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

function setMeshRenderPriority(mesh, priority)
{
    for (i = 0; i < mesh.subMeshes.length; i++) {
        var submesh = mesh.subMeshes[i].renderPriority = priority;
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

function createRenderTargetTexture(name, sampling, scene, configs, textureFloat,
                                   material, renderMaterial,
                                   mesh)
{
    var tex = new BABYLON.RenderTargetTexture(name, sampling, scene, configs, true, textureFloat?BABYLON.Engine.TEXTURETYPE_FLOAT:null);
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
    this.order = {};

    this.lastLog = 0;
    this.shouldLog = false;
    this.logDelay = 500;

    this.orderNb = 0;
}

FpsLogger.prototype.start = function(id)
{
    if (_showFps){
        _gl.finish();
        //this.startTime[id] = (new Date).getTime();
        this.startTime[id] = performance.now();

        this.order[id] = this.orderNb;
        this.orderNb++;
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
                                          <td style="padding-right:8px;">'+percent+' %</td>\
                                          <td style="padding-right:8px;">'+this.order[id]+'</td></tr>');
              }
              _profilerOutput.append('</table>');
            }

        }
        this.orderNb = 0;
    }
    else
    {
        this.duration = {};
        this.itteration = {};
        this.order = {}
        this.orderNb = 0;
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

function Grid(texWidth, texHeight)
{
    this.positions = [];
    this.indices = [];
    this.uv2s = [];

    this.clippedPositions = [];
    this.clippedIndices = [];
    this.clippedUv2s = [];

    this.reorderedPositions = [];
    this.reorderedUv2s = [];

    this.transitionSizeBot = 0;
    this.transitionSizeTop = 2;
    this.nbUnit = 2;
    this.finalNbUnit = 2;
    this.unitSize = 1.;
    this.nbLod = 1;
    this.betaRange = 0.;
    this.betaCenterDist = 0.;
    this.distMin = 0.;

    this.texWidth = texWidth;
    this.texHeight = texHeight;
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
        this.indices.push(a0, b2, b0);
        this.indices.push(b1, b0, b2);
    }else{
        this.indices.push(a0, b1, b0);
        this.indices.push(b1, a0, b2);
    }
}

Grid.prototype.v = function(px, py, size, isTransitionTop)
{
    var s0 = this.unitSize;
    var N = this.nbUnit;
    var T = this.transitionSizeBot;

    var p = Math.max(Math.abs(px), Math.abs(py));
    var l = Math.max(0., Math.ceil(log(p/(s0*(N+T)), 2.))) + (isTransitionTop?1.:0.);

    var s = s0*Math.pow(2., l);

    var dx = Math.round(px/s);
    var dy = Math.round(py/s);

    var x = N+T+1+dx+l*(2.*(N+T+1.)+1.);
    var y = N+T+1+dy;

    var u = x/this.texWidth;
    var v = y/this.texHeight;

    this.uv2s.push(u, v, size);

}

Grid.prototype.createGrid = function(unitSize, nbUnit, finalNbUnit, nbLod, lodMin, withoutIndices)
{

    this.positions = [];
    this.indices = [];
    this.uv2s = [];
    this.nbUnit = nbUnit;
    this.finalNbUnit = finalNbUnit;
    this.unitSize = unitSize;
    this.nbLod = nbLod;

    this.positions.push(0., 0., 0.);
    this.v(0., 0., 1., false);

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

            var isTransitionTop = (r-radiusMin<this.transitionSizeTop && l>1);

            //Positions and uvs
            for(var j = 0; j < r; j++){
                this.positions.push(j*s,
                                    0.,
                                    r*s);
                this.v(j*s, r*s, s, isTransitionTop);
            }
            for(var j = 0; j < 2*r; j++){
                this.positions.push(r*s,
                                    0.,
                                    (r-j)*s);
                this.v(r*s, (r-j)*s, s, isTransitionTop);
            }
            for(var j = 0; j < 2*r; j++){
                this.positions.push((r-j)*s,
                                    0.,
                                    -r*s);
                this.v((r-j)*s, -r*s, s, isTransitionTop);
            }
            for(var j = 0; j < 2*r; j++){
                this.positions.push(-r*s,
                                    0.,
                                    (-r+j)*s);
                this.v(-r*s, (-r+j)*s, s, isTransitionTop);
            }
            for(var j = 0; j < r; j++){
                this.positions.push((-r+j)*s,
                                    0.,
                                    r*s);
                this.v((-r+j)*s, r*s, s, isTransitionTop);
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
    var cx = betaCenterDist*Math.cos(beta);
    var cz = betaCenterDist*Math.sin(beta);
    var cl = Math.sqrt(cx*cx+cz*cz);

    var CPx = x-cx;
    var CPz = z-cz;
    var CPl = Math.sqrt(CPx*CPx+CPz*CPz);

    var cosAlpha = -(CPx*cx+CPz*cz)/(cl*CPl);
    var dist = Math.sqrt((x-cx)*(x-cx)+(z-cz)*(z-cz))*cosAlpha;

    return (cosAlpha>Math.cos(betaRange) && dist>distMin);
}

Grid.prototype.clip = function(beta, betaRange, betaCenterDist, distMin, withoutIndices, useReorderedPositions)
{
    var position = useReorderedPositions ? this.reorderedPositions : this.positions;
    var uv2s = useReorderedPositions ? this.reorderedUv2s : this.uv2s;

    this.betaRange = betaRange;
    this.betaCenterDist = betaCenterDist;
    this.distMin = distMin;

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
                this.clippedUv2s.push(uv2s[3*i], uv2s[3*i+1], uv2s[3*i+2]);
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
    count.sort(function(a, b){ //front to back
        if (a.val<b.val){
            return -1;
        }
        if (a.val>b.val){
            return 1;
        }
        return 0;
    });

    this.reorderedPositions = [];
    this.reorderedUv2s = [];

    for (var i=0; i<count.length; i++){
        this.reorderedPositions.push(positions[3*count[i].id],
                                     positions[3*count[i].id+1],
                                     positions[3*count[i].id+2]);
        this.reorderedUv2s.push(uv2s[3*count[i].id],
                                uv2s[3*count[i].id+1],
                                uv2s[3*count[i].id+2]);
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
            meshesUv2s.push(uv2s[3*i],
                            uv2s[3*i+1],
                            uv2s[3*i+2]);
            meshesUvs.push(relativeUvs[2*j],
                           relativeUvs[2*j+1]);
        }
        for(var j=0; j<relativeIndices.length; j++){
            meshesIndices.push(relativeIndices[j]+verticesNumber*i);
        }
    }


    var mesh = new BABYLON.Mesh(name, scene);
    mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, meshesPositions, updatable, 3);
    mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, meshesUvs, updatable, 2);
    mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, meshesUv2s, updatable, 3);
    mesh.setIndices(meshesIndices);
   // console.log(Math.round(Math.sqrt(meshesPositions.length/3))+"^2");

    return mesh;
}

Grid.prototype.makeClippedMesh = function(name, scene, updatable)
{
    var mesh = new BABYLON.Mesh(name, scene);
    mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, this.clippedPositions, updatable, 3);
    mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, this.clippedUv2s, updatable, 3);
    mesh.setIndices(this.clippedIndices);
    //console.log(Math.round(Math.sqrt(this.clippedPositions.length/3))+"^2");
    return mesh;
}


function createImpostorTextures(dir, name, textureSize, nbCols, nbRows,
                                renderMat, scene, loadedCallback)
{
    var tex = {
      colorMap: null,
      normalMap: null,
      colorMipmap: null,
      normalMipmap: null,
      textureSize: textureSize
    };

    tex.colorMap = createRenderTargetTexture(name+"_color_texture",
                                             textureSize,
                                             scene,
                                             {
                                                 generateMipMaps: false,
                                                 generateDepthBuffer: true
                                             },
                                             true,
                                             null,
                                             renderMat.treeTextures,
                                             null);
    tex.colorMap.boundingCylinder = {radius:0, heightMax:0, heightMin:0};
    tex.normalMap = createRenderTargetTexture(name+"_normal_texture",
                                             textureSize,
                                             scene,
                                             {
                                                 generateMipMaps: false,
                                                 generateDepthBuffer: true
                                             },
                                             true,
                                             null,
                                             renderMat.treeTextures,
                                             null);
    tex.normalMap.boundingCylinder = {radius:0, heightMax:0, heightMin:0};

    var duplicateSubMesh = function(mesh, id, prop){
        mesh.subMeshes[id].clone(mesh, mesh);
        var pos = mesh.subMeshes.length-1;
        mesh.subMeshes[pos].materialIndex = pos;
        mesh.material.subMaterials.push(mesh.material.subMaterials[id].clone());
        mesh.subMeshes[pos].prop = prop;
    };

    BABYLON.SceneLoader.ImportMesh("", dir, name+".babylon", scene, function (newMeshes, particleSystems) {
        var callbacks = new Callbacks(newMeshes.length, loadedCallback);

        for( var i=0; i<newMeshes.length; i++){
          convertIntoMultiMaterialMesh(newMeshes[i], scene);
          newMeshes[i].isInFrustum = function(){return true;};

          var nbSubMeshes = newMeshes[i].subMeshes.length;
          for (var j=0; j<nbSubMeshes; j++){
            newMeshes[i].subMeshes[j].isInFrustum = function(){return true;};
            newMeshes[i].subMeshes[j].prop =
            {
                  row:0,
                  col:0,
                  isColor: true
            };

            //Duplicate the materials (we have 2 maps)
            duplicateSubMesh(newMeshes[i], j,
                             {
                                 row:0,
                                 col:0,
                                 isColor: false
                             });
          }

          //Duplicates the materials for each orientation
          for (var k=0; k<nbCols; k++){
            for (var l=0; l<nbRows; l++){
              for (var j=0; j<2*nbSubMeshes; j++){

                  //The first element is already created
                  if(k==0 && l==0){continue;}

                  duplicateSubMesh(newMeshes[i], j,
                                   {
                                       row:l,
                                       col:k,
                                       isColor: (j<nbSubMeshes)?true:false
                                   });
              }
            }
          }


          for (var j=0; j<newMeshes[i].subMeshes.length; j++){


            //Add the map material
            var isColor = newMeshes[i].subMeshes[j].prop.isColor;
            var typeText = isColor?'color':'normal';
            var keyText = isColor?'colorMap':'normalMap';
            var row = newMeshes[i].subMeshes[j].prop.row;
            var col = newMeshes[i].subMeshes[j].prop.col;
            var angle = 2.*_pi*(row + nbRows*col)/(nbCols*nbRows);
            replaceStandardMaterial(newMeshes[i].material.subMaterials, j,
                                    new ImpostorGeneratorMaterial(name+"_"+j+"_"+typeText, scene,
                                                                  isColor, angle, row, col, nbRows, nbCols,
                                                                  tex[keyText]),
                                    newMeshes[i], true, true);

            tex[keyText].subMeshIdList.push(j);
            tex[keyText].meshList.push(newMeshes[i]);

          }
          //Add the mesh to the render list
          tex.colorMap.renderList.push(newMeshes[i]);
          tex.normalMap.renderList.push(newMeshes[i]);

          //Compute the bounding cyclinder
          var pos = newMeshes[i]._geometry._vertexBuffers.position._data;
          var radius = 0.;
          var heightMin = pos[1];
          var heightMax = pos[1];
          for(var j=0; j<pos.length; j+=3){
              var n = Math.sqrt(pos[j]*pos[j]+pos[j+2]*pos[j+2]);
              radius = Math.max(radius, n);
              heightMin = Math.min(heightMin, pos[j+1]);
          }
          tex.colorMap.boundingCylinder.radius = tex.normalMap.boundingCylinder.radius = radius;
          tex.colorMap.boundingCylinder.heightMax = tex.normalMap.boundingCylinder.heightMax = heightMax;
          tex.colorMap.boundingCylinder.heightMin = tex.normalMap.boundingCylinder.heightMin = heightMin;

          onReady(newMeshes[i].material, function(){
              this.add();
          }.bind(callbacks), 200);
        }
    });

    return tex;
}



function getImageFromTexture(tex, size)
{
    var gl = _gl;
    var Colortexture = tex.getInternalTexture();
    // Create a framebuffer backed by the texture
    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, Colortexture, 0);

    // Read the contents of the framebuffer
    var data = new Uint8Array(size * size * 4);
    gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, data);

    // Delete the framebuffer
    gl.deleteFramebuffer(framebuffer);

    //Create a canvas2D
    var canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");

    //Fill the imageData
    var imageData = ctx.createImageData(size, size);
    imageData.data.set(data);

    //Read the image in a babylon texture
    var imageTex = new BABYLON.Texture('data:'+Math.random(), _config.world.scene,
                                       false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE,
                                       null, null, imageData);
    imageTex.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    imageTex.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
    return imageTex;
}



function Loader(callBackLoading, callbackLoaded)
{
    this.loadFuncs = [];
    this.isLoading = false;
    this.loadId = 0;
    this.loadPercent = 0.;

    this.callBackLoading = callBackLoading;
    this.callbackLoaded = callbackLoaded;
}

Loader.prototype.add = function(loadFunc)
{
    this.loadFuncs.push(loadFunc);
}

Loader.prototype.start = function()
{
    this.isLoading = true;
    if (this.loadId >= this.loadFuncs.length){
        this.isLoading = false;
        this.callbackLoaded();
    }else{
        this.loadFuncs[this.loadId](function(){
            this.loadId++;
            this.loadPercent = this.loadId / this.loadFuncs.length;
            this.callBackLoading(this.loadPercent);
            this.start();
        }.bind(this), function(loadPercent){
            this.callBackLoading(this.loadPercent+loadPercent/this.loadFuncs.length);
        }.bind(this));
    }
}


function Callbacks(nbToLoad, callback)
{
    this.nbToLoad = nbToLoad;
    this.nbLoaded = 0;
    this.callback = callback;
}

Callbacks.prototype.add = function()
{
    this.nbLoaded++;
    if (this.nbLoaded >= this.nbToLoad){
        this.callback();
    }
}

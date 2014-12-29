function Sea(world){
    assert(function(){return world instanceof World;}, 'world is not a World');

    this.world = world;

    this.width = 2000;
    this.subdivisions = 250;

    this.mesh = this.createMesh("sea", this.width, this.width, this.subdivisions, this.world.scene, false);
    this.material = new WaterMaterial("sea", this.world.scene);

    this.material.datawind = {
      direction: new BABYLON.Vector2(0.2, 0.8),
      amplitude: 0.15,
      velocity: -0.08,
      length: 0.05
    };

    this.material.dataWave1 = {
      direction: new BABYLON.Vector2(0.4, 0.3),
      amplitude: 7.5,
      velocity: -2.5,
      length: 225.
    };

    this.material.dataWave2 = {
      direction: new BABYLON.Vector2(0.4, 0.05),
      amplitude: 7.5,
      velocity: -2.3,
      length: 200.
    };

    this.material.dataWave3 = {
      direction: new BABYLON.Vector2(0.4, -0.08),
      amplitude: 6.5,
      velocity: -2.9,
      length: 120.
    };

    this.material.segmentLength = this.width/this.subdivisions;

    this.material.reflectionOffset = -0.
    this.material.refractionFactor = 0.005;
    this.material.seaWidth = this.width;
    this.maxAmplitude = this.material.dataWave1.amplitude+this.material.dataWave2.amplitude+this.material.dataWave3.amplitude;

    this.material.diffuseColor = new BABYLON.Color3(0.0, 0.0, 0.0);

    this.material.bumpTexture = new BABYLON.Texture("asset/water.bumpmap.png", this.world.scene);
    this.material.bumpTexture.wrapU = BABYLON.Texture.MIRROR_ADDRESSMODE;
    this.material.bumpTexture.wrapV = BABYLON.Texture.MIRROR_ADDRESSMODE;

    this.material.foamTexture = new BABYLON.Texture("asset/foam.jpg", this.world.scene);
    this.material.foamTexture.wrapU = BABYLON.Texture.MIRROR_ADDRESSMODE;
    this.material.foamTexture.wrapV = BABYLON.Texture.MIRROR_ADDRESSMODE;


    this.material.reflectionTexture = new BABYLON.MirrorTexture("waterReflexion", 512, this.world.scene, false);
    this.material.reflectionTexture.mirrorPlane = new BABYLON.Plane(0, -1, 0, 0.);
    
    this.material.reflectionTexture2 = new BABYLON.MirrorTexture("waterReflexion2", 512, this.world.scene, false);
    this.material.reflectionTexture2.mirrorPlane = new BABYLON.Plane(0, -1, 0, this.maxAmplitude);


    this.material.refractionTexture = new BABYLON.RenderTargetTexture("refraction", 512, this.world.scene, false);
    this.material.refractionTexture.onBeforeRender = function () {
        BABYLON.clipPlane = new BABYLON.Plane(0, 1, 0, -this.maxAmplitude);
    };
    this.material.refractionTexture.onAfterRender = function () {
        BABYLON.clipPlane = null;
    };


    this.foamAndNoiseSize = 512;

    this.material.previousFoamAndNoiseTexture = new BABYLON.RenderTargetTexture("previousFoamAndNoise", this.foamAndNoiseSize, this.world.scene, true);
    this.swapTextureMaterialMesh = BABYLON.Mesh.CreateBox("previousFoamAndNoiseBox", 2200, this.world.scene, false);
    this.swapTextureMaterialMesh.material = new SwapTextureMaterial('previousFoamAndNoiseMaterial', this.world.scene);
    this.swapTextureMaterialMesh.material.invTextureSize = 1./this.foamAndNoiseSize;
    this.material.previousFoamAndNoiseTexture.renderList.push(this.swapTextureMaterialMesh);
    this.material.previousFoamAndNoiseTexture.onBeforeRender = function () {
        this.swapTextureMaterialMesh.setEnabled(true);
    }.bind(this);
    this.material.previousFoamAndNoiseTexture.onAfterRender = function () {
        this.swapTextureMaterialMesh.setEnabled(false);
    }.bind(this);
    this.swapTextureMaterialMesh.setEnabled(false);


    this.material.foamAndNoiseTexture = new BABYLON.RenderTargetTexture("foamAndNoise", this.foamAndNoiseSize, this.world.scene, true);
    this.foamAndNoiseMesh = BABYLON.Mesh.CreateBox("foamAndNoiseBox", 2200, this.world.scene, false);
    this.foamAndNoiseMesh.material = new FoamAndNoiseMaterial('foamAndNoiseMaterial', this.world.scene);
    this.foamAndNoiseMesh.material.textureSize = this.foamAndNoiseSize;
    this.foamAndNoiseMesh.material.seaWidth = this.width;
    this.material.foamAndNoiseTexture.renderList.push(this.foamAndNoiseMesh);
    this.material.foamAndNoiseTexture.onBeforeRender = function () {
        this.foamAndNoiseMesh.setEnabled(true);
    }.bind(this);
    this.material.foamAndNoiseTexture.onAfterRender = function () {
        this.foamAndNoiseMesh.setEnabled(false);
    }.bind(this);
    this.foamAndNoiseMesh.setEnabled(false);


    this.swapTextureMaterialMesh.material.texture = this.material.foamAndNoiseTexture;
    this.foamAndNoiseMesh.material.foamAndNoiseTexture = this.material.previousFoamAndNoiseTexture;

    this.material.seabedTexture = new BABYLON.RenderTargetTexture("seabed", 1024, this.world.scene, false);
    this.material.seabedTexture.onBeforeRender = function () {
        for(var i=0; i<this.material.seabedTexture.subMeshIdList.length; ++i)
        {
            for(var j=0; j<this.material.seabedTexture.renderList[i].subMeshes.length; ++j)
            {
                if (j==this.material.seabedTexture.subMeshIdList[i])
                {
                    this.material.seabedTexture.renderList[i].subMeshes[j].isHidden = false;
                }
                else
                {
                    this.material.seabedTexture.renderList[i].subMeshes[j].isHidden = true;
                }
            }

        }
    }.bind(this);
    this.material.seabedTexture.onAfterRender = function () {
        for(var i=0; i<this.material.seabedTexture.subMeshIdList.length; ++i)
        {
            for(var j=0; j<this.material.seabedTexture.renderList[i].subMeshes.length; ++j)
            {
                if (j==this.material.seabedTexture.subMeshIdList[i])
                {
                    this.material.seabedTexture.renderList[i].subMeshes[j].isHidden = true;
                }
                else
                {
                    this.material.seabedTexture.renderList[i].subMeshes[j].isHidden = false;
                }
            }

        }
    }.bind(this);
    this.material.seabedTexture.subMeshIdList = [];


    this.mesh.material = this.material;

}

Sea.prototype.addSeabedMesh = function(mesh)
{
    onReady(mesh, function(){
        this.material.seabedTexture.renderList.push(mesh);

        if (!(mesh.material instanceof BABYLON.MultiMaterial)){
            var previousMaterial = mesh.material;

            mesh.material = new BABYLON.MultiMaterial("multi"+mesh.name, this.world.scene);

            if (previousMaterial){
                mesh.material.subMaterials.push(previousMaterial);
            }
        }
        var material = new SeabedMaterial('seabedMaterial', this.world.scene);
        mesh.material.subMaterials.push(material);
        var submesh = new BABYLON.SubMesh(mesh.material.subMaterials.length-1,
                                          0, mesh._totalVertices,
                                          0, mesh._indices.length,
                                          mesh);
        mesh.subMeshes[mesh.subMeshes.length-1].isHidden = true;
        this.material.seabedTexture.subMeshIdList.push(mesh.subMeshes.length-1);
    }.bind(this));
}


Sea.prototype.addReflexionMesh = function(mesh, collidewithSea)
{
    assert(function(){return mesh instanceof BABYLON.Mesh;}, 'mesh is not a BABYLON.Mesh');

    this.material.reflectionTexture.renderList.push(mesh);

    if (collidewithSea) {
        this.material.reflectionTexture2.renderList.push(mesh);
    }
}

Sea.prototype.addRefractionMesh = function(mesh)
{
    assert(function(){return mesh instanceof BABYLON.Mesh;}, 'mesh is not a BABYLON.Mesh');

    this.material.refractionTexture.renderList.push(mesh);
}

Sea.prototype.computeLod = function(x)
{
    return Math.pow(Math.abs(x), this.lodFactor);
    //return Math.exp(this.lodFactor*Math.log(Math.abs(x)));
    return (x*x+Math.abs(x))/2;
}


Sea.prototype.computeX = function(ix)
{
    var px = Math.abs(ix)*(this.minX)+this.computeLod(ix)/(this.maxX);
    if (sign(px)!=sign(ix))
    {
        px=-px;
    }
    return px;
}

Sea.prototype.computeZ = function(iz)
{
    var pz = Math.abs(iz)*(this.minZ)+this.computeLod(iz)/(this.maxZ);
    if (sign(pz)!=sign(iz))
    {
        pz=-pz;
    }
    return pz;
}


Sea.prototype.createMesh = function(name, width, height, subdivisions, scene, updatable)
{
    this.lodFactor = 2.;
    this.maxX = 20.;
    this.maxZ = 20.;
    this.minX = 3.;
    this.minZ = 3.;


    var ground = new BABYLON.Mesh(name, scene);

    var indices = [];
    var positions = [];
    var normals = [];
    var uvs = [];
    var row, col;

    for (row = 0; row <= subdivisions; row++) {
        for (col = 0; col <= subdivisions; col++) {
            var position = new BABYLON.Vector3((col * width) / subdivisions - (width / 2.0), 0, ((subdivisions - row) * height) / subdivisions - (height / 2.0));
            var normal = new BABYLON.Vector3(0, 1.0, 0);

            positions.push(this.computeX(row-subdivisions/2.), position.y, this.computeZ(col-subdivisions/2.));
            normals.push(normal.x, normal.y, normal.z);
            uvs.push(col / subdivisions, 1.0 - row / subdivisions);
        }
    }

    for (row = 0; row < subdivisions; row++) {
        for (col = 0; col < subdivisions; col++) {
            indices.push(col + 1 + (row + 1) * (subdivisions + 1));
            indices.push(col + 1 + row * (subdivisions + 1));
            indices.push(col + row * (subdivisions + 1));

            indices.push(col + (row + 1) * (subdivisions + 1));
            indices.push(col + 1 + (row + 1) * (subdivisions + 1));
            indices.push(col + row * (subdivisions + 1));
        }
    }

    ground.setVerticesData(positions, BABYLON.VertexBuffer.PositionKind, updatable);
    ground.setVerticesData(normals, BABYLON.VertexBuffer.NormalKind, updatable);
    ground.setVerticesData(uvs, BABYLON.VertexBuffer.UVKind, updatable);
    ground.setIndices(indices);

    return ground;
};

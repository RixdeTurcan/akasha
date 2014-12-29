function Vegetation(camera, light){
    assert(function(){return camera instanceof Camera;}, 'camera is not a Camera');

    this.camera = camera;
    this.nbMesh = 128.;
    this.mesh = this.createMesh("Vegetation", _config.world.scene, this.nbMesh, false);

    this.material2 = new VegetationMaterial("VegetationMaterial2", _config.world.scene, this);
    this.material2.size = 5000.;
    this.material2.subdiv = this.nbMesh;
    this.material2.uMin = 0.4;
    this.material2.lod = 3.;
    this.material2.uMorphing = 0.1;

    this.material3 = new VegetationMaterial("VegetationMaterial3", _config.world.scene, this);
    this.material3.size = 2500.;
    this.material3.subdiv = this.nbMesh;
    this.material3.uMin = 0.4;
    this.material3.lod = 2.;
    this.material3.uMorphing = 0.1;

    this.material4 = new VegetationMaterial("VegetationMaterial4", _config.world.scene, this);
    this.material4.size = 1800.;
    this.material4.subdiv = this.nbMesh;
    this.material4.uMin = 0.35;
    this.material4.lod = 1.;
    this.material4.uMorphing = 0.2;

    this.material5 = new VegetationMaterial("VegetationMaterial5", _config.world.scene, this);
    this.material5.size = 1000.;
    this.material5.subdiv = this.nbMesh;
    this.material5.uMin = -0.3;
    this.material5.lod = 0.;
    this.material5.uMorphing = 0.3;

    this.mesh.material = new BABYLON.MultiMaterial("VegetationMultiMat", _config.world.scene);
    this.mesh.subMeshes = [];
    addMaterialToMesh(this.material2, this.mesh, false, false);
    addMaterialToMesh(this.material3, this.mesh, false, false);
    addMaterialToMesh(this.material4, this.mesh, false, false);
    addMaterialToMesh(this.material5, this.mesh, false, false);
    this.mesh.isInFrustum = function(){return true;};
    this.mesh.subMeshes[0].isInFrustum = function(){return true;};
    this.mesh.subMeshes[1].isInFrustum = function(){return true;};
    this.mesh.subMeshes[2].isInFrustum = function(){return true;};
    this.mesh.subMeshes[3].isInFrustum = function(){return true;};


    this.material2.diffuseTexture = new BABYLON.Texture("asset/grass.png",
                                                       _config.world.scene);
    this.material2.diffuseTexture.wrapU = BABYLON.Texture.WRAP_ADDRESSMODE;
    this.material2.diffuseTexture.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE;

    this.material3.diffuseTexture = this.material2.diffuseTexture;
    this.material4.diffuseTexture = this.material2.diffuseTexture;
    this.material5.diffuseTexture = this.material2.diffuseTexture;

    //Position
    this.posTexture = createRenderTargetTexture('posTexture',
                                                this.nbMesh,
                                                _config.world.scene,
                                                {
                                                    generateMipMaps: false,
                                                    enableTextureFloat: true,
                                                    generateDepthBuffer: false
                                                },
                                                new VegetationPosMaterial('posMaterial',
                                                                          this.material5,
                                                                          _config.world.scene),
                                                this.material5,
                                                "passthrough");
    this.posTexture.material.textureSize = this.nbMesh;
    this.posTexture.material.size = 1000.;
    this.posTexture.material.subdiv = this.nbMesh;
    this.posTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    this.posTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;

    //Position
    this.pos2Texture = createRenderTargetTexture('posTexture',
                                                this.nbMesh,
                                                _config.world.scene,
                                                {
                                                    generateMipMaps: false,
                                                    enableTextureFloat: true,
                                                    generateDepthBuffer: false
                                                },
                                                new VegetationPosMaterial('pos2Material',
                                                                          this.material4,
                                                                          _config.world.scene),
                                                this.material4,
                                                "passthrough");
    this.pos2Texture.material.textureSize = this.nbMesh;
    this.pos2Texture.material.size = 1800.;
    this.pos2Texture.material.subdiv = this.nbMesh;
    this.pos2Texture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    this.pos2Texture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;

    //Position
    this.pos3Texture = createRenderTargetTexture('posTexture',
                                                this.nbMesh,
                                                _config.world.scene,
                                                {
                                                    generateMipMaps: false,
                                                    enableTextureFloat: true,
                                                    generateDepthBuffer: false
                                                },
                                                new VegetationPosMaterial('pos3Material',
                                                                          this.material3,
                                                                          _config.world.scene),
                                                this.material3,
                                                "passthrough");
    this.pos3Texture.material.textureSize = this.nbMesh;
    this.pos3Texture.material.size = 2500.;
    this.pos3Texture.material.subdiv = this.nbMesh;
    this.pos3Texture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    this.pos3Texture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;

    //Position
    this.pos4Texture = createRenderTargetTexture('posTexture',
                                                this.nbMesh,
                                                _config.world.scene,
                                                {
                                                    generateMipMaps: false,
                                                    enableTextureFloat: true,
                                                    generateDepthBuffer: false
                                                },
                                                new VegetationPosMaterial('pos4Material',
                                                                          this.material2,
                                                                          _config.world.scene),
                                                this.material2,
                                                "passthrough");
    this.pos4Texture.material.textureSize = this.nbMesh;
    this.pos4Texture.material.size = 5000.;
    this.pos4Texture.material.subdiv = this.nbMesh;
    this.pos4Texture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
    this.pos4Texture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
}

Vegetation.prototype.addGroundHeightTexture = function(tex)
{
    this.posTexture.material.groundHeightTexture = tex;
    this.pos2Texture.material.groundHeightTexture = tex;
    this.pos3Texture.material.groundHeightTexture = tex;
    this.pos4Texture.material.groundHeightTexture = tex;
}

Vegetation.prototype.addSkyTexture = function(tex)
{
    this.material2.skyTexture = tex;
    this.material3.skyTexture = tex;
    this.material4.skyTexture = tex;
    this.material5.skyTexture = tex;
}

Vegetation.prototype.update = function()
{
}

Vegetation.prototype.fillMesh = function(row, col, positions, uvs, uv2s, subX, subY)
{
    positions.push(0, 0, 0);
    positions.push(0, 0, 0);
    positions.push(0, 0, 0);
    positions.push(0, 0, 0);

    uvs.push(-0.5, -0.5);
    uvs.push(-0.5, 0.5);
    uvs.push(0.5, -0.5);
    uvs.push(0.5, 0.5);

    var uvX = 2. * col / subX - 1.;
    var uvY = 2. * row / subY - 1.;

    uv2s.push(uvX, uvY);
    uv2s.push(uvX, uvY);
    uv2s.push(uvX, uvY);
    uv2s.push(uvX, uvY);
}

Vegetation.prototype.createMesh = function(name , scene, subdivisions, updatable)
{

    var mesh = new BABYLON.Mesh(name, scene);

    var indices = [];
    var positions = [];
    var uvs = [];
    var uv2s = [];
    var row, col;

    var subX = parseInt(subdivisions);
    var subY = parseInt(subdivisions);

    var radius = 0.;
    var count = [];
    for(row = 0; row < subX; row++){
        for(col = 0; col < subY; col++){
            var x = row - subX/2;
            var y = col - subY/2;
            count.push({
                           val:Math.sqrt(x*x+y*y),
                           row: row,
                           col: col
                        });
        }
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

    for (var i=0; i<count.length; i++){
        row = count[i].row;
        col = count[i].col;
        this.fillMesh(row, col, positions, uvs, uv2s, subX, subY);
    }

    for (var i=0; i<subX*subY; i++)
    {
        indices.push(4.*i+2);
        indices.push(4.*i+1);
        indices.push(4.*i);

        indices.push(4.*i+3);
        indices.push(4.*i+2);
        indices.push(4.*i+1);
    }

    mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions, updatable);
    mesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs, updatable);
    mesh.setVerticesData(BABYLON.VertexBuffer.UV2Kind, uv2s, updatable);
    mesh.setIndices(indices);

    return mesh;
}

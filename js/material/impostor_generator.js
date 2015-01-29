function ImpostorGeneratorMaterial(name, scene, isColorMap, angle, row, col, nbRows, nbCols, map) {
    this.name = name;
    this.id = name;

    this.iscolorMap = isColorMap;

    this.alphaBlending = false;
    this.alphaTesting = false;

    this.angle = angle;
    this.row = row;
    this.col = col;
    this.nbRows = nbRows;
    this.nbCols = nbCols;

    this.map = map;
    this._scaledDiffuse = new BABYLON.Color3();
    this._scaledSpecular = new BABYLON.Color3()

    this._renderTargets = new BABYLON.SmartArray(16);

    this.shader = new Shader('./shader/impostor_generator.vertex.fx',
                             './shader/impostor_generator.fragment.fx',
                             [],
                             []);

    this.alpha = 1.;

    this.backFaceCulling = false;
    this._scene = scene;
    scene.materials.push(this);
};

ImpostorGeneratorMaterial.prototype = Object.create(BABYLON.Material.prototype);

// Properties
ImpostorGeneratorMaterial.prototype.needAlphaBlending = function () {
    return this.alphaBlending;
};

ImpostorGeneratorMaterial.prototype.needAlphaTesting = function () {
    return this.needAlphaTesting;
};

// Methods
ImpostorGeneratorMaterial.prototype.getRenderTargetTextures = function () {
    this._renderTargets.reset();

    return this._renderTargets;
}
ImpostorGeneratorMaterial.prototype.isReady = function (mesh) {
    var engine = this._scene.getEngine();
    var defines = [];

    if (this.diffuseTexture) {
        if (!this.diffuseTexture.isReady()) {
            return false;
        } else {
            defines.push("#define DIFFUSE");
        }
    }

    if (this.bumpTexture) {
        if (!this.bumpTexture.isReady()) {
            return false;
        } else {
            defines.push("#define BUMP");
        }
    }

    if (this.iscolorMap){
        defines.push("#define RENDER_COLOR");
    }else{
        defines.push("#define RENDER_NORMAL");
    }

    if (this.needAlphaBlending()){
      defines.push('#define PREMUL_ALPHA');
    }

    var join = defines.join("\n");
    if (this._cachedDefines != join && this.shader.isReady)
    {
        this._cachedDefines = join;
        this._effect = engine.createEffect({vertex: this.shader.vertexElem,
                                            fragment: this.shader.fragmentElem},
                                           [BABYLON.VertexBuffer.PositionKind,
                                            BABYLON.VertexBuffer.NormalKind,
                                            BABYLON.VertexBuffer.UVKind],
                                           ['uBumpInfos', 'uBumpMatrix',
                                            'uDiffuseMatrix', 'uAngle',
                                            'uRow', 'uCol', 'uNbRows', 'uNbCols',
                                            'uInvBoxLimits', 'uOffsetY'],
                                           ['uDiffuseSampler', 'uBumpSampler'],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

ImpostorGeneratorMaterial.prototype.bind = function (world, mesh) {

    this._effect.setFloat('uAngle', this.angle);
    this._effect.setFloat('uRow', this.row);
    this._effect.setFloat('uCol', this.col);
    this._effect.setFloat('uNbRows', this.nbRows);
    this._effect.setFloat('uNbCols', this.nbCols);

    var r = Math.max(this.map.boundingCylinder.radius, this.map.boundingCylinder.heightMax - this.map.boundingCylinder.heightMin);
    var offset = -this.map.boundingCylinder.heightMin-r;


    this._effect.setVector3('uInvBoxLimits', new BABYLON.Vector3(1./r, 1./r, 1./r));
    this._effect.setFloat('uOffsetY', offset);
    if (this.diffuseTexture) {
        this._effect.setTexture("uDiffuseSampler", this.diffuseTexture);

        this._effect.setMatrix("uDiffuseMatrix", this.diffuseTexture.getTextureMatrix());
    }

    if (this.bumpTexture) {
        this._effect.setTexture("uBumpSampler", this.bumpTexture);

        this._effect.setFloat2("uBumpInfos", this.bumpTexture.coordinatesIndex, this.bumpTexture.level);
        this._effect.setMatrix("uBumpMatrix", this.bumpTexture.getTextureMatrix());
    }

};

ImpostorGeneratorMaterial.prototype.unbind = function () {
};

ImpostorGeneratorMaterial.prototype.dispose = function(){
    this.baseDispose();
};


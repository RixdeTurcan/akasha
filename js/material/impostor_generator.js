function ImpostorGeneratorMaterial(name, scene, isColorMap, needAlphaBlending, needAlphaTesting) {
    this.name = name;
    this.id = name;

    this.iscolorMap = isColorMap;

    this.alphaBlending = needAlphaBlending;
    this.alphaTesting = needAlphaTesting;

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
                                            'uDiffuseMatrix'],
                                           ['uDiffuseSampler', 'uBumpSampler'],
                                           join);
    }

    if (!this._effect || !this._effect.isReady()) {
        return false;
    }

    return true;
};

ImpostorGeneratorMaterial.prototype.bind = function (world, mesh) {

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

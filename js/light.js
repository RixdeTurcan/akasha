LightType_Directionnal = 1;
LightType_Hemispheric = 2;

function Light(lightType, position, direction){
    assert(function(){return position instanceof BABYLON.Vector3;}, 'position is not a BABYLON.Vector3');
    assert(function(){return direction instanceof BABYLON.Vector3;}, 'direction is not a BABYLON.Vector3');
    assert(function(){return lightType !== null;}, 'lightType can not be null');
    assert(function(){return lightType === LightType_Directionnal || lightType === LightType_Hemispheric;}, 'lightType can not be a not defined value');

    this.lightType = lightType;

    if (lightType == LightType_Directionnal){
        this.light = new BABYLON.DirectionalLight("Light", direction, _config.world.scene);
        this.light.position = position;
    }else if (lightType == LightType_Hemispheric){
        this.light = new BABYLON.HemisphericLight("Light", direction, _config.world.scene);
    }
}

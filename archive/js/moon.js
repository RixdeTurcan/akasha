function Moon(world, light){
    assert(function(){return world instanceof World;}, 'world is not a World');
    assert(function(){return light instanceof Light;}, 'light is not a Light');
    
    this.world = world;
    this.light = light;
    
    this.mesh = BABYLON.Mesh.CreateGround("extraGround", 100, 100, 1, this.world.scene, false);
    
    this.mesh.position = this.light.light.position;
}

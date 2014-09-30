function LensFlareSystem(world, light){
    assert(function(){return world instanceof World;}, 'world is not a World');
    assert(function(){return light instanceof Light;}, 'light is not a Light');
    
    this.world = world;
    this.light = light;
    
    this.lensFlareSystem = new BABYLON.LensFlareSystem("lensFlareSystem", this.light.light, this.world.scene);
    this.flare0 = new BABYLON.LensFlare(0.2, 0, new BABYLON.Color3(1, 1, 1), "asset/lens2.png", this.lensFlareSystem);
    this.flare1 = new BABYLON.LensFlare(0.5, 0.2, new BABYLON.Color3(0.5, 0.5, 1), "asset/lens1.png", this.lensFlareSystem);
    this.flare2 = new BABYLON.LensFlare(0.2, 1.0, new BABYLON.Color3(1, 1, 1), "asset/lens1.png", this.lensFlareSystem);
    this.flare3 = new BABYLON.LensFlare(0.4, 0.4, new BABYLON.Color3(1, 0.5, 1), "asset/flare.png", this.lensFlareSystem);
    this.flare4 = new BABYLON.LensFlare(0.1, 0.6, new BABYLON.Color3(1, 1, 1), "asset/lens2.png", this.lensFlareSystem);
    this.flare5 = new BABYLON.LensFlare(0.3, 0.8, new BABYLON.Color3(1, 1, 1), "asset/lens1.png", this.lensFlareSystem);
}

//singleton class

_config = new Config();

function Config(){
    this.ocean = new Ocean_Config();
    this.sky = new Sky_Config();
    this.player = new Player_Config();
    this.world = new World_Config();
    this.camera = new Camera_Config();
    this.ground = new Ground_Config();

    this.time = 0.;
    this.dt = 0.;
    this.step = 0.;
}

function Ground_Config(){
    this.sampling = {
        grid: 256.,
        gridLowDef: 128.,
        height: 256.,
        shadow: 128.,
        shadowHeight: 128.
    };

    this.params = {
        tangentScreenDist: 1./128.,

        shadowTextureWidth: 5000.,
        shadowTextureBox: 2000.,
        shadowTextureStep: 500.
    }
}

function Camera_Config(){
    this.upperBetaLimit = _pi/2+_pi/4.5;
    this.lowerBetaLimit = _pi/2-_pi/4.5;
    this.radiusScaleFactor = 1.;
    this.minRadius = 0.0001;
    this.maxZ = 5000;
}

function World_Config(){
    this.canvasWidth = 1200;
    this.canvasHeight = 800;

    this.cameraPos = new BABYLON.Vector3();
    this.realCameraPos = new BABYLON.Vector3();
    this.transformMat = new BABYLON.Matrix();
    this.invTransformMat = new BABYLON.Matrix();
    this.viewMat = new BABYLON.Matrix();

    this.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    this.fogDensity = 0.00028;

    this.realFps = 30.;
    this.fps = this.realFps * 1.33;
    this.period = 1./this.fps;
    this.periodMs = 1000.*this.period;
    this.realPeriodMs = 1000./this.realFps;
    this.scene = null;
    this.canvas = null;
}

function Player_Config(){
    this.angle = 0.;
    this.position = new BABYLON.Vector3(0., 0., 0.);
    this.deltaPosition = new BABYLON.Vector3(0., 0., 0.);
    this.velocity = new BABYLON.Vector3(0., 0., 0.);
    this.acceleration = new BABYLON.Vector3(0., 0., 0.);

    this.maxAcceleration = 2000.;
    this.maxVelocity = 800.;
    this.minVelocity = 10.;

    this.keyUpCode = 90;
    this.keyDownCode = 83;
    this.keyLeftCode = 81;
    this.keyrightCode = 68;
}

function Sky_Config(){
    this.params = {
        sunDir: new BABYLON.Vector3(0.3, 0.3, -1.0),
        sunLight: new BABYLON.Vector3(1.0, 1.0, 1.0),
        sunColor: new BABYLON.Vector3(1.0, 1.0, 1.0),
        earthRadius: 6400.e3,
        atmosphereRadius: 23.e3,

        betaRayleight: new BABYLON.Vector3(2.5, 5.5, 8.),
        betaMie: new BABYLON.Vector3(1.5, 1.5, 1.4),
        betaAerosol: new BABYLON.Vector3(1., 1.31, 1.8),
        betaOutScat: new BABYLON.Vector3(2., 5., 8.),

        mieAerosolDistMax: 0.07,
        mieAerosolScaleMax: 0.07,
        mieExentricity: 0.98,
        rayleighPolarization: 0.5,
        aerosolFactor: 0.6,
        outScatFactor: -0.19e-6,
        outScatNbStep: 1,

        textureSize: 512,
        verticalShift: 0.015
    };

    this.cloud = {
        textureSize: 256,

        cloudHeight: 2000.,
        verticalDepth: 1000.,
        period: 100000.,
        presence: 0.05,
        density: 0.00055,

        shadowDarkness: 0.4,
        shadowHardness: 0.15,

        velocity: 0.,//100.,
        direction: new BABYLON.Vector2(-1., 0.)
    };

    this.deltaPlayerPos = new BABYLON.Vector3(0., 0., 0.);

}

function Ocean_Config(){
    this.sampling = {
        grid: 256,
        wave: 256,
        noise: 256,
        reflection: 256,
        seabed: 256,
        foam: 256,
        foamAccumulation: 256
    };

    this.params = {
        reflectionFactor: 0.004,
        skyReflectionFactor: 0.,
        skyReflectionAbsorbtion: 0.8,

        horizonDist: 5000.,
        turbidityFactor: 0.0085,

        shanonMargin: 0.5,
        tangentScreenDist: 1./128.,
        foamAccTextureWidth: 1000,

        seaColor: new BABYLON.Color3(0.13, 0.32, 0.21)
    };

    this.dataFoam = {
        dispertion: 0.975,
        velocityAbsorbtion: 1.,
        viscosity: 0.95,
        sourceAddition: 0.11,
        waveBreakingAngle: 0.2,
        foamHeight: 3.
    };

    this.dataNoise = {
        amplitude: 15.,
        amplitudePow: 1.3,
        displacementFactor: 6.9,
        displacementMinHeight: 0.05,
        displacementMaxHeight: 1.,
        reductionMinHeight: 0.34,
        reductionFactor: 0.88,
        period: 20000,
        octave1:{
            period: new BABYLON.Vector3(0.01, 0.006, 0.4),
            amplitude: 10.
        },
        octave2:{
            period: new BABYLON.Vector3(0.02, 0.015, 0.55),
            amplitude: 5.
        },
        octave3:{
            period: new BABYLON.Vector3(0.08, 0.036, 0.7),
            amplitude: 2
        }
    };

    this.dataWave = {
        displacementFactor: 150.,
        displacementMinHeight: 0.01,
        displacementMaxHeight: 1.3,
        period: 20000,
        wind:{
            direction: new BABYLON.Vector2(-1., 0.),
            amplitudeReflection: 0.32,
            amplitudeNormal: 0.61,
            velocity: -0.007,
            length: 260.
        },
        wave1:{
            direction: new BABYLON.Vector2(1., 0.),
            amplitude: 17.,
            risingLength: 40.,
            length: 350.,
            totalLength: 220.,
            velocity: 63.
        },
        wave2:{
            direction: new BABYLON.Vector2(0.8/Math.sqrt(0.68), 0.2/Math.sqrt(0.68)),
            amplitude: 15.,
            risingLength: 60.,
            length: 380.,
            totalLength: 280.,
            velocity: 64.
        },
        wave3:{
            direction: new BABYLON.Vector2(0.9/Math.sqrt(0.82), -0.1/Math.sqrt(0.82)),
            amplitude: 13,
            risingLength: 75.,
            length: 365.,
            totalLength: 260.,
            velocity: 68.
        }
    };

}

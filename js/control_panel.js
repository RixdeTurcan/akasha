function Controlpanel(camera, ocean, sky)
{
    assert(function(){return sky instanceof Sky;}, 'sky is not a Sky');
    assert(function(){return camera instanceof Camera;}, 'camera is not a Camera');
    assert(function(){return ocean instanceof Ocean;}, 'ocean is not a Ocean');

    this.elem = [];

    _$body.append('<div id="controlpanel" class="controlpanelBlock">\
                     <ul></ul>\
                   </div>');

    this.$controlpanel = $('#controlpanel');
    this.$controlpanelTitle = $('#controlpanel ul');

    this.addOceanControl(camera, ocean);
    this.addSkyControl(sky);

    this.$controlpanel.tabs({
        event: 'click hoverintent',
        heightStyle: 'content'
    });

}



Controlpanel.prototype.addOceanControl = function(camera, ocean)
{
    this.elem.push(new WaterControl(this, camera, ocean));
}

Controlpanel.prototype.addSkyControl = function(sky)
{
    this.elem.push(new SkyControl(this, sky));
}

Controlpanel.prototype.update = function()
{
    for (var i in this.elem){
        if (this.elem[i].update){
            this.elem[i].update();
        }
    }
}

Controlpanel.prototype.addSlider = function($elem, name, id, globalClass, className, classVal, classSlider,
                                            valueArray, valueName,
                                            sliderMin, sliderMax, sliderStep)
{
    this.addSliderFunc($elem, name, id, globalClass, className, classVal, classSlider,
                       valueArray[valueName],
                       function(e, ui){
                           $('#'+id+'Val').html(ui.value);
                           valueArray[valueName] = ui.value;
                       }.bind(this),
                       sliderMin, sliderMax, sliderStep);
}


Controlpanel.prototype.addSliderFunc = function($elem, name, id, globalClass, className, classVal, classSlider,
                                                initVal, slideFunction,
                                                sliderMin, sliderMax, sliderStep)
{
    this.addSliderFunc2($elem, name, id, globalClass, className, classVal, classSlider,
                        initVal, initVal, slideFunction,
                        sliderMin, sliderMax, sliderStep)
}

Controlpanel.prototype.addSliderFunc2 = function($elem, name, id, globalClass, className, classVal, classSlider,
                                                initValSlider, initValVal, slideFunction,
                                                sliderMin, sliderMax, sliderStep)
{
    $elem.append('\
            <div class="'+globalClass+' '+className+'">'+name+':</div>\
            <div id="'+id+'Val" class="'+globalClass+' '+classVal+'"></div>\
            <div id="'+id+'Slider" class="'+globalClass+' '+classSlider+'"></div>\
    ');

    $('#'+id+'Slider').slider({
                                  orientation: "horizontal",
                                  range: "min",
                                  min: sliderMin,
                                  max: sliderMax,
                                  step: sliderStep,
                                  value: initValSlider,
                                  slide: slideFunction
                              });
    $('#'+id+'Val').html(initValVal);
}

Controlpanel.prototype.addDoubleSlider = function($elem, id, globalClass, classSlider,
                                            initValues, updateFunc,
                                            sliderMin, sliderMax, sliderStep)
{
    $elem.append('<div id="'+id+'Slider" class="'+globalClass+' '+classSlider+'"></div>');

    $('#'+id+'Slider').slider({
                                  orientation: "horizontal",
                                  range: true,
                                  min: sliderMin,
                                  max: sliderMax,
                                  step: sliderStep,
                                  values: initValues,
                                  slide: updateFunc
                              });
}

Controlpanel.prototype.addSpinner = function($elem, name, id, globalClass, valueClass, spinnerClass,
                                             valueArray, valueName,
                                             spinnerMin, spinnerMax, spinnerStep, spinnerPage)
{
    $elem.append('\
            <div class="'+globalClass+' '+valueClass+'">\
                '+name+': <input id="'+id+'Spinner" class="'+globalClass+' '+spinnerClass+'" name="value">\
            </div>\
    ');

    $('#'+id+'Spinner').spinner({min: spinnerMin,
                                 max: spinnerMax,
                                 step: spinnerStep,
                                 page: spinnerPage
                                }).on("change paste keyup spin", function(){
                                    valueArray[valueName] = $('#'+id+'Spinner').spinner('value');
                                }.bind(this));

    $('#'+id+'Spinner').spinner('value', valueArray[valueName]);

}

function SkyControl(controlpanel, sky)
{
    assert(function(){return sky instanceof Sky;}, 'sky is not a Sky');
    assert(function(){return controlpanel instanceof Controlpanel;}, 'controlpanel is not a Controlpanel');

    this.sky = sky;
    this.controlpanel = controlpanel;

    this.controlpanel.$controlpanel.append('\
        <div id="skyAccordion"  class="controlpanelFont">\
          <ul></ul>\
        </div>');


    this.controlpanel.$controlpanelTitle.append('<li><a href="#skyAccordion">Sky</a></li>');

    this.$skyAccordion = $('#skyAccordion');
    this.$skyAccordionTitle = $('#skyAccordion ul');

    this.$skyAccordionTitle.append('<li><a href="#skyControlNoiseCategory">Sun</a></li>');

    this.$skyAccordion.append('\
        <div id="skyControlNoiseCategory">\
        </div>\
    ');
    this.$skyControlNoiseCategory = $('#skyControlNoiseCategory');

    this.controlpanel.addSlider(this.$skyControlNoiseCategory, 'Sun height',
                                'sunY', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.sky.params.sunDir, 'y',
                                -0.5, 1, 0.01);

    this.controlpanel.addSliderFunc2(this.$skyControlNoiseCategory, 'Sunrise / Sunset',
                                    'Hour', 'waterControl', 'waterControlName',
                                    'waterControlValue', 'waterControlSlider',
                                    -1, 'Sunset',
                                    (function(that){
                                        return function(e, ui){
                                            $('#HourVal').html(ui.value==1?'Sunrise':'Sunset');

                                            if (ui.value==1){
                                                _config.sky.params.mieAerosolScaleMax = 0.;
                                            }else{
                                                _config.sky.params.mieAerosolScaleMax = 0.07;
                                            }
                                        };
                                    })(this),
                                    -1, 1, 2);

    this.controlpanel.addSlider(this.$skyControlNoiseCategory, 'Atmosphere length',
                                'atmosphereRadius', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.sky.params, 'atmosphereRadius',
                                1.e3, 1000.e3, 1.e3);

    this.controlpanel.addSlider(this.$skyControlNoiseCategory, 'Earth radius',
                                'earthRadius', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.sky.params, 'earthRadius',
                                100.e3, 100000.e3, 1.e3);

    this.controlpanel.addSlider(this.$skyControlNoiseCategory, 'Rayleigh polarization',
                                'rayleighPolarization', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.sky.params, 'rayleighPolarization',
                                0, 1, 0.01);

    this.controlpanel.addSlider(this.$skyControlNoiseCategory, 'Aerosol absorbtion',
                                'aerosolFactor', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.sky.params, 'aerosolFactor',
                                0, 1, 0.01);


    this.controlpanel.addSliderFunc(this.$skyControlNoiseCategory, 'Out scatt factor',
                                    'outScattFactor', 'waterControl', 'waterControlName',
                                    'waterControlValue', 'waterControlSlider',
                                    -_config.sky.params.outScatFactor*1e6,
                                    (function(that){
                                        return function(e, ui){
                                            $('#outScattFactorVal').html(ui.value);

                                            _config.sky.params.outScatFactor = -ui.value*1e-6;
                                        };
                                    })(this),
                                    0.001, 3, 0.001);

    this.controlpanel.addSlider(this.$skyControlNoiseCategory, 'Out scatt nb steps',
                                'steps', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.sky.params, 'outScatNbStep',
                                1, 30, 1);

    this.controlpanel.addSlider(this.$skyControlNoiseCategory, 'Mie exentricity',
                                'mieExentricity', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.sky.params, 'mieExentricity',
                                0.5, 0.99, 0.01);


        this.$skyControlNoiseCategory.append('\
            <hr />\
            <div class="waterControl waterControlName">Beta Rayleight:</div>\
        ');

        this.controlpanel.addSpinner(this.$skyControlNoiseCategory, 'R',
                                     'raileightR', 'waterControl',
                                     'waterControlValue2', 'waterControlSpinner2',
                                     _config.sky.params.betaRayleight, 'x',
                                     0., 20., 0.1, 1.);

        this.controlpanel.addSpinner(this.$skyControlNoiseCategory, 'G',
                                     'raileightG', 'waterControl',
                                     'waterControlValue2', 'waterControlSpinner2',
                                     _config.sky.params.betaRayleight, 'y',
                                     0., 20., 0.1, 1.);

        this.controlpanel.addSpinner(this.$skyControlNoiseCategory, 'B',
                                     'raileightB', 'waterControl',
                                     'waterControlValue2', 'waterControlSpinner2',
                                     _config.sky.params.betaRayleight, 'z',
                                     0., 20., 0.1, 1.);


        this.$skyControlNoiseCategory.append('\
            <hr />\
            <div class="waterControl waterControlName">Beta Mie:</div>\
        ');

        this.controlpanel.addSpinner(this.$skyControlNoiseCategory, 'R',
                                     'mieR', 'waterControl',
                                     'waterControlValue2', 'waterControlSpinner2',
                                     _config.sky.params.betaMie, 'x',
                                     0., 20., 0.1, 1.);

        this.controlpanel.addSpinner(this.$skyControlNoiseCategory, 'G',
                                     'mieG', 'waterControl',
                                     'waterControlValue2', 'waterControlSpinner2',
                                     _config.sky.params.betaMie, 'y',
                                     0., 20., 0.1, 1.);

        this.controlpanel.addSpinner(this.$skyControlNoiseCategory, 'B',
                                     'mieB', 'waterControl',
                                     'waterControlValue2', 'waterControlSpinner2',
                                     _config.sky.params.betaMie, 'z',
                                     0., 20., 0.1, 1.);


        this.$skyControlNoiseCategory.append('\
            <hr />\
            <div class="waterControl waterControlName">Beta aerosol:</div>\
        ');

        this.controlpanel.addSpinner(this.$skyControlNoiseCategory, 'R',
                                     'aerosolR', 'waterControl',
                                     'waterControlValue2', 'waterControlSpinner2',
                                     _config.sky.params.betaAerosol, 'x',
                                     0., 20., 0.1, 1.);

        this.controlpanel.addSpinner(this.$skyControlNoiseCategory, 'G',
                                     'aerosolG', 'waterControl',
                                     'waterControlValue2', 'waterControlSpinner2',
                                     _config.sky.params.betaAerosol, 'y',
                                     0., 20., 0.1, 1.);

        this.controlpanel.addSpinner(this.$skyControlNoiseCategory, 'B',
                                     'aerosolB', 'waterControl',
                                     'waterControlValue2', 'waterControlSpinner2',
                                     _config.sky.params.betaAerosol, 'z',
                                     0., 20., 0.1, 1.);


        this.$skyControlNoiseCategory.append('\
            <hr />\
            <div class="waterControl waterControlName">Beta out scatt:</div>\
        ');

        this.controlpanel.addSpinner(this.$skyControlNoiseCategory, 'R',
                                     'outscatR', 'waterControl',
                                     'waterControlValue2', 'waterControlSpinner2',
                                     _config.sky.params.betaOutScat, 'x',
                                     0., 20., 0.1, 1.);

        this.controlpanel.addSpinner(this.$skyControlNoiseCategory, 'G',
                                     'outscatG', 'waterControl',
                                     'waterControlValue2', 'waterControlSpinner2',
                                     _config.sky.params.betaOutScat, 'y',
                                     0., 20., 0.1, 1.);

        this.controlpanel.addSpinner(this.$skyControlNoiseCategory, 'B',
                                     'outscatB', 'waterControl',
                                     'waterControlValue2', 'waterControlSpinner2',
                                     _config.sky.params.betaOutScat, 'z',
                                     0., 20., 0.1, 1.);












    this.$skyAccordionTitle.append('<li><a href="#skyControlCloudCategory">Cloud</a></li>');

    this.$skyAccordion.append('\
        <div id="skyControlCloudCategory">\
        </div>\
    ');
    this.$skyControlCloudCategory = $('#skyControlCloudCategory');

    this.controlpanel.addSlider(this.$skyControlCloudCategory, 'Base height',
                                'cloudHeight', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.sky.cloud, 'cloudHeight',
                                100, 10000, 10);

    this.controlpanel.addSlider(this.$skyControlCloudCategory, 'Vertical depth',
                                'cloudDepth', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.sky.cloud, 'verticalDepth',
                                100, 10000, 100);

    this.controlpanel.addSlider(this.$skyControlCloudCategory, 'Presence',
                                'cloudPresence', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.sky.cloud, 'presence',
                                -0.99, 1., 0.01);

    this.controlpanel.addSlider(this.$skyControlCloudCategory, 'Density',
                                'cloudDensity', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.sky.cloud, 'density',
                                0.00001, 0.005, 0.00001);

    this.$skyControlCloudCategory.append('<hr />');

    this.controlpanel.addSlider(this.$skyControlCloudCategory, 'Velocity',
                                'cloudVel', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.sky.cloud, 'velocity',
                                -1000., 1000., 10.);

    this.controlpanel.addSliderFunc(this.$skyControlCloudCategory, 'Direction',
                                    'cloudDir', 'waterControl', 'waterControlName',
                                    'waterControlValue', 'waterControlSlider',
                                    Math.floor(Math.atan2(_config.sky.cloud.direction.y, _config.sky.cloud.direction.x)*_toDeg),
                                    (function(that){
                                        return function(e, ui){
                                            $('#cloudDirVal').html(ui.value);
                                            _config.sky.cloud.direction.x = Math.cos(ui.value*_toRad);
                                            _config.sky.cloud.direction.y = Math.sin(ui.value*_toRad);
                                        };
                                    })(this),
                                    0, 359, 1);

    this.controlpanel.addSlider(this.$skyControlCloudCategory, 'Shadow darkness',
                                'shadowDarkness', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.sky.cloud, 'shadowDarkness',
                                0., 1., 0.01);

    this.controlpanel.addSlider(this.$skyControlCloudCategory, 'Shadow hardness',
                                'shadowHardness', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.sky.cloud, 'shadowHardness',
                                0., 1., 0.01);


    this.$skyAccordion.tabs({
        event: 'click hoverintent',
        heightStyle: 'content'
    });

}

function WaterControl(controlpanel, camera, ocean)
{
    assert(function(){return camera instanceof Camera;}, 'camera is not a Camera');
    assert(function(){return ocean instanceof Ocean;}, 'ocean is not a Ocean');
    assert(function(){return controlpanel instanceof Controlpanel;}, 'controlpanel is not a Controlpanel');

    this.camera = camera;
    this.ocean = ocean;
    this.controlpanel = controlpanel;

    this.controlpanel.$controlpanel.append('\
        <div id="waterAccordion"  class="controlpanelFont">\
            <ul></ul>\
        </div>');


    this.controlpanel.$controlpanelTitle.append('<li><a href="#waterAccordion">Water</a></li>');

    this.$waterAccordion = $('#waterAccordion');
    this.$waterAccordionTitle = $('#waterAccordion ul');

    this.addGridcontrol();
    this.addWaveControl();
    this.addNoiseControl();
    this.addMiscControl();


    this.$waterAccordion.tabs({
        event: 'click hoverintent',
        heightStyle: 'content'
    });

}

WaterControl.prototype.addNoiseControl = function()
{
    this.$waterAccordion.append('\
        <div id="waterControlNoiseCategory">\
        </div>\
    ');

    this.$waterAccordionTitle.append('<li><a href="#waterControlNoiseCategory">Noise</a></li>');


    this.$waterControlNoiseCategory = $('#waterControlNoiseCategory');

    this.controlpanel.addSlider(this.$waterControlNoiseCategory, 'Amplitude',
                                'noiseAmp', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataNoise, 'amplitude',
                                0, 50, 0.1);

    this.controlpanel.addSlider(this.$waterControlNoiseCategory, 'Pow factor',
                                'powAmp', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataNoise, 'amplitudePow',
                                0, 4, 0.1);

    this.controlpanel.addSlider(this.$waterControlNoiseCategory, 'Displacement',
                                'noiseDis', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataNoise, 'displacementFactor',
                                0, 20, 0.1);

    this.controlpanel.addSlider(this.$waterControlNoiseCategory, 'disp min height',
                                'noiseDisMin', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataNoise, 'displacementMinHeight',
                                0.01, 1, 0.01);

    this.controlpanel.addSlider(this.$waterControlNoiseCategory, 'disp max height',
                                'noiseDisMax', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataNoise, 'displacementMaxHeight',
                                1, 5, 0.01);

    this.controlpanel.addSlider(this.$waterControlNoiseCategory, 'red min height',
                                'noiseRedMin', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataNoise, 'reductionMinHeight',
                                0.01, 1, 0.01);

    this.controlpanel.addSlider(this.$waterControlNoiseCategory, 'red factor',
                                'noiseRedFactor', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataNoise, 'reductionFactor',
                                0, 2, 0.01);


    for(var i=1; i<=3; ++i){
        this.$waterControlNoiseCategory.append('\
            <hr />\
            <div class="waterControl waterControlName">Octave '+i+' :</div>\
        ');

        this.controlpanel.addSpinner(this.$waterControlNoiseCategory, 'X',
                                     'noise'+i+'PeriodX', 'waterControl',
                                     'waterControlValue4', 'waterControlSpinner2',
                                     _config.ocean.dataNoise['octave'+i].period, 'x',
                                     0.001, 0.1, 0.001, 0.01);

        this.controlpanel.addSpinner(this.$waterControlNoiseCategory, 'Y',
                                     'noise'+i+'PeriodY', 'waterControl',
                                     'waterControlValue4', 'waterControlSpinner2',
                                     _config.ocean.dataNoise['octave'+i].period, 'y',
                                     0.001, 0.1, 0.001, 0.01);

        this.controlpanel.addSpinner(this.$waterControlNoiseCategory, 'T',
                                     'noise'+i+'PeriodT', 'waterControl',
                                     'waterControlValue4', 'waterControlSpinner2',
                                     _config.ocean.dataNoise['octave'+i].period, 'z',
                                     0.01, 1, 0.01, 0.1);

        this.$waterControlNoiseCategory.append('<div class="waterControl waterControlName"></div>');

        this.controlpanel.addSpinner(this.$waterControlNoiseCategory, 'Amp',
                                     'noise'+i+'Amp', 'waterControl',
                                     'waterControlValue4', 'waterControlSpinner2',
                                     _config.ocean.dataNoise['octave'+i], 'amplitude',
                                     0, 10, 0.01, 0.1);
    }
}

WaterControl.prototype.addWaveControl = function()
{
    this.$waterAccordion.append('\
        <div id="waterControlWavesCategory">\
        </div>\
    ');

    this.$waterAccordionTitle.append('<li><a href="#waterControlWavesCategory">Waves</a></li>');


    this.$waterControlWavesCategory = $('#waterControlWavesCategory');

    this.controlpanel.addSlider(this.$waterControlWavesCategory, 'Disp factor',
                                'waveDis', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataWave, 'displacementFactor',
                                0, 500, 1);

    this.controlpanel.addSlider(this.$waterControlWavesCategory, 'Disp min height',
                                'waveDisMin', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataWave, 'displacementMinHeight',
                                0.01, 1, 0.01);

    this.controlpanel.addSlider(this.$waterControlWavesCategory, 'Disp max height',
                                'waveDisMax', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataWave, 'displacementMaxHeight',
                                1, 5, 0.01);

    this.controlpanel.addSlider(this.$waterControlWavesCategory, 'wind width',
                                'windNoise', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataWave.wind, 'length',
                                1, 10000, 1);

    this.controlpanel.addSlider(this.$waterControlWavesCategory, 'wind amp refl',
                                'windAmplituderef', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataWave.wind, 'amplitudeReflection',
                                0.001, 1, 0.001);

    this.controlpanel.addSlider(this.$waterControlWavesCategory, 'wind amp norm',
                                'windAmplitudenorm', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataWave.wind, 'amplitudeNormal',
                                0.001, 1.5, 0.001);

    this.controlpanel.addSlider(this.$waterControlWavesCategory, 'wind vel',
                                'windVel', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataWave.wind, 'velocity',
                                -0.1, 0.1, 0.0001);


    this.controlpanel.addSliderFunc(this.$waterControlWavesCategory, 'wind direction',
                                    'windDir', 'waterControl', 'waterControlName',
                                    'waterControlValue', 'waterControlSlider',
                                    Math.floor(Math.atan2(_config.ocean.dataWave.wind.direction.y, _config.ocean.dataWave.wind.direction.x)*_toDeg),
                                    (function(i, that){
                                        return function(e, ui){
                                            $('#windDirVal').html(ui.value);
                                            _config.ocean.dataWave.wind.direction.x = Math.cos(ui.value*_toRad);
                                            _config.ocean.dataWave.wind.direction.y = Math.sin(ui.value*_toRad);
                                        };
                                    })(i, this),
                                    0, 359, 1);
    for (var i=1; i<=3; ++i){

        this.$waterControlWavesCategory.append('\
            <hr />\
            <div class="waterControl waterControlName">Wave '+i+' shape:</div>\
        ');

        this.controlpanel.addSpinner(this.$waterControlWavesCategory, 'Length',
                                     'wave'+i, 'waterControl',
                                     'waterControlValue2', 'waterControlSpinner',
                                     _config.ocean.dataWave['wave'+i], 'totalLength',
                                     0, 9999, 1, 100);

        this.controlpanel.addDoubleSlider(this.$waterControlWavesCategory,
                                          'wave'+i+'Shape', 'waterControl', 'waterControlSlider',
                                          [
                                              _config.ocean.dataWave['wave'+i].risingLength/_config.ocean.dataWave['wave'+i].totalLength,
                                              _config.ocean.dataWave['wave'+i].length/_config.ocean.dataWave['wave'+i].totalLength
                                          ],
                                          (function(i, that){
                                            return function(){that.updateWaveLengths(i);}
                                          })(i, this),
                                          0, 1, 0.001);

        this.$waterControlWavesCategory.append('<div class="waterControl waterControlName">Wave '+i+' dynamic:</div>');

        this.controlpanel.addSpinner(this.$waterControlWavesCategory, 'Velocity',
                                     'wave'+i+'Vel', 'waterControl',
                                     'waterControlValue3', 'waterControlSpinner',
                                     _config.ocean.dataWave['wave'+i], 'velocity',
                                     0, 9999, 1, 10);

        this.controlpanel.addSpinner(this.$waterControlWavesCategory, 'Amplitude',
                                     'wave'+i+'Amp', 'waterControl',
                                     'waterControlValue3', 'waterControlSpinner',
                                     _config.ocean.dataWave['wave'+i], 'amplitude',
                                     0, 9999, 1, 10);

        this.controlpanel.addSliderFunc(this.$waterControlWavesCategory, 'Wave '+i+' direction',
                                        'wave'+i+'Dir', 'waterControl', 'waterControlName',
                                        'waterControlValue', 'waterControlSlider',
                                        Math.floor(Math.atan2(_config.ocean.dataWave['wave'+i].direction.y, _config.ocean.dataWave['wave'+i].direction.x)*_toDeg),
                                        (function(i, that){
                                            return function(e, ui){
                                                $('#wave'+i+'DirVal').html(ui.value);
                                                _config.ocean.dataWave['wave'+i].direction.x = Math.cos(ui.value*_toRad);
                                                _config.ocean.dataWave['wave'+i].direction.y = Math.sin(ui.value*_toRad);
                                            };
                                        })(i, this),
                                        0, 359, 1);
    }

}

WaterControl.prototype.addMiscControl = function()
{
    this.$waterAccordion.append('\
        <div id="waterControlMiscCategory">\
        </div>\
    ');

    this.$waterAccordionTitle.append('<li><a href="#waterControlMiscCategory">Misc</a></li>');


    this.$waterControlMiscCategory = $('#waterControlMiscCategory');

    this.controlpanel.addSlider(this.$waterControlMiscCategory, 'Horizon dist',
                                'horizonDist', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.params, 'horizonDist',
                                0, 10000, 10);

    this.controlpanel.addSlider(this.$waterControlMiscCategory, 'Shanon margin',
                                'shanonMargin', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.params, 'shanonMargin',
                                0, 1, 0.01);

    this.controlpanel.addSliderFunc2(this.$waterControlMiscCategory, 'Tangent inv dist',
                                     'tangentScreenDist', 'waterControl', 'waterControlName',
                                     'waterControlValue', 'waterControlSlider',
                                     Math.log(1./_config.ocean.params.tangentScreenDist)/Math.log(2),
                                     1./_config.ocean.params.tangentScreenDist,
                                     function(e, ui){
                                         var val = Math.pow(2,ui.value);
                                         $('#tangentScreenDistVal').html(val);
                                         _config.ocean.params.tangentScreenDist = 1./val;;
                                     }.bind(this),
                                     1, 10, 1);

    this.controlpanel.addSlider(this.$waterControlMiscCategory, 'Turbidity factor',
                                'turbidityMinDepth', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.params, 'turbidityFactor',
                                0, 0.05, 0.0001);

    this.controlpanel.addSlider(this.$waterControlMiscCategory, 'Sky reflection factor',
                                'skyReflectionFactor', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.params, 'skyReflectionFactor',
                                0, 10., 0.01);

    this.controlpanel.addSlider(this.$waterControlMiscCategory, 'Sky reflection Abs',
                                'skyReflectionAbsorbtion', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.params, 'skyReflectionAbsorbtion',
                                0, 1., 0.01);

    this.$waterControlMiscCategory.append('<hr />');

    this.controlpanel.addSlider(this.$waterControlMiscCategory, 'Sea color R',
                                'seaColorR', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.params.seaColor, 'r',
                                0, 1, 0.01);

    this.controlpanel.addSlider(this.$waterControlMiscCategory, 'Sea color G',
                                'seaColorG', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.params.seaColor, 'g',
                                0, 1, 0.01);

    this.controlpanel.addSlider(this.$waterControlMiscCategory, 'Sea color B',
                                'seaColorB', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.params.seaColor, 'b',
                                0, 1, 0.01);

    this.$waterControlMiscCategory.append('<hr />');

    this.controlpanel.addSlider(this.$waterControlMiscCategory, 'Foam height',
                                'foamHeight', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataFoam, 'foamHeight',
                                0., 10., 0.01);

    this.controlpanel.addSlider(this.$waterControlMiscCategory, 'Foam dispertion',
                                'foamDispertion', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataFoam, 'dispertion',
                                0.5, 1., 0.001);

    this.controlpanel.addSlider(this.$waterControlMiscCategory, 'Velocity abs',
                                'velocityAbsorbtion', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataFoam, 'velocityAbsorbtion',
                                0., 10., 0.1);

    this.controlpanel.addSlider(this.$waterControlMiscCategory, 'Foam viscosity',
                                'foamviscosity', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataFoam, 'viscosity',
                                0., 1., 0.01);

    this.controlpanel.addSlider(this.$waterControlMiscCategory, 'Foam source Addition',
                                'sourceAddition', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataFoam, 'sourceAddition',
                                0., 1., 0.001);

    this.controlpanel.addSlider(this.$waterControlMiscCategory, 'Wave breaking angle',
                                'waveBreakingAngle', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.dataFoam, 'waveBreakingAngle',
                                0., 1., 0.01);


}

WaterControl.prototype.addGridcontrol = function()
{
    this.$waterAccordion.append('\
        <div id="waterControlGridCategory">\
        </div>\
    ');

    this.$waterAccordionTitle.append('<li><a href="#waterControlGridCategory">Grid</a></li>');


    this.$waterControlGridCategory = $('#waterControlGridCategory');

    var func = function(name){
        var that = this;
        return function(e, ui){
            var val = Math.pow(2,ui.value);
            $('#'+name+'Val').html(val);
            that.updateSampling();
        };
    }.bind(this)

    var func2 = function(name){
        var that = this;
        return function(e, ui){
            var val = ui.value;
            $('#'+name+'Val').html(val);
            that.updateSampling();
        };
    }.bind(this)

    this.controlpanel.addSliderFunc2(this.$waterControlGridCategory, 'Grid sampling',
                                     'gridSampling', 'waterControl', 'waterControlName',
                                     'waterControlValue', 'waterControlSlider',
                                     _config.ocean.sampling.grid,
                                     _config.ocean.sampling.grid,
                                     func2('gridSampling'),
                                     64, 512, 64);

    this.controlpanel.addSliderFunc2(this.$waterControlGridCategory, 'Wave sampling',
                                     'waveSampling', 'waterControl', 'waterControlName',
                                     'waterControlValue', 'waterControlSlider',
                                     Math.log(_config.ocean.sampling.wave)/Math.log(2),
                                     _config.ocean.sampling.wave,
                                     func('waveSampling'),
                                     1, 10, 1);

    this.controlpanel.addSliderFunc2(this.$waterControlGridCategory, 'Noise sampling',
                                     'noiseSampling', 'waterControl', 'waterControlName',
                                     'waterControlValue', 'waterControlSlider',
                                     Math.log(_config.ocean.sampling.noise)/Math.log(2),
                                     _config.ocean.sampling.noise,
                                     func('noiseSampling'),
                                     1, 10, 1);

    this.controlpanel.addSliderFunc2(this.$waterControlGridCategory, 'Reflection sampling',
                                     'reflectionSampling', 'waterControl', 'waterControlName',
                                     'waterControlValue', 'waterControlSlider',
                                     Math.log(_config.ocean.sampling.reflection)/Math.log(2),
                                     _config.ocean.sampling.reflection,
                                     func('reflectionSampling'),
                                     1, 10, 1);

    this.controlpanel.addSliderFunc2(this.$waterControlGridCategory, 'Seabed sampling',
                                     'seabedSampling', 'waterControl', 'waterControlName',
                                     'waterControlValue', 'waterControlSlider',
                                     Math.log(_config.ocean.sampling.seabed)/Math.log(2),
                                     _config.ocean.sampling.seabed,
                                     func('seabedSampling'),
                                     1, 10, 1);

    this.controlpanel.addSliderFunc2(this.$waterControlGridCategory, 'Foam sampling',
                                     'foamSampling', 'waterControl', 'waterControlName',
                                     'waterControlValue', 'waterControlSlider',
                                     Math.log(_config.ocean.sampling.foam)/Math.log(2),
                                     _config.ocean.sampling.foam,
                                     func('foamSampling'),
                                     1, 10, 1);

    this.controlpanel.addSliderFunc2(this.$waterControlGridCategory, 'Foam acc sampling',
                                     'foamAccSampling', 'waterControl', 'waterControlName',
                                     'waterControlValue', 'waterControlSlider',
                                     Math.log(_config.ocean.sampling.foamAccumulation)/Math.log(2),
                                     _config.ocean.sampling.foamAccumulation,
                                     func('foamAccSampling'),
                                     1, 10, 1);

    this.controlpanel.addSlider(this.$waterControlGridCategory, 'Foam acc dist',
                                'foamAccWidth', 'waterControl', 'waterControlName',
                                'waterControlValue', 'waterControlSlider',
                                _config.ocean.params, 'foamAccTextureWidth',
                                1000, 30000, 500);
}

WaterControl.prototype.updateSampling = function()
{
    var s = {
        grid: parseInt($('#gridSamplingVal').html()),
        wave: parseInt($('#waveSamplingVal').html()),
        noise: parseInt($('#noiseSamplingVal').html()),
        reflection: parseInt($('#reflectionSamplingVal').html()),
        seabed: parseInt($('#seabedSamplingVal').html()),
        foam: parseInt($('#foamSamplingVal').html()),
        foamAccumulation: parseInt($('#foamAccSamplingVal').html())
    }

    this.ocean.setSampling(s);
}

WaterControl.prototype.updateWaveLengths = function(num)
{
    window.setTimeout(function(){
        var partialLengths = $('#wave'+num+'ShapeSlider').slider('values');
        var totalLength = $('#wave'+num+'Spinner').spinner('value');
        _config.ocean.dataWave['wave'+num].totalLength = totalLength;
        _config.ocean.dataWave['wave'+num].risingLength = partialLengths[0]*totalLength;
        _config.ocean.dataWave['wave'+num].length = partialLengths[1]*totalLength;
    }.bind(this), 50);
}

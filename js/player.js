function Player(camera){
    assert(function(){return camera instanceof Camera;}, 'camera is not a Camera');

    this.camera = camera;

    this.keyUpPressed = false;
    this.keyDownPressed = false;
    this.keyLeftPressed = false;
    this.keyRightPressed = false;

    _$body.keydown(function(e){
        switch(e.keyCode){
            case _config.player.keyUpCode:
                this.keyUpPressed = true;
            break;
            case _config.player.keyDownCode:
                this.keyDownPressed = true;
            break;
            case _config.player.keyLeftCode:
                this.keyLeftPressed = true;
            break;
            case _config.player.keyrightCode:
                this.keyRightPressed = true;
            break;
        }
    }.bind(this));

    _$body.keyup(function(e){
        switch(e.keyCode){
            case _config.player.keyUpCode:
                this.keyUpPressed = false;
            break;
            case _config.player.keyDownCode:
                this.keyDownPressed = false;
            break;
            case _config.player.keyLeftCode:
                this.keyLeftPressed = false;
            break;
            case _config.player.keyrightCode:
                this.keyRightPressed = false;
            break;
        }
    }.bind(this));

    _$body.focusout(function(){
        this.keyUpPressed = false;
        this.keyDownPressed = false;
        this.keyLeftPressed = false;
        this.keyRightPressed = false;

    });
}


Player.prototype.update = function()
{
    var camAngle = this.camera.camera.alpha;
    var dirAngle = 0;
    var needToStop = false;

    if (this.keyUpPressed){
        if (this.keyLeftPressed){
            dirAngle = _pi/4.;
        }else if (this.keyRightPressed){
            dirAngle = 7.*_pi/4.;
        }else{
            dirAngle = 0.;
        }
    }else if(this.keyDownPressed){
        if (this.keyLeftPressed){
            dirAngle = 3.*_pi/4.;
        }else if (this.keyRightPressed){
            dirAngle = 5.*_pi/4.;
        }else{
            dirAngle = _pi;
        }
    }else if (this.keyLeftPressed){
        dirAngle = _pi/2.;
    }else if (this.keyRightPressed){
        dirAngle = 3.*_pi/2.;
    }else{
        needToStop = true;
    }

    var angle = camAngle + dirAngle + _pi;
    var cosAngle = Math.cos(angle);
    var sinAngle = Math.sin(angle);

    if (needToStop){
        _config.player.velocity.x *= 0.9;
        _config.player.velocity.z *= 0.9;
        _config.player.acceleration.x = 0.0;
        _config.player.acceleration.z = 0.0;

        if (Math.abs(_config.player.velocity.x)<_config.player.minVelocity){
            _config.player.velocity.x = 0.;
        }
        if (Math.abs(_config.player.velocity.z)<_config.player.minVelocity){
            _config.player.velocity.z = 0.;
        }

    }else{
        _config.player.acceleration.x = cosAngle * _config.player.maxAcceleration;
        _config.player.acceleration.z = sinAngle * _config.player.maxAcceleration;
    }


    _config.player.deltaPosition.x = _config.player.velocity.x * _config.dt;
    _config.player.deltaPosition.z = _config.player.velocity.z * _config.dt;
    _config.player.position.x += _config.player.deltaPosition.x;
    _config.player.position.z +=  _config.player.deltaPosition.z;
    _config.player.velocity.x += _config.player.acceleration.x * _config.dt;
    _config.player.velocity.z += _config.player.acceleration.z * _config.dt;

    var velNorm = Math.sqrt(_config.player.velocity.x*_config.player.velocity.x + _config.player.velocity.z*_config.player.velocity.z);
    var factor = 1.;
    if (velNorm>0.001)
    {
        factor = Math.min(velNorm, _config.player.maxVelocity) / velNorm;
    }

    _config.player.velocity.x *= factor;
    _config.player.velocity.z *= factor;

    _config.player.angle = camAngle%(2.*_pi);


}

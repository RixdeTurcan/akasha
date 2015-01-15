<!DOCTYPE html>

<html>
<head>
    <title>Morpheus Project</title>

    <script type="text/javascript" src="js/jquery.2.0.3/jquery.2.0.3.js"></script>
    <script type="text/javascript" src="js/jquery.2.0.3/jquery-ui-1.10.3.custom.js"></script>
    <script type="text/javascript" src="js/hand.1.3.0/Hand.js"></script>
    <script type="text/javascript" src="js/Babylon.js-1.14/babylon.1.14-debug.js"></script>
    <script type="text/javascript" src="js/plugin_babylon.js"></script>

    <script type="text/javascript" src="js/tools.js"></script>
    <script type="text/javascript" src="js/shader.js"></script>
    <script type="text/javascript" src="js/global.js"></script>

    <script type="text/javascript" src="js/material/reflection_ground.js"></script>
    <script type="text/javascript" src="js/material/foam_shore_ground.js"></script>
    <script type="text/javascript" src="js/material/seabed_ground.js"></script>
    <script type="text/javascript" src="js/material/shadow_ground.js"></script>
    <script type="text/javascript" src="js/material/vegetation_pos.js"></script>
    <script type="text/javascript" src="js/material/vegetation.js"></script>
    <script type="text/javascript" src="js/material/ground.js"></script>
    <script type="text/javascript" src="js/material/cloudheight.js"></script>
    <script type="text/javascript" src="js/material/cloudsundepth.js"></script>
    <script type="text/javascript" src="js/material/sea.js"></script>
    <script type="text/javascript" src="js/material/wave.js"></script>
    <script type="text/javascript" src="js/material/noise.js"></script>
    <script type="text/javascript" src="js/material/noise2.js"></script>
    <script type="text/javascript" src="js/material/foam_accumulation.js"></script>
    <script type="text/javascript" src="js/material/sky.js"></script>
    <script type="text/javascript" src="js/material/texture.js"></script>
    <script type="text/javascript" src="js/material/copy.js"></script>

    <script type="text/javascript" src="js/config.js"></script>
    <script type="text/javascript" src="js/world.js"></script>
    <script type="text/javascript" src="js/camera.js"></script>
    <script type="text/javascript" src="js/shadow.js"></script>
    <script type="text/javascript" src="js/player.js"></script>

    <script type="text/javascript" src="js/light.js"></script>
    <script type="text/javascript" src="js/ground.js"></script>
    <script type="text/javascript" src="js/vegetation.js"></script>
    <script type="text/javascript" src="js/sky.js"></script>
    <script type="text/javascript" src="js/ocean.js"></script>
    <script type="text/javascript" src="js/control_panel.js"></script>

    <script type="text/javascript" src="js/game.js"></script>

    <link type='text/css' rel='stylesheet' href='css/game.css' />
    <link type='text/css' rel='stylesheet' href='css/control_panel.css' />
    <link type='text/css' rel="stylesheet" href="css/dark-hive/jquery-ui-1.10.3.custom.css" />
</head>

<body>
    <canvas id="canvas"></canvas>
    <div style="display:none;" id="testNumber"><? if (isset($_GET['num'])){echo $_GET['num'];}else{echo 1;} ?></div>
</body>
</html>

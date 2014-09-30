_shaders = {
    vertex:{},
    fragment:{},
    include:{}
};

_ShaderCommonCode = 'precision mediump float;\n';

function Shader(vertexName, fragmentName, vertexIncludeNames, fragmentIncludeNames)
{
    assert(function(){return ((typeof vertexName == 'string') || (vertexName instanceof String));}, 'vertexName is not a string');
    assert(function(){return ((typeof fragmentName == 'string') || (fragmentName instanceof String));}, 'fragmentName is not a string');
    assert(function(){return ((vertexIncludeNames instanceof Array) || !vertexIncludeNames);}, 'vertexIncludeNames is not an array');
    assert(function(){
        if (!vertexIncludeNames){return true;}
        for(var i in vertexIncludeNames){
            if (!((typeof vertexIncludeNames[i] == 'string') || (vertexIncludeNames[i] instanceof String))){
              return false;
            }
        }
        return true;
    }, 'vertexIncludeNames elements are not strings');
    assert(function(){return ((fragmentIncludeNames instanceof Array) || !fragmentIncludeNames);}, 'fragmentIncludeNames is not an array');
    assert(function(){
        if (!fragmentIncludeNames){return true;}
        for(var i in fragmentIncludeNames){
            if (!((typeof fragmentIncludeNames[i] == 'string') || (fragmentIncludeNames[i] instanceof String))){
              return false;
            }
        }
        return true;
    }, 'fragmentIncludeNames elements are not strings');

    this.vertexName = vertexName;
    this.fragmentName = fragmentName;
    this.vertexIncludeNames = vertexIncludeNames;
    this.fragmentIncludeNames = fragmentIncludeNames;

    this.isReady= false;
    this.isVertexReady = false;
    this.isFragmentReady = false;
    this.isVertexIncludeReady = [];
    for (var i in this.vertexIncludeNames){
        this.isVertexIncludeReady[i] = false;
    }
    this.isFragmentIncludeReady = [];
    for (var i in this.fragmentIncludeNames){
        this.isFragmentIncludeReady[i] = false;
    }

    this.vertexContent = null;
    this.fragmentContent = null;
    this.vertexIncludeContent = [];
    this.fragmentIncludeContent = [];

    this.vertexElem = null;
    this.fragmentElem = null;

    this.loadShader('vertex', this.vertexName, this.getVertexContent.bind(this));

    this.loadShader('fragment', this.fragmentName, this.getFragmentContent.bind(this));

    for (var i in this.vertexIncludeNames){
        this.loadShader('include', this.vertexIncludeNames[i], this.getVertexIncludeContent.bind(this), i);
    }
    for (var i in this.fragmentIncludeNames){
        this.loadShader('include', this.fragmentIncludeNames[i], this.getFragmentIncludeContent.bind(this), i);
    }
}

Shader.prototype.loadShader = function(type, name, getContentFunction, param)
{
    if (!_shaders[type][name]){
        _shaders[type][name] = {
            state: 1,
            content: null,
            callbacks: [getContentFunction],
            callbacksParams: [param]
        };
        BABYLON.Tools.LoadFile(name, function(content){
            _shaders[type][name].content = content;
            _shaders[type][name].state = 2;
            for(var i in _shaders[type][name].callbacks){
                _shaders[type][name].callbacks[i](_shaders[type][name].callbacksParams[i]);
            }
        }.bind(this));
    }else if (_shaders[type][name].state == 1){
        _shaders[type][name].callbacks.push(getContentFunction);
        _shaders[type][name].callbacksParams.push(param);
    }else if (_shaders[type][name].state == 2){
        getContentFunction(param);
    }
}

Shader.prototype.getVertexContent = function()
{
    this.vertexContent = _shaders.vertex[this.vertexName].content;
    this.isVertexReady = true;
    this.updateIsReady();
}

Shader.prototype.getFragmentContent = function()
{
    this.fragmentContent = _shaders.fragment[this.fragmentName].content;
    this.isFragmentReady = true;
    this.updateIsReady();
}

Shader.prototype.getVertexIncludeContent = function(num)
{
    this.vertexIncludeContent[num] = _shaders.include[this.vertexIncludeNames[num]].content;
    this.isVertexIncludeReady[num] = true;
    this.updateIsReady();
}

Shader.prototype.getFragmentIncludeContent = function(num)
{
    this.fragmentIncludeContent[num] = _shaders.include[this.fragmentIncludeNames[num]].content;
    this.isFragmentIncludeReady[num] = true;
    this.updateIsReady();
}

Shader.prototype.updateIsReady = function()
{
    if (this.isVertexReady && this.isFragmentReady)
    {
        for (var i in this.vertexIncludeNames){
            if (!this.isVertexIncludeReady[i]){
                return;
            }
        }
        for (var i in this.fragmentIncludeNames){
            if (!this.isFragmentIncludeReady[i]){
                return;
            }
        }
        if (!this.isReady){
            this.vertexElem = document.createElement('vertex'+this.vertexName.replace(/\W+/g, "_"));
            this.vertexElem.textContent = _ShaderCommonCode;
            for (var i in this.vertexIncludeNames){
                this.vertexElem.textContent += this.vertexIncludeContent[i];
            }
            this.vertexElem.textContent += this.vertexContent;

            this.fragmentElem = document.createElement('fragment'+this.fragmentName.replace(/\W+/g, "_"));
            this.fragmentElem.textContent = _ShaderCommonCode;
            for (var i in this.fragmentIncludeNames){
                this.fragmentElem.textContent += this.fragmentIncludeContent[i];
            }
            this.fragmentElem.textContent += this.fragmentContent;
        }
        this.isReady = true;
    }
}

export const createShader = (gl, type, source) => {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        return shader;
        
    throw new Error(gl.getShaderInfoLog(shader));
}

// プログラムオブジェクトを生成しシェーダをリンク
export const createProgram = (gl, vsSource, fsSource) => {
    let vs  = createShader(gl, gl.VERTEX_SHADER,   vsSource);
    let fs  = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    let prg = gl.createProgram();
    gl.attachShader(prg, vs);
    gl.attachShader(prg, fs);
    gl.linkProgram(prg);
    
    if (gl.getProgramParameter(prg, gl.LINK_STATUS)) 
        return prg;

    throw new Error(gl.getProgramInfoLog(prg));
}

export const getUniformLocations = (gl, program) => {
    let uniforms = {};
    let count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
        let name = gl.getActiveUniform(program, i).name;
        uniforms[name] = gl.getUniformLocation(program, name);
    }
    return uniforms;
}

export const createVBO = (gl, data) => {
    let vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW, 0, data.length);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;
}

export const createTexture = (gl, width, height, internalformatStr, wrapS, wrapT) => {
    let tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    // Enumの組み合わせ
    // https://www.khronos.org/registry/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
    const texTable = {
        RGBA   : { internalformat: gl.RGBA,    format: gl.RGBA,         type: gl.UNSIGNED_BYTE },
        RGBA32F: { internalformat: gl.RGBA32F, format: gl.RGBA,         type: gl.FLOAT },
        RGBA16F: { internalformat: gl.RGBA16F, format: gl.RGBA,         type: gl.HALF_FLOAT },
        RG32F  : { internalformat: gl.RG32F,   format: gl.RG,           type: gl.FLOAT },
        RG32I  : { internalformat: gl.RG32I,   format: gl.RG_INTEGER,   type: gl.INT },
        R32F   : { internalformat: gl.R32F,    format: gl.RED,          type: gl.FLOAT },
        R32I   : { internalformat: gl.R32I,    format: gl.RED_INTEGER,  type: gl.INT },
        RG16F  : { internalformat: gl.RG16F,   format: gl.RG,           type: gl.HALF_FLOAT },
        RG16I  : { internalformat: gl.RG16I,   format: gl.RG_INTEGER,   type: gl.SHORT },
        RG16UI : { internalformat: gl.RG16UI,  format: gl.RG_INTEGER,   type: gl.UNSIGNED_SHORT },
        R16F   : { internalformat: gl.R16F,    format: gl.RED,          type: gl.HALF_FLOAT },
        R16I   : { internalformat: gl.R16I,    format: gl.RED_INTEGER,  type: gl.SHORT },
        R16UI  : { internalformat: gl.R16UI,   format: gl.RED_INTEGER,  type: gl.UNSIGNED_SHORT },
        R8     : { internalformat: gl.R8,      format: gl.RED,          type: gl.UNSIGNED_BYTE },
    };

    let key = internalformatStr;
    if (!(key in texTable))
        console.error(`Not implemented texture internalformat "${key}".`);

    gl.texImage2D(gl.TEXTURE_2D, 0, texTable[key].internalformat, width, height, 0, texTable[key].format, texTable[key].type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

    return tex;
}

export const attachTexture = (gl, fbo, tex, attach) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attach, gl.TEXTURE_2D, tex, 0);
}

export const detacheTexture = (gl, fbo, attach) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attach, gl.TEXTURE_2D, null, 0);
}

export const bindTextureUniform = (gl, unit, location, tex) => {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(location, unit);
}

export const bindUBO = (gl, binding, data) => {
    // 要素数が4の倍数(new Float32Array(_data).lengthが16Bの倍数)になるようにリサイズ
    let _data = data.slice();
    let add = (4 - _data.length % 4) % 4;
    for (let i = 0; i < add; i++)
        _data.push(0);

    let ubo = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, ubo);
    gl.bufferData(gl.UNIFORM_BUFFER, new Float32Array(_data), gl.STATIC_DRAW, 0, _data.length);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, binding, ubo);
}

export const setAttributes = (gl, vbo, attL, attS) => {
    for (let i = 0; i < vbo.length; i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);
        gl.enableVertexAttribArray(attL[i]);
        gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
    }
}

import { createTexture, attachTexture, detacheTexture } from './glutils.js';

export class FramebufferObject {
    #gl;
    #fbo;
    #width;
    #height;
    #textures;
    constructor(gl, width, height, textureNamesFormats, createDepthBuffer = false) {
        this.#gl = gl;
        this.#fbo = this.#gl.createFramebuffer();
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.#fbo);

        this.#width = width;
        this.#height = height;

        if (createDepthBuffer) {
            let depth = this.#gl.createRenderbuffer();
            this.#gl.bindRenderbuffer(this.#gl.RENDERBUFFER, depth);
            this.#gl.renderbufferStorage(this.#gl.RENDERBUFFER, this.#gl.DEPTH_COMPONENT16, this.#width, this.#height);
            this.#gl.framebufferRenderbuffer(this.#gl.FRAMEBUFFER, this.#gl.DEPTH_ATTACHMENT, this.#gl.RENDERBUFFER, depth);
            this.#gl.bindRenderbuffer(this.#gl.RENDERBUFFER, null);
        }

        this.#textures = new Map();
        textureNamesFormats.forEach(([name, format, wrapS, wrapT], index) => {
            this.#textures.set(name, { 
                tex: createTexture(this.#gl, this.#width, this.#height, format, wrapS ?? this.#gl.CLAMP_TO_EDGE, wrapT ?? this.#gl.CLAMP_TO_EDGE), 
                att: this.#gl.COLOR_ATTACHMENT0 + index,
                fmt: format
            });
            attachTexture(this.#gl, this.#fbo, this.#textures.get(name).tex, this.#textures.get(name).att);
        });

        this.setDrawBuffersAll();

        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
    }

    bind() {
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.#fbo);
        this.#gl.viewport(0, 0, this.#width, this.#height);
    }

    // 今は関係ないけどテクスチャをデタッチした後アタッチするとCOLOR_ATTACHMENTの順番の不整合が起きる
    setDrawBuffersAll() {
        if (this.#textures.size === 0)
            return;

        let draw = [];
        this.#textures.forEach(t => draw.push(t.att));
        this.#gl.drawBuffers(draw);
    }

    texture(name) {
        if (this.#textures.has(name))
            return this.#textures.get(name).tex;
        else // debug
            console.error(`Texture '${name}' does not exist.`);
    }

    detache(name) {
        if (!this.#textures.has(name))
            return;
        
        detacheTexture(this.#gl, this.#fbo, this.#textures.get(name).att);
        this.#textures.delete(name);
    }

    width() {
        return this.#width;
    }

    height() {
        return this.#height;
    }

    // テクスチャの内容は破棄
    resize(width, height) {
        this.#width = width;
        this.#height = height;

        let tmp = new Map(this.#textures);
        for (let [name, _] of this.#textures)
            this.detache(name);

        this.#gl.activeTexture(this.#gl.TEXTURE0);
        for (let [name, val] of tmp) {
            this.#gl.bindTexture(this.#gl.TEXTURE_2D, val.tex);
            let ws = this.#gl.getTexParameter(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_S);
            let wt = this.#gl.getTexParameter(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_T);
            let resized = createTexture(this.#gl, this.#width, this.#height, val.fmt, ws, wt);
            this.#textures.set(name, { tex: resized, att: val.att, fmt: val.fmt });
            attachTexture(this.#gl, this.#fbo, resized, val.att);
        }

        for (let [_, val] of tmp)
            this.#gl.deleteTexture(val.tex);
    }
}

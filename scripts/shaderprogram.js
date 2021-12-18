import { createProgram, getUniformLocations } from './glutils.js';

export class ShaderProgram {
    #gl;
    #program;
    #uniforms;
    constructor(gl, vsSource, fsSource, location, stride, uniformBlockNameBinding) {
        this.#gl       = gl;
        this.#program  = createProgram(this.#gl, vsSource, fsSource);
        this.#uniforms = getUniformLocations(this.#gl, this.#program);
        this.location  = location;
        this.stride    = stride;
        
        for (const [name, binding] of uniformBlockNameBinding) {
            const idx = this.#gl.getUniformBlockIndex(this.#program, name);
            this.#gl.uniformBlockBinding(this.#program, idx, binding);
        }
    }

    use() {
        this.#gl.useProgram(this.#program);
    }

    uniform(name) {
        if (name in this.#uniforms)
            return this.#uniforms[name];
        else // debug
            console.error(`Uniform '${name}' does not exist.`);
    }
}

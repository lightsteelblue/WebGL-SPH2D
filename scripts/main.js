'use strict'

import { Vec2 } from './mathtype.js';
import * as Renderer from './renderer.js';
import * as SPH from './sph.js';

let wrapper = document.getElementById('wrapper');
let canvas = document.getElementById('canvas');

const resize = _ => {
    canvas.width = wrapper.offsetWidth;
    canvas.height = wrapper.offsetHeight;
};
resize();

addEventListener('resize', resize);

let pointerCanvasPos;

const canvasPos = (e, x, y) => {
    let rect = e.target.getBoundingClientRect();
    pointerCanvasPos = new Vec2(x - rect.left, y - rect.top - 1);
};

canvas.addEventListener('mousemove', e => canvasPos(e, e.clientX, e.clientY), false);
canvas.addEventListener('mouseleave', _ => pointerCanvasPos = undefined);
canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.changedTouches.length === 1)
        canvasPos(e, e.changedTouches[0].pageX, e.changedTouches[0].pageY);
    }, 
    { passive: false }
);
canvas.addEventListener('touchend', _ => pointerCanvasPos = undefined);

const R0 = 8;
const dp = R0 / 64;
const fluidDomainR = 0.95 * R0;

const createParticlesCircular = () => {
    let [x0, y0] = [0, -0.8];
    let pos = [x0, y0];
    let i = 2;
    for (let ri = 1; ri < 35; ri++) {
        let theta = 2*Math.asin(0.5 / ri);
        let cn = Math.floor(2*Math.PI / theta);
        let r = dp * ri + (ri > 1 ? -0.05 * dp : 0);
        theta = 2*Math.PI / cn;
        for (let ci = 0; ci < cn; ci++) {
            pos[i++] = r * Math.sin(ci * theta) + x0;
            pos[i++] = r * Math.cos(ci * theta) + y0;
        }
    }
    return pos;
};

(async () => {
    let gl = canvas.getContext('webgl2');

    if (!gl) {
        document.getElementById('message').textContent = 'WebGL2 unsupported.';
        return;
    }
    if (!gl.getExtension('EXT_color_buffer_float')) {
        document.getElementById('message').textContent = 'WebGL2-extention "EXT_color_buffer_float" unsupported.';
        return;
    }

    try {
        let s = SPH.loadShaderFilesAsync();
        let r = Renderer.loadShaderFilesAsync();
        await Promise.all([s, r]);
        SPH.init(gl, dp, fluidDomainR, createParticlesCircular());
        Renderer.init(gl, canvas, dp/2, new Vec2(-R0), new Vec2(R0));

    } catch (e) {
        console.error(e);
        return;
    }

    let lastPointerCanvasPos;
    let timestampCache = [performance.now()];

    const calcPointerSimPos = () => {
        if (!pointerCanvasPos)
            return Vec2.zero();
        let clip = Vec2.div(pointerCanvasPos, new Vec2(canvas.width, canvas.height));
        clip = Vec2.sub(Vec2.mul(clip, 2), 1);
        clip.y *= -1;
        return Renderer.clipPosToSimPos(clip);
    };

    const calcPointerSimVel = () => {
        let elapse = timestampCache[timestampCache.length - 1]
                   - timestampCache[timestampCache.length - 2];
        if (!pointerCanvasPos || !lastPointerCanvasPos || elapse === 0)
            return Vec2.zero();

        let vel = Vec2.div(Vec2.sub(pointerCanvasPos, lastPointerCanvasPos), elapse);
        vel = Vec2.mul(vel, 0.01 * fluidDomainR);
        vel.y *= -1;
        return vel;
    };

    let particleView = document.getElementById('particleview');

    let fpsText = document.getElementById('fps');
    fpsText.textContent = `-- FPS`;
    let fpsLastUpdate = timestampCache[0];

    Renderer.setRenderingSimulationArea(new Vec2(-R0), new Vec2(R0));

    const loop = () => {
        timestampCache.push(performance.now());
        if (timestampCache.length > 60)
            timestampCache.shift();
        let pointerSimPos = calcPointerSimPos();
        let pointerSimVel = calcPointerSimVel();
        lastPointerCanvasPos = pointerCanvasPos;

        SPH.setPointerPos(pointerSimPos);
        SPH.setPointerVel(pointerSimVel);

        for (let i = 0; i < 8; i++)
            SPH.step();

        if (particleView.checked)
            SPH.visualize(Renderer.renderParticles);
        else
            SPH.visualize(Renderer.renderWater);

        let latest = timestampCache[timestampCache.length - 1];
        if (latest - fpsLastUpdate > 1000) {
            let ave = (latest - timestampCache[0]) / (timestampCache.length - 1) / 1000;
            fpsText.textContent = `${Math.round(1/ave)} FPS`;
            fpsLastUpdate = latest;
        }

        requestAnimationFrame(loop);
    };

    loop();

})();

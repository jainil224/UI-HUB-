// ── FILE: frontend/src/components/ui/NeptuneAnimation.tsx ──
// neptune-animation — UI HUB
// "Rotating Neptune": a fully procedural, physically-flavoured gas-giant
// renderer. A single raw-WebGL1 fragment shader raytraces a sphere over an
// fbm/domain-warped cloud deck — differential zonal winds (equator lags, high
// latitudes run ahead), four twisting eddies, bright methane cirrus belts, the
// Great Dark Spot drifting west with bright companion clouds, the Small Dark
// Spot further south and faster, a pointer-following light, a slow parallax
// starfield and a soft blue limb/atmosphere glow. Drag in any direction to turn
// it through 360°, flick for momentum, wheel or two-finger pinch to zoom
// 0.7x-1.8x, double-click to reset, arrow keys to turn, +/-/0 for zoom/reset,
// and hover the storms for named callouts.
//
// Original source: standalone HTML (single file, one fixed full-viewport canvas
// + inline script). Ported to React with no third-party runtime and no external
// assets: the GLSL, the noise/fbm helpers, the 3x3 rotation trackball, the
// feature-picking maths, the light/lean/parallax easing, the flow model and the
// dynamic-resolution guard are kept byte-for-byte from the reference. Only the
// scaffolding changed: the html/body + `#cv`/`#tip`/`#fallback` nodes became
// scoped refs on a container, every `innerWidth`/`innerHeight` became the
// container's box (so the planet centres in whatever area it is placed in), the
// window `resize` listener became a ResizeObserver on that container, pointer
// coordinates became container-relative, the `position:fixed` overlays became
// absolutely positioned inside the root, and the window keyboard listener is
// guarded by an over-the-canvas pointer check (repo convention) so it never
// hijacks page keys. Teardown cancels the RAF, drops the ResizeObserver, unbinds
// every listener and deletes the GPU program/shaders/buffer — but it does NOT
// call loseContext(), because a canvas hands back the same context for its
// lifetime and React StrictMode's mount -> cleanup -> mount would then reuse a
// force-lost one (making the shaders null and wrongly showing the fallback).
// The demo's `window.__ready` boot flag is preserved.

import * as React from "react";
import { useEffect, useRef } from "react";
import "./NeptuneAnimation.css";

export interface NeptuneAnimationProps {
    /** Optional class applied to the root container. */
    className?: string;
    /** Optional inline styles for the root container. */
    style?: React.CSSProperties;
}

export const NeptuneAnimation: React.FC<NeptuneAnimationProps> = ({
    className = "",
    style = {},
}) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const cvRef = useRef<HTMLCanvasElement>(null);
    const tipRef = useRef<HTMLDivElement>(null);
    const fallbackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        const cv = cvRef.current;
        const tip = tipRef.current;
        const fallback = fallbackRef.current;
        if (!root || !cv || !tip || !fallback) return;

        const TAU = Math.PI * 2;
        const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const gl = cv.getContext("webgl", { antialias: false, alpha: false, powerPreference: "high-performance" }) as WebGLRenderingContext | null;
        if (!gl) { fallback.style.display = "flex"; return; }

        let cancelled = false;
        let rafId = 0;
        let ro: ResizeObserver | null = null;

        const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}';
        const FS = [
            'precision highp float;',
            'uniform vec2 uRes,uCenter,uPar,uHi;',
            'uniform float uRadius,uFlow,uHover,uTime,uDpr;',
            'uniform vec3 uLight;',
            'uniform mat3 uM;',
            'const float TAU=6.2831853;',
            'float hash13(vec3 p3){p3=fract(p3*0.1031);p3+=dot(p3,p3.zyx+31.32);return fract((p3.x+p3.y)*p3.z);}',
            'float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}',
            'float vnoise(vec3 p){',
            '  vec3 i=floor(p);vec3 f=fract(p);vec3 u=f*f*f*(f*(f*6.0-15.0)+10.0);',
            '  float a=hash13(i),b=hash13(i+vec3(1.,0.,0.)),c=hash13(i+vec3(0.,1.,0.)),d=hash13(i+vec3(1.,1.,0.));',
            '  float e=hash13(i+vec3(0.,0.,1.)),g=hash13(i+vec3(1.,0.,1.)),h=hash13(i+vec3(0.,1.,1.)),k=hash13(i+vec3(1.,1.,1.));',
            '  return mix(mix(mix(a,b,u.x),mix(c,d,u.x),u.y),mix(mix(e,g,u.x),mix(h,k,u.x),u.y),u.z)*2.0-1.0;}',
            'float fbm3(vec3 p){float s=0.0,a=0.5,n=0.0;for(int i=0;i<3;i++){s+=a*vnoise(p);n+=a;p=p*2.03+vec3(5.2,1.3,8.7);a*=0.5;}return s/n;}',
            'float fbm4(vec3 p){float s=0.0,a=0.5,n=0.0;for(int i=0;i<4;i++){s+=a*vnoise(p);n+=a;p=p*2.03+vec3(5.2,1.3,8.7);a*=0.5;}return s/n;}',
            'vec3 rotY(vec3 q,float b){float c=cos(b),s=sin(b);return vec3(q.x*c-q.z*s,q.y,q.x*s+q.z*c);}',
            'float gz(float x,float c,float w){float t=(x-c)/w;return exp(-t*t);}',
            'float wrapPi(float a){return a-TAU*floor((a+3.14159265)/TAU);}',
            'float ell(float lat,float lon,float lat0,float lon0,float a,float b,float tilt){',
            '  float dl=wrapPi(lon-lon0)*cos(lat0);float dy=lat-lat0-dl*tilt;return (dl/a)*(dl/a)+(dy/b)*(dy/b);}',

            /* eddies: twist the sampling coordinates around a point so bands curl into small spirals */
            'void twist(inout float lon,inout float lat,float vlat,float vlon,float rad,float str){',
            '  float dl=wrapPi(lon-vlon)*cos(vlat);float dy=lat-vlat;float d=length(vec2(dl,dy));',
            '  if(d<rad){float t=1.0-d/rad;float ang=str*t*t;float ca=cos(ang),sa=sin(ang);',
            '    vec2 r=vec2(dl*ca-dy*sa,dl*sa+dy*ca);lon=vlon+r.x/cos(vlat);lat=vlat+r.y;}}',

            /* ---- deep space: near black, faint dust, a few dim stars ---- */
            'vec3 space(vec2 frag){',
            '  vec2 uv=frag/uRes;',
            '  vec3 c=vec3(0.004,0.008,0.020);',
            '  vec2 q=(frag-uCenter)/uRes.y;',
            '  float neb=fbm3(vec3(q*1.5,4.0+uFlow*0.0015));',
            '  c+=vec3(0.010,0.026,0.058)*max(neb+0.12,0.0)*0.5;',
            '  c*=1.0-1.1*dot(uv-0.5,uv-0.5);',
            '  float cell=34.0*uDpr;vec2 g=(frag+uPar)/cell;vec2 id=floor(g);vec2 fr=fract(g);',
            '  float h=hash12(id);',
            '  if(h>0.972){',
            '    vec2 off=vec2(hash12(id+7.1),hash12(id+13.7))*0.6+0.2;',
            '    float d=length(fr-off)*cell;',
            '    float mag=pow(hash12(id+3.3),5.0);',
            '    float rad=(0.5+0.9*mag)*uDpr;',
            '    float tw=0.88+0.12*sin(uTime*(0.5+1.6*hash12(id+9.1))+h*40.0);',
            '    float s=(1.0-smoothstep(0.0,rad,d))*(0.12+0.7*mag)*tw;',
            '    c+=mix(vec3(0.72,0.84,1.0),vec3(1.0,0.90,0.78),hash12(id+21.0))*s;',
            '  }',
            '  return c;}',

            /* ---- Neptune cloud deck (planet-frame vector q, +y is the pole) ---- */
            'vec3 surface(vec3 q){',
            '  float lat=asin(clamp(q.y,-1.0,1.0));',
            '  float lon=atan(q.x,q.z);',
            '  float ft=uFlow;',
            '  float latT=lat,lonT=lon;',
            '  twist(lonT,latT, 0.30,1.00-0.0040*ft,0.10, 6.0);',
            '  twist(lonT,latT,-0.28,2.60-0.0050*ft,0.12,-5.0);',
            '  twist(lonT,latT, 0.62,4.20-0.0030*ft,0.09, 5.5);',
            '  twist(lonT,latT,-0.66,5.40-0.0035*ft,0.10,-6.0);',
            '  float cl=cos(latT);',
            '  vec3 qt=vec3(cl*sin(lonT),sin(latT),cl*cos(lonT));',
            '  vec3 drift=vec3(ft*0.0020,ft*0.0030,ft*0.0025);',
            '  float w1=fbm3(qt*vec3(2.2,3.0,2.2)+drift+11.0);',
            '  float w2=fbm3(qt*5.5+drift*1.6+vec3(3.1,0.0,7.7));',
            '  float yb=latT+0.035*w1+0.010*w2;',
            '  float b1=0.5+0.5*sin(yb*13.0+0.7);',
            '  float b2=0.5+0.5*sin(yb*31.0+2.1+1.0*w1);',
            '  float tone=0.5+(0.55*b1+0.45*b2-0.5)*0.75;',

            /* differential zonal winds: equator lags, high latitudes run ahead. Two flow-map phases keep the shear bounded. */
            '  float wz=-0.009*cos(2.0*lat)+0.003*sin(lat*9.0);',
            '  float T=10.0;',
            '  float ph0=fract(ft/T),ph1=fract(ft/T+0.5);',
            '  float wt0=1.0-abs(2.0*ph0-1.0),wt1=1.0-abs(2.0*ph1-1.0);',
            '  vec3 q0=rotY(qt,wz*ph0*T),q1=rotY(qt,wz*ph1*T);',
            '  vec3 c0=vec3(q0.x*1.8,yb*38.0,q0.z*1.8),c1=vec3(q1.x*1.8,yb*38.0,q1.z*1.8);',
            '  float st=fbm4(c0)*wt0+fbm4(c1)*wt1;',
            '  float fine=vnoise(vec3(q0.x*1.3,yb*60.0,q0.z*1.3)+41.0)*wt0+vnoise(vec3(q1.x*1.3,yb*60.0,q1.z*1.3)+41.0)*wt1;',
            '  vec3 d0=vec3(q0.x*2.2,yb*22.0,q0.z*2.2)+17.0,d1=vec3(q1.x*2.2,yb*22.0,q1.z*2.2)+17.0;',
            '  float wv0=fbm3(d0*0.5),wv1=fbm3(d1*0.5);',
            '  float rg=(1.0-abs(vnoise(d0+vec3(wv0*1.4,wv0*1.9,wv0*1.0))))*wt0+(1.0-abs(vnoise(d1+vec3(wv1*1.4,wv1*1.9,wv1*1.0))))*wt1;',
            '  float k=clamp(tone+0.20*st+0.05*w2,0.0,1.0);',
            '  vec3 deep=vec3(0.045,0.130,0.500),mid=vec3(0.105,0.375,0.890),sky=vec3(0.290,0.670,1.000),cyan=vec3(0.320,0.780,0.920);',
            '  vec3 c=mix(deep,mid,smoothstep(0.10,0.50,k));',
            '  c=mix(c,sky,smoothstep(0.45,0.95,k)*0.85);',
            '  c=mix(c,cyan,smoothstep(0.25,1.2,lat)*0.5*(0.4+0.6*k));',
            '  c=mix(c,vec3(0.04,0.09,0.34),smoothstep(0.3,1.2,-lat)*0.55);',
            '  c*=0.93+0.14*st+0.05*fine;',
            '  c=mix(c,vec3(0.04,0.10,0.40),smoothstep(0.86,0.98,1.0-abs(vnoise(d0*0.8+9.0)))*(1.0-k*0.5)*0.18);',

            /* bright methane cirrus, strongest in a few latitude belts */
            '  float zone=0.9*gz(lat,0.20,0.09)+0.7*gz(lat,-0.15,0.07)+0.55*gz(lat,0.52,0.10)+0.45*gz(lat,-0.50,0.09)+0.30*gz(lat,0.85,0.12);',
            '  float patch=smoothstep(-0.10,0.45,w1+0.6*st);',
            '  float cirrus=smoothstep(0.78,0.95,rg)*zone*(0.35+0.65*patch);',
            '  c=mix(c,vec3(0.90,0.96,1.0),clamp(cirrus*1.15,0.0,1.0));',

            /* Great Dark Spot, drifting west and bobbing in latitude, with bright companion clouds */
            '  float lat0=0.15+0.025*sin(ft*0.045);',
            '  float lon0=0.5-0.0045*ft;',
            '  float e=ell(lat,lon,lat0,lon0,0.34,0.105,0.22);',
            '  float spot=1.0-smoothstep(0.15,1.0,e);',
            '  float halo1=smoothstep(0.95,1.5,e)*(1.0-smoothstep(1.5,2.6,e));',
            '  c=mix(c,vec3(0.26,0.60,1.0),halo1*0.40);',
            '  c=mix(c,vec3(0.004,0.014,0.095),spot*0.97);',
            '  if(e<1.8){float dl=wrapPi(lon-lon0)*cos(lat0);float dy=lat-lat0-dl*0.22;',
            '    float ang=atan(dy/0.105,dl/0.34);',
            '    c+=vec3(0.02,0.05,0.16)*spot*(0.5+0.5*sin(ang*2.0-e*8.0+ft*0.2))*0.55;}',
            '  c+=vec3(0.05,0.13,0.30)*smoothstep(0.08,0.0,abs(e-1.0))*0.8*uHi.x;',
            '  float ec1=ell(lat,lon,lat0-0.025,lon0-0.30,0.46,0.036,0.12);',
            '  float ec2=ell(lat,lon,lat0-0.11,lon0+0.12,0.30,0.030,-0.08);',
            '  float ec3=ell(lat,lon,lat0+0.045,lon0+0.34,0.22,0.025,0.10);',
            '  float comp=(exp(-ec1*1.2)+0.7*exp(-ec2*1.2)+0.5*exp(-ec3*1.2))*smoothstep(0.50,0.92,rg+0.30*st+0.22);',
            '  c=mix(c,vec3(0.92,0.97,1.0),clamp(comp,0.0,1.0)*0.95);',

            /* Small Dark Spot, further south and faster */
            '  float lat1=-0.50+0.02*sin(ft*0.06+1.0);float lon1=2.2-0.0075*ft;',
            '  float e2=ell(lat,lon,lat1,lon1,0.16,0.06,-0.15);',
            '  c=mix(c,vec3(0.015,0.035,0.19),(1.0-smoothstep(0.15,1.0,e2))*0.8);',
            '  c+=vec3(0.05,0.13,0.30)*smoothstep(0.08,0.0,abs(e2-1.0))*0.8*uHi.y;',
            '  float ec4=ell(lat,lon,lat1+0.05,lon1-0.12,0.20,0.03,0.1);',
            '  c=mix(c,vec3(0.88,0.95,1.0),exp(-ec4*1.4)*smoothstep(0.55,0.95,rg+0.2)*0.7);',
            '  return c;}',

            'void main(){',
            '  vec2 frag=gl_FragCoord.xy;',
            '  vec2 p=(frag-uCenter)/uRadius;',
            '  float r=length(p);',
            '  vec3 col=space(frag);',
            '  if(r>=0.98){',
            '    float x=max(r-1.0,0.0);vec2 pn=p/max(r,1e-4);vec2 ld=normalize(uLight.xy+vec2(1e-4));',
            '    float side=0.25+0.75*smoothstep(-0.6,0.9,dot(pn,ld));',
            '    float halo=0.30*exp(-x*10.0)+0.09*exp(-x*2.8);',
            '    col+=vec3(0.08,0.27,0.80)*halo*side*(1.0+0.7*uHover);',
            '  }',
            '  float cover=clamp((1.0-r)*uRadius+0.5,0.0,1.0);',
            '  if(cover>0.0){',
            '    vec2 pc=p/max(r,1.0);float z=sqrt(max(1.0-dot(pc,pc),0.0));',
            '    vec3 v=vec3(pc,z);',
            '    vec3 q=uM*v;',
            '    vec3 c=surface(q);',
            '    float ndl=dot(v,normalize(uLight));',
            '    float lit=smoothstep(-0.22,0.90,ndl);',
            '    float shade=0.045+0.955*lit;',
            '    float limb=mix(0.55,1.0,pow(max(z,0.0),0.45));',
            '    c*=shade*limb*1.12;',
            '    c=mix(c,vec3(0.30,0.58,1.0),pow(1.0-z,1.8)*0.16*lit);',
            '    float hz=pow(1.0-z,2.0);',
            '    c+=vec3(0.10,0.22,0.46)*hz*lit*0.45;',
            '    float rim=pow(1.0-z,2.8)*smoothstep(-0.3,0.8,ndl);',
            '    c+=vec3(0.10,0.34,0.92)*rim*(0.35+0.4*uHover);',
            '    col=mix(col,c,cover);',
            '  }',
            '  col+=(hash12(frag)-0.5)/255.0;',
            '  gl_FragColor=vec4(col,1.0);',
            '}'
        ].join('\n');

        function compile(type: number, src: string) {
            var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
            return s;
        }
        var vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
        var prog = gl.createProgram();
        if (!vs || !fs) { fallback.style.display = "flex"; return; }
        gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); fallback.style.display = "flex"; return; }
        gl.useProgram(prog);
        var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        var loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        var U: Record<string, WebGLUniformLocation | null> = {};
        ['uRes', 'uCenter', 'uPar', 'uHi', 'uRadius', 'uFlow', 'uHover', 'uTime', 'uDpr', 'uLight', 'uM'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });

        /* ---------- 3x3 rotation helpers (row-major arrays) ---------- */
        function mul(A: any, B: any) { var C = new Array(9); for (var r = 0; r < 3; r++) for (var c = 0; c < 3; c++) C[r * 3 + c] = A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c]; return C; }
        function tr(A: any) { return [A[0], A[3], A[6], A[1], A[4], A[7], A[2], A[5], A[8]]; }
        function Rx(a: number) { var c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; }
        function Ry(a: number) { var c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; }
        function Rz(a: number) { var c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1]; }
        function ortho(M: any) {
            var a = [M[0], M[1], M[2]], b = [M[3], M[4], M[5]], m = Math.hypot(a[0], a[1], a[2]);
            a = [a[0] / m, a[1] / m, a[2] / m];
            var d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; b = [b[0] - d * a[0], b[1] - d * a[1], b[2] - d * a[2]];
            m = Math.hypot(b[0], b[1], b[2]); b = [b[0] / m, b[1] / m, b[2] / m];
            return [a[0], a[1], a[2], b[0], b[1], b[2], a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
        }
        function glm(M: any) { return new Float32Array([M[0], M[3], M[6], M[1], M[4], M[7], M[2], M[5], M[8]]); }

        /* ---------- state ---------- */
        var BASE_TURNS = 1 / 64;                  /* seconds per planet turn: 64 */
        var DEF_LIGHT = norm([-0.55, 0.42, 0.72]);
        var TINV0 = mul(Rx(-0.21), Rz(0.21));    /* view -> tilted planet frame; changes as the user drags */
        var Tinv = TINV0.slice(), Mcur = TINV0.slice();
        var rot = -0.135, flow = 0, speedNow = REDUCED ? 0 : 1, hover = 0, zoom = 1, zoomT = 1;
        var light = DEF_LIGHT.slice(), hi = [0, 0], par = [0, 0], lean = [0, 0];
        var ptr: { x: number; y: number } | null = null, dragging = false, lastX = 0, lastY = 0, lastT = 0, vx = 0, vy = 0, clock = 0;
        var pointers: Record<string, { x: number; y: number }> = {}, pinch = 0;
        var dprBase = Math.min(window.devicePixelRatio || 1, 2), qual = 1, W = 2, H = 2, vw = 2, vh = 2;

        function norm(v: any) { var m = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / m, v[1] / m, v[2] / m]; }
        function lerp(a: number, b: number, k: number) { return a + (b - a) * k; }
        function wrap(a: number) { return a - TAU * Math.floor((a + Math.PI) / TAU); }
        /* turn the planet by ax around the screen's vertical axis and ay around its horizontal axis (any angle, any direction) */
        function turn(ax: any, ay: any) { Tinv = ortho(mul(Tinv, tr(mul(Rx(ay), Ry(ax))))); }

        function resize() {
            vw = Math.max(2, root.clientWidth || 1);
            vh = Math.max(2, root.clientHeight || 1);
            var d = dprBase * qual, w = Math.max(2, Math.round(vw * d)), h = Math.max(2, Math.round(vh * d));
            var px = w * h, cap = 2.4e6;
            if (px > cap) { var s = Math.sqrt(cap / px); w = Math.round(w * s); h = Math.round(h * s); d *= s; }
            cv.width = w; cv.height = h; W = w; H = h; gl.viewport(0, 0, w, h);
            gl.uniform1f(U.uDpr, d);
        }
        resize();

        /* ---------- picking (same maths as the shader) ---------- */
        function toPlanet(px: number, py: number) {
            var r2 = px * px + py * py; if (r2 > 1) return null;
            var z = Math.sqrt(1 - r2), M = Mcur;
            var qx = M[0] * px + M[1] * py + M[2] * z, qy = M[3] * px + M[4] * py + M[5] * z, qz = M[6] * px + M[7] * py + M[8] * z;
            return { lat: Math.asin(Math.max(-1, Math.min(1, qy))), lon: Math.atan2(qx, qz) };
        }
        function ell(lat: number, lon: number, lat0: number, lon0: number, a: number, b: number, tilt: number) {
            var dl = wrap(lon - lon0) * Math.cos(lat0), dy = lat - lat0 - dl * tilt;
            return (dl / a) * (dl / a) + (dy / b) * (dy / b);
        }
        function featureAt(lat: number, lon: number) {
            var lat0 = 0.15 + 0.025 * Math.sin(flow * 0.045), lon0 = 0.5 - 0.0045 * flow;
            var lat1 = -0.50 + 0.02 * Math.sin(flow * 0.06 + 1), lon1 = 2.2 - 0.0075 * flow;
            if (ell(lat, lon, lat0, lon0, 0.34, 0.105, 0.22) < 1.35) return { id: 0, name: 'Great Dark Spot', note: 'storm bigger than Earth' };
            if (ell(lat, lon, lat1, lon1, 0.16, 0.06, -0.15) < 1.5) return { id: 1, name: 'Small Dark Spot', note: 'fast southern vortex' };
            if (ell(lat, lon, lat0 - 0.025, lon0 - 0.30, 0.46, 0.036, 0.12) < 1.6) return { id: -1, name: 'Methane cirrus', note: 'bright high clouds' };
            return null;
        }

        /* ---------- input ---------- */
        function localPos(e: PointerEvent | WheelEvent | MouseEvent) {
            var r = root.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        }
        function rpx() { return Math.min(vw, vh) * 0.36 * zoom; }
        function overPlanet(x: number, y: number) { return Math.hypot(x - vw / 2, y - vh / 2) < rpx() * 1.03; }
        function count() { return Object.keys(pointers).length; }
        function dist() { var k = Object.keys(pointers), a = pointers[k[0]], b = pointers[k[1]]; return Math.hypot(a.x - b.x, a.y - b.y); }

        function onPointerDown(e: PointerEvent) {
            var p = localPos(e);
            pointers[e.pointerId] = { x: p.x, y: p.y };
            try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
            if (count() === 2) { pinch = dist(); dragging = false; cv.classList.remove('drag'); return; }
            if (!overPlanet(p.x, p.y)) return;
            dragging = true; lastX = p.x; lastY = p.y; lastT = performance.now(); vx = 0; vy = 0; cv.classList.add('drag');
        }
        function onPointerMove(e: PointerEvent) {
            var p = localPos(e);
            if (pointers[e.pointerId]) pointers[e.pointerId] = { x: p.x, y: p.y };
            ptr = { x: p.x, y: p.y };
            if (count() === 2) { var d = dist(); if (pinch > 0) zoomT = Math.max(0.7, Math.min(1.8, zoomT * d / pinch)); pinch = d; return; }
            if (dragging) {
                var R = rpx(), now = performance.now(), dt = Math.max(1, now - lastT) / 1000;
                var ax = (p.x - lastX) / R, ay = (p.y - lastY) / R;
                turn(ax, ay);
                vx = lerp(vx, Math.max(-8, Math.min(8, ax / dt)), 0.5); vy = lerp(vy, Math.max(-8, Math.min(8, ay / dt)), 0.5);
                lastX = p.x; lastY = p.y; lastT = now;
            }
            cv.classList.toggle('over', overPlanet(p.x, p.y));
        }
        function endPtr(e: PointerEvent) {
            delete pointers[e.pointerId]; pinch = 0;
            if (performance.now() - lastT > 90) { vx = 0; vy = 0; }
            dragging = false; cv.classList.remove('drag');
        }
        function onPointerLeave() { if (!dragging) ptr = null; }
        function onWheel(e: WheelEvent) { e.preventDefault(); zoomT = Math.max(0.7, Math.min(1.8, zoomT * Math.exp(-e.deltaY * 0.0012))); }
        function onDblClick() { zoomT = 1; Tinv = TINV0.slice(); vx = 0; vy = 0; }
        function onKeyDown(e: KeyboardEvent) {
            if (!ptr) return;   /* only while the pointer is over the canvas, so page keys are never hijacked */
            var s = 0.09, k = e.key;
            if (k === 'ArrowLeft') turn(-s, 0); else if (k === 'ArrowRight') turn(s, 0);
            else if (k === 'ArrowUp') turn(0, -s); else if (k === 'ArrowDown') turn(0, s);
            else if (k === '+' || k === '=') zoomT = Math.min(1.8, zoomT * 1.08); else if (k === '-') zoomT = Math.max(0.7, zoomT / 1.08);
            else if (k === '0') { zoomT = 1; Tinv = TINV0.slice(); }
            else return;
            e.preventDefault();
        }

        cv.addEventListener('pointerdown', onPointerDown);
        cv.addEventListener('pointermove', onPointerMove);
        cv.addEventListener('pointerup', endPtr);
        cv.addEventListener('pointercancel', endPtr);
        cv.addEventListener('pointerleave', onPointerLeave);
        cv.addEventListener('wheel', onWheel, { passive: false });
        cv.addEventListener('dblclick', onDblClick);
        window.addEventListener('keydown', onKeyDown);

        ro = new ResizeObserver(function () { resize(); });
        ro.observe(root);

        /* ---------- loop ---------- */
        var last: number | null = null, slow = 0, frames = 0;
        function frame(ts: number) {
            if (cancelled) return;
            rafId = requestAnimationFrame(frame);
            if (last == null) last = ts;
            var raw = (ts - last) / 1000, dt = Math.min(0.05, raw); last = ts; clock += dt;
            var R = rpx(), pxn = 0, pyn = 0, inside = false;
            if (ptr) { pxn = (ptr.x - vw / 2) / R; pyn = -(ptr.y - vh / 2) / R; inside = Math.hypot(pxn, pyn) < 1.03; }
            var k = 1 - Math.exp(-dt * 3.2);
            hover = lerp(hover, inside || dragging ? 1 : 0, k);
            var targetSpeed = REDUCED ? 0 : (inside && !dragging ? 0.45 : 1);
            speedNow = lerp(speedNow, targetSpeed, k);
            if (!dragging) {
                rot += dt * BASE_TURNS * speedNow;
                if (Math.abs(vx) + Math.abs(vy) > 0.002) { turn(vx * dt, vy * dt); var f = Math.exp(-dt * 2.4); vx *= f; vy *= f; } else { vx = 0; vy = 0; }
            }
            flow += dt * speedNow;
            zoom = lerp(zoom, zoomT * (1 + 0.03 * hover), k);
            /* light follows the pointer; the planet leans slightly toward it */
            var tl = DEF_LIGHT;
            if (ptr) { var m = Math.hypot(pxn, pyn), s = m > 1.7 ? 1.7 / m : 1; tl = norm([pxn * s * 0.9, pyn * s * 0.9 + 0.12, 0.72]); }
            for (var i = 0; i < 3; i++) light[i] = lerp(light[i], tl[i], k * 0.8);
            light = norm(light);
            lean[0] = lerp(lean[0], ptr ? Math.max(-1.5, Math.min(1.5, pxn)) * 0.05 : 0, k * 0.6);
            lean[1] = lerp(lean[1], ptr ? -Math.max(-1.5, Math.min(1.5, pyn)) * 0.05 : 0, k * 0.6);
            par[0] = lerp(par[0], ptr ? -pxn * 8 : 0, k * 0.5); par[1] = lerp(par[1], ptr ? -pyn * 8 : 0, k * 0.5);
            /* view -> planet: spin about the planet's own pole, after the user's tilt */
            Mcur = mul(Ry(-rot * TAU), mul(Tinv, mul(Ry(-lean[0]), Rx(-lean[1]))));
            var feat: any = null;
            if (inside && !dragging) { var pp = toPlanet(pxn, pyn); if (pp) feat = featureAt(pp.lat, pp.lon); }
            hi[0] = lerp(hi[0], feat && feat.id === 0 ? 1 : 0, k); hi[1] = lerp(hi[1], feat && feat.id === 1 ? 1 : 0, k);
            if (feat) {
                tip.innerHTML = feat.name + '<span>' + feat.note + '</span>';
                var tx = ptr!.x + 16, ty = ptr!.y + 18;
                if (tx + tip.offsetWidth > vw - 8) tx = ptr!.x - 16 - tip.offsetWidth;
                if (ty + tip.offsetHeight > vh - 8) ty = ptr!.y - 16 - tip.offsetHeight;
                tip.style.left = Math.max(8, tx) + 'px'; tip.style.top = Math.max(8, ty) + 'px';
                tip.classList.add('on');
            } else tip.classList.remove('on');

            var d = W / vw;
            gl.uniform2f(U.uRes, W, H); gl.uniform2f(U.uCenter, W / 2, H / 2); gl.uniform1f(U.uRadius, R * d);
            gl.uniformMatrix3fv(U.uM, false, glm(Mcur));
            gl.uniform1f(U.uFlow, flow); gl.uniform1f(U.uHover, hover); gl.uniform1f(U.uTime, clock);
            gl.uniform3f(U.uLight, light[0], light[1], light[2]);
            gl.uniform2f(U.uPar, par[0] * d, par[1] * d); gl.uniform2f(U.uHi, hi[0], hi[1]);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            /* drop render resolution if the GPU struggles */
            if (++frames > 45 && raw > 0.034 && raw < 0.5) { slow++; } else if (raw <= 0.034) { slow = Math.max(0, slow - 1); }
            if (slow > 40 && qual > 0.55) { qual *= 0.8; slow = 0; frames = 20; resize(); }
        }
        rafId = requestAnimationFrame(frame);

        (window as any).__ready = true;

        return () => {
            cancelled = true;
            if (rafId) cancelAnimationFrame(rafId);
            if (ro) ro.disconnect();
            cv.removeEventListener('pointerdown', onPointerDown);
            cv.removeEventListener('pointermove', onPointerMove);
            cv.removeEventListener('pointerup', endPtr);
            cv.removeEventListener('pointercancel', endPtr);
            cv.removeEventListener('pointerleave', onPointerLeave);
            cv.removeEventListener('wheel', onWheel);
            cv.removeEventListener('dblclick', onDblClick);
            window.removeEventListener('keydown', onKeyDown);
            /* Release our GL objects, but NEVER loseContext(): a canvas hands back
               the same context object for its lifetime, so React StrictMode's
               mount -> cleanup -> mount would reuse a force-lost context and the
               shaders would come back null, wrongly showing the WebGL fallback.
               Deleting the program/shaders/buffer frees the GPU objects while
               leaving the context alive for the remount. */
            gl.deleteProgram(prog);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            gl.deleteBuffer(buf);
        };
    }, []);

    return (
        <div ref={rootRef} className={`neptune-root ${className}`} style={style}>
            <canvas
                ref={cvRef}
                className="neptune-canvas"
                tabIndex={0}
                aria-label="Neptune rotating in space. Drag in any direction to turn it through 360 degrees, scroll or pinch to zoom, move the pointer to move the light."
            />
            <div ref={tipRef} className="neptune-tip" role="status" />
            <div ref={fallbackRef} className="neptune-fallback">This animation needs WebGL, which this browser has turned off.</div>
        </div>
    );
};

export default NeptuneAnimation;

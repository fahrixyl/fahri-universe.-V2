"use client";
import { useEffect, useRef, useState } from "react";
import { THEMES, type ThemeId } from "@/lib/theme";

const VS = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 r;uniform float t;uniform vec2 m;uniform vec2 pc;uniform float pr;uniform vec2 gc;uniform float gr;uniform float sp;uniform float iz;uniform vec3 ta;uniform vec3 tb;uniform float wp;

float h2(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float h3(vec3 p){vec3 q=fract(p*.1031);q+=dot(q,q.zyx+31.32);return fract((q.x+q.y)*q.z);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h2(i),h2(i+vec2(1.,0.)),f.x),mix(h2(i+vec2(0.,1.)),h2(i+vec2(1.,1.)),f.x),f.y);}
float fbm2(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n2(p);p=p*2.02+vec2(1.7,9.2);a*=.5;}return v;}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1.,0.,0.)),f.x),mix(h3(i+vec3(0.,1.,0.)),h3(i+vec3(1.,1.,0.)),f.x),f.y),
             mix(mix(h3(i+vec3(0.,0.,1.)),h3(i+vec3(1.,0.,1.)),f.x),mix(h3(i+vec3(0.,1.,1.)),h3(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}
float f3(vec3 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n3(p);p=p*2.03+vec3(1.3,2.7,.9);a*=.5;}return v;}

vec3 bg(vec2 p){
  vec2 uv=gl_FragCoord.xy/r;
  vec2 b=p+m*.05; float tt=t*.03;
  vec2 q=vec2(fbm2(b*1.6+tt),fbm2(b*1.6-tt+5.2));
  float f=fbm2(b*1.8+q*1.7+vec2(tt*2.,-tt));
  vec3 c=mix(vec3(.012,.02,.06),ta,smoothstep(.25,.85,f));
  c+=tb*pow(smoothstep(.45,1.,fbm2(b*2.4-q*1.3+tt*3.)),2.)*.45;
  c+=vec3(.38,.12,.62)*pow(smoothstep(.5,1.,q.x),3.)*.38;
  for(int L=0;L<2;L++){
    float fl=float(L); float sc=30.+fl*26.;
    vec2 s=(gl_FragCoord.xy+m*(8.+fl*10.))/r.y*sc; vec2 id=floor(s);
    float rnd=h2(id+fl*13.); vec2 g=fract(s)-.5;
    float d=length(g-(vec2(h2(id+3.1),h2(id+7.7))-.5)*.6);
    float star=(1.-smoothstep(.0,.09,d))*step(.93-fl*.01,rnd)*(.55+.45*sin(t*2.+rnd*40.));
    c+=mix(vec3(.7,.82,1.),vec3(1.,.85,.7),h2(id+9.))*star*(1.-fl*.3);
  }
  float band=exp(-pow((p.y-.3-.07*sin(p.x*2.5+t*.3))*7.,2.));
  c+=mix(tb,vec3(.2,.9,.6),.5+.5*sin(p.x*3.+t*.2))*band*.28*(.55+.45*fbm2(vec2(p.x*4.+t*.2,p.y*9.)));
  float ang=atan(p.y,p.x);
  c+=vec3(.55,.75,1.)*pow(h2(vec2(floor(ang*70.),floor(t*30.))),10.)*wp*smoothstep(.05,.7,length(p))*1.4;
  c*=1.+wp*.2;
  float v=1.-smoothstep(.15,1.15,length(uv-.5));
  return c*(.5+.65*v);
}

vec4 earth(vec2 q,float aaq,vec3 L){
  float len=length(q); if(len>=1.) return vec4(0.);
  float a=clamp((1.-len)/aaq,0.,1.);
  float z=sqrt(max(1.-len*len,0.)); vec3 n=vec3(q,z);
  float ct=cos(.41),st=sin(.41);
  vec3 s=vec3(n.x,n.y*ct+n.z*st,-n.y*st+n.z*ct);
  float cs=cos(sp),ss=sin(sp);
  s=vec3(s.x*cs+s.z*ss,s.y,-s.x*ss+s.z*cs);
  float hg=f3(s*2.2+3.7);
  float land=smoothstep(.5,.53,hg);
  float lat=abs(s.y);
  vec3 ocean=mix(vec3(.01,.06,.2),vec3(.03,.27,.45),smoothstep(.2,.5,hg));
  float moist=f3(s*3.1+9.1);
  vec3 ground=mix(vec3(.1,.28,.08),vec3(.45,.36,.21),smoothstep(.4,.65,moist));
  ground=mix(ground,vec3(.36,.33,.31),smoothstep(.62,.8,hg));
  float snow=smoothstep(.8,.92,lat+(hg-.5)*.5);
  ground=mix(ground,vec3(.95),snow);
  vec3 surf=mix(ocean,ground,land);
  surf=mix(surf,vec3(.93,.96,1.),smoothstep(.86,.95,lat)*(1.-land*.2));
  float cl=smoothstep(.5,.78,f3(s*3.6+vec3(t*.012,0.,t*.008)+17.));
  float nd=dot(n,L);
  float lit=smoothstep(-.08,.35,nd);
  vec3 col=surf*(.05+.95*lit);
  vec3 Hh=normalize(L+vec3(0.,0.,1.));
  col+=pow(max(dot(n,Hh),0.),70.)*(1.-land)*(1.-cl)*.9*vec3(1.,.95,.85);
  col=mix(col,vec3(1.)*(.05+.95*lit),cl*.85);
  float night=1.-smoothstep(-.15,.1,nd);
  float city=smoothstep(.72,.9,n3(s*75.+1.))*land*(1.-cl)*(1.-snow)*(1.-smoothstep(.7,.9,lat));
  col+=vec3(1.,.68,.28)*city*night*1.5;
  col+=vec3(1.,.45,.15)*exp(-pow(nd*6.,2.))*.12*(cl+.3);
  float fr=pow(1.-z,3.);
  col+=vec3(.25,.55,1.)*fr*(.25+1.2*lit)*1.1;
  return vec4(col,a);
}

vec4 moonL(vec2 q,float aaq,vec3 L){
  float len=length(q); if(len>=1.) return vec4(0.);
  float a=clamp((1.-len)/aaq,0.,1.);
  float z=sqrt(max(1.-len*len,0.)); vec3 n=vec3(q,z);
  float cr=f3(n*5.+vec3(4.2))*.7+f3(n*14.)*.3;
  vec3 col=vec3(.62,.6,.58)*(.45+.7*cr)*(.04+.96*smoothstep(-.05,.4,dot(n,L)));
  return vec4(col,a);
}

void main(){
  vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
  vec3 L=normalize(vec3(-.62,.42,.66));
  vec3 col=bg(p);
  vec2 sun=vec2(-.62*r.x/r.y,.52);
  col+=vec3(1.,.8,.55)*exp(-length(p-sun)*2.6)*.16+vec3(1.,.9,.7)*exp(-length(p-sun)*14.)*.3;
  float aa=2./r.y;

  float G=gr*mix(.55,1.,iz);
  vec2 gq=(p-(gc-m*.012))/G;
  float ca=cos(-.38),sa=sin(-.38);
  vec2 rq=vec2(gq.x*ca-gq.y*sa,gq.x*sa+gq.y*ca);
  float rd=length(vec2(rq.x,rq.y/.28));
  float ring=smoothstep(1.55,1.62,rd)*(1.-smoothstep(2.3,2.38,rd));
  ring*=.6+.4*sin(rd*46.)*sin(rd*17.);
  ring*=1.-.85*smoothstep(1.98,2.0,rd)*(1.-smoothstep(2.04,2.06,rd));
  ring=clamp(ring*.9,0.,1.);
  vec3 ringCol=mix(vec3(.55,.45,.32),vec3(.86,.76,.58),.5+.5*sin(rd*30.));
  bool front=rq.y<0.;
  if(!front) col=mix(col,ringCol*.8,ring);
  float gl2=length(gq);
  if(gl2<1.){
    float a=clamp((1.-gl2)/(aa/G),0.,1.);
    float z=sqrt(max(1.-gl2*gl2,0.)); vec3 n=vec3(gq,z);
    float turb=f3(vec3(n.x*2.,n.y*7.,n.z*2.)+vec3(t*.02,0.,0.));
    float band=.5+.5*sin(n.y*16.+turb*5.);
    vec3 sc=mix(vec3(.78,.58,.36),vec3(.46,.31,.2),band);
    float lit=smoothstep(-.1,.4,dot(n,L));
    vec3 gcn=sc*(.05+.95*lit)+vec3(.35,.5,.8)*pow(1.-z,3.)*.35*lit;
    col=mix(col,gcn,a);
  }
  if(front) col=mix(col,ringCol*.9,ring);

  float E=pr*mix(.55,1.,iz);
  vec2 eq=(p-(pc-m*.03))/E;
  float ql=length(eq);
  if(ql>=1.&&ql<1.7){
    float side=dot(normalize(eq),L.xy)*.5+.5;
    col+=vec3(.2,.5,1.)*exp(-(ql-1.)*10.)*(.15+.6*side);
  }
  float ang=t*.25;
  vec2 mp=vec2(cos(ang)*2.1,sin(ang)*.55+.25);
  float mz=sin(ang);
  float M=.22;
  vec4 mo=moonL((eq-mp)/M,aa/(E*M),L);
  if(mz<0.) col=mix(col,mo.rgb,mo.a);
  vec4 ea=earth(eq,aa/E,L);
  col=mix(col,ea.rgb,ea.a);
  if(mz>=0.) col=mix(col,mo.rgb,mo.a);

  col*=mix(.35,1.,iz);
  col+=pow(max(col-.7,vec3(0.)),vec3(2.))*.6;
  col+=(h2(gl_FragCoord.xy+fract(t)*97.)-.5)*.03;
  gl_FragColor=vec4(pow(col,vec3(.95)),1.);
}`;

type V = { fx: number; fy: number; r: number; gx: number; gy: number; gr: number };
const TARGETS: Record<string, V> = {
  home: { fx: 0.78, fy: 0.74, r: 0.23, gx: 0.1, gy: 0.4, gr: 0.075 },
  explore: { fx: 0.5, fy: -0.02, r: 0.4, gx: 0.88, gy: 0.86, gr: 0.07 },
  ai: { fx: 0.14, fy: 0.9, r: 0.18, gx: 0.9, gy: 0.3, gr: 0.06 },
  music: { fx: 0.82, fy: 0.9, r: 0.2, gx: 0.1, gy: 0.35, gr: 0.07 },
  contact: { fx: 0.5, fy: -0.05, r: 0.38, gx: 0.14, gy: 0.82, gr: 0.08 },
};
type Q = "hemat" | "normal" | "hd";
const FPS: Record<Q, number> = { hemat: 24, normal: 30, hd: 40 };
const scaleFor = (q: Q) => (q === "hemat" ? 0.5 : q === "normal" ? 0.7 : Math.min(window.devicePixelRatio || 1, 1.5));

export default function Cosmos() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = (canvas.getContext("webgl", { antialias: false, powerPreference: "high-performance" }) || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) { setFallback(true); return; }
    const mk = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; } return s; };
    const vs = mk(gl.VERTEX_SHADER, VS), fs = mk(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) { setFallback(true); return; }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setFallback(true); return; }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const uR = U("r"), uT = U("t"), uM = U("m"), uPc = U("pc"), uPr = U("pr"), uGc = U("gc"), uGr = U("gr"), uSp = U("sp"), uIz = U("iz"), uTa = U("ta"), uTb = U("tb"), uWp = U("wp");

    let quality: Q = "normal";
    try { const s = localStorage.getItem("fahri-q"); if (s === "hemat" || s === "normal" || s === "hd") quality = s; } catch {}
    let scale = scaleFor(quality);
    const resize = () => {
      canvas.width = Math.max(2, Math.floor(window.innerWidth * scale));
      canvas.height = Math.max(2, Math.floor(window.innerHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const onQ = (e: Event) => { quality = (e as CustomEvent<Q>).detail; scale = scaleFor(quality); resize(); };
    window.addEventListener("resize", resize); window.addEventListener("fahri:quality", onQ);

    const cur: V = { ...TARGETS.home }, tgt: V = { ...TARGETS.home };
    const onView = (e: Event) => { const v = TARGETS[(e as CustomEvent<string>).detail]; if (v) Object.assign(tgt, v); };
    window.addEventListener("fahri:view", onView);
    const tintC: number[] = [...THEMES.cyan.a, ...THEMES.cyan.b], tintT: number[] = [...tintC];
    const onTheme = (e: Event) => { const th = THEMES[(e as CustomEvent<string>).detail as ThemeId] || THEMES.cyan; [...th.a, ...th.b].forEach((v, i) => (tintT[i] = v)); };
    window.addEventListener("fahri:theme", onTheme);
    let warp = 0;
    const onWarp = () => { warp = 1; };
    window.addEventListener("fahri:view", onWarp); window.addEventListener("fahri:enter", onWarp);
    let izT = reduce ? 1 : 0, iz = reduce ? 1 : 0;
    const onEnter = () => { izT = 1; };
    window.addEventListener("fahri:enter", onEnter);

    let mx = 0, my = 0, sx = 0, sy = 0, spin = 0, spinV = 0, down = false, lx = 0;
    const pm = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1; my = 1 - (e.clientY / window.innerHeight) * 2;
      if (down) { spinV += (e.clientX - lx) * 0.0016; lx = e.clientX; }
    };
    const pd = (e: PointerEvent) => { down = true; lx = e.clientX; pm(e); };
    const pu = () => { down = false; };
    const tilt = (e: DeviceOrientationEvent) => { if (e.gamma != null && e.beta != null) { mx = Math.max(-1, Math.min(1, e.gamma / 30)); my = Math.max(-1, Math.min(1, (e.beta - 45) / -30)); } };
    window.addEventListener("pointermove", pm); window.addEventListener("pointerdown", pd); window.addEventListener("pointerup", pu); window.addEventListener("pointercancel", pu);
    window.addEventListener("deviceorientation", tilt);

    let raf = 0, last = performance.now(), t = 0, slow = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const budget = 1000 / FPS[quality];
      if (document.hidden || now - last < budget - 2) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      if (now - last > budget * 1.7 && quality !== "hemat") { if (++slow > 40) { slow = 0; scale = Math.max(0.4, scale - 0.08); resize(); } } else slow = Math.max(0, slow - 1);
      last = now;
      const k = 1 - Math.exp(-dt * 3.2);
      (Object.keys(cur) as (keyof V)[]).forEach((key) => { cur[key] += (tgt[key] - cur[key]) * k; });
      iz += (izT - iz) * (1 - Math.exp(-dt * 1.7));
      for (let i = 0; i < 6; i++) tintC[i] += (tintT[i] - tintC[i]) * k;
      warp *= Math.exp(-dt * 2.4);
      sx += (mx - sx) * 0.06; sy += (my - sy) * 0.06;
      spin += spinV; spinV *= 0.94;
      if (!reduce) t += dt;
      const asp = canvas.width / canvas.height;
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, reduce ? 12 : t);
      gl.uniform2f(uM, sx, sy);
      gl.uniform2f(uPc, (cur.fx - 0.5) * asp, cur.fy - 0.5);
      gl.uniform1f(uPr, cur.r);
      gl.uniform2f(uGc, (cur.gx - 0.5) * asp, cur.gy - 0.5);
      gl.uniform1f(uGr, cur.gr);
      gl.uniform1f(uSp, t * 0.05 + spin);
      gl.uniform1f(uIz, Math.min(1, iz));
      gl.uniform3f(uTa, tintC[0], tintC[1], tintC[2]); gl.uniform3f(uTb, tintC[3], tintC[4], tintC[5]);
      gl.uniform1f(uWp, reduce ? 0 : warp);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);
    const lost = (e: Event) => { e.preventDefault(); cancelAnimationFrame(raf); setFallback(true); };
    canvas.addEventListener("webglcontextlost", lost);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize); window.removeEventListener("fahri:quality", onQ);
      window.removeEventListener("fahri:view", onView); window.removeEventListener("fahri:view", onWarp); window.removeEventListener("fahri:enter", onWarp); window.removeEventListener("fahri:theme", onTheme); window.removeEventListener("fahri:enter", onEnter);
      window.removeEventListener("pointermove", pm); window.removeEventListener("pointerdown", pd);
      window.removeEventListener("pointerup", pu); window.removeEventListener("pointercancel", pu);
      window.removeEventListener("deviceorientation", tilt);
      canvas.removeEventListener("webglcontextlost", lost);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-space" aria-hidden>
      {fallback ? (
        <div className="absolute inset-0 stars-css" style={{ backgroundColor: "#05070D", backgroundImage: "radial-gradient(60% 40% at 80% 15%, #2563EB66, transparent), radial-gradient(50% 35% at 10% 55%, #22D3EE33, transparent), radial-gradient(70% 40% at 60% 98%, #6D28D955, transparent)" }} />
      ) : (
        <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      )}
      <i className="shoot" /><i className="shoot b" />
    </div>
  );
}

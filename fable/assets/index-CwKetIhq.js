const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./cars-NqDthZbP.js","./config-HOpE_oFZ.js","./layout-Wautyo69.js","./vehicle-CoVWtvSF.js","./boats-CWCeTqYu.js","./shops-DOAiIgub.js","./shops-BAmVq9qa.css"])))=>i.map(i=>d[i]);
import{$ as e,$t as t,A as n,Ar as r,At as i,B as a,Br as o,Bt as s,C as c,Cr as l,Ct as u,D as d,Dr as f,Dt as p,E as m,Er as h,Et as g,F as _,Fr as v,Ft as y,G as b,Gn as x,Gt as S,H as C,Hr as w,Ht as T,I as E,Ir as D,It as O,J as k,Jn as A,Jt as j,K as ee,Kn as te,Kt as M,L as ne,Lr as re,Lt as ie,M as N,Mr as ae,Mt as oe,N as se,Nr as P,Nt as ce,O as le,Or as ue,Ot as de,Pr as fe,Pt as pe,Q as me,Qt as he,R as ge,Rr as _e,Rt as F,S as I,Sr as ve,St as ye,Tr as be,Tt as xe,U as Se,Ur as Ce,Ut as we,V as Te,Vr as Ee,Vt as De,W as Oe,Wn as ke,Wr as Ae,Wt as je,X as Me,Xn as Ne,Xt as Pe,Y as Fe,Yn as L,Yt as Ie,Z as Le,Zn as Re,Zt as R,_ as ze,_r as z,_t as B,a as V,an as Be,ar as Ve,at as He,b as Ue,br as We,bt as Ge,c as Ke,cr as qe,ct as Je,d as Ye,dr as Xe,dt as Ze,en as Qe,et as $e,f as et,fr as tt,ft as nt,g as H,gr as rt,gt as it,h as at,hr as ot,i as st,in as ct,ir as lt,it as ut,j as U,jr as dt,jt as ft,k as pt,kr as mt,kt as ht,l as gt,ln as _t,lr as vt,lt as yt,m as W,mn as bt,mr as xt,mt as St,n as Ct,nn as wt,nr as Tt,nt as Et,o as Dt,on as Ot,ot as kt,p as At,pn as jt,pr as Mt,pt as Nt,q as Pt,qt as Ft,r as It,rn as Lt,rr as Rt,rt as zt,s as Bt,sn as Vt,sr as Ht,t as Ut,tn as Wt,tt as Gt,u as Kt,ur as qt,ut as Jt,v as Yt,vr as Xt,vt as Zt,w as Qt,wr as $t,wt as en,x as tn,y as G,yt as nn,z as K,zr as rn,zt as an}from"./config-HOpE_oFZ.js";import{a as on,c as sn,i as cn,l as ln,n as un,o as dn,r as fn,s as pn,t as mn}from"./layout-Wautyo69.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function hn(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function gn(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var q={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},J={common:{diffuse:{value:new K(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new F},alphaMap:{value:null},alphaMapTransform:{value:new F},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new F}},envmap:{envMap:{value:null},envMapRotation:{value:new F},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new F}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new F}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new F},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new F},normalScale:{value:new h(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new F},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new F}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new F}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new F}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new K(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new K(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new F},alphaTest:{value:0},uvTransform:{value:new F}},sprite:{diffuse:{value:new K(16777215)},opacity:{value:1},center:{value:new h(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new F},alphaMap:{value:null},alphaMapTransform:{value:new F},alphaTest:{value:0}}},_n={basic:{uniforms:Ee([J.common,J.specularmap,J.envmap,J.aomap,J.lightmap,J.fog]),vertexShader:q.meshbasic_vert,fragmentShader:q.meshbasic_frag},lambert:{uniforms:Ee([J.common,J.specularmap,J.envmap,J.aomap,J.lightmap,J.emissivemap,J.bumpmap,J.normalmap,J.displacementmap,J.fog,J.lights,{emissive:{value:new K(0)},envMapIntensity:{value:1}}]),vertexShader:q.meshlambert_vert,fragmentShader:q.meshlambert_frag},phong:{uniforms:Ee([J.common,J.specularmap,J.envmap,J.aomap,J.lightmap,J.emissivemap,J.bumpmap,J.normalmap,J.displacementmap,J.fog,J.lights,{emissive:{value:new K(0)},specular:{value:new K(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:q.meshphong_vert,fragmentShader:q.meshphong_frag},standard:{uniforms:Ee([J.common,J.envmap,J.aomap,J.lightmap,J.emissivemap,J.bumpmap,J.normalmap,J.displacementmap,J.roughnessmap,J.metalnessmap,J.fog,J.lights,{emissive:{value:new K(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:q.meshphysical_vert,fragmentShader:q.meshphysical_frag},toon:{uniforms:Ee([J.common,J.aomap,J.lightmap,J.emissivemap,J.bumpmap,J.normalmap,J.displacementmap,J.gradientmap,J.fog,J.lights,{emissive:{value:new K(0)}}]),vertexShader:q.meshtoon_vert,fragmentShader:q.meshtoon_frag},matcap:{uniforms:Ee([J.common,J.bumpmap,J.normalmap,J.displacementmap,J.fog,{matcap:{value:null}}]),vertexShader:q.meshmatcap_vert,fragmentShader:q.meshmatcap_frag},points:{uniforms:Ee([J.points,J.fog]),vertexShader:q.points_vert,fragmentShader:q.points_frag},dashed:{uniforms:Ee([J.common,J.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:q.linedashed_vert,fragmentShader:q.linedashed_frag},depth:{uniforms:Ee([J.common,J.displacementmap]),vertexShader:q.depth_vert,fragmentShader:q.depth_frag},normal:{uniforms:Ee([J.common,J.bumpmap,J.normalmap,J.displacementmap,{opacity:{value:1}}]),vertexShader:q.meshnormal_vert,fragmentShader:q.meshnormal_frag},sprite:{uniforms:Ee([J.sprite,J.fog]),vertexShader:q.sprite_vert,fragmentShader:q.sprite_frag},background:{uniforms:{uvTransform:{value:new F},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:q.background_vert,fragmentShader:q.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new F}},vertexShader:q.backgroundCube_vert,fragmentShader:q.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:q.cube_vert,fragmentShader:q.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:q.equirect_vert,fragmentShader:q.equirect_frag},distance:{uniforms:Ee([J.common,J.displacementmap,{referencePosition:{value:new f},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:q.distance_vert,fragmentShader:q.distance_frag},shadow:{uniforms:Ee([J.lights,J.fog,{color:{value:new K(0)},opacity:{value:1}}]),vertexShader:q.shadow_vert,fragmentShader:q.shadow_frag}};_n.physical={uniforms:Ee([_n.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new F},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new F},clearcoatNormalScale:{value:new h(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new F},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new F},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new F},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new F},sheen:{value:0},sheenColor:{value:new K(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new F},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new F},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new F},transmissionSamplerSize:{value:new h},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new F},attenuationDistance:{value:0},attenuationColor:{value:new K(0)},specularColor:{value:new K(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new F},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new F},anisotropyVector:{value:new h},anisotropyMap:{value:null},anisotropyMapTransform:{value:new F}}]),vertexShader:q.meshphysical_vert,fragmentShader:q.meshphysical_frag};var vn={r:0,b:0,g:0},yn=new an,bn=new F;bn.set(-1,0,0,0,1,0,0,0,1);function xn(e,t,n,r,i,o){let c=new K(0),l=i===!0?0:1,u,d,f=null,p=0,m=null;function h(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function g(t){let r=!1,i=h(t);i===null?v(c,l):i&&i.isColor&&(v(i,1),r=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?n.buffers.color.setClear(0,0,0,1,o):a===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,o),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function _(t,n){let i=h(n);i&&i.isCubeTexture?(d===void 0&&(d=new s(new U(1,1,1),new Ve({name:`BackgroundCubeMaterial`,uniforms:P(_n.backgroundCube.uniforms),vertexShader:_n.backgroundCube.vertexShader,fragmentShader:_n.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),d.geometry.deleteAttribute(`normal`),d.geometry.deleteAttribute(`uv`),d.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(d.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(d)),d.material.uniforms.envMap.value=i,d.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,d.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,d.material.uniforms.backgroundRotation.value.setFromMatrix4(yn.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isRenderTargetTexture===!1&&d.material.uniforms.backgroundRotation.value.premultiply(bn),d.material.toneMapped=a.getTransfer(i.colorSpace)!==Rt,(f!==i||p!==i.version||m!==e.toneMapping)&&(d.material.needsUpdate=!0,f=i,p=i.version,m=e.toneMapping),d.layers.enableAll(),t.unshift(d,d.geometry,d.material,0,0,null)):i&&i.isTexture&&(u===void 0&&(u=new s(new Wt(2,2),new Ve({name:`BackgroundMaterial`,uniforms:P(_n.background.uniforms),vertexShader:_n.background.vertexShader,fragmentShader:_n.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),Object.defineProperty(u.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(u)),u.material.uniforms.t2D.value=i,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.toneMapped=a.getTransfer(i.colorSpace)!==Rt,i.matrixAutoUpdate===!0&&i.updateMatrix(),u.material.uniforms.uvTransform.value.copy(i.matrix),(f!==i||p!==i.version||m!==e.toneMapping)&&(u.material.needsUpdate=!0,f=i,p=i.version,m=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null))}function v(t,r){t.getRGB(vn,rn(e)),n.buffers.color.setClear(vn.r,vn.g,vn.b,r,o)}function y(){d!==void 0&&(d.geometry.dispose(),d.material.dispose(),d=void 0),u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0)}return{getClearColor:function(){return c},setClearColor:function(e,t=1){c.set(e),l=t,v(c,l)},getClearAlpha:function(){return l},setClearAlpha:function(e){l=e,v(c,l)},render:g,addToRenderList:_,dispose:y}}function Sn(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.isInterleavedBuffer===!0?t.stride:t.itemSize,p=s.offset;if(t.isInstancedInterleavedBuffer||t.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Cn(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function wn(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(Ce(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),f=n.logarithmicDepthBuffer===!0&&d===!1;n.reversedDepthBuffer===!0&&d===!1&&Ce(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`),n.logarithmicDepthBuffer===!0&&d===!0&&Ce(`WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function Tn(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Qe,s=new F,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var En=class extends dt{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new Se(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new U(5,5,5),i=new Ve({name:`CubemapFromEquirect`,uniforms:P(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});i.uniforms.tEquirect.value=t;let a=new s(r,i),o=t.minFilter;return t.minFilter===1008&&(t.minFilter=de),new Te(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}},Dn=256,On=3,kn=20,An=256,jn=16,Mn=3,Nn=new f,Pn=new K,Fn=class e{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Te(1,10,null),this._boxMesh=new s(new U(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=Nn}=i,s=this._renderer;this._setSize(a);let c=this._allocateTarget(),l=this._getSourceTarget(!0);t>0&&(l.texture.mipmapsAutoUpdate=!1);let u=s.autoClear,d=s.autoClearColor,f=s.autoClearDepth,p=s.autoClearStencil,m=e.background;s.autoClear=!0,s.autoClearColor=!0,s.autoClearDepth=!0,s.autoClearStencil=!0,m===null&&(e.background=s.getClearColor(Pn));let h=new Te(n,r,l);return h.position.copy(o),h.update(s,e),s.autoClear=u,s.autoClearColor=d,s.autoClearDepth=f,s.autoClearStencil=p,e.background=m,t>0&&(l.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Hn(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Vn(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Dn,re(e))}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?Dn:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=In(e,!1,!1),n=Math.log2(e)-On;for(let r=0;r<=n;r++)t.texture.mipmaps.push({width:e>>r,height:e>>r});return t.texture.name=`PMREM`,t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=In(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let r=this._boxMesh,i=this._cubeCamera;r.material=n,i.renderTarget=e,i.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),i.update(this._renderer,r),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===301||e.mapping===302?(this._cubemapMaterial===null&&(this._cubemapMaterial=Hn()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Vn()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=Rn(),this._integrationMaterial=zn());let n=this._cubeSize,r=t.texture.mipmaps.length-1,i=this._ggxMaterial.uniforms;i.envMap.value=this._sourceTarget.texture;let a=this._integrationMaterial.uniforms;a.envMap.value=this._sourceTarget.texture,a.sourceLod.value=Math.log2(n/jn);for(let o=0;o<=r;o++){let s=e.lodToRoughness(o,r);if(o>r-Mn)a.roughness.value=s,this._renderCube(t,o,this._integrationMaterial);else{let e=s>0?Math.log2(n)+.5*Math.log2(6/(An*s**4))+.5:0;i.roughness.value=s,i.lodBias.value=e,this._renderCube(t,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=Bn());let n=this._blurMaterial,r=n.uniforms,i=this._sourceTarget;r.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,r.envMap.value=i.texture,this._renderCube(e,0,n),r.envMap.value=e.texture,this._renderCube(i,0,n)}};function In(e,t,n){return new En(e,{minFilter:ht,generateMipmaps:t,type:yt,colorSpace:ft,depthBuffer:n})}function Ln(e,t,n){return new Ve({name:e,uniforms:t,vertexShader:q.cube_vert,fragmentShader:n,side:1,blending:0,depthTest:!1,depthWrite:!1})}function Rn(){return Ln(`PMREMGGXConvolution`,{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${An}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function zn(){return Ln(`PMREMGGXIntegration`,{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:jn}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Bn(){return Ln(`PMREMSphericalGaussianBlur`,{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${kn}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function Vn(){return Ln(`PMREMEquirectangularToCubemap`,{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function Hn(){return Ln(`PMREMCubemapToCubemap`,{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function Un(e){let t=new WeakMap,n=new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new En(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture&&t.isPMREMTexture!==!0){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new Fn(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new Fn(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=new WeakMap,n=new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function Wn(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Ae(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Gn(e,t,n,r){let i={},a=new WeakMap,o=new FinalizationRegistry(e=>delete i[e]);function s(e){c(e.target)}function c(e){e.index!==null&&t.remove(e.index);for(let n in e.attributes)t.remove(e.attributes[n]);e.removeEventListener(`dispose`,s),delete i[e.id],o.unregister(e);let c=a.get(e);c&&(t.remove(c),a.delete(e)),r.releaseStatesOfGeometry(e),e.isInstancedBufferGeometry===!0&&delete e._maxInstanceCount,n.memory.geometries--}function l(e,t){return i[t.id]===void 0&&(t.addEventListener(`dispose`,s),i[t.id]=new WeakRef(t),o.register(t,t.id,t),n.memory.geometries++),t}function u(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function d(e){let n=e.index,r=e.attributes.position,i=0;if(r===void 0)return;let o=n===null?r.array.length/3-1:n.array.length,s=new(r.count>=65535?rt:ot)(Math.ceil(o/3)*6,1),c=s.array;if(n!==null){let e=n.array;i=n.version;for(let t=0,n=0;t<o;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];c[n++]=r,c[n++]=i,c[n++]=i,c[n++]=a,c[n++]=a,c[n++]=r}}else{i=r.version;for(let e=0,t=0;e<o;e+=3){let n=e+0,r=e+1,i=e+2;c[t++]=n,c[t++]=r,c[t++]=r,c[t++]=i,c[t++]=i,c[t++]=n}}s.version=i;let l=a.get(e);l&&t.remove(l),a.set(e,s)}function f(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&d(e)}else d(e);return a.get(e)}function p(){for(let e in i){let t=i[e].deref();t!==void 0&&c(t)}}return{get:l,update:u,getWireframeAttribute:f,dispose:p}}function Kn(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function qn(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:D(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Jn(e,t,n){let r=new WeakMap,i=new ue;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let g=new Float32Array(p*m*4*u),_=new ee(g,p,m,u);_.type=zt,_.needsUpdate=!0;let v=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),g[d+s+0]=i.x,g[d+s+1]=i.y,g[d+s+2]=i.z,g[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),g[d+s+4]=i.x,g[d+s+5]=i.y,g[d+s+6]=i.z,g[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),g[d+s+8]=i.x,g[d+s+9]=i.y,g[d+s+10]=i.z,g[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:_,size:new h(p,m)},r.set(o,d);function y(){_.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Yn(e,t,n,r,i){let a=new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}var Xn={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function Zn(e,t,n,r,i,o){let c=new dt(t,n,{type:e,depthBuffer:i,stencilBuffer:o,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),l=null,u=null,d=null,f=new se;f.setAttribute(`position`,new Et([-1,3,0,-1,-1,0,3,-1,0],3)),f.setAttribute(`uv`,new Et([0,2,0,0,2,0],2));let p=new te({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),m=new s(f,p),h=new he(-1,1,1,-1,0,1),g=null,_=null,v=!1,y,b=null,x=[],S=!1;this.setSize=function(e,t){c.setSize(e,t),l!==null&&l.setSize(e,t),u!==null&&u.setSize(e,t);for(let n=0;n<x.length;n++){let r=x[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){x=e,S=x.length>0&&x[0].isRenderPass===!0;let t=c.width,n=c.height;x.length>0&&l===null&&(l=new dt(t,n,{type:yt,depthBuffer:!1,stencilBuffer:!1}),u=new dt(t,n,{type:yt,depthBuffer:!1,stencilBuffer:!1}));let r=i===!0&&x.some(e=>e.needsDepthTexture===!0);r!==(c.depthTexture!==null)&&(r===!0&&d===null&&(d=new Me(t,n),o===!0&&(d.format=Fe,d.type=We)),c.dispose(),c.depthTexture=r?d:null,c.resolveDepthBuffer=r,c.storeMultisampledDepthBuffer=r);for(let e=0;e<x.length;e++){let i=x[e];i.setSize&&i.setSize(t,n),r&&i.needsDepthTexture===!0&&i.setDepthTexture&&i.setDepthTexture(d)}},this.begin=function(e,t){if(v||e.toneMapping===0&&x.length===0)return!1;if(b=t,t!==null){let e=t.width,n=t.height;(c.width!==e||c.height!==n)&&this.setSize(e,n)}return S===!1&&e.setRenderTarget(c),y=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return S},this.end=function(e,t){e.toneMapping=y,v=!0;let n=c,r=l;for(let i=0;i<x.length;i++){let a=x[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===l?u:l))}if(g!==e.outputColorSpace||_!==e.toneMapping){g=e.outputColorSpace,_=e.toneMapping,p.defines={},a.getTransfer(g)===`srgb`&&(p.defines.SRGB_TRANSFER=``);let t=Xn[_];t&&(p.defines[t]=``),p.needsUpdate=!0}p.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(b),e.render(m,h),b=null,v=!1},this.isCompositing=function(){return v},this.dispose=function(){c.dispose(),l!==null&&l.dispose(),u!==null&&u.dispose(),f.dispose(),p.dispose()}}var Qn=new tt,$n=new Me(1,1),er=new C(1),tr=new ee,nr=new b,rr=new Se,ir=[],ar=[],or=new Float32Array(16),sr=new Float32Array(9),cr=new Float32Array(4);function lr(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=ir[i];if(a===void 0&&(a=new Float32Array(i),ir[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function ur(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function dr(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function fr(e,t){let n=ar[t];n===void 0&&(n=new Int32Array(t),ar[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function pr(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function mr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(ur(n,t))return;e.uniform2fv(this.addr,t),dr(n,t)}}function hr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(ur(n,t))return;e.uniform3fv(this.addr,t),dr(n,t)}}function gr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(ur(n,t))return;e.uniform4fv(this.addr,t),dr(n,t)}}function _r(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(ur(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),dr(n,t)}else{if(ur(n,r))return;cr.set(r),e.uniformMatrix2fv(this.addr,!1,cr),dr(n,r)}}function vr(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(ur(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),dr(n,t)}else{if(ur(n,r))return;sr.set(r),e.uniformMatrix3fv(this.addr,!1,sr),dr(n,r)}}function yr(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(ur(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),dr(n,t)}else{if(ur(n,r))return;or.set(r),e.uniformMatrix4fv(this.addr,!1,or),dr(n,r)}}function br(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function xr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(ur(n,t))return;e.uniform2iv(this.addr,t),dr(n,t)}}function Sr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(ur(n,t))return;e.uniform3iv(this.addr,t),dr(n,t)}}function Cr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(ur(n,t))return;e.uniform4iv(this.addr,t),dr(n,t)}}function wr(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Tr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(ur(n,t))return;e.uniform2uiv(this.addr,t),dr(n,t)}}function Er(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(ur(n,t))return;e.uniform3uiv(this.addr,t),dr(n,t)}}function Dr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(ur(n,t))return;e.uniform4uiv(this.addr,t),dr(n,t)}}function Or(e){return e.version===0&&(e.compareFunction=519,e.needsUpdate=!0),e}function kr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_2D_SHADOW?Or($n):Qn,n.setTexture2D(t||a,i)}function Ar(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||nr,i)}function jr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_CUBE_SHADOW?Or(er):rr,n.setTextureCube(t||a,i)}function Mr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||tr,i)}function Nr(e){switch(e){case 5126:return pr;case 35664:return mr;case 35665:return hr;case 35666:return gr;case 35674:return _r;case 35675:return vr;case 35676:return yr;case 5124:case 35670:return br;case 35667:case 35671:return xr;case 35668:case 35672:return Sr;case 35669:case 35673:return Cr;case 5125:return wr;case 36294:return Tr;case 36295:return Er;case 36296:return Dr;case 35678:case 36198:case 36298:case 36306:case 35682:return kr;case 35679:case 36299:case 36307:return Ar;case 35680:case 36300:case 36308:case 36293:return jr;case 36289:case 36303:case 36311:case 36292:return Mr}}function Pr(e,t){e.uniform1fv(this.addr,t)}function Fr(e,t){let n=lr(t,this.size,2);e.uniform2fv(this.addr,n)}function Ir(e,t){let n=lr(t,this.size,3);e.uniform3fv(this.addr,n)}function Lr(e,t){let n=lr(t,this.size,4);e.uniform4fv(this.addr,n)}function Rr(e,t){let n=lr(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function zr(e,t){let n=lr(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Br(e,t){let n=lr(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Vr(e,t){e.uniform1iv(this.addr,t)}function Hr(e,t){e.uniform2iv(this.addr,t)}function Ur(e,t){e.uniform3iv(this.addr,t)}function Wr(e,t){e.uniform4iv(this.addr,t)}function Gr(e,t){e.uniform1uiv(this.addr,t)}function Kr(e,t){e.uniform2uiv(this.addr,t)}function qr(e,t){e.uniform3uiv(this.addr,t)}function Jr(e,t){e.uniform4uiv(this.addr,t)}function Yr(e,t,n){let r=this.cache,i=t.length,a=fr(n,i);ur(r,a)||(e.uniform1iv(this.addr,a),dr(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?Or($n):Qn;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function Xr(e,t,n){let r=this.cache,i=t.length,a=fr(n,i);ur(r,a)||(e.uniform1iv(this.addr,a),dr(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||nr,a[e])}function Zr(e,t,n){let r=this.cache,i=t.length,a=fr(n,i);ur(r,a)||(e.uniform1iv(this.addr,a),dr(r,a));let o;o=this.type===e.SAMPLER_CUBE_SHADOW?Or(er):rr;for(let e=0;e!==i;++e)n.setTextureCube(t[e]||o,a[e])}function Qr(e,t,n){let r=this.cache,i=t.length,a=fr(n,i);ur(r,a)||(e.uniform1iv(this.addr,a),dr(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||tr,a[e])}function $r(e){switch(e){case 5126:return Pr;case 35664:return Fr;case 35665:return Ir;case 35666:return Lr;case 35674:return Rr;case 35675:return zr;case 35676:return Br;case 5124:case 35670:return Vr;case 35667:case 35671:return Hr;case 35668:case 35672:return Ur;case 35669:case 35673:return Wr;case 5125:return Gr;case 36294:return Kr;case 36295:return qr;case 36296:return Jr;case 35678:case 36198:case 36298:case 36306:case 35682:return Yr;case 35679:case 36299:case 36307:return Xr;case 35680:case 36300:case 36308:case 36293:return Zr;case 36289:case 36303:case 36311:case 36292:return Qr}}var ei=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Nr(t.type)}},ti=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=$r(t.type)}},ni=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},ri=/(\w+)(\])?(\[|\.)?/g;function ii(e,t){e.seq.push(t),e.map[t.id]=t}function ai(e,t,n){let r=e.name,i=r.length;for(ri.lastIndex=0;;){let a=ri.exec(r),o=ri.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){ii(n,l===void 0?new ei(s,e,t):new ti(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new ni(s),ii(n,e)),n=e}}}var oi=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);ai(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function si(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var ci=37297,li=0;function ui(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var di=new F;function fi(e){a._getMatrix(di,a.workingColorSpace,e);let t=`mat3( ${di.elements.map(e=>e.toFixed(4))} )`;switch(a.getTransfer(e)){case oe:return[t,`LinearTransferOETF`];case Rt:return[t,`sRGBTransferOETF`];default:return Ce(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function pi(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+ui(e.getShaderSource(t),r)}return i}function mi(e,t){let n=fi(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( ${n[0]} * value.rgb, value.a ) );`,`}`].join(`
`)}var hi={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function gi(e,t){let n=hi[t];return n===void 0?(Ce(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var _i=new f;function vi(){return a.getLuminanceCoefficients(_i),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${_i.x.toFixed(4)}, ${_i.y.toFixed(4)}, ${_i.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function yi(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Si).join(`
`)}function bi(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function xi(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Si(e){return e!==``}function Ci(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function wi(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Ti=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ei(e){return e.replace(Ti,Di)}function Di(e,t){let n=q[t];if(n===void 0)throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`);return Ei(n)}var Oi=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ki(e){return e.replace(Oi,Ai)}function Ai(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function ji(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}var Mi={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function Ni(e){return Mi[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}var Pi={302:`ENVMAP_MODE_REFRACTION`};function Fi(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:Pi[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}var Ii={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function Li(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:Ii[e.combine]||`ENVMAP_BLENDING_NONE`}function Ri(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Ni(n),l=n.envMapPMREM===!0?`ENVMAP_TYPE_PMREM`:`ENVMAP_TYPE_CUBE`,u=Fi(n),d=Li(n),f=yi(n),p=bi(a),m=i.createProgram(),h,g,_=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(h=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(Si).join(`
`),h.length>0&&(h+=`
`),g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter(Si).join(`
`),g.length>0&&(g+=`
`)):(h=[ji(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.diffuseRoughnessMapUv?`#define DIFFUSE_ROUGHNESSMAP_UV `+n.diffuseRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Si).join(`
`),g=[ji(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,n.envMapPMREM?`#define ENVMAP_MAX_LOD `+n.envMapMaxLod+`.0`:``,n.envMapPMREM?`#define ENVMAP_SIZE `+n.envMapSize+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughness?`#define USE_DIFFUSE_ROUGHNESS`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:q.tonemapping_pars_fragment,n.toneMapping===0?``:gi(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,q.colorspace_pars_fragment,mi(`linearToOutputTexel`,n.outputColorSpace),vi(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Si).join(`
`)),o=Ei(o),o=Ci(o,n),o=wi(o,n),s=Ei(s),s=Ci(s,n),s=wi(s,n),o=ki(o),s=ki(s),n.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,h=[f,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+h,g=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+g);let v=_+h+o,y=_+g+s,b=si(i,i.VERTEX_SHADER,v),x=si(i,i.FRAGMENT_SHADER,y);i.attachShader(m,b),i.attachShader(m,x),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(m,0,`position`):i.bindAttribLocation(m,0,n.index0AttributeName),i.linkProgram(m);function S(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(m)||``,r=i.getShaderInfoLog(b)||``,a=i.getShaderInfoLog(x)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(m,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,m,b,x);else{let e=pi(i,b,`vertex`),n=pi(i,x,`fragment`);D(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(m,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):Ce(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:h},fragmentShader:{log:c,prefix:g}})}i.deleteShader(b),i.deleteShader(x),C=new oi(i,m),w=xi(i,m)}let C;this.getUniforms=function(){return C===void 0&&S(this),C};let w;this.getAttributes=function(){return w===void 0&&S(this),w};let T=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=i.getProgramParameter(m,ci)),T},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(m),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=li++,this.cacheKey=t,this.usedTimes=1,this.program=m,this.vertexShader=b,this.fragmentShader=x,this}var zi=0,Bi=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Vi(e),t.set(e,n)),n}},Vi=class{constructor(e){this.id=zi++,this.code=e,this.usedTimes=0}};function Hi(e){return e===1030||e===37490||e===36285}function Ui(e,t,n,r,i,o){let s=new u,c=new Bi,l=new Set,d=[],f=new Map,p=r.logarithmicDepthBuffer,m={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function h(e){return l.add(e),e===0?`uv`:`uv${e}`}function g(i,s,u,d,f,g){let _=d.fog,v=f.geometry,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?d.environment:null,b=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,x=t.get(i.envMap||y,b),S=m[i.type],C=r.precision;i.precision!==null&&(C=r.getMaxPrecision(i.precision),C!==i.precision&&Ce(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,C,`instead.`));let w=v.morphAttributes.position||v.morphAttributes.normal||v.morphAttributes.color,T=w===void 0?0:w.length,E=0;v.morphAttributes.position!==void 0&&(E=1),v.morphAttributes.normal!==void 0&&(E=2),v.morphAttributes.color!==void 0&&(E=3);let D,O,k,A;if(S){let e=_n[S];D=e.vertexShader,O=e.fragmentShader}else{D=i.vertexShader,O=i.fragmentShader;let e=c.getVertexShaderStage(i),t=c.getFragmentShaderStage(i);c.update(i,e,t),k=e.id,A=t.id}let j=e.getRenderTarget(),ee=e.state.buffers.depth.getReversed(),te=f.isInstancedMesh===!0,M=f.isBatchedMesh===!0,ne=!!i.map,re=!!i.matcap,ie=!!x,N=ie&&x.isPMREMTexture===!0,ae=!!i.aoMap,oe=!!i.lightMap,se=!!i.bumpMap&&i.wireframe===!1,P=!!i.normalMap,ce=!!i.displacementMap,le=!!i.emissiveMap,ue=!!i.metalnessMap,de=!!i.roughnessMap,fe=i.anisotropy>0,pe=i.clearcoat>0,me=i.diffuseRoughness>0,he=i.dispersion>0,ge=i.retroreflectivity>0,_e=i.iridescence>0,F=i.sheen>0,I=i.transmission>0,ve=fe&&!!i.anisotropyMap,ye=pe&&!!i.clearcoatMap,be=pe&&!!i.clearcoatNormalMap,xe=pe&&!!i.clearcoatRoughnessMap,Se=me&&!!i.diffuseRoughnessMap,we=_e&&!!i.iridescenceMap,Te=_e&&!!i.iridescenceThicknessMap,Ee=F&&!!i.sheenColorMap,De=F&&!!i.sheenRoughnessMap,Oe=!!i.specularMap,ke=!!i.specularColorMap,Ae=!!i.specularIntensityMap,je=I&&!!i.transmissionMap,Me=I&&!!i.thicknessMap,Ne=!!i.gradientMap,Pe=!!i.alphaMap,Fe=i.alphaTest>0,L=!!i.alphaHash,Ie=!!i.extensions,Le=0;i.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Le=e.toneMapping);let Re=N?x.isCompressedCubeTexture?x.image[0].mipmaps:x.mipmaps:null,R={shaderID:S,shaderType:i.type,shaderName:i.name,vertexShader:D,fragmentShader:O,defines:i.defines,customVertexShaderID:k,customFragmentShaderID:A,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:C,batching:M,batchingColor:M&&f._colorsTexture!==null,instancing:te,instancingColor:te&&f.instanceColor!==null,instancingMorph:te&&f.morphTexture!==null,outputColorSpace:j===null?e.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:a.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:ne,matcap:re,envMap:ie,envMapMode:ie&&x.mapping,envMapPMREM:N,envMapMaxLod:N?Re.length-1:null,envMapSize:N?Re[0].width:null,aoMap:ae,lightMap:oe,bumpMap:se,normalMap:P,displacementMap:ce,emissiveMap:le,normalMapObjectSpace:P&&i.normalMapType===1,normalMapTangentSpace:P&&i.normalMapType===0,packedNormalMap:P&&i.normalMapType===0&&Hi(i.normalMap.format),metalnessMap:ue,roughnessMap:de,anisotropy:fe,anisotropyMap:ve,clearcoat:pe,clearcoatMap:ye,clearcoatNormalMap:be,clearcoatRoughnessMap:xe,diffuseRoughness:me,diffuseRoughnessMap:Se,dispersion:he,retroreflection:ge,iridescence:_e,iridescenceMap:we,iridescenceThicknessMap:Te,sheen:F,sheenColorMap:Ee,sheenRoughnessMap:De,specularMap:Oe,specularColorMap:ke,specularIntensityMap:Ae,transmission:I,transmissionMap:je,thicknessMap:Me,gradientMap:Ne,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:Pe,alphaTest:Fe,alphaHash:L,combine:i.combine,mapUv:ne&&h(i.map.channel),aoMapUv:ae&&h(i.aoMap.channel),lightMapUv:oe&&h(i.lightMap.channel),bumpMapUv:se&&h(i.bumpMap.channel),normalMapUv:P&&h(i.normalMap.channel),displacementMapUv:ce&&h(i.displacementMap.channel),emissiveMapUv:le&&h(i.emissiveMap.channel),metalnessMapUv:ue&&h(i.metalnessMap.channel),roughnessMapUv:de&&h(i.roughnessMap.channel),anisotropyMapUv:ve&&h(i.anisotropyMap.channel),clearcoatMapUv:ye&&h(i.clearcoatMap.channel),clearcoatNormalMapUv:be&&h(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:xe&&h(i.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:Se&&h(i.diffuseRoughnessMap.channel),iridescenceMapUv:we&&h(i.iridescenceMap.channel),iridescenceThicknessMapUv:Te&&h(i.iridescenceThicknessMap.channel),sheenColorMapUv:Ee&&h(i.sheenColorMap.channel),sheenRoughnessMapUv:De&&h(i.sheenRoughnessMap.channel),specularMapUv:Oe&&h(i.specularMap.channel),specularColorMapUv:ke&&h(i.specularColorMap.channel),specularIntensityMapUv:Ae&&h(i.specularIntensityMap.channel),transmissionMapUv:je&&h(i.transmissionMap.channel),thicknessMapUv:Me&&h(i.thicknessMap.channel),alphaMapUv:Pe&&h(i.alphaMap.channel),vertexTangents:!!v.attributes.tangent&&(P||fe),vertexNormals:!!v.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!v.attributes.color&&v.attributes.color.itemSize===4,pointsUvs:f.isPoints===!0&&!!v.attributes.uv&&(ne||Pe),fog:!!_,useFog:i.fog===!0,fogExp2:!!_&&_.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||v.attributes.normal===void 0&&P===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:p,reversedDepthBuffer:ee,skinning:f.isSkinnedMesh===!0,hasPositionAttribute:v.attributes.position!==void 0,morphTargets:v.morphAttributes.position!==void 0,morphNormals:v.morphAttributes.normal!==void 0,morphColors:v.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numSunLights:s.sun.length,numDirLights:s.directional.length,numPointLights:s.point.length,numSpotLights:s.spot.length,numSpotLightMaps:s.spotLightMap.length,numRectAreaLights:s.rectArea.length,numHemiLights:s.hemi.length,numSunLightShadows:s.sunShadowMap.length,numDirLightShadows:s.directionalShadowMap.length,numPointLightShadows:s.pointShadowMap.length,numSpotLightShadows:s.spotShadowMap.length,numSpotLightShadowsWithMaps:s.numSpotLightShadowsWithMaps,numLightProbes:s.numLightProbes,numLightProbeGrids:g.filter(e=>e.texture!==null).length,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&u.length>0,shadowMapType:e.shadowMap.type,toneMapping:Le,decodeVideoTexture:ne&&i.map.isVideoTexture===!0&&a.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:le&&i.emissiveMap.isVideoTexture===!0&&a.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Ie&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Ie&&i.extensions.multiDraw===!0||M)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return R.vertexUv1s=l.has(1),R.vertexUv2s=l.has(2),R.vertexUv3s=l.has(3),l.clear(),R}function _(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(v(n,t),y(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function v(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapPMREM),e.push(t.envMapMaxLod),e.push(t.envMapSize),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.diffuseRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.numLightProbeGrids),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function y(e,t){s.disableAll(),t.instancing&&s.enable(0),t.instancingColor&&s.enable(1),t.instancingMorph&&s.enable(2),t.matcap&&s.enable(3),t.envMap&&s.enable(4),t.normalMapObjectSpace&&s.enable(5),t.normalMapTangentSpace&&s.enable(6),t.clearcoat&&s.enable(7),t.iridescence&&s.enable(8),t.alphaTest&&s.enable(9),t.vertexColors&&s.enable(10),t.vertexAlphas&&s.enable(11),t.vertexUv1s&&s.enable(12),t.vertexUv2s&&s.enable(13),t.vertexUv3s&&s.enable(14),t.vertexTangents&&s.enable(15),t.anisotropy&&s.enable(16),t.alphaHash&&s.enable(17),t.batching&&s.enable(18),t.dispersion&&s.enable(19),t.retroreflection&&s.enable(24),t.diffuseRoughness&&s.enable(25),t.batchingColor&&s.enable(20),t.gradientMap&&s.enable(21),t.packedNormalMap&&s.enable(22),t.vertexNormals&&s.enable(23),e.push(s.mask),s.disableAll(),t.fog&&s.enable(0),t.useFog&&s.enable(1),t.flatShading&&s.enable(2),t.logarithmicDepthBuffer&&s.enable(3),t.reversedDepthBuffer&&s.enable(4),t.skinning&&s.enable(5),t.morphTargets&&s.enable(6),t.morphNormals&&s.enable(7),t.morphColors&&s.enable(8),t.premultipliedAlpha&&s.enable(9),t.shadowMapEnabled&&s.enable(10),t.doubleSided&&s.enable(11),t.flipSided&&s.enable(12),t.useDepthPacking&&s.enable(13),t.dithering&&s.enable(14),t.transmission&&s.enable(15),t.sheen&&s.enable(16),t.opaque&&s.enable(17),t.pointsUvs&&s.enable(18),t.decodeVideoTexture&&s.enable(19),t.decodeVideoTextureEmissive&&s.enable(20),t.alphaToCoverage&&s.enable(21),t.numLightProbeGrids>0&&s.enable(22),t.hasPositionAttribute&&s.enable(23),e.push(s.mask)}function b(e){let t=m[e.type],n;if(t){let e=_n[t];n=z.clone(e.uniforms)}else n=e.uniforms;return n}function x(t,n){let r=f.get(n);return r===void 0?(r=new Ri(e,n,t,i),d.push(r),f.set(n,r)):++r.usedTimes,r}function S(e){if(--e.usedTimes===0){let t=d.indexOf(e);d[t]=d[d.length-1],d.pop(),f.delete(e.cacheKey),e.destroy()}}function C(e){c.remove(e)}function w(){c.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:b,acquireProgram:x,releaseProgram:S,releaseShaderCache:C,programs:d,dispose:w}}function Wi(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Gi(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Ki(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function qi(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||Gi),r.length>1&&r.sort(t||Ki),i.length>1&&i.sort(t||Ki)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function Ji(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new qi,e.set(t,[i])):n>=r.length?(i=new qi,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Yi(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new f,color:new K};break;case`SpotLight`:n={position:new f,direction:new f,color:new K,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new f,color:new K,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new f,skyColor:new K,groundColor:new K};break;case`RectAreaLight`:n={color:new K,position:new f,halfWidth:new f,halfHeight:new f}}return e[t.id]=n,n}}}function Xi(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new h};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new h};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new h,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Zi=0;function Qi(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function $i(e){let t=new Yi,n=Xi(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new f);let i=new f,a=new an,o=new an;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(Qi);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=J.LTC_FLOAT_1,r.rectAreaLTC2=J.LTC_FLOAT_2):(r.rectAreaLTC1=J.LTC_HALF_1,r.rectAreaLTC2=J.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=Zi++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function ea(e){let t=new $i(e),n=[],r=[],i=[];function a(e){u.camera=e,n.length=0,r.length=0,i.length=0}function o(e){e.isLightProbeGrid?i.push(e):n.push(e)}function s(e){r.push(e)}function c(){t.setup(n),i.sort((e,t)=>e.priority-t.priority||e.id-t.id)}function l(e){t.setupView(n,e)}let u={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:u,setupLights:c,setupLightsView:l,pushLight:o,pushShadow:s}}function ta(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new ea(e),t.set(n,[a])):r>=i.length?(a=new ea(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var na=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ra=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,ia=[new f(1,0,0),new f(-1,0,0),new f(0,1,0),new f(0,-1,0),new f(0,0,1),new f(0,0,-1)],aa=[new f(0,-1,0),new f(0,-1,0),new f(0,0,1),new f(0,0,-1),new f(0,-1,0),new f(0,-1,0)],oa=new an,sa=new f,ca=new f;function la(e,t,n){let r=new He,i=new h,a=new h,o=new ue,c=new T,l=new we,u={},d=n.maxTextureSize,f={0:1,1:0,2:2},p=new Ve({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new h},radius:{value:4}},vertexShader:na,fragmentShader:ra}),m=p.clone();m.defines.HORIZONTAL_PASS=1;let g=new se;g.setAttribute(`position`,new N(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new s(g,p),v=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let y=this.type;this.render=function(t,n,s){if(v.enabled===!1||v.autoUpdate===!1&&v.needsUpdate===!1||t.length===0)return;this.type===2&&(Ce(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let c=e.getRenderTarget(),l=e.getActiveCubeFace(),u=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=y!==this.type;p&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let c=0,l=t.length;c<l;c++){let l=t[c],u=l.shadow;if(u===void 0){Ce(`WebGLShadowMap:`,l,`has no shadow.`);continue}if(u.autoUpdate===!1&&u.needsUpdate===!1)continue;i.copy(u.mapSize);let m=u.getFrameExtents();i.multiply(m),a.copy(u.mapSize),(i.x>d||i.y>d)&&(i.x>d&&(a.x=Math.floor(d/m.x),i.x=a.x*m.x,u.mapSize.x=a.x),i.y>d&&(a.y=Math.floor(d/m.y),i.y=a.y*m.y,u.mapSize.y=a.y));let h=e.state.buffers.depth.getReversed();if(u.camera._reversedDepth=h,u.map===null||p===!0){if(u.map!==null&&(u.map.depthTexture!==null&&(u.map.depthTexture.dispose(),u.map.depthTexture=null),u.map.dispose()),this.type===3){if(l.isPointLight){Ce(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}u.map=new dt(i.x,i.y,{format:ke,type:yt,minFilter:de,magFilter:de,generateMipmaps:!1}),u.map.texture.name=l.name+`.shadowMap`,u.map.depthTexture=new Me(i.x,i.y,zt),u.map.depthTexture.name=l.name+`.shadowMapDepth`,u.map.depthTexture.format=k,u.map.depthTexture.compareFunction=null,u.map.depthTexture.minFilter=Ft,u.map.depthTexture.magFilter=Ft}else l.isPointLight?(u.map=new En(i.x),u.map.depthTexture=new C(i.x,ve)):(u.map=new dt(i.x,i.y),u.map.depthTexture=new Me(i.x,i.y,ve)),u.map.depthTexture.name=l.name+`.shadowMap`,u.map.depthTexture.format=k,this.type===1?(u.map.depthTexture.compareFunction=h?518:515,u.map.depthTexture.minFilter=de,u.map.depthTexture.magFilter=de):(u.map.depthTexture.compareFunction=null,u.map.depthTexture.minFilter=Ft,u.map.depthTexture.magFilter=Ft);u.camera.updateProjectionMatrix()}u.map.isWebGLCubeRenderTarget!==!0&&(u.map.width!==i.x||u.map.height!==i.y)&&u.map.setSize(i.x,i.y);let g=u.map.isWebGLCubeRenderTarget?6:u.getViewportCount();l.isPointLight!==!0&&u.updateMatrices(l,s);let _=u.camera.layers.mask&4294967294?u.camera.layers:s.layers;for(let t=0;t<g;t++){let i=u.getCamera(t);if(l.isPointLight){let e=u.camera,n=u.matrix,r=l.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),sa.setFromMatrixPosition(l.matrixWorld),e.position.copy(sa),ca.copy(e.position),ca.add(ia[t]),e.up.copy(aa[t]),e.lookAt(ca),e.updateMatrixWorld(),n.makeTranslation(-sa.x,-sa.y,-sa.z),oa.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),u._frustum.setFromProjectionMatrix(oa,e.coordinateSystem,e.reversedDepth)}if(u.map.isWebGLCubeRenderTarget)e.setRenderTarget(u.map,t),e.clear();else{t===0&&(e.setRenderTarget(u.map),e.clear());let n=u.getViewport(t);o.set(a.x*n.x,a.y*n.y,a.x*n.z,a.y*n.w),f.viewport(o)}r=u.getFrustum(t),S(n,s,i,l,_,this.type)}u.isPointLightShadow!==!0&&this.type===3&&b(u,s),u.needsUpdate=!1}y=this.type,v.needsUpdate=!1,e.setRenderTarget(c,l,u)};function b(n,r){let a=t.update(_);p.defines.VSM_SAMPLES!==n.blurSamples&&(p.defines.VSM_SAMPLES=n.blurSamples,m.defines.VSM_SAMPLES=n.blurSamples,p.needsUpdate=!0,m.needsUpdate=!0),n.mapPass===null?n.mapPass=new dt(i.x,i.y,{format:ke,type:yt}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),p.uniforms.shadow_pass.value=n.map.depthTexture,p.uniforms.resolution.value.set(n.map.width,n.map.height),p.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,p,_,null),m.uniforms.shadow_pass.value=n.mapPass.texture,m.uniforms.resolution.value.set(n.map.width,n.map.height),m.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,m,_,null)}function x(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?l:c,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=u[e];r===void 0&&(r={},u[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,w)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?f[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function S(n,i,a,o,s,c){if(n.visible===!1)return;if(n.layers.test(s)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&c===3)&&(!n.frustumCulled||n.intersectsFrustum(r))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),s=n.material;if(Array.isArray(s)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=s[u.materialIndex];if(d&&d.visible){let t=x(n,d,o,c);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(s.visible){let t=x(n,s,o,c);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let l=n.children;for(let e=0,t=l.length;e<t;e++)S(l[e],i,a,o,s,c)}function w(e){e.target.removeEventListener(`dispose`,w);for(let t in u){let n=u[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function ua(e,t){function n(){let t=!1,n=new ue,r=null,i=new ue(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?de(e.DEPTH_TEST):fe(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=Ne[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?de(e.STENCIL_TEST):fe(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c={},l=new WeakMap,u={},d={},f={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new K(0,0,0),T=0,E=!1,O=null,k=null,A=null,j=null,ee=null,te=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),M=!1,ne=0,re=e.getParameter(e.VERSION);re.indexOf(`WebGL`)===-1?re.indexOf(`OpenGL ES`)!==-1&&(ne=parseFloat(/^OpenGL ES (\d)/.exec(re)[1]),M=ne>=2):(ne=parseFloat(/^WebGL (\d)/.exec(re)[1]),M=ne>=1);let ie=null,N={},ae=e.getParameter(e.SCISSOR_BOX),oe=e.getParameter(e.VIEWPORT),se=new ue().fromArray(ae),P=new ue().fromArray(oe);function ce(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let le={};le[e.TEXTURE_2D]=ce(e.TEXTURE_2D,e.TEXTURE_2D,1),le[e.TEXTURE_CUBE_MAP]=ce(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),le[e.TEXTURE_2D_ARRAY]=ce(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),le[e.TEXTURE_3D]=ce(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),de(e.DEPTH_TEST),o.setFunc(3),ve(!1),ye(1),de(e.CULL_FACE),F(0);function de(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function fe(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function pe(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function me(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function he(t){return h!==t&&(e.useProgram(t),h=t,!0)}let ge={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};ge[103]=e.MIN,ge[104]=e.MAX;let _e={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function F(t,n,r,i,a,o,s,c,l,u){if(t===0)g===!0&&(fe(e.BLEND),g=!1);else if(g===!1&&(de(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:D(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:D(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:D(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:D(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}}else a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(ge[n],ge[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(_e[r],_e[i],_e[o],_e[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function I(t,n){t.side===2?fe(e.CULL_FACE):de(e.CULL_FACE);let r=t.side===1;n&&(r=!r),ve(r),t.blending===1&&t.transparent===!1?F(0):F(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),xe(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?de(e.SAMPLE_ALPHA_TO_COVERAGE):fe(e.SAMPLE_ALPHA_TO_COVERAGE)}function ve(t){O!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),O=t)}function ye(t){t===0?fe(e.CULL_FACE):(de(e.CULL_FACE),t!==k&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),k=t}function be(t){t!==A&&(M&&e.lineWidth(t),A=t)}function xe(t,n,r){t?(de(e.POLYGON_OFFSET_FILL),(j!==n||ee!==r)&&(j=n,ee=r,o.getReversed()&&(n=-n,r=-r),e.polygonOffset(n,r))):fe(e.POLYGON_OFFSET_FILL)}function Se(t){t?de(e.SCISSOR_TEST):fe(e.SCISSOR_TEST)}function Ce(t){t===void 0&&(t=e.TEXTURE0+te-1),ie!==t&&(e.activeTexture(t),ie=t)}function we(t,n,r){r===void 0&&(r=ie===null?e.TEXTURE0+te-1:ie);let i=N[r];i===void 0&&(i={type:void 0,texture:void 0},N[r]=i),(i.type!==t||i.texture!==n)&&(ie!==r&&(e.activeTexture(r),ie=r),e.bindTexture(t,n||le[t]),i.type=t,i.texture=n)}function Te(){let t=N[ie];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Ee(){try{e.compressedTexImage2D(...arguments)}catch(e){D(`WebGLState:`,e)}}function De(){try{e.compressedTexImage3D(...arguments)}catch(e){D(`WebGLState:`,e)}}function Oe(){try{e.texSubImage2D(...arguments)}catch(e){D(`WebGLState:`,e)}}function ke(){try{e.texSubImage3D(...arguments)}catch(e){D(`WebGLState:`,e)}}function Ae(){try{e.compressedTexSubImage2D(...arguments)}catch(e){D(`WebGLState:`,e)}}function je(){try{e.compressedTexSubImage3D(...arguments)}catch(e){D(`WebGLState:`,e)}}function Me(){try{e.texStorage2D(...arguments)}catch(e){D(`WebGLState:`,e)}}function Pe(){try{e.texStorage3D(...arguments)}catch(e){D(`WebGLState:`,e)}}function Fe(){try{e.texImage2D(...arguments)}catch(e){D(`WebGLState:`,e)}}function L(){try{e.texImage3D(...arguments)}catch(e){D(`WebGLState:`,e)}}function Ie(t){return d[t]===void 0?e.getParameter(t):d[t]}function Le(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function Re(t){se.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),se.copy(t))}function R(t){P.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),P.copy(t))}function ze(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),e.uniformBlockBinding(n,i,i),r.set(t,i))}function z(t,n,r){let i=l.get(n).get(t);c[i]!==r&&(e.bindBufferBase(e.UNIFORM_BUFFER,i,r),c[i]=r)}function B(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},ie=null,N={},f={},c={},p=new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new K(0,0,0),T=0,E=!1,O=null,k=null,A=null,j=null,ee=null,se.set(0,0,e.canvas.width,e.canvas.height),P.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:de,disable:fe,bindFramebuffer:pe,drawBuffers:me,useProgram:he,setBlending:F,setMaterial:I,setFlipSided:ve,setCullFace:ye,setLineWidth:be,setPolygonOffset:xe,setScissorTest:Se,activeTexture:Ce,bindTexture:we,unbindTexture:Te,compressedTexImage2D:Ee,compressedTexImage3D:De,texImage2D:Fe,texImage3D:L,pixelStorei:Le,getParameter:Ie,updateUBOMapping:ze,uniformBlockBinding:z,texStorage2D:Me,texStorage3D:Pe,texSubImage2D:Oe,texSubImage3D:ke,compressedTexSubImage2D:Ae,compressedTexSubImage3D:je,scissor:Re,viewport:R,reset:B}}function da(e,t,n,r,o,s,c){let l=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,u=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),d=new h,f=new WeakMap,p=new Set,m,g=new WeakMap,_=new Set,y=new FinalizationRegistry(e=>_.delete(e)),b=!1;try{b=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function x(e,t){return b?new OffscreenCanvas(e,t):v(`canvas`)}function S(e,t,n){let r=1,i=Be(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);m===void 0&&(m=x(n,a));let o=t?x(n,a):m;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),Ce(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&Ce(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function C(e){return e.generateMipmaps}function w(t){e.generateMipmap(t)}function T(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function E(n,r,i,o,s,c=!1){if(n!==null){if(e[n]!==void 0)return e[n];Ce(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let l;o&&(l=t.get(`EXT_texture_norm16`),l||Ce(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let u=r;if(r===e.RED&&(i===e.FLOAT&&(u=e.R32F),i===e.HALF_FLOAT&&(u=e.R16F),i===e.UNSIGNED_BYTE&&(u=e.R8),i===e.UNSIGNED_SHORT&&l&&(u=l.R16_EXT),i===e.SHORT&&l&&(u=l.R16_SNORM_EXT)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(u=e.R8UI),i===e.UNSIGNED_SHORT&&(u=e.R16UI),i===e.UNSIGNED_INT&&(u=e.R32UI),i===e.BYTE&&(u=e.R8I),i===e.SHORT&&(u=e.R16I),i===e.INT&&(u=e.R32I)),r===e.RG&&(i===e.FLOAT&&(u=e.RG32F),i===e.HALF_FLOAT&&(u=e.RG16F),i===e.UNSIGNED_BYTE&&(u=e.RG8),i===e.UNSIGNED_SHORT&&l&&(u=l.RG16_EXT),i===e.SHORT&&l&&(u=l.RG16_SNORM_EXT)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(u=e.RG8UI),i===e.UNSIGNED_SHORT&&(u=e.RG16UI),i===e.UNSIGNED_INT&&(u=e.RG32UI),i===e.BYTE&&(u=e.RG8I),i===e.SHORT&&(u=e.RG16I),i===e.INT&&(u=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(u=e.RGB8UI),i===e.UNSIGNED_SHORT&&(u=e.RGB16UI),i===e.UNSIGNED_INT&&(u=e.RGB32UI),i===e.BYTE&&(u=e.RGB8I),i===e.SHORT&&(u=e.RGB16I),i===e.INT&&(u=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(u=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(u=e.RGBA16UI),i===e.UNSIGNED_INT&&(u=e.RGBA32UI),i===e.BYTE&&(u=e.RGBA8I),i===e.SHORT&&(u=e.RGBA16I),i===e.INT&&(u=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_SHORT&&l&&(u=l.RGB16_EXT),i===e.SHORT&&l&&(u=l.RGB16_SNORM_EXT),i===e.UNSIGNED_INT_5_9_9_9_REV&&(u=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(u=e.R11F_G11F_B10F)),r===e.RGBA){let t=c?oe:a.getTransfer(s);i===e.FLOAT&&(u=e.RGBA32F),i===e.HALF_FLOAT&&(u=e.RGBA16F),i===e.UNSIGNED_BYTE&&(u=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT&&l&&(u=l.RGBA16_EXT),i===e.SHORT&&l&&(u=l.RGBA16_SNORM_EXT),i===e.UNSIGNED_SHORT_4_4_4_4&&(u=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(u=e.RGB5_A1)}return(u===e.R16F||u===e.R32F||u===e.RG16F||u===e.RG32F||u===e.RGBA16F||u===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),u}function O(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,Ce(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function k(e,t){return C(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function A(e){let t=new WeakRef(e);r.get(e).__ref=t,_.add(t),y.register(e,t,t)}function ee(e){let t=r.get(e).__ref;t!==void 0&&(_.delete(t),y.unregister(t))}function te(e){re(e.target)}function ne(e){ie(e.target)}function re(e){e.removeEventListener(`dispose`,te),ee(e),ae(e),e.isVideoTexture&&f.delete(e),e.isHTMLTexture&&p.delete(e)}function ie(e){e.removeEventListener(`dispose`,ne),ee(e),P(e)}function N(){for(let e of _){let t=e.deref();t!==void 0&&(t.isRenderTarget===!0?ie(t):re(t))}_.clear(),p.clear()}function ae(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=g.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&se(e),Object.keys(i).length===0&&g.delete(n)}r.remove(e)}function se(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=g.get(i);delete a[n.__cacheKey],c.memory.textures--}function P(t){let n=r.get(t);n.__depthDisposeCallback&&n.__depthDisposeCallback();let i=t.depthTexture;if(i&&i.renderTarget===t&&re(i),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let a=t.textures;for(let t=0,n=a.length;t<n;t++){let n=r.get(a[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),c.memory.textures--),r.remove(a[t])}r.remove(t)}let ce=0;function le(){ce=0}function ue(){return ce}function fe(e){ce=e}function pe(){let e=ce;return e>=o.maxTextures&&Ce(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+o.maxTextures),ce+=1,e}function me(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.mipmapsAutoUpdate),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function he(t,i){let a=r.get(t);if(t.isVideoTexture&&B(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)Ce(`WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)Ce(`WebGLRenderer: Texture marked for update but image is incomplete`);else{De(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function F(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?De(a,t,i):(t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null),n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i))}function I(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?De(a,t,i):n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function ve(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?Oe(a,t,i):n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let ye={[L]:e.REPEAT,[ge]:e.CLAMP_TO_EDGE,[M]:e.MIRRORED_REPEAT},be={[Ft]:e.NEAREST,[Ie]:e.NEAREST_MIPMAP_NEAREST,[j]:e.NEAREST_MIPMAP_LINEAR,[de]:e.LINEAR,[i]:e.LINEAR_MIPMAP_NEAREST,[ht]:e.LINEAR_MIPMAP_LINEAR},xe={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function Se(n,i){if(i.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(i.magFilter===1006||i.magFilter===1007||i.magFilter===1005||i.magFilter===1008||i.minFilter===1006||i.minFilter===1007||i.minFilter===1005||i.minFilter===1008)&&Ce(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,ye[i.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,ye[i.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,ye[i.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,be[i.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,be[i.minFilter]),i.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,xe[i.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(i.magFilter===1003||i.minFilter!==1005&&i.minFilter!==1008||i.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(i.anisotropy>1||r.get(i).__currentAnisotropy){let a=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,a.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(i.anisotropy,o.getMaxAnisotropy())),r.get(i).__currentAnisotropy=i.anisotropy}}}function we(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,te),A(n));let i=n.source,a=g.get(i);a===void 0&&(a={},g.set(i,a));let o=me(n);if(o!==t.__cacheKey){a[o]===void 0&&(a[o]={texture:e.createTexture(),usedTimes:0},c.memory.textures++,r=!0),a[o].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&se(n)),t.__cacheKey=o,t.__webglTexture=a[o].texture}return r}function Te(e,t,n){return Math.floor(Math.floor(e/n)/t)}function Ee(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=Te(n.start,r.width,4),c=Te(t.start,r.width,4);n.start<=i+1&&a===c&&Te(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=n.getParameter(e.UNPACK_ROW_LENGTH),l=n.getParameter(e.UNPACK_SKIP_PIXELS),u=n.getParameter(e.UNPACK_SKIP_ROWS);n.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;n.pixelStorei(e.UNPACK_SKIP_PIXELS,u),n.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),n.pixelStorei(e.UNPACK_ROW_LENGTH,c),n.pixelStorei(e.UNPACK_SKIP_PIXELS,l),n.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function De(t,i,c){let l=e.TEXTURE_2D;(i.isDataArrayTexture||i.isCompressedArrayTexture)&&(l=e.TEXTURE_2D_ARRAY),i.isData3DTexture&&(l=e.TEXTURE_3D);let u=we(t,i),d=i.source;n.bindTexture(l,t.__webglTexture,e.TEXTURE0+c);let f=r.get(d);if(d.version!==f.__version||u===!0){if(n.activeTexture(e.TEXTURE0+c),!(typeof ImageBitmap<`u`&&i.image instanceof ImageBitmap)){let t=a.getPrimaries(a.workingColorSpace),r=i.colorSpace===``?null:a.getPrimaries(i.colorSpace),o=i.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,i.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,i.premultiplyAlpha),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,o)}n.pixelStorei(e.UNPACK_ALIGNMENT,i.unpackAlignment);let t=S(i.image,!1,o.maxTextureSize);t=V(i,t);let r=s.convert(i.format,i.colorSpace),m=s.convert(i.type),h=E(i.internalFormat,r,m,i.normalized,i.colorSpace,i.isVideoTexture);Se(l,i);let g,_=i.mipmaps,v=i.isVideoTexture!==!0,y=f.__version===void 0||u===!0,b=d.dataReady,x=k(i,t);if(i.isDepthTexture)h=O(i.format===Fe,i.type),y&&(v?n.texStorage2D(e.TEXTURE_2D,1,h,t.width,t.height):n.texImage2D(e.TEXTURE_2D,0,h,t.width,t.height,0,r,m,null));else if(i.isDataTexture){if(_.length>0){v&&y&&n.texStorage2D(e.TEXTURE_2D,x,h,_[0].width,_[0].height);for(let t=0,i=_.length;t<i;t++)g=_[t],v?b&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,g.width,g.height,r,m,g.data):n.texImage2D(e.TEXTURE_2D,t,h,g.width,g.height,0,r,m,g.data);i.generateMipmaps=!1}else v?(y&&n.texStorage2D(e.TEXTURE_2D,x,h,t.width,t.height),b&&Ee(i,t,r,m)):n.texImage2D(e.TEXTURE_2D,0,h,t.width,t.height,0,r,m,t.data)}else if(i.isCompressedTexture){if(i.isCompressedArrayTexture){v&&y&&n.texStorage3D(e.TEXTURE_2D_ARRAY,x,h,_[0].width,_[0].height,t.depth);for(let a=0,o=_.length;a<o;a++)if(g=_[a],i.format!==1023){if(r!==null){if(v){if(b){if(i.layerUpdates.size>0){let t=_e(g.width,g.height,i.format,i.type);for(let o of i.layerUpdates){let i=g.data.subarray(o*t/g.data.BYTES_PER_ELEMENT,(o+1)*t/g.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,a,0,0,o,g.width,g.height,1,r,i)}}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,a,0,0,0,g.width,g.height,t.depth,r,g.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,a,h,g.width,g.height,t.depth,0,g.data,0,0)}else Ce(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else v?b&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,a,0,0,0,g.width,g.height,t.depth,r,m,g.data):n.texImage3D(e.TEXTURE_2D_ARRAY,a,h,g.width,g.height,t.depth,0,r,m,g.data);i.layerUpdates.size>0&&i.clearLayerUpdates()}else{v&&y&&n.texStorage2D(e.TEXTURE_2D,x,h,_[0].width,_[0].height);for(let t=0,a=_.length;t<a;t++)g=_[t],i.format===1023?v?b&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,g.width,g.height,r,m,g.data):n.texImage2D(e.TEXTURE_2D,t,h,g.width,g.height,0,r,m,g.data):r===null?Ce(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):v?b&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,g.width,g.height,r,g.data):n.compressedTexImage2D(e.TEXTURE_2D,t,h,g.width,g.height,0,g.data)}}else if(i.isDataArrayTexture){if(v){if(y&&n.texStorage3D(e.TEXTURE_2D_ARRAY,x,h,t.width,t.height,t.depth),b){if(i.layerUpdates.size>0){let a=_e(t.width,t.height,i.format,i.type);for(let o of i.layerUpdates){let i=t.data.subarray(o*a/t.data.BYTES_PER_ELEMENT,(o+1)*a/t.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,o,t.width,t.height,1,r,m,i)}i.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,t.width,t.height,t.depth,r,m,t.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,h,t.width,t.height,t.depth,0,r,m,t.data)}else if(i.isData3DTexture)v?(y&&n.texStorage3D(e.TEXTURE_3D,x,h,t.width,t.height,t.depth),b&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,t.width,t.height,t.depth,r,m,t.data)):n.texImage3D(e.TEXTURE_3D,0,h,t.width,t.height,t.depth,0,r,m,t.data);else if(i.isFramebufferTexture){if(y){if(v)n.texStorage2D(e.TEXTURE_2D,x,h,t.width,t.height);else{let i=t.width,a=t.height;for(let t=0;t<x;t++)n.texImage2D(e.TEXTURE_2D,t,h,i,a,0,r,m,null),i>>=1,a>>=1}}}else if(i.isHTMLTexture){if(`texElementImage2D`in e){let n=e.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),t.parentNode!==n){n.appendChild(t),p.add(i),n.onpaint=e=>{let t=e.changedElements;for(let e of p)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(e.texElementImage2D.length===3)e.texElementImage2D(e.TEXTURE_2D,e.RGBA8,t);else{let n=e.RGBA,r=e.RGBA,i=e.UNSIGNED_BYTE;e.texElementImage2D(e.TEXTURE_2D,0,n,r,i,t)}e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE)}}else if(_.length>0){if(v&&y){let t=Be(_[0]);n.texStorage2D(e.TEXTURE_2D,x,h,t.width,t.height)}for(let t=0,i=_.length;t<i;t++)g=_[t],v?b&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,r,m,g):n.texImage2D(e.TEXTURE_2D,t,h,r,m,g);i.generateMipmaps=!1}else if(v){if(y){let r=Be(t);n.texStorage2D(e.TEXTURE_2D,x,h,r.width,r.height)}b&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,r,m,t)}else n.texImage2D(e.TEXTURE_2D,0,h,r,m,t);C(i)&&i.mipmapsAutoUpdate===!0&&w(l),f.__version=d.version,i.onUpdate&&i.onUpdate(i)}t.__version=i.version}function Oe(t,i,c){if(i.image.length!==6)return;let l=we(t,i),u=i.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+c);let d=r.get(u);if(u.version!==d.__version||l===!0){n.activeTexture(e.TEXTURE0+c);let t=a.getPrimaries(a.workingColorSpace),r=i.colorSpace===``?null:a.getPrimaries(i.colorSpace),f=i.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;n.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,i.flipY),n.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,i.premultiplyAlpha),n.pixelStorei(e.UNPACK_ALIGNMENT,i.unpackAlignment),n.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,f);let p=i.isCompressedTexture||i.image[0].isCompressedTexture,m=i.image[0]&&i.image[0].isDataTexture,h=[];for(let e=0;e<6;e++)!p&&!m?h[e]=S(i.image[e],!0,o.maxCubemapSize):h[e]=m?i.image[e].image:i.image[e],h[e]=V(i,h[e]);let g=h[0],_=s.convert(i.format,i.colorSpace),v=s.convert(i.type),y=E(i.internalFormat,_,v,i.normalized,i.colorSpace),b=i.isVideoTexture!==!0,x=d.__version===void 0||l===!0,T=u.dataReady,D=k(i,g);Se(e.TEXTURE_CUBE_MAP,i);let A;if(i.isDepthTexture){if(y=O(i.format===Fe,i.type),x){if(b)n.texStorage2D(e.TEXTURE_CUBE_MAP,1,y,g.width,g.height);else for(let t=0;t<6;t++)n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,y,g.width,g.height,0,_,v,null)}}else if(p){b&&x&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,y,g.width,g.height);for(let t=0;t<6;t++){A=h[t].mipmaps;for(let r=0;r<A.length;r++){let a=A[r];i.format===1023?b?T&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,a.width,a.height,_,v,a.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,y,a.width,a.height,0,_,v,a.data):_===null?Ce(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):b?T&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,a.width,a.height,_,a.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,y,a.width,a.height,0,a.data)}}}else{if(A=i.mipmaps,b&&x){A.length>0&&D++;let t=Be(h[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,y,t.width,t.height)}for(let t=0;t<6;t++)if(m){b?T&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,h[t].width,h[t].height,_,v,h[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,y,h[t].width,h[t].height,0,_,v,h[t].data);for(let r=0;r<A.length;r++){let i=A[r].image[t].image;b?T&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,_,v,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,y,i.width,i.height,0,_,v,i.data)}}else{b?T&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,_,v,h[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,y,_,v,h[t]);for(let r=0;r<A.length;r++){let i=A[r];b?T&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,_,v,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,y,_,v,i.image[t])}}}C(i)&&i.mipmapsAutoUpdate===!0&&w(e.TEXTURE_CUBE_MAP),d.__version=u.version,i.onUpdate&&i.onUpdate(i)}t.__version=i.version}function ke(t,i,a,o,c,u){let d=s.convert(a.format,a.colorSpace),f=s.convert(a.type),p=E(a.internalFormat,d,f,a.normalized,a.colorSpace),m=r.get(i),h=r.get(a);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);c===e.TEXTURE_3D||c===e.TEXTURE_2D_ARRAY?n.texImage3D(c,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(c,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),z(i)?l.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,o,c,h.__webglTexture,0,ze(i)):(c===e.TEXTURE_2D||c>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&c<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,o,c,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function Ae(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=O(n.stencilBuffer,a),s=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;z(n)?l.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ze(n),o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,ze(n),o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,s,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let a=t[i],o=s.convert(a.format,a.colorSpace),c=s.convert(a.type),u=E(a.internalFormat,o,c,a.normalized,a.colorSpace);z(n)?l.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,ze(n),u,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,ze(n),u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function je(t,i,a){let o=i.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let s=r.get(i.depthTexture);s.__renderTarget=i;let c=o?i.depthTexture.image[0]:i.depthTexture.image;s.__webglTexture&&c.width===i.width&&c.height===i.height||(c.width=i.width,c.height=i.height,i.depthTexture.needsUpdate=!0),o?ve(i.depthTexture,0):he(i.depthTexture,0);let u=s.__webglTexture,d=ze(i),f=o?e.TEXTURE_CUBE_MAP_POSITIVE_X+a:e.TEXTURE_2D,p=i.depthTexture.format===1027?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(i.depthTexture.format===1026)z(i)?l.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else if(i.depthTexture.format===1027)z(i)?l.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,p,f,u,0,d):e.framebufferTexture2D(e.FRAMEBUFFER,p,f,u,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function Me(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)for(let e=0;e<6;e++)je(i.__webglFramebuffer[e],t,e);else t.texture.mipmaps.length>0?je(i.__webglFramebuffer[0],t,0):je(i.__webglFramebuffer,t,0)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),Ae(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else if(t.texture.mipmaps.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),Ae(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}n.bindFramebuffer(e.FRAMEBUFFER,null)}function Ne(t,n,i){let a=r.get(t);n!==void 0&&ke(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&Me(t)}function Pe(t){let i=t.texture,a=r.get(t),o=r.get(i);t.addEventListener(`dispose`,ne),A(t);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(o.__webglTexture===void 0&&(o.__webglTexture=e.createTexture()),o.__version=i.version,c.memory.textures++),u){a.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps.length>0){a.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)a.__webglFramebuffer[t][n]=e.createFramebuffer()}else a.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps.length>0){a.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)a.__webglFramebuffer[t]=e.createFramebuffer()}else a.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),c.memory.textures++)}if(t.samples>0&&z(t)===!1){a.__webglMultisampledFramebuffer=e.createFramebuffer(),a.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,a.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];a.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,a.__webglColorRenderbuffer[n]);let i=s.convert(r.format,r.colorSpace),o=s.convert(r.type),c=E(r.internalFormat,i,o,r.normalized,r.colorSpace,t.isXRRenderTarget===!0),u=ze(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,a.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(a.__webglDepthRenderbuffer=e.createRenderbuffer(),Ae(a.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,o.__webglTexture),Se(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)ke(a.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else ke(a.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);C(i)?w(e.TEXTURE_CUBE_MAP):i.mipmaps.length>0&&e.texParameteri(e.TEXTURE_CUBE_MAP,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}else if(d){for(let i=0,o=l.length;i<o;i++){let o=l[i],s=r.get(o),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,s.__webglTexture),Se(c,o),ke(a.__webglFramebuffer,t,o,e.COLOR_ATTACHMENT0+i,c,0),C(o)&&w(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,o.__webglTexture),Se(r,i),i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)ke(a.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else ke(a.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);C(i)?w(r):i.mipmaps.length>0&&e.texParameteri(r,e.TEXTURE_MAX_LEVEL,i.mipmaps.length-1),n.unbindTexture()}t.depthBuffer&&Me(t)}function Le(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(C(a)&&a.mipmapsAutoUpdate===!0){let t=T(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),w(t),n.unbindTexture()}}}let Re=[];function R(t){if(t.samples>0){if(z(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,c=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,l=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,l.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,l.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,l.__webglMultisampledFramebuffer),t.texture.mipmaps.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,l.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,l.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,l.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),u===!0&&(Re.length=0,Re.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&Re.push(c),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,Re))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,l.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,l.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,l.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,l.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.storeMultisampledDepthBuffer===!1&&u){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function ze(e){return Math.min(o.maxSamples,e.samples)}function z(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function B(e){let t=c.render.frame;f.get(e)!==t&&(f.set(e,t),e.update())}function V(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(a.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&Ce(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):D(`WebGLTextures: Unsupported texture color space:`,n)),t}function Be(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(d.width=e.naturalWidth||e.width,d.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(d.width=e.displayWidth,d.height=e.displayHeight):(d.width=e.width,d.height=e.height),d}this.allocateTextureUnit=pe,this.resetTextureUnits=le,this.getTextureUnits=ue,this.setTextureUnits=fe,this.setTexture2D=he,this.setTexture2DArray=F,this.setTexture3D=I,this.setTextureCube=ve,this.rebindTextures=Ne,this.setupRenderTarget=Pe,this.updateRenderTargetMipmap=Le,this.updateMultisampleRenderTarget=R,this.setupDepthRenderbuffer=Me,this.setupFrameBufferTexture=ke,this.useMultisampledRTT=z,this.dispose=N}function fa(e,t){function n(n,r=``){let i,o=a.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(o===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return o===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return o===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return o===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return o===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return o===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return o===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return o===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return o===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return o===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return o===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return o===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return o===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return o===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return o===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return o===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return o===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return o===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var pa=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ma=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,ha=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new $e(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Ve({vertexShader:pa,fragmentShader:ma,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new s(new Wt(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ga=class extends e{constructor(e,n){super();let r=this,i=null,a=1,o=null,s=`local-floor`,c=1,l=null,u=null,d=null,f=null,p=null,m=null,g=typeof XRWebGLBinding<`u`,_=new ha,v={},y=n.getContextAttributes(),b=null,x=null,S=[],C=[],w=new h,T=null,E=null,D=new t;D.viewport=new ue;let O=new t;O.viewport=new ue;let A=[D,O],j=new le,ee=null,te=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=S[e];return t===void 0&&(t=new ae,S[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=S[e];return t===void 0&&(t=new ae,S[e]=t),t.getGripSpace()},this.getHand=function(e){let t=S[e];return t===void 0&&(t=new ae,S[e]=t),t.getHandSpace()};function M(e){let t=C.indexOf(e.inputSource);if(t===-1)return;let n=S[t];n!==void 0&&(n.update(e.inputSource,e.frame,l||o),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ne(){i.removeEventListener(`select`,M),i.removeEventListener(`selectstart`,M),i.removeEventListener(`selectend`,M),i.removeEventListener(`squeeze`,M),i.removeEventListener(`squeezestart`,M),i.removeEventListener(`squeezeend`,M),i.removeEventListener(`end`,ne),i.removeEventListener(`inputsourceschange`,re);for(let e=0;e<S.length;e++){let t=C[e];t!==null&&(C[e]=null,S[e].disconnect(t))}ee=null,te=null,_.reset();for(let e in v)delete v[e];if(e.setRenderTarget(b),p=null,f=null,d=null,i=null,x=null,P.stop(),r.isPresenting=!1,e.setPixelRatio(T),e.setSize(w.width,w.height,!1),E!==null){let e=E.camera;e.fov=E.fov,e.zoom=E.zoom,e.updateProjectionMatrix(),E=null}r.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){a=e,r.isPresenting===!0&&Ce(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){s=e,r.isPresenting===!0&&Ce(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(e){l=e},this.getBaseLayer=function(){return f===null?p:f},this.getBinding=function(){return d===null&&g&&(d=new XRWebGLBinding(i,n)),d},this.getFrame=function(){return m},this.getSession=function(){return i},this.setSession=async function(t){if(i=t,i!==null){if(b=e.getRenderTarget(),i.addEventListener(`select`,M),i.addEventListener(`selectstart`,M),i.addEventListener(`selectend`,M),i.addEventListener(`squeeze`,M),i.addEventListener(`squeezestart`,M),i.addEventListener(`squeezeend`,M),i.addEventListener(`end`,ne),i.addEventListener(`inputsourceschange`,re),y.xrCompatible!==!0&&await n.makeXRCompatible(),T=e.getPixelRatio(),e.getSize(w),g&&`createProjectionLayer`in XRWebGLBinding.prototype){let t=null,r=null,o=null;y.depth&&(o=y.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,t=y.stencil?Fe:k,r=y.stencil?We:ve);let s={colorFormat:n.RGBA8,depthFormat:o,scaleFactor:a};d=this.getBinding(),f=d.createProjectionLayer(s),i.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),x=new dt(f.textureWidth,f.textureHeight,{format:jt,type:Xt,depthTexture:new Me(f.textureWidth,f.textureHeight,r,void 0,void 0,void 0,void 0,void 0,void 0,t),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{let t={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:a};p=new XRWebGLLayer(i,n,t),i.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),x=new dt(p.framebufferWidth,p.framebufferHeight,{format:jt,type:Xt,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await i.requestReferenceSpace(s),P.setContext(i),P.start(),r.isPresenting=!0,r.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function re(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=C.indexOf(n);r>=0&&(C[r]=null,S[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=C.indexOf(n);if(r===-1){for(let e=0;e<S.length;e++)if(e>=C.length){C.push(n),r=e;break}else if(C[e]===null){C[e]=n,r=e;break}if(r===-1)break}let i=S[r];i&&i.connect(n)}}function ie(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(i===null)return;let t=e.near,n=e.far;_.texture!==null&&(_.depthNear>0&&(t=_.depthNear),_.depthFar>0&&(n=_.depthFar)),j.near=O.near=D.near=t,j.far=O.far=D.far=n,(ee!==j.near||te!==j.far)&&(i.updateRenderState({depthNear:j.near,depthFar:j.far}),ee=j.near,te=j.far),j.layers.mask=e.layers.mask|6,D.layers.mask=j.layers.mask&-5,O.layers.mask=j.layers.mask&-3;let r=e.parent,a=j.cameras;ie(j,r);for(let e=0;e<a.length;e++)ie(a[e],r);j.projectionMatrix.copy(D.projectionMatrix),j.projectionMatrixInverse.copy(D.projectionMatrixInverse),E===null&&e.isPerspectiveCamera&&(E={camera:e,fov:e.fov,zoom:e.zoom}),N(e,j,r)};function N(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=_t*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return j},this.getFoveation=function(){if(f!==null||p!==null)return c},this.setFoveation=function(e){c=e,f!==null&&(f.fixedFoveation=e),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=e)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(j)},this.getCameraTexture=function(e){return v[e]};let oe=null;function se(n,a){if(u=a.getViewerPose(l||o),m=a,u!==null){let n=u.views;p!==null&&(e.setRenderTargetFramebuffer(x,p.framebuffer),e.setRenderTarget(x));let a=!1;n.length!==j.cameras.length&&(j.cameras.length=0,a=!0);for(let r=0;r<n.length;r++){let i=n[r],o=null;if(p!==null)o=p.getViewport(i);else{let t=d.getViewSubImage(f,i);o=t.viewport,r===0&&(e.setRenderTargetTextures(x,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(x))}let s=A[r];s===void 0&&(s=new t,s.layers.enable(r),s.viewport=new ue,A[r]=s),s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.quaternion,s.scale),s.projectionMatrix.fromArray(i.projectionMatrix),s.projectionMatrixInverse.copy(s.projectionMatrix).invert(),s.viewport.set(o.x,o.y,o.width,o.height),r===0&&(j.matrix.copy(s.matrix),j.matrix.decompose(j.position,j.quaternion,j.scale)),a===!0&&j.cameras.push(s)}let o=i.enabledFeatures;if(o&&o.includes(`depth-sensing`)&&i.depthUsage==`gpu-optimized`&&g){d=r.getBinding();let e=d.getDepthInformation(n[0]);e&&e.isValid&&e.texture&&_.init(e,i.renderState)}if(o&&o.includes(`camera-access`)&&g){e.state.unbindTexture(),d=r.getBinding();for(let e=0;e<n.length;e++){let t=n[e].camera;if(t){let e=v[t];e||(e=new $e,v[t]=e);let n=d.getCameraImage(t);e.sourceTexture=n}}}}for(let e=0;e<S.length;e++){let t=C[e],n=S[e];t!==null&&n!==void 0&&n.update(t,a,l||o)}oe&&oe(n,a),a.detectedPlanes&&r.dispatchEvent({type:`planesdetected`,data:a}),m=null}let P=new hn;P.setAnimationLoop(se),this.setAnimationLoop=function(e){oe=e},this.dispose=function(){}}},_a=new an,va=new F;va.set(-1,0,0,0,1,0,0,0,1);function ya(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,rn(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(_a.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(va),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.diffuseRoughness>0&&(e.diffuseRoughness.value=t.diffuseRoughness,t.diffuseRoughnessMap&&(e.diffuseRoughnessMap.value=t.diffuseRoughnessMap,n(t.diffuseRoughnessMap,e.diffuseRoughnessMapTransform))),t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessMinimum,e.iridescenceThicknessMaximum.value=t.iridescenceThicknessMaximum,t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function ba(e,t,n,r){let i={},a={};function o(e,t){let n=t.program;r.uniformBlockBinding(e,n,i[e.id])}function s(e,n){let o=i[e.id];o===void 0&&(m(e),o=c(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let u=t.render.frame;a[e.id]!==u&&(l(e),a[e.id]=u)}function c(t){let n=e.createBuffer(),r=t.__size,i=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,n),e.bufferData(e.UNIFORM_BUFFER,r,i),e.bindBuffer(e.UNIFORM_BUFFER,null),n}function l(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)u(t[n],e,n,a);else u(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function u(t,n,r,i){if(f(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=h(i,!0);d(i,t.__data,e),e+=a.storage/Float32Array.BYTES_PER_ELEMENT}}else d(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function d(e,t,n){typeof e==`number`||typeof e==`boolean`?t[n]=e:e.isMatrix3?(t[n]=e.elements[0],t[n+1]=e.elements[1],t[n+2]=e.elements[2],t[n+3]=0,t[n+4]=e.elements[3],t[n+5]=e.elements[4],t[n+6]=e.elements[5],t[n+7]=0,t[n+8]=e.elements[6],t[n+9]=e.elements[7],t[n+10]=e.elements[8],t[n+11]=0):ArrayBuffer.isView(e)?t.set(e.subarray(0,t.length-n),n):e.toArray(t,n)}function f(e,t,n,r){let i=e.value,a=t+`_`+n;if(Array.isArray(i)){r[a]===void 0&&(r[a]=[]);let e=r[a],t=!1;for(let n=0;n<i.length;n++)p(i[n],e,n)===!0&&(t=!0);return t}return p(i,r,a)}function p(e,t,n){if(t[n]===void 0)return t[n]=typeof e==`number`||typeof e==`boolean`?e:ArrayBuffer.isView(e)?e.slice():e.clone(),!0;{let r=t[n];if(typeof e==`number`||typeof e==`boolean`){if(r!==e)return t[n]=e,!0}else if(ArrayBuffer.isView(e))return!0;else if(r.equals(e)===!1)return r.copy(e),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let i=0,a=r.length;i<a;i++){let a=r[i],o=Array.isArray(a.value)?a.value:[a.value],s=Array.isArray(t[e])||Array.isArray(a.value),c=n;for(let e=0,t=o.length;e<t;e++){let t=o[e],r=h(t,s),i=n%16,a=i%r.boundary,l=i+a;n+=a,l!==0&&16-l<r.storage&&(n+=16-l),e===0&&(c=n),n+=r.storage}a.__data=new(a.type===`int`?Int32Array:a.type===`uint`?Uint32Array:Float32Array)((n-c)/Float32Array.BYTES_PER_ELEMENT),a.__offset=c}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e,t){let n={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(n.boundary=4,n.storage=4):e.isVector2?(n.boundary=8,n.storage=8):e.isVector3||e.isColor?(n.boundary=16,n.storage=12):e.isVector4?(n.boundary=16,n.storage=16):e.isMatrix3?(n.boundary=16,n.storage=48):e.isMatrix4?(n.boundary=16,n.storage=64):e.isTexture?Ce(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(n.boundary=16,n.storage=e.byteLength):Ce(`WebGLRenderer: Unsupported uniform value type.`,e),t===!0&&(n.boundary=16,n.storage=Math.ceil(n.storage/16)*16),n}function g(t){let n=t.target;n.removeEventListener(`dispose`,g),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);i={},a={}}return{bind:o,update:s,dispose:_}}var xa=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Sa=null;function Ca(){return Sa===null&&(Sa=new Pt(xa,16,16,ke,yt),Sa.name=`DFG_LUT`,Sa.minFilter=de,Sa.magFilter=de,Sa.wrapS=ge,Sa.wrapT=ge,Sa.generateMipmaps=!1,Sa.needsUpdate=!0),Sa}var wa=class{constructor(e={}){let{canvas:t=fe(),context:n=null,depth:i=!0,stencil:s=!1,alpha:c=!1,antialias:u=!1,premultipliedAlpha:d=!0,preserveDrawingBuffer:p=!1,powerPreference:m=`default`,failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:g=!1,outputBufferType:_=Xt}=e;this.isWebGLRenderer=!0;let v;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);v=n.getContextAttributes().alpha}else v=c;let y=_,b=new Set([bt,x,A]),S=new Set([Xt,ve,be,We,l,$t]),C=new Uint32Array(4),T=new Int32Array(4),E={textures:[],min:[],max:[],resolution:[]},O=null,k=null,j=[],ee=[],te=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let M=this,ne=!1,re=null,ie=null,N=null,ae=null;this._outputColorSpace=Tt;let oe=0,se=0,P=null,ce=-1,le=null,de=new ue,pe=new ue,me=null,he=new K(0),ge=0,_e=t.width,F=t.height,I=1,ye=null,xe=null,Se=new ue(0,0,_e,F),we=new ue(0,0,_e,F),Te=!1,Ee=new He,De=new kt,Oe=!1,ke=!1,Ae=new an,je=new f,Me=new ue,Ne={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Pe=!1;function Fe(){return P===null?I:1}let L=n;function Ie(e,n){return t.getContext(e,n)}let Le,Re,R,ze,z,B,V,Be,Ve,Ue,Ge,Ke,qe,Je,Ye,Xe,Ze,Qe,$e,et,tt,nt,H;try{let e={alpha:!0,depth:i,stencil:s,antialias:u,premultipliedAlpha:d,preserveDrawingBuffer:p,powerPreference:m,failIfMajorPerformanceCaveat:h};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r187`),t.addEventListener(`webglcontextlost`,at,!1),t.addEventListener(`webglcontextrestored`,ot,!1),t.addEventListener(`webglcontextcreationerror`,st,!1),L===null){let t=`webgl2`;if(L=Ie(t,e),L===null)throw Ie(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}rt()}catch(e){throw t.removeEventListener(`webglcontextlost`,at,!1),t.removeEventListener(`webglcontextrestored`,ot,!1),t.removeEventListener(`webglcontextcreationerror`,st,!1),D(`WebGLRenderer: `+e.message),e}function rt(){Le=new Wn(L),Le.init(),tt=new fa(L,Le),Re=new wn(L,Le,e,tt),R=new ua(L,Le),Re.reversedDepthBuffer&&g&&R.buffers.depth.setReversed(!0),ie=L.createFramebuffer(),N=L.createFramebuffer(),ae=L.createFramebuffer(),ze=new qn(L),z=new Wi,B=new da(L,Le,R,z,Re,tt,ze),V=new Un(M),Be=new gn(L),nt=new Sn(L,Be),Ve=new Gn(L,Be,ze,nt),Ue=new Yn(L,Ve,Be,nt,ze),Qe=new Jn(L,Re,B),Ye=new Tn(z),Ge=new Ui(M,V,Le,Re,nt,Ye),Ke=new ya(M,z),qe=new Ji,Je=new ta(Le),Ze=new xn(M,V,R,Ue,v,d),Xe=new la(M,Ue,Re),H=new ba(L,ze,Re,R),$e=new Cn(L,Le,ze),et=new Kn(L,Le,ze),ze.programs=Ge.programs,M.capabilities=Re,M.extensions=Le,M.properties=z,M.renderLists=qe,M.shadowMap=Xe,M.state=R,M.info=ze}y!==1009&&(te=new Zn(y,t.width,t.height,u,i,s));let it=new ga(M,L);this.xr=it,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let e=Le.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Le.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return I},this.setPixelRatio=function(e){e!==void 0&&(I=e,this.setSize(_e,F,!1))},this.getSize=function(e){return e.set(_e,F)},this.setSize=function(e,n,r=!0){it.isPresenting?Ce(`WebGLRenderer: Can't change size while VR device is presenting.`):(_e=e,F=n,t.width=Math.floor(e*I),t.height=Math.floor(n*I),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),te!==null&&te.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(_e*I,F*I).floor()},this.setDrawingBufferSize=function(e,n,r){_e=e,F=n,I=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(y===1009)D(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){Ce(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}te.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(de)},this.getViewport=function(e){return e.copy(Se)},this.setViewport=function(e,t,n,r){e.isVector4?Se.set(e.x,e.y,e.z,e.w):Se.set(e,t,n,r),R.viewport(de.copy(Se).multiplyScalar(Fe()).round())},this.getScissor=function(e){return e.copy(we)},this.setScissor=function(e,t,n,r){e.isVector4?we.set(e.x,e.y,e.z,e.w):we.set(e,t,n,r),R.scissor(pe.copy(we).multiplyScalar(Fe()).round())},this.getScissorTest=function(){return Te},this.setScissorTest=function(e){R.setScissorTest(Te=e)},this.setOpaqueSort=function(e){ye=e},this.setTransparentSort=function(e){xe=e},this.getClearColor=function(e){return e.copy(Ze.getClearColor())},this.setClearColor=function(){Ze.setClearColor(...arguments)},this.getClearAlpha=function(){return Ze.getClearAlpha()},this.setClearAlpha=function(){Ze.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(P!==null){let t=P.texture.format;e=b.has(t)}if(e){let e=P.texture.type,t=S.has(e),n=Ze.getClearColor(),r=Ze.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(C[0]=i,C[1]=a,C[2]=o,C[3]=r,L.clearBufferuiv(L.COLOR,0,C)):(T[0]=i,T[1]=a,T[2]=o,T[3]=r,L.clearBufferiv(L.COLOR,0,T))}else r|=L.COLOR_BUFFER_BIT}t&&(r|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&L.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),re=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,at,!1),t.removeEventListener(`webglcontextrestored`,ot,!1),t.removeEventListener(`webglcontextcreationerror`,st,!1),Ze.dispose(),qe.dispose(),Je.dispose(),B.dispose(),z.dispose(),V.dispose(),Ue.dispose(),Ve.dispose(),nt.dispose(),H.dispose(),Ge.dispose(),it.dispose(),it.removeEventListener(`sessionstart`,mt),it.removeEventListener(`sessionend`,gt),_t.stop()};function at(e){e.preventDefault(),o(`WebGLRenderer: Context Lost.`),ne=!0}function ot(){o(`WebGLRenderer: Context Restored.`),ne=!1;let e=ze.autoReset,t=Xe.enabled,n=Xe.autoUpdate,r=Xe.needsUpdate,i=Xe.type;rt(),ze.autoReset=e,Xe.enabled=t,Xe.autoUpdate=n,Xe.needsUpdate=r,Xe.type=i}function st(e){D(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function ct(e){let t=e.target;t.removeEventListener(`dispose`,ct),lt(t)}function lt(e){ut(e),z.remove(e)}function ut(e){let t=z.get(e).programs;t!==void 0&&(t.forEach(function(e){Ge.releaseProgram(e)}),e.isShaderMaterial&&Ge.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=Ne);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=jt(e,t,n,r,i);R.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Ve.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;nt.setup(i,r,s,n,c);let h,g=$e;if(c!==null&&(h=Be.get(c),g=et,g.setIndex(h)),i.isMesh)r.wireframe===!0?(R.setLineWidth(r.wireframeLinewidth*Fe()),g.setMode(L.LINES)):g.setMode(L.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),R.setLineWidth(e*Fe()),i.isLineSegments?g.setMode(L.LINES):i.isLineLoop?g.setMode(L.LINE_LOOP):g.setMode(L.LINE_STRIP)}else i.isPoints?g.setMode(L.POINTS):i.isSprite&&g.setMode(L.TRIANGLES);if(i.isBatchedMesh){if(Le.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Be.get(c).bytesPerElement:1,o=z.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(L,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function U(e,t,n,r){re!==null&&e.isNodeMaterial&&re.setObject(r,e),Oe===!0&&Ye.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,Et(e,t,r),e.side=0,e.needsUpdate=!0,Et(e,t,r),e.side=2):Et(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),re!==null&&re.renderStart(e,t,n),k=Je.get(n),k.init(t),ee.push(k),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(k.pushLight(e),e.castShadow&&k.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(k.pushLight(e),e.castShadow&&k.pushShadow(e))}),k.setupLights(),re!==null&&re.updateLights(k.state.lightsArray),ke=this.localClippingEnabled,Oe=Ye.init(this.clippingPlanes,ke),Oe===!0&&Ye.setGlobalState(this.clippingPlanes,t),re!==null&&Xe.render(k.state.shadowsArray,n,t);let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];U(o,n,t,e),r.add(o)}else U(i,n,t,e),r.add(i)}}),k=ee.pop(),re!==null&&re.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=z.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}Le.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let ft=null;function pt(e){ft&&ft(e)}function mt(){_t.stop()}function gt(){_t.start()}let _t=new hn;_t.setAnimationLoop(pt),typeof self<`u`&&_t.setContext(self),this.setAnimationLoop=function(e){ft=e,it.setAnimationLoop(e),e===null?_t.stop():_t.start()},it.addEventListener(`sessionstart`,mt),it.addEventListener(`sessionend`,gt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){D(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(ne===!0)return;re!==null&&re.renderStart(e,t);let n=it.enabled===!0&&it.isPresenting===!0,i=te!==null&&(P===null||n)&&te.begin(M,P);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),it.enabled===!0&&it.isPresenting===!0&&(te===null||te.isCompositing()===!1)&&(it.cameraAutoUpdate===!0&&it.updateCamera(t),t=it.getCamera()),e.isScene===!0&&e.onBeforeRender(M,e,t,P),k=Je.get(e,ee.length),k.init(t),k.state.textureUnits=B.getTextureUnits(),ee.push(k),Ae.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),t.isArrayCamera?De.setFromArrayCamera(t):Ee.setFromProjectionMatrix(Ae,r,t.reversedDepth),ke=this.localClippingEnabled,Oe=Ye.init(this.clippingPlanes,ke),O=qe.get(e,j.length),O.init(),j.push(O),this.info.render.frame++,it.enabled===!0&&it.isPresenting===!0){let e=M.xr.getDepthSensingMesh();e!==null&&vt(e,t,-1/0,M.sortObjects)}vt(e,t,0,M.sortObjects),O.finish(),re!==null&&re.updateLights(k.state.lightsArray),M.sortObjects===!0&&O.sort(ye,xe),Pe=it.enabled===!1||it.isPresenting===!1||it.hasDepthSensing()===!1,Pe&&Ze.addToRenderList(O,e),this.info.autoReset===!0&&this.info.reset(),Oe===!0&&Ye.beginShadows();let a=k.state.shadowsArray;if(Xe.render(a,e,t),Oe===!0&&Ye.endShadows(),(i&&te.hasRenderPass())===!1){let n=O.opaque,r=O.transmissive;if(k.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];xt(n,r,e,a)}Pe&&Ze.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];W(O,e,n,n.viewport)}}else r.length>0&&xt(n,r,e,t),Pe&&Ze.render(e),W(O,e,t)}P!==null&&se===0&&(B.updateMultisampleRenderTarget(P),B.updateRenderTargetMipmap(P)),i&&te.end(M),e.isScene===!0&&e.onAfterRender(M,e,t),nt.resetDefaultState(),ce=-1,le=null,ee.pop(),ee.length>0?(k=ee[ee.length-1],B.setTextureUnits(k.state.textureUnits),Oe===!0&&Ye.setGlobalState(M.clippingPlanes,k.state.camera)):k=null,j.pop(),O=j.length>0?j[j.length-1]:null,re!==null&&re.renderEnd()};function vt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)k.pushLight(e),e.castShadow&&k.pushShadow(e);else if(e.isSprite){let i=t.isArrayCamera?De:Ee;if(!e.frustumCulled||e.intersectsFrustum(i)){r&&Me.setFromMatrixPosition(e.matrixWorld).applyMatrix4(Ae);let i=Ue.update(e),a=e.material;a.visible&&O.push(e,i,a,n,Me.z,null,t)}}else if(e.isMesh||e.isLine||e.isPoints){let i=t.isArrayCamera?De:Ee;if(!e.frustumCulled||e.intersectsFrustum(i)){let i=Ue.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),Me.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),Me.copy(e.boundingSphere.center)),Me.applyMatrix4(e.matrixWorld).applyMatrix4(Ae)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&O.push(e,i,c,n,Me.z,s,t)}}else a.visible&&O.push(e,i,a,n,Me.z,null,t)}}}let i=e.children;for(let e=0,a=i.length;e<a;e++)vt(i[e],t,n,r)}function W(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;k.setupLightsView(n),Oe===!0&&Ye.setGlobalState(M.clippingPlanes,n),r&&R.viewport(de.copy(r)),i.length>0&&St(i,t,n),a.length>0&&St(a,t,n),o.length>0&&St(o,t,n),R.buffers.depth.setTest(!0),R.buffers.depth.setMask(!0),R.buffers.color.setMask(!0),R.setPolygonOffset(!1)}function xt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(k.state.transmissionRenderTarget[r.id]===void 0){let e=Le.has(`EXT_color_buffer_half_float`)||Le.has(`EXT_color_buffer_float`);k.state.transmissionRenderTarget[r.id]=new dt(1,1,{generateMipmaps:!0,type:e?yt:Xt,minFilter:ht,samples:Math.max(4,Re.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:a.workingColorSpace})}let i=k.state.transmissionRenderTarget[r.id],o=r.viewport||de;i.setSize(o.z*M.transmissionResolutionScale,o.w*M.transmissionResolutionScale);let c=M.getRenderTarget(),l=M.getActiveCubeFace(),u=M.getActiveMipmapLevel();M.setRenderTarget(i),M.getClearColor(he),ge=M.getClearAlpha(),ge<1&&M.setClearColor(16777215,.5),M.clear(),Pe&&Ze.render(n);let d=M.toneMapping;M.toneMapping=0;let f=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),k.setupLightsView(r),Oe===!0&&Ye.setGlobalState(M.clippingPlanes,r),St(e,n,r),B.updateMultisampleRenderTarget(i),B.updateRenderTargetMipmap(i),Le.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,Ct(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(B.updateMultisampleRenderTarget(i),B.updateRenderTargetMipmap(i))}M.setRenderTarget(c,l,u),M.setClearColor(he,ge),f!==void 0&&(r.viewport=f),M.toneMapping=d}function St(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&Ct(o,t,n,s,l,c)}}function Ct(e,t,n,r,i,a){re!==null&&i.isNodeMaterial&&re.setObject(e,i),e.onBeforeRender(M,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(M,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,M.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,M.renderBufferDirect(n,t,r,i,e,a),i.side=2):M.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(M,t,n,r,i,a)}function wt(e){let t=0;for(let n of e)n.texture!==null&&t++;return t}function Et(e,t,n){t.isScene!==!0&&(t=Ne);let r=z.get(e),i=k.state.lights,a=k.state.shadowsArray,o=i.state.version,s=Ge.getParameters(e,i.state,a,t,n,k.state.lightProbeGridArray),c=Ge.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=V.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,ct),l=new Map,r.programs=l,r.programVariants=new Map);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return At(e,s),d}else s.uniforms=Ge.getUniforms(e),re!==null&&e.isNodeMaterial&&re.build(e,n,s),e.onBeforeCompile(s,M),d=Ge.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Ye.uniform),At(e,s),r.needsLights=Nt(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.numLightProbeGrids=wt(k.state.lightProbeGridArray),r.currentProgram=d,r.uniformsList=null,d}function Dt(e,t,n,r,i){let a=z.get(e),o=a.currentProgram.id+`,`+r+`,`+i,s=a.programVariants.get(o);return s===void 0?(s=Et(e,t,n),a.programVariants.set(o,s)):(a.currentProgram=s,a.uniformsList=null,a.outputColorSpace=r,a.toneMapping=i),s}function Ot(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=oi.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function At(e,t){let n=z.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function jt(e,t,n,r,i){t.isScene!==!0&&(t=Ne),B.resetTextureUnits();let o=t.fog,s=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,c=P===null?M.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:a.workingColorSpace,l=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,u=V.get(r.envMap||s,l),d=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,f=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),p=!!n.morphAttributes.position,m=!!n.morphAttributes.normal,h=!!n.morphAttributes.color,g=0;r.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(g=M.toneMapping);let _=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,v=_===void 0?0:_.length,y=z.get(r),b=k.state.lights;if(Oe===!0&&(ke===!0||e!==le)){let t=e===le&&r.id===ce;Ye.setState(r,e,t)}let x=!1,S=!1;r.version===y.__version?y.needsLights&&y.lightsStateVersion!==b.state.version||i.isBatchedMesh&&y.batching===!1||!i.isBatchedMesh&&y.batching===!0||i.isBatchedMesh&&y.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&y.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&y.instancing===!1||!i.isInstancedMesh&&y.instancing===!0||i.isSkinnedMesh&&y.skinning===!1||!i.isSkinnedMesh&&y.skinning===!0||i.isInstancedMesh&&y.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&y.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&y.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&y.instancingMorph===!1&&i.morphTexture!==null?x=!0:y.envMap===u?r.fog===!0&&y.fog!==o||y.numClippingPlanes!==void 0&&(y.numClippingPlanes!==Ye.numPlanes||y.numIntersection!==Ye.numIntersection)?x=!0:y.vertexAlphas===d&&y.vertexTangents===f&&y.morphTargets===p&&y.morphNormals===m&&y.morphColors===h&&y.morphTargetsCount===v&&y.numLightProbeGrids===wt(k.state.lightProbeGridArray)?(y.outputColorSpace!==c||y.toneMapping!==g)&&(S=!0):x=!0:x=!0:(x=!0,y.__version=r.version);let C=y.currentProgram;(x===!0||S===!0)&&(C=S===!0?Dt(r,t,i,c,g):Et(r,t,i),re&&r.isNodeMaterial&&re.onUpdateProgram(r,C,y));let w=!1,T=!1,D=!1,O=C.getUniforms(),A=y.uniforms;if(R.useProgram(C.program)&&(w=!0,T=!0,D=!0),r.id!==ce&&(ce=r.id,T=!0),w||le!==e){R.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),O.setValue(L,`projectionMatrix`,e.projectionMatrix),O.setValue(L,`viewMatrix`,e.matrixWorldInverse);let t=O.map.cameraPosition;t!==void 0&&t.setValue(L,je.setFromMatrixPosition(e.matrixWorld)),Re.logarithmicDepthBuffer&&O.setValue(L,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&O.setValue(L,`isOrthographic`,e.isOrthographicCamera===!0),le!==e&&(le=e,T=!0,D=!0)}if(y.needsLights&&(b.state.sunShadowMap.length>0&&O.setValue(L,`sunShadowMap`,b.state.sunShadowMap,B),b.state.directionalShadowMap.length>0&&O.setValue(L,`directionalShadowMap`,b.state.directionalShadowMap,B),b.state.spotShadowMap.length>0&&O.setValue(L,`spotShadowMap`,b.state.spotShadowMap,B),b.state.pointShadowMap.length>0&&O.setValue(L,`pointShadowMap`,b.state.pointShadowMap,B)),i.isSkinnedMesh){O.setOptional(L,i,`bindMatrix`),O.setOptional(L,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),O.setValue(L,`boneTexture`,e.boneTexture,B))}i.isBatchedMesh&&(O.setOptional(L,i,`batchingTexture`),O.setValue(L,`batchingTexture`,i._matricesTexture,B),O.setOptional(L,i,`batchingIdTexture`),O.setValue(L,`batchingIdTexture`,i._indirectTexture,B),O.setOptional(L,i,`batchingColorTexture`),i._colorsTexture!==null&&O.setValue(L,`batchingColorTexture`,i._colorsTexture,B));let j=n.morphAttributes;if((j.position!==void 0||j.normal!==void 0||j.color!==void 0)&&Qe.update(i,n,C),(T||y.receiveShadow!==i.receiveShadow)&&(y.receiveShadow=i.receiveShadow,O.setValue(L,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(A.envMapIntensity.value=t.environmentIntensity),A.dfgLUT!==void 0&&(A.dfgLUT.value=Ca()),T){if(O.setValue(L,`toneMappingExposure`,M.toneMappingExposure),y.needsLights&&Mt(A,D),o&&r.fog===!0&&Ke.refreshFogUniforms(A,o),Ke.refreshMaterialUniforms(A,r,I,F,k.state.transmissionRenderTarget[e.id]),y.needsLights&&y.numLightProbeGrids>0){let e=E,t=0;for(let n of k.state.lightProbeGridArray)n.texture!==null&&(e.textures[t]=n.texture,e.min[t]=n.boundingBox.min,e.max[t]=n.boundingBox.max,e.resolution[t]=n.resolution,t++);for(let n in e)e[n].length=t;A.probesSH.value=e.textures,A.probesMin.value=e.min,A.probesMax.value=e.max,A.probesResolution.value=e.resolution}oi.upload(L,Ot(y),A,B)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(oi.upload(L,Ot(y),A,B),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&O.setValue(L,`center`,i.center),O.setValue(L,`modelViewMatrix`,i.modelViewMatrix),O.setValue(L,`normalMatrix`,i.normalMatrix),O.setValue(L,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];H.update(n,C),H.bind(n,C)}}return C}function Mt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function Nt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return oe},this.getActiveMipmapLevel=function(){return se},this.getRenderTarget=function(){return P},this.setRenderTargetTextures=function(e,t,n){let r=z.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),z.get(e.texture).__webglTexture=t,z.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=z.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){P=e,oe=t,se=n;let r=null,i=!1,a=!1;if(e){let o=z.get(e);if(o.__useDefaultFramebuffer!==void 0){R.bindFramebuffer(L.FRAMEBUFFER,o.__webglFramebuffer),de.copy(e.viewport),pe.copy(e.scissor),me=e.scissorTest,R.viewport(de),R.scissor(pe),R.setScissorTest(me),ce=-1;return}if(o.__webglFramebuffer===void 0)B.setupRenderTarget(e);else if(o.__hasExternalTextures)B.rebindTextures(e,z.get(e.texture).__webglTexture,z.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&z.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);B.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=z.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&B.useMultisampledRTT(e)===!1?z.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,de.copy(e.viewport),pe.copy(e.scissor),me=e.scissorTest}else de.copy(Se).multiplyScalar(I).floor(),pe.copy(we).multiplyScalar(I).floor(),me=Te;if(n!==0&&(r=ie),R.bindFramebuffer(L.FRAMEBUFFER,r)&&R.drawBuffers(e,r),R.viewport(de),R.scissor(pe),R.setScissorTest(me),i){let r=z.get(e.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=z.get(e.textures[t]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=z.get(e.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,t.__webglTexture,n)}ce=-1};function Pt(e){let t=z.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=Re.textureFormatReadable(e.format),t.__typeReadable=Re.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){D(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=z.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){R.bindFramebuffer(L.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+s);let u=Pt(o);if(u.__formatReadable===!1){D(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){D(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&L.readPixels(t,n,r,i,tt.convert(c),tt.convert(l),a)}finally{let e=P===null?null:z.get(P).__webglFramebuffer;R.bindFramebuffer(L.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=z.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){R.bindFramebuffer(L.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+s);let d=Pt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,f),L.bufferData(L.PIXEL_PACK_BUFFER,a.byteLength,L.STREAM_READ),L.readPixels(t,n,r,i,tt.convert(l),tt.convert(u),0),L.bindBuffer(L.PIXEL_PACK_BUFFER,null);let p=P===null?null:z.get(P).__webglFramebuffer;R.bindFramebuffer(L.FRAMEBUFFER,p);let m=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await w(L,m,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,f),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,a),L.bindBuffer(L.PIXEL_PACK_BUFFER,null),L.deleteBuffer(f),L.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;B.setTexture2D(e,0),L.copyTexSubImage2D(L.TEXTURE_2D,n,0,0,o,s,i,a),R.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=tt.convert(t.format),_=tt.convert(t.type),v;t.isData3DTexture?(B.setTexture3D(t,0),v=L.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(B.setTexture2DArray(t,0),v=L.TEXTURE_2D_ARRAY):(B.setTexture2D(t,0),v=L.TEXTURE_2D),R.activeTexture(L.TEXTURE0),R.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,t.flipY),R.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),R.pixelStorei(L.UNPACK_ALIGNMENT,t.unpackAlignment);let y=R.getParameter(L.UNPACK_ROW_LENGTH),b=R.getParameter(L.UNPACK_IMAGE_HEIGHT),x=R.getParameter(L.UNPACK_SKIP_PIXELS),S=R.getParameter(L.UNPACK_SKIP_ROWS),C=R.getParameter(L.UNPACK_SKIP_IMAGES);R.pixelStorei(L.UNPACK_ROW_LENGTH,h.width),R.pixelStorei(L.UNPACK_IMAGE_HEIGHT,h.height),R.pixelStorei(L.UNPACK_SKIP_PIXELS,l),R.pixelStorei(L.UNPACK_SKIP_ROWS,u),R.pixelStorei(L.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=z.get(e),r=z.get(t),h=z.get(n.__renderTarget),g=z.get(r.__renderTarget);R.bindFramebuffer(L.READ_FRAMEBUFFER,h.__webglFramebuffer),R.bindFramebuffer(L.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,z.get(e).__webglTexture,i,d+n),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,z.get(t).__webglTexture,a,m+n)),L.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,L.DEPTH_BUFFER_BIT,L.NEAREST);R.bindFramebuffer(L.READ_FRAMEBUFFER,null),R.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||z.has(e)){let n=z.get(e),r=z.get(t);R.bindFramebuffer(L.READ_FRAMEBUFFER,N),R.bindFramebuffer(L.DRAW_FRAMEBUFFER,ae);for(let e=0;e<c;e++)w?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,n.__webglTexture,i),T?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,r.__webglTexture,a),i===0?T?L.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):L.copyTexSubImage2D(v,a,f,p,l,u,o,s):L.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,L.COLOR_BUFFER_BIT,L.NEAREST);R.bindFramebuffer(L.READ_FRAMEBUFFER,null),R.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?L.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?L.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):L.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):L.texSubImage2D(L.TEXTURE_2D,a,f,p,o,s,g,_,h);R.pixelStorei(L.UNPACK_ROW_LENGTH,y),R.pixelStorei(L.UNPACK_IMAGE_HEIGHT,b),R.pixelStorei(L.UNPACK_SKIP_PIXELS,x),R.pixelStorei(L.UNPACK_SKIP_ROWS,S),R.pixelStorei(L.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps===!0&&t.mipmapsAutoUpdate===!0&&L.generateMipmap(v),R.unbindTexture()},this.initRenderTarget=function(e){z.get(e).__webglFramebuffer===void 0&&B.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?B.setTextureCube(e,0):e.isData3DTexture?B.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?B.setTexture2DArray(e,0):B.setTexture2D(e,0),R.unbindTexture()},this.resetState=function(){oe=0,se=0,P=null,R.reset(),nt.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return r}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=a._getDrawingBufferColorSpace(e),t.unpackColorSpace=a._getUnpackColorSpace()}};function Ta(e,t=!1){let n=e[0].index!==null,r=new Set(Object.keys(e[0].attributes)),i=new Set(Object.keys(e[0].morphAttributes)),a={},o={},s=e[0].morphTargetsRelative,c=new se;c.morphTargetsRelative=s;let l=0;for(let u=0;u<e.length;++u){let d=e[u],f=0,p=0;if(n!==(d.index!==null))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`),null;for(let e in d.attributes){if(!r.has(e))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have compatible attributes; make sure "`+e+`" attribute exists among all geometries, or in none of them.`),null;a[e]===void 0&&(a[e]=[]),a[e].push(d.attributes[e]),f++}if(f!==r.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of attributes.`),null;if(s!==d.morphTargetsRelative)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. .morphTargetsRelative must be consistent throughout all geometries.`),null;for(let t in d.morphAttributes){if(!i.has(t))return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`.  .morphAttributes must be consistent throughout all geometries.`),null;if(d.morphAttributes[t].length!==e[0].morphAttributes[t].length)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. All geometries must have the same number of morph targets for the "`+t+`" morph attribute.`),null;o[t]===void 0&&(o[t]=[]),o[t].push(d.morphAttributes[t]),p++}if(p!==i.size)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. Make sure all geometries have the same number of morph attributes.`),null;if(t){let e;if(n)e=d.index.count;else if(d.attributes.position!==void 0)e=d.attributes.position.count;else return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index `+u+`. The geometry must have either an index or a position attribute`),null;c.addGroup(l,e,u),l+=e}}if(n){let t=0,n=[];for(let r=0;r<e.length;++r){let i=e[r].index;for(let e=0;e<i.count;++e)n.push(i.getX(e)+t);t+=e[r].attributes.position.count}c.setIndex(n)}for(let e in a){let t=Ea(a[e]);if(!t)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` attribute.`),null;c.setAttribute(e,t)}for(let e in o){let t=o[e][0].length;if(t!==0){c.morphAttributes=c.morphAttributes||{},c.morphAttributes[e]=[];for(let n=0;n<t;++n){let t=[];for(let r=0;r<o[e].length;++r)t.push(o[e][r][n]);let r=Ea(t);if(!r)return console.error(`THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the `+e+` morphAttribute.`),null;c.morphAttributes[e].push(r)}}}return c}function Ea(e){let t,n,r,i=-1,a=0;for(let o=0;o<e.length;++o){let s=e[o];if(t===void 0&&(t=s.array.constructor),t!==s.array.constructor)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.`),null;if(n===void 0&&(n=s.itemSize),n!==s.itemSize)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.`),null;if(r===void 0&&(r=s.normalized),r!==s.normalized)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.`),null;if(i===-1&&(i=s.gpuType),i!==s.gpuType)return console.error(`THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes.`),null;a+=s.count*n}let o=new t(a),s=new N(o,n,r),c=0;for(let t=0;t<e.length;++t){let r=e[t];if(r.isInterleavedBufferAttribute){let e=c/n;for(let t=0,i=r.count;t<i;t++)for(let i=0;i<n;i++){let n=r.getComponent(t,i);s.setComponent(t+e,i,n)}}else o.set(r.array,c);c+=r.count*n}return i!==void 0&&(s.gpuType=i),s}function Da(e,t){if(t===0)return console.warn(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.`),e;if(t===2||t===1){let n=e.getIndex();if(n===null){let t=[],r=e.getAttribute(`position`);if(r!==void 0){for(let e=0;e<r.count;e++)t.push(e);e.setIndex(t),n=e.getIndex()}else return console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.`),e}let r=n.count-2,i=[];if(t===2)for(let e=1;e<=r;e++)i.push(n.getX(0)),i.push(n.getX(e)),i.push(n.getX(e+1));else for(let e=0;e<r;e++)e%2==0?(i.push(n.getX(e)),i.push(n.getX(e+1)),i.push(n.getX(e+2))):(i.push(n.getX(e+2)),i.push(n.getX(e+1)),i.push(n.getX(e)));return i.length/3!==r&&console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.`),e.setIndex(i),e.clearGroups(),e}return console.error(`THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:`,t),e}function Oa(e){let t=new Map,n=new Map,r=e.clone();return ka(e,r,function(e,r){t.set(r,e),n.set(e,r)}),r.traverse(function(e){if(!e.isSkinnedMesh)return;let r=e,i=t.get(e),a=i.skeleton.bones;r.skeleton=i.skeleton.clone(),r.bindMatrix.copy(i.bindMatrix),r.skeleton.bones=a.map(function(e){return n.get(e)}),r.bind(r.skeleton,r.bindMatrix)}),r}function ka(e,t,n){n(e,t);for(let r=0;r<e.children.length;r++)ka(e.children[r],t.children[r],n)}var Aa={root:`root`,hips:`DEF-hips`,spine1:`DEF-spine001`,spine2:`DEF-spine002`,spine3:`DEF-spine003`,neck:`DEF-neck`,head:`DEF-head`,shoulderL:`DEF-shoulderL`,upperArmL:`DEF-upper_armL`,forearmL:`DEF-forearmL`,handL:`DEF-handL`,shoulderR:`DEF-shoulderR`,upperArmR:`DEF-upper_armR`,forearmR:`DEF-forearmR`,handR:`DEF-handR`,thighL:`DEF-thighL`,shinL:`DEF-shinL`,footL:`DEF-footL`,toeL:`DEF-toeL`,thighR:`DEF-thighR`,shinR:`DEF-shinR`,footR:`DEF-footR`,toeR:`DEF-toeR`},ja=class{bones;q;hips=new Float32Array(3);constructor(e){this.bones=e,this.q=new Float32Array(e*4);for(let t=0;t<e;t++)this.q[t*4+3]=1}copy(e){return this.q.set(e.q),this.hips.set(e.hips),this}blend(e,t,n){if(t<=0)return this;let r=this.q,i=e.q;for(let e=0,a=this.bones;e<a;e++){let a=n?t*n[e]:t;if(a<=0)continue;let o=e*4,s=r[o],c=r[o+1],l=r[o+2],u=r[o+3],d=i[o],f=i[o+1],p=i[o+2],m=i[o+3];s*d+c*f+l*p+u*m<0&&(d=-d,f=-f,p=-p,m=-m);let h=s+(d-s)*a,g=c+(f-c)*a,_=l+(p-l)*a,v=u+(m-u)*a,y=1/Math.hypot(h,g,_,v);r[o]=h*y,r[o+1]=g*y,r[o+2]=_*y,r[o+3]=v*y}let a=n?t*n[1]:t;return a>0&&(this.hips[0]+=(e.hips[0]-this.hips[0])*a,this.hips[1]+=(e.hips[1]-this.hips[1])*a,this.hips[2]+=(e.hips[2]-this.hips[2])*a),this}},Ma=30,Na=class{clips=new Map;boneNames=[];parents=[];index=new Map;rest;boneCount=0;constructor(e){let t=e.scene,n=null;if(t.traverse(e=>{!n&&e.isSkinnedMesh&&(n=e)}),!n)throw Error(`character model has no skinned mesh`);let r=n.skeleton.bones;this.boneCount=r.length,r.forEach((e,t)=>{this.boneNames.push(e.name),this.index.set(e.name,t)}),r.forEach(e=>this.parents.push(e.parent?this.index.get(e.parent.name)??-1:-1));let i=this.bone(Aa.hips),a=r[this.bone(Aa.toeL)],o=r[this.bone(Aa.toeR)],s=new d(t),c=new f;for(let n of e.animations){let e=n.name.includes(`_Loop`),l=Math.max(2,Math.round(n.duration*Ma)+1),u=new Float32Array(l*this.boneCount*4),d=new Float32Array(l*3),f=[[],[]],p=[[],[]],m=s.clipAction(n);m.play();for(let m=0;m<l;m++){let h=e&&m===l-1?0:Math.min(n.duration-1e-4,m/(l-1)*n.duration);s.setTime(h);for(let e=0;e<this.boneCount;e++){let t=r[e].quaternion,n=(m*this.boneCount+e)*4;u[n]=t.x,u[n+1]=t.y,u[n+2]=t.z,u[n+3]=t.w}let g=r[i].position;d[m*3]=g.x,d[m*3+1]=g.y,d[m*3+2]=g.z,t.updateMatrixWorld(!0),[a,o].forEach((e,t)=>{e.getWorldPosition(c),p[t].push(c.y),f[t].push(c.z)})}m.stop(),s.uncacheAction(n);let h=e?Pa(p,f,n.duration/(l-1)):0;this.clips.set(n.name,{name:n.name,duration:n.duration,loop:e,frames:l,fps:(l-1)/n.duration,quat:u,hips:d,speed:h,stride:h*n.duration})}s.stopAllAction(),this.rest=new ja(this.boneCount),this.sample(this.clip(`A_TPose`),0,this.rest),this.apply(this.rest,r),t.updateMatrixWorld(!0)}bone(e){let t=this.index.get(e);if(t===void 0)throw Error(`bone not found: ${e}`);return t}clip(e){let t=this.clips.get(e);if(!t)throw Error(`clip not found: ${e}`);return t}sample(e,t,n){let r=this.boneCount,i=t;e.loop?(i%=e.duration,i<0&&(i+=e.duration)):i=i<0?0:i>e.duration?e.duration:i;let a=i*e.fps,o=Math.floor(a);o>=e.frames-1&&(o=e.frames-2);let s=a-o,c=e.quat,l=n.q,u=o*r*4,d=u+r*4;for(let e=0,t=r*4;e<t;e+=4){let t=c[u+e],n=c[u+e+1],r=c[u+e+2],i=c[u+e+3],a=c[d+e],o=c[d+e+1],f=c[d+e+2],p=c[d+e+3];t*a+n*o+r*f+i*p<0&&(a=-a,o=-o,f=-f,p=-p);let m=t+(a-t)*s,h=n+(o-n)*s,g=r+(f-r)*s,_=i+(p-i)*s,v=1/Math.hypot(m,h,g,_);l[e]=m*v,l[e+1]=h*v,l[e+2]=g*v,l[e+3]=_*v}let f=e.hips;return n.hips[0]=f[o*3]+(f[o*3+3]-f[o*3])*s,n.hips[1]=f[o*3+1]+(f[o*3+4]-f[o*3+1])*s,n.hips[2]=f[o*3+2]+(f[o*3+5]-f[o*3+2])*s,n}apply(e,t){let n=e.q;for(let e=0,r=this.boneCount;e<r;e++){let r=e*4;t[e].quaternion.set(n[r],n[r+1],n[r+2],n[r+3])}t[1].position.set(e.hips[0],e.hips[1],e.hips[2])}mask(e,t){let n=new Float32Array(this.boneCount),r=e.map(e=>this.bone(e));for(let e=0;e<this.boneCount;e++){let t=e;for(;t>=0;){if(r.includes(t)){n[e]=1;break}t=this.parents[t]}}if(t)for(let[e,r]of Object.entries(t))n[this.bone(e)]=r;return n}};function Pa(e,t,n){let r=0,i=0;for(let n=0;n<2;n++){let a=e[n],o=t[n],s=1/0;for(let e of a)s=Math.min(s,e);for(let e=0;e+1<a.length;e++)if(a[e]<s+.02&&a[e+1]<s+.02){let t=o[e]-o[e+1];t>0&&(r+=t,i++)}}return i>=2?r/(i*n):0}var Fa=[15845797,14724222,13010498,10251075,7293487,16767416,11893071],Ia=[1841689,3877406,7031339,14267242,11680302,15262420,2052054,16736162],La=[16732058,1620144,16762941,16743001,9067765,3842303,8380612,16448245,16230584,3073750,16752189,10215773],Ra=[2240570,2829634,3813199,1915706,4206890,3422784,16118246,1002588,8007227],za=[16448245,2240570,16732058,1620144,16762941,15087942];function Ba(e){let t=new K(e.pick(La)),n=new K(e.pick(La));return n.equals(t)&&(n=new K(16448245)),{skin:new K(e.pick(Fa)),shirt:t,shirt2:n,pants:new K(e.pick(e.chance(.65)?Ra:La)),shoes:new K(e.pick(za)),sole:new K(e.chance(.7)?15921900:2237995),accent:new K(e.pick(La)),hair:new K(e.pick(Ia)),shirtStyle:e.weighted([[0,3],[1,2],[2,2],[3,3],[4,2]]),sleeve:e.weighted([[.17,2],[.37,5],[.72,2]]),hem:e.weighted([[.56,4],[.44,3],[.15,3]]),gloves:e.chance(.3),hairStyle:e.pick([`short`,`cap`,`mohawk`,`bun`,`bandana`,`visor`,`long`,`short`,`cap`,`bald`]),glasses:e.chance(.45),pack:new K(e.pick(La))}}function Va(){return{skin:new K(14724222),shirt:new K(16732058),shirt2:new K(16762941),pants:new K(2240570),shoes:new K(16448245),sole:new K(1620144),accent:new K(3073750),hair:new K(1841689),shirtStyle:3,sleeve:.37,hem:.44,gloves:!0,hairStyle:`cap`,glasses:!0,pack:new K(1620144)}}var Ha=`
  uniform vec3 uSkin;
  uniform vec3 uShirt;
  uniform vec3 uShirt2;
  uniform vec3 uPants;
  uniform vec3 uShoes;
  uniform vec3 uSole;
  uniform vec3 uAccent;
  uniform vec4 uCut;
  uniform vec4 uFlash;
  varying vec3 vBind;
  float outfitRough = 0.7;
  float outfitHash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }

  // Clothing from the T-pose position: x is across the body, y is height, z is front (+) to back (-).
  vec3 outfitColor(vec3 p) {
    float ax = abs(p.x);
    vec3 col = uSkin;
    outfitRough = 0.62;
    float style = uCut.z;
    bool torso = p.y > 0.97 && p.y < 1.5 && ax < 0.2;
    bool arm = p.y > 1.3 && ax >= 0.2;
    if (torso || (arm && ax < uCut.x)) {
      col = uShirt;
      outfitRough = 0.82;
      if (style > 0.5 && style < 1.5) {
        col = mix(uShirt, uShirt2, step(0.5, fract(p.y * 11.0)));
      } else if (style > 1.5 && style < 2.5) {
        if (p.y > 1.24 && p.y < 1.34) col = uShirt2;
        if (arm && ax > uCut.x - 0.035) col = uShirt2;
      } else if (style > 2.5 && style < 3.5) {
        // Floral print: scattered petals on a grid, in two tints.
        vec2 g = vec2(p.x + p.z * 0.6, p.y) * 15.0;
        vec2 cell = floor(g);
        vec2 f = fract(g) - 0.5;
        float h = outfitHash(cell);
        vec2 o = (vec2(outfitHash(cell + 3.1), outfitHash(cell + 7.7)) - 0.5) * 0.5;
        float petal = smoothstep(0.34, 0.26, length(f - o) + 0.1 * sin(atan(f.y - o.y, f.x - o.x) * 5.0 + h * 6.0));
        col = mix(uShirt, mix(uShirt2, uAccent, step(0.6, h)), petal * step(0.35, h));
      } else if (style > 3.5) {
        if (torso && ax > 0.115) col = uShirt2;
      }
      // Collar opening at the neck.
      if (p.y > 1.44 && ax < 0.06 && p.z > -0.02) col = uSkin;
    }
    if (p.y <= 0.97 && p.y > uCut.y) {
      col = uPants;
      outfitRough = 0.85;
      if (ax > 0.165 && p.y < 0.93) col = mix(uPants, uAccent, 0.85);
    }
    if (p.y > 0.955 && p.y < 1.0 && ax < 0.2) {
      col = uPants * 0.55;
      if (ax < 0.022 && p.z > 0.0) col = uAccent;
    }
    if (p.y <= uCut.y && p.y > 0.13 && p.y < 0.2 && uCut.y > 0.3) {
      col = vec3(0.93);
      outfitRough = 0.9;
    }
    if (p.y <= 0.13) {
      col = p.y < 0.03 ? uSole : uShoes;
      outfitRough = 0.5;
      if (p.y > 0.06 && p.y < 0.075) col = uAccent;
    }
    if (ax > 0.735 && uCut.w > 0.5) {
      col = uAccent * 0.35 + 0.03;
      outfitRough = 0.55;
    }
    if (ax > 0.68 && ax < 0.715 && p.x > 0.0 && uCut.x < 0.6) col = vec3(0.08);
    return col;
  }
`;function Ua(){let e={uSkin:{value:new K(14724222)},uShirt:{value:new K(16732058)},uShirt2:{value:new K(16777215)},uPants:{value:new K(2240570)},uShoes:{value:new K(16777215)},uSole:{value:new K(15658734)},uAccent:{value:new K(3073750)},uCut:{value:new ue(.37,.44,0,0)},uFlash:{value:new ue(1,1,1,0)}},t=new S({color:16777215,roughness:.7,metalness:0});return t.onBeforeCompile=t=>{Object.assign(t.uniforms,e),t.vertexShader=t.vertexShader.replace(`#include <common>`,`#include <common>
varying vec3 vBind;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
vBind = position;`),t.fragmentShader=t.fragmentShader.replace(`#include <common>`,`#include <common>\n${Ha}`).replace(`#include <color_fragment>`,`#include <color_fragment>
diffuseColor.rgb = outfitColor(vBind);`).replace(`#include <roughnessmap_fragment>`,`#include <roughnessmap_fragment>
roughnessFactor = outfitRough;`).replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
totalEmissiveRadiance += uFlash.rgb * uFlash.a;`)},t.customProgramCacheKey=()=>`outfit`,{material:t,uniforms:e}}var Wa=new S({vertexColors:!0,roughness:.6,metalness:.05}),Ga=new S({color:725270,roughness:.12,metalness:.6});function Ka(e,t){let n=e.index?e.toNonIndexed():e,r=n.attributes.position.count,i=new Float32Array(r*3);for(let e=0;e<r;e++)i[e*3]=t.r,i[e*3+1]=t.g,i[e*3+2]=t.b;return n.setAttribute(`color`,new N(i,3)),n.deleteAttribute(`uv`),n}var qa={x:0,y:.14,z:-.006,rx:.087,ry:.127,rz:.117};function Ja(e){let t=[],n=(e,n,r=Math.PI*.5,i=0)=>{let a=new qt(1,18,10,0,Math.PI*2,0,r);a.scale(qa.rx+e,qa.ry+e,qa.rz+e),i&&a.rotateX(-i),a.translate(qa.x,qa.y,qa.z),t.push(Ka(a,n))},r=(e,n,r,i)=>{let a=Math.sqrt(Math.max(.05,1-((e-qa.y)/qa.ry)**2)),o=new Oe(1,1,n,20,1,!0);o.scale(qa.rx*a+r,1,qa.rz*a+r),o.translate(qa.x,e,qa.z),t.push(Ka(o,i))},i=(e,n,r,i,a,o,s,c=0)=>{let l=new U(e,n,r);c&&l.rotateX(c),l.translate(i,a,o),t.push(Ka(l,s))},a=(e,n,r)=>{let i=new Oe(.092,.092,.012,18,1,!1,-Math.PI/2,Math.PI);i.scale(1,1,1.3),i.rotateX(r),i.translate(0,e,.082),t.push(Ka(i,n))},o=e.hair;switch(e.hairStyle){case`short`:n(.008,o,Math.PI*.53,.3);break;case`long`:n(.011,o,Math.PI*.55,.32),i(.165,.2,.05,0,.03,-.112,o,.1);break;case`bun`:{n(.008,o,Math.PI*.53,.3);let e=new qt(.048,10,8);e.translate(0,.262,-.085),t.push(Ka(e,o));break}case`mohawk`:n(.003,o.clone().multiplyScalar(.5),Math.PI*.5,.3),i(.034,.075,.21,0,.292,-.012,o,.08);break;case`bandana`:n(.006,o,Math.PI*.55,.32),r(.205,.05,.012,e.accent),i(.03,.1,.02,.025,.15,-.135,e.accent,.35);break;case`cap`:n(.004,o,Math.PI*.56,.35),n(.013,e.accent,Math.PI*.43,.08),a(.176,e.accent.clone().multiplyScalar(.7),.1);break;case`visor`:n(.007,o,Math.PI*.53,.3),r(.19,.04,.014,e.shirt2),a(.178,e.shirt2,.14)}let c=[];if(t.length){let e=Ta(t,!1);e&&c.push(new s(e,Wa))}if(e.glasses){let e=new U(.16,.038,.022);e.translate(0,.122,.108);let t=[new U(.008,.012,.12),new U(.008,.012,.12)];t[0].translate(.082,.128,.05),t[1].translate(-.082,.128,.05);let n=Ta([e,...t],!1);n&&c.push(new s(n,Ga))}return c}function Ya(e){let t=[],n=new U(.26,.32,.1);n.translate(0,-.03,-.14),t.push(Ka(n,e.pack));let r=new U(.24,.09,.11);r.translate(0,.09,-.142),t.push(Ka(r,e.pack.clone().multiplyScalar(.72)));for(let e of[-1,1]){let n=new U(.035,.36,.02);n.rotateX(-.1),n.translate(e*.09,.03,.105),t.push(Ka(n,new K(2106924)));let r=new U(.035,.02,.24);r.translate(e*.09,.19,-.03),t.push(Ka(r,new K(2106924)))}let i=new U(.05,.03,.03);return i.translate(.11,-.05,.12),t.push(Ka(i,new K(15087942))),new s(Ta(t,!1),Wa)}var Xa=[`hips`,`spine1`,`spine2`,`spine3`,`neck`,`head`,`shoulderL`,`upperArmL`,`forearmL`,`handL`,`shoulderR`,`upperArmR`,`forearmR`,`handR`,`thighL`,`shinL`,`footL`,`toeL`,`thighR`,`shinR`,`footR`,`toeR`],Za=null,Qa=class e{root=new Je;bones=[];b;rootBone;grip=new R;back=new R;model;uniforms;material;accessories=[];meshes=[];outfit;constructor(t,n,r){this.model=Oa(t.scene),this.root.add(this.model);let i=new Map;this.model.traverse(e=>{e.isBone&&i.set(e.name,e),e.isSkinnedMesh&&this.meshes.push(e)});for(let e of n.boneNames){let t=i.get(e);if(!t)throw Error(`rig is missing bone ${e}`);this.bones.push(t)}this.rootBone=this.bones[0];let a={};for(let e of Xa)a[e]=this.bones[n.bone(Aa[e])];this.b=a;let o=Ua();this.material=o.material,this.uniforms=o.uniforms;for(let e of this.meshes)e.material=this.material,e.castShadow=!0,e.receiveShadow=!0,e.geometry.boundingSphere=new vt(new f(0,.95,0),1.7),e.frustumCulled=!0;Za||=e.measureGrip(t,n),this.grip.quaternion.copy(Za),this.grip.position.set(-.028,.092,.012),this.b.handR.add(this.grip),this.back.position.set(.08,.05,-.2),this.back.rotation.set(.2,0,2.2),this.b.spine3.add(this.back),this.outfit=r,this.setOutfit(r)}static measureGrip(e,t){let n=Oa(e.scene),r=new Map;n.traverse(e=>{e.isBone&&r.set(e.name,e)});let i=t.boneNames.map(e=>r.get(e)),a=t.sample(t.clip(`Pistol_Aim_Neutral`),0,new ja(t.boneCount));return t.apply(a,i),n.updateMatrixWorld(!0),r.get(Aa.handR).getWorldQuaternion(new Ot).invert()}setOutfit(e){this.outfit=e;let t=this.uniforms;t.uSkin.value.copy(e.skin),t.uShirt.value.copy(e.shirt),t.uShirt2.value.copy(e.shirt2),t.uPants.value.copy(e.pants),t.uShoes.value.copy(e.shoes),t.uSole.value.copy(e.sole),t.uAccent.value.copy(e.accent),t.uCut.value.set(e.sleeve,e.hem,e.shirtStyle,+!!e.gloves);for(let e of this.accessories)e.removeFromParent(),e.geometry.dispose();this.accessories=[];for(let t of Ja(e))this.b.head.add(t),this.accessories.push(t);let n=Ya(e);this.b.spine3.add(n),this.accessories.push(n);for(let e of this.accessories)e.castShadow=!0,e.receiveShadow=!1}setFlash(e,t,n,r){this.uniforms.uFlash.value.set(e,t,n,r)}setVisible(e){this.root.visible=e}setShadows(e){for(let t of this.meshes)t.castShadow=e;for(let t of this.accessories)t.castShadow=e}dispose(){this.root.removeFromParent(),this.material.dispose();for(let e of this.accessories)e.geometry.dispose()}},$a={pistol:{id:`pistol`,name:`Coral 9`,kind:`weapon`,price:120,stack:1,max:1,blurb:`Sidearm. Quick and accurate.`},smg:{id:`smg`,name:`Mosquito`,kind:`weapon`,price:260,stack:1,max:1,blurb:`Fast-firing, best up close.`},rifle:{id:`rifle`,name:`Tradewind`,kind:`weapon`,price:380,stack:1,max:1,blurb:`Automatic rifle for any range.`},shotgun:{id:`shotgun`,name:`Breakwater 12`,kind:`weapon`,price:320,stack:1,max:1,blurb:`Pump shotgun. Stand close.`},sniper:{id:`sniper`,name:`Longshore`,kind:`weapon`,price:520,stack:1,max:1,blurb:`Bolt-action. One careful shot.`},ammo_light:{id:`ammo_light`,name:`Light rounds`,kind:`ammo`,price:30,stack:36,max:240,blurb:`For the Coral 9 and the Mosquito.`},ammo_medium:{id:`ammo_medium`,name:`Rifle rounds`,kind:`ammo`,price:45,stack:30,max:180,blurb:`For the Tradewind.`},ammo_shells:{id:`ammo_shells`,name:`Shells`,kind:`ammo`,price:40,stack:10,max:50,blurb:`For the Breakwater 12.`},ammo_heavy:{id:`ammo_heavy`,name:`Heavy rounds`,kind:`ammo`,price:60,stack:8,max:32,blurb:`For the Longshore.`},bandage:{id:`bandage`,name:`Bandage`,kind:`heal`,price:25,stack:3,max:9,blurb:`Restores 20 health, up to 75.`},medkit:{id:`medkit`,name:`Medkit`,kind:`heal`,price:90,stack:1,max:3,blurb:`Restores full health.`},cola:{id:`cola`,name:`Cascabel Cola`,kind:`armor`,price:35,stack:2,max:6,blurb:`Adds 25 armor.`},vest:{id:`vest`,name:`Storm vest`,kind:`armor`,price:150,stack:1,max:2,blurb:`Adds 60 armor.`},grenade:{id:`grenade`,name:`Coco frag`,kind:`throwable`,price:70,stack:2,max:6,blurb:`Thrown explosive.`}},eo=[`pistol`,`smg`,`rifle`,`shotgun`,`sniper`];function to(e){return e in $a}var no=new Ot,ro=new Ot,io=new Ot,ao=new f,oo=new f,so=new f,co=new f,lo=new f,uo=new f,fo=new f,po=new Ot,mo=new Ot;function ho(e,t){e.getWorldQuaternion(no),e.parent?e.parent.getWorldQuaternion(ro).invert():ro.identity(),e.quaternion.copy(ro).multiply(t).multiply(no)}function go(e,t,n,r){e.parent?e.parent.getWorldQuaternion(ro).invert():ro.identity(),e.position.add(uo.set(t,n,r).applyQuaternion(ro))}function _o(e,t,n){Math.abs(n)<1e-6||ho(e,io.setFromAxisAngle(t,n))}function vo(e,t){e.parent?e.parent.getWorldQuaternion(ro).invert():ro.identity(),e.quaternion.copy(ro).multiply(t)}function yo(e,t,n,r,i,a=1){if(a<=0)return 0;po.copy(e.quaternion),mo.copy(t.quaternion),e.getWorldPosition(ao),t.getWorldPosition(oo),n.getWorldPosition(so);let o=ao.distanceTo(oo),s=oo.distanceTo(so);co.subVectors(r,ao);let c=co.length(),l=(o+s)*.9985,u=Math.abs(o-s)+.01,d=Math.min(l,Math.max(u,c));if(c<1e-5)return 0;co.multiplyScalar(1/c);let f=Math.min(1,Math.max(-1,(o*o+d*d-s*s)/(2*o*d))),p=Math.sqrt(1-f*f);return lo.copy(i).addScaledVector(co,-i.dot(co)),lo.lengthSq()<1e-6&&(lo.subVectors(oo,ao).addScaledVector(co,-uo.subVectors(oo,ao).dot(co)),lo.lengthSq()<1e-6&&lo.set(0,0,1)),lo.normalize(),uo.copy(ao).addScaledVector(co,f*o).addScaledVector(lo,p*o),fo.subVectors(oo,ao).normalize(),uo.sub(ao).normalize(),ho(e,io.setFromUnitVectors(fo,uo)),t.getWorldPosition(oo),n.getWorldPosition(so),fo.subVectors(so,oo).normalize(),uo.copy(ao).addScaledVector(co,d).sub(oo).normalize(),ho(t,io.setFromUnitVectors(fo,uo)),a<.999&&(io.copy(e.quaternion),e.quaternion.copy(po).slerp(io,a),io.copy(t.quaternion),t.quaternion.copy(mo).slerp(io,a)),Math.max(0,c-l)}function bo(e,t,n,r=1,i=Math.PI){let a=Math.min(1,Math.max(-1,t.dot(n))),o=Math.acos(a);o<1e-4||(uo.crossVectors(t,n),uo.lengthSq()<1e-10||(uo.normalize(),o=Math.min(o,i)*r,ho(e,io.setFromAxisAngle(uo,o))))}var xo=[{name:`Stock`,damage:1,reload:1,color:15327952},{name:`Tuned`,damage:1.1,reload:.94,color:3530952},{name:`Custom`,damage:1.2,reload:.88,color:16743001},{name:`Signature`,damage:1.32,reload:.8,color:16765286}],So=xo.length-1,Co={pistol:{id:`pistol`,ammo:`ammo_light`,slot:1,auto:!1,rpm:420,mag:12,reload:1.45,shellReload:!1,damage:24,pellets:1,headshot:1.8,range:[28,70],falloff:.6,spread:.011,aimSpread:.0035,bloom:.009,bloomMax:.05,settle:.11,recoil:[.016,.006],kick:.5,zoom:.78,sound:`shot_pistol`,tracer:16769704,draw:.28,model:`blaster-b`,scale:.62,long:!1,grip:[-.13,.1],fore:[-.16,.1],muzzle:[.012,-.26],port:[.07,-.05]},smg:{id:`smg`,ammo:`ammo_light`,slot:2,auto:!0,rpm:780,mag:30,reload:1.9,shellReload:!1,damage:15,pellets:1,headshot:1.5,range:[16,45],falloff:.5,spread:.027,aimSpread:.012,bloom:.0045,bloomMax:.05,settle:.14,recoil:[.008,.007],kick:.28,zoom:.8,sound:`shot_smg`,tracer:16769704,draw:.3,model:`blaster-c`,scale:.85,long:!0,grip:[-.09,.17],fore:[-.085,-.05],muzzle:[.025,-.24],port:[.1,.02]},rifle:{id:`rifle`,ammo:`ammo_medium`,slot:3,auto:!0,rpm:540,mag:30,reload:2.2,shellReload:!1,damage:27,pellets:1,headshot:1.6,range:[50,120],falloff:.7,spread:.015,aimSpread:.0035,bloom:.0052,bloomMax:.045,settle:.1,recoil:[.012,.006],kick:.42,zoom:.62,sound:`shot_rifle`,tracer:16773314,draw:.38,model:`blaster-d`,scale:.8,long:!0,grip:[-.08,.19],fore:[-.035,-.24],muzzle:[.07,-.45],port:[.1,.02]},shotgun:{id:`shotgun`,ammo:`ammo_shells`,slot:4,auto:!1,rpm:70,mag:5,reload:.52,shellReload:!0,damage:11,pellets:9,headshot:1.3,range:[8,24],falloff:.25,spread:.075,aimSpread:.06,bloom:0,bloomMax:0,settle:1,recoil:[.05,.012],kick:1.3,zoom:.84,sound:`shot_shotgun`,tracer:16767392,draw:.42,model:`blaster-a`,scale:.85,long:!0,grip:[-.15,.22],fore:[-.11,-.2],muzzle:[.05,-.37],port:[.11,.05]},sniper:{id:`sniper`,ammo:`ammo_heavy`,slot:5,auto:!1,rpm:38,mag:5,reload:2.8,shellReload:!1,damage:105,pellets:1,headshot:2.2,range:[150,320],falloff:.8,spread:.07,aimSpread:5e-4,bloom:.02,bloomMax:.04,settle:.05,recoil:[.06,.008],kick:1.5,zoom:.24,sound:`shot_sniper`,tracer:15398655,draw:.55,model:`blaster-f`,scale:.82,long:!0,grip:[-.07,.39],fore:[-.03,-.08],muzzle:[.066,-.65],port:[.09,.1]}},wo={bandage:{time:2.2,health:20,healthCap:75,armor:0},medkit:{time:4.5,health:100,healthCap:100,armor:0},cola:{time:1.6,health:0,healthCap:0,armor:25},vest:{time:3,health:0,healthCap:0,armor:60}},To=class{held={};current=null;cooldown=0;reloading=0;reloadTotal=0;drawing=0;bloom=0;burst=0;sinceShot=99;triggerHeld=!1;using=null;useLeft=0;throwing=0;shots=0;hits=0;headshots=0;has(e){return this.held[e]!==void 0}get weapon(){return this.current?Co[this.current]:null}get heldNow(){return this.current?this.held[this.current]??null:null}carried(){return Object.keys(Co).filter(e=>this.held[e])}give(e,t=0){let n=this.held[e];return n?t<=n.tier?!1:(n.tier=t,!0):(this.held[e]={tier:t,mag:Co[e].mag},!0)}clear(){for(let e of Object.keys(this.held))delete this.held[e];this.current=null,this.cooldown=0,this.reloading=0,this.drawing=0,this.bloom=0,this.burst=0,this.using=null,this.useLeft=0,this.throwing=0,this.triggerHeld=!1,this.shots=0,this.hits=0,this.headshots=0}};function Eo(){return{fire:!1,aim:!1,reload:!1,slot:null,cycle:0,use:null,throw:!1}}var Do=new f,Oo=new f,ko=new f,Ao=new f,jo=new f,Mo=new f,No=new f,Po=new f,Fo=new an,Io=new Ot,Lo=new Ot,Ro=new Ot,zo=new f,Bo=new f(0,1,0),Vo=new Ot().setFromRotationMatrix(new an().makeBasis(new f(0,0,-1),new f(.89,-.45,0),new f(-.45,-.89,0))),Ho=new Ot().setFromAxisAngle(new f(0,0,1),-1.35).multiply(new Ot().setFromAxisAngle(new f(1,0,0),.5)),Uo=class{rig;anim;asset;models={};shown=null;stowed=null;lowered=1;recoil=new et(0,.07);muzzle=new f;port=new f;hasMuzzle=!1;lower=!1;leftFree=!1;constructor(e,t,n){this.rig=e,this.anim=t,this.asset=n,t.armFn=(e,t,n)=>this.pose(e,t,n)}model(e){let t=this.models[e];if(!t){let n=Co[e],r=this.asset.scene.getObjectByName(n.model);if(!r)throw Error(`weapon model ${n.model} is missing`);t=r.clone(!0),t.name=`weapon-${e}`,t.traverse(e=>{e.castShadow=!0}),this.models[e]=t}return t}show(e,t=null){if(e!==this.shown){if(this.shown&&this.models[this.shown]?.removeFromParent(),this.shown=e,e){let t=Co[e],n=this.model(e),r=t.scale;n.rotation.set(0,Math.PI,0),n.scale.setScalar(r),n.position.set(0,-t.grip[0]*r,t.grip[1]*r),this.rig.grip.add(n),this.lowered=1}this.anim.holding=e!==null,this.hasMuzzle=!1}if(t===e&&(t=null),t!==this.stowed&&(this.stowed&&this.stowed!==this.shown&&this.models[this.stowed]?.removeFromParent(),this.stowed=t,t)){let e=Co[t],n=this.model(t);n.quaternion.copy(Vo),n.scale.setScalar(e.scale),n.position.set(.02,.06,-.27),this.rig.b.spine3.add(n)}}kick(e){this.recoil.velocity+=e*1.6}pose(e,t,n){let r=this.shown,i=this.recoil.update(0,n);if(this.lowered=H(this.lowered,+!!this.lower,this.lower?9:13,n),!r||t<.01){this.hasMuzzle=!1;return}let a=Co[r],o=e.b,s=this.anim,c=this.lowered,l=s.aimYaw+c*.5,u=s.aimPitch*(1-c)-c*.75+i*.08,d=Math.cos(u);Do.set(-Math.sin(l)*d,Math.sin(u),-Math.cos(l)*d),Oo.set(Math.cos(l),0,-Math.sin(l)),ko.crossVectors(Oo,Do).normalize(),zo.copy(Oo).negate(),Fo.makeBasis(zo,ko,Do),Io.setFromRotationMatrix(Fo),o.spine3.getWorldPosition(Ao),a.long?jo.copy(Ao).addScaledVector(Oo,.15-c*.05).addScaledVector(Bo,.07-c*.2).addScaledVector(Do,.2-i*.05+c*.04):jo.copy(Ao).addScaledVector(Oo,.1).addScaledVector(Bo,.13-c*.32).addScaledVector(Do,.5-i*.06-c*.16),Lo.copy(Io).multiply(Ro.copy(e.grip.quaternion).invert()),Po.copy(e.grip.position).multiply(o.handR.getWorldScale(No)).applyQuaternion(Lo),No.copy(jo).sub(Po),Mo.copy(Oo).multiplyScalar(.7).addScaledVector(Bo,-1).addScaledVector(Do,-.2),yo(o.upperArmR,o.forearmR,o.handR,No,Mo,t),o.handR.getWorldQuaternion(Ro),vo(o.handR,Ro.slerp(Lo,t));let f=this.models[r];if(f.updateWorldMatrix(!0,!1),this.muzzle.set(0,a.muzzle[0],a.muzzle[1]).applyMatrix4(f.matrixWorld),this.port.set(0,a.port[0],a.port[1]).applyMatrix4(f.matrixWorld),this.hasMuzzle=!0,!this.leftFree){jo.set(a.long?0:.035,a.fore[0],a.fore[1]).applyMatrix4(f.matrixWorld),Mo.copy(Oo).multiplyScalar(-.75).addScaledVector(Bo,-1);let e=t*(1-c*.35);yo(o.upperArmL,o.forearmL,o.handL,jo,Mo,e),o.handL.getWorldQuaternion(Ro),vo(o.handL,Ro.slerp(Lo.copy(Io).multiply(Ho),e))}}dispose(){for(let e of Object.values(this.models))e?.removeFromParent();this.anim.armFn=null,this.anim.holding=!1}},Wo=new f;function Go(e,t){let n=e.anim.partFacing(t,Wo);return Math.atan2(-n.x,-n.z)}var Ko=[`blocked`,`land`,`road`,`water`,`exit`],qo=[`water`,`road`,`sidewalk`,`building`,`sand`,`grass`,`plaza`,`pier`,`bridge`,`yard`,`pool`,`lot`];function Jo(e){let t={game:e,ready:!1,errors:e.errors,state:()=>({phase:e.phase,time:e.engine?.time??0,fps:e.engine?.fps??0,frames:e.engine?.frameCount??0,renderer:Yo(e),drawCalls:e.engine?.renderer.info.render.calls??0,triangles:e.engine?.renderer.info.render.triangles??0,quality:e.settings.data.quality,renderScale:e.engine?.renderScale??1,hour:e.world?.sky.hour??0,night:e.world?.sky.night??0}),view:(t,n,r,i,a,o)=>{e.cameraOverride=!0,e.engine.camera.position.set(t,n,r),e.viewTarget.set(i,a,o),e.engine.camera.lookAt(e.viewTarget)},releaseView:()=>{e.cameraOverride=!1},setHour:t=>e.world.setHour(t),probe:(t,n)=>{let r=e.world;return{type:qo[r.field.typeAt(t,n)]??`unknown`,water:r.field.isWater(t,n),height:r.field.heightAt(t,n),ground:e.physics.groundHeight(t,400,n,500,-1e3),wave:r.water.height(t,n),shore:r.field.shoreDistance(t,n)}},startAt:(t,n,r=0)=>{e.startAt(t,n,r)},startMatch:()=>e.startMatch(),skydive:(t,n,r)=>{let i=e.ensurePlayer(t,r,0);e.phase!==`match`&&e.startAt(t,r,0),e.drop.skydive(i,t,n,r)},drop:()=>{let t=e.drop;return{flying:t.flying,doorOpen:t.doorOpen,travelled:t.travelled,x:t.planePos.x,y:t.planePos.y,z:t.planePos.z,stage:e.match.stage,round:e.match.round}},interact:()=>e.controller?.interact()??!1,ext:e.debugExt,resetMetrics:()=>{e.player?.anim.resetMetrics()},chase:(t,n,r)=>{e.debugChase=t===void 0?null:new f(t,n??1,r??0)},setFreeLook:t=>{e.input.freeLook=t},weapon:()=>{let t=e.player;if(!t)return null;let n=t.loadout,r=n.weapon,i=n.heldNow;return{id:n.current,name:r?r.id:null,tier:i?xo[i.tier].name:null,mag:i?.mag??0,magSize:r?.mag??0,reserve:r?t.inventory.count(r.ammo):0,reloading:n.reloading>0,drawing:n.drawing>0,using:n.using,aiming:t.aiming,bloom:n.bloom,spread:e.combat.spreadOf(t),recoil:e.camera.recoilOffset.pitch,shots:n.shots,hits:n.hits,headshots:n.headshots,carried:n.carried(),lastHit:e.combat.lastHit,lastDamage:e.combat.lastDamage,lastHeadshot:e.combat.lastHeadshot,grenades:e.combat.live,fov:e.engine.camera.fov}},give:(t,n,r=0)=>{let i=e.player;return!i||!to(t)?0:e.grant(i,t,n,r)},spawnTarget:(t,n,r=0)=>{let i=e.characters.length;return e.spawnCharacter(`Rival ${i}`,!1,t,n,r,Ba(new Bt(e.options.seed+i*7717))).id},characters:()=>e.characters.map(e=>({id:e.id,name:e.name,player:e.isPlayer,x:e.position.x,y:e.position.y,z:e.position.z,eye:e.position.y+e.eyeHeight,health:e.health,armor:e.armor,alive:e.alive,state:e.state,kills:e.kills,weapon:e.loadout.current,cash:e.cash,items:{...e.inventory.counts}})),aimAt:(t,n,r)=>{let i=e.engine.camera,a=t-i.position.x,o=n-i.position.y,s=r-i.position.z,c=Math.hypot(a,o,s)||1,l=At(e.camera.yaw,Math.atan2(-a,-s)),u=Math.asin(o/c)-e.camera.pitch,d=.0022*e.settings.data.sensitivity*(i.fov/e.camera.baseFov);return{yaw:l,pitch:u,dx:-l/d,dy:-u/d*(e.settings.data.invertY?-1:1)}},loot:()=>({containers:e.loot.containers.map(e=>({id:e.id,kind:e.kind,x:e.x,y:e.y,z:e.z,roof:e.roof,opened:e.opened})),pickups:e.loot.pickups.map(e=>({id:e.id,item:e.item,count:e.count,tier:e.tier,x:e.x,y:e.y,z:e.z}))}),fx:()=>({...e.fx.counts,tracers:e.fx.tracers,decals:e.fx.decals,alive:e.fx.alive}),bots:()=>e.bots.snapshot(),deployBots:(t,n,r,i=12,a=[])=>e.bots.deploy(t,n,r,i,a.filter(e=>to(e[0]))).map(e=>e.id),match:()=>{let t=e.match,n=t.result;return{running:t.running,round:t.round,time:t.time,alive:t.alive,total:t.combatants.length,stage:t.stage,feed:t.feed.map(e=>({...e})),result:n?{winner:n.winnerName,winnerId:n.winner?.id??null,won:n.won,place:n.place,total:n.total,kills:n.kills,time:n.time,survived:n.survived}:null}},zone:()=>{let t=e.zone;return{stage:t.stage,phase:t.phase,left:t.left,x:t.x,z:t.z,radius:t.radius,nextX:t.nextX,nextZ:t.nextZ,nextRadius:t.nextRadius,damage:t.damage}},nav:(t,n,r,i)=>{let a=e.nav,o={kind:Ko[a.kindAt(t,n)],open:a.openness(t,n),buildMs:a.buildMs,counts:[...a.counts],searches:a.searches,expanded:a.expanded};if(r!==void 0&&i!==void 0){let e=[],s=performance.now();o.reached=a.findPath(t,n,r,i,e),o.ms=performance.now()-s,o.path=e;let c=0,l=t,u=n;for(let t=0;t<e.length;t+=2)c+=Math.hypot(e[t]-l,e[t+1]-u),l=e[t],u=e[t+1];o.length=c}return o},fastForward:t=>e.engine.fastForward(t),player:()=>{let t=e.player;if(!t)return null;let n=t.motor;return{x:n.position.x,y:n.position.y,z:n.position.z,vx:n.velocity.x,vy:n.velocity.y,vz:n.velocity.z,speed:n.speed,mode:n.mode,grounded:n.grounded,crouched:n.crouched,swimming:n.swimming,waterDepth:n.waterDepth,surface:n.surface,facing:t.facing,aimYaw:t.aimYaw,aimPitch:t.aimPitch,health:t.health,alive:t.alive,state:t.state,anim:{mode:t.anim.mode,phase:t.anim.phase,...t.anim.metrics},headYaw:Go(t,`head`),headPitch:Math.asin(Math.max(-1,Math.min(1,t.anim.partFacing(`head`,Wo).y))),chestYaw:Go(t,`chest`),hipsYaw:Go(t,`hips`),altitude:e.drop.altitude(t),cash:t.cash,items:{...t.inventory.counts},armor:t.armor,prompt:e.controller?.prompt??``,vehicle:t.vehicle?{kind:t.vehicle.kind,name:t.vehicle.name,seat:t.seat,driver:t.vehicle.driver===t,speed:t.vehicle.speed,x:t.vehicle.position.x,y:t.vehicle.position.y,z:t.vehicle.position.z,yaw:t.vehicle.yaw,health:t.vehicle.health}:null,camYaw:e.camera.yaw,camPitch:e.camera.pitch}},census:()=>{let t=e.world,n=t.layout;return{buildings:t.city.buildings.length,palms:t.props.palms.length,lamps:t.props.lamps.length,bridges:n.segments.filter(e=>e.bridge).length,roads:n.segments.length,piers:n.piers.length,shops:n.lots.filter(e=>e.use===`shop`).length,pois:n.pois.length,colliders:e.physics.world.colliders.len()}}};return window.__eyewall=t,t}function Yo(e){let t=e.engine?.renderer.getContext();if(!t)return`none`;let n=t.getExtension(`WEBGL_debug_renderer_info`);return String(n?t.getParameter(n.UNMASKED_RENDERER_WEBGL):t.getParameter(t.RENDERER))}var Xo=8,Zo=120,Qo=.42,$o=2,es=420,ts=.21,ns=new f,rs=new f,is=new f,as=new f,os=new f,ss=new f,cs=new f,ls=new f,us=new f,ds=new f(0,1,0),fs={asphalt:{color:7829370,sound:`impact_concrete`},concrete:{color:12169894,sound:`impact_concrete`},sand:{color:14864288,sound:`impact_sand`},grass:{color:8227672,sound:`impact_sand`},wood:{color:11110241,sound:`impact_wood`},metal:{color:12106946,sound:`impact_metal`},tile:{color:14275270,sound:`impact_concrete`},water:{color:15661307,sound:`impact_water`},flesh:{color:12071498,sound:`impact_body`},glass:{color:14677759,sound:`impact_glass`}};function ps(e){let t=e.inventory;return e.health>=e.maxHealth?null:e.health<=50&&t.has(`medkit`)?`medkit`:e.health<wo.bandage.healthCap&&t.has(`bandage`)?`bandage`:t.has(`medkit`)?`medkit`:null}function ms(e){let t=e.inventory;return e.armor>=e.maxArmor?null:e.armor<=40&&t.has(`vest`)?`vest`:t.has(`cola`)?`cola`:t.has(`vest`)?`vest`:null}function hs(e){return e.alive&&e.state===`normal`&&!e.motor.swimming}var gs=class e{game;asset;rng;views=new Map;flash=new Map;grenades=[];grenadeModel;lastHit=`none`;lastDamage=0;lastHeadshot=!1;constructor(e,t){this.game=e,this.asset=t,this.rng=new Bt(e.options.seed^3233871017);let n=t.scene.getObjectByName(`grenade-a`);if(!n)throw Error(`grenade model is missing`);this.grenadeModel=n,e.events.on(`hurt`,({target:t,info:n})=>{this.flash.set(t,1);let r=e.player;n.by&&n.by===r&&t!==r&&e.sound(n.headshot?`headshot`:`hit_marker`),t===r&&(e.sound(`damage`),e.camera.shake(.18))}),e.events.on(`kill`,({victim:t,info:n})=>{t.motor.collider.setCollisionGroups(Dt(It.ragdoll,It.world)),t.loadout.reloading=0,t.loadout.using=null,t.aiming=0,n.by===e.player&&t!==e.player&&e.sound(`kill_confirm`)})}static async create(t){return new e(t,await t.assets.loadModel(`models/weapons.glb`))}reset(e){e.loadout.clear(),e.inventory.clear(),e.aiming=0,e.kills=0,e.lastHurtBy=null,e.motor.collider.setCollisionGroups(Ut.character),this.views.get(e)?.show(null,null)}clear(){for(let e of this.grenades)this.game.physics.removeBody(e.body),e.mesh.removeFromParent();this.grenades.length=0}equip(e,t){let n=e.loadout;n.has(t)&&n.current!==t&&(n.current=t,n.drawing=Co[t].draw,n.reloading=0,n.bloom=0,n.burst=0,n.using=null,this.game.sound(`equip`,e.position,.7))}spreadOf(e){let t=e.loadout.weapon;if(!t)return 0;let n=G(t.spread,t.aimSpread,e.aiming),r=e.motor;return r.grounded?(n*=1+Math.min(1,r.speed/6)*.9,r.crouched&&(n*=.75)):n=n*1.8+.02,n+e.loadout.bloom}fixedUpdate(e){let t=this.game.characters;for(let n=0;n<t.length;n++)this.step(t[n],e);for(let t=this.grenades.length-1;t>=0;t--){let n=this.grenades[t];if(n.fuse-=e,n.fuse>0)continue;let r=n.body.translation();this.grenades.splice(t,1),this.game.physics.removeBody(n.body),n.mesh.removeFromParent(),this.explode(r.x,r.y,r.z,n.by)}}step(e,t){let n=e.loadout,r=e.act;n.sinceShot+=t,n.cooldown=Math.max(0,n.cooldown-t),n.drawing=Math.max(0,n.drawing-t);let i=n.weapon;if(n.bloom>0&&n.sinceShot>(i?Math.max(.1,90/i.rpm):0)&&(n.bloom=Math.max(0,n.bloom-(i?.settle??.1)*t)),n.sinceShot>.35&&(n.burst=0),!hs(e)){n.reloading=0,n.using=null,n.throwing=0,e.aiming=0,n.triggerHeld=r.fire,r.slot=null,r.cycle=0,r.use=null,r.throw=!1,r.reload=!1;return}if(r.slot&&n.has(r.slot))this.equip(e,r.slot);else if(r.cycle!==0){let t=n.carried();if(t.length>0){let i=n.current?t.indexOf(n.current):-1;this.equip(e,t[(i+Math.sign(r.cycle)+t.length)%t.length])}}r.slot=null,r.cycle=0,n.using?(n.useLeft-=t,r.fire&&!n.triggerHeld?(n.using=null,e.anim.stop(`upper`)):n.useLeft<=0&&this.finishUse(e,n.using)):r.use&&n.throwing<=0&&this.startUse(e,r.use),r.use=null,n.throwing>0?(n.throwing-=t,n.throwing<=0&&this.release(e)):r.throw&&!n.using&&e.inventory.has(`grenade`)&&(n.throwing=Qo,n.reloading=0,e.anim.play(`OverhandThrow`,{layer:`upper`,speed:1.5,fadeIn:.08,fadeOut:.25})),r.throw=!1;let a=n.weapon,o=n.heldNow,s=n.using!==null||n.throwing>0,c=e.input.sprint&&e.motor.grounded&&e.motor.speed>5.6,l=a!==null&&!s&&n.reloading<=0&&n.drawing<=0&&!c;e.aiming=Ue(e.aiming,r.aim&&l?1:0,t*7),!a||!o||s?(n.triggerHeld=r.fire,r.reload=!1):(n.reloading>0?(n.reloading-=t,a.shellReload&&r.fire&&!n.triggerHeld&&o.mag>0?(n.reloading=0,e.anim.stop(`upper`)):n.reloading<=0&&(n.reloading=0,a.shellReload?(o.mag+=e.inventory.remove(a.ammo,1),o.mag<a.mag&&e.inventory.has(a.ammo)&&this.startReload(e,a,o)):o.mag+=e.inventory.remove(a.ammo,a.mag-o.mag))):(r.reload||o.mag===0&&n.cooldown<=0)&&o.mag<a.mag&&e.inventory.has(a.ammo)&&n.drawing<=0&&this.startReload(e,a,o),r.reload=!1,r.fire&&(a.auto||!n.triggerHeld)&&n.cooldown<=0&&n.drawing<=0&&n.reloading<=0&&(o.mag>0?this.shoot(e,a,o):n.triggerHeld||(this.game.sound(`dry_fire`,e.position,.8),n.cooldown=.25)),n.triggerHeld=r.fire)}startReload(e,t,n){let r=e.loadout,i=t.reload*xo[n.tier].reload;r.reloading=i,r.reloadTotal=i,e.anim.play(`Pistol_Reload`,{layer:`upper`,speed:Math.max(.6,1.67/i),fadeIn:.1,fadeOut:.2}),this.game.sound(t.shellReload?`shell`:`reload`,e.position,.8)}startUse(e,t){let n=wo[t];if(!e.inventory.has(t)||n.health>0&&e.health>=n.healthCap||n.armor>0&&e.armor>=e.maxArmor)return;let r=e.loadout;r.using=t,r.useLeft=n.time,r.reloading=0,e.anim.play(`Consume`,{layer:`upper`,speed:Math.max(.5,1.33/n.time),fadeIn:.15,fadeOut:.25,hold:!0})}finishUse(e,t){let n=wo[t],r=e.loadout;r.using=null,r.drawing=.25,e.anim.stop(`upper`),e.inventory.remove(t,1)!==0&&(n.health>0&&(e.health=Math.max(e.health,Math.min(n.healthCap,e.health+n.health))),n.armor>0&&e.addArmor(n.armor),this.game.sound(`heal`,e.position,.8),this.game.events.emit(`used`,{who:e,item:t}))}eyeOf(e,t){return t.set(e.position.x,e.position.y+e.eyeHeight,e.position.z)}aimDir(e,t){if(this.eyeOf(e,ns),t.subVectors(e.aimPoint,ns),t.lengthSq()<2.25){let n=Math.cos(e.aimPitch);return t.set(-Math.sin(e.aimYaw)*n,Math.sin(e.aimPitch),-Math.cos(e.aimYaw)*n)}return t.normalize()}shoot(e,t,n){let r=this.game,i=e.loadout;n.mag--,i.cooldown=60/t.rpm,i.sinceShot=0,i.shots++;let a=this.spreadOf(e);i.bloom=Math.min(t.bloomMax,i.bloom+t.bloom),this.eyeOf(e,ns),this.aimDir(e,rs),as.crossVectors(rs,ds),as.lengthSq()<1e-6&&as.set(1,0,0),as.normalize(),os.crossVectors(as,rs);let o=this.views.get(e);o?.hasMuzzle?cs.copy(o.muzzle):cs.copy(ns).addScaledVector(rs,.7).addScaledVector(as,.18).addScaledVector(os,-.16);let s=xo[n.tier];for(let n=0;n<t.pellets;n++){let n=Math.sqrt(this.rng.next())*a,r=this.rng.next()*Math.PI*2;is.copy(rs).addScaledVector(as,Math.cos(r)*n).addScaledVector(os,Math.sin(r)*n).normalize(),this.trace(e,t,s.damage,ns,is,cs)}r.fx.burst(`muzzle`,cs.x,cs.y,cs.z,{dx:rs.x,dy:rs.y,dz:rs.z}),r.fx.flash(cs.x,cs.y,cs.z,e.isPlayer?12:8),o?.hasMuzzle&&r.fx.burst(`shell`,o.port.x,o.port.y,o.port.z,{dx:as.x*.8+os.x*.6,dy:as.y*.8+os.y*.6,dz:as.z*.8+os.z*.6}),r.sound(t.sound,e.position);let c=1+Math.min(i.burst,8)*.07;if(i.burst++,e.anim.kick(t.kick),o?.kick(t.kick),e.isPlayer){let n=(1-e.aiming*.3)*(e.motor.crouched?.85:1)*c,i=t.recoil[0]*n,a=(this.rng.next()*2-1)*t.recoil[1]*n;r.camera.recoil(i,a),r.camera.pitch=W(r.camera.pitch+i*.3,-1.35,1.25),r.camera.yaw+=a*.3}r.events.emit(`shot`,{by:e,weapon:t.id,x:cs.x,y:cs.y,z:cs.z})}trace(e,t,n,r,i,a){let o=this.game,s=o.physics.raycast(r.x,r.y,r.z,i.x,i.y,i.z,es,Ut.queryBullet,e.motor.body),c=s?s.distance:es,l=!1;if(i.y<-.01&&r.y>0){let e=r.y/-i.y,t=o.env.waterHeight(r.x+i.x*e,r.z+i.z*e);t>-40&&(e=(r.y-t)/-i.y,e<c&&(c=e,l=!0))}if(ss.copy(r).addScaledVector(i,c),o.fx.tracer(a.x,a.y,a.z,ss.x,ss.y,ss.z,t.tracer),l){o.fx.burst(`splash`,ss.x,ss.y+.05,ss.z,{amount:.35}),o.sound(`impact_water`,ss,.6),this.note(`water`,0,!1);return}if(!s){this.note(`none`,0,!1);return}let u=c<=t.range[0]?1:c>=t.range[1]?t.falloff:G(1,t.falloff,(c-t.range[0])/(t.range[1]-t.range[0])),d=s.owner;if(d?.kind===`character`&&d.ref){let a=d.ref,s=this.isHeadshot(a,r,i,ss),c=t.damage*n*u*(s?t.headshot:1);e.loadout.hits++,s&&e.loadout.headshots++,o.fx.burst(`blood`,ss.x,ss.y,ss.z,{dx:-i.x,dy:.3,dz:-i.z}),o.sound(`impact_body`,ss,.8),this.note(`character`,c,s),o.hurt(a,c,{by:e,cause:`bullet`,weapon:t.id,headshot:s,dir:ls.copy(i),point:ss.clone()})}else d?.kind===`vehicle`&&d.ref?(d.ref.damage(t.damage*n*u*.45,e),this.impact(s,`metal`),this.note(`vehicle`,0,!1)):(this.impact(s,d?.surface??`concrete`),this.note(`world`,0,!1))}note(e,t,n){this.lastHit=e,this.lastDamage=t,this.lastHeadshot=n}impact(e,t){let n=this.game.fx,r=fs[t],{point:i,normal:a}=e;n.burst(t===`glass`?`glass`:`impact`,i.x,i.y,i.z,{dx:a.x,dy:a.y,dz:a.z,color:r.color}),t!==`glass`&&n.decal(i.x,i.y,i.z,a.x,a.y,a.z,t===`sand`||t===`grass`?.22:.15),this.game.sound(r.sound,i,.7)}isHeadshot(e,t,n,r){if(e.state!==`normal`)return!1;let i=e.position.y+e.eyeHeight;if(r.y<i-.3)return!1;us.set(e.position.x,i+.05,e.position.z),ls.subVectors(us,t);let a=ls.dot(n);return ls.lengthSq()-a*a<=ts*ts}release(e){let t=e.loadout;if(t.throwing=0,t.drawing=.3,e.inventory.remove(`grenade`,1)===0)return;let n=this.game;this.eyeOf(e,ns),this.aimDir(e,rs),as.crossVectors(rs,ds).normalize(),cs.copy(ns).addScaledVector(rs,.55).addScaledVector(as,.22).addScaledVector(ds,.12);let r=e.motor.velocity,i=n.physics.world.createRigidBody(ln.RigidBodyDesc.dynamic().setTranslation(cs.x,cs.y,cs.z).setLinvel(rs.x*17+r.x*.5,rs.y*17+4.2,rs.z*17+r.z*.5).setAngvel({x:7,y:3,z:-5}).setLinearDamping(.1).setAngularDamping(2.6).setCcdEnabled(!0)),a=n.physics.world.createCollider(ln.ColliderDesc.ball(.09).setRestitution(.24).setFriction(1.3).setDensity(2.2).setCollisionGroups(Dt(It.prop,It.world|It.vehicle|It.door|It.glass|It.prop)),i);n.physics.setOwner(a,{kind:`prop`,surface:`wood`});let o=this.grenadeModel.clone(!0);o.scale.setScalar(.62),o.traverse(e=>{e.isMesh&&(e.castShadow=!0)}),o.position.copy(cs),n.engine.scene.add(o),this.grenades.push({body:i,mesh:o,fuse:$o,by:e}),n.sound(`cloth_flap`,e.position,.5)}explode(e,t,n,r){let i=this.game,a=i.physics;i.fx.burst(`explosion`,e,t+.3,n);let o=a.raycast(e,t+.3,n,0,-1,0,2.5,Ut.queryWorld);o&&i.fx.decal(o.point.x,o.point.y,o.point.z,o.normal.x,o.normal.y,o.normal.z,3.2),i.sound(`crash`,{x:e,y:t,z:n},1),i.sound(`thunder`,{x:e,y:t,z:n},.7);for(let o of i.characters){if(!o.alive||o.state===`plane`)continue;ls.set(o.position.x,o.position.y+.95,o.position.z);let s=ls.x-e,c=ls.y-(t+.3),l=ls.z-n,u=Math.hypot(s,c,l);if(u>Xo)continue;let d=u>.4&&a.raycast(e,t+.3,n,s/u,c/u,l/u,u-.3,Ut.queryWorld)!==null,p=Zo*(1-u/Xo)**1.2*(d?.25:1);if(p<1)continue;let m=u>.001?1/u:0;i.hurt(o,p,{by:r,cause:`explosion`,weapon:`grenade`,dir:new f(s*m,0,l*m),point:new f(e,t,n)})}for(let a of i.vehicles){let i=Math.hypot(a.position.x-e,a.position.y-t,a.position.z-n);i<Xo&&a.damage(110*(1-i/Xo),r)}let s=i.engine.camera.position;i.camera.shake(W(1-Math.hypot(s.x-e,s.y-t,s.z-n)/40,0,1)*.9),i.events.emit(`blast`,{x:e,y:t,z:n,by:r})}frameUpdate(e){let t=this.game;for(let n of t.characters){let t=n.loadout,r=t.current!==null&&hs(n),i=this.views.get(n);if(!i){if(!t.current)continue;i=new Uo(n.rig,n.anim,this.asset),this.views.set(n,i)}let a=t.using!==null||t.throwing>0,o=r&&!a?t.current:null,s=null;if(n.alive){for(let e of[`sniper`,`rifle`,`shotgun`,`smg`])if(t.has(e)&&e!==o){s=e;break}}i.show(n.alive?o:null,s);let c=n.motor;i.lower=t.reloading>0||t.drawing>.1||c.mode===`slide`||n.input.sprint&&c.grounded&&c.speed>5.6,i.leftFree=t.reloading>0,n.anim.upperAim=+!!o;let l=this.flash.get(n);if(l!==void 0){let t=l-e*5;n.rig.setFlash(1,.35,.3,Math.max(0,t)*.55),t<=0?this.flash.delete(n):this.flash.set(n,t)}}for(let e of this.grenades){let t=e.body.translation(),n=e.body.rotation();e.mesh.position.set(t.x,t.y-.07,t.z),e.mesh.quaternion.set(n.x,n.y,n.z,n.w)}}viewOf(e){return this.views.get(e)}get live(){return this.grenades.length}},_s=function(e){return e[e.Water=0]=`Water`,e[e.Road=1]=`Road`,e[e.Sidewalk=2]=`Sidewalk`,e[e.Building=3]=`Building`,e[e.Sand=4]=`Sand`,e[e.Grass=5]=`Grass`,e[e.Plaza=6]=`Plaza`,e[e.Pier=7]=`Pier`,e[e.Bridge=8]=`Bridge`,e[e.Yard=9]=`Yard`,e[e.Pool=10]=`Pool`,e[e.Lot=11]=`Lot`,e}({}),vs=[[0,V.streetY+V.kerb],[8,1.95],[26,1.3],[52,0],[86,-2],[120,-4]];function ys(e){let t=vs;if(e<=t[0][0])return t[0][1];for(let n=0;n+1<t.length;n++){let r=t[n],i=t[n+1];if(e<=i[0])return G(r[1],i[1],(e-r[0])/(i[0]-r[0]))}return-4}function bs(e,t,n){let r=e.beach.rect;if(t<r.x0)return-4;let i=pn(r,t,n),a=ys(i);if(i>6&&i<44){let e=(Ke(t*.06,n*.06,3,7)-.5)*.55*I(6,16,i)*(1-I(30,44,i));a+=e}return(n<r.z0||n>r.z1)&&(a=G(-4,a,I(r.x0,r.x0+40,t))),a}function xs(e,t,n){let r=1-Math.hypot(t-e.x,n-e.z)/e.r;return r>=0?e.h*I(0,1,r)+(Ke(t*.09,n*.09,2,3)-.5)*.3*r:G(0,-4,at(-r*1.3))}var Ss=class{layout;size=1024;cell=V.half*2/1024;type=new Uint8Array(1048576);height=new Float32Array(1048576);shore=new Float32Array(1048576);constructor(e){this.layout=e,this.height.fill(-4);let t=V.streetY,n=V.streetY+V.kerb,r=e.beach.rect;this.eachCell({x0:r.x0,x1:Math.min(V.half,r.x1+130),z0:-V.half,z1:V.half},(t,n,r)=>{let i=bs(e,n,r);i>this.height[t]&&(this.height[t]=i),i>.02&&(this.type[t]=4)});for(let t of e.islets)this.eachCell({x0:t.x-t.r*2,x1:t.x+t.r*2,z0:t.z-t.r*2,z1:t.z+t.r*2},(e,n,r)=>{let i=xs(t,n,r);i>this.height[e]&&(this.height[e]=i),i>.02&&(this.type[e]=4)});for(let n of e.islands)this.fill(n.rect,1,t);for(let r of e.blocks)r.kind===`yard`?this.fill(r.rect,9,t):r.kind===`park`?this.fill(r.rect,5,n):r.kind===`plaza`?this.fill(r.rect,6,n):this.fill(r.rect,2,n);for(let t of e.lots)t.use===`parking`?this.fill(t.rect,11,n):t.use===`garden`?this.fill(t.rect,5,n):t.use===`pool`&&this.fill(t.rect,11,n);for(let t of e.piers)this.fill(t.rect,7,t.y);for(let n of e.segments){if(!n.bridge)continue;let e=n.axis===`z`?{x0:n.c-n.w/2,x1:n.c+n.w/2,z0:n.a,z1:n.b}:{x0:n.a,x1:n.b,z0:n.c-n.w/2,z1:n.c+n.w/2};this.eachCell(e,(e,r,i)=>{let a=((n.axis===`z`?i:r)-n.a)/(n.b-n.a);this.type[e]=8,this.height[e]=t+un(a,n.bridge.rise)})}this.computeShore()}markBuilding(e,t){this.fill(e,3,t)}markRect(e,t,n){this.eachCell(e,e=>{this.type[e]=t,n!==void 0&&(this.height[e]=n)})}fill(e,t,n){this.eachCell(e,e=>{this.type[e]=t,this.height[e]=n})}eachCell(e,t){let n=this.size,r=this.cell,i=W(Math.ceil((e.x0+V.half)/r-.5),0,n-1),a=W(Math.floor((e.x1+V.half)/r-.5),0,n-1),o=W(Math.ceil((e.z0+V.half)/r-.5),0,n-1),s=W(Math.floor((e.z1+V.half)/r-.5),0,n-1);for(let e=o;e<=s;e++){let o=(e+.5)*r-V.half;for(let s=i;s<=a;s++)t(e*n+s,(s+.5)*r-V.half,o)}}computeShore(){let e=this.size,t=this.shore,n=60/this.cell;for(let e=0;e<t.length;e++)t[e]=this.isLandIndex(e)?0:n;let r=Math.SQRT2;for(let n=0;n<e;n++)for(let i=0;i<e;i++){let a=n*e+i,o=t[a];o!==0&&(i>0&&(o=Math.min(o,t[a-1]+1)),n>0&&(o=Math.min(o,t[a-e]+1),i>0&&(o=Math.min(o,t[a-e-1]+r)),i<e-1&&(o=Math.min(o,t[a-e+1]+r))),t[a]=o)}for(let n=e-1;n>=0;n--)for(let i=e-1;i>=0;i--){let a=n*e+i,o=t[a];o!==0&&(i<e-1&&(o=Math.min(o,t[a+1]+1)),n<e-1&&(o=Math.min(o,t[a+e]+1),i<e-1&&(o=Math.min(o,t[a+e+1]+r)),i>0&&(o=Math.min(o,t[a+e-1]+r))),t[a]=o)}for(let e=0;e<t.length;e++)t[e]=t[e]*this.cell}isLandIndex(e){let t=this.type[e];return t!==0&&t!==7&&t!==8}index(e,t){let n=this.size,r=W(Math.floor((e+V.half)/this.cell),0,n-1);return W(Math.floor((t+V.half)/this.cell),0,n-1)*n+r}typeAt(e,t){return this.type[this.index(e,t)]}heightAt(e,t){return this.height[this.index(e,t)]}isWater(e,t){return Math.abs(e)>V.half||Math.abs(t)>V.half||this.type[this.index(e,t)]===0}isLand(e,t){return Math.abs(e)>V.half||Math.abs(t)>V.half?!1:this.isLandIndex(this.index(e,t))}bilinear(e,t,n){let r=this.size,i=W((t+V.half)/this.cell-.5,0,r-1.001),a=W((n+V.half)/this.cell-.5,0,r-1.001),o=Math.floor(i),s=Math.floor(a),c=i-o,l=a-s,u=s*r+o;return G(G(e[u],e[u+1],c),G(e[u+r],e[u+r+1],c),l)}shoreDistance(e,t){return Math.abs(e)>V.half||Math.abs(t)>V.half?60:this.bilinear(this.shore,e,t)}waveAmp(e,t){let n=this.shoreDistance(e,t);return .035+I(6,58,n)*G(.42,1,I(300,420,e))*.965}},Cs=function(e){return e[e.Blocked=0]=`Blocked`,e[e.Land=1]=`Land`,e[e.Road=2]=`Road`,e[e.Water=3]=`Water`,e[e.Exit=4]=`Exit`,e}({}),ws=512,Ts=ws*ws,Es=Dt(65535,It.world|It.prop|It.door|It.glass),Ds=[0,10,15,42,12],Os=14,ks=Math.SQRT2,As=45,js=mn.steps*mn.run,Ms=[1,-1,0,0,1,1,-1,-1],Ns=[0,0,1,-1,1,-1,1,-1],Ps=class{field;size=ws;cell=V.half*2/ws;kind=new Uint8Array(Ts);open=new Float32Array(Ts);cost=new Uint8Array(Ts);under=new Uint8Array(Ts);g=new Float32Array(Ts);parent=new Int32Array(Ts);stamp=new Uint32Array(Ts);closed=new Uint32Array(Ts);search=0;heap=[];heapF=[];chain=[];buildMs=0;counts=[0,0,0,0,0];searches=0;expanded=0;exits=[];stairOf=new Int16Array(Ts);stairs=[];constructor(e,t,n){this.field=e;let r=performance.now(),i=ws,a=this.cell,o=a/4,s=this.kind;for(let t=0;t<i;t++){let r=(t+.5)*a-V.half;for(let c=0;c<i;c++){let l=(c+.5)*a-V.half,u=0,d=0,f=0,p=!1;for(let t=0;t<4&&!p;t++){let i=l+(t&1?o:-o),a=r+(t&2?o:-o),s=e.index(i,a),c=e.type[s];if(c===_s.Water){if(u++,e.isWater(i-2.6,a)&&e.isWater(i+2.6,a)&&e.isWater(i,a-2.6)&&e.isWater(i,a+2.6))continue;let t=n.raycast(i,2.4,a,0,-1,0,3.6,Es);t&&t.distance>.5&&(t.owner?.surface!==`sand`||Math.abs(t.normal.y)<.7)&&(p=!0);continue}if(c===_s.Building||c===_s.Pool){p=!0;break}c===_s.Road||c===_s.Yard?d++:c===_s.Sand&&f++;let m=e.height[s],h=n.raycast(i,m+2.2,a,0,-1,0,3.4,Es);(!h||h.distance<1.6||h.distance>3.1)&&(p=!0)}if(!p&&u===0){let t=e.height[e.index(l,r)]+.6,i=n.raycast(l-a/2,t,r,1,0,0,a,Es);if(i&&Math.abs(i.normal.y)<.4)p=!0;else{let e=n.raycast(l,t,r-a/2,0,0,1,a,Es);e&&Math.abs(e.normal.y)<.4&&(p=!0)}}let m;m=p?0:u===4?3:u>0?f+u===4?4:0:d>=2?2:1,s[t*i+c]=m}}this.computeOpen();for(let e=0;e<i;e+=3)for(let t=0;t<i;t+=3){let n=e*i+t;if(s[n]!==4)continue;let r=this.cellX(n),a=this.cellZ(n);this.nearestOpen(r,a,2.5,30,Fs)&&this.exits.push({x:r,z:a,inX:Fs.x,inZ:Fs.z})}let c=this.stairOf;for(let e=0;e<t.stairs.length;e++){let n=t.stairs[e],r=n.dir===`e`?1:n.dir===`w`?-1:0,i=n.dir===`s`?1:n.dir===`n`?-1:0;for(let t=js+1.2;t>=-2.2;t-=.6){let a=this.index(n.x+r*t,n.z+i*t);t>=js-1?s[a]=4:c[a]!==e+1&&(s[a]=1),c[a]=e+1}for(let t=0;t<js-1.6;t+=.6)for(let a=-n.width/2;a<=n.width/2+.01;a+=n.width/6){let o=this.index(n.x+r*t-i*a,n.z+i*t+r*a);c[o]!==e+1&&s[o]===3&&(s[o]=0)}this.stairs.push({x:n.x+r*(js+.6),z:n.z+i*(js+.6),topX:n.x-r*1.2,topZ:n.z-i*1.2})}for(let t=0;t<Ts;t++){let n=e.type[e.index(this.cellX(t),this.cellZ(t))];(n===_s.Bridge||n===_s.Pier)&&(this.under[t]=1)}for(let e of t.stairs){let t=e.dir===`e`?1:e.dir===`w`?-1:0,n=e.dir===`s`?1:e.dir===`n`?-1:0;this.exits.push({x:e.x+t*(js+.6),z:e.z+n*(js+.6),inX:e.x-t*3,inZ:e.z-n*3})}for(let e=0;e<Ts;e++)this.counts[s[e]]++;for(let e=0;e<i;e++)for(let t=0;t<i;t++){let n=e*i+t,r=s[n],a=Ds[r];if(r===1||r===2)for(let n=0;n<8;n++){let r=t+Ms[n],o=e+Ns[n];if(r<0||o<0||r>=i||o>=i||s[o*i+r]===0){a+=Os;break}}this.cost[n]=a}this.buildMs=performance.now()-r}computeOpen(){let e=ws,t=this.open,n=this.kind,r=30/this.cell;for(let e=0;e<Ts;e++)t[e]=n[e]===1||n[e]===2?r:0;for(let n=0;n<e;n++)for(let r=0;r<e;r++){let i=n*e+r,a=t[i];a!==0&&(a=r>0?Math.min(a,t[i-1]+1):Math.min(a,1),n>0?(a=Math.min(a,t[i-e]+1),r>0&&(a=Math.min(a,t[i-e-1]+ks)),r<511&&(a=Math.min(a,t[i-e+1]+ks))):a=Math.min(a,1),t[i]=a)}for(let n=511;n>=0;n--)for(let r=511;r>=0;r--){let i=n*e+r,a=t[i];a!==0&&(r<511&&(a=Math.min(a,t[i+1]+1)),n<511&&(a=Math.min(a,t[i+e]+1),r<511&&(a=Math.min(a,t[i+e+1]+ks)),r>0&&(a=Math.min(a,t[i+e-1]+ks))),t[i]=a)}for(let e=0;e<Ts;e++)t[e]=t[e]*this.cell}index(e,t){let n=this.cell,r=Math.min(511,Math.max(0,Math.floor((e+V.half)/n)));return Math.min(511,Math.max(0,Math.floor((t+V.half)/n)))*ws+r}cellX(e){return(e%ws+.5)*this.cell-V.half}cellZ(e){return(Math.floor(e/ws)+.5)*this.cell-V.half}kindAt(e,t){return this.kind[this.index(e,t)]}walkable(e,t){let n=this.kind[this.index(e,t)];return n===1||n===2||n===4}openness(e,t){return this.open[this.index(e,t)]}nearestOpen(e,t,n,r,i){let a=ws,o=this.cell,s=Math.min(511,Math.max(0,Math.floor((e+V.half)/o))),c=Math.min(511,Math.max(0,Math.floor((t+V.half)/o))),l=Math.ceil(r/o),u=this.open,d=this.kind,f=e=>n>0?u[e]>=n:d[e]===1||d[e]===2||d[e]===4,p=-1,m=1/0;for(let n=0;n<=l&&!(p>=0&&n*o>Math.sqrt(m)+o);n++)for(let r=c-n;r<=c+n;r++){if(r<0||r>=a)continue;let i=r===c-n||r===c+n;for(let c=s-n;c<=s+n;c+=i?1:2*n||1){if(c<0||c>=a)continue;let n=r*a+c;if(!f(n))continue;let i=(c+.5)*o-V.half-e,s=(r+.5)*o-V.half-t,l=i*i+s*s;l<m&&(m=l,p=n)}}return p<0?!1:(i.x=this.cellX(p),i.z=this.cellZ(p),!0)}nearestExit(e,t){let n=null,r=1/0;for(let i of this.exits){let a=(i.x-e)*(i.x-e)+(i.z-t)*(i.z-t);a<r&&(r=a,n=i)}return n}nearestKind(e,t,n,r){let i=ws,a=this.cell,o=Math.min(511,Math.max(0,Math.floor((e+V.half)/a))),s=Math.min(511,Math.max(0,Math.floor((t+V.half)/a))),c=-1,l=1/0;for(let u=Math.max(0,s-r);u<=Math.min(511,s+r);u++)for(let s=Math.max(0,o-r);s<=Math.min(511,o+r);s++){let r=u*i+s;if(this.kind[r]!==n)continue;let o=Math.hypot((s+.5)*a-V.half-e,(u+.5)*a-V.half-t);o<l&&(l=o,c=r)}return c}randomOpen(e,t,n,r,i,a){for(let o=0;o<14;o++){let o=e.range(0,Math.PI*2),s=r*Math.sqrt(e.next()),c=t+Math.cos(o)*s,l=n+Math.sin(o)*s,u=this.index(c,l),d=this.kind[u];if((d===1||d===2)&&!(this.open[u]<i))return a.x=this.cellX(u),a.z=this.cellZ(u),!0}return this.nearestOpen(t,n,i,r,a)}lineOpen(e,t,n,r,i=!1){let a=n-e,o=r-t,s=Math.hypot(a,o);if(s<.01)return!0;let c=this.kind,l=this.under,u=this.index(e,t),d=this.index(n,r),f=(c[u]===3||i&&l[u]===1)&&(c[d]===3||i&&l[d]===1),p=a/s,m=o/s,h=-m*.55,g=p*.55,_=Math.ceil(s/1.1);for(let n=0;n<=_;n++){let r=n/_*s,a=e+p*r,o=t+m*r;for(let e=-1;e<=1;e++){let t=this.index(a+h*e,o+g*e),n=c[t];if(f){if(n!==3&&!(i&&l[t]===1))return!1}else if(n===0||n===3)return!1}}return!0}push(e,t){let n=this.heap,r=this.heapF,i=n.length;for(n.push(e),r.push(t);i>0;){let e=i-1>>1;if(r[e]<=t)break;n[i]=n[e],r[i]=r[e],i=e}n[i]=e,r[i]=t}pop(){let e=this.heap,t=this.heapF,n=e[0],r=e.pop(),i=t.pop(),a=e.length;if(a>0){let n=0;for(;;){let r=n*2+1;if(r>=a||(r+1<a&&t[r+1]<t[r]&&r++,t[r]>=i))break;e[n]=e[r],t[n]=t[r],n=r}e[n]=r,t[n]=i}return n}findPath(e,t,n,r,i,a=!1,o=3e4){i.length=0;let s=ws,c=this.kind,l=this.under,u=Fs,d=this.index(e,t);if(a&&l[d]===0&&c[d]!==3&&c[d]!==4){let n=this.nearestKind(e,t,3,6);if(n<0)return!1;d=n}else if(c[d]===0){if(!this.nearestOpen(e,t,0,60,u))return!1;d=this.index(u.x,u.z)}let f=this.index(n,r),p=!0;if(c[f]===0||c[f]===3&&c[d]!==3){if(!this.nearestOpen(n,r,0,40,u))return!1;f=this.index(u.x,u.z),p=!1}if(this.searches++,d===f)return i.push(p?n:this.cellX(f),p?r:this.cellZ(f)),!0;let m=++this.search,h=this.g,g=this.parent,_=this.stamp,v=this.closed,y=this.cost,b=f%s,x=Math.floor(f/s);this.heap.length=0,this.heapF.length=0,h[d]=0,g[d]=-1,_[d]=m,this.push(d,0);let S=d,C=1/0,w=!1,T=0;for(;this.heap.length>0;){let e=this.pop();if(v[e]===m)continue;if(v[e]=m,e===f){w=!0;break}if(++T>o)break;let t=e%s,n=(e-t)/s,r=a&&l[e]===1?3:c[e],i=h[e];for(let o=0;o<8;o++){let u=t+Ms[o],d=n+Ns[o];if(u<0||d<0||u>=s||d>=s)continue;let f=d*s+u;if(v[f]===m)continue;let p=a&&l[f]===1?3:c[f];if(p===0||p===3&&r!==3||(p===1||p===2)&&r===3)continue;if(o>=4){let e=c[n*s+u],i=c[d*s+t];if(e===0||i===0||r!==3&&(e===3||i===3))continue}let w=i+y[f]*(o>=4?ks:1);if(_[f]===m&&h[f]<=w)continue;_[f]=m,h[f]=w,g[f]=e;let T=Math.abs(u-b),E=Math.abs(d-x),D=10*(Math.max(T,E)+(ks-1)*Math.min(T,E));D<C&&(C=D,S=f),this.push(f,w+D)}}this.expanded+=T;let E=w?f:S;if(E===d)return!1;let D=this.chain;D.length=0;for(let e=E;e!==-1;e=g[e])D.push(e);D.reverse();let O=e,k=t,A=0,j=this.stairOf;for(let e=a&&j[d]>0?0:1;e<D.length;e++){let t=D[e],n=this.cellX(t),r=this.cellZ(t),o=j[t];if(a&&o>0&&c[t]===4){let t=this.stairs[o-1];for(e>A+1&&i.push(this.cellX(D[e-1]),this.cellZ(D[e-1])),i.push(t.x,t.z,t.topX,t.topZ);e+1<D.length&&j[D[e+1]]===o;)e++;O=t.topX,k=t.topZ,A=e,a=!1;continue}let s=Math.hypot(n-O,r-k)>As;if(e>A+1&&(s||!this.lineOpen(O,k,n,r,a))){let t=D[e-1];O=this.cellX(t),k=this.cellZ(t),i.push(O,k),A=e-1}}return w&&p?i.push(n,r):i.push(this.cellX(E),this.cellZ(E)),w}},Fs={x:0,z:0},Is=Dt(65535,It.world|It.prop|It.door|It.glass|It.vehicle),Ls={shotgun:7,smg:13,pistol:15,rifle:27,sniper:55};function Rs(e,t){switch(e){case`shotgun`:return t<11?10:t<20?4:.5;case`smg`:return t<22?8:t<40?5:1.5;case`rifle`:return t<8?6:t<90?9:5;case`pistol`:return t<30?4.5:3;case`sniper`:return t<25?1:t<50?5:10}}var zs=new f,Bs={x:0,z:0},Vs=[],Hs=class e{c;game;bots;mode=`parked`;skill=.5;nerve=.5;rng;path=[];at=0;goalX=0;goalZ=0;hasGoal=!1;arrived=!1;wantPlan=!1;legX=0;legZ=0;stuckCheck=0;stuck=0;fromX=0;fromZ=0;dodgeFor=0;dodgeX=0;dodgeZ=0;feelIn=0;pause=0;target=null;sees=!1;seenFor=0;lostFor=0;react=0;last=new f;senseIn=0;thinkIn=0;heardX=0;heardZ=0;heardAge=99;yaw=0;pitch=0;errYaw=0;errPitch=0;offYaw=0;offPitch=0;errIn=0;burst=0;rest=0;swapIn=0;nadeIn=6;throwFor=0;throwYaw=0;throwPitch=0;side=1;sideIn=0;box=null;item=null;waitFor=0;direct=!1;opened=0;skip=new Set;travelled=0;heals=0;thrown=0;landed=!1;constructor(e,t,n,r){this.c=e,this.game=t,this.bots=n,this.rng=r}reset(e){this.rng=e,this.skill=W(.5+e.gauss()*.3+(e.chance(.12)?.25:0),.12,.97),this.nerve=W(.5+e.gauss()*.4,.05,1),this.mode=`parked`,this.path.length=0,this.hasGoal=!1,this.arrived=!1,this.wantPlan=!1,this.stuck=0,this.dodgeFor=0,this.pause=0,this.target=null,this.sees=!1,this.heardAge=99,this.burst=0,this.rest=0,this.swapIn=0,this.nadeIn=e.range(4,12),this.throwFor=0,this.box=null,this.item=null,this.waitFor=0,this.direct=!1,this.opened=0,this.skip.clear(),this.travelled=0,this.heals=0,this.thrown=0,this.landed=!1,this.senseIn=e.range(0,.2),this.thinkIn=e.range(0,.3),this.quiet()}quiet(){let e=this.c;e.input.moveX=0,e.input.moveZ=0,e.input.sprint=!1,e.input.crouch=!1,e.input.walk=!1,e.act.fire=!1,e.act.aim=!1}step(t){let n=this.c;if(!n.alive){this.mode!==`dead`&&(this.mode=`dead`,this.target=null,this.box=null,this.quiet());return}if(n.state!==`normal`){this.mode=this.game.match.running?`drop`:`parked`,n.act.fire=!1,n.act.aim=!1;return}(this.mode===`drop`||this.mode===`parked`)&&(this.mode=`roam`,this.landed=!0,this.yaw=n.facing,this.pitch=0,this.hasGoal=!1,this.thinkIn=this.rng.range(.15,.7),this.fromX=n.position.x,this.fromZ=n.position.z),this.heardAge+=t,this.nadeIn-=t,this.swapIn-=t,this.pause-=t,this.waitFor-=t,(this.senseIn-=t)<=0&&(this.senseIn=.2,this.sense());let r=this.target;r&&(!r.alive||r.state===`plane`?this.forget():this.sees?(this.seenFor+=t,this.lostFor=0,this.last.set(r.position.x,r.position.y+e.chest(r),r.position.z)):(this.lostFor+=t,this.lostFor>8&&this.forget())),(this.thinkIn-=t)<=0&&(this.thinkIn=.3,this.think()),this.aim(t),this.hands(t),this.move(t)}forget(){this.target=null,this.sees=!1,this.seenFor=0,this.lostFor=0}static chest(e){return e.state===`seated`?.9:e.motor.crouched?.72:1.18}canSee(t,n){let r=this.c,i=r.position,a=t.position,o=i.y+r.eyeHeight,s=a.x-i.x,c=a.y+e.chest(t)-o,l=a.z-i.z,u=Math.hypot(s,c,l);if(u<.6)return!0;let d=this.game.physics.raycast(i.x,o,i.z,s/u,c/u,l/u,Math.max(.1,u-.35),Is);return!d||t.vehicle!==null&&d.owner?.ref===t.vehicle&&n<60}sense(){let t=this.c,n=this.game,r=this.bots,i=t.position,a=G(55,100,this.skill)*(1-.3*n.world.sky.night),o=t.sinceHurtBy<5?t.lastHurtBy:null;Vs.length=0;for(let e of n.characters){if(e===t||!e.alive||e.state!==`normal`&&e.state!==`seated`)continue;let n=e.position,s=n.x-i.x,c=n.y-i.y,l=n.z-i.z,u=Math.hypot(s,c,l);if(u>a||e!==o&&u>12&&r.botOf(e)?.armed===!1)continue;let d=e===this.target||e===o||u<9;if(d||=Math.abs(At(this.yaw,Qt(s,l)))<1.75,!d){let t=r.lastShot.get(e);d=t!==void 0&&r.time-t<2&&u<85}if(!d)continue;let f=u;e===this.target&&(f*=.7),e===o&&(f*=.6),Vs.push({o:e,d:u,score:f})}Vs.sort((e,t)=>e.score-t.score);let s=null,c=0;for(let e=0;e<Vs.length&&e<3;e++){let t=Vs[e];if(this.canSee(t.o,t.d)){s=t.o,c=t.d;break}}s?(s!==this.target&&(this.target=s,this.seenFor=0,this.react=G(.8,.3,this.skill)+c/150+this.rng.range(0,.25),this.errIn=0),this.sees=!0,this.lostFor=0,this.last.set(s.position.x,s.position.y+e.chest(s),s.position.z)):this.sees=!1}hear(e,t){this.heardX=e,this.heardZ=t,this.heardAge=0}hurtBy(t){this.c.alive&&t!==this.c&&t.alive&&(this.errYaw+=this.rng.gauss()*.07,this.errPitch+=this.rng.gauss()*.04,this.target&&this.sees||(this.target=t,this.sees=!1,this.seenFor=0,this.lostFor=0,this.react=G(.5,.2,this.skill),this.last.set(t.position.x,t.position.y+e.chest(t),t.position.z),this.senseIn=0,this.thinkIn=Math.min(this.thinkIn,.05)))}usable(e){let t=this.c.loadout.held[e];return t!==void 0&&(t.mag>0||this.c.inventory.has(Co[e].ammo))}get armed(){for(let e of eo)if(this.usable(e))return!0;return!1}stormUrgency(){let e=this.game.zone;if(e.stage===`idle`)return 0;let t=this.c.position,n=e.toWall(t.x,t.z);if(n<3)return 2;let r=e.outsideNext(t.x,t.z)+6;if(r<=0||e.stage===`closed`)return 0;let i=r/4.3,a=e.closesIn;return a<i+4||e.stage===`shrink`&&n<20&&e.damage>=2?2:+(a<i+14+(1-this.nerve)*22)}wantsPatch(){let e=this.c;return e.health<62&&ps(e)?!0:e.armor<45&&e.sinceHurt>4&&ms(e)!==null}shouldRetreat(){let e=this.c;return e.health+e.armor*.5<34+(1-this.nerve)*14&&ps(e)!==null}wantsLoot(){let e=this.c,t=e.loadout.carried();if(t.length===0)return!0;if(this.opened>=5)return!this.armed;let n=0;for(let r of t)n+=e.loadout.held[r].mag+e.inventory.count(Co[r].ammo);return t.length<2||n<60||this.opened<2||!e.inventory.has(`bandage`)&&!e.inventory.has(`medkit`)}useful(e){if(e.item===`cash`)return!1;if($a[e.item].kind!==`ammo`)return!0;for(let t of eo)if(this.c.loadout.held[t]&&Co[t].ammo===e.item)return!0;return!1}pickLoot(e=!1){let t=this.c,n=this.game,r=n.loot,i=n.nav,a=n.zone,o=t.position,s=this.box;if(s&&!s.opened&&!this.skip.has(s.id)){if(!this.arrived)return!0;if(Math.hypot(s.x-o.x,s.z-o.z)<4.5&&!this.direct)return this.direct=!0,this.path.length=0,this.path.push(s.x,s.z),this.at=0,this.arrived=!1,this.wantPlan=!1,!0;this.skip.add(s.id)}if(this.direct=!1,this.item&&r.pickups.includes(this.item)&&r.wants(t,this.item)){if(!this.arrived)return!0;this.skip.add(-this.item.id)}this.box=null,this.item=null;let c=null,l=26;for(let e of r.pickups){if(Math.abs(e.y-o.y)>2.2)continue;let n=Math.hypot(e.x-o.x,e.z-o.z);n>=l||this.skip.has(-e.id)||r.wants(t,e)&&this.useful(e)&&i.walkable(e.x,e.z)&&(c=e,l=n)}let u=null,d=150,f=a.stage!==`idle`,p=Math.hypot(o.x-a.nextX,o.z-a.nextZ);for(let t of r.containers){if(t.opened||t.roof||this.skip.has(t.id))continue;let n=Math.hypot(t.x-o.x,t.z-o.z);if(n>=d||f&&a.outsideNext(t.x,t.z)>-4&&(e?n>45||Math.hypot(t.x-a.nextX,t.z-a.nextZ)>p-4:n>80))continue;let r=this.bots.claims.get(t);r&&r!==this&&r.c.alive&&r.box===t&&Math.hypot(t.x-r.c.position.x,t.z-r.c.position.z)<n||(u=t,d=n)}return c&&(l<14||!u)?(this.item=c,this.setGoal(c.x,c.z),!0):u?(this.box=u,this.bots.claims.set(u,this),this.setGoal(u.x,u.z),!0):!1}setGoal(e,t){this.hasGoal&&!this.arrived&&Math.hypot(e-this.goalX,t-this.goalZ)<1.5||(this.goalX=e,this.goalZ=t,this.hasGoal=!0,this.arrived=!1,this.wantPlan=!0,this.stuck=0)}think(){let e=this.c,t=e.position,n=this.game,r=n.nav,i=n.zone,a=this.rng,o=this.armed,s=this.stormUrgency(),c=this.target,l=c!==null&&(this.sees||this.lostFor<4),u=l&&(c.loadout.current!==null||e.sinceHurtBy<5),d;d=e.motor.swimming||this.mode===`swim`&&this.hasGoal&&!this.arrived&&t.y<1.2?`swim`:s===2?`storm`:l&&o?this.shouldRetreat()?!this.sees&&this.lostFor>.5?`heal`:`cover`:this.sees?`fight`:`chase`:u?this.sees&&e.sinceHurtBy<3?`cover`:this.pickLoot(s===1)?`loot`:`cover`:this.wantsPatch()?`heal`:this.waitFor>0?`loot`:s===1?this.wantsLoot()&&this.pickLoot(!0)?`loot`:`storm`:this.wantsLoot()&&this.pickLoot()?`loot`:o&&this.heardAge<9&&this.nerve>.3?`hunt`:`roam`;let f=d!==this.mode;switch(this.mode=d,d!==`loot`&&(this.box=null,this.item=null),d){case`swim`:{if(!f&&this.hasGoal&&!this.arrived)break;let e=r.nearestExit(t.x,t.z);e&&this.setGoal(e.inX,e.inZ);break}case`storm`:{let e=this.hasGoal&&!this.arrived&&i.outsideNext(this.goalX,this.goalZ)<-3;if(!f&&e)break;let t=i.nextRadius;t<6?this.setGoal(i.nextX,i.nextZ):r.randomOpen(a,i.nextX,i.nextZ,t*.6,Math.min(2.5,t*.1),Bs)?this.setGoal(Bs.x,Bs.z):this.setGoal(i.nextX,i.nextZ);break}case`chase`:f||!this.hasGoal||Math.hypot(this.last.x-this.goalX,this.last.z-this.goalZ)>5?this.setGoal(this.last.x,this.last.z):this.arrived&&this.forget();break;case`cover`:(f||this.arrived||!this.hasGoal)&&this.takeCover();break;case`heal`:case`fight`:this.hasGoal=!1;break;case`hunt`:f||!this.hasGoal?this.setGoal(this.heardX,this.heardZ):this.arrived&&(this.heardAge=99);break;case`roam`:{if(!f&&this.hasGoal&&!this.arrived||!f&&this.pause>0)break;if(this.arrived){this.arrived=!1,this.hasGoal=!1,this.pause=a.range(.6,2.6);break}let e=a.range(0,Math.PI*2),n=a.range(35,110),o=r.randomOpen(a,t.x+Math.cos(e)*n,t.z+Math.sin(e)*n,30,2.5,Bs);o&&i.stage!==`idle`&&i.outsideNext(Bs.x,Bs.z)>-6&&(o=!1),!o&&i.stage!==`idle`&&(o=r.randomOpen(a,i.nextX,i.nextZ,Math.max(3,i.nextRadius*.7),2,Bs)),o&&this.setGoal(Bs.x,Bs.z);break}}}takeCover(){let e=this.c.position,t=this.game.nav,n=this.game.physics,r=this.rng,i=this.last,a=Math.atan2(e.z-i.z,e.x-i.x),o=1/0,s=0,c=0;for(let l=0;l<12;l++){let l=a+r.range(-1.9,1.9),u=r.range(6,24),d=e.x+Math.cos(l)*u,f=e.z+Math.sin(l)*u;if(!t.walkable(d,f))continue;let p=e.y+1.1,m=i.x-d,h=i.y-p,g=i.z-f,_=Math.hypot(m,h,g);if(_<4||!n.raycast(d,p,f,m/_,h/_,g/_,_-.4,Is))continue;let v=u+Math.abs(At(a,l))*4;v<o&&(o=v,s=d,c=f)}o<1/0?this.setGoal(s,c):t.nearestOpen(e.x+Math.cos(a)*22,e.z+Math.sin(a)*22,0,14,Bs)&&this.setGoal(Bs.x,Bs.z)}aim(e){let t=this.c,n=t.position,r=this.rng,i=n.y+t.eyeHeight,a=this.yaw,o=0,s=30,l=this.target,u=l!==null&&(this.sees||this.lostFor<2.5)&&this.mode!==`storm`&&this.mode!==`cover`;if(this.throwFor>0)this.throwFor-=e,a=this.throwYaw,o=this.throwPitch,this.offYaw=0,this.offPitch=0;else if(u){let c=this.last.x-n.x,u=this.last.y-i,d=this.last.z-n.z,f=Math.hypot(c,d);if(s=Math.max(2,Math.hypot(f,u)),a=Qt(c,d),o=Math.atan2(u,Math.max(.01,f)),(this.errIn-=e)<=0){this.errIn=r.range(.16,.42);let e=G(.058,.013,this.skill);if(l){let t=l.motor.velocity,n=Math.abs(t.x*(d/(f||1))-t.z*(c/(f||1)));e+=n*.0042}e+=t.motor.speed*.003,e*=1+1.6*Math.exp(-this.seenFor/.6),t.sinceHurt<.5&&(e*=1.4),l.isPlayer||(e*=1.9),this.errYaw=r.gauss()*e,this.errPitch=r.gauss()*e*.6}this.offYaw=H(this.offYaw,this.errYaw,5,e),this.offPitch=H(this.offPitch,this.errPitch,5,e),a+=this.offYaw,o+=this.offPitch}else{let e=t.motor.velocity;Math.hypot(e.x,e.z)>.8?a=Qt(e.x,e.z):this.heardAge<3&&(a=Qt(this.heardX-n.x,this.heardZ-n.z))}let d=At(this.yaw,a),f=G(3.2,7.5,this.skill)*(Math.abs(d)>.5?1.7:1),p=G(8,15,this.skill);this.yaw=c(this.yaw+W(d*p*e,-f*e,f*e)),this.pitch+=W((o-this.pitch)*p*e,-f*e,f*e),this.pitch=W(this.pitch,-1.2,1.2),t.aimYaw=this.yaw,t.aimPitch=this.pitch;let m=Math.cos(this.pitch);t.aimPoint.set(n.x-Math.sin(this.yaw)*m*s,i+Math.sin(this.pitch)*s,n.z-Math.cos(this.yaw)*m*s),t.strafe=u}bestWeapon(e){let t=null,n=0;for(let r of eo){if(!this.usable(r))continue;let i=this.c.loadout.held[r],a=Rs(r,e)*(1+i.tier*.12);i.mag===0&&(a*=.55),r===this.c.loadout.current&&(a*=1.15),a>n&&(n=a,t=r)}return t}hands(e){let t=this.c,n=t.act,r=t.loadout,i=this.rng;if(n.fire=!1,n.aim=!1,this.rest-=e,this.mode===`heal`){if(r.using===null&&r.throwing<=0){let e=(t.health<62?ps(t):null)??(t.armor<45?ms(t):null)??(t.health<75?ps(t):null);e&&(n.use=e)}return}let a=this.target!==null&&(this.sees||this.lostFor<4),o=t.position,s=a?Math.hypot(this.last.x-o.x,this.last.y-(o.y+t.eyeHeight),this.last.z-o.z):30;if(this.swapIn<=0&&this.burst<=0&&r.reloading<=0){let e=this.bestWeapon(s);e&&e!==r.current&&(n.slot=e,this.swapIn=2.5)}let c=r.weapon,l=r.heldNow;if(!c||!l)return;if(!a){l.mag<c.mag*.5&&r.reloading<=0&&t.inventory.has(c.ammo)&&(n.reload=!0);return}if(r.using!==null)return;if(n.aim=this.sees&&s>16&&!t.input.sprint,this.nadeIn<=0&&r.throwing<=0&&t.inventory.has(`grenade`)&&s>11&&s<30){if(!this.sees&&this.lostFor>.7&&this.lostFor<3.5||this.sees&&i.chance(.02+this.skill*.03)){this.windUp(s),n.throw=!0,this.thrown++;return}this.sees||(this.nadeIn=.4)}if(!this.sees||this.seenFor<this.react||this.throwFor>0||r.throwing>0){this.burst=0;return}let u=o.y+t.eyeHeight,d=this.last.x-o.x,f=this.last.z-o.z,p=Math.abs(At(this.yaw,Qt(d,f))),m=Math.abs(this.pitch-Math.atan2(this.last.y-u,Math.max(.01,Math.hypot(d,f)))),h=Math.atan2(.42,s),g=c.pellets>1?3:c.auto?2.4:1.5;p>h*g+.012||m>h*g*1.6+.012?this.burst=0:c.auto?this.burst>0?(n.fire=!0,this.burst-=e,this.burst<=0&&(this.rest=i.range(.14,.45)*(s>30?1.7:1))):this.rest<=0&&(this.burst=i.range(.3,.8)*(s<14?1.7:s>45?.6:1),n.fire=!0):this.rest<=0&&r.cooldown<=0&&(n.fire=!0,this.rest=60/c.rpm+i.range(.04,.22)*G(1.6,.8,this.skill))}windUp(e){let t=this.c.position,n=0,r=1/0;for(let t=-.3;t<=.62;t+=.04){let i=17*Math.cos(t),a=17*Math.sin(t)+4.2,o=(a+Math.sqrt(a*a+42))/15,s=Math.abs(i*o*1.08-e);s<r&&(r=s,n=t)}this.throwYaw=Qt(this.last.x-t.x,this.last.z-t.z)+this.rng.gauss()*G(.08,.02,this.skill),this.throwPitch=n,this.throwFor=.6,this.nadeIn=this.rng.range(9,17)}move(e){let t=this.c,n=this.game,r=n.nav,i=t.position,a=t.input,o=this.rng,s=0,c=0,l=!1,u=!1;if(this.travelled+=Math.hypot(t.motor.velocity.x,t.motor.velocity.z)*e,this.mode===`fight`&&this.target){let n=this.last.x-i.x,d=this.last.z-i.z,f=Math.hypot(n,d)||1,p=n/f,m=d/f,h=Ls[t.loadout.current??`pistol`]*G(1.25,.8,this.nerve);(this.sideIn-=e)<=0&&(this.sideIn=o.range(.6,1.7),this.side=o.chance(.5)?1:-1,f>22&&o.chance(this.skill*.35)&&(this.side=0));let g=0;f>h*1.35?g=1:f<h*.55&&(g=-.85);let _=-m*this.side,v=p*this.side;s=p*g+_*(g===0?1:.55),c=m*g+v*(g===0?1:.55);let y=Math.hypot(s,c);y>1&&(s/=y,c/=y),y>.01&&!r.walkable(i.x+s*2.4,i.z+c*2.4)&&(this.side=-this.side,s=p*g,c=m*g,r.walkable(i.x+s*2.4,i.z+c*2.4)||(s=0,c=0)),l=g>0&&f>h*2.2&&!t.act.fire,u=this.side===0&&f>22,f<9&&t.motor.grounded&&o.chance(.006)&&(a.jump=!0)}else if(this.mode===`heal`)u=t.sinceHurt>2;else if(this.hasGoal&&!this.arrived){this.wantPlan&&this.bots.takePath()&&(this.wantPlan=!1,r.findPath(i.x,i.z,this.goalX,this.goalZ,this.path,t.motor.swimming),this.at=0,this.legX=i.x,this.legZ=i.z,this.path.length===0&&this.giveUp());let e=this.path;if(!this.wantPlan&&this.at<e.length){let n=e[this.at]-i.x,r=e[this.at+1]-i.z,a=Math.hypot(n,r),o=this.at>=e.length-2;if(a<(o?.55:1.25)&&(o?this.arrived=!0:(this.at+=2,n=e[this.at]-i.x,r=e[this.at+1]-i.z,a=Math.hypot(n,r))),!this.arrived&&a>.01){let t=this.at>=2?e[this.at-2]:this.legX,o=this.at>=2?e[this.at-1]:this.legZ,l=e[this.at]-t,u=e[this.at+1]-o,d=Math.hypot(l,u);if(d>2.6&&a>2.6){let e=Math.min(d,W(((i.x-t)*l+(i.z-o)*u)/d,0,d)+2.6);n=t+l/d*e-i.x,r=o+u/d*e-i.z,a=Math.hypot(n,r)||1}s=n/a,c=r/a}let u=Math.hypot(this.goalX-i.x,this.goalZ-i.z);l=this.mode===`storm`&&this.stormUrgency()===2||this.mode===`cover`||this.mode===`swim`||(this.mode===`chase`||this.mode===`hunt`)&&u>25||u>45&&!this.sees,(t.act.fire||t.loadout.using!==null)&&(l=!1)}let a=this.box;a&&(a.opened?this.box=null:Math.hypot(a.x-i.x,a.z-i.z)<1.7&&Math.abs(a.y-i.y)<1.6&&(n.loot.open(a,t),this.opened++,this.box=null,this.hasGoal=!1,this.waitFor=1.3,s=0,c=0))}if(this.dodgeFor>0)this.dodgeFor-=e,s=this.dodgeX,c=this.dodgeZ;else if((s!==0||c!==0)&&(this.feelIn-=e)<=0&&(this.feelIn=.15,this.blocked(s,c)))for(let e of[.8,-.8,1.5,-1.5]){let t=this.side<0?-e:e,n=Math.cos(t),r=Math.sin(t),i=s*n-c*r,a=s*r+c*n;if(!this.blocked(i,a)){this.dodgeX=i,this.dodgeZ=a,this.dodgeFor=.4,s=i,c=a;break}}if(s!==0||c!==0){if((this.stuckCheck-=e)<=0){this.stuckCheck=.5;let e=Math.hypot(i.x-this.fromX,i.z-this.fromZ);if(this.fromX=i.x,this.fromZ=i.z,e<.22){this.stuck++;let e=t.motor.swimming||r.walkable(i.x+s*1.7,i.z+c*1.7);if(this.stuck===1)a.jump=e;else if(this.stuck<=4){let t=(this.stuck%2==0?1:-1)*o.range(1.1,1.9);this.dodgeX=s*Math.cos(t)-c*Math.sin(t),this.dodgeZ=s*Math.sin(t)+c*Math.cos(t),this.dodgeFor=.55,this.wantPlan=this.hasGoal,this.stuck===3&&(a.jump=e)}else this.giveUp()}else e>1.2&&(this.stuck=0)}}else this.stuckCheck=.5;if((s!==0||c!==0)&&t.motor.grounded&&!t.motor.swimming&&r.kindAt(i.x,i.z)!==Cs.Exit){let e=i.x+s*1.2,t=i.z+c*1.2;n.world.field.isWater(e,t)&&r.kindAt(e,t)!==Cs.Exit&&!n.physics.raycast(e,i.y+.5,t,0,-1,0,1.8,Is)&&(s=0,c=0,this.dodgeFor=0,this.side=-this.side,this.hasGoal&&!this.arrived&&(this.wantPlan=!0))}a.moveX=s,a.moveZ=c,a.sprint=l&&(s!==0||c!==0),a.crouch=u,a.walk=!1}blocked(e,t){let n=this.c.position,r=this.game.physics.raycast(n.x,n.y+.55,n.z,e,0,t,1.25,Is);return r!==null&&r.normal.y<.4}giveUp(){this.box&&this.skip.add(this.box.id),this.item&&this.skip.add(-this.item.id),this.box=null,this.item=null,this.hasGoal=!1,this.arrived=!1,this.wantPlan=!1,this.path.length=0,this.stuck=0,this.thinkIn=0,this.mode===`chase`&&this.forget(),this.mode===`hunt`&&(this.heardAge=99)}snapshot(){let e=this.c,t=e.loadout;return zs.copy(e.position),{id:e.id,name:e.name,mode:this.mode,alive:e.alive,state:e.state,x:zs.x,y:zs.y,z:zs.z,health:e.health,armor:e.armor,weapon:t.current,weapons:t.carried(),armed:this.armed,target:this.target?.id??null,sees:this.sees,skill:this.skill,nerve:this.nerve,opened:this.opened,heals:this.heals,thrown:this.thrown,shots:t.shots,hits:t.hits,kills:e.kills,travelled:this.travelled,landed:this.landed,swimming:e.motor.swimming,goal:this.hasGoal?[this.goalX,this.goalZ]:null,inEye:this.game.zone.inside(e.position.x,e.position.z)}}},Us=`Mango Vega.Tide Runner.Brisa.Cayo Kid.Chispa.Neon Heron.Rumba Ray.Coral Queen.Sandbar Sam.Riptide.Guava Jo.El Faro.Mojo Marin.Pelican Pete.Ocho.Cafecito.Kingfish.Yuca.Mambo Lux.Zesty.Gale Force.Dockside Dee.Palmetto.Salt Pepa.Marisol.Low Tide Lou.Squall.Papaya.Canal Cat.Sunny Paz.Bongo.Mirador.Key Lime Kai.Gringa Loca.Tormenta.Flaco.Abuela Bang.Jetty.Lagarto.Vela`.split(`.`),Ws=2,Gs=.55,Ks=new He,qs=new an,Js=new vt,Ys=class{game;list=[];claims=new Map;lastShot=new Map;time=0;paths=0;byCharacter=new Map;constructor(e){this.game=e;let t=new Bt(e.options.seed^45173),n=t.shuffle([...Us]);for(let r=0;r<st.combatants-1;r++){let i=e.spawnCharacter(n[r%n.length],!1,-60+r%6*2,20+Math.floor(r/6)*2,0,Ba(t)),a=new Hs(i,e,this,t.fork());this.list.push(a),this.byCharacter.set(i,a),this.park(i)}e.hurtScale=(t,n)=>n.by&&n.by!==t&&n.by!==e.player&&t!==e.player?Gs:1;let r=e.events;r.on(`shot`,({by:e,x:t,z:n})=>{this.lastShot.set(e,this.time),this.noise(t,n,95,e)}),r.on(`blast`,({x:e,z:t,by:n})=>this.noise(e,t,130,n)),r.on(`hurt`,({target:e,info:t})=>{t.by&&this.byCharacter.get(e)?.hurtBy(t.by)}),r.on(`used`,({who:e})=>{let t=this.byCharacter.get(e);t&&t.heals++}),r.on(`kill`,({victim:e})=>{for(let t of this.list)t.target===e&&(t.target=null)})}get characters(){return this.list.map(e=>e.c)}botOf(e){return this.byCharacter.get(e)}park(e){e.vehicle?.exit(e),this.game.drop.release(e),e.state=`plane`,e.rig.root.visible=!1,e.motor.setEnabled(!1),e.motor.velocity.set(0,0,0),e.input.moveX=0,e.input.moveZ=0,e.input.sprint=!1,e.input.jump=!1,e.act.fire=!1,e.act.aim=!1}parkAll(){for(let e of this.list)this.park(e.c),e.mode=`parked`,e.target=null;this.claims.clear()}begin(e){let t=new Bt(e^185053301);for(let e of this.list)e.reset(t.fork());this.claims.clear(),this.lastShot.clear()}deploy(e,t,n,r=12,i=[]){let a=this.game,o=new Bt((a.options.seed^912144)+e*31+Math.round(t*7+n*13)),s=[];if(a.match.running)return s;let c={x:0,z:0};for(let l of this.list){if(s.length>=e)break;let u=l.c;if(u.state!==`plane`||!a.nav.randomOpen(o,t,n,r,1.5,c))continue;l.reset(o.fork()),u.alive=!0,u.health=u.maxHealth,u.armor=0,a.combat.reset(u),u.state=`normal`,u.rig.root.visible=!0,u.motor.setEnabled(!0);let d=a.physics.groundHeight(c.x,200,c.z,400,a.world.field.heightAt(c.x,c.z))+.05;u.teleport(c.x,d,c.z,o.range(0,Math.PI*2));for(let[e,t]of i)a.grant(u,e,t);s.push(u)}return s}takePath(){return this.paths<=0?!1:(this.paths--,!0)}noise(e,t,n,r){for(let i of this.list){let a=i.c;if(a===r||!a.alive||a.state!==`normal`)continue;let o=a.position;Math.hypot(o.x-e,o.z-t)<n&&i.hear(e,t)}}fixedUpdate(e){this.time+=e,this.paths=Ws;let t=this.list;for(let n=0;n<t.length;n++)t[n].step(e)}frameUpdate(){let e=this.game,t=e.engine.camera;Ks.setFromProjectionMatrix(qs.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse));let n=e.player;for(let r of e.characters){if(r===n||r.state===`plane`)continue;let e=r.visual,i=t.position.distanceTo(e);Js.center.set(e.x,e.y+1,e.z),Js.radius=2.2,r.poseEvery=i<30||Ks.intersectsSphere(Js)?i<45?1:i<100?2:i<200?3:5:8}}snapshot(){let e=this.list.map(e=>e.snapshot()),t={};for(let e of this.list)t[e.mode]=(t[e.mode]??0)+1;return{count:this.list.length,alive:this.list.filter(e=>e.c.alive&&e.c.state!==`plane`).length,modes:t,bots:e}}},Xs=Math.PI*2,Zs=16;function Qs(e){return Array.isArray(e)}function $s(e){let t=0;for(let n of Qs(e)?e:[e])for(let e=0;e<n.length;e++){let r=Math.abs(n[e]);r>t&&(t=r)}return t}function ec(e,t){if(e<t){let n=e/t;return n+n-n*n-1}if(e>1-t){let n=(e-1)/t;return n*n+n+n+1}return 0}var tc=class{sr;rng;constructor(e,t){this.sr=e,this.rng=new Bt(t)}len(e){return Math.max(1,Math.round(e*this.sr))}zeros(e){return new Float32Array(this.len(e))}stereo(e){return[this.zeros(e),this.zeros(e)]}rand(e=-1,t=1){return this.rng.range(e,t)}white(e){let t=this.zeros(e),n=this.rng;for(let e=0;e<t.length;e++)t[e]=n.next()*2-1;return t}pink(e){let t=this.zeros(e),n=this.rng,r=0,i=0,a=0,o=0,s=0,c=0,l=0;for(let e=0;e<t.length;e++){let u=n.next()*2-1;r=.99886*r+u*.0555179,i=.99332*i+u*.0750759,a=.969*a+u*.153852,o=.8665*o+u*.3104856,s=.55*s+u*.5329522,c=-.7616*c-u*.016898,t[e]=(r+i+a+o+s+c+l+u*.5362)*.16,l=u*.115926}return t}brown(e){let t=this.zeros(e),n=this.rng,r=0;for(let e=0;e<t.length;e++)r=(r+.02*(n.next()*2-1))/1.02,t[e]=r*3.5;return t}osc(e,t,n,r=0){let i=this.zeros(e),a=this.sr,o=typeof n==`function`?n:null,s=o?o(0):n,c=r-Math.floor(r);for(let e=0;e<i.length;e++){o&&e%Zs===0&&(s=o(e/a));let n=s/a,r;if(t===`sine`)r=Math.sin(Xs*c);else if(t===`tri`){let e=c+.25-Math.floor(c+.25);r=1-4*Math.abs(e-.5)}else if(t===`saw`)r=2*c-1-ec(c,n);else{let e=c+.5-Math.floor(c+.5);r=(c<.5?1:-1)+ec(c,n)-ec(e,n)}i[e]=r,c+=n,c>=1&&--c}return i}sweep(e,t,n,r){let i=this.zeros(e),a=this.sr;for(let e=0;e<i.length;e++){let o=e/a;i[e]=Math.sin(Xs*(n*o+(t-n)*r*(1-Math.exp(-o/r))))}return i}modes(e,t,n=!1){let r=this.zeros(e),i=this.sr;for(let[e,a,o]of t){if(e>=i*.47||e<=0)continue;let t=Xs*e/i,s=n?this.rng.next()*Xs:0,c=Math.exp(-1/(a*i)),l=Math.min(r.length,Math.ceil(a*8*i)),u=o;for(let e=0;e<l;e++)r[e]=r[e]+Math.sin(t*e+s)*u,u*=c}return r}dust(e,t){let n=this.zeros(e),r=this.sr,i=this.rng,a=typeof t==`function`?t:null,o=a?a(0):t;for(let e=0;e<n.length;e++)a&&e%Zs===0&&(o=a(e/r)),i.next()*r<o&&(n[e]=i.next()*2-1);return n}env(e,t){let n=this.sr;for(let r=0;r<e.length;r++)e[r]=e[r]*t(r/n);return e}envSlow(e,t){let n=this.sr,r=t(0);for(let i=0;i<e.length;i+=64){let a=t((i+64)/n),o=Math.min(64,e.length-i);for(let t=0;t<o;t++)e[i+t]=e[i+t]*(r+(a-r)*t/64);r=a}return e}decay(e,t,n=4e-4){let r=Math.max(1,n*this.sr),i=Math.exp(-1/(t*this.sr)),a=1;for(let t=0;t<e.length;t++)e[t]=e[t]*(t<r?t/r:1)*a,t>=r&&(a*=i);return e}fade(e,t,n){let r=e.length,i=Math.min(r,Math.round(t*this.sr)),a=Math.min(r,Math.round(n*this.sr));for(let t=0;t<i;t++)e[t]=e[t]*(.5-.5*Math.cos(Math.PI*t/i));for(let t=0;t<a;t++)e[r-1-t]=e[r-1-t]*(.5-.5*Math.cos(Math.PI*t/a));return e}gain(e,t){for(let n=0;n<e.length;n++)e[n]=e[n]*t;return e}drive(e,t){let n=1/Math.tanh(t);for(let r=0;r<e.length;r++)e[r]=Math.tanh(e[r]*t)*n;return e}filter(e,t,n,r=Math.SQRT1_2,i=0){let a=this.sr,o=typeof n==`function`?n:null,s=typeof r==`function`?r:null,c=o!==null||s!==null,l=10**(i/40),u=0,d=0,f=0,p=0,m=0,h=e=>{let i=Math.min(a*.45,Math.max(10,o?o(e):n)),c=Math.max(.05,s?s(e):r),h=Xs*i/a,g=Math.cos(h),_=Math.sin(h)/(2*c),v=1+_;if(p=-2*g,m=1-_,t===`lp`)u=(1-g)/2,d=1-g,f=u;else if(t===`hp`)u=(1+g)/2,d=-(1+g),f=u;else if(t===`bp`)u=_,d=0,f=-_;else if(t===`notch`)u=1,d=-2*g,f=1;else if(t===`peak`)u=1+_*l,d=-2*g,f=1-_*l,v=1+_/l,m=1-_/l;else{let e=2*Math.sqrt(l)*_,n=t===`ls`?1:-1;u=l*(l+1-n*(l-1)*g+e),d=n*2*l*(l-1-n*(l+1)*g),f=l*(l+1-n*(l-1)*g-e),v=l+1+n*(l-1)*g+e,p=-n*2*(l-1+n*(l+1)*g),m=l+1+n*(l-1)*g-e}u/=v,d/=v,f/=v,p/=v,m/=v};h(0);let g=0,_=0;for(let t=0;t<e.length;t++){c&&t%Zs===0&&h(t/a);let n=e[t],r=u*n+g;g=d*n-p*r+_,_=f*n-m*r,e[t]=r}return e}lp(e,t,n=Math.SQRT1_2){return this.filter(e,`lp`,t,n)}hp(e,t,n=Math.SQRT1_2){return this.filter(e,`hp`,t,n)}bp(e,t,n=1){return this.filter(e,`bp`,t,n)}mix(e,t,n=1,r=0){let i=Math.round(r*this.sr),a=Math.min(t.length,e.length-i);for(let r=Math.max(0,-i);r<a;r++)e[i+r]=e[i+r]+t[r]*n;return e}mixS(e,t,n=1,r=0,i=0){let a=(Math.min(1,Math.max(-1,i))+1)*Math.PI/4,o=Math.cos(a)*Math.SQRT2*n,s=Math.sin(a)*Math.SQRT2*n;return Qs(t)?(this.mix(e[0],t[0],o,r),this.mix(e[1],t[1],s,r)):(this.mix(e[0],t,o,r),this.mix(e[1],t,s,r)),e}verb(e,t){let n=this.sr,r=Qs(e)?e:[e,e],i=Math.round((t.pre??0)*n),a=r[0].length+i+this.len(t.tail??t.time*1.2),o=t.damp??.35,s=(t.mix??.25)*.3,c=[.0253,.0269,.029,.0307,.0338,.0367],l=[.0126,.0077,.0051],u=[new Float32Array(a),new Float32Array(a)];for(let e=0;e<2;e++){let d=r[e],f=new Float32Array(a),p=e===0?1:1.037;for(let e of c){let r=Math.max(1,Math.round(e*p*n)),s=10**(-3*r/n/t.time),c=new Float32Array(r),l=0,u=0;for(let e=0;e<a;e++){let t=c[l];u=t+(u-t)*o;let n=e-i;c[l]=(n>=0&&n<d.length?d[n]:0)+u*s,f[e]=f[e]+t,l=l+1===r?0:l+1}}for(let e of l){let t=Math.max(1,Math.round(e*p*n)),r=new Float32Array(t),i=0;for(let e=0;e<a;e++){let n=r[i],a=f[e]+n*.5;r[i]=a,f[e]=n-a*.5,i=i+1===t?0:i+1}}let m=u[e];for(let e=0;e<a;e++)m[e]=(e<d.length?d[e]:0)+f[e]*s}return u}norm(e,t=.9){let n=$s(e);if(n>1e-6){let r=t/n;for(let t of Qs(e)?e:[e])this.gain(t,r)}return e}loopify(e,t){let n=Math.min(this.len(t),e.length>>1),r=e.length-n,i=e.slice(0,r);for(let t=0;t<n;t++){let a=t/n*Math.PI*.5;i[t]=e[t]*Math.sin(a)+e[r+t]*Math.cos(a)}return i}};function Y(e,t,n,r,i,a=4e-4){return e.norm(e.decay(e.filter(e.white(i*7+a),t,n,r),i,a),1)}function nc(e,t,n,r,i,a=.001){return e.decay(e.sweep(i*7+a,t,n,r),i,a)}function rc(e,t,n,r=.5){let i=e.modes(n*7+.01,[[t,n,1],[t*1.59,n*.7,.6],[t*2.71,n*.5,.4],[t*4.13,n*.35,.25]],!0);return e.mix(i,Y(e,`hp`,3e3,.7,.0012),r)}function ic(e,t,n,r=1){return e.modes(n*7,[[t,n,1],[t*2,n*.6,.35*r],[t*3.01,n*.4,.2*r],[t*4.1,n*.25,.14*r],[t*6.3,n*.12,.08*r]])}function ac(e,t,n,r){return e.decay(e.osc(r*6+.005,`sine`,e=>t*(1+n*e)),r,.002)}function oc(e,t,n,r=1){let i=e.norm(e.lp(e.white(t.length/e.sr),n),1);for(let e=0;e<t.length;e++)t[e]=t[e]*(1-r+r*Math.min(1,Math.abs(i[e])*2.5));return t}function sc(e,t,n,r,i,a){let o=e.zeros(t);for(let t=0;t<n;t++){let t=-Math.log(1-e.rng.next()*.98)*a,n=r*(i/r)**+e.rng.next(),s=e.rand(.004,.03),c=e.modes(s*7,[[n,s,1],[n*1.51,s*.7,.5],[n*2.3,s*.5,.3]],!0);e.mix(o,c,e.rand(.2,1)*Math.exp(-t/(a*2)),t)}return e.norm(o,1)}function cc(e,t=1){return n=>n>=e?0:Math.sin(Math.PI*n/e)**t}function lc(e,t,n){let r=[],i=[],a=0;for(let t=1;t<=n;t++)r.push(e.rng.next()*Math.PI*2),i.push(1/Math.sqrt(t)),a+=1/t;return a=Math.sqrt(a/2)*1.6,e=>{let o=0;for(let a=0;a<n;a++)o+=i[a]*Math.sin(Math.PI*2*(a+1)*e/t+r[a]);return Math.max(-1,Math.min(1,o/a))}}function uc(e,t,n,r,i){let a=e.length,o=Math.round(r*i);for(let r=0;r<t.length;r++){let i=((o+r)%a+a)%a;e[i]=e[i]+t[r]*n}return e}var dc=Math.PI*2;function fc(e,t,n){return e<t?t:e>n?n:e}function pc(e){return e<0?0:e>1?1:e}function mc(e){return[e(0),e(1)]}function hc(e){return e.norm(mc(()=>{let t=lc(e,6,5);return e.loopify(e.envSlow(e.pink(6.6),e=>.8+.35*t(e)),.6)}),.8)}function gc(e){let t=2.4,n=[[1.5,1],[6.3,.7],[10.4,.9]];return e.norm(mc(r=>{let i=lc(e,14,3),a=e.lp(e.brown(15),500);e.mix(a,e.bp(e.pink(15),700,.5),.5),e.envSlow(a,e=>.75+.25*i(e));let o=e.gain(e.loopify(a,1),.55);for(let[i,a]of n){let n=e.white(7.9);e.lp(n,e=>e<t?250+1300*(e/t)**2:700+3600*Math.exp(-(e-t)/.7)),e.envSlow(n,e=>e<t?.45*(e/t)**2.2:(.45+.55*Math.min(1,(e-t)/.06))*Math.exp(-(e-t)/1.1));let s=oc(e,e.hp(e.white(7.9),3e3),45,.6);e.envSlow(s,e=>e<t?0:(1-Math.exp(-(e-t)/.25))*Math.exp(-(e-t)/1.7)),e.mix(n,s,.28),uc(o,n,a,i-t+r*.27+e.rand(0,.1),e.sr)}return o}),.85)}function _c(e){return e.norm(mc(()=>{let t=lc(e,12,4),n=lc(e,12,6),r=e.envSlow(e.lp(e.brown(13),170),e=>.7+.3*t(e)),i=e.envSlow(e.bp(e.pink(13),430,.6),e=>.55+.45*n(e));e.mix(r,i,.9);let a=e.loopify(r,1);for(let t=0;t<3;t++){let t=e.bp(e.pink(3.4),e=>560-60*e,1.1);uc(a,e.envSlow(t,cc(3.4,3)),e.rand(.5,.9),e.rand(0,12),e.sr)}return e.mix(a,e.osc(12,`sine`,100),.012),e.mix(a,e.osc(12,`sine`,200),.006),a}),.7)}function vc(e){return e.norm(mc(()=>{let t=lc(e,10,5),n=lc(e,10,7),r=lc(e,10,4),i=e.bp(e.pink(11),e=>430+210*t(e),3);return e.mix(i,e.bp(e.pink(11),e=>820+300*n(e),4),.45),e.envSlow(i,e=>.7+.3*t(e+1.3)),e.mix(i,e.envSlow(e.lp(e.brown(11),140),e=>.7+.3*r(e)),.5),e.mix(i,e.envSlow(e.hp(e.pink(11),1500),e=>Math.max(0,r(e+2))**2),.5),e.loopify(i,1)}),.85)}function yc(e){return e.norm(mc(()=>{let t=oc(e,e.lp(e.hp(e.white(6.5),2500),9e3),30,.3);return e.gain(t,.2),e.mix(t,e.lp(e.hp(e.pink(6.5),250),1400),.4),e.mix(t,e.bp(e.dust(6.5,420),3800,1.2),.8),e.mix(t,e.bp(e.dust(6.5,260),1100,1.5),1.6),e.mix(t,e.bp(e.dust(6.5,120),420,2),2.2),e.loopify(t,.5)}),.8)}function bc(e){return e.norm(e.loopify(e.white(2.2),.2),.8)}function xc(e){let t=2.4,n=lc(e,t,7),r=lc(e,t,5),i=e.norm(e.bp(e.white(2.6999999999999997),e=>1060*(1+.07*n(e)),28),1);return e.mix(i,e.norm(e.bp(e.white(2.6999999999999997),e=>1640*(1+.06*r(e)),24),1),.5),oc(e,i,160,.4),e.mix(i,oc(e,e.bp(e.white(2.6999999999999997),2500,.7),80,.6),.35),e.norm(e.loopify(i,.3),.8)}function Sc(e,t,n){let r=e.sr,i=1/t.cycleHz,a=t.cycles*i,o=e.len(a),s=new Float32Array(o),c=new Float32Array(o),l=i/t.fires.length,u=Math.round(l*5*r),d=dc*t.ring/(l*r),f=dc*t.rasp/(l*r),p=Math.exp(-1/(t.ringTau*l*r)),m=Math.exp(-1/(.3*l*r)),h=Math.exp(-1/(t.pulseTau*l*r)),g=Math.exp(-1/(.3*l*r));for(let n=0;n<t.cycles;n++)for(let[a,l]of t.fires){let _=Math.round((n+a+e.rand()*t.rough*.05)*i*r),v=l*(1+e.rand()*t.rough),y=v,b=v*t.raspLevel,x=v*t.pulse,S=v;for(let e=0;e<u;e++){let t=((_+e)%o+o)%o;s[t]=s[t]+Math.sin(d*e)*y+Math.sin(f*e)*b+x,c[t]=c[t]+S,y*=p,b*=m,x*=h,S*=g}}let _=e.lp(e.white(a),3200);for(let e=0;e<o;e++)s[e]=s[e]+_[e]*c[e]*t.noise;n?.(s);let v=new Float32Array(o*2);return v.set(s),v.set(s,o),e.hp(v,28),e.norm(e.drive(e.norm(v.slice(o),1),t.drive),.85)}var Cc=e=>Sc(e,{cycleHz:17.5,fires:[[0,1],[.25,.8],[.5,.93],[.75,.72]],cycles:32,ring:2.3,ringTau:.8,rasp:6.7,raspLevel:.6,drive:1.8,pulse:1.1,pulseTau:.03,rough:.07,noise:.35}),wc=e=>Sc(e,{cycleHz:21,fires:[[0,1],[.4,.7]],cycles:36,ring:2.2,ringTau:1.1,rasp:5.4,raspLevel:.7,drive:2.2,pulse:.8,pulseTau:.06,rough:.16,noise:.6}),Tc=e=>Sc(e,{cycleHz:11,fires:[1,.85,.95,.8,.9,1,.82,.93,.88].map((e,t)=>[t/9,e]),cycles:34,ring:1.5,ringTau:.6,rasp:4.6,raspLevel:.6,drive:1.6,pulse:.9,pulseTau:.04,rough:.05,noise:.3},e=>{let t=e.length;for(let[n,r]of[[204,.5],[209,.3]])for(let i=1;i<=8;i++){let a=dc*n*i/t,o=r/i;for(let n=0;n<t;n++)e[n]=e[n]+Math.sin(a*n)*o}});function Ec(e,t){let n=t===0?3:2,r=e.zeros(1.5),i=.02;for(let a=0;a<n;a++){let o=(t===0?.2:.34)+e.rand(0,.08)+(a===n-1?.12:0),s=(t===0?1250:980)*(1+e.rand(-.05,.05))*(1-a*.03),c=e=>{let t=Math.min(1,e/o);return s*(.78+1.05*t**.3*(1-t)**.6)*(1+.012*Math.sin(e*190))},l=e.osc(o,`saw`,c);e.mix(l,e.osc(o,`square`,c),.5),e.lp(e.hp(e.filter(l,`peak`,2700,2,10),700),5200),e.env(l,e=>cc(o,.6)(e)*(.8+.2*Math.sin(e*dc*48))),e.mix(r,e.norm(l,1),1-a*.12,i),i+=o+e.rand(.05,.12)}return e.lp(r,3800),e.norm(e.verb(r,{time:1.1,mix:.5,pre:.02}),.8)}var Dc={bed_wind:{render:hc,sr:24e3,loop:!0},bed_ocean:{render:gc,sr:24e3,loop:!0},bed_city:{render:_c,sr:16e3,loop:!0},bed_storm:{render:vc,sr:24e3,loop:!0},bed_rain:{render:yc,sr:32e3,loop:!0},bed_noise:{render:bc,loop:!0},bed_skid:{render:xc,loop:!0},bed_car:{render:Cc,loop:!0},bed_boat:{render:wc,loop:!0},bed_plane:{render:Tc,loop:!0},amb_gull:{render:Ec,variants:2}},Oc=.06;function kc(e,t){let n=e.createBufferSource();return n.buffer=t,n.loop=!0,n.start(0,Math.random()*t.duration),n}function Ac(e,t,n,r=Math.SQRT1_2,i=0){let a=e.createBiquadFilter();return a.type=t,a.frequency.value=n,a.Q.value=r,a.gain.value=i,a}function jc(e,t){let n=e.createGain();return n.gain.value=t,n}function Mc(e,t,n,r){let i=e.createOscillator();return i.frequency.value=t,i.connect(jc(e,n)).connect(r),i.start(),i}function Nc(e,t){for(let n of e)try{n.stop(t)}catch{}}function Pc(e,t,n){return(r,i)=>{let a=kc(r,i.get(e)[0]),o=jc(r,1);a.connect(o);let s=[a];return n&&s.push(Mc(r,n[0],n[1],o.gain)),{out:o,setPitch:(e,n)=>a.playbackRate.setTargetAtTime(t(e),n,Oc),stop:e=>Nc(s,e)}}}function Fc(e,t){let n=kc(e,t.get(`bed_wind`)[0]),r=jc(e,1),i=Ac(e,`highpass`,90),a=Ac(e,`lowpass`,1e3,.6),o=Ac(e,`bandpass`,720,2.2),s=jc(e,.6),c=Ac(e,`highpass`,2600),l=jc(e,.2);n.connect(i).connect(a).connect(r),n.connect(o).connect(s).connect(r),n.connect(c).connect(l).connect(r);let u=[n,Mc(e,.19,.16,r.gain),Mc(e,.31,80,o.frequency)];return{out:r,setPitch(e,t){let r=fc(e,.3,3);n.playbackRate.setTargetAtTime(.8+.2*r,t,Oc),a.frequency.setTargetAtTime(300+700*r**1.3,t,Oc),o.frequency.setTargetAtTime(250+560*r,t,Oc),s.gain.setTargetAtTime(.5+1.4*pc((r-.4)/1.6),t,Oc),l.gain.setTargetAtTime(.15+1.6*pc((r-.6)/1.9),t,Oc)},stop:e=>Nc(u,e)}}function Ic(e,t){let n=kc(e,t.get(`bed_city`)[0]),r=jc(e,1);n.connect(r);let i=0;return{out:r,setPitch:(e,t)=>n.playbackRate.setTargetAtTime(fc(e,.5,2),t,Oc),tick(n,a){if(i===0||!a){i<n+2&&(i=n+2+Math.random()*6);return}if(n<i)return;i=n+5+Math.random()*10;let o=t.get(`amb_gull`),s=e.createBufferSource();s.buffer=o[Math.floor(Math.random()*o.length)],s.playbackRate.value=.85+Math.random()*.35;let c=jc(e,.07+Math.random()*.16),l=e.createStereoPanner();l.pan.value=Math.random()*1.6-.8,s.connect(c).connect(l).connect(r),s.onended=()=>l.disconnect(),s.start(n)},stop:e=>Nc([n],e)}}function Lc(e){return(t,n)=>{let r=kc(t,n.get(e.bed)[0]),i=jc(t,.8),a=r;for(let[n,r,i]of e.peaks)a=a.connect(Ac(t,`peaking`,n,r,i));let o=Ac(t,`lowpass`,e.lowpass[0]+e.lowpass[1],.8);a.connect(o).connect(i);let s=kc(t,n.get(`bed_noise`)[0]),c=Ac(t,`bandpass`,e.noise[0],.8),l=jc(t,e.noise[1]);s.connect(c).connect(l).connect(i);let u=[r,s];return e.burble&&u.push(Mc(t,e.burble[0],e.burble[1],l.gain)),{out:i,setPitch(t,n){let a=fc(t,.3,3);r.playbackRate.setTargetAtTime(a,n,Oc),o.frequency.setTargetAtTime(e.lowpass[0]+e.lowpass[1]*a,n,Oc),c.frequency.setTargetAtTime(e.noise[0]*(.6+.4*a),n,Oc),l.gain.setTargetAtTime(e.noise[1]+e.noise[2]*Math.max(0,a-.5),n,Oc),i.gain.setTargetAtTime(.7+.3*pc((a-.5)/2),n,Oc)},stop:e=>Nc(u,e)}}}var Rc=[15,250],zc={wind:{beds:[`bed_wind`],gain:.7,range:Rc,build:Fc},ocean:{beds:[`bed_ocean`],gain:.5,range:[25,320],build:Pc(`bed_ocean`,e=>fc(e,.6,1.6),[.043,.14])},city:{beds:[`bed_city`,`amb_gull`],gain:.4,range:Rc,build:Ic},storm:{beds:[`bed_storm`],gain:.7,range:[40,500],build:Pc(`bed_storm`,e=>fc(e,.6,1.8),[.071,.15])},rain:{beds:[`bed_rain`],gain:.55,range:Rc,build:Pc(`bed_rain`,e=>fc(e,.7,1.5))},skid:{beds:[`bed_skid`],gain:.4,range:[5,70],build:Pc(`bed_skid`,e=>fc(e,.5,2))},car_engine:{beds:[`bed_car`,`bed_noise`],gain:.26,range:[6,90],build:Lc({bed:`bed_car`,peaks:[[110,1.2,3],[420,1.2,6],[1100,1,6],[2400,1.2,4]],lowpass:[700,1500],noise:[1800,.012,.05]})},boat_engine:{beds:[`bed_boat`,`bed_noise`],gain:.2,range:[8,110],build:Lc({bed:`bed_boat`,peaks:[[90,1.2,3],[260,1.5,8],[800,1.2,8]],lowpass:[600,900],noise:[520,.06,.08],burble:[7.3,.035]})},plane_engine:{beds:[`bed_plane`,`bed_noise`],gain:.3,range:[30,600],build:Lc({bed:`bed_plane`,peaks:[[95,1,3],[330,1.2,6],[1e3,1,7]],lowpass:[1100,1500],noise:[2500,.03,.05]})}};Object.keys(zc);function Bc(e){let t=nc(e,150,46,.03,.13,.002);return e.mix(t,Y(e,`lp`,1800,.7,.006),.25),e.norm(e.drive(t,1.4),.9)}function Vc(e){let t=e.zeros(.3);e.mix(t,e.modes(.2,[[186,.045,1],[331,.03,.5]]),.7),e.mix(t,Y(e,`bp`,1900,.6,.07,.001),.9),e.mix(t,Y(e,`hp`,5e3,.7,.04,.001),.35);let n=e.verb(t,{time:.5,mix:.6,tail:.02});for(let t of n)e.fade(t,0,.05);return e.norm(n,.85)}function Hc(e,t){let n=t===0?.018:.09,r=Y(e,`hp`,7500,.7,n,5e-4);return e.mix(r,Y(e,`bp`,10500,3,n*.8),.5),e.norm(r,.7)}function Uc(e){return e.norm(Y(e,`bp`,6200,.9,.028,.012),.7)}function Wc(e){let t=e.modes(.12,[[1720,.014,1],[2480,.01,.6],[820,.012,.4]]);return e.mix(t,Y(e,`hp`,3e3,.7,.001),.4),e.norm(t,.8)}function Gc(e,t){let n=t===0?292:206,r=nc(e,n*1.22,n,.02,.1,.001);return e.mix(r,e.decay(e.sweep(.3,n*2.4,n*2.1,.02),.04,.001),.3),e.mix(r,Y(e,`bp`,1500,1,.006),.4),e.norm(r,.85)}function Kc(e){let t=2.6,n=()=>{let n=e.hp(e.white(t),3200);return e.mix(n,e.bp(e.white(t),5400,4),.6),e.mix(n,e.bp(e.white(t),8300,5),.5),e.decay(n,.55,.002)};return e.norm([n(),n()],.7)}function qc(e){let t=()=>{let t=e.white(2.8);e.lp(t,e=>1100+6500*Math.exp(-e/.5)),e.env(t,e=>Math.min(1,e/.03)*Math.exp(-e/.42));for(let n=0;n<9;n++){let n=Math.round(e.rand(.008,.085)*e.sr);t[n]=t[n]+e.rand(.4,1)*(e.rng.next()<.5?-1:1)}return e.fade(t,0,.4)};return e.norm([t(),t()],.9)}var Jc={drum_kick:{render:Bc},drum_snare:{render:Vc},drum_hat:{render:Hc,variants:2},drum_shaker:{render:Uc},drum_rim:{render:Wc},drum_conga:{render:Gc,variants:2},drum_cymbal:{render:Kc},drum_click:{render:e=>e.norm(rc(e,2100,.01,.3),.6)},ir_hall:{render:qc}},Yc=Object.keys(Jc),Xc={bass:[1,0,.03],pluck:[1,.32,.22],pad:[1,0,.45],lead:[1,.38,.32],drums:[1,0,.1],bell:[1,.45,.6]},Zc=.5;function Qc(e){return 440*2**((e-69)/12)}var $c=class{ctx;out;bank;current=`none`;decks=[];reverb;constructor(e,t,n){this.ctx=e,this.out=t,this.bank=n,this.reverb=e.createConvolver(),this.reverb.connect(t)}play(e,t=1.5){let n=this.ctx.currentTime;if(e===this.current)return;this.current=e;let r=Math.max(.02,t);for(let e of this.decks)e.fading||this.fadeOut(e,n,r);let i=El[e];e!==`none`&&i&&(this.decks.push(this.makeDeck(e,i,n,i.steps===void 0?Math.min(r,2):.02)),this.update())}playTune(e,t=.4){let n=this.ctx.currentTime;this.current=`none`;for(let e of this.decks)e.fading||this.fadeOut(e,n,Math.max(.02,t));this.decks.push(this.makeDeck(`none`,Tl(e),n,.05)),this.update()}stop(e=1.5){let t=this.ctx.currentTime;this.current=`none`;for(let n of this.decks)n.fading||this.fadeOut(n,t,Math.max(.02,e))}update(){let e=this.ctx.currentTime;!this.reverb.buffer&&this.bank.has(`ir_hall`)&&(this.reverb.buffer=this.bank.get(`ir_hall`)[0]);let t=!1;for(let n of this.decks){if(!n.finished){let t=n.def.steps!==void 0;if(!t&&n.nextTime<e){let t=Math.ceil((e+.03-n.nextTime)/n.stepDur);n.step+=t,n.nextTime+=t*n.stepDur}let r=t?1/0:e+Zc;for(;n.nextTime<r;){if(t&&n.step>=n.def.steps){n.finished=!0,n.endTime=n.nextTime+(n.def.tail??2);break}n.def.schedule(this,n,n.step,n.nextTime),n.step++,n.nextTime+=n.stepDur}}if(n.endTime>0&&e>n.endTime){for(let e of n.faders)e.disconnect();n.endTime=-1,t=!0}}t&&(this.decks=this.decks.filter(e=>e.endTime>=0))}dispose(){for(let e of this.decks)for(let t of e.faders)t.disconnect();this.decks=[],this.reverb.disconnect(),this.current=`none`}fadeOut(e,t,n){for(let r of e.faders){let e=r.gain,i=e.value;e.cancelScheduledValues(t),e.setValueAtTime(i,t),e.linearRampToValueAtTime(0,t+n)}e.finished=!0,e.fading=!0,e.endTime=t+n+.05}makeDeck(e,t,n,r){let i=this.ctx,a=60/t.bpm/4,o=i.createGain(),s=i.createGain(),c=i.createGain(),l=i.createGain(),u=i.createGain();o.connect(s).connect(this.out),u.connect(c).connect(this.reverb);let d=i.createDelay(2);d.delayTime.value=a*t.delaySteps;let f=i.createGain();f.gain.value=.36;let p=i.createBiquadFilter();p.type=`lowpass`,p.frequency.value=2600,l.connect(d).connect(p).connect(f).connect(d),p.connect(o),p.connect(u);let m={};for(let e of Object.keys(Xc)){let[t,n,r]=Xc[e],a=i.createGain();if(a.gain.value=t,a.connect(o),m[e]=a,n>0){let e=i.createGain();e.gain.value=n,a.connect(e).connect(l)}if(r>0){let e=i.createGain();e.gain.value=r,a.connect(e).connect(u)}}for(let e of[s,c])e.gain.setValueAtTime(0,n),e.gain.linearRampToValueAtTime(t.gain,n+r);return{track:e,def:t,bus:m,faders:[s,c],stepDur:a,step:0,nextTime:n+.06,finished:!1,fading:!1,endTime:0}}osc(e,t,n,r,i=0){let a=this.ctx.createOscillator();return a.type=e,a.frequency.value=t,a.detune.value=i,a.start(n),a.stop(r),a}amp(e,t,n,r,i,a,o){let s=this.ctx.createGain(),c=Math.max(a,n+.01);return s.gain.setValueAtTime(0,e),s.gain.linearRampToValueAtTime(t,e+n),s.gain.setTargetAtTime(t*i,e+n,r),s.gain.setTargetAtTime(0,e+c,o/4),[s,e+c+o]}release(e,t){e.onended=()=>t.disconnect()}bass(e,t,n,r,i){let a=Qc(n),[o,s]=this.amp(t,i*.42,.006,.1,.7,r,.1),c=this.ctx.createBiquadFilter();c.type=`lowpass`,c.Q.value=2.5,c.frequency.setValueAtTime(Math.min(4e3,a*10),t),c.frequency.setTargetAtTime(a*2.8,t,.09);let l=this.osc(`sawtooth`,a,t,s);l.connect(c),this.osc(`sawtooth`,a,t,s,9).connect(c),this.osc(`triangle`,a,t,s).connect(c),c.connect(o).connect(e.bus.bass),this.release(l,o)}pluck(e,t,n,r,i,a=0,o=1){let s=Qc(n),[c,l]=this.amp(t,i*.16,.004,.09,.15,r,.12),u=this.ctx.createBiquadFilter();u.type=`lowpass`,u.Q.value=1.6,u.frequency.setValueAtTime(Math.min(9e3,s*7*o),t),u.frequency.setTargetAtTime(s*1.6,t,.07);let d=this.osc(`square`,s,t,l);d.connect(u),this.osc(`sawtooth`,s,t,l,10).connect(u);let f=this.ctx.createStereoPanner();f.pan.value=a,u.connect(c).connect(f).connect(e.bus.pluck),this.release(d,f)}pad(e,t,n,r,i,a=900,o=.5){let s=this.ctx,c=t+r+1.6,l=s.createGain(),u=i*.1/Math.sqrt(n.length);l.gain.setValueAtTime(0,t),l.gain.linearRampToValueAtTime(u,t+o),l.gain.setTargetAtTime(0,t+Math.max(r,o+.01),.32);let d=s.createBiquadFilter();d.type=`lowpass`,d.Q.value=.8,d.frequency.setValueAtTime(a*.6,t),d.frequency.linearRampToValueAtTime(a*1.3,t+r*.6);let f=null;for(let e of n){let n=Qc(e),r=this.osc(`sawtooth`,n,t,c,-7);r.connect(d),this.osc(`sawtooth`,n,t,c,7).connect(d),f??=r}d.connect(l).connect(e.bus.pad),f&&this.release(f,l)}lead(e,t,n,r,i){let a=this.ctx,o=Qc(n),[s,c]=this.amp(t,i*.17,.02,.3,.7,r,.18),l=a.createBiquadFilter();l.type=`lowpass`,l.frequency.value=3200;let u=this.osc(`triangle`,o,t,c),d=this.osc(`sawtooth`,o,t,c,5),f=a.createGain();f.gain.value=.22,u.connect(l),d.connect(f).connect(l);let p=this.osc(`sine`,5.4,t,c),m=a.createGain();m.gain.setValueAtTime(0,t),m.gain.linearRampToValueAtTime(0,t+.18),m.gain.linearRampToValueAtTime(9,t+.45),p.connect(m),m.connect(u.detune),m.connect(d.detune),l.connect(s).connect(e.bus.lead),this.release(u,s)}bell(e,t,n,r,i=.5){let a=this.ctx,o=Qc(n),s=t+i*6,c=a.createGain();c.gain.setValueAtTime(0,t),c.gain.linearRampToValueAtTime(r*.2,t+.004),c.gain.setTargetAtTime(0,t+.004,i);let l=this.osc(`sine`,o,t,s);l.connect(c);for(let[e,n]of[[2.76,.28],[5.4,.1]]){let r=a.createGain();r.gain.setValueAtTime(n,t),r.gain.setTargetAtTime(0,t,i*.35),this.osc(`sine`,o*e,t,s).connect(r).connect(c)}c.connect(e.bus.bell),this.release(l,c)}drum(e,t,n,r,i=1,a=0,o=0){let s=this.ctx,c=this.bank.get(n),l=s.createBufferSource();l.buffer=c[o%c.length],l.playbackRate.value=i;let u=s.createGain();u.gain.value=r;let d=l.connect(u);if(a!==0){let e=s.createStereoPanner();e.pan.value=a,d=d.connect(e)}d.connect(e.bus.drums),l.onended=()=>d.disconnect(),l.start(t)}},el=[{root:33,pad:[57,60,64,67]},{root:29,pad:[53,57,60,64]},{root:36,pad:[55,60,62,64]},{root:31,pad:[55,59,62,64]},{root:33,pad:[57,60,64,67]},{root:29,pad:[53,57,60,64]},{root:38,pad:[53,57,60,62]},{root:28,pad:[56,59,62,64]},{root:29,pad:[53,57,60,65]},{root:31,pad:[55,59,62,67]},{root:28,pad:[55,59,62,64]},{root:33,pad:[57,60,64,67]},{root:38,pad:[53,57,60,64]},{root:31,pad:[53,55,59,62]},{root:28,pad:[57,59,64,69]},{root:28,pad:[56,59,62,64]}],tl=[[[0,76,3],[3,81,3],[6,79,2],[8,76,6],[14,74,2]],[[0,72,6],[6,74,2],[8,76,3],[11,72,5]],[[0,79,3],[3,76,3],[6,74,2],[8,76,8]],[[0,74,6],[6,71,2],[8,74,3],[11,79,3],[14,77,2]],[[0,76,8]],[[2,81,2],[4,79,2],[6,77,2],[8,76,3],[11,72,5]],[[0,74,3],[3,77,3],[6,81,2],[8,79,3],[11,77,3],[14,76,2]],[[0,80,6],[6,83,2],[8,76,8]],[[0,81,4],[4,84,4],[8,81,3],[11,77,5]],[[0,79,4],[4,83,4],[8,79,3],[11,74,5]],[[0,76,3],[3,79,3],[6,83,2],[8,81,3],[11,79,3],[14,76,2]],[[0,81,10]],[[0,77,3],[3,76,3],[6,74,2],[8,77,3],[11,81,5]],[[0,79,3],[3,77,3],[6,74,2],[8,71,3],[11,74,5]],[[0,76,6],[6,81,2],[8,83,8]],[[0,80,6],[8,76,4],[12,68,2],[14,71,2]]],nl=[0,2,1,3,2,-1,3,1,4,2,3,-1,2,3,1,2],rl=[0,-1,2,3,4,3,-1,2,5,3,2,-1,4,3,2,1],il=[0,3,6,8,11,14],al={0:0,3:0,6:12,8:0,11:7,14:12},ol=[0,3,6,10,12],sl={bpm:100,gain:.95,delaySteps:3,schedule(e,t,n,r){let i=t.stepDur,a=n%16,o=Math.floor(n/16),s=o%16,c=Math.floor(o/16)%4,l=el[s],u=(c===0||c===2)&&s<8,d=!(c===0&&s<4),f=c===1||c===3&&s>=8,p=c>=2?rl:nl,m=il.includes(a);a===0&&e.pad(t,r,l.pad,i*16,.9,u?750:1050);let h=p[a];if(h>=0){let n=l.pad[h%4]+12+(h>=4?12:0);e.pluck(t,r,n,i*1.4,m?.9:.55,a%2==0?-.35:.35,u?.6:1)}d&&a in al&&(c===2&&s<8?(a===0||a===8)&&e.bass(t,r,l.root+12,i*7,.5):e.bass(t,r,l.root+12+al[a],i*(a===6||a===14?1.6:2.4),m&&a%8==0?.7:.56));for(let[n,o,c]of tl[s])f&&n===a&&e.lead(t,r,o,i*c*.92,.85);e.drum(t,r,`drum_shaker`,[.2,.08,.14,.09][a%4],1,.3),d&&ol.includes(a)&&e.drum(t,r,`drum_rim`,.2,1,-.3),u?d&&a%4==2&&e.drum(t,r,`drum_hat`,.1,1,.15):((a===0||a===8)&&e.drum(t,r,`drum_kick`,.5),a===11&&s%2==1&&e.drum(t,r,`drum_kick`,.3),(a===4||a===12)&&e.drum(t,r,`drum_snare`,.36),a%2==0&&e.drum(t,r,`drum_hat`,a%4==2?.16:.1,1,.15,+(a===14)),s%4==3&&a>=10&&a!==11&&e.drum(t,r,`drum_conga`,.22+.04*(a-10),1,-.2,+(a===10||a===14)))}},cl=[38,38,34,38,38,41,39,38],ll=[62,65,67,69,72,74,75,77,81],ul={bpm:72,gain:.5,delaySteps:3,schedule(e,t,n,r){let i=t.stepDur,a=n%16,o=Math.floor(n/16),s=cl[o%8];a===0&&e.pad(t,r,[s,s+7,s+12],i*17,1,260,1.4),a===0&&e.drum(t,r,`drum_kick`,.42,.78),a===3&&e.drum(t,r,`drum_kick`,.24,.74),a%4==2&&e.drum(t,r,`drum_click`,.07,1,a%8==2?-.5:.5);let c=gt(n,7,31);if(a%2==0&&c<.13){let i=Math.floor(gt(n,11,57)*ll.length);e.bell(t,r,ll[i]+ +(s===39&&i===0),.5+c*3,.7)}o%8==6&&a===0&&e.pad(t,r,[87,94],i*14,.35,2400,2)}},dl=[38,38,34,36,38,38,41,39],fl={bpm:132,gain:.34,delaySteps:3,schedule(e,t,n,r){let i=t.stepDur,a=n%16,o=Math.floor(n/16),s=o%8,c=dl[s];if(a%4!=1&&e.bass(t,r,c+(a===6||a===14?12:0),i*.9,a%4==0?1:.62),a%4==0&&e.drum(t,r,`drum_kick`,.62),a%4==2?e.drum(t,r,`drum_hat`,.2,1,.2,+(a===14)):e.drum(t,r,`drum_hat`,.06,1,.2),s>=4&&(a===4||a===12)&&e.drum(t,r,`drum_snare`,.4),o%2==0&&(a===0||a===6||a===12))for(let[n,a]of[c+24,c+27,c+31].entries())e.pluck(t,r,a,i*1.5,.75,(n-1)*.4,1.3);a===0&&o%2==0&&e.pad(t,r,[c+12,c+19,c+24],i*32,.9,520,.8),s>=6&&a%2==0&&e.pluck(t,r,s===6?81:82,i,.3+.035*(a+(s-6)*16),0,1.6)}},pl=[[0,`kick`,[],0],[0,`cymbal`,[],0],[0,`pluck`,[69],2],[1,`pluck`,[73],2],[2,`pluck`,[76],2],[3,`pluck`,[81],2],[4,`pad`,[62,66,69,74],5],[4,`lead`,[78],4],[4,`bass`,[38],4],[8,`kick`,[],0],[9,`pad`,[64,68,71,76],5],[9,`lead`,[80],4],[9,`bass`,[40],4],[14,`kick`,[],0],[14,`cymbal`,[],0],[14,`pad`,[57,61,64,69,73],12],[14,`lead`,[81],10],[14,`bass`,[45],11],[14,`bell`,[81],0],[15,`bell`,[85],0],[16,`bell`,[88],0],[17,`bell`,[93],0],[19,`bell`,[88],0],[20,`bell`,[93],0],[22,`bell`,[97],0]],ml=[[0,`thud`,[],0],[0,`pad`,[45,52,57,60,64],15],[0,`bass`,[33],14],[1,`lead`,[76],4],[5,`lead`,[74],4],[9,`lead`,[72],4],[13,`lead`,[71],3],[16,`thud`,[],0],[16,`pad`,[45,53,57,60],8],[16,`bass`,[33],8],[17,`lead`,[69],8],[17,`bell`,[57],0]];function hl(e,t,n,r,i){return{bpm:t,gain:.85,delaySteps:3,steps:n,tail:r,schedule(t,n,r,a){let o=n.stepDur;for(let[s,c,l,u]of e)if(s===r){if(c===`kick`)t.drum(n,a,`drum_kick`,.7);else if(c===`thud`)t.drum(n,a,`drum_kick`,.6,.62);else if(c===`cymbal`)t.drum(n,a,`drum_cymbal`,.3);else if(c===`pad`)t.pad(n,a,l,o*u,1.2,1500*i,i>.6?.08:.5);else for(let e of l)c===`pluck`?t.pluck(n,a,e,o*u,1,0,1.4):c===`lead`?t.lead(n,a,e,o*u,1):c===`bass`?t.bass(n,a,e,o*u,.9):t.bell(n,a,e,.8,.45)}}}}var gl=[0,2,4,5,7,9,11],_l=[0,2,3,5,7,8,10],vl=[[0,5,2,6],[0,3,6,2],[0,6,5,4],[0,2,5,6]],yl=[[0,4,5,3],[0,5,3,4],[1,4,0,5],[0,3,1,4]],bl=[[[0,3],[3,3],[6,2],[8,6]],[[0,6],[6,2],[8,3],[11,5]],[[2,2],[4,2],[6,2],[8,3],[11,3],[14,2]],[[0,10]],[[0,4],[4,4],[8,3],[11,5]],[[0,3],[3,3],[6,2],[8,3],[11,3],[14,2]],[[0,2],[3,2],[6,2],[8,8]]],xl=[[0,0],[2,2],[3,1],[5,2],[7,3],[8,1],[10,2],[11,0],[13,2],[15,3]],Sl=[2,6,7,10,14,15],Cl=[[0,0,2.4],[3,0,1],[6,12,1],[7,10,1.4],[10,0,1.6],[12,7,1],[14,12,1.4]],wl=new Map;function Tl(e){let t=wl.get(e);if(t)return t;let n=2166136261;for(let t=0;t<e.length;t++)n=Math.imul(n^e.charCodeAt(t),16777619);let r=new Bt(n),i=r.int(0,2),a=i===1?r.chance(.8):r.chance(.5),o=a?_l:gl,s=55+r.int(0,7),c=r.pick(a?vl:yl),l=i===0?r.int(104,116):i===1?r.int(96,106):r.int(112,122),u=r.chance(.5)?nl:rl,d=e=>s+o[(e%7+7)%7]+12*Math.floor(e/7),f=c.map(e=>{let t=d(e)>63?12:0,n=[0,2,4,6].map(n=>d(e+n)-t);return{root:40+(n[0]-40)%12,pad:n}}),p=[],m=2+r.int(0,3);for(let e=0;e<8;e++){let t=c[e%4],n=e===7?bl[3]:r.pick(bl),i=[];n.forEach(([e,n],a)=>{if(a===0){let e=m,n=99;for(let r=-1;r<3;r++)for(let i of[0,2,4]){let a=t+i+7*r;Math.abs(a-m)<n&&(n=Math.abs(a-m),e=a)}m=e}else m+=r.pick([-2,-1,-1,1,1,2]);m=Math.max(0,Math.min(7,m)),i.push([e,d(m),n])}),p.push(i)}let h={bpm:l,gain:.8,delaySteps:3,schedule(e,t,n,r){let a=t.stepDur,o=n%16,s=Math.floor(n/16),c=f[s%4],l=s>=2,d=l&&(s-2)%16<12;if(o===0&&e.pad(t,r,c.pad,a*16,.8,l?1100:800),d)for(let[n,i,c]of p[(s-2)%8])n===o&&e.lead(t,r,i+12,a*c*.9,.8);if(i===0){let n=u[o];n>=0&&e.pluck(t,r,c.pad[n%4]+12+(n>=4?12:0),a*1.3,il.includes(o)?.85:.5,o%2==0?-.3:.3),l&&o%2==0&&e.bass(t,r,c.root+(o%4==2?12:0),a*1.5,o%8==0?.7:.55),o%2==0&&e.drum(t,r,`drum_hat`,o%4==2?.18:.11,1,.2,+(o===14)),l&&((o===0||o===8||o===10&&s%2==1)&&e.drum(t,r,`drum_kick`,o===10?.35:.6),(o===4||o===12)&&e.drum(t,r,`drum_snare`,.42))}else if(i===1){for(let[n,i]of xl)n===o&&e.pluck(t,r,c.pad[i]+12,a*1.2,i===0?.85:.6,i%2==0?-.25:.25,1.2);o in al&&e.bass(t,r,c.root+al[o],a*(o===6||o===14?1.6:2.4),o%8==0?.7:.56),e.drum(t,r,`drum_shaker`,[.22,.09,.15,.1][o%4],1,.3),ol.includes(o)&&e.drum(t,r,`drum_rim`,.26,1,-.3),l&&((o===0||o===8)&&e.drum(t,r,`drum_kick`,.5),Sl.includes(o)&&e.drum(t,r,`drum_conga`,o===6||o===14?.34:.22,1,-.2,+(o===7||o===15)))}else{for(let[n,i,s]of Cl)n===o&&(l||n===0)&&e.bass(t,r,c.root+i,a*s,n===0?.75:.58);if(o===4||o===7||o===12||o===15)for(let[n,i]of c.pad.entries())e.pluck(t,r,i+12,a*.9,.5,(n-1.5)*.3,1.3);o%4==2?e.drum(t,r,`drum_hat`,.2,1,.2,1):o%2==1&&e.drum(t,r,`drum_hat`,.07,1,.2),l&&(o%4==0&&e.drum(t,r,`drum_kick`,.6),(o===4||o===12)&&e.drum(t,r,`drum_snare`,.4))}o===0&&s===2&&e.drum(t,r,`drum_cymbal`,.22)}};return wl.set(e,h),h}var El={menu:sl,match:ul,storm:fl,victory:hl(pl,120,27,2.4,1),defeat:hl(ml,100,26,2.2,.45)};function Dl(e,t){let n=e.zeros(Math.min(t.dur,.6));e.mix(n,Y(e,`hp`,t.crack[1],.7,t.crack[2],2e-4),t.crack[0]),e.mix(n,Y(e,`lp`,t.blast[1],.7,t.blast[2],3e-4),t.blast[0]),e.mix(n,Y(e,`bp`,t.body[1],t.body[2],t.body[3],6e-4),t.body[0]),e.mix(n,nc(e,t.thump[1],t.thump[2],t.thump[3],t.thump[4]),t.thump[0]),e.drive(e.norm(n,1),t.drive),t.mech&&e.mix(n,rc(e,t.mech[1],.007),t.mech[0],t.mech[2]);let r=e.stereo(t.dur);e.mixS(r,n);let[i,a,o,s]=t.tail;for(let n of r){let r=e.white(t.dur-.01);e.lp(r,e=>s+(o-s)*Math.exp(-e/(a*.8))),e.hp(r,140),e.mix(n,e.decay(r,a,.006),i,.002)}let c=e.lp(n.slice(),1600);for(let[n,i,a]of t.echoes)e.mixS(r,c,i,n,a);return e.norm(r,.95)}var Ol=e=>Dl(e,{dur:.55,crack:[1,2500,.002],blast:[1.4,7e3,.014],body:[1,1400,.9,.024],thump:[.45,230,85,.015,.028],tail:[.2,.085,5200,900],echoes:[[.071,.1,-.4],[.124,.06,.5]],drive:2.4,mech:[.1,2900,.058]}),kl=e=>Dl(e,{dur:.28,crack:[1,3500,.0015],blast:[1.3,9e3,.008],body:[.9,2300,1,.013],thump:[.3,320,140,.01,.015],tail:[.16,.042,6500,1500],echoes:[[.052,.07,.3]],drive:2,mech:[.08,3600,.034]}),Al=e=>Dl(e,{dur:1,crack:[1.2,2e3,.0035],blast:[1.5,6e3,.022],body:[1.1,620,.7,.045],thump:[.55,180,58,.025,.05],tail:[.3,.22,5e3,700],echoes:[[.093,.13,-.5],[.171,.09,.6],[.274,.05,-.2]],drive:3.2,mech:[.07,2300,.075]}),jl=e=>Dl(e,{dur:1.35,crack:[.7,1500,.005],blast:[1.6,3800,.04],body:[1.3,360,.6,.08],thump:[.7,130,40,.05,.1],tail:[.32,.28,3600,480],echoes:[[.112,.14,.7],[.209,.1,-.7],[.338,.06,.3]],drive:3.6}),Ml=e=>Dl(e,{dur:2.7,crack:[1.4,2800,.003],blast:[1.5,5500,.03],body:[1.1,520,.6,.065],thump:[.6,150,45,.04,.09],tail:[.28,.6,4500,420],echoes:[[.162,.2,-.6],[.331,.14,.7],[.553,.09,-.3],[.824,.06,.4],[1.21,.035,0]],drive:3.4});function Nl(e){let t=e.zeros(1.15);return e.mix(t,rc(e,2400,.012),.7),e.mix(t,e.fade(e.bp(e.white(.14),e=>1800-e*6e3,2),.02,.08),.5,.03),e.mix(t,e.fade(e.bp(e.white(.1),e=>900+e*9e3,2),.03,.02),.45,.42),e.mix(t,nc(e,190,90,.02,.03),.9,.52),e.mix(t,rc(e,1500,.02),.8,.52),e.mix(t,rc(e,3100,.01),.6,.8),e.mix(t,e.fade(e.bp(e.white(.09),2600,3),.01,.03),.4,.81),e.mix(t,rc(e,2e3,.018),1,.93),e.mix(t,nc(e,240,120,.01,.02),.5,.93),e.norm(t,.85)}function Pl(e){let t=e.zeros(.14);return e.mix(t,rc(e,1900,.006,.8)),e.mix(t,rc(e,3300,.004,.4),.5,.012),e.mix(t,e.modes(.1,[[620,.02,.25],[1130,.015,.15]],!0),1,.004),e.norm(t,.8)}function Fl(e){let t=e.zeros(.36),n=e.bp(e.white(.2),e=>900+13e3*e,1.2);return e.env(n,e=>cc(.2,2)(e)*(.6+.4*Math.sin(e*140))),e.mix(t,n,1.2),e.mix(t,rc(e,1400,.012),.7,.12),e.mix(t,nc(e,210,110,.015,.025),.5,.12),e.mix(t,rc(e,2500,.009),.9,.2),e.norm(t,.8)}function Il(e,t){let n=e.zeros(.5),r=3800+t*450+e.rand(-150,150),i=0,a=1,o=.12+e.rand(-.02,.02);for(let t=0;t<4;t++){let t=r*(1+e.rand(-.04,.04)),s=e.modes(.12,[[t,.022,1],[t*1.47,.016,.7],[t*2.09,.012,.5],[t*2.83,.008,.3]],!0);e.mix(s,Y(e,`hp`,5e3,.7,.001),.5),e.mix(n,s,a,i),i+=o,o*=.58,a*=.55}return e.norm(n,.8)}function Ll(e,t){let n=.34,r=2500+t*550,i=e=>r*(.42+.58/(1+Math.exp((e-.09)*55))),a=e.bp(e.white(n),i,5);return e.mix(a,e.bp(e.osc(n,`saw`,i),i,3),.12),e.env(a,e=>Math.exp(-(((e-.09)/(e<.09?.035:.075))**2))),e.mix(a,Y(e,`hp`,4500,.7,.0015),.25,.085),e.norm(a,.85)}function Rl(e,t){let n=e.zeros(.42);e.mix(n,Y(e,`hp`,2200,.7,.003)),e.mix(n,Y(e,`bp`,480+t*90,1.2,.022),.9),e.mix(n,nc(e,160,80,.01,.02),.3);let r=e.bp(e.dust(.38,e=>900*Math.exp(-e/.08)),3200+e.rand(-500,500),1.5);return e.mix(n,e.norm(r,1),.35,.01),e.mix(n,Y(e,`bp`,1400,.6,.05,.004),.25),e.norm(n,.9)}function zl(e,t){let n=[1150,1720,2380][t%3]*(1+e.rand(-.04,.04)),r=e.zeros(.6);e.mix(r,Y(e,`hp`,3500,.7,.0015),.9),e.mix(r,Y(e,`bp`,900,1,.012),.6);let i=e.modes(.6,[[n,.09,1],[n*2.32,.07,.7],[n*3.87,.05,.55],[n*5.21,.035,.4],[n*6.9,.02,.3],[n*.48,.03,.4]],!0);return e.mix(r,i,.8),t%3==2&&e.mix(r,e.decay(e.sweep(.3,4300,1500,.09),.07,.002),.4,.004),e.norm(r,.9)}function Bl(e,t){let n=e.zeros(.3),r=170+t*35+e.rand(-10,10);e.mix(n,e.modes(.25,[[r,.03,1],[r*2.4,.022,.7],[r*4.3,.015,.45],[r*6.8,.01,.25]])),e.mix(n,Y(e,`bp`,2600,1.5,.005),.7);let i=e.bp(e.dust(.2,e=>500*Math.exp(-e/.05)),4200,2);return e.mix(n,e.norm(i,1),.3,.008),e.norm(n,.9)}function Vl(e,t){let n=e.zeros(.36);e.mix(n,Y(e,`lp`,1700+t*250,.7,.03,.003)),e.mix(n,Y(e,`hp`,3200,.7,.06,.008),.3),e.mix(n,nc(e,120,60,.02,.03,.003),.5);let r=e.hp(e.dust(.3,e=>2500*Math.exp(-e/.07)),2500);return e.mix(n,r,.15,.02),e.norm(n,.85)}function Hl(e,t){let n=e.zeros(.46),r=420+t*110;e.mix(n,Y(e,`bp`,2400,.8,.02,.002),.8),e.mix(n,ac(e,r,8,.035),.9,.012),e.mix(n,ac(e,r*1.7,10,.02),.4,.06),e.mix(n,Y(e,`hp`,3500,.7,.08,.01),.3,.01);for(let t=0;t<3;t++)e.mix(n,ac(e,e.rand(900,2200),12,.008),.2,.12+e.rand(0,.2));return e.norm(n,.85)}function Ul(e,t){let n=e.zeros(.5);return e.mix(n,Y(e,`hp`,4e3,.7,.002)),e.mix(n,Y(e,`bp`,1900+300*t,2,.012),.7),e.mix(n,sc(e,.48,14,3200,9500,.06),.7,.004),e.norm(n,.85)}function Wl(e,t){let n=e.zeros(.26);return e.mix(n,nc(e,170+t*15,70,.018,.035)),e.mix(n,Y(e,`lp`,520,.8,.02,.001),.8),e.mix(n,Y(e,`bp`,1700,1,.006),.3),e.norm(e.drive(e.norm(n,1),1.5),.85)}function Gl(e){let t=e.zeros(.42);return e.mix(t,Y(e,`hp`,3e3,.7,.002),.8),e.mix(t,e.modes(.2,[[880,.018,1],[1420,.012,.6],[2350,.008,.35]])),e.mix(t,nc(e,200,90,.012,.025),.6),e.mix(t,e.modes(.4,[[2640,.07,.5],[3960,.05,.35],[5310,.035,.2]]),.8,.015),e.norm(t,.9)}function Kl(e){let t=e.zeros(.09);return e.mix(t,e.modes(.08,[[1480,.009,1],[2230,.007,.7],[3350,.005,.3]])),e.mix(t,Y(e,`hp`,4500,.7,.0015),.5),e.norm(t,.8)}function ql(e){let t=e.zeros(.75);return e.mix(t,nc(e,150,60,.02,.04),.7),e.mix(t,Y(e,`hp`,3e3,.7,.002),.3),e.mix(t,ic(e,659.26,.1),.6),e.mix(t,ic(e,987.77,.11),.7,.085),e.mix(t,ic(e,1318.51,.1),.45,.17),e.norm(e.verb(t,{time:.6,mix:.3}),.85)}function Jl(e){let t=e.zeros(.42);return e.mix(t,nc(e,130,48,.03,.06)),e.mix(t,e.drive(Y(e,`bp`,520,.8,.045,.002),3),.5),e.mix(t,nc(e,95,45,.03,.05),.5,.13),e.mix(t,Y(e,`bp`,2100,2,.01),.2),e.norm(e.drive(e.norm(t,1),1.6),.9)}function Yl(e){let t=e.stereo(1.05),n=e.osc(.45,`saw`,e=>2600*Math.exp(-e/.11)+180);return e.bp(n,e=>3200*Math.exp(-e/.13)+300,3),e.mixS(t,e.norm(e.decay(n,.12,.002),1),.7),e.mixS(t,Y(e,`hp`,3500,.7,.004),.8),e.mixS(t,nc(e,120,45,.05,.09),.7),e.mixS(t,sc(e,.95,30,2400,9e3,.14),.6,.03,-.4),e.mixS(t,sc(e,.95,30,2400,9e3,.18),.6,.06,.4),e.norm(t,.9)}function Xl(e,t){let n=e.zeros(.2);return e.mix(n,nc(e,140+e.rand(-15,15),70,.012,.018),.45),e.mix(n,Y(e,`bp`,1700+t*180+e.rand(-150,150),1.2,.009)),e.mix(n,Y(e,`hp`,3800,.7,.02,.003),.18),e.mix(n,Y(e,`bp`,900,.8,.014,.003),.35,.045+e.rand(-.01,.01)),e.norm(n,.8)}function Zl(e,t){let n=e.zeros(.32),r=oc(e,e.bp(e.white(.3),850+t*120,.7),130);return e.env(r,e=>Math.min(1,e/.012)*Math.exp(-e/.06)),e.mix(n,e.norm(r,1)),e.mix(n,Y(e,`hp`,3e3,.7,.05,.01),.2),e.mix(n,nc(e,95,50,.02,.03,.004),.45),e.norm(n,.75)}function Ql(e,t){let n=e.zeros(.3),r=150+t*14+e.rand(-8,8);if(e.mix(n,e.modes(.28,[[r,.045,1],[r*2.07,.035,.7],[r*3.6,.025,.4],[r*5.9,.012,.2]])),e.mix(n,Y(e,`bp`,1200,1,.008),.6),t===3){let t=e.bp(e.osc(.09,`saw`,e=>610+1500*e),1400,3);e.mix(n,e.env(t,cc(.09)),.25,.03)}return e.norm(n,.8)}function $l(e,t){let n=e.zeros(.34),r=oc(e,e.bp(e.white(.32),3600+t*300,.6),95);e.env(r,e=>Math.min(1,e/.018)*Math.exp(-e/.07)),e.mix(n,e.norm(r,1)),e.mix(n,nc(e,90,50,.02,.03,.005),.3);let i=e.bp(e.dust(.2,e=>400*Math.exp(-e/.06)),5200,2);return e.mix(n,e.norm(i,1),.3,.01),e.norm(n,.7)}function eu(e,t){let n=e.zeros(.42),r=500+t*45+e.rand(-20,20);return e.mix(n,nc(e,150,75,.012,.02),.7),e.mix(n,Y(e,`bp`,2100,1.2,.006),.7),e.mix(n,e.modes(.4,[[r,.06,.6],[r*2.58,.05,.5],[r*4.35,.035,.35],[r*7.5,.02,.2]],!0)),e.norm(n,.8)}function tu(e,t){let n=e.zeros(.42),r=e.bp(e.white(.3),e=>520+(1300+t*150)*Math.min(1,e/.12),1.1);e.env(r,e=>Math.min(1,e/.015)*Math.exp(-e/.075)),e.mix(n,e.norm(r,1)),e.mix(n,ac(e,300+e.rand(0,200),6,.025),.5,.02),e.mix(n,ac(e,520+e.rand(0,300),8,.018),.35,.07);for(let t=0;t<3;t++)e.mix(n,ac(e,e.rand(1100,2600),12,.007),.18,.12+e.rand(0,.22));return e.norm(n,.75)}function nu(e){let t=e.zeros(.27);e.mix(t,Y(e,`bp`,1100,.8,.012,.002),.6),e.mix(t,nc(e,130,70,.015,.02),.4);let n=e.bp(e.white(.22),e=>500+6800*e,1.3);return e.mix(t,e.env(n,cc(.22,2)),1.2,.02),e.norm(t,.7)}function ru(e){let t=e.zeros(.38);return e.mix(t,nc(e,125,52,.025,.045)),e.mix(t,Y(e,`lp`,420,.8,.03,.001),.8),e.mix(t,Y(e,`bp`,1500,1,.012),.5),e.mix(t,Y(e,`bp`,1300,1,.012),.35,.03),e.mix(t,Y(e,`hp`,3200,.7,.05,.005),.15,.01),e.norm(t,.9)}function iu(e){let t=e.stereo(1.5);e.mixS(t,Y(e,`lp`,3200,.7,.05,.002)),e.mixS(t,nc(e,95,42,.05,.1,.004),.9,.01),e.mixS(t,ac(e,180,3,.05),.5,.06);for(let n of t){let t=oc(e,e.hp(e.white(1.3),2200),55,.7);e.mix(n,e.decay(t,.3,.03),.5,.02);let r=e.bp(e.pink(1),e=>1400-900*e,.7);e.mix(n,e.decay(r,.25,.05),1.6,.02)}for(let n=0;n<14;n++)e.mixS(t,ac(e,e.rand(700,2600),10,e.rand(.006,.014)),e.rand(.08,.3),e.rand(.25,1.3),e.rand(-.8,.8));return e.norm(t,.92)}function au(e,t){let n=e.zeros(.7),r=e.bp(e.white(.55),e=>450+(900+t*200)*Math.sin(Math.PI*Math.min(1,e/.5)),1.1);oc(e,r,40,.5),e.env(r,e=>Math.min(1,e/.09)*Math.exp(-Math.max(0,e-.09)/.14)),e.mix(n,e.norm(r,1));for(let t=0;t<4;t++)e.mix(n,ac(e,e.rand(350,900),5,e.rand(.012,.03)),e.rand(.15,.4),e.rand(.08,.4));for(let t=0;t<5;t++)e.mix(n,ac(e,e.rand(1200,2800),10,.008),e.rand(.05,.15),e.rand(.25,.62));return e.norm(n,.7)}function ou(e){let t=e.stereo(1.5);e.mixS(t,Y(e,`hp`,1800,.7,.006),.7,.03),e.mixS(t,nc(e,82,38,.08,.16,.01),.7,.02);for(let n of t){let t=e.lp(e.white(1.2),e=>320+3200*Math.exp(-e/.16));e.mix(n,e.env(t,e=>Math.min(1,e/.03)*Math.exp(-e/.3)),1.2);let r=e.bp(e.white(1),700,.8);e.env(r,e=>Math.exp(-e/.35)*(.5+.5*Math.sin(2*Math.PI*(15-6*e)*e))**2),e.mix(n,r,1.8,.25)}return e.mixS(t,rc(e,520,.03,.2),.3,.09,-.3),e.mixS(t,rc(e,640,.025,.2),.25,.13,.3),e.norm(t,.92)}function su(e,t){let n=e.zeros(.32),r=2+t%2;for(let t=0;t<r;t++){let r=t*(.06+e.rand(0,.02));e.mix(n,Y(e,`bp`,600+e.rand(0,700),.7,.02+e.rand(0,.012),.006),1-t*.25,r),e.mix(n,nc(e,150,80,.02,.02,.004),.3,r)}return e.norm(n,.7)}function cu(e){let t=e.zeros(.44);e.mix(t,rc(e,2300,.006,.6),.5),e.mix(t,nc(e,105,58,.03,.05),1,.018),e.mix(t,Y(e,`lp`,520,.8,.03,.001),.8,.018),e.mix(t,e.modes(.3,[[310,.05,.3],[690,.04,.25],[1120,.03,.15]],!0),1,.02);let n=e.bp(e.dust(.12,e=>350*Math.exp(-e/.04)),2900,3);return e.mix(t,e.norm(n,1),.12,.03),e.norm(t,.9)}function lu(e){let t=.7,n=e.zeros(t);for(let[r,i]of[[415,1],[523,.9]]){let a=e=>r*(1+.004*Math.sin(e*38))*(1-.03*Math.exp(-e/.02)),o=e.osc(t,`square`,a);e.mix(o,e.osc(t,`saw`,a),.6),e.mix(n,o,i)}return e.filter(n,`peak`,2400,1.2,9),e.lp(e.hp(n,320),5200),e.drive(e.norm(n,1),1.4),e.env(n,e=>Math.min(1,e/.012)*Math.min(1,(t-e)/.07)),e.norm(e.verb(n,{time:.45,mix:.18}),.85)}function uu(e){let t=e.stereo(1.4);e.mixS(t,nc(e,95,34,.05,.14)),e.mixS(t,Y(e,`lp`,900,.7,.07,.001),.9),e.mixS(t,Y(e,`hp`,2500,.7,.006),.6);for(let[n,r]of[[340,-.5],[710,.4],[1280,-.2],[2150,.6]]){let i=oc(e,e.bp(e.white(.5),n*(1+e.rand(-.05,.05)),6),60);e.mixS(t,e.norm(e.decay(i,.13,.002),1),.45,e.rand(0,.04),r)}e.mixS(t,rc(e,780,.06),.4,.16,.5),e.mixS(t,rc(e,1250,.05),.3,.29,-.4),e.mixS(t,sc(e,.9,22,2600,9e3,.15),.3,.08,.2);for(let n of t)e.drive(n,1.3);return e.norm(t,.95)}function du(e){let t=e.stereo(2.4);e.mixS(t,Y(e,`hp`,1400,.7,.012,3e-4),.9),e.mixS(t,Y(e,`lp`,2400,.7,.05,5e-4),1.2),e.mixS(t,nc(e,120,30,.07,.3,.001),1.3);for(let n of t){let t=e.lp(e.brown(2.2),e=>140+2600*Math.exp(-e/.22));e.mix(n,e.env(t,e=>Math.min(1,e/.004)*Math.exp(-e/.45)),4,.004)}let n=oc(e,e.decay(e.bp(e.white(1.2),1800,.8),.35,.05),40);e.mixS(t,e.norm(n,1),.3,.18,-.3),e.mixS(t,sc(e,1.1,18,1800,7e3,.3),.16,.3,.4);for(let n of t)e.drive(n,1.6);return e.norm(t,.95)}function fu(e,t){let n=e.stereo(1.2);return e.mixS(n,Y(e,`hp`,2500,.7,.004)),e.mixS(n,Y(e,`bp`,1300,1.2,.035),.9),e.mixS(n,nc(e,150,70,.02,.04),.5),e.mixS(n,Y(e,`hp`,5e3,.7,.09,.004),.45),e.mixS(n,sc(e,1.1,40,2600,11e3,.16),.8,.02,-.5),e.mixS(n,sc(e,1.1,40,2600,11e3,.2),.8,.05,.5),e.norm(n,.9)}function pu(e,t){let n=e.zeros(.9),r=78+t*9;return e.mix(n,e.modes(.5,[[r,.07,1],[r*2.1,.05,.6],[r*3.4,.03,.3]])),e.mix(n,Y(e,`lp`,2400,.7,.035,.002),.8),e.mix(n,oc(e,Y(e,`hp`,2800,.7,.12,.02),70,.6),.4,.02),e.norm(n,.9)}function mu(e){let t=e.zeros(.52);return e.mix(t,Y(e,`bp`,2600,1.5,.008),.25),e.mix(t,ic(e,783.99,.05),.8),e.mix(t,ic(e,1174.66,.07),.9,.065),e.norm(t,.8)}function hu(e){let t=e.zeros(1.25);e.mix(t,rc(e,1300,.015),.7),e.mix(t,nc(e,180,80,.02,.04),.6);let n=e.osc(.28,`saw`,e=>240+330*(e/.28)**2+12*Math.sin(e*90));return e.bp(n,e=>900+6400*e,4),e.env(n,e=>cc(.28)(e)*(.6+.4*Math.sin(e*190))),e.mix(t,e.norm(n,1),.3,.06),[587.33,739.99,880,1174.66,1479.98].forEach((n,r)=>e.mix(t,ic(e,n,.1+r*.012),.5,.3+r*.07)),e.norm(e.verb(t,{time:.9,mix:.35}),.85)}function gu(e){let t=e.zeros(1);for(let[n,r]of[[392,1],[587.33,.6],[784,.35]])e.mix(t,e.osc(1,`sine`,e=>n*(1+.12*Math.min(1,e/.6)**1.5)),r);e.env(t,cc(1,1.2));for(let n=0;n<7;n++)e.mix(t,ac(e,900+n*260+e.rand(-60,60),6,.02),.25,.12+n*.1+e.rand(-.02,.02));return e.norm(e.verb(t,{time:.8,mix:.3}),.8)}function _u(e){let t=e.zeros(.9);for(let[n,r]of[[0,3900],[.055,4700],[.1,4250]])e.mix(t,e.modes(.1,[[r,.02,1],[r*1.43,.015,.6],[r*2.1,.01,.4]],!0),.5,n);return e.mix(t,e.modes(.7,[[2093,.16,1],[2093*2.76,.09,.4],[8790.6,.05,.2]]),.8,.15),e.mix(t,Y(e,`hp`,4e3,.7,.002),.3,.15),e.norm(t,.8)}function vu(e){let t=e.zeros(1.4),n=(n,r,i)=>{e.mix(t,e.modes(1.2,[[r,.22,1],[r*2.74,.13,.55],[r*5.2,.08,.3],[r*8.1,.04,.15],[r*.5,.16,.2]],!0),i,n),e.mix(t,Y(e,`hp`,5e3,.7,.0015),i*.3,n)};return n(0,1568,1),n(.14,1577.408,.6),n(.24,1563.296,.4),n(.31,1568*1.003,.25),e.norm(e.verb(t,{time:.5,mix:.2}),.8)}function yu(e){let t=e.zeros(1.05);e.mix(t,e.modes(.12,[[4100,.025,1],[6050,.018,.6],[8300,.012,.35]],!0),.6);let n=.06,r=.05;for(let i=0;i<9;i++)e.mix(t,rc(e,2600-i*120,.006,.3),.2+.02*i,n),n+=r,r*=.84;e.mix(t,nc(e,210,120,.01,.025),.7,n+.03),e.mix(t,e.modes(.3,[[1250,.06,1],[2890,.04,.6],[4700,.03,.4]],!0),.6,n+.03);let i=e.lp(e.osc(.3,`saw`,e=>70+520*Math.min(.25,e)),900);return e.mix(t,e.env(i,cc(.3)),.25,n+.12),e.mix(t,rc(e,900,.02),.5,n+.12),e.norm(t,.8)}function bu(e){let t=e.zeros(1.1);e.mix(t,rc(e,1700,.01),.6);let n=e.osc(.42,`saw`,e=>96+6*Math.sin(e*50));e.mix(n,e.osc(.42,`square`,192.5),.4),e.lp(e.filter(n,`peak`,700,2,8),1800),e.env(n,e=>Math.min(1,e/.03)*Math.min(1,(.42-e)/.05)*(.8+.2*Math.sin(e*2*Math.PI*24))),e.mix(t,e.norm(n,1),.35,.05);for(let[n,r,i]of[[.52,1,150],[.68,.55,170],[.78,.3,185]])e.mix(t,nc(e,i,i*.5,.02,.035),r,n),e.mix(t,e.modes(.2,[[820,.03,.6],[1930,.02,.4],[3100,.012,.3]],!0),r*.6,n),e.mix(t,Y(e,`bp`,1200,.8,.012),r*.4,n);return e.norm(t,.85)}function xu(e){let t=e.zeros(.08);return e.mix(t,e.decay(e.sweep(.07,1500,760,.012),.012,8e-4)),e.mix(t,e.modes(.06,[[2280,.008,.3]])),e.mix(t,Y(e,`hp`,5e3,.7,.0012),.25),e.norm(t,.7)}function Su(e){let t=e.zeros(.06);return e.mix(t,e.decay(e.sweep(.05,2300,2e3,.01),.008,.002)),e.mix(t,Y(e,`hp`,6e3,.7,.002,.001),.12),e.norm(t,.5)}function Cu(e){let t=e.zeros(.14);return e.mix(t,e.decay(e.sweep(.07,980,600,.015),.012,8e-4)),e.mix(t,e.decay(e.sweep(.08,720,430,.018),.014,8e-4),.8,.055),e.mix(t,Y(e,`hp`,4500,.7,.0012),.2),e.norm(t,.7)}function wu(e){let t=e.zeros(.42),n=659.26;return e.mix(t,e.modes(.4,[[n,.07,1],[n*2,.045,.5],[n*3,.03,.2],[n*.5,.05,.3]])),e.mix(t,Y(e,`bp`,2500,1.5,.003),.3),e.norm(t,.8)}function Tu(e){let t=1.7,n=e.zeros(t),r=(t,r,i)=>{let a=e.osc(i,`saw`,e=>r*(1-.02*Math.exp(-e/.05)));e.mix(a,e.osc(i,`saw`,r*1.007),.7),e.mix(a,e.osc(i,`square`,r*.5),.5),e.lp(a,e=>500+2600*cc(i)(e),1.4),e.mix(n,e.norm(e.env(a,cc(i,.7)),1),.8,t)};return r(0,220,.6),r(.62,155.56,.95),e.mix(n,e.env(e.osc(t,`sine`,55),cc(t)),.5),e.norm(e.verb(n,{time:1.2,mix:.3}),.85)}function Eu(e){let t=2.8,n=e.stereo(t),r=e=>(.15+.85*Math.min(1,e/1.9)**2)*Math.min(1,e/.08)*Math.min(1,(t-e)/.7),i=e=>(e/t)**2;e.mixS(n,e.env(e.osc(t,`sine`,e=>38+46*i(e)),r),.9),e.mixS(n,e.env(e.lp(e.osc(t,`saw`,e=>76+92*i(e)),700),r),.5);for(let a of n){let n=e.bp(e.pink(t),e=>250+1900*i(e),1.6);e.mix(a,e.env(n,r),4.5);let o=e.hp(e.dust(t,e=>30+500*i(e)),2500);e.mix(a,e.env(o,r),.35)}return e.norm(n,.9)}function Du(e,t){let n=5.2,r=e.stereo(n),i=t===0?[[0,1],[.07,.7],[.19,.5]]:[[0,.8],[.12,1],[.3,.4],[.42,.6]];for(let[t,n]of i)e.mixS(r,Y(e,`hp`,900,.7,.03,.001),n*.8,t,e.rand(-.6,.6)),e.mixS(r,Y(e,`bp`,320,.7,.12,.002),n,t,e.rand(-.4,.4));e.mixS(r,nc(e,60,28,.2,.5,.01),.7,.02);for(let t of r){let r=e.lp(e.brown(n),e=>90+600*Math.exp(-e/.8)),i=e.norm(e.lp(e.white(n),3),1);for(let t=0;t<r.length;t++){let n=t/e.sr;r[t]=r[t]*(.45+.55*Math.abs(i[t]))*Math.min(1,n/.02)*Math.exp(-n/1.5)}e.mix(t,r,5,.03)}return e.norm(r,.95)}function Ou(e){let t=e.zeros(1),n=(n,r,i,a)=>{let o=e.osc(i,`saw`,r);e.mix(o,e.osc(i,`saw`,r*1.008),.8),e.mix(o,e.osc(i,`square`,r*.5),.4),e.lp(o,e=>900+5e3*Math.exp(-e/.08),1.2),e.env(o,e=>Math.min(1,e/.004)*Math.exp(-e/(i*.45))),e.mix(t,e.norm(o,1),a,n)};n(0,587.33,.12,.7),n(.09,739.99,.12,.8),n(.18,880,.12,.9),n(.27,1174.66,.7,1);let r=e.bp(e.white(.34),e=>600+78e3*e*e,2);return e.mix(t,e.env(r,e=>(e/.34)**2),.8),e.mix(t,nc(e,140,50,.03,.08),.8,.27),e.norm(e.verb(t,{time:.9,mix:.3}),.85)}function X(e,t,n,r={}){return{render:e,gain:t,range:n,jitter:.02,bus:`sfx`,priority:1,...r}}var ku={bus:`ui`,priority:4,jitter:0},Au={variants:4,jitter:.07,priority:.6},ju={variants:3,jitter:.06},Mu=[400,4e3],Nu={shot_pistol:X(Ol,.85,[8,110],{priority:2,jitter:.03}),shot_smg:X(kl,.8,[8,100],{priority:2,jitter:.035}),shot_rifle:X(Al,.9,[10,125],{priority:2,jitter:.025}),shot_shotgun:X(jl,.95,[10,120],{priority:2,jitter:.025}),shot_sniper:X(Ml,1,[12,160],{priority:2.5,jitter:.02}),reload:X(Nl,.5,[2,22]),dry_fire:X(Pl,.45,[2,14],{jitter:.04}),equip:X(Fl,.4,[2,14],{jitter:.04}),shell:X(Il,.28,[1.5,14],{variants:3,jitter:.08,priority:.4}),bullet_whiz:X(Ll,.7,[3,30],{variants:3,jitter:.1,priority:1.5}),explosion:X(du,1,[14,260],{priority:3,jitter:.05}),impact_concrete:X(Rl,.55,[3,45],ju),impact_metal:X(zl,.5,[3,50],ju),impact_wood:X(Bl,.55,[3,40],ju),impact_sand:X(Vl,.5,[3,30],ju),impact_water:X(Hl,.42,[3,35],ju),impact_glass:X(Ul,.5,[3,45],{variants:2,jitter:.06}),impact_body:X(Wl,.6,[3,35],ju),headshot:X(Gl,.65,[3,40],{priority:2}),hit_marker:X(Kl,.45,[2,20],ku),kill_confirm:X(ql,.55,[2,20],ku),damage:X(Jl,.6,[2,25],{priority:3,jitter:.04}),shield_break:X(Yl,.65,[4,45],{priority:2}),step_concrete:X(Xl,.38,[2,25],Au),step_sand:X(Zl,.4,[2,22],Au),step_wood:X(Ql,.42,[2,25],Au),step_grass:X($l,.36,[2,22],Au),step_metal:X(eu,.38,[2,28],Au),step_water:X(tu,.42,[2,25],Au),jump:X(nu,.35,[2,20],{jitter:.06,priority:.6}),land:X(ru,.5,[2,28],{jitter:.06}),splash:X(iu,.7,[4,60],{jitter:.05}),swim_stroke:X(au,.4,[2,25],{variants:3,jitter:.07,priority:.6}),parachute_open:X(ou,.75,[6,90],{priority:2}),cloth_flap:X(su,.35,[3,35],{variants:3,jitter:.1,priority:.5}),car_door:X(cu,.6,[3,40],{jitter:.04}),horn:X(lu,.55,[8,140],{jitter:0}),crash:X(uu,.9,[6,110],{priority:2,jitter:.06}),glass_break:X(fu,.65,[4,60],{variants:2,jitter:.06}),boat_slap:X(pu,.6,[4,60],{variants:3,jitter:.08}),pickup:X(mu,.45,[2,18],{jitter:0,priority:2}),chest_open:X(hu,.55,[3,30],{jitter:0,priority:2}),heal:X(gu,.45,[2,18],{jitter:0,priority:2}),cash:X(_u,.45,[2,20],{jitter:.02,priority:2}),door_bell:X(vu,.4,[3,30],{jitter:.015}),jukebox_coin:X(yu,.5,[2,20],{jitter:.02}),vending:X(bu,.55,[3,25],{jitter:.02}),ui_click:X(xu,.4,[2,20],ku),ui_hover:X(Su,.22,[2,20],ku),ui_back:X(Cu,.4,[2,20],ku),countdown:X(wu,.5,[2,20],ku),zone_warn:X(Tu,.55,Mu,ku),zone_shrink:X(Eu,.65,Mu,ku),thunder:X(Du,.9,Mu,{variants:2,jitter:.08,priority:2}),jump_cue:X(Ou,.55,Mu,ku)};Object.keys(Nu);var Pu={...Jc,...Nu,...Dc};function Fu(e,t){let n=2166136261;for(let t=0;t<e.length;t++)n=Math.imul(n^e.charCodeAt(t),16777619);return Math.imul(n^t+1,16777619)>>>0||1}function Iu(e,t,n){let r=t.sr??n,i=[];for(let n=0;n<(t.variants??1);n++){let a=t.render(new tc(r,Fu(e,n)),n),o=Qs(a)?[a[0],a[1]]:[a];for(let e of o){let n=e.length;for(let t=0;t<n;t++)Number.isFinite(e[t])||(e[t]=0);let i=t.loop?0:Math.min(n,Math.round(r*.004));for(let t=0;t<i;t++)e[n-1-t]=e[n-1-t]*(t/i)}i.push({sr:r,channels:o})}return i}var Lu=8e3,Ru=class{ctx;recipes;onRendered;cache=new Map;queue;running=null;worker=null;cancel=null;total;constructor(e,t,n){this.ctx=e,this.recipes=t,this.onRendered=n,this.queue=Object.keys(t),this.total=this.queue.length}get done(){return this.cache.size>=this.total}has(e){return this.cache.has(e)}get(e){let t=this.cache.get(e);return t||(t=this.renderNow(e),this.store(e,t)),t}prioritise(e){let t=e.filter(e=>!this.cache.has(e));if(t.length===0)return;this.queue=[...t,...this.queue.filter(e=>!t.includes(e))];let n={type:`first`,keys:t};this.worker?.postMessage(n,[])}renderAll(){return this.running??=this.inWorker().catch(e=>(console.warn(`[audio] render worker unavailable, rendering on the main thread:`,e),this.onMainThread())),this.running}dispose(){this.queue=[],this.cancel?.(),this.worker?.terminate(),this.worker=null}store(e,t){this.cache.set(e,t),this.queue=this.queue.filter(t=>t!==e)}inWorker(){return new Promise((e,t)=>{if(typeof Worker>`u`){t(Error(`no Worker`));return}let n=new Worker(new URL(new URL(`worker-CcbVXqcE.js`,import.meta.url).href,``+import.meta.url),{type:`module`});this.worker=n;let r,i=()=>{clearTimeout(r),n.terminate(),this.worker=null,this.cancel=null};this.cancel=()=>{i(),e()};let a=e=>{i(),t(e)};r=setTimeout(()=>a(Error(`timed out`)),Lu),n.onerror=e=>a(Error(e.message||`failed to start`)),n.onmessage=n=>{let o=n.data;clearTimeout(r),o.type===`done`?(i(),this.onMainThread().then(e,t)):(r=setTimeout(()=>a(Error(`timed out`)),Lu),o.type===`error`?console.warn(`[audio] worker could not render "${o.key}": ${o.message}`):(this.cache.has(o.key)||this.store(o.key,o.variants.map(e=>this.toBuffer(e))),this.onRendered?.()))};let o={type:`start`,keys:[...this.queue],sampleRate:this.ctx.sampleRate};n.postMessage(o,[])})}async onMainThread(e=5){let t=performance.now();for(;this.queue.length>0;){let n=this.queue[0];this.get(n),this.queue[0]===n&&this.queue.shift(),this.onRendered?.(),performance.now()-t>e&&(await new Promise(e=>setTimeout(e,0)),t=performance.now())}}renderNow(e){let t=this.recipes[e];try{if(!t)throw Error(`no recipe`);return Iu(e,t,this.ctx.sampleRate).map(e=>this.toBuffer(e))}catch(t){return console.warn(`[audio] could not render "${e}":`,t),[this.ctx.createBuffer(1,1,this.ctx.sampleRate)]}}toBuffer(e){let t=this.ctx.createBuffer(e.channels.length,e.channels[0].length,e.sr);return e.channels.forEach((e,n)=>t.copyToChannel(e,n)),t}},zu=40,Bu=.015,Vu=343,Hu=.25,Uu=400,Wu=[`ui_click`,`ui_hover`,`ui_back`],Gu=350,Ku=.5,qu=.85,Ju=[5,70],Yu=.7;function Xu(){let e=4097,t=new Float32Array(e);for(let n=0;n<e;n++){let e=(n/4096*2-1)*2,r=Math.abs(e);t[n]=Math.sign(e)*(r<=.7?r:.7+.3*Math.tanh((r-.7)/.3))}return t}function Zu(e,t,n,r,i=!1){let a=e.value;e.cancelScheduledValues(n),e.setValueAtTime(a,n),i&&a>0&&t>0?e.exponentialRampToValueAtTime(t,n+r):e.linearRampToValueAtTime(t,n+r)}function Qu(e){let t=at(e);return t*t}var $u=class{settings;graph=null;unlocked=!1;failed=!1;rendering=Promise.resolve();unsubscribe;voices=[];played={};started={};juke=null;lastPlay=new Map;lastVariant=new Map;loops=[];track=`none`;trackFade=1.5;muffle=0;lx=0;ly=0;lz=0;rx=1;rz=0;scope=new Float32Array(2048);constructor(e){this.settings=e,this.unsubscribe=e.onChange((e,t)=>{(t===`masterVolume`||t===`sfxVolume`||t===`musicVolume`)&&this.applySettings()})}get running(){return this.graph!==null&&this.graph.ctx.state===`running`}get ready(){let e=this.graph;return e!==null&&e.ctx.state===`running`&&e.bank.done}unlock(){if(this.unlocked=!0,!this.graph&&!this.failed)try{this.graph=this.build(),this.applySettings(),this.setMuffle(this.muffle),this.graph.bank.prioritise(Wu),this.rendering=this.graph.bank.renderAll().catch(e=>console.warn(`[audio] render failed:`,e))}catch(e){this.failed=!0,console.warn(`[audio] unavailable:`,e)}let e=this.graph;if(!e)return Promise.resolve();let t=Promise.resolve();if(e.ctx.state===`suspended`){let n=new Promise(e=>setTimeout(e,Uu));t=Promise.race([e.ctx.resume().catch(()=>void 0),n])}return t.then(()=>this.startPending()),Promise.all([t,this.rendering]).then(()=>this.startPending())}applySettings(){let e=this.graph;if(!e)return;let t=e.ctx.currentTime,n=this.settings.data;Zu(e.master.gain,Qu(n.masterVolume),t,.05),Zu(e.sfx.gain,Qu(n.sfxVolume),t,.05),Zu(e.music.gain,Qu(n.musicVolume),t,.05)}setListener(e,t,n,r,i,a){this.lx=e,this.ly=t,this.lz=n;let o=this.graph;if(!o)return;let s=Math.hypot(r,i,a);s>1e-6||(r=0,i=0,a=-1,s=1),r/=s,i/=s,a/=s;let c=Math.hypot(a,r);c>.001&&(this.rx=-a/c,this.rz=r/c);let l=-this.rz*i,u=this.rz*r-this.rx*a,d=this.rx*i,f=o.ctx.listener;f.positionX?(f.positionX.value=e,f.positionY.value=t,f.positionZ.value=n,f.forwardX.value=r,f.forwardY.value=i,f.forwardZ.value=a,f.upX.value=l,f.upY.value=u,f.upZ.value=d):(f.setPosition(e,t,n),f.setOrientation(r,i,a,l,u,d))}play(e,t={}){if(!this.unlocked)return;this.played[e]=(this.played[e]??0)+1;let n=this.graph,r=Nu[e];if(!n||!r||n.ctx.state!==`running`)return;let i=n.ctx,a=i.currentTime,o=this.lastPlay.get(e);if(o!==void 0&&a-o<Bu)return;let s=r.gain*Math.max(0,t.volume??1),c=0,l=t.position;if(l&&(c=Math.hypot(l.x-this.lx,l.y-this.ly,l.z-this.lz),s*=this.attenuation(c,r.range)),!(s>8e-4))return;if(!n.bank.has(e)){n.bank.prioritise([e]);return}let u=s*r.priority;if(this.voices.length>=zu&&!this.steal(u,a))return;this.lastPlay.set(e,a);let d=n.bank.get(e),f=0;if(d.length>1){let t=this.lastVariant.get(e)??-1;f=t<0?Math.floor(Math.random()*d.length):(t+1+Math.floor(Math.random()*(d.length-1)))%d.length,this.lastVariant.set(e,f)}let p=d[f],m=i.createBufferSource();m.buffer=p;let h=t.jitter??r.jitter,g=Math.max(.05,(t.pitch??1)*(1+(Math.random()*2-1)*h));m.playbackRate.value=g;let _=i.createGain();_.gain.value=s;let v=r.bus===`ui`?n.ui:n.sfxIn,y=m.connect(_),b=[],x=a;if(l){if(c>r.range[0]*2){let e=i.createBiquadFilter();e.type=`lowpass`,e.frequency.value=n.top*Math.exp(-2.2*c/r.range[1]),y=y.connect(e)}let e=this.bleed(i);y.connect(e).connect(v),b.push(e),y=y.connect(this.panner(i,l)),c>20&&(x=a+Math.min(c/Vu,.4))}y.connect(v),b.push(y);let S={name:e,src:m,gain:_,tails:b,weight:u,start:x,end:x+p.duration/g};m.onended=()=>this.dropVoice(S),m.start(x),this.voices.push(S),this.started[e]=(this.started[e]??0)+1}loop(e){let t={name:e,active:!0,gain:0,pitch:1,position:null,voice:null,level:null,panner:null,bleed:null,panned:!1,parked:!1,quietSince:-1,sent:-1};this.loops.push(t),this.attachLoop(t);let n=e=>{e?t.position?(t.position.x=e.x,t.position.y=e.y,t.position.z=e.z):t.position={x:e.x,y:e.y,z:e.z}:t.position=null};return{set:e=>{t.active&&(e.gain!==void 0&&(t.gain=Math.max(0,e.gain)),e.pitch!==void 0&&(t.pitch=e.pitch),e.position!==void 0&&n(e.position),this.syncLoop(t))},steer:(e,r,i)=>{t.active&&(t.gain=Math.max(0,e),t.pitch=r,i!==void 0&&n(i),this.syncLoop(t))},stop:(e=.3)=>this.endLoop(t,e),get active(){return t.active}}}music(e,t=1.5){this.track=e,this.trackFade=t,this.startMusic()}jukebox(e,t,n){let r=this.graph;if(!this.unlocked||!r||r.ctx.state!==`running`)return;if(!Yc.every(e=>r.bank.has(e))){r.bank.prioritise(Yc);return}let i=r.ctx,a=i.currentTime,o=this.juke;if(!o){let e=i.createGain();e.gain.value=0;let n=i.createBiquadFilter();n.type=`lowpass`,n.frequency.value=r.top,n.Q.value=.5;let a=this.panner(i,t),s=this.bleed(i);e.connect(n),n.connect(a).connect(r.sfxIn),n.connect(s).connect(r.sfxIn),o={player:new $c(i,e,r.bank),level:e,tone:n,panner:a,bleed:s,position:{x:0,y:0,z:0},title:``,until:0,heardAt:-1},this.juke=o}o.position.x=t.x,o.position.y=t.y,o.position.z=t.z,this.place(o.panner,o.position),o.title=e,o.until=a+Math.max(1,n),o.player.playTune(e,.4),o.heardAt=-1,this.tuneJukebox(o,a,.02)}stopJukebox(e=1.5){let t=this.juke;t&&t.title!==``&&(t.title=``,t.player.stop(e))}suspend(){let e=this.graph;e&&e.ctx.state===`running`&&e.ctx.suspend().catch(()=>void 0)}setMuffle(e){this.muffle=at(e);let t=this.graph;t&&Zu(t.sfxIn.frequency,t.top*(Gu/t.top)**+this.muffle,t.ctx.currentTime,.25,!0)}stopAll(e=.05){let t=this.graph;if(!t)return;let n=t.ctx.currentTime;for(let t of this.voices)this.silence(t,n,e);this.voices=[]}update(e){let t=this.graph;if(!t||t.ctx.state!==`running`)return;let n=t.ctx.currentTime;this.startMusic(),t.player.update();let r=this.juke;r&&(r.title!==``&&(n>=r.until?this.stopJukebox():this.tuneJukebox(r,n,.08)),r.player.update());for(let e=this.voices.length-1;e>=0;e--){let t=this.voices[e];n>t.end+.3&&this.dropVoice(t)}for(let e of this.loops){if(!e.level||!e.voice){this.attachLoop(e);continue}let t=this.loopLevel(e);this.parkLoop(e,t,n),e.position&&!e.parked&&Math.abs(t-e.sent)>5e-4&&(e.sent=t,e.level.gain.setTargetAtTime(t,n,.05)),e.voice.tick?.(n,t>.01)}}stats(){let e=this.graph,t=0,n=0;if(e&&e.ctx.state===`running`){let r=this.scope;e.analyser.getFloatTimeDomainData(r);let i=0;for(let e=0;e<r.length;e++){let n=r[e];i+=n*n,Math.abs(n)>t&&(t=Math.abs(n))}n=Math.sqrt(i/r.length)}return{state:e?e.ctx.state:this.failed?`unavailable`:`locked`,ready:this.ready,played:{...this.played},started:{...this.started},loops:this.loops.filter(e=>e.active&&e.gain>0).map(e=>e.name),music:this.track,voices:this.voices.length,levels:{master:e?.master.gain.value??0,sfx:e?.sfx.gain.value??0,music:e?.music.gain.value??0},loopLevels:this.loopLevels(),jukebox:this.juke?.title??``,peak:t,rms:n}}dispose(){this.unsubscribe();for(let e of this.loops)this.endLoop(e,0);this.stopAll(0);let e=this.graph;this.graph=null,this.failed=!0,e&&(e.player.dispose(),this.juke?.player.dispose(),this.juke=null,e.bank.dispose(),e.master.disconnect(),e.ctx.close().catch(()=>void 0))}build(){let e=window.AudioContext??window.webkitAudioContext;if(!e)throw Error(`no AudioContext`);let t=new e({latencyHint:`interactive`}),n=t.createGain(),r=t.createDynamicsCompressor();r.threshold.value=-12,r.knee.value=10,r.ratio.value=14,r.attack.value=.003,r.release.value=.12;let i=t.createGain();i.gain.value=.5*qu;let a=t.createWaveShaper();a.curve=Xu(),a.oversample=`2x`;let o=t.createAnalyser();o.fftSize=this.scope.length,o.smoothingTimeConstant=0;let s=t.createGain(),c=t.createGain(),l=t.createGain(),u=Math.min(2e4,t.sampleRate*.45),d=t.createBiquadFilter();d.type=`lowpass`,d.frequency.value=u,d.Q.value=.5,d.connect(s),l.connect(s),s.connect(n),c.connect(n),n.connect(r).connect(i).connect(a).connect(t.destination),a.connect(o);let f=new Ru(t,Pu,()=>this.startPending());return{ctx:t,master:n,sfxIn:d,sfx:s,ui:l,music:c,analyser:o,bank:f,player:new $c(t,c,f),top:u}}startPending(){for(let e of this.loops)e.level?this.syncLoop(e):this.attachLoop(e);this.startMusic()}startMusic(){let e=this.graph;e&&e.ctx.state===`running`&&e.player.current!==this.track&&(this.track!==`none`&&!Yc.every(t=>e.bank.has(t))?e.bank.prioritise(Yc):e.player.play(this.track,this.trackFade))}attenuation(e,t){let[n,r]=t;return e>=r?0:e<=n?1:n/e*(1-I(r*.55,r,e))}panner(e,t){let n=e.createPanner();return n.panningModel=`equalpower`,n.channelCount=1,n.channelCountMode=`explicit`,n.distanceModel=`linear`,n.rolloffFactor=0,this.place(n,t),n}bleed(e){let t=e.createGain();return t.gain.value=Hu,t.channelCount=1,t.channelCountMode=`explicit`,t}place(e,t){e.positionX?(e.positionX.value=t.x,e.positionY.value=t.y,e.positionZ.value=t.z):e.setPosition(t.x,t.y,t.z)}steal(e,t){let n=-1,r=1/0;for(let e=0;e<this.voices.length;e++){let i=this.voices[e],a=at(1-(t-i.start)/Math.max(.01,i.end-i.start)),o=i.weight*(.1+.9*a);o<r&&(r=o,n=e)}return n<0||r>e?!1:(this.silence(this.voices[n],t,.03),this.voices.splice(n,1),!0)}silence(e,t,n){e.gain.gain.cancelScheduledValues(t),e.gain.gain.setTargetAtTime(0,t,Math.max(.001,n/4));try{e.src.stop(t+n+.01)}catch{}}dropVoice(e){for(let t of e.tails)t.disconnect();let t=this.voices.indexOf(e);t>=0&&this.voices.splice(t,1)}tuneJukebox(e,t,n){let r=this.graph;if(!r)return;let i=Math.hypot(e.position.x-this.lx,e.position.y-this.ly,e.position.z-this.lz);Math.abs(i-e.heardAt)<.05||(e.heardAt=i,e.level.gain.setTargetAtTime(Yu*this.attenuation(i,Ju),t,n),e.tone.frequency.setTargetAtTime(Math.max(500,r.top*Math.exp(-3*i/Ju[1])),t,n))}loopLevels(){let e={};for(let t of this.loops){let n=t.level&&!t.parked?t.level.gain.value:0;e[t.name]=Math.max(e[t.name]??0,n)}return e}loopLevel(e){let t=zc[e.name],n=e.gain*t.gain;return e.position&&(n*=this.attenuation(Math.hypot(e.position.x-this.lx,e.position.y-this.ly,e.position.z-this.lz),t.range)),n}attachLoop(e){let t=this.graph;if(!t||!e.active||e.level)return;let n=zc[e.name];n.beds.every(e=>t.bank.has(e))?(e.voice=n.build(t.ctx,t.bank),e.level=t.ctx.createGain(),e.level.gain.value=0,e.voice.out.connect(e.level),e.level.connect(t.sfxIn),this.syncLoop(e)):t.bank.prioritise(n.beds)}syncLoop(e){let t=this.graph;if(!t||!e.level||!e.voice||t.ctx.state!==`running`)return;let n=t.ctx.currentTime,r=e.position!==null;r!==e.panned&&(e.level.disconnect(),r?(e.panner??=this.panner(t.ctx,e.position),e.bleed??=this.bleed(t.ctx),e.level.connect(e.panner).connect(t.sfxIn),e.level.connect(e.bleed).connect(t.sfxIn)):(e.panner?.disconnect(),e.bleed?.disconnect(),e.level.connect(t.sfxIn)),e.panned=r),e.position&&e.panner&&this.place(e.panner,e.position);let i=this.loopLevel(e);this.parkLoop(e,i,n),e.parked||(e.sent=i,e.level.gain.setTargetAtTime(i,n,.05),e.voice.setPitch(e.pitch,n))}parkLoop(e,t,n){e.level&&e.voice&&(t>0?(e.quietSince=-1,e.parked&&(e.voice.out.connect(e.level),e.parked=!1,e.voice.setPitch(e.pitch,n))):e.parked||(e.quietSince<0?e.quietSince=n:n-e.quietSince>Ku&&(e.voice.out.disconnect(),e.parked=!0)))}endLoop(e,t){if(!e.active)return;e.active=!1,this.loops=this.loops.filter(t=>t!==e);let n=this.graph,{level:r,voice:i,panner:a,bleed:o}=e;if(!n||!r||!i)return;let s=n.ctx.currentTime,c=Math.max(.005,t);r.gain.cancelScheduledValues(s),r.gain.setTargetAtTime(0,s,c/4),i.stop(s+c+.05),setTimeout(()=>{r.disconnect(),a?.disconnect(),o?.disconnect()},(c+.2)*1e3)}},ed={chute_open:`parachute_open`,zone_warning:`zone_warn`},td={win:`victory`,lose:`defeat`},nd={asphalt:`step_concrete`,concrete:`step_concrete`,tile:`step_concrete`,glass:`step_concrete`,flesh:`step_concrete`,sand:`step_sand`,grass:`step_grass`,wood:`step_wood`,metal:`step_metal`,water:`step_water`},rd=[`pointerdown`,`mousedown`,`keydown`,`touchend`],id=.05,ad=3,od=4,sd=48,cd=45,ld=2.5,ud=5,dd=3,fd=.3,pd=[0,8,16,26,38,52,70,92,118,150,190],md=8,hd=new Float32Array(md),gd=new Float32Array(md);for(let e=0;e<md;e++)hd[e]=Math.cos(e/md*Math.PI*2),gd[e]=Math.sin(e/md*Math.PI*2);var _d=new f;function vd(e){let t=e.rpm;return typeof t==`number`&&!e.destroyed?t:0}function yd(e){let t=e;if(t.mode!==`dynamic`)return 0;let n=Math.abs(e.speed),r=I(.16,.5,Math.abs(t.slip??0))*I(3,9,n);return e.controls.handbrake&&n>4?Math.max(r,.55):r}var bd=class{loop;gain=0;pitch=1;sentGain=0;sentPitch=1;constructor(e){this.loop=e}move(e,t,n,r,i){this.gain=H(this.gain,e,n,r),e===0&&this.gain<.004&&(this.gain=0),this.pitch=H(this.pitch,t,n*2,r);let a=this.gain===0;a&&this.sentGain===0||!i&&!a&&Math.abs(this.gain-this.sentGain)<.004&&Math.abs(this.pitch-this.sentPitch)<.008||(this.sentGain=this.gain,this.sentPitch=this.pitch,this.loop.steer(this.gain,this.pitch,i))}cut(){this.gain=0,this.sentGain!==0&&(this.sentGain=0,this.loop.steer(0,this.pitch))}},xd=class{game;engine;unlocked=!1;listening=!0;opts={};unknown=new Set;lx=0;ly=0;lz=0;lastTick=0;lastFrame=0;ticks=0;wind;ocean;city;storm;rain;plane;skids;cars;boats;sea=0;muffle=0;thunderIn=8;doorWasOpen=!1;track=`none`;sting=null;stormMusic=!1;outsideFor=0;insideFor=0;jukeLeft=0;jukeAt={x:0,y:0,z:0};hooked=0;strokes=new Uint8Array(64);constructor(e){this.game=e;let t=new $u(e.settings);this.engine=t;let n=e=>new bd(t.loop(e));this.wind=n(`wind`),this.ocean=n(`ocean`),this.city=n(`city`),this.storm=n(`storm`),this.rain=n(`rain`),this.plane=n(`plane_engine`),this.skids=[n(`skid`),n(`skid`)];let r=(e,t)=>{let r=[];for(let i=0;i<t;i++)r.push({bed:n(e),vehicle:null,rest:0});let i=zc[e].range[1]*.95;return{voices:r,reach2:i*i}};this.cars=r(`car_engine`,ud),this.boats=r(`boat_engine`,dd);for(let e of rd)window.addEventListener(e,this.onGesture,{capture:!0,passive:!0});document.addEventListener(`click`,this.onClick,!0),document.addEventListener(`visibilitychange`,this.onVisibility),e.events.on(`phase`,e=>{(e===`match`||e===`menu`)&&(this.sting=null),e===`menu`&&(this.jukeLeft=0,t.stopJukebox(.5)),this.direct()}),e.events.on(`kill`,({victim:t})=>{t===e.player&&e.match.running&&(this.sting=`defeat`),this.direct()}),e.events.on(`jukebox`,e=>{this.jukeAt.x=e.x,this.jukeAt.y=e.y,this.jukeAt.z=e.z,this.jukeLeft=sd,t.jukebox(e.track,this.jukeAt,sd),this.direct()}),e.debugExt.audio=()=>this.snapshot(),this.direct()}play(e,t,n=1){let r=td[e];if(r){this.sting=r,this.direct();return}let i=ed[e]??e;i===`thunder`&&t&&(i=`explosion`);let a=Nu[i];if(!a){this.unknown.has(e)||(this.unknown.add(e),console.warn(`[audio] no sound called "${e}"`));return}if(t){let e=this.away2(t),r=a.range[1];if(e>=r*r)return;let i=this.game.player?.position,o=a.range[0];if(i&&e>o*o){let r=t.x-i.x,a=t.y-i.y,s=t.z-i.z;r*r+a*a+s*s<ld*ld&&(n*=Math.min(Math.sqrt(e)/o,4))}}let o=this.opts;o.position=t,o.volume=n,this.engine.play(i,o)}frame(e){let t=performance.now();if(t-this.lastFrame<ad)return;this.lastFrame=t;let n=this.game.engine.camera,r=n.position;n.getWorldDirection(_d),this.lx=r.x,this.ly=r.y,this.lz=r.z,this.engine.setListener(r.x,r.y,r.z,_d.x,_d.y,_d.z);let i=(t-this.lastTick)/1e3;i>=id&&(this.lastTick=t,this.tick(Math.min(i,.25))),this.engine.update(e)}snapshot(){let e=e=>e.voices.reduce((e,t)=>e+ +!!t.vehicle,0);return{...this.engine.stats(),unlocked:this.unlocked,unknown:[...this.unknown],track:this.track,sting:this.sting,ambience:{wind:this.wind.gain,ocean:this.ocean.gain,city:this.city.gain,storm:this.storm.gain,rain:this.rain.gain,plane:this.plane.gain,sea:this.sea,muffle:this.muffle},engines:{cars:e(this.cars),boats:e(this.boats),skid:Math.max(this.skids[0].gain,this.skids[1].gain)},jukeboxLeft:this.jukeLeft}}dispose(){this.stopListening(),document.removeEventListener(`click`,this.onClick,!0),document.removeEventListener(`visibilitychange`,this.onVisibility),this.engine.dispose()}onGesture=()=>{this.unlocked=!0,this.engine.unlock(),this.engine.running&&this.stopListening()};stopListening(){if(this.listening){this.listening=!1;for(let e of rd)window.removeEventListener(e,this.onGesture,{capture:!0})}}onClick=e=>{let t=e.target;t instanceof Element&&t.closest(`button, input, select, [role="button"]`)&&this.play(`ui_click`)};onVisibility=()=>{this.unlocked&&(document.hidden?this.engine.suspend():this.engine.unlock())};onStep=(e,t,n,r)=>{let i=W(.35+n*.09,.35,1)*(e.motor.crouched?.45:1);this.play(nd[r]??`step_concrete`,e.position,e.isPlayer?i*.85:i)};onLanded=(e,t)=>{this.play(`land`,e.position,W(t/9,.3,1))};onJumped=e=>{this.play(`jump`,e.position,.8)};onSplash=(e,t)=>{this.play(`splash`,e.position,t)};people(){let e=this.game.characters;for(;this.hooked<e.length;this.hooked++){let t=e[this.hooked].events;t.footstep??=this.onStep,t.landed??=this.onLanded,t.jumped??=this.onJumped,t.splash??=this.onSplash}this.strokes.length<e.length&&(this.strokes=new Uint8Array(e.length*2));for(let t=0;t<e.length;t++){let n=e[t],r=+(n.anim.phase>=.5);r!==this.strokes[t]&&(this.strokes[t]=r,n.alive&&n.state===`normal`&&n.motor.swimming&&n.motor.speed>.5&&this.play(`swim_stroke`,n.position,.8))}}tick(e){let t=this.game,n=t.phase===`match`||t.phase===`ended`,r=this.ticks++%od===0;this.unlocked&&this.listening&&this.engine.running&&this.stopListening(),this.jukeLeft>0&&(this.jukeLeft=Math.max(0,this.jukeLeft-e)),this.direct(e),n&&this.people(),this.ambience(e,n,r),this.fleet(this.cars,e,n,r),this.fleet(this.boats,e,n,r),this.slides(e)}direct(e=0){let t=this.game,n=t.phase===`match`||t.phase===`ended`,r=n&&t.zone?t.zone.playerOutside:0;this.outsideFor=r>.5?this.outsideFor+e:0,this.insideFor=r<.1?this.insideFor+e:0,this.outsideFor>2?this.stormMusic=!0:(this.insideFor>4||!n)&&(this.stormMusic=!1);let i,a=2;n?this.sting?(i=this.sting,a=.3):this.jukeLeft>0&&Math.hypot(this.jukeAt.x-this.lx,this.jukeAt.y-this.ly,this.jukeAt.z-this.lz)<cd?(i=`none`,a=1):this.stormMusic?(i=`storm`,a=1.2):i=`match`:i=`menu`,i!==this.track&&(this.track=i,this.engine.music(i,a))}ambience(e,t,n){let r=this.game,i=r.world.field,a=this.lx,o=this.ly,s=this.lz;if(n&&(this.sea=this.probeSea(a,s)),!t){this.ocean.move(.3,1,1.5,e),this.wind.move(.06,.8,1.5,e),this.city.move(0,1,3,e),this.storm.move(0,1,3,e),this.rain.move(0,1,3,e),this.plane.move(0,1,6,e),this.setMuffle(0);return}let c=r.player,l=r.zone,u=Math.max(0,o-Math.max(0,i.heightAt(a,s))),d=l.playerOutside,f=o<r.env.waterHeight(a,s)-.05,p=0;c&&(c.vehicle?p=Math.abs(c.vehicle.speed)*.7:c.state!==`plane`&&(p=c.motor.velocity.length()));let m=at(.08+.45*I(20,300,u)+.9*I(5,55,p)+.5*d);this.wind.move(f?0:m,W(.5+p/28+.8*d,.4,2.8),3,e);let h=I(.02,.75,this.sea)*(1-.85*I(40,300,u));this.ocean.move(h,1,1.6,e);let g=i.typeAt(a,s),_=g===_s.Water||g===_s.Pool?.15:g===_s.Sand||g===_s.Pier?.45:1,v=f?0:_*(1-I(25,180,u))*(1-.7*d);this.city.move(v,1,1.6,e);let y=l.stage===`idle`?0:.3*(1-I(0,140,l.toWall(a,s)));this.storm.move(Math.max(y,d),1+.25*d,2.5,e),this.rain.move(f?0:d*.9,1,2.5,e);let b=r.drop;b.flying?this.plane.move(1,1.05,6,e,b.plane.position):this.plane.move(0,1,6,e);let x=b.flying&&b.doorOpen&&c?.state===`plane`;x&&!this.doorWasOpen&&this.play(`jump_cue`),this.doorWasOpen=x;let S=Math.max(y*1.5,d);S>.15&&(this.thunderIn-=e,this.thunderIn<=0&&(this.thunderIn=6+Math.random()*14,this.play(`thunder`,void 0,(.2+.45*Math.random())*at(S+.3)))),this.setMuffle(f?.9:r.engine.timeScale===0?.75:d*.2)}setMuffle(e){Math.abs(e-this.muffle)<.02||(this.muffle=e,this.engine.setMuffle(e))}probeSea(e,t){let n=this.game.world.field,r=0;for(let i=0;i<md;i++){let a=hd[i],o=gd[i];for(let i=0;i<pd.length;i++){let s=pd[i],c=e+a*s,l=t+o*s;if(!n.isWater(c,l))continue;let u=n.waveAmp(c+a*55,l+o*55)*(1-I(12,190,s));u>r&&(r=u)}}return r}fleet(e,t,n,r){let i=this.game.player?.vehicle??null;for(let r of e.voices){let a=r.vehicle;if(!a){r.rest>0&&(r.rest-=t);continue}let o=vd(a);if(!n||o<.02||this.away2(a.position)>e.reach2){this.release(r);continue}let s=Math.abs(a.controls.throttle),c=a.kind!==`car`,l=c?.6+1.5*o+(a.kind===`jetski`?.35:0):.6+1.7*o+.08*s,u=at(c?.4+.6*o:.42+.33*o+.3*s)*(a===i?1.15:1);r.bed.move(u,l,10,t,a.position)}if(!r||!n)return;let a=e===this.boats;for(let t of this.game.vehicles){if(t.kind!==`car`!==a||vd(t)<.02)continue;let n=this.away2(t.position);if(n>e.reach2)continue;let r=null,i=null,o=0,s=!1;for(let n of e.voices){let e=n.vehicle;if(e===t){s=!0;break}if(!e){n.rest<=0&&(r??=n);continue}let a=this.away2(e.position);a>o&&(o=a,i=n)}s||(r?r.vehicle=t:i&&n<o*.5&&this.release(i))}}release(e){e.bed.cut(),e.vehicle=null,e.rest=fd}slides(e){let t=null,n=0,r=null,i=0;for(let e of this.cars.voices){let a=e.vehicle;if(!a)continue;let o=yd(a);o>n?(r=t,i=n,t=a,n=o):o>i&&(r=a,i=o)}this.skids[0].move(n,t?.8+.4*I(5,30,Math.abs(t.speed)):1,14,e,t?.position),this.skids[1].move(i,r?.8+.4*I(5,30,Math.abs(r.speed)):1,14,e,r?.position)}away2(e){let t=e.x-this.lx,n=e.y-this.ly,r=e.z-this.lz;return t*t+n*n+r*r}},Sd=new f(0,1,0),Cd=new Ot().setFromAxisAngle(Sd,Math.PI),wd=new f,Td=new f,Ed=new f,Dd=new f,Od=new f,kd=new f,Ad=new f,jd=new f,Md=new f,Nd=new Ot,Pd=new Ot,Fd=new Ot,Id=new f,Ld=new f,Rd=1.45,zd=1.75,Bd=.55,Vd=.12,Hd=2.1,Ud=3.3,Wd=class{bank;rig;physics;position=new f;velocity=new f;facing=0;aimYaw=0;aimPitch=0;mode=`ground`;crouched=!1;upperAim=0;holding=!1;lookAt=null;lod=0;seatClip=`Sitting_Idle_Loop`;poseFn=null;armFn=null;poseClip=null;rootOffset=new f;onFootstep=null;bodyOffsetY=0;rootQuat=null;metrics={footError:0,slide:0,travel:0,leanRoll:0,leanPitch:0,twist:0,headError:0,strideRate:0,legWarp:0,plantedL:!1,plantedR:!1,pelvis:0,stretch:0,lockErr:0,strideScale:1,footErrorMax:0};phase=0;exertion=0;base;scratch;scratch2;snapshot;finalBase;fade=1;fadeDur=.2;key=``;idleTime=Math.random()*3;airTime=0;jumped=!1;modeTime=0;crouchW=0;backward=!1;legWarp=0;upperW=0;gripW=0;oneShots=[];upperMask;fingerMask;feet;ikW=0;pelvis=0;visualY=0;placedY=0;hasVisualY=!1;accel=new f;lastVel=new f;leanPitch=0;leanRoll=0;landSpring=new et(0,.12);kickSpring=new et(0,.06);flinchPitch=new et(0,.07);flinchRoll=new et(0,.07);breath=Math.random()*6;lookDir=new f(0,0,-1);hasLook=!1;clips;headFwd;chestFwd;hipsFwd;constructor(e,t,n){this.bank=e,this.rig=t,this.physics=n;let r=e.boneCount;this.base=new ja(r),this.scratch=new ja(r),this.scratch2=new ja(r),this.snapshot=new ja(r),this.finalBase=new ja(r).copy(e.rest),this.upperMask=e.mask([Aa.spine1],{[Aa.spine1]:.2,[Aa.spine2]:.45,[Aa.spine3]:.75,[Aa.neck]:.6,[Aa.head]:.4}),this.fingerMask=e.mask([Aa.handR],{[Aa.handR]:0}),this.clips={};for(let[t,n]of e.clips)this.clips[t]=n;let i=t.b,a=(e,t,n,r)=>({thigh:e,shin:t,foot:n,toe:r,planted:!1,lock:new f,toeLock:new f,lockYaw:0,lockYawFix:0,release:new f,groundY:0,groundTarget:0,groundNormal:new f(0,1,0),pinMoved:!1,hasGround:!1,normal:new f(0,1,0),stepping:0,stepFrom:new f,stepYawFrom:0,last:new f,lastOnToe:!1,hasLast:!1,relX:0,relZ:0,hasRel:!1});this.feet=[a(i.thighL,i.shinL,i.footL,i.toeL),a(i.thighR,i.shinR,i.footR,i.toeR)],e.apply(e.rest,t.bones),t.root.rotation.set(0,0,0),t.root.updateMatrixWorld(!0),this.headFwd=new f(0,0,1).applyQuaternion(i.head.getWorldQuaternion(new Ot).invert()),this.chestFwd=new f(0,0,1).applyQuaternion(i.spine3.getWorldQuaternion(new Ot).invert()),this.hipsFwd=new f(0,0,1).applyQuaternion(i.hips.getWorldQuaternion(new Ot).invert()),i.shinL.getWorldPosition(Od),this.legLength=i.thighL.getWorldPosition(Dd).distanceTo(Od)+i.footL.getWorldPosition(kd).distanceTo(Od)}play(e,t={}){let n=this.clips[e];if(!n)return;let r=t.layer===`full`;this.oneShots=this.oneShots.filter(e=>e.full!==r),this.oneShots.push({clip:n,time:(t.from??0)*n.duration,speed:t.speed??1,full:r,fadeIn:t.fadeIn??.12,fadeOut:t.fadeOut??.18,hold:t.hold??!1,gain:t.weight??1})}stop(e){this.oneShots=this.oneShots.filter(t=>t.full!==(e===`full`))}playing(e){return this.oneShots.some(t=>t.full===(e===`full`))}jump(){this.jumped=!0,this.airTime=0}land(e){this.landSpring.velocity-=W(e*.55,1.5,9);let t=Math.hypot(this.velocity.x,this.velocity.z);e>6.5&&t<2.2&&this.play(`Jump_Land`,{layer:`full`,from:.12,speed:1.5,fadeIn:.05,fadeOut:.3,weight:at((e-4)/8)})}kick(e){this.kickSpring.velocity+=e*3.2}flinch(e,t,n){let r=this.facing,i=e*-Math.sin(r)+t*-Math.cos(r),a=e*Math.cos(r)+t*-Math.sin(r);this.flinchPitch.velocity+=-i*n*5,this.flinchRoll.velocity+=a*n*5}place(){let e=this.rig.root;e.position.set(this.position.x+this.rootOffset.x,e.position.y+(this.position.y-this.placedY),this.position.z+this.rootOffset.z),this.placedY=this.position.y}reset(){this.hasVisualY=!1,this.hasLook=!1,this.fade=1,this.key=``,this.pelvis=0,this.reachDrop=0,this.hasLastPos=!1,this.landSpring.reset(0),this.accel.set(0,0,0),this.lastVel.copy(this.velocity);for(let e of this.feet)e.planted=!1,e.release.set(0,0,0),e.hasGround=!1,e.stepping=0,e.hasLast=!1,e.hasRel=!1}update(e){let t=this.bank,n=this.rig,r=Math.hypot(this.velocity.x,this.velocity.z);this.modeTime+=e;let i=this.mode,a=.2,o=this.base;if(this.mode===`ground`)this.updateWarp(e,r),i=this.backward?`ground-b`:`ground`,this.evalGround(o,e,r),a=.16;else if(this.mode===`air`){this.airTime+=e;let n=this.clips.Jump_Loop;if(t.sample(n,this.airTime,o),this.jumped){let e=this.clips.Jump_Start;t.sample(e,G(.74,1,at(this.airTime/.2))*e.duration,this.scratch),o.blend(this.scratch,1-I(.1,.36,this.airTime))}this.legWarp=H(this.legWarp,0,8,e),a=.14}else if(this.mode===`swim`){let n=this.clips.Swim_Idle_Loop,i=this.clips.Swim_Fwd_Loop;this.idleTime+=e,this.phase=(this.phase+e*(.45+r*.22))%1,t.sample(n,this.idleTime,o),t.sample(i,this.phase*i.duration,this.scratch),o.blend(this.scratch,I(.25,1.5,r)),this.legWarp=H(this.legWarp,0,8,e),a=.35}else if(this.mode===`slide`){let n=this.clips.Slide_Start,r=this.clips.Slide_Loop;t.sample(r,this.modeTime,o),this.modeTime<.3&&(t.sample(n,G(.45,1,this.modeTime/.3)*n.duration,this.scratch),o.blend(this.scratch,1-I(.1,.3,this.modeTime))),this.legWarp=H(this.legWarp,0,12,e),a=.14}else if(this.mode===`seat`){let n=this.clips[this.seatClip]??this.clips.Sitting_Idle_Loop;this.idleTime+=e,t.sample(n,this.idleTime,o),this.legWarp=0,i=`seat-${this.seatClip}`,a=.25}else if(this.mode===`dead`)t.sample(this.clips.Death01,this.modeTime,o),this.legWarp=H(this.legWarp,0,6,e),a=.12;else{let e=this.poseClip?this.clips[this.poseClip]:void 0;e?t.sample(e,this.modeTime,o):o.copy(t.rest),this.legWarp=0,i=`pose-${this.poseClip??``}`,a=.3}if(this.mode!==`air`&&(this.jumped=!1,this.airTime=0),i!==this.key&&(this.key!==``&&(this.snapshot.copy(this.finalBase),this.fade=0,this.fadeDur=a),this.key=i,this.modeTime=0),this.fade<1){this.fade=Math.min(1,this.fade+e/this.fadeDur);let t=this.fade*this.fade*(3-2*this.fade);o.blend(this.snapshot,1-t)}this.finalBase.copy(o);let s=o,c=this.mode===`ground`||this.mode===`air`||this.mode===`seat`?this.upperAim:0;this.upperW=H(this.upperW,c,14,e),this.upperW>.002&&(t.sample(this.clips.Pistol_Aim_Neutral,0,this.scratch),s.blend(this.scratch,this.upperW,this.upperMask)),this.gripW=H(this.gripW,+!!this.holding,16,e),this.gripW>.002&&(t.sample(this.clips.Pistol_Idle_Loop,0,this.scratch),s.blend(this.scratch,this.gripW,this.fingerMask));for(let n=this.oneShots.length-1;n>=0;n--){let r=this.oneShots[n];r.time+=e*r.speed;let i=r.clip.duration;if(r.time>=i&&!r.hold&&!r.clip.loop){this.oneShots.splice(n,1);continue}let a=at(r.time/Math.max(.001,r.fadeIn));!r.hold&&!r.clip.loop&&(a=Math.min(a,at((i-r.time)/Math.max(.001,r.fadeOut)))),a=a*a*(3-2*a)*r.gain,t.sample(r.clip,r.time,this.scratch),r.full?s.blend(this.scratch,a):s.blend(this.scratch,a,this.upperMask)}t.apply(s,n.bones);let l=this.mode===`ground`;!this.hasVisualY||!l?(this.visualY=this.position.y,this.hasVisualY=!0):(this.visualY=H(this.visualY,this.position.y,16,e),this.visualY=W(this.visualY,this.position.y-.5,this.position.y+.5)),this.updateLean(e,r,l);let u=this.landSpring.update(0,e);n.root.position.set(this.position.x+this.rootOffset.x,this.visualY+this.bodyOffsetY+this.rootOffset.y,this.position.z+this.rootOffset.z),this.placedY=this.position.y,this.rootQuat&&(this.mode===`seat`||this.mode===`pose`)?n.root.quaternion.copy(this.rootQuat).multiply(Cd):n.root.rotation.set(this.leanPitch,this.facing+Math.PI+this.legWarp,this.leanRoll,`YXZ`),this.mode===`pose`&&this.poseFn&&(n.root.updateMatrixWorld(!0),this.poseFn(n,e));let d=G(0,At(this.facing,this.aimYaw),this.upperW),f=W(d-this.legWarp,-1.9,1.9);this.metrics.twist=f,this.metrics.legWarp=this.legWarp;let p=n.b;if(this.mode!==`dead`&&this.mode!==`pose`){Math.abs(f)>1e-4&&(_o(p.hips,Sd,f*.08),_o(p.spine1,Sd,f*.24),_o(p.spine2,Sd,f*.3),_o(p.spine3,Sd,f*.38)),this.breath+=e*(1.5+this.exertion*3.4);let t=Math.sin(this.breath)*(.008+this.exertion*.022),n=this.kickSpring.update(0,e),r=this.flinchPitch.update(0,e),i=this.flinchRoll.update(0,e),a=this.facing+this.legWarp+f;Id.set(Math.cos(a),0,-Math.sin(a)),Ld.set(-Math.sin(a),0,-Math.cos(a));let o=this.aimPitch*this.upperW;_o(p.spine2,Id,o*.22+t+r*.5),_o(p.spine3,Id,o*.3-t*.4+n*.35+r*.5),Math.abs(i)>1e-4&&_o(p.spine2,Ld,i)}this.armFn&&this.mode!==`dead`&&this.mode!==`pose`&&this.armFn(n,this.upperW,e);let m=l&&this.lod===0&&!this.playing(`full`)?1:0;this.ikW=H(this.ikW,m,m?14:22,e);let h=u;if(this.ikW>.01)this.solveLegs(e,r,h);else{this.pelvis=H(this.pelvis,0,12,e),go(p.hips,0,h*.6,0),this.metrics.pelvis=h*.6;for(let e of this.feet)e.planted=!1,e.hasLast=!1,e.hasRel=!1,e.hasGround=!1,e.stepping=0;this.hasLastPos=!1,this.metrics.plantedL=!1,this.metrics.plantedR=!1}this.lod===0&&this.mode!==`dead`&&this.solveHead(e),this.exertion=at(this.exertion+(r>5.6&&l?e*.09:-e*.06))}updateWarp(e,t){let n=0;if(t>.35){let e=Qt(this.velocity.x,this.velocity.z),t=At(this.facing,e),r=this.backward?1.45:1.85,i=Math.abs(t)>r;i!==this.backward&&(this.backward=i,this.legWarp=i?At(Math.PI,t):t),n=this.backward?At(Math.PI,t):t,n=W(n,-1.4,1.4)}else t<.15&&(this.backward=!1);this.legWarp=H(this.legWarp,n,11,e)}evalGround(e,t,n){let r=this.bank,i=this.clips;this.crouchW=H(this.crouchW,+!!this.crouched,11,t),this.idleTime+=t;let a=this.backward?-1:1,o=n,s=this.crouchW,c=i.Walk_Loop,l=i.Jog_Fwd_Loop,u=i.Sprint_Loop,d=i.Crouch_Idle_Loop,f=i.Crouch_Fwd_Loop,p=I(Hd,Ud,o),m=at((o-l.speed)/(u.speed-l.speed)),h=1-p,g=p*(1-m),_=p*m,v=at(o/Bd),y=G(h*c.stride+g*l.stride+_*u.stride,f.stride,s),b=G(h/c.duration+g/l.duration+_/u.duration,1/f.duration,s),x=0,S=1;o>.05&&(S=W(Math.sqrt(o/(y*b)),.62,1.3),x=W(o/(y*S),b*.5,b*G(Rd,zd,s)),S=W(o/(x*y*v),.5,1.75)),this.strideScale=S,this.metrics.strideRate=x,this.metrics.strideScale=S,this.phase=(this.phase+x*t*a+1)%1;let C=this.phase;if(s<.999){let t=0,n=(n,i)=>{i<=.001||(r.sample(n,C*n.duration,this.scratch),t+=i,t===i?e.copy(this.scratch):e.blend(this.scratch,i/t))};n(c,h),n(l,g),n(u,_),v<.999&&(r.sample(i.Idle_Loop,this.idleTime,this.scratch),e.blend(this.scratch,1-v))}if(s>.001){let t=s<.999?this.scratch2:e;r.sample(d,this.idleTime,t),v>.001&&(r.sample(f,C*f.duration,this.scratch),t.blend(this.scratch,v)),t!==e&&e.blend(t,s)}}strideScale=1;reachDrop=0;lastPos=new f;hasLastPos=!1;legLength=.83;updateLean(e,t,n){if(e>0){wd.subVectors(this.velocity,this.lastVel).multiplyScalar(1/e),wd.y=0,wd.lengthSq()>3600&&wd.setLength(60);let t=1-Math.exp(-7*e);this.accel.lerp(wd,t),this.lastVel.copy(this.velocity)}let r=this.facing,i=this.accel.x*-Math.sin(r)+this.accel.z*-Math.cos(r),a=this.accel.x*Math.cos(r)+this.accel.z*-Math.sin(r),o=0,s=0;n?(o=W(i*.011,-.1,.13)+at((t-4.5)/3)*.035,s=W(a*.015,-.17,.17)):this.mode===`swim`&&(o=at(t/2.2)*.1),this.leanPitch=H(this.leanPitch,o,9,e),this.leanRoll=H(this.leanRoll,s,9,e),this.metrics.leanPitch=this.leanPitch,this.metrics.leanRoll=this.leanRoll}solveLegs(e,t,n){let r=this.rig,i=r.b,a=r.root.position.y;r.root.updateMatrixWorld(!0);let o=t>.5,s=0,c=0;t>.2&&(s=this.velocity.x/t,c=this.velocity.z/t);let l=[Gd,Kd],u=[qd,Jd],d=[0,0],f=[0,0],p=[!1,!1],m=0,h=[this.feet[1].stepping>0,this.feet[0].stepping>0];for(let n=0;n<2;n++){let r=this.feet[n];r.foot.getWorldPosition(kd),r.toe.getWorldPosition(Ad),r.foot.getWorldQuaternion(u[n]);let i=kd.y-a,g=Ad.y-a,_=Math.atan2(Ad.x-kd.x,Ad.z-kd.z),v=l[n].copy(kd);if(this.strideScale!==1&&t>.2){let e=(v.x-this.position.x)*s+(v.z-this.position.z)*c;v.x+=s*e*(this.strideScale-1),v.z+=c*e*(this.strideScale-1)}let y=v.x,b=v.z,x,S=y-this.position.x,C=b-this.position.z,w=0;r.hasRel&&e>0&&(w=-((S-r.relX)*s+(C-r.relZ)*c)/e),r.relX=S,r.relZ=C,r.hasRel=!0,x=t<.35?r.planted?!(g>.09&&i>.17):g<.06||i<.135:r.planted?w>t*.22&&!(g>.075&&i>.16):w>t*.55&&(g<.05||i<.13);let T=!1;x&&!r.planted?(T=!0,r.planted=!0,r.lock.set(v.x+r.release.x,0,v.z+r.release.z),r.toeLock.set(r.lock.x+Ad.x-kd.x,0,r.lock.z+Ad.z-kd.z),r.lockYaw=_,r.release.set(0,0,0),r.stepping=0,o&&this.onFootstep&&this.onFootstep(n,t)):!x&&r.planted&&(r.planted=!1,r.release.set(r.lock.x-v.x,0,r.lock.z-v.z),r.stepping=0);let E=0,D=0;if(r.planted){let t=At(_,r.lockYaw);D=W(t,-1,1);let a=Math.cos(D),s=Math.sin(D),c=Ad.x-kd.x,l=Ad.z-kd.z,u=c*a+l*s,d=l*a-c*s;p[n]=i>.125&&g<.06&&r.stepping===0,p[n]&&r.lock.set(r.toeLock.x-u,0,r.toeLock.z-d);let f=r.lock.x-y,m=r.lock.z-b,x=Math.hypot(f,m);if(x>this.metrics.lockErr&&(this.metrics.lockErr=x),r.stepping>0){r.stepping=Math.min(1,r.stepping+e/.24);let t=r.stepping*r.stepping*(3-2*r.stepping);r.lock.set(G(r.stepFrom.x,y,t),0,G(r.stepFrom.z,b,t)),r.lockYaw=r.stepYawFrom+At(r.stepYawFrom,_)*t,E=Math.sin(Math.PI*r.stepping)*.07,r.stepping>=1&&(r.stepping=0,this.onFootstep&&this.onFootstep(n,.6))}else if(!o&&(x>.15||Math.abs(t)>.55)&&!h[n])r.stepping=.001,r.stepFrom.copy(r.lock),r.stepYawFrom=r.lockYaw,h[1-n]=!0;else if(x>.3){let e=.3/x;r.lock.set(y+f*e,0,b+m*e),r.pinMoved=!0}r.stepping>0&&(D=W(At(_,r.lockYaw),-1,1)),r.toeLock.set(r.lock.x+u,0,r.lock.z+d),v.x=r.lock.x,v.z=r.lock.z}else{let t=Math.exp(-14*e);r.release.multiplyScalar(t),v.x+=r.release.x,v.z+=r.release.z}let O=r.planted?r.toeLock.x:v.x+Ad.x-kd.x,k=r.planted?r.toeLock.z:v.z+Ad.z-kd.z,A=r.planted&&!T&&r.hasGround&&r.stepping===0&&!r.pinMoved;if(r.pinMoved=!1,A)r.normal.lerp(r.groundNormal,1-Math.exp(-14*e)).normalize();else{let t=a,n=this.physics.raycast(v.x,a+.75,v.z,0,-1,0,1.5,Ut.querySolid);n?(t=n.point.y,r.groundNormal.copy(n.normal)):r.groundNormal.copy(Sd);let i=this.physics.raycast(O,a+.75,k,0,-1,0,1.5,Ut.querySolid);i&&(!n||i.point.y>t)&&(i.point.y>t+.05&&r.groundNormal.copy(Sd),t=i.point.y),t=W(t,a-.55,a+.6),r.normal.lerp(r.groundNormal,1-Math.exp(-14*e)).normalize(),r.groundTarget=t,(!r.hasGround||T)&&(r.groundY=t),r.hasGround=!0}r.groundY!==r.groundTarget&&(r.groundY=H(r.groundY,r.groundTarget,r.planted?45:22,e)),f[n]=r.groundTarget;let j=1-I(.16,.42,i),ee=(r.groundY-a)*j;d[n]=i,v.y=a+i+ee+E,ee<m&&(m=ee),r.lockYawFix=D}this.pelvis=H(this.pelvis,W(m,-.5,0),12,e);let g=(this.pelvis+n)*this.ikW;go(i.hips,0,g,0);let _=0,v=this.legLength*.994;for(let e=0;e<2;e++){let t=this.feet[e],n=t.planted?1:1-I(.13,.24,d[e]);if(n<=0)continue;let r=l[e];t.thigh.getWorldPosition(Dd);let i=(r.x-Dd.x)**2+(r.z-Dd.z)**2,a=Dd.y-r.y;if(i+a*a<=v*v)continue;let o=(a-Math.sqrt(Math.max(0,v*v-i)))*n;if(t.planted||(o=Math.min(o,Vd)),o>Vd){let e=Math.sqrt(i),n=Math.max(.05,a-Vd),s=Math.sqrt(Math.max(0,v*v-n*n));if(e>1e-4&&s<e){let n=s/e;r.x=Dd.x+(r.x-Dd.x)*n,r.z=Dd.z+(r.z-Dd.z)*n,t.toeLock.x+=r.x-t.lock.x,t.toeLock.z+=r.z-t.lock.z,t.lock.x=r.x,t.lock.z=r.z,t.pinMoved=!0}o=Vd}o>_&&(_=o)}this.reachDrop=H(this.reachDrop,_,_>this.reachDrop?150:9,e),this.reachDrop>1e-4&&(go(i.hips,0,-this.reachDrop*this.ikW,0),g-=this.reachDrop*this.ikW),this.metrics.pelvis=g;let y=0;for(let e=0;e<2;e++){let n=this.feet[e],r=l[e];n.thigh.getWorldPosition(Dd),n.shin.getWorldPosition(Od),Md.subVectors(Od,Dd),jd.copy(r);let i=yo(n.thigh,n.shin,n.foot,jd,Md,this.ikW);i>this.metrics.stretch&&(this.metrics.stretch=i),Nd.copy(u[e]),n.planted&&Math.abs(n.lockYawFix)>.001&&Nd.premultiply(Pd.setFromAxisAngle(Sd,n.lockYawFix*this.ikW));let a=1-I(.14,.3,d[e]);if(a>.01&&n.normal.y<.9995&&(Fd.setFromUnitVectors(Sd,n.normal),Pd.identity().slerp(Fd,a*this.ikW),Nd.premultiply(Pd)),vo(n.foot,Nd),n.foot.getWorldPosition(Ed),n.planted&&n.stepping===0){let r=Math.abs(Ed.y-d[e]-f[e]);r>y&&(y=r);let i=p[e];i&&n.toe.getWorldPosition(Ed),n.hasLast&&i===n.lastOnToe&&t>.5&&(this.metrics.slide+=Math.hypot(Ed.x-n.last.x,Ed.z-n.last.z)),n.last.copy(Ed),n.lastOnToe=i,n.hasLast=!0}else n.hasLast=!1}this.hasLastPos&&t>.5&&(this.metrics.travel+=Math.hypot(this.position.x-this.lastPos.x,this.position.z-this.lastPos.z)),this.lastPos.copy(this.position),this.hasLastPos=!0,this.metrics.footError=y,y>this.metrics.footErrorMax&&(this.metrics.footErrorMax=y),this.metrics.plantedL=this.feet[0].planted,this.metrics.plantedR=this.feet[1].planted}solveHead(e){let t=this.rig.b;if(t.head.getWorldPosition(wd),this.lookAt)Td.subVectors(this.lookAt,wd),Td.lengthSq()<.04&&Td.set(-Math.sin(this.aimYaw),0,-Math.cos(this.aimYaw)),Td.normalize();else{let e=Math.cos(this.aimPitch);Td.set(-Math.sin(this.aimYaw)*e,Math.sin(this.aimPitch),-Math.cos(this.aimYaw)*e)}let n=this.facing+this.legWarp+this.metrics.twist,r=Math.atan2(-Td.x,-Td.z),i=Math.asin(W(Td.y,-1,1)),a=W(At(n,r),-1.25,1.25),o=W(i,-.75,.8),s=n+a,c=Math.cos(o);Td.set(-Math.sin(s)*c,Math.sin(o),-Math.cos(s)*c),this.hasLook?this.lookDir.lerp(Td,1-Math.exp(-11*e)).normalize():(this.lookDir.copy(Td),this.hasLook=!0);let l=this.mode===`pose`||this.mode===`swim`?.35:this.playing(`full`)?.3:1;t.head.getWorldQuaternion(Nd),Ed.copy(this.headFwd).applyQuaternion(Nd),bo(t.neck,Ed,this.lookDir,.35*l,1),t.head.getWorldQuaternion(Nd),Ed.copy(this.headFwd).applyQuaternion(Nd),bo(t.head,Ed,this.lookDir,l,1.3),t.head.getWorldQuaternion(Nd),Ed.copy(this.headFwd).applyQuaternion(Nd),this.metrics.headError=Math.acos(W(Ed.dot(this.lookDir),-1,1))}partFacing(e,t){let n=this.rig.b,r=e===`head`?n.head:e===`chest`?n.spine3:n.hips,i=e===`head`?this.headFwd:e===`chest`?this.chestFwd:this.hipsFwd;return t.copy(i).applyQuaternion(r.getWorldQuaternion(Nd))}resetMetrics(){let e=this.metrics;e.slide=0,e.travel=0,e.lockErr=0,e.stretch=0,e.footErrorMax=0}footPosition(e,t){return this.feet[e].foot.getWorldPosition(t)}},Gd=new f,Kd=new f,qd=new Ot,Jd=new Ot,Yd={walk:1.55,run:4.7,sprint:6.9,crouch:1.5,swim:2.2,swimFast:3.3,jumpSpeed:7.4,radius:.3,standHalf:.59,crouchHalf:.3,swimDepth:1.32,slideStart:8.4},Xd=null,Zd=null;function Qd(e){if(!Xd||Zd!==e){let t=e.world.createCharacterController(.03);t.setUp({x:0,y:1,z:0}),t.setSlideEnabled(!0),t.setMaxSlopeClimbAngle(52*Math.PI/180),t.setMinSlopeSlideAngle(56*Math.PI/180),t.enableAutostep(.46,.12,!1),t.enableSnapToGround(.34),t.setApplyImpulsesToDynamicBodies(!0),t.setCharacterMass(75),Xd=t,Zd=e}return Xd}var $d={x:0,y:0,z:0},ef={x:0,y:0,z:0},tf={x:0,y:0,z:0},nf=class{physics;position=new f;prevPosition=new f;velocity=new f;groundNormal=new f(0,1,0);mode=`air`;grounded=!1;crouched=!1;surface=`concrete`;waterDepth=-10;waterY=0;airTime=0;landed=0;jumped=!1;slideTime=0;speed=0;speedScale=1;glide=null;body;collider;coyote=0;jumpBuffer=0;enabled=!0;half=Yd.standHalf;slideDir=new f;constructor(e,t,n,r,i){this.physics=e,this.position.set(n,r,i),this.prevPosition.copy(this.position);let a=ln.RigidBodyDesc.kinematicPositionBased().setTranslation(n,r+this.half+Yd.radius,i);this.body=e.world.createRigidBody(a);let o=ln.ColliderDesc.capsule(this.half,Yd.radius).setCollisionGroups(Ut.character).setFriction(0);this.collider=e.world.createCollider(o,this.body),e.setOwner(this.collider,t)}get height(){return(this.half+Yd.radius)*2}get swimming(){return this.mode===`swim`}setEnabled(e,t=!1){this.collider.setEnabled(e||t),this.enabled!==e&&(this.enabled=e,e?this.mode=`air`:(this.mode=`off`,this.grounded=!1,this.setCrouched(!1)))}get isEnabled(){return this.enabled}teleport(e,t,n){this.position.set(e,t,n),this.prevPosition.copy(this.position),this.velocity.set(0,0,0),tf.x=e,tf.y=t+this.half+Yd.radius,tf.z=n,this.body.setTranslation(tf,!0),this.body.setNextKinematicTranslation(tf),this.physics.world.propagateModifiedBodyPositionsToColliders(),this.airTime=0,this.enabled&&(this.mode=`air`,this.grounded=!1)}place(e,t,n){this.prevPosition.copy(this.position),this.position.set(e,t,n),tf.x=e,tf.y=t+this.half+Yd.radius,tf.z=n,this.body.setNextKinematicTranslation(tf)}setCrouched(e){if(e!==this.crouched){if(!e){let e=this.position.y+(Yd.crouchHalf+Yd.radius)*2,t=(Yd.standHalf-Yd.crouchHalf)*2+.05;if(this.physics.raycast(this.position.x,e-.05,this.position.z,0,1,0,t,Ut.querySolid))return}this.crouched=e,this.half=e?Yd.crouchHalf:Yd.standHalf,this.collider.setHalfHeight(this.half),this.body.setTranslation({x:this.position.x,y:this.position.y+this.half+Yd.radius,z:this.position.z},!0)}}step(e,t,n){if(this.landed=0,this.jumped=!1,this.prevPosition.copy(this.position),!this.enabled)return;let r=this.position,i=this.velocity;this.waterY=n(r.x,r.z),this.waterDepth=this.waterY-r.y;let a=t.moveX,o=t.moveZ,s=Math.hypot(a,o);s>1&&(a/=s,o/=s);let c=s>.05;if(this.mode!==`swim`&&this.waterDepth>Yd.swimDepth)this.mode=`swim`,this.setCrouched(!1),i.y*=.3;else if(this.mode===`swim`){let e=this.physics.groundHeight(r.x,r.y+1.2,r.z,4,-100);(this.waterY-e<Yd.swimDepth-.14||this.waterDepth<-.5)&&(this.mode=`air`)}if(this.jumpBuffer=t.jump?.13:Math.max(0,this.jumpBuffer-e),this.coyote=this.grounded?.11:Math.max(0,this.coyote-e),this.mode===`swim`){let n=(t.sprint?Yd.swimFast:Yd.swim)*this.speedScale,s=9*e;i.x=Ue(i.x,a*n,s),i.z=Ue(i.z,o*n,s);let c=Math.hypot(i.x,i.z),l=1.4-.32*at(c/Yd.swim),u=this.waterY-l;i.y=W((u-r.y)*7,-3.2,2.6),this.jumpBuffer>0&&r.y>u-.2&&(i.y=5.2,this.jumpBuffer=0)}else{if(this.mode===`slide`){this.slideTime+=e;let n=-(this.groundNormal.x*this.slideDir.x+this.groundNormal.z*this.slideDir.z),r=Math.max(0,Math.hypot(i.x,i.z)-(5.2-n*16)*e);i.x=this.slideDir.x*r,i.z=this.slideDir.z*r,(r<2.6||this.slideTime>1.15||!this.grounded||!t.crouch)&&(this.mode=this.grounded?`ground`:`air`,this.setCrouched(t.crouch))}else if(this.grounded){let e=Math.hypot(i.x,i.z);if(t.crouch&&!this.crouched&&t.sprint&&e>Yd.run+.8&&this.waterDepth<.3){this.mode=`slide`,this.slideTime=0,this.slideDir.set(i.x/e,0,i.z/e),this.setCrouched(!0);let t=Math.max(e,Yd.slideStart);i.x=this.slideDir.x*t,i.z=this.slideDir.z*t}else this.setCrouched(t.crouch)}if(this.mode!==`slide`){let n=this.crouched?Yd.crouch:t.walk?Yd.walk:t.sprint?Yd.sprint:Yd.run;n*=1-.5*at((this.waterDepth-.25)/1),n*=this.speedScale;let r=a*n,s=o*n;if(this.grounded){let t=i.x*r+i.z*s,n=(c?t<0?44:30:36)*e,a=r-i.x,o=s-i.z,l=Math.hypot(a,o);l<=n||l<1e-6?(i.x=r,i.z=s):(i.x+=a/l*n,i.z+=o/l*n)}else if(this.glide){let t=this.glide,n=a*t.speed-i.x,r=o*t.speed-i.z,s=Math.hypot(n,r),l=t.accel*(c?1:.3)*e;s<=l||s<1e-6?(i.x=a*t.speed,i.z=o*t.speed):(i.x+=n/s*l,i.z+=r/s*l)}else if(c){let t=9*e;i.x=Ue(i.x,r,t),i.z=Ue(i.z,s,t)}}this.jumpBuffer>0&&this.coyote>0&&this.waterDepth<.9&&(this.crouched&&this.setCrouched(!1),this.crouched||(i.y=Yd.jumpSpeed,this.jumpBuffer=0,this.coyote=0,this.grounded=!1,this.jumped=!0,this.mode=`air`)),i.y=this.grounded&&i.y<=0?-.6:this.glide?Ue(i.y,-this.glide.sink,this.glide.pull*e):Math.max(-58,i.y-24*e),this.waterDepth>.6&&i.y<-4&&(i.y+=(-4-i.y)*Math.min(1,9*e))}let l=Qd(this.physics);this.mode===`swim`||i.y>.5?l.disableSnapToGround():l.enableSnapToGround(.34),$d.x=i.x*e,$d.y=i.y*e,$d.z=i.z*e,l.computeColliderMovement(this.collider,$d,ln.QueryFilterFlags.EXCLUDE_SENSORS,Ut.querySolid);let u=l.computedMovement(),d=this.grounded,f=-i.y,p=l.computedGrounded(),m=Math.hypot($d.x,$d.z);if(d&&$d.y<0&&m>1e-4&&Math.hypot(u.x,u.z)<m*.6){ef.x=u.x,ef.y=u.y,ef.z=u.z,$d.y=0,l.computeColliderMovement(this.collider,$d,ln.QueryFilterFlags.EXCLUDE_SENSORS,Ut.querySolid);let t=l.computedMovement();Math.hypot(t.x,t.z)>Math.hypot(ef.x,ef.z)+m*.2?(u=t,p=!0):u=ef,$d.y=i.y*e}if(this.grounded=this.mode!==`swim`&&p&&i.y<=.5,e>0){let t=u.x/e,n=u.z/e;!(d&&u.y>.03)&&(Math.abs(t)<Math.abs(i.x)-.5||Math.abs(n)<Math.abs(i.z)-.5)&&(i.x=t,i.z=n),i.y>0&&u.y<$d.y*.5&&(i.y=0)}if(r.x+=u.x,r.y+=u.y,r.z+=u.z,r.x=W(r.x,-V.bound,V.bound),r.z=W(r.z,-V.bound,V.bound),r.y<-30&&(r.y=5),this.grounded){!d&&this.airTime>.12&&(this.landed=Math.max(.01,f)),this.airTime=0,this.mode===`air`&&(this.mode=`ground`);let e=this.physics.raycast(r.x,r.y+.4,r.z,0,-1,0,.9,Ut.querySolid);e?(this.groundNormal.copy(e.normal),this.surface=e.owner?.surface??`concrete`):this.groundNormal.set(0,1,0)}else this.mode===`swim`?this.airTime=0:(this.airTime+=e,(this.mode===`ground`||this.mode===`slide`)&&(this.mode===`slide`&&this.setCrouched(!1),this.mode=`air`));this.speed=Math.hypot(i.x,i.z),tf.x=r.x,tf.y=r.y+this.half+Yd.radius,tf.z=r.z,this.body.setNextKinematicTranslation(tf)}dispose(){this.physics.removeBody(this.body)}},rf=class{counts={};count(e){return this.counts[e]??0}has(e){return this.count(e)>0}add(e,t=$a[e].stack){let n=this.count(e),r=Math.max(0,Math.min(t,$a[e].max-n));return r>0&&(this.counts[e]=n+r),r}remove(e,t=1){let n=this.count(e),r=Math.min(n,t);return r>0&&(this.counts[e]=n-r),r}clear(){for(let e of Object.keys(this.counts))delete this.counts[e]}},af=new f,of=new f(0,1,0),sf=class{id;name;isPlayer;rig;motor;anim;input={moveX:0,moveZ:0,sprint:!1,walk:!1,crouch:!1,jump:!1};facing=0;aimYaw=0;aimPitch=0;aimPoint=new f;strafe=!0;state=`normal`;health=100;maxHealth=100;armor=0;maxArmor=100;cash=0;inventory=new rf;loadout=new To;act=Eo();aiming=0;lastHurtBy=null;kills=0;alive=!0;vehicle=null;seat=-1;seatQuat=new Ot;sinceHurt=99;sinceHurtBy=99;events={};poseEvery=1;poseWait=0;poseDt=0;visual=new f;riseTo=new f;turning=!1;wasSwimming=!1;constructor(e,t,n,r,i,a,o,s,c,l,u){this.id=e,this.name=t,this.isPlayer=n,this.rig=new Qa(r,i,s),this.rig.root.name=`character-${e}`,o.add(this.rig.root),this.motor=new nf(a,{kind:`character`,surface:`flesh`,ref:this},c,l,u),this.anim=new Wd(i,this.rig,a),this.anim.onFootstep=(e,t)=>this.events.footstep?.(this,e,t,this.motor.waterDepth>.08?`water`:this.motor.surface),this.visual.set(c,l,u)}get position(){return this.motor.position}get eyeHeight(){return this.motor.swimming?1.25:this.motor.crouched?1.05:1.62}headPosition(e){return this.rig.b.head.getWorldPosition(e).add(af.set(0,.1,0))}chestPosition(e){return this.rig.b.spine3.getWorldPosition(e)}sitIn(e,t,n){this.vehicle=e,this.seat=t,this.state=`seated`,this.motor.setEnabled(!1,!0),this.motor.velocity.set(0,0,0),this.anim.seatClip=n,this.anim.rootQuat=this.seatQuat,this.input.moveX=0,this.input.moveZ=0}standUp(e,t,n,r){this.vehicle=null,this.seat=-1,this.state=`normal`,this.anim.rootQuat=null,this.motor.setEnabled(!0),this.teleport(e,t,n,r)}sitAt(e,t,n,r,i=`Sitting_Idle_Loop`){return this.state!==`normal`||!this.alive?!1:(this.riseTo.copy(this.motor.position),this.state=`seated`,this.motor.setEnabled(!1,!0),this.motor.velocity.set(0,0,0),this.motor.place(e,t,n),this.visual.set(e,t,n),this.facing=r,this.aimYaw=r,this.seatQuat.setFromAxisAngle(of,r),this.anim.seatClip=i,this.anim.rootQuat=this.seatQuat,this.input.moveX=0,this.input.moveZ=0,!0)}rise(){this.state!==`seated`||this.vehicle||this.standUp(this.riseTo.x,this.riseTo.y,this.riseTo.z,this.facing)}heal(e){let t=this.health;return this.health=Math.min(this.maxHealth,this.health+e),this.health-t}addArmor(e){let t=this.armor;return this.armor=Math.min(this.maxArmor,this.armor+e),this.armor-t}teleport(e,t,n,r=this.facing){this.motor.teleport(e,t,n),this.facing=r,this.aimYaw=r,this.visual.set(e,t,n),this.anim.velocity.set(0,0,0),this.anim.reset()}fixedUpdate(e,t){this.sinceHurt+=e,this.sinceHurtBy+=e;let n=this.motor;if(this.state===`freefall`||this.state===`chute`){n.step(e,this.input,t.waterHeight),this.input.jump=!1,this.facing=ze(this.facing,this.aimYaw,this.state===`chute`?3.4:5.5,e);return}if(this.state!==`normal`){n.landed=0,n.jumped=!1;return}this.alive||(this.input.moveX=0,this.input.moveZ=0,this.input.jump=!1,this.input.sprint=!1),n.step(e,this.input,t.waterHeight),this.input.jump=!1,n.jumped&&(this.anim.jump(),this.events.jumped?.(this)),n.landed>0&&(this.anim.land(n.landed),this.events.landed?.(this,n.landed)),n.swimming!==this.wasSwimming&&(this.wasSwimming=n.swimming,n.swimming&&this.events.splash?.(this,W(-n.velocity.y/12,.2,1)));let r=n.speed;if(this.alive){if(n.swimming||!this.strafe)r>.5&&(this.facing=ze(this.facing,Qt(n.velocity.x,n.velocity.z),n.swimming?5:10,e)),this.turning=!1;else if(r>.4||n.mode===`air`)this.facing=ze(this.facing,this.aimYaw,13,e),this.turning=!1;else{let t=Math.abs(At(this.facing,this.aimYaw));t>.95&&(this.turning=!0),this.turning&&(this.facing=tn(this.facing,this.aimYaw,4.6*e),t<.08&&(this.turning=!1))}}}frameUpdate(e,t){let n=this.motor,r=this.anim;if(this.state!==`plane`){if(this.state===`freefall`||this.state===`chute`)this.visual.lerpVectors(n.prevPosition,n.position,t),r.velocity.copy(n.velocity),r.mode=this.alive?`pose`:`dead`,r.crouched=!1;else if(this.state===`seated`)r.velocity.set(0,0,0),r.mode=this.alive?`seat`:`dead`,r.crouched=!1;else if(this.state===`normal`){this.visual.lerpVectors(n.prevPosition,n.position,t),r.velocity.copy(n.velocity);let e=`ground`;this.alive?n.mode===`swim`?e=`swim`:n.mode===`slide`?e=`slide`:n.mode===`air`&&(n.airTime>.09||n.velocity.y>1)&&(e=`air`):e=`dead`,r.mode=e,r.crouched=n.crouched&&n.mode!==`slide`}r.position.copy(this.visual),r.facing=this.facing,r.aimYaw=this.aimYaw,r.aimPitch=this.aimPitch,this.poseDt+=e,++this.poseWait>=this.poseEvery?(r.update(this.poseDt),this.poseWait=0,this.poseDt=0):r.place()}}dispose(){this.rig.dispose(),this.motor.dispose()}},cf=class extends ce{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(e){return new mf(e)}),this.register(function(e){return new hf(e)}),this.register(function(e){return new gf(e)}),this.register(function(e){return new Tf(e)}),this.register(function(e){return new Ef(e)}),this.register(function(e){return new Df(e)}),this.register(function(e){return new vf(e)}),this.register(function(e){return new yf(e)}),this.register(function(e){return new bf(e)}),this.register(function(e){return new xf(e)}),this.register(function(e){return new pf(e)}),this.register(function(e){return new Sf(e)}),this.register(function(e){return new _f(e)}),this.register(function(e){return new wf(e)}),this.register(function(e){return new Cf(e)}),this.register(function(e){return new df(e)}),this.register(function(e){return new Of(e,Z.EXT_MESHOPT_COMPRESSION)}),this.register(function(e){return new Of(e,Z.KHR_MESHOPT_COMPRESSION)}),this.register(function(e){return new kf(e)})}load(e,t,n,r){let i=this,a;if(this.resourcePath!==``)a=this.resourcePath;else if(this.path!==``){let t=pe.extractUrlBase(e);a=pe.resolveURL(t,this.path)}else a=pe.extractUrlBase(e);this.manager.itemStart(e);let o=function(t){r?r(t):console.error(t),i.manager.itemError(e),i.manager.itemEnd(e)},s=new Gt(this.manager);s.setPriority(this.priority),s.setCache(this.cache),s.setPath(this.path),s.setResponseType(`arraybuffer`),s.setRequestHeader(this.requestHeader),s.setWithCredentials(this.withCredentials),s.load(e,function(n){try{i.parse(n,a,function(n){t(n),i.manager.itemEnd(e)},o)}catch(e){o(e)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,r){let i,a={},o={},s=new TextDecoder;if(typeof e==`string`)i=JSON.parse(e);else if(e instanceof ArrayBuffer){if(s.decode(new Uint8Array(e,0,4))===Af){try{a[Z.KHR_BINARY_GLTF]=new Nf(e)}catch(e){r&&r(e);return}i=JSON.parse(a[Z.KHR_BINARY_GLTF].content)}else i=JSON.parse(s.decode(e))}else i=e;if(i.asset===void 0||i.asset.version[0]<2){r&&r(Error(`THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.`));return}let c=new ap(i,{path:t||this.resourcePath||``,crossOrigin:this.crossOrigin,priority:this.priority,cache:this.cache,withCredentials:this.withCredentials,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let e=0;e<this.pluginCallbacks.length;e++){let t=this.pluginCallbacks[e](c);t.name||console.error(`THREE.GLTFLoader: Invalid plugin found: missing name`),o[t.name]=t,a[t.name]=!0}if(i.extensionsUsed)for(let e=0;e<i.extensionsUsed.length;++e){let t=i.extensionsUsed[e],n=i.extensionsRequired||[];switch(t){case Z.KHR_MATERIALS_UNLIT:a[t]=new ff;break;case Z.KHR_DRACO_MESH_COMPRESSION:a[t]=new Pf(i,this.dracoLoader);break;case Z.KHR_TEXTURE_TRANSFORM:a[t]=new Ff;break;case Z.KHR_MESH_QUANTIZATION:a[t]=new If;break;default:n.indexOf(t)>=0&&o[t]===void 0&&console.warn(`THREE.GLTFLoader: Unknown extension "`+t+`".`)}}c.setExtensions(a),c.setPlugins(o),c.parse(n,r)}parseAsync(e,t){let n=this;return new Promise(function(r,i){n.parse(e,t,r,i)})}};function lf(){let e={};return{get:function(t){return e[t]},add:function(t,n){e[t]=n},remove:function(t){delete e[t]},removeAll:function(){e={}}}}function uf(e,t,n){let r=e.json.materials[t];return r.extensions&&r.extensions[n]?r.extensions[n]:null}var Z={KHR_BINARY_GLTF:`KHR_binary_glTF`,KHR_DRACO_MESH_COMPRESSION:`KHR_draco_mesh_compression`,KHR_LIGHTS_PUNCTUAL:`KHR_lights_punctual`,KHR_MATERIALS_CLEARCOAT:`KHR_materials_clearcoat`,KHR_MATERIALS_DIFFUSE_ROUGHNESS:`KHR_materials_diffuse_roughness`,KHR_MATERIALS_DISPERSION:`KHR_materials_dispersion`,KHR_MATERIALS_IOR:`KHR_materials_ior`,KHR_MATERIALS_SHEEN:`KHR_materials_sheen`,KHR_MATERIALS_SPECULAR:`KHR_materials_specular`,KHR_MATERIALS_TRANSMISSION:`KHR_materials_transmission`,KHR_MATERIALS_IRIDESCENCE:`KHR_materials_iridescence`,KHR_MATERIALS_ANISOTROPY:`KHR_materials_anisotropy`,KHR_MATERIALS_UNLIT:`KHR_materials_unlit`,KHR_MATERIALS_VOLUME:`KHR_materials_volume`,KHR_TEXTURE_BASISU:`KHR_texture_basisu`,KHR_TEXTURE_TRANSFORM:`KHR_texture_transform`,KHR_MESH_QUANTIZATION:`KHR_mesh_quantization`,KHR_MATERIALS_EMISSIVE_STRENGTH:`KHR_materials_emissive_strength`,EXT_MATERIALS_BUMP:`EXT_materials_bump`,EXT_TEXTURE_WEBP:`EXT_texture_webp`,EXT_TEXTURE_AVIF:`EXT_texture_avif`,EXT_MESHOPT_COMPRESSION:`EXT_meshopt_compression`,KHR_MESHOPT_COMPRESSION:`KHR_meshopt_compression`,EXT_MESH_GPU_INSTANCING:`EXT_mesh_gpu_instancing`},df=class{constructor(e){this.parser=e,this.name=Z.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,r=t.length;n<r;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n=`light:`+e,r=t.cache.get(n);if(r)return r;let i=t.json,a=((i.extensions&&i.extensions[this.name]||{}).lights||[])[e],o,s=new K(16777215);a.color!==void 0&&s.setRGB(a.color[0],a.color[1],a.color[2],ft);let c=a.range===void 0?0:a.range;switch(a.type){case`directional`:o=new Le(s),o.target.position.set(0,0,-1),o.add(o.target);break;case`point`:o=new wt(s),o.distance=c;break;case`spot`:o=new Xe(s),o.distance=c,a.spot=a.spot||{},a.spot.innerConeAngle=a.spot.innerConeAngle===void 0?0:a.spot.innerConeAngle,a.spot.outerConeAngle=a.spot.outerConeAngle===void 0?Math.PI/4:a.spot.outerConeAngle,o.angle=a.spot.outerConeAngle,o.penumbra=1-a.spot.innerConeAngle/a.spot.outerConeAngle,o.target.position.set(0,0,-1),o.add(o.target);break;default:throw Error(`THREE.GLTFLoader: Unexpected light type: `+a.type)}return o.position.set(0,0,0),Zf(o,a),a.intensity!==void 0&&(o.intensity=a.intensity),o.name=t.createUniqueName(a.name||`light_`+e),r=Promise.resolve(o),t.cache.add(n,r),r}getDependency(e,t){if(e===`light`)return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],i=(r.extensions&&r.extensions[this.name]||{}).light;return i===void 0?null:this._loadLight(i).then(function(e){return n._getNodeRef(t.cache,i,e)})}},ff=class{constructor(){this.name=Z.KHR_MATERIALS_UNLIT}getMaterialType(){return De}extendParams(e,t,n){let r=[];e.color=new K(1,1,1),e.opacity=1;let i=t.pbrMetallicRoughness;if(i){if(Array.isArray(i.baseColorFactor)){let t=i.baseColorFactor;e.color.setRGB(t[0],t[1],t[2],ft),e.opacity=t[3]}i.baseColorTexture!==void 0&&r.push(n.assignTexture(e,`map`,i.baseColorTexture,Tt))}return Promise.all(r)}},pf=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=uf(this.parser,e,this.name);return n===null||n.emissiveStrength!==void 0&&(t.emissiveIntensity=n.emissiveStrength),Promise.resolve()}},mf=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){return uf(this.parser,e,this.name)===null?null:je}extendMaterialParams(e,t){let n=uf(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];if(n.clearcoatFactor!==void 0&&(t.clearcoat=n.clearcoatFactor),n.clearcoatTexture!==void 0&&r.push(this.parser.assignTexture(t,`clearcoatMap`,n.clearcoatTexture)),n.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=n.clearcoatRoughnessFactor),n.clearcoatRoughnessTexture!==void 0&&r.push(this.parser.assignTexture(t,`clearcoatRoughnessMap`,n.clearcoatRoughnessTexture)),n.clearcoatNormalTexture!==void 0&&(r.push(this.parser.assignTexture(t,`clearcoatNormalMap`,n.clearcoatNormalTexture)),n.clearcoatNormalTexture.scale!==void 0)){let e=n.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new h(e,e)}return Promise.all(r)}},hf=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_DIFFUSE_ROUGHNESS}getMaterialType(e){return uf(this.parser,e,this.name)===null?null:je}extendMaterialParams(e,t){let n=uf(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];return t.diffuseRoughness=n.diffuseRoughnessFactor===void 0?0:n.diffuseRoughnessFactor,n.diffuseRoughnessTexture!==void 0&&r.push(this.parser.assignTexture(t,`diffuseRoughnessMap`,n.diffuseRoughnessTexture)),Promise.all(r)}},gf=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_DISPERSION}getMaterialType(e){return uf(this.parser,e,this.name)===null?null:je}extendMaterialParams(e,t){let n=uf(this.parser,e,this.name);return n===null||(t.dispersion=n.dispersion===void 0?0:n.dispersion),Promise.resolve()}},_f=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){return uf(this.parser,e,this.name)===null?null:je}extendMaterialParams(e,t){let n=uf(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];return n.iridescenceFactor!==void 0&&(t.iridescence=n.iridescenceFactor),n.iridescenceTexture!==void 0&&r.push(this.parser.assignTexture(t,`iridescenceMap`,n.iridescenceTexture)),n.iridescenceIor!==void 0&&(t.iridescenceIOR=n.iridescenceIor),n.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessMinimum=n.iridescenceThicknessMinimum),n.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessMaximum=n.iridescenceThicknessMaximum),n.iridescenceThicknessTexture!==void 0&&r.push(this.parser.assignTexture(t,`iridescenceThicknessMap`,n.iridescenceThicknessTexture)),Promise.all(r)}},vf=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_SHEEN}getMaterialType(e){return uf(this.parser,e,this.name)===null?null:je}extendMaterialParams(e,t){let n=uf(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];if(t.sheenColor=new K(0,0,0),t.sheenRoughness=0,t.sheen=1,n.sheenColorFactor!==void 0){let e=n.sheenColorFactor;t.sheenColor.setRGB(e[0],e[1],e[2],ft)}return n.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=n.sheenRoughnessFactor),n.sheenColorTexture!==void 0&&r.push(this.parser.assignTexture(t,`sheenColorMap`,n.sheenColorTexture,Tt)),n.sheenRoughnessTexture!==void 0&&r.push(this.parser.assignTexture(t,`sheenRoughnessMap`,n.sheenRoughnessTexture)),Promise.all(r)}},yf=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){return uf(this.parser,e,this.name)===null?null:je}extendMaterialParams(e,t){let n=uf(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];return n.transmissionFactor!==void 0&&(t.transmission=n.transmissionFactor),n.transmissionTexture!==void 0&&r.push(this.parser.assignTexture(t,`transmissionMap`,n.transmissionTexture)),Promise.all(r)}},bf=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_VOLUME}getMaterialType(e){return uf(this.parser,e,this.name)===null?null:je}extendMaterialParams(e,t){let n=uf(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];t.thickness=n.thicknessFactor===void 0?0:n.thicknessFactor,n.thicknessTexture!==void 0&&r.push(this.parser.assignTexture(t,`thicknessMap`,n.thicknessTexture)),t.attenuationDistance=n.attenuationDistance||1/0;let i=n.attenuationColor||[1,1,1];return t.attenuationColor=new K().setRGB(i[0],i[1],i[2],ft),Promise.all(r)}},xf=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_IOR}getMaterialType(e){return uf(this.parser,e,this.name)===null?null:je}extendMaterialParams(e,t){let n=uf(this.parser,e,this.name);return n===null||(t.ior=n.ior===void 0?1.5:n.ior,t.ior===0&&(t.ior=1e3)),Promise.resolve()}},Sf=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_SPECULAR}getMaterialType(e){return uf(this.parser,e,this.name)===null?null:je}extendMaterialParams(e,t){let n=uf(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];t.specularIntensity=n.specularFactor===void 0?1:n.specularFactor,n.specularTexture!==void 0&&r.push(this.parser.assignTexture(t,`specularIntensityMap`,n.specularTexture));let i=n.specularColorFactor||[1,1,1];return t.specularColor=new K().setRGB(i[0],i[1],i[2],ft),n.specularColorTexture!==void 0&&r.push(this.parser.assignTexture(t,`specularColorMap`,n.specularColorTexture,Tt)),Promise.all(r)}},Cf=class{constructor(e){this.parser=e,this.name=Z.EXT_MATERIALS_BUMP}getMaterialType(e){return uf(this.parser,e,this.name)===null?null:je}extendMaterialParams(e,t){let n=uf(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];return t.bumpScale=n.bumpFactor===void 0?1:n.bumpFactor,n.bumpTexture!==void 0&&r.push(this.parser.assignTexture(t,`bumpMap`,n.bumpTexture)),Promise.all(r)}},wf=class{constructor(e){this.parser=e,this.name=Z.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){return uf(this.parser,e,this.name)===null?null:je}extendMaterialParams(e,t){let n=uf(this.parser,e,this.name);if(n===null)return Promise.resolve();let r=[];return n.anisotropyStrength!==void 0&&(t.anisotropy=n.anisotropyStrength),n.anisotropyRotation!==void 0&&(t.anisotropyRotation=n.anisotropyRotation),n.anisotropyTexture!==void 0&&r.push(this.parser.assignTexture(t,`anisotropyMap`,n.anisotropyTexture)),Promise.all(r)}},Tf=class{constructor(e){this.parser=e,this.name=Z.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,r=n.textures[e];if(!r.extensions||!r.extensions[this.name])return null;let i=r.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw Error(`THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures`);return null}return t.loadTextureImage(e,i.source,a)}},Ef=class{constructor(e){this.parser=e,this.name=Z.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,r=n.json,i=r.textures[e];if(!i.extensions||!i.extensions[t])return null;let a=i.extensions[t],o=r.images[a.source],s=n.textureLoader;if(o.uri){let e=n.options.manager.getHandler(o.uri);e!==null&&(s=e)}return n.loadTextureImage(e,a.source,s)}},Df=class{constructor(e){this.parser=e,this.name=Z.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,r=n.json,i=r.textures[e];if(!i.extensions||!i.extensions[t])return null;let a=i.extensions[t],o=r.images[a.source],s=n.textureLoader;if(o.uri){let e=n.options.manager.getHandler(o.uri);e!==null&&(s=e)}return n.loadTextureImage(e,a.source,s)}},Of=class{constructor(e,t){this.name=t,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let e=n.extensions[this.name],r=this.parser.getDependency(`buffer`,e.buffer),i=this.parser.options.meshoptDecoder;if(!i||!i.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw Error(`THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files`);return null}return r.then(function(t){let n=e.byteOffset||0,r=e.byteLength||0,a=e.count,o=e.byteStride,s=new Uint8Array(t,n,r);return i.decodeGltfBufferAsync?i.decodeGltfBufferAsync(a,o,s,e.mode,e.filter).then(function(e){return e.buffer}):i.ready.then(function(){let t=new ArrayBuffer(a*o);return i.decodeGltfBuffer(new Uint8Array(t),a,o,s,e.mode,e.filter),t})})}return null}},kf=class{constructor(e){this.name=Z.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let r=t.meshes[n.mesh];for(let e of r.primitives)if(e.mode!==Bf.TRIANGLES&&e.mode!==Bf.TRIANGLE_STRIP&&e.mode!==Bf.TRIANGLE_FAN&&e.mode!==void 0)return null;let i=n.extensions[this.name].attributes,a=[],o={};for(let e in i)a.push(this.parser.getDependency(`accessor`,i[e]).then(t=>(o[e]=t,o[e])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(e=>{let t=e.pop(),n=t.isGroup?t.children:[t],r=e[0].count,i=[];for(let e of n){let t=new an,n=new f,a=new Ot,s=new f(1,1,1),c=new St(e.geometry,e.material,r);for(let e=0;e<r;e++)o.TRANSLATION&&n.fromBufferAttribute(o.TRANSLATION,e),o.ROTATION&&a.fromBufferAttribute(o.ROTATION,e),o.SCALE&&s.fromBufferAttribute(o.SCALE,e),c.setMatrixAt(e,t.compose(n,a,s));let l=null;for(let e in o)if(e===`_COLOR_0`){let t=o[e];c.instanceColor=new nt(t.array,t.itemSize,t.normalized)}else if(e!==`TRANSLATION`&&e!==`ROTATION`&&e!==`SCALE`){if(l===null){let e=c.geometry;l=new se,l.name=e.name;for(let t in e.attributes)l.setAttribute(t,e.attributes[t]);for(let t in e.morphAttributes)l.morphAttributes[t]=e.morphAttributes[t];e.index!==null&&l.setIndex(e.index),l.morphTargetsRelative=e.morphTargetsRelative;for(let t of e.groups)l.addGroup(t.start,t.count,t.materialIndex);e.boundingBox!==null&&(l.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(l.boundingSphere=e.boundingSphere.clone()),l.drawRange.start=e.drawRange.start,l.drawRange.count=e.drawRange.count,l.userData=Object.assign({},e.userData),c.geometry=l}let t=o[e];l.setAttribute(e,new nt(t.array,t.itemSize,t.normalized))}R.prototype.copy.call(c,e),this.parser.assignFinalMaterial(c),i.push(c)}return t.isGroup?(t.clear(),t.add(...i),t):i[0]}))}},Af=`glTF`,jf=12,Mf={JSON:1313821514,BIN:5130562},Nf=class{constructor(e){this.name=Z.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,jf),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Af)throw Error(`THREE.GLTFLoader: Unsupported glTF-Binary header.`);if(this.header.version<2)throw Error(`THREE.GLTFLoader: Legacy binary file detected.`);let r=this.header.length-jf,i=new DataView(e,jf),a=0;for(;a<r;){let t=i.getUint32(a,!0);a+=4;let r=i.getUint32(a,!0);if(a+=4,r===Mf.JSON){let r=new Uint8Array(e,jf+a,t);this.content=n.decode(r)}else if(r===Mf.BIN){let n=jf+a;this.body=e.slice(n,n+t)}a+=t}if(this.content===null)throw Error(`THREE.GLTFLoader: JSON content not found.`)}},Pf=class{constructor(e,t){if(!t)throw Error(`THREE.GLTFLoader: No DRACOLoader instance provided.`);this.name=Z.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,r=this.dracoLoader,i=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},s={},c={};for(let e in a){let t=Gf[e]||e.toLowerCase();o[t]=a[e]}for(let t in e.attributes){let r=Gf[t]||t.toLowerCase();if(a[t]!==void 0){let i=n.accessors[e.attributes[t]];c[r]=Vf[i.componentType].name,s[r]=i.normalized===!0}}return t.getDependency(`bufferView`,i).then(function(e){return new Promise(function(t,n){r.decodeDracoFile(e,function(e){for(let t in e.attributes){let n=e.attributes[t],r=s[t];r!==void 0&&(n.normalized=r)}t(e)},o,c,ft,n)})})}},Ff=class{constructor(){this.name=Z.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){if((t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0)return e;if(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),t.rotation!==void 0){let t=Math.cos(e.rotation),n=Math.sin(e.rotation);e.matrix.set(e.repeat.x*t,e.repeat.y*n,e.offset.x,-e.repeat.x*n,e.repeat.y*t,e.offset.y,0,0,1),e.matrixAutoUpdate=!1}return e.needsUpdate=!0,e}},If=class{constructor(){this.name=Z.KHR_MESH_QUANTIZATION}},Lf=class extends Zt{constructor(e,t,n,r){super(e,t,n,r)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r*3+r;for(let e=0;e!==r;e++)t[e]=n[i+e];return t}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=o*2,c=o*3,l=r-t,u=(n-t)/l,d=u*u,f=d*u,p=e*c,m=p-c,h=-2*f+3*d,g=f-d,_=1-h,v=g-d+u;for(let e=0;e!==o;e++){let t=a[m+e+o],n=a[m+e+s]*l,r=a[p+e+o],c=a[p+e]*l;i[e]=_*t+v*n+h*r+g*c}return i}},Rf=new Ot,zf=class extends Lf{interpolate_(e,t,n,r){let i=super.interpolate_(e,t,n,r);return Rf.fromArray(i).normalize().toArray(i),i}},Bf={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},Vf={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Hf={9728:Ft,9729:de,9984:Ie,9985:i,9986:j,9987:ht},Uf={33071:ge,33648:M,10497:L},Wf={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Gf={POSITION:`position`,NORMAL:`normal`,TANGENT:`tangent`,TEXCOORD_0:`uv`,TEXCOORD_1:`uv1`,TEXCOORD_2:`uv2`,TEXCOORD_3:`uv3`,COLOR_0:`color`,WEIGHTS_0:`skinWeight`,JOINTS_0:`skinIndex`},Kf={scale:`scale`,translation:`position`,rotation:`quaternion`,weights:`morphTargetInfluences`},qf={CUBICSPLINE:void 0,LINEAR:Ge,STEP:nn},Jf={OPAQUE:`OPAQUE`,MASK:`MASK`,BLEND:`BLEND`};function Yf(e){return e.DefaultMaterial===void 0&&(e.DefaultMaterial=new S({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:0})),e.DefaultMaterial}function Xf(e,t,n){for(let r in n.extensions)e[r]===void 0&&(t.userData.gltfExtensions=t.userData.gltfExtensions||{},t.userData.gltfExtensions[r]=n.extensions[r])}function Zf(e,t){t.extras!==void 0&&(typeof t.extras==`object`?Object.assign(e.userData,t.extras):console.warn(`THREE.GLTFLoader: Ignoring primitive type .extras, `+t.extras))}function Qf(e,t,n){let r=!1,i=!1,a=!1;for(let e=0,n=t.length;e<n;e++){let n=t[e];if(n.POSITION!==void 0&&(r=!0),n.NORMAL!==void 0&&(i=!0),n.COLOR_0!==void 0&&(a=!0),r&&i&&a)break}if(!r&&!i&&!a)return Promise.resolve(e);let o=[],s=[],c=[];for(let l=0,u=t.length;l<u;l++){let u=t[l];if(r){let t=u.POSITION===void 0?e.attributes.position:n.getDependency(`accessor`,u.POSITION);o.push(t)}if(i){let t=u.NORMAL===void 0?e.attributes.normal:n.getDependency(`accessor`,u.NORMAL);s.push(t)}if(a){let t=u.COLOR_0===void 0?e.attributes.color:n.getDependency(`accessor`,u.COLOR_0);c.push(t)}}return Promise.all([Promise.all(o),Promise.all(s),Promise.all(c)]).then(function(t){let n=t[0],o=t[1],s=t[2];return r&&(e.morphAttributes.position=n),i&&(e.morphAttributes.normal=o),a&&(e.morphAttributes.color=s),e.morphTargetsRelative=!0,e})}function $f(e,t){if(e.updateMorphTargets(),t.weights!==void 0)for(let n=0,r=t.weights.length;n<r;n++)e.morphTargetInfluences[n]=t.weights[n];if(t.extras&&Array.isArray(t.extras.targetNames)){let n=t.extras.targetNames;if(e.morphTargetInfluences.length===n.length){e.morphTargetDictionary={};for(let t=0,r=n.length;t<r;t++)e.morphTargetDictionary[n[t]]=t}else console.warn(`THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.`)}}function ep(e){let t,n=e.extensions&&e.extensions[Z.KHR_DRACO_MESH_COMPRESSION];if(t=n?`draco:`+n.bufferView+`:`+n.indices+`:`+tp(n.attributes):e.indices+`:`+tp(e.attributes)+`:`+e.mode,e.targets!==void 0)for(let n=0,r=e.targets.length;n<r;n++)t+=`:`+tp(e.targets[n]);return t}function tp(e){let t=``,n=Object.keys(e).sort();for(let r=0,i=n.length;r<i;r++)t+=n[r]+`:`+e[n[r]]+`;`;return t}function np(e){switch(e){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw Error(`THREE.GLTFLoader: Unsupported normalized accessor component type.`)}}function rp(e){return e.search(/\.jpe?g($|\?)/i)>0||e.search(/^data\:image\/jpeg/)===0?`image/jpeg`:e.search(/\.webp($|\?)/i)>0||e.search(/^data\:image\/webp/)===0?`image/webp`:e.search(/\.ktx2($|\?)/i)>0||e.search(/^data\:image\/ktx2/)===0?`image/ktx2`:`image/png`}var ip=new an,ap=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new lf,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,r=-1,i=!1,a=-1;if(typeof navigator<`u`&&navigator.userAgent!==void 0){let e=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(e)===!0;let t=e.match(/Version\/(\d+)/);r=n&&t?parseInt(t[1],10):-1,i=e.indexOf(`Firefox`)>-1,a=i?e.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>`u`||n&&r<17||i&&a<98?(this.textureLoader=new Mt(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)):(this.textureLoader=new Ze(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setWithCredentials(this.options.withCredentials),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Gt(this.options.manager),this.fileLoader.setPriority(this.options.priority),this.fileLoader.setCache(this.options.cache),this.fileLoader.setResponseType(`arraybuffer`),(this.options.withCredentials||this.options.crossOrigin===`use-credentials`)&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,r=this.json,i=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(e){return e._markDefs&&e._markDefs()}),Promise.all(this._invokeAll(function(e){return e.beforeRoot&&e.beforeRoot()})).then(function(){return Promise.all([n.getDependencies(`scene`),n.getDependencies(`animation`),n.getDependencies(`camera`)])}).then(function(t){let a={scene:t[0][r.scene||0],scenes:t[0],animations:t[1],cameras:t[2],asset:r.asset,parser:n,userData:{}};return Xf(i,a,r),Zf(a,r),Promise.all(n._invokeAll(function(e){return e.afterRoot&&e.afterRoot(a)})).then(function(){for(let e of a.scenes)e.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let n=0,r=t.length;n<r;n++){let r=t[n].joints;for(let t=0,n=r.length;t<n;t++)e[r[t]].isBone=!0}for(let t=0,r=e.length;t<r;t++){let r=e[t];r.mesh!==void 0&&(this._addNodeRef(this.meshCache,r.mesh),r.skin!==void 0&&(n[r.mesh].isSkinnedMesh=!0)),r.camera!==void 0&&this._addNodeRef(this.cameraCache,r.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let r=n.clone(),i=(e,t)=>{let n=this.associations.get(e);n!=null&&this.associations.set(t,n);for(let[n,r]of e.children.entries())i(r,t.children[n])};return i(n,r),r.name+=`_instance_`+e.uses[t]++,r}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let r=e(t[n]);if(r)return r}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let r=0;r<t.length;r++){let i=e(t[r]);i&&n.push(i)}return n}getDependency(e,t){let n=e+`:`+t,r=this.cache.get(n);if(!r){switch(e){case`scene`:r=this.loadScene(t);break;case`node`:r=this._invokeOne(function(e){return e.loadNode&&e.loadNode(t)});break;case`mesh`:r=this._invokeOne(function(e){return e.loadMesh&&e.loadMesh(t)});break;case`accessor`:r=this.loadAccessor(t);break;case`bufferView`:r=this._invokeOne(function(e){return e.loadBufferView&&e.loadBufferView(t)});break;case`buffer`:r=this.loadBuffer(t);break;case`material`:r=this._invokeOne(function(e){return e.loadMaterial&&e.loadMaterial(t)});break;case`texture`:r=this._invokeOne(function(e){return e.loadTexture&&e.loadTexture(t)});break;case`skin`:r=this.loadSkin(t);break;case`animation`:r=this._invokeOne(function(e){return e.loadAnimation&&e.loadAnimation(t)});break;case`camera`:r=this.loadCamera(t);break;default:if(r=this._invokeOne(function(n){return n!=this&&n.getDependency&&n.getDependency(e,t)}),!r)throw Error(`Unknown type: `+e)}this.cache.add(n,r)}return r}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,r=this.json[e+(e===`mesh`?`es`:`s`)]||[];t=Promise.all(r.map(function(t,r){return n.getDependency(e,r)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!==`arraybuffer`)throw Error(`THREE.GLTFLoader: `+t.type+` buffer type is not supported.`);if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Z.KHR_BINARY_GLTF].body);let r=this.options;return new Promise(function(e,i){n.load(pe.resolveURL(t.uri,r.path),e,void 0,function(){i(Error(`THREE.GLTFLoader: Failed to load buffer "`+t.uri+`".`))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency(`buffer`,t.buffer).then(function(e){let n=t.byteLength||0,r=t.byteOffset||0;return e.slice(r,r+n)})}loadAccessor(e){let t=this,n=this.json,r=this.json.accessors[e];if(r.bufferView===void 0&&r.sparse===void 0){let e=Wf[r.type],t=Vf[r.componentType],n=r.normalized===!0,i=new t(r.count*e);return Promise.resolve(new N(i,e,n))}let i=[];return r.bufferView===void 0?i.push(null):i.push(this.getDependency(`bufferView`,r.bufferView)),r.sparse!==void 0&&(i.push(this.getDependency(`bufferView`,r.sparse.indices.bufferView)),i.push(this.getDependency(`bufferView`,r.sparse.values.bufferView))),Promise.all(i).then(function(e){let i=e[0],a=Wf[r.type],o=Vf[r.componentType],s=o.BYTES_PER_ELEMENT,c=s*a,l=r.byteOffset||0,u=r.bufferView===void 0?void 0:n.bufferViews[r.bufferView].byteStride,d=r.normalized===!0,f,p;if(u&&u!==c){let e=Math.floor(l/u),n=`InterleavedBuffer:`+r.bufferView+`:`+r.componentType+`:`+e+`:`+r.count,c=t.cache.get(n);c||(f=new o(i,e*u,r.count*u/s),c=new it(f,u/s),t.cache.add(n,c)),p=new B(c,a,l%u/s,d)}else f=i===null?new o(r.count*a):new o(i,l,r.count*a),p=new N(f,a,d);if(r.sparse!==void 0){let t=Wf.SCALAR,n=Vf[r.sparse.indices.componentType],s=r.sparse.indices.byteOffset||0,c=r.sparse.values.byteOffset||0,l=new n(e[1],s,r.sparse.count*t),u=new o(e[2],c,r.sparse.count*a);i!==null&&(p=new N(p.array.slice(),p.itemSize,p.normalized)),p.normalized=!1;for(let e=0,t=l.length;e<t;e++){let t=l[e];if(p.setX(t,u[e*a]),a>=2&&p.setY(t,u[e*a+1]),a>=3&&p.setZ(t,u[e*a+2]),a>=4&&p.setW(t,u[e*a+3]),a>=5)throw Error(`THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.`)}p.normalized=d}return p})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,i=t.images[r],a=this.textureLoader;if(i.uri){let e=n.manager.getHandler(i.uri);e!==null&&(a=e)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let r=this,i=this.json,a=i.textures[e],o=i.images[t],s=(o.uri||o.bufferView)+`:`+a.sampler;if(this.textureCache[s])return this.textureCache[s];let c=this.loadImageSource(t,n).then(function(t){t.flipY=!1,t.name=a.name||o.name||``,t.name===``&&typeof o.uri==`string`&&o.uri.startsWith(`data:image/`)===!1&&(t.name=o.uri);let n=(i.samplers||{})[a.sampler]||{};return t.magFilter=Hf[n.magFilter]||1006,t.minFilter=Hf[n.minFilter]||1008,t.wrapS=Uf[n.wrapS]||1e3,t.wrapT=Uf[n.wrapT]||1e3,t.generateMipmaps=!t.isCompressedTexture&&t.minFilter!==1003&&t.minFilter!==1006,r.associations.set(t,{textures:e}),t}).catch(function(){return null});return this.textureCache[s]=c,c}loadImageSource(e,t){let n=this,r=this.json,i=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(e=>e.clone());let a=r.images[e],o=self.URL||self.webkitURL,s=a.uri||``,c=!1,l;if(t.isKTX2Loader===!0&&a.bufferView!==void 0)l=n.getDependency(`bufferView`,a.bufferView).then(function(e){return new Promise(function(n,r){t.parse(e,n,r)})});else{if(a.bufferView!==void 0)s=n.getDependency(`bufferView`,a.bufferView).then(function(e){c=!0;let t=new Blob([e],{type:a.mimeType});return s=o.createObjectURL(t),s});else if(a.uri===void 0)throw Error(`THREE.GLTFLoader: Image `+e+` is missing URI and bufferView`);l=Promise.resolve(s).then(function(e){return new Promise(function(n,r){let a=n;t.isImageBitmapLoader===!0&&(a=function(e){let t=new tt(e);t.needsUpdate=!0,n(t)}),t.load(pe.resolveURL(e,i.path),a,void 0,r)})})}let u=l.then(function(e){return c===!0&&o.revokeObjectURL(s),Zf(e,a),e.userData.mimeType=a.mimeType||rp(a.uri),e}).catch(function(e){throw console.error(`THREE.GLTFLoader: Couldn't load texture`,s),e});return this.sourceCache[e]=u,u}assignTexture(e,t,n,r){let i=this;return this.getDependency(`texture`,n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),i.extensions[Z.KHR_TEXTURE_TRANSFORM]){let e=n.extensions===void 0?void 0:n.extensions[Z.KHR_TEXTURE_TRANSFORM];if(e){let t=i.associations.get(a);a=i.extensions[Z.KHR_TEXTURE_TRANSFORM].extendTexture(a,e),i.associations.set(a,t)}}return r!==void 0&&(a.colorSpace=r),e[t]=a,a})}assignFinalMaterial(e){let t=e.geometry,n=e.material,r=t.attributes.tangent===void 0,i=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){let e=`PointsMaterial:`+n.uuid,t=this.cache.get(e);t||(t=new ct,O.prototype.copy.call(t,n),t.color.copy(n.color),t.map=n.map,t.sizeAttenuation=!1,this.cache.add(e,t)),n=t}else if(e.isLine){let e=`LineBasicMaterial:`+n.uuid,t=this.cache.get(e);t||(t=new xe,O.prototype.copy.call(t,n),t.color.copy(n.color),t.map=n.map,this.cache.add(e,t)),n=t}if(r||i||a){let e=`ClonedMaterial:`+n.uuid+`:`;r&&(e+=`derivative-tangents:`),i&&(e+=`vertex-colors:`),a&&(e+=`flat-shading:`);let t=this.cache.get(e);t||(t=n.clone(),i&&(t.vertexColors=!0),a&&(t.flatShading=!0),r&&(t.normalScale&&(t.normalScale.y*=-1),t.clearcoatNormalScale&&(t.clearcoatNormalScale.y*=-1)),this.cache.add(e,t),this.associations.set(t,this.associations.get(n))),n=t}e.material=n}getMaterialType(){return S}loadMaterial(e){let t=this,n=this.json,r=this.extensions,i=n.materials[e],a,o={},s=i.extensions||{},c=[];if(s[Z.KHR_MATERIALS_UNLIT]){let e=r[Z.KHR_MATERIALS_UNLIT];a=e.getMaterialType(),c.push(e.extendParams(o,i,t))}else{let n=i.pbrMetallicRoughness||{};if(o.color=new K(1,1,1),o.opacity=1,Array.isArray(n.baseColorFactor)){let e=n.baseColorFactor;o.color.setRGB(e[0],e[1],e[2],ft),o.opacity=e[3]}n.baseColorTexture!==void 0&&c.push(t.assignTexture(o,`map`,n.baseColorTexture,Tt)),o.metalness=n.metallicFactor===void 0?1:n.metallicFactor,o.roughness=n.roughnessFactor===void 0?1:n.roughnessFactor,n.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,`metalnessMap`,n.metallicRoughnessTexture)),c.push(t.assignTexture(o,`roughnessMap`,n.metallicRoughnessTexture))),a=this._invokeOne(function(t){return t.getMaterialType&&t.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(t){return t.extendMaterialParams&&t.extendMaterialParams(e,o)})))}i.doubleSided===!0&&(o.side=2);let l=i.alphaMode||Jf.OPAQUE;if(l===Jf.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,l===Jf.MASK&&(o.alphaTest=i.alphaCutoff===void 0?.5:i.alphaCutoff)),i.normalTexture!==void 0&&a!==De&&(c.push(t.assignTexture(o,`normalMap`,i.normalTexture)),o.normalScale=new h(1,1),i.normalTexture.scale!==void 0)){let e=i.normalTexture.scale;o.normalScale.set(e,e)}if(i.occlusionTexture!==void 0&&a!==De&&(c.push(t.assignTexture(o,`aoMap`,i.occlusionTexture)),i.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=i.occlusionTexture.strength)),i.emissiveFactor!==void 0&&a!==De){let e=i.emissiveFactor;o.emissive=new K().setRGB(e[0],e[1],e[2],ft)}return i.emissiveTexture!==void 0&&a!==De&&c.push(t.assignTexture(o,`emissiveMap`,i.emissiveTexture,Tt)),Promise.all(c).then(function(){let n=new a(o);return i.name&&(n.name=i.name),Zf(n,i),t.associations.set(n,{materials:e}),i.extensions&&Xf(r,n,i),n})}createUniqueName(e){let t=Be.sanitizeNodeName(e||``);return t in this.nodeNamesUsed?t+`_`+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,r=this.primitiveCache;function i(e){return n[Z.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(e,t).then(function(n){return sp(n,e,t)})}let a=[];for(let n=0,o=e.length;n<o;n++){let o=e[n],s=ep(o),c=r[s];if(c)a.push(c.promise);else{let e;e=o.extensions&&o.extensions[Z.KHR_DRACO_MESH_COMPRESSION]?i(o):sp(new se,o,t),o.mode===Bf.TRIANGLE_STRIP?e=e.then(e=>Da(e,1)):o.mode===Bf.TRIANGLE_FAN&&(e=e.then(e=>Da(e,2))),r[s]={primitive:o,promise:e},a.push(e)}}return Promise.all(a)}loadMesh(e){let t=this,n=this.json,r=this.extensions,i=n.meshes[e],a=i.primitives,o=[];for(let e=0,t=a.length;e<t;e++){let t=a[e].material===void 0?Yf(this.cache):this.getDependency(`material`,a[e].material);o.push(t)}return o.push(t.loadGeometries(a)),Promise.all(o).then(async function(n){let o=n.slice(0,n.length-1),c=n[n.length-1],l=[];for(let n=0,u=c.length;n<u;n++){let u=c[n],d=a[n],f,m=o[n];if(d.mode===Bf.TRIANGLES||d.mode===Bf.TRIANGLE_STRIP||d.mode===Bf.TRIANGLE_FAN||d.mode===void 0){let e=i.isSkinnedMesh===!0,t=u.hasAttribute(`skinIndex`)&&u.hasAttribute(`skinWeight`);e&&t===!1&&console.warn(`THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled.`),f=e&&t?new qe(u,m):new s(u,m),f.isSkinnedMesh===!0&&f.normalizeSkinWeights()}else if(d.mode===Bf.LINES)f=new p(u,m);else if(d.mode===Bf.LINE_STRIP)f=new en(u,m);else if(d.mode===Bf.LINE_LOOP)f=new g(u,m);else if(d.mode===Bf.POINTS)f=new Lt(u,m);else throw Error(`THREE.GLTFLoader: Primitive mode unsupported: `+d.mode);Object.keys(f.geometry.morphAttributes).length>0&&$f(f,i),f.name=t.createUniqueName(i.name||`mesh_`+e),Zf(f,i),d.extensions&&Xf(r,f,d),t.assignFinalMaterial(f),l.push(f)}for(let n=0,r=l.length;n<r;n++)t.associations.set(l[n],{meshes:e,primitives:n});if(l.length===1)return i.extensions&&Xf(r,l[0],i),l[0];let u=new Je;i.extensions&&Xf(r,u,i),t.associations.set(u,{meshes:e});for(let e=0,t=l.length;e<t;e++)u.add(l[e]);return u})}loadCamera(e){let n,r=this.json.cameras[e],i=r[r.type];if(!i)console.warn(`THREE.GLTFLoader: Missing camera parameters.`);else return r.type===`perspective`?n=new t(ie.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):r.type===`orthographic`&&(n=new he(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),r.name&&(n.name=this.createUniqueName(r.name)),Zf(n,r),Promise.resolve(n)}loadSkin(e){let t=this.json.skins[e],n=[];for(let e=0,r=t.joints.length;e<r;e++)n.push(this._loadNodeShallow(t.joints[e]));return t.inverseBindMatrices===void 0?n.push(null):n.push(this.getDependency(`accessor`,t.inverseBindMatrices)),Promise.all(n).then(function(e){let n=e.pop(),r=e,i=[],a=[];for(let e=0,o=r.length;e<o;e++){let o=r[e];if(o){i.push(o);let t=new an;n!==null&&t.fromArray(n.array,e*16),a.push(t)}else console.warn(`THREE.GLTFLoader: Joint "%s" could not be found.`,t.joints[e])}return new Ht(i,a)})}loadAnimation(e){let t=this.json,n=this,r=t.animations[e],i=r.name?r.name:`animation_`+e,a=[],o=[],s=[],c=[],l=[];for(let e=0,t=r.channels.length;e<t;e++){let t=r.channels[e],n=r.samplers[t.sampler],i=t.target,u=i.node,d=r.parameters===void 0?n.input:r.parameters[n.input],f=r.parameters===void 0?n.output:r.parameters[n.output];i.node!==void 0&&(a.push(this.getDependency(`node`,u)),o.push(this.getDependency(`accessor`,d)),s.push(this.getDependency(`accessor`,f)),c.push(n),l.push(i))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(s),Promise.all(c),Promise.all(l)]).then(function(e){let t=e[0],a=e[1],o=e[2],s=e[3],c=e[4],l=[];for(let e=0,r=t.length;e<r;e++){let r=t[e],i=a[e],u=o[e],d=s[e],f=c[e];if(r===void 0)continue;r.updateMatrix&&r.updateMatrix();let p=n._createAnimationTracks(r,i,u,d,f);if(p)for(let e=0;e<p.length;e++)l.push(p[e])}let u=new m(i,void 0,l);return Zf(u,r),u})}createNodeMesh(e){let t=this.json,n=this,r=t.nodes[e];return r.mesh===void 0?null:n.getDependency(`mesh`,r.mesh).then(function(e){let t=n._getNodeRef(n.meshCache,r.mesh,e);return r.weights!==void 0&&t.traverse(function(e){if(e.isMesh)for(let t=0,n=r.weights.length;t<n;t++)e.morphTargetInfluences[t]=r.weights[t]}),t})}loadNode(e){let t=this.json,n=this,r=t.nodes[e],i=n._loadNodeShallow(e),a=[],o=r.children||[];for(let e=0,t=o.length;e<t;e++)a.push(n.getDependency(`node`,o[e]));let s=r.skin===void 0?Promise.resolve(null):n.getDependency(`skin`,r.skin);return Promise.all([i,Promise.all(a),s]).then(function(e){let t=e[0],n=e[1],r=e[2];r!==null&&t.traverse(function(e){e.isSkinnedMesh&&e.bind(r,ip)});for(let e=0,r=n.length;e<r;e++)t.add(n[e]);if(t.userData.pivot!==void 0&&n.length>0){let e=t.userData.pivot,r=n[0];t.pivot=new f().fromArray(e),t.position.x-=e[0],t.position.y-=e[1],t.position.z-=e[2],r.position.set(0,0,0),delete t.userData.pivot}return t})}_loadNodeShallow(e){let t=this.json,n=this.extensions,r=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let i=t.nodes[e],a=i.name?r.createUniqueName(i.name):``,o=[],s=r._invokeOne(function(t){return t.createNodeMesh&&t.createNodeMesh(e)});return s&&o.push(s),i.camera!==void 0&&o.push(r.getDependency(`camera`,i.camera).then(function(e){return r._getNodeRef(r.cameraCache,i.camera,e)})),r._invokeAll(function(t){return t.createNodeAttachment&&t.createNodeAttachment(e)}).forEach(function(e){o.push(e)}),this.nodeCache[e]=Promise.all(o).then(function(t){let o;if(o=i.isBone===!0?new pt:t.length>1?new Je:t.length===1?t[0]:new R,o!==t[0])for(let e=0,n=t.length;e<n;e++)o.add(t[e]);if(i.name&&(o.userData.name=i.name,o.name=a),Zf(o,i),i.extensions&&Xf(n,o,i),i.matrix!==void 0){let e=new an;e.fromArray(i.matrix),o.applyMatrix4(e)}else i.translation!==void 0&&o.position.fromArray(i.translation),i.rotation!==void 0&&o.quaternion.fromArray(i.rotation),i.scale!==void 0&&o.scale.fromArray(i.scale);if(!r.associations.has(o))r.associations.set(o,{});else if(i.mesh!==void 0&&r.meshCache.refs[i.mesh]>1){let e=r.associations.get(o);r.associations.set(o,{...e})}return r.associations.get(o).nodes=e,o}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],r=this,i=new Je;n.name&&(i.name=r.createUniqueName(n.name)),Zf(i,n),n.extensions&&Xf(t,i,n);let a=n.nodes||[],o=[];for(let e=0,t=a.length;e<t;e++)o.push(r.getDependency(`node`,a[e]));return Promise.all(o).then(function(e){for(let t=0,n=e.length;t<n;t++){let n=e[t];n.parent===null?i.add(n):i.add(Oa(n))}return r.associations=(e=>{let t=new Map;for(let[e,n]of r.associations)(e instanceof O||e instanceof tt)&&t.set(e,n);return e.traverse(e=>{let n=r.associations.get(e);n!=null&&t.set(e,n)}),t})(i),i})}_createAnimationTracks(e,t,n,r,i){let a=[],o=e.name?e.name:e.uuid,s=[];function c(e){e.morphTargetInfluences&&s.push(e.name?e.name:e.uuid)}Kf[i.path]===Kf.weights?(c(e),e.isGroup&&e.children.forEach(c)):s.push(o);let l;switch(Kf[i.path]){case Kf.weights:l=Pe;break;case Kf.rotation:l=Vt;break;case Kf.translation:case Kf.scale:l=mt;break;default:switch(n.itemSize){case 1:l=Pe;break;default:l=mt}}let u=r.interpolation===void 0?Ge:qf[r.interpolation],d=this._getArrayFromAccessor(n);for(let e=0,n=s.length;e<n;e++){let n=new l(s[e]+`.`+Kf[i.path],t.array,d,u);r.interpolation===`CUBICSPLINE`&&this._createCubicSplineTrackInterpolant(n),a.push(n)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let e=np(t.constructor),n=new Float32Array(t.length);for(let r=0,i=t.length;r<i;r++)n[r]=t[r]*e;t=n}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(e){return new(this instanceof Vt?zf:Lf)(this.times,this.values,this.getValueSize()/3,e)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function op(e,t,r){let i=t.attributes,a=new n;if(i.POSITION!==void 0){let e=r.json.accessors[i.POSITION],t=e.min,n=e.max;if(t!==void 0&&n!==void 0){if(a.set(new f(t[0],t[1],t[2]),new f(n[0],n[1],n[2])),e.normalized){let t=np(Vf[e.componentType]);a.min.multiplyScalar(t),a.max.multiplyScalar(t)}}else{console.warn(`THREE.GLTFLoader: Missing min/max properties for accessor POSITION.`);return}}else return;let o=t.targets;if(o!==void 0){let e=new f,t=new f;for(let n=0,i=o.length;n<i;n++){let i=o[n];if(i.POSITION!==void 0){let n=r.json.accessors[i.POSITION],a=n.min,o=n.max;if(a!==void 0&&o!==void 0){if(t.setX(Math.max(Math.abs(a[0]),Math.abs(o[0]))),t.setY(Math.max(Math.abs(a[1]),Math.abs(o[1]))),t.setZ(Math.max(Math.abs(a[2]),Math.abs(o[2]))),n.normalized){let e=np(Vf[n.componentType]);t.multiplyScalar(e)}e.max(t)}else console.warn(`THREE.GLTFLoader: Missing min/max properties for accessor POSITION.`)}}a.expandByVector(e)}e.boundingBox=a;let s=new vt;a.getCenter(s.center),s.radius=a.min.distanceTo(a.max)/2,e.boundingSphere=s}function sp(e,t,n){let r=t.attributes,i=[];function o(t,r){return n.getDependency(`accessor`,t).then(function(t){e.setAttribute(r,t)})}for(let t in r){let n=Gf[t]||t.toLowerCase();n in e.attributes||i.push(o(r[t],n))}if(t.indices!==void 0&&!e.index){let r=n.getDependency(`accessor`,t.indices).then(function(t){e.setIndex(t)});i.push(r)}return a.workingColorSpace!==`srgb-linear`&&`COLOR_0`in r&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${a.workingColorSpace}" not supported.`),Zf(e,t),op(e,t,n),Promise.all(i).then(function(){return t.targets===void 0?e:Qf(e,t.targets,n)})}var cp=(function(){var e=`b9H79Tebbbe8Fv9Gbb9Gvuuuuueu9Giuuub9Geueu9Giuuueuixkbeeeddddillviebeoweuecj:Gdkr;Neqo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbeY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVbdE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbiL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtblK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949WboY9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVJ9V29VVbrl79IV9Rbwq:VZkdbk:XYi5ud9:du8Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnalTmbcuhoaiRbbgrc;WeGc:Ge9hmbarcsGgwce0mbc9:hoalcufadcd4cbawEgDadfgrcKcaawEgqaraq0Egk6mbaicefhxcj;abad9Uc;WFbGcjdadca0EhmaialfgPar9Rgoadfhsavaoadz:jjjjbgzceVhHcbhOdndninaeaO9nmeaPax9RaD6mdamaeaO9RaOamfgoae6EgAcsfglc9WGhCabaOad2fhXaAcethQaxaDfhiaOaeaoaeao6E9RhLalcl4cifcd4hKazcj;cbfaAfhYcbh8AazcjdfhEaHh3incbh5dnawTmbaxa8Acd4fRbbh5kcbh8Eazcj;cbfhqinaih8Fdndndndna5a8Ecet4ciGgoc9:fPdebdkaPa8F9RaA6mrazcj;cbfa8EaA2fa8FaAz:jjjjb8Aa8FaAfhixdkazcj;cbfa8EaA2fcbaAz:kjjjb8Aa8FhixekaPa8F9RaK6mva8FaKfhidnaCTmbaPai9RcK6mbaocdtc:q:G:cjbfcj:G:cjbawEhaczhrcbhlinargoc9Wfghaqfhrdndndndndndnaaa8Fahco4fRbbalcoG4ciGcdtfydbPDbedvivvvlvkar9cb83bwar9cb83bbxlkarcbaiRbdai8Xbb9c:c:qj:bw9:9c:q;c1:I1e:d9c:b:c:e1z9:gg9cjjjjjz:dg8J9qE86bbaqaofgrcGfcbaicdfa8J9c8N1:NfghRbbag9cjjjjjw:dg8J9qE86bbarcVfcbaha8J9c8M1:NfghRbbag9cjjjjjl:dg8J9qE86bbarc7fcbaha8J9c8L1:NfghRbbag9cjjjjjd:dg8J9qE86bbarctfcbaha8J9c8K1:NfghRbbag9cjjjjje:dg8J9qE86bbarc91fcbaha8J9c8J1:NfghRbbag9cjjjj;ab:dg8J9qE86bbarc4fcbaha8J9cg1:NfghRbbag9cjjjja:dg8J9qE86bbarc93fcbaha8J9ch1:NfghRbbag9cjjjjz:dgg9qE86bbarc94fcbahag9ca1:NfghRbbai8Xbe9c:c:qj:bw9:9c:q;c1:I1e:d9c:b:c:e1z9:gg9cjjjjjz:dg8J9qE86bbarc95fcbaha8J9c8N1:NfgiRbbag9cjjjjjw:dg8J9qE86bbarc96fcbaia8J9c8M1:NfgiRbbag9cjjjjjl:dg8J9qE86bbarc97fcbaia8J9c8L1:NfgiRbbag9cjjjjjd:dg8J9qE86bbarc98fcbaia8J9c8K1:NfgiRbbag9cjjjjje:dg8J9qE86bbarc99fcbaia8J9c8J1:NfgiRbbag9cjjjj;ab:dg8J9qE86bbarc9:fcbaia8J9cg1:NfgiRbbag9cjjjja:dg8J9qE86bbarcufcbaia8J9ch1:NfgiRbbag9cjjjjz:dgg9qE86bbaiag9ca1:NfhixikaraiRblaiRbbghco4g8Ka8KciSg8KE86bbaqaofgrcGfaiclfa8Kfg8KRbbahcl4ciGg8La8LciSg8LE86bbarcVfa8Ka8Lfg8KRbbahcd4ciGg8La8LciSg8LE86bbarc7fa8Ka8Lfg8KRbbahciGghahciSghE86bbarctfa8Kahfg8KRbbaiRbeghco4g8La8LciSg8LE86bbarc91fa8Ka8Lfg8KRbbahcl4ciGg8La8LciSg8LE86bbarc4fa8Ka8Lfg8KRbbahcd4ciGg8La8LciSg8LE86bbarc93fa8Ka8Lfg8KRbbahciGghahciSghE86bbarc94fa8Kahfg8KRbbaiRbdghco4g8La8LciSg8LE86bbarc95fa8Ka8Lfg8KRbbahcl4ciGg8La8LciSg8LE86bbarc96fa8Ka8Lfg8KRbbahcd4ciGg8La8LciSg8LE86bbarc97fa8Ka8Lfg8KRbbahciGghahciSghE86bbarc98fa8KahfghRbbaiRbigico4g8Ka8KciSg8KE86bbarc99faha8KfghRbbaicl4ciGg8Ka8KciSg8KE86bbarc9:faha8KfghRbbaicd4ciGg8Ka8KciSg8KE86bbarcufaha8KfgrRbbaiciGgiaiciSgiE86bbaraifhixdkaraiRbwaiRbbghcl4g8Ka8KcsSg8KE86bbaqaofgrcGfaicwfa8Kfg8KRbbahcsGghahcsSghE86bbarcVfa8KahfghRbbaiRbeg8Kcl4g8La8LcsSg8LE86bbarc7faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarctfaha8KfghRbbaiRbdg8Kcl4g8La8LcsSg8LE86bbarc91faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc4faha8KfghRbbaiRbig8Kcl4g8La8LcsSg8LE86bbarc93faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc94faha8KfghRbbaiRblg8Kcl4g8La8LcsSg8LE86bbarc95faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc96faha8KfghRbbaiRbvg8Kcl4g8La8LcsSg8LE86bbarc97faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc98faha8KfghRbbaiRbog8Kcl4g8La8LcsSg8LE86bbarc99faha8LfghRbba8KcsGg8Ka8KcsSg8KE86bbarc9:faha8KfghRbbaiRbrgicl4g8Ka8KcsSg8KE86bbarcufaha8KfgrRbbaicsGgiaicsSgiE86bbaraifhixekarai8Pbw83bwarai8Pbb83bbaiczfhikdnaoaC9pmbalcdfhlaoczfhraPai9RcL0mekkaoaC6moaimexokaCmva8FTmvkaqaAfhqa8Ecefg8Ecl9hmbkdndndndnawTmbasa8Acd4fRbbgociGPlbedrbkaATmdaza8Afh8Fazcj;cbfhhcbh8EaEhaina8FRbbhraahocbhlinaoahalfRbbgqce4cbaqceG9R7arfgr86bbaoadfhoaAalcefgl9hmbkaacefhaa8Fcefh8FahaAfhha8Ecefg8Ecl9hmbxikkaATmeaza8Afhaazcj;cbfhhcbhoceh8EaYh8FinaEaofhlaa8Vbbhrcbhoinala8FaofRbbcwtahaofRbbgqVc;:FiGce4cbaqceG9R7arfgr87bbaladfhlaLaocefgofmbka8FaQfh8FcdhoaacdfhaahaQfhha8EceGhlcbh8EalmbxdkkaATmbaocl4h8Eaza8AfRbbhqcwhoa3hlinalRbbaotaqVhqalcefhlaocwfgoca9hmbkcbhhaEh8FaYhainazcj;cbfahfRbbhrcwhoaahlinalRbbaotarVhralaAfhlaocwfgoca9hmbkara8E94aq7hqcbhoa8Fhlinalaqao486bbalcefhlaocwfgoca9hmbka8Fadfh8FaacefhaahcefghaA9hmbkkaEclfhEa3clfh3a8Aclfg8Aad6mbkaXazcjdfaAad2z:jjjjb8AazazcjdfaAcufad2fadz:jjjjb8AaAaOfhOaihxaimbkc9:hoxdkcbc99aPax9RakSEhoxekc9:hokavcj;kbf8Kjjjjbaok:ysezu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnalaeci9UgrcHf6mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecjez:kjjjb8Aav9cu83iUav9cu83i8Wav9cu83iyav9cu83iaav9cu83iKav9cu83izav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhldnaeTmbcmcsaDceSEhkcbhxcbhmcbhrcbhicbhoindnalaq9nmbc9:hoxikdndnawRbbgDc;Ve0mbavc;abfaoaDcu7gPcl4fcsGcitfgsydlhzasydbhHdndnaDcsGgsak9pmbavaiaPfcsGcdtfydbaxasEhDaxasTgOfhxxekdndnascsSmbcehOasc987asamffcefhDxekalcefhDal8SbbgscFeGhPdndnascu9mmbaDhlxekalcvfhlaPcFbGhPcrhsdninaD8SbbgOcFbGastaPVhPaOcu9kmeaDcefhDascrfgsc8J9hmbxdkkaDcefhlkcehOaPce4cbaPceG9R7amfhDkaDhmkavc;abfaocitfgsaDBdbasazBdlavaicdtfaDBdbavc;abfaocefcsGcitfgsaHBdbasaDBdlaocdfhoaOaifhidnadcd9hmbabarcetfgsaH87ebasclfaD87ebascdfaz87ebxdkabarcdtfgsaHBdbascwfaDBdbasclfazBdbxekdnaDcpe0mbavaiaqaDcsGfRbbgscl4gP9RcsGcdtfydbaxcefgOaPEhDavaias9RcsGcdtfydbaOaPTgzfgOascsGgPEhsaPThPdndnadcd9hmbabarcetfgHax87ebaHclfas87ebaHcdfaD87ebxekabarcdtfgHaxBdbaHcwfasBdbaHclfaDBdbkavaicdtfaxBdbavc;abfaocitfgHaDBdbaHaxBdlavaicefgicsGcdtfaDBdbavc;abfaocefcsGcitfgHasBdbaHaDBdlavaiazfgicsGcdtfasBdbavc;abfaocdfcsGcitfgDaxBdbaDasBdlaocifhoaiaPfhiaOaPfhxxekaxcbalRbbgsEgHaDc;:eSgDfhOascsGhAdndnascl4gCmbaOcefhzxekaOhzavaiaC9RcsGcdtfydbhOkdndnaAmbazcefhxxekazhxavaias9RcsGcdtfydbhzkdndnaDTmbalcefhDxekalcdfhDal8SbegPcFeGhsdnaPcu9kmbalcofhHascFbGhscrhldninaD8SbbgPcFbGaltasVhsaPcu9kmeaDcefhDalcrfglc8J9hmbkaHhDxekaDcefhDkasce4cbasceG9R7amfgmhHkdndnaCcsSmbaDhsxekaDcefhsaD8SbbglcFeGhPdnalcu9kmbaDcvfhOaPcFbGhPcrhldninas8SbbgDcFbGaltaPVhPaDcu9kmeascefhsalcrfglc8J9hmbkaOhsxekascefhskaPce4cbaPceG9R7amfgmhOkdndnaAcsSmbashlxekascefhlas8SbbgDcFeGhPdnaDcu9kmbascvfhzaPcFbGhPcrhDdninal8SbbgscFbGaDtaPVhPascu9kmealcefhlaDcrfgDc8J9hmbkazhlxekalcefhlkaPce4cbaPceG9R7amfgmhzkdndnadcd9hmbabarcetfgDaH87ebaDclfaz87ebaDcdfaO87ebxekabarcdtfgDaHBdbaDcwfazBdbaDclfaOBdbkavc;abfaocitfgDaOBdbaDaHBdlavaicdtfaHBdbavc;abfaocefcsGcitfgDazBdbaDaOBdlavaicefgicsGcdtfaOBdbavc;abfaocdfcsGcitfgDaHBdbaDazBdlavaiaCTaCcsSVfgicsGcdtfazBdbaiaATaAcsSVfhiaocifhokawcefhwaocsGhoaicsGhiarcifgrae6mbkkcbc99alaqSEhokavc;aef8Kjjjjbaok:clevu8Jjjjjbcz9Rhvdnalaecvf9pmbc9:skdnaiRbbc;:eGc;qeSmbcuskav9cb83iwaicefhoaialfc98fhrdnaeTmbdnadcdSmbcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcdtfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgiBdbalaiBdbawcefgwae9hmbxdkkcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcetfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgi87ebalaiBdbawcefgwae9hmbkkcbc99aoarSEk:Lvoeue99dud99eud99dndnadcl9hmbaeTmeindndnabcdfgd8Sbb:Yab8Sbbgi:Ygl:l:tabcefgv8Sbbgo:Ygr:l:tgwJbb;:9cawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai86bbdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad86bbdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad86bbabclfhbaecufgembxdkkaeTmbindndnabclfgd8Ueb:Yab8Uebgi:Ygl:l:tabcdfgv8Uebgo:Ygr:l:tgwJb;:FSawawNJbbbbawawJbbbb9GgDEgq:mgkaqaicb9iEalMgwawNakaqaocb9iEarMgqaqNMM:r:vglNJbbbZJbbb:;aDEMgr:lJbbb9p9DTmbar:Ohixekcjjjj94hikadai87ebdndnaqalNJbbbZJbbb:;aqJbbbb9GEMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkavad87ebdndnawalNJbbbZJbbb:;awJbbbb9GEMgw:lJbbb9p9DTmbaw:Ohdxekcjjjj94hdkabad87ebabcwfhbaecufgembkkk:4ioiue99dud99dud99dnaeTmbcbhiabhlindndnal8Uebgv:YgoJ:ji:1Salcof8UebgrciVgw:Y:vgDNJbbbZJbbb:;avcu9kEMgq:lJbbb9p9DTmbaq:Ohkxekcjjjj94hkkalclf8Uebhvalcdf8UebhxalarcefciGcetfak87ebdndnax:YgqaDNJbbbZJbbb:;axcu9kEMgm:lJbbb9p9DTmbam:Ohxxekcjjjj94hxkabaiarciGgkfcd7cetfax87ebdndnav:YgmaDNJbbbZJbbb:;avcu9kEMgP:lJbbb9p9DTmbaP:Ohvxekcjjjj94hvkalarcufciGcetfav87ebdndnawaw2:ZgPaPMaoaoN:taqaqN:tamamN:tgoJbbbbaoJbbbb9GE:raDNJbbbZMgD:lJbbb9p9DTmbaD:Ohrxekcjjjj94hrkalakcetfar87ebalcwfhlaiclfhiaecufgembkkk9mbdnadcd4ae2gdTmbinababydbgecwtcw91:Yaece91cjjj98Gcjjj;8if::NUdbabclfhbadcufgdmbkkk:Tvirud99eudndnadcl9hmbaeTmeindndnabRbbgiabcefgl8Sbbgvabcdfgo8Sbbgrf9R:YJbbuJabcifgwRbbgdce4adVgDcd4aDVgDcl4aDVgD:Z:vgqNJbbbZMgk:lJbbb9p9DTmbak:Ohxxekcjjjj94hxkaoax86bbdndnaraif:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohoxekcjjjj94hokalao86bbdndnavaifar9R:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohixekcjjjj94hikabai86bbdndnaDadcetGadceGV:ZaqNJbbbZMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkawad86bbabclfhbaecufgembxdkkaeTmbindndnab8Vebgiabcdfgl8Uebgvabclfgo8Uebgrf9R:YJbFu9habcofgw8Vebgdce4adVgDcd4aDVgDcl4aDVgDcw4aDVgD:Z:vgqNJbbbZMgk:lJbbb9p9DTmbak:Ohxxekcjjjj94hxkaoax87ebdndnaraif:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohoxekcjjjj94hokalao87ebdndnavaifar9R:YaqNJbbbZMgk:lJbbb9p9DTmbak:Ohixekcjjjj94hikabai87ebdndnaDadcetGadceGV:ZaqNJbbbZMgq:lJbbb9p9DTmbaq:Ohdxekcjjjj94hdkawad87ebabcwfhbaecufgembkkk9teiucbcbyd:K:G:cjbgeabcifc98GfgbBd:K:G:cjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaik;LeeeudndnaeabVciGTmbabhixekdndnadcz9pmbabhixekabhiinaiaeydbBdbaiclfaeclfydbBdbaicwfaecwfydbBdbaicxfaecxfydbBdbaeczfheaiczfhiadc9Wfgdcs0mbkkadcl6mbinaiaeydbBdbaeclfheaiclfhiadc98fgdci0mbkkdnadTmbinaiaeRbb86bbaicefhiaecefheadcufgdmbkkabk;aeedudndnabciGTmbabhixekaecFeGc:b:c:ew2hldndnadcz9pmbabhixekabhiinaialBdbaicxfalBdbaicwfalBdbaiclfalBdbaiczfhiadc9Wfgdcs0mbkkadcl6mbinaialBdbaiclfhiadc98fgdci0mbkkdnadTmbinaiae86bbaicefhiadcufgdmbkkabkk83dbcj:Gdk8Kbbbbdbbblbbbwbbbbbbbebbbdbbblbbbwbbbbc:K:Gdkl8W:qbb`,t=`b9H79TebbbeKl9Gbb9Gvuuuuueu9Giuuub9Geueuixkbbebeeddddilve9Weeeviebeoweuecj:Gdkr;Neqo9TW9T9VV95dbH9F9F939H79T9F9J9H229F9Jt9VV7bb8A9TW79O9V9Wt9F9KW9J9V9KW9wWVtW949c919M9MWVbdY9TW79O9V9Wt9F9KW9J9V9KW69U9KW949c919M9MWVblE9TW79O9V9Wt9F9KW9J9V9KW69U9KW949tWG91W9U9JWbvL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9p9JtboK9TW79O9V9Wt9F9KW9J9V9KWS9P2tWV9r919HtbrL9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVT949WbwY9TW79O9V9Wt9F9KW9J9V9KWS9P2tWVJ9V29VVbDl79IV9Rbqq:W9Dklbzik94evu8Jjjjjbcz9Rhbcbheincbhdcbhiinabcwfadfaicjuaead4ceGglE86bbaialfhiadcefgdcw9hmbkaeai86b:q:W:cjbaecitab8Piw83i:q:G:cjbaecefgecjd9hmbkk:JBl8Aud97dur978Jjjjjbcj;kb9Rgv8Kjjjjbc9:hodnalTmbcuhoaiRbbgrc;WeGc:Ge9hmbarcsGgwce0mbc9:hoalcufadcd4cbawEgDadfgrcKcaawEgqaraq0Egk6mbaialfgxar9RhodnadTgmmbavaoad;8qbbkaicefhPcj;abad9Uc;WFbGcjdadca0EhsdndndnadTmbaoadfhzcbhHinaeaH9nmdaxaP9RaD6miabaHad2fhOaPaDfhAasaeaH9RaHasfae6EgCcsfgocl4cifcd4hXavcj;cbfaoc9WGgQcetfhLavcj;cbfaQci2fhKavcj;cbfaQfhYcbh8Aaoc;ab6hEincbh3dnawTmbaPa8Acd4fRbbh3kcbh5avcj;cbfh8Eindndndndna3a5cet4ciGgoc9:fPdebdkaxaA9RaQ6mwdnaQTmbavcj;cbfa5aQ2faAaQ;8qbbkaAaCfhAxdkaQTmeavcj;cbfa5aQ2fcbaQ;8kbxekaxaA9RaX6moaoclVcbawEhraAaXfhocbhidnaEmbaxao9Rc;Gb6mbcbhlina8EalfhidndndndndndnaAalco4fRbbgqciGarfPDbedibledibkaipxbbbbbbbbbbbbbbbbpklbxlkaiaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaoclffagRb:q:W:cjbfhoxikaiaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaocwffagRb:q:W:cjbfhoxdkaiaopbbbpklbaoczfhoxekaiaopbbdaoRbbghcitpbi:q:G:cjbahRb:q:W:cjbghpsaoRbeggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbahaocdffagRb:q:W:cjbfhokdndndndndndnaqcd4ciGarfPDbedibledibkaiczfpxbbbbbbbbbbbbbbbbpklbxlkaiczfaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaoclffagRb:q:W:cjbfhoxikaiczfaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaocwffagRb:q:W:cjbfhoxdkaiczfaopbbbpklbaoczfhoxekaiczfaopbbdaoRbbghcitpbi:q:G:cjbahRb:q:W:cjbghpsaoRbeggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbahaocdffagRb:q:W:cjbfhokdndndndndndnaqcl4ciGarfPDbedibledibkaicafpxbbbbbbbbbbbbbbbbpklbxlkaicafaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaoclffagRb:q:W:cjbfhoxikaicafaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbahaocwffagRb:q:W:cjbfhoxdkaicafaopbbbpklbaoczfhoxekaicafaopbbdaoRbbghcitpbi:q:G:cjbahRb:q:W:cjbghpsaoRbeggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbahaocdffagRb:q:W:cjbfhokdndndndndndnaqco4arfPDbedibledibkaic8Wfpxbbbbbbbbbbbbbbbbpklbxlkaic8Wfaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Ngicitpbi:q:G:cjbaiRb:q:W:cjbgipsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Ngqcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbaiaoclffaqRb:q:W:cjbfhoxikaic8Wfaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Ngicitpbi:q:G:cjbaiRb:q:W:cjbgipsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Ngqcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spklbaiaocwffaqRb:q:W:cjbfhoxdkaic8Wfaopbbbpklbaoczfhoxekaic8WfaopbbdaoRbbgicitpbi:q:G:cjbaiRb:q:W:cjbgipsaoRbegqcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpklbaiaocdffaqRb:q:W:cjbfhokalc;abfhialcjefaQ0meaihlaxao9Rc;Fb0mbkkdnaiaQ9pmbaici4hlinaxao9RcK6mwa8EaifhqdndndndndndnaAaico4fRbbalcoG4ciGarfPDbedibledibkaqpxbbbbbbbbbbbbbbbbpkbbxlkaqaopbblaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLg8Fcdp:mea8FpmbzeHdOiAlCvXoQrLpxiiiiiiiiiiiiiiiip9ogapxiiiiiiiiiiiiiiiip8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spkbbahaoclffagRb:q:W:cjbfhoxikaqaopbbwaopbbbg8Fclp:mea8FpmbzeHdOiAlCvXoQrLpxssssssssssssssssp9ogapxssssssssssssssssp8Jg8Fp5b9cjF;8;4;W;G;ab9:9cU1:Nghcitpbi:q:G:cjbahRb:q:W:cjbghpsa8Fp5e9cjF;8;4;W;G;ab9:9cU1:Nggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPaaa8Fp9spkbbahaocwffagRb:q:W:cjbfhoxdkaqaopbbbpkbbaoczfhoxekaqaopbbdaoRbbghcitpbi:q:G:cjbahRb:q:W:cjbghpsaoRbeggcitpbi:q:G:cjbp9UpmbedilvorzHOACXQLpPpkbbahaocdffagRb:q:W:cjbfhokalcdfhlaiczfgiaQ6mbkkaohAaoTmoka8EaQfh8Ea5cefg5cl9hmbkdndndndnawTmbaza8Acd4fRbbglciGPlbedwbkaQTmdavcjdfa8Afhlava8Afpbdbh8Jcbhoinalavcj;cbfaofpblbg8KaYaofpblbg8LpmbzeHdOiAlCvXoQrLg8MaLaofpblbg8NaKaofpblbgypmbzeHdOiAlCvXoQrLg8PpmbezHdiOAlvCXorQLg8Fcep9Ta8Fpxeeeeeeeeeeeeeeeegap9op9Hp9rg8Fa8Jp9Ug8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp9Ug8Jp9Abbbaladfgla8Ja8Ma8PpmwDKYqk8AExm35Ps8E8Fg8Fcep9Ta8Faap9op9Hp9rg8Fp9Ug8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp9Ug8Jp9Abbbaladfgla8Ja8Ka8LpmwKDYq8AkEx3m5P8Es8Fg8Ka8NaypmwKDYq8AkEx3m5P8Es8Fg8LpmbezHdiOAlvCXorQLg8Fcep9Ta8Faap9op9Hp9rg8Fp9Ug8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp9Ug8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp9Ug8Jp9Abbbaladfgla8Ja8Ka8LpmwDKYqk8AExm35Ps8E8Fg8Fcep9Ta8Faap9op9Hp9rg8Fp9Ugap9Abbbaladfglaaa8Fa8Fpmlvorlvorlvorlvorp9Ugap9Abbbaladfglaaa8Fa8FpmwDqkwDqkwDqkwDqkp9Ugap9Abbbaladfglaaa8Fa8FpmxmPsxmPsxmPsxmPsp9Ug8Jp9AbbbaladfhlaoczfgoaQ6mbxikkaQTmeavcjdfa8Afhlava8Afpbdbh8Jcbhoinalavcj;cbfaofpblbg8KaYaofpblbg8LpmbzeHdOiAlCvXoQrLg8MaLaofpblbg8NaKaofpblbgypmbzeHdOiAlCvXoQrLg8PpmbezHdiOAlvCXorQLg8Fcep:nea8Fpxebebebebebebebebgap9op:bep9rg8Fa8Jp:oeg8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp:oeg8Jp9Abbbaladfgla8Ja8Ma8PpmwDKYqk8AExm35Ps8E8Fg8Fcep:nea8Faap9op:bep9rg8Fp:oeg8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp:oeg8Jp9Abbbaladfgla8Ja8Ka8LpmwKDYq8AkEx3m5P8Es8Fg8Ka8NaypmwKDYq8AkEx3m5P8Es8Fg8LpmbezHdiOAlvCXorQLg8Fcep:nea8Faap9op:bep9rg8Fp:oeg8Jp9Abbbaladfgla8Ja8Fa8Fpmlvorlvorlvorlvorp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmwDqkwDqkwDqkwDqkp:oeg8Jp9Abbbaladfgla8Ja8Fa8FpmxmPsxmPsxmPsxmPsp:oeg8Jp9Abbbaladfgla8Ja8Ka8LpmwDKYqk8AExm35Ps8E8Fg8Fcep:nea8Faap9op:bep9rg8Fp:oegap9Abbbaladfglaaa8Fa8Fpmlvorlvorlvorlvorp:oegap9Abbbaladfglaaa8Fa8FpmwDqkwDqkwDqkwDqkp:oegap9Abbbaladfglaaa8Fa8FpmxmPsxmPsxmPsxmPsp:oeg8Jp9AbbbaladfhlaoczfgoaQ6mbxdkkaQTmbcbhocbalcl4gl9Rc8FGhiavcjdfa8Afhrava8Afpbdbhainaravcj;cbfaofpblbg8JaYaofpblbg8KpmbzeHdOiAlCvXoQrLg8LaLaofpblbg8MaKaofpblbg8NpmbzeHdOiAlCvXoQrLgypmbezHdiOAlvCXorQLg8Faip:Rea8Falp:Tep9qg8Faap9rgap9Abbbaradfgraaa8Fa8Fpmlvorlvorlvorlvorp9rgap9Abbbaradfgraaa8Fa8FpmwDqkwDqkwDqkwDqkp9rgap9Abbbaradfgraaa8Fa8FpmxmPsxmPsxmPsxmPsp9rgap9Abbbaradfgraaa8LaypmwDKYqk8AExm35Ps8E8Fg8Faip:Rea8Falp:Tep9qg8Fp9rgap9Abbbaradfgraaa8Fa8Fpmlvorlvorlvorlvorp9rgap9Abbbaradfgraaa8Fa8FpmwDqkwDqkwDqkwDqkp9rgap9Abbbaradfgraaa8Fa8FpmxmPsxmPsxmPsxmPsp9rgap9Abbbaradfgraaa8Ja8KpmwKDYq8AkEx3m5P8Es8Fg8Ja8Ma8NpmwKDYq8AkEx3m5P8Es8Fg8KpmbezHdiOAlvCXorQLg8Faip:Rea8Falp:Tep9qg8Fp9rgap9Abbbaradfgraaa8Fa8Fpmlvorlvorlvorlvorp9rgap9Abbbaradfgraaa8Fa8FpmwDqkwDqkwDqkwDqkp9rgap9Abbbaradfgraaa8Fa8FpmxmPsxmPsxmPsxmPsp9rgap9Abbbaradfgraaa8Ja8KpmwDKYqk8AExm35Ps8E8Fg8Faip:Rea8Falp:Tep9qg8Fp9rgap9Abbbaradfgraaa8Fa8Fpmlvorlvorlvorlvorp9rgap9Abbbaradfgraaa8Fa8FpmwDqkwDqkwDqkwDqkp9rgap9Abbbaradfgraaa8Fa8FpmxmPsxmPsxmPsxmPsp9rgap9AbbbaradfhraoczfgoaQ6mbkka8Aclfg8Aad6mbkdnaCad2goTmbaOavcjdfao;8qbbkdnammbavavcjdfaCcufad2fad;8qbbkaCaHfhHc9:hoaAhPaAmbxlkkaeTmbaDalfhrcbhocuhlinaralaD9RglfaD6mdasaeao9Raoasfae6Eaofgoae6mbkaial9RhPkcbc99axaP9RakSEhoxekc9:hokavcj;kbf8Kjjjjbaokwbz:bjjjbkNsezu8Jjjjjbc;ae9Rgv8Kjjjjbc9:hodnalaeci9UgrcHf6mbcuhoaiRbbgwc;WeGc;Ge9hmbawcsGgDce0mbavc;abfcFecje;8kbav9cu83iUav9cu83i8Wav9cu83iyav9cu83iaav9cu83iKav9cu83izav9cu83iwav9cu83ibaialfc9WfhqaicefgwarfhldnaeTmbcmcsaDceSEhkcbhxcbhmcbhrcbhicbhoindnalaq9nmbc9:hoxikdndnawRbbgDc;Ve0mbavc;abfaoaDcu7gPcl4fcsGcitfgsydlhzasydbhHdndnaDcsGgsak9pmbavaiaPfcsGcdtfydbaxasEhDaxasTgOfhxxekdndnascsSmbcehOasc987asamffcefhDxekalcefhDal8SbbgscFeGhPdndnascu9mmbaDhlxekalcvfhlaPcFbGhPcrhsdninaD8SbbgOcFbGastaPVhPaOcu9kmeaDcefhDascrfgsc8J9hmbxdkkaDcefhlkcehOaPce4cbaPceG9R7amfhDkaDhmkavc;abfaocitfgsaDBdbasazBdlavaicdtfaDBdbavc;abfaocefcsGcitfgsaHBdbasaDBdlaocdfhoaOaifhidnadcd9hmbabarcetfgsaH87ebasclfaD87ebascdfaz87ebxdkabarcdtfgsaHBdbascwfaDBdbasclfazBdbxekdnaDcpe0mbavaiaqaDcsGfRbbgscl4gP9RcsGcdtfydbaxcefgOaPEhDavaias9RcsGcdtfydbaOaPTgzfgOascsGgPEhsaPThPdndnadcd9hmbabarcetfgHax87ebaHclfas87ebaHcdfaD87ebxekabarcdtfgHaxBdbaHcwfasBdbaHclfaDBdbkavaicdtfaxBdbavc;abfaocitfgHaDBdbaHaxBdlavaicefgicsGcdtfaDBdbavc;abfaocefcsGcitfgHasBdbaHaDBdlavaiazfgicsGcdtfasBdbavc;abfaocdfcsGcitfgDaxBdbaDasBdlaocifhoaiaPfhiaOaPfhxxekaxcbalRbbgsEgHaDc;:eSgDfhOascsGhAdndnascl4gCmbaOcefhzxekaOhzavaiaC9RcsGcdtfydbhOkdndnaAmbazcefhxxekazhxavaias9RcsGcdtfydbhzkdndnaDTmbalcefhDxekalcdfhDal8SbegPcFeGhsdnaPcu9kmbalcofhHascFbGhscrhldninaD8SbbgPcFbGaltasVhsaPcu9kmeaDcefhDalcrfglc8J9hmbkaHhDxekaDcefhDkasce4cbasceG9R7amfgmhHkdndnaCcsSmbaDhsxekaDcefhsaD8SbbglcFeGhPdnalcu9kmbaDcvfhOaPcFbGhPcrhldninas8SbbgDcFbGaltaPVhPaDcu9kmeascefhsalcrfglc8J9hmbkaOhsxekascefhskaPce4cbaPceG9R7amfgmhOkdndnaAcsSmbashlxekascefhlas8SbbgDcFeGhPdnaDcu9kmbascvfhzaPcFbGhPcrhDdninal8SbbgscFbGaDtaPVhPascu9kmealcefhlaDcrfgDc8J9hmbkazhlxekalcefhlkaPce4cbaPceG9R7amfgmhzkdndnadcd9hmbabarcetfgDaH87ebaDclfaz87ebaDcdfaO87ebxekabarcdtfgDaHBdbaDcwfazBdbaDclfaOBdbkavc;abfaocitfgDaOBdbaDaHBdlavaicdtfaHBdbavc;abfaocefcsGcitfgDazBdbaDaOBdlavaicefgicsGcdtfaOBdbavc;abfaocdfcsGcitfgDaHBdbaDazBdlavaiaCTaCcsSVfgicsGcdtfazBdbaiaATaAcsSVfhiaocifhokawcefhwaocsGhoaicsGhiarcifgrae6mbkkcbc99alaqSEhokavc;aef8Kjjjjbaok:clevu8Jjjjjbcz9Rhvdnalaecvf9pmbc9:skdnaiRbbc;:eGc;qeSmbcuskav9cb83iwaicefhoaialfc98fhrdnaeTmbdnadcdSmbcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcdtfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgiBdbalaiBdbawcefgwae9hmbxdkkcbhwindnaoar6mbc9:skaocefhlao8SbbgicFeGhddndnaicu9mmbalhoxekaocvfhoadcFbGhdcrhidninal8SbbgDcFbGaitadVhdaDcu9kmealcefhlaicrfgic8J9hmbxdkkalcefhokabawcetfadc8Etc8F91adcd47avcwfadceGcdtVglydbfgi87ebalaiBdbawcefgwae9hmbkkcbc99aoarSEk;Toio97eue97aec98Ghedndnadcl9hmbaeTmecbhdinababpbbbgicKp:RecKp:Sep;6eglaicwp:RecKp:Sep;6ealp;Geaiczp:RecKp:Sep;6egvp;Gep;Kep;Legopxbbbbbbbbbbbbbbbbp:2egralpxbbbjbbbjbbbjbbbjgwp9op9rp;Keglpxbb;:9cbb;:9cbb;:9cbb;:9calalp;Meaoaop;Meavaravawp9op9rp;Keglalp;Mep;Kep;Kep;Jep;Negvp;Mepxbbn0bbn0bbn0bbn0grp;KepxFbbbFbbbFbbbFbbbp9oaipxbbbFbbbFbbbFbbbFp9op9qalavp;Mearp;Kecwp:RepxbFbbbFbbbFbbbFbbp9op9qaoavp;Mearp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qpkbbabczfhbadclfgdae6mbxdkkaeTmbcbhdinabczfgDaDpbbbgipxbbbbbbFFbbbbbbFFgwp9oabpbbbgoaipmbediwDqkzHOAKY8AEgvczp:Reczp:Sep;6eglaoaipmlvorxmPsCXQL358E8FpxFubbFubbFubbFubbp9op;6eavczp:Sep;6egvp;Gealp;Gep;Kep;Legipxbbbbbbbbbbbbbbbbp:2egralpxbbbjbbbjbbbjbbbjgqp9op9rp;Keglpxb;:FSb;:FSb;:FSb;:FSalalp;Meaiaip;Meavaravaqp9op9rp;Keglalp;Mep;Kep;Kep;Jep;Negvp;Mepxbbn0bbn0bbn0bbn0grp;KepxFFbbFFbbFFbbFFbbp9oaiavp;Mearp;Keczp:Rep9qgialavp;Mearp;KepxFFbbFFbbFFbbFFbbp9oglpmwDKYqk8AExm35Ps8E8Fp9qpkbbabaoawp9oaialpmbezHdiOAlvCXorQLp9qpkbbabcafhbadclfgdae6mbkkk;2ileue97euo97dnaec98GgiTmbcbheinabcKfpx:ji:1S:ji:1S:ji:1S:ji:1SabpbbbglabczfgvpbbbgopmlvorxmPsCXQL358E8Fgrczp:Segwpxibbbibbbibbbibbbp9qp;6egDp;NegqaDaDp;MegDaDp;KealaopmbediwDqkzHOAKY8AEgDczp:Reczp:Sep;6eglalp;MeaDczp:Sep;6egoaop;Mearczp:Reczp:Sep;6egrarp;Mep;Kep;Kep;Lepxbbbbbbbbbbbbbbbbp:4ep;Jep;Mepxbbn0bbn0bbn0bbn0gDp;KepxFFbbFFbbFFbbFFbbgkp9oaqaop;MeaDp;Keczp:Rep9qgoaqalp;MeaDp;Keakp9oaqarp;MeaDp;Keczp:Rep9qgDpmwDKYqk8AExm35Ps8E8Fglp5eawclp:RegqpEi:T:j83ibavalp5baqpEd:T:j83ibabcwfaoaDpmbezHdiOAlvCXorQLgDp5eaqpEe:T:j83ibabaDp5baqpEb:T:j83ibabcafhbaeclfgeai6mbkkkuee97dnadcd4ae2c98GgeTmbcbhdinababpbbbgicwp:Recwp:Sep;6eaicep:SepxbbjFbbjFbbjFbbjFp9opxbbjZbbjZbbjZbbjZp:Uep;Mepkbbabczfhbadclfgdae6mbkkk:Sodw97euaec98Ghedndnadcl9hmbaeTmecbhdinabpxbbuJbbuJbbuJbbuJabpbbbgicKp:TeglaicYp:Tep9qgvcdp:Teavp9qgvclp:Teavp9qgop;6ep;Negvaicwp:RecKp:SegraipxFbbbFbbbFbbbFbbbgwp9ogDp:Uep;6ep;Mepxbbn0bbn0bbn0bbn0gqp;Kecwp:RepxbFbbbFbbbFbbbFbbp9oavaDarp:Xeaiczp:RecKp:Segip:Uep;6ep;Meaqp;Keawp9op9qavaDaraip:Uep:Xep;6ep;Meaqp;Keczp:RepxbbFbbbFbbbFbbbFbp9op9qavaoalcep:Rep9oalpxebbbebbbebbbebbbp9op9qp;6ep;Meaqp;KecKp:Rep9qpkbbabczfhbadclfgdae6mbxdkkaeTmbcbhdinabczfgkpxbFu9hbFu9hbFu9hbFu9habpbbbglakpbbbgrpmlvorxmPsCXQL358E8Fgvczp:TegqavcHp:Tep9qgicdp:Teaip9qgiclp:Teaip9qgicwp:Teaip9qgop;6ep;NegialarpmbediwDqkzHOAKY8AEgDpxFFbbFFbbFFbbFFbbglp9ograDczp:Segwp:Ueavczp:Reczp:SegDp:Xep;6ep;Mepxbbn0bbn0bbn0bbn0gvp;Kealp9oaiarawaDp:Uep:Xep;6ep;Meavp;Keczp:Rep9qgwaiaoaqcep:Rep9oaqpxebbbebbbebbbebbbp9op9qp;6ep;Meavp;Keczp:ReaiaDarp:Uep;6ep;Meavp;Kealp9op9qgipmwDKYqk8AExm35Ps8E8FpkbbabawaipmbezHdiOAlvCXorQLpkbbabcafhbadclfgdae6mbkkk9teiucbcbydj:G:cjbgeabcifc98GfgbBdj:G:cjbdndnabZbcztgd9nmbcuhiabad9RcFFifcz4nbcuSmekaehikaikkxebcj:Gdklz:zbb`,n=new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,3,2,0,0,5,3,1,0,1,12,1,0,10,22,2,12,0,65,0,65,0,65,0,252,10,0,0,11,7,0,65,0,253,15,26,11]),r=new Uint8Array([32,0,65,2,1,106,34,33,3,128,11,4,13,64,6,253,10,7,15,116,127,5,8,12,40,16,19,54,20,9,27,255,113,17,42,67,24,23,146,148,18,14,22,45,70,69,56,114,101,21,25,63,75,136,108,28,118,29,73,115]);if(typeof WebAssembly!=`object`)return{supported:!1};var i=WebAssembly.validate(n)?s(t):s(e),a,o=WebAssembly.instantiate(i,{}).then(function(e){a=e.instance,a.exports.__wasm_call_ctors()});function s(e){for(var t=new Uint8Array(e.length),n=0;n<e.length;++n){var i=e.charCodeAt(n);t[n]=i>96?i-97:i>64?i-39:i+4}for(var a=0,n=0;n<e.length;++n)t[a++]=t[n]<60?r[t[n]]:(t[n]-60)*64+t[++n];return t.buffer.slice(0,a)}function c(e,t,n,r,i,a,o){var s=e.exports.sbrk,c=r+3&-4,l=s(c*i),u=s(a.length),d=new Uint8Array(e.exports.memory.buffer);d.set(a,u);var f=t(l,r,i,u,a.length);if(f==0&&o&&o(l,c,i),n.set(d.subarray(l,l+r*i)),s(l-s(0)),f!=0)throw Error(`Malformed buffer data: `+f)}var l={NONE:``,OCTAHEDRAL:`meshopt_decodeFilterOct`,QUATERNION:`meshopt_decodeFilterQuat`,EXPONENTIAL:`meshopt_decodeFilterExp`,COLOR:`meshopt_decodeFilterColor`},u={ATTRIBUTES:`meshopt_decodeVertexBuffer`,TRIANGLES:`meshopt_decodeIndexBuffer`,INDICES:`meshopt_decodeIndexSequence`},d=[],f=0;function p(e){var t={object:new Worker(e),pending:0,requests:{}};return t.object.onmessage=function(e){var n=e.data;t.pending-=n.count,t.requests[n.id][n.action](n.value),delete t.requests[n.id]},t}function m(e){for(var t=`self.ready = WebAssembly.instantiate(new Uint8Array([`+new Uint8Array(i)+`]), {}).then(function(result) { result.instance.exports.__wasm_call_ctors(); return result.instance; });self.onmessage = `+g.name+`;`+c.toString()+g.toString(),n=new Blob([t],{type:`text/javascript`}),r=URL.createObjectURL(n),a=d.length;a<e;++a)d[a]=p(r);for(var a=e;a<d.length;++a)d[a].object.postMessage({});d.length=e,URL.revokeObjectURL(r)}function h(e,t,n,r,i){for(var a=d[0],o=1;o<d.length;++o)d[o].pending<a.pending&&(a=d[o]);return new Promise(function(o,s){var c=new Uint8Array(n),l=++f;a.pending+=e,a.requests[l]={resolve:o,reject:s},a.object.postMessage({id:l,count:e,size:t,source:c,mode:r,filter:i},[c.buffer])})}function g(e){var t=e.data;self.ready.then(function(e){if(!t.id)return self.close();try{var n=new Uint8Array(t.count*t.size);c(e,e.exports[t.mode],n,t.count,t.size,t.source,e.exports[t.filter]),self.postMessage({id:t.id,count:t.count,action:`resolve`,value:n},[n.buffer])}catch(e){self.postMessage({id:t.id,count:t.count,action:`reject`,value:e})}})}return{ready:o,supported:!0,useWorkers:function(e){m(e)},decodeVertexBuffer:function(e,t,n,r,i){c(a,a.exports.meshopt_decodeVertexBuffer,e,t,n,r,a.exports[l[i]])},decodeIndexBuffer:function(e,t,n,r){c(a,a.exports.meshopt_decodeIndexBuffer,e,t,n,r)},decodeIndexSequence:function(e,t,n,r){c(a,a.exports.meshopt_decodeIndexSequence,e,t,n,r)},decodeGltfBuffer:function(e,t,n,r,i,o){c(a,a.exports[u[i]],e,t,n,r,a.exports[l[o]])},decodeGltfBufferAsync:function(e,t,n,r,i){return d.length>0?h(e,t,n,u[r],l[i]):o.then(function(){var o=new Uint8Array(e*t);return c(a,a.exports[u[r]],o,e,t,n,a.exports[l[i]]),o})}}})(),lp=`./assets/`,up=class{manager=new y;gltf=new cf(this.manager);textures=new Mt(this.manager);models=new Map;modelLoads=new Map;textureCache=new Map;onProgress=()=>void 0;constructor(){this.gltf.setMeshoptDecoder(cp),this.manager.onProgress=(e,t,n)=>this.onProgress(t,n)}url(e){return lp+e}loadModel(e){let t=this.modelLoads.get(e);return t||(t=this.gltf.loadAsync(this.url(e)).then(t=>{let n={scene:t.scene,animations:t.animations};return this.models.set(e,n),n}),this.modelLoads.set(e,t)),t}async loadModels(e){await Promise.all(e.map(e=>this.loadModel(e)))}model(e){let t=this.models.get(e);if(!t)throw Error(`Model not preloaded: ${e}`);return t}hasModel(e){return this.models.has(e)}instance(e){return this.model(e).scene.clone(!0)}instanceSkinned(e){return Oa(this.model(e).scene)}texture(e,t=!0){let n=this.textureCache.get(e);return n||(n=this.textures.load(this.url(e)),t&&(n.colorSpace=Tt),this.textureCache.set(e,n)),n}loadTexture(e,t=!0){let n=this.textureCache.get(e);return n?Promise.resolve(n):this.textures.loadAsync(this.url(e)).then(n=>(t&&(n.colorSpace=Tt),this.textureCache.set(e,n),n))}},dp={name:`CopyShader`,uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},fp=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error(`THREE.Pass: .render() must be implemented in derived pass.`)}dispose(){}},pp=new he(-1,1,1,-1,0,1),mp=new class extends se{constructor(){super(),this.setAttribute(`position`,new Et([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute(`uv`,new Et([0,2,0,0,2,0],2))}},hp=class{constructor(e){this._mesh=new s(mp,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,pp)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}},gp=class extends fp{constructor(e,t=`tDiffuse`){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Ve?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=z.clone(e.uniforms),this.material=new Ve({name:e.name===void 0?`unspecified`:e.name,defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new hp(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},_p=class extends fp{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let r=e.getContext(),i=e.state;i.buffers.color.setMask(!1),i.buffers.depth.setMask(!1),i.buffers.color.setLocked(!0),i.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),i.buffers.stencil.setTest(!0),i.buffers.stencil.setOp(r.REPLACE,r.REPLACE,r.REPLACE),i.buffers.stencil.setFunc(r.ALWAYS,a,4294967295),i.buffers.stencil.setClear(o),i.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),i.buffers.color.setLocked(!1),i.buffers.depth.setLocked(!1),i.buffers.color.setMask(!0),i.buffers.depth.setMask(!0),i.buffers.stencil.setLocked(!1),i.buffers.stencil.setFunc(r.EQUAL,1,4294967295),i.buffers.stencil.setOp(r.KEEP,r.KEEP,r.KEEP),i.buffers.stencil.setLocked(!0)}},vp=class extends fp{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}},yp=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new h);this._width=n.width,this._height=n.height,t=new dt(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:yt}),t.texture.name=`EffectComposer.rt1`}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name=`EffectComposer.rt2`,this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new gp(dp),this.copyPass.material.blending=0,this.timer=new xt}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let t=0,r=this.passes.length;t<r;t++){let r=this.passes[t];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),r.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),r.needsSwap){if(n){let t=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),n.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}_p!==void 0&&(r instanceof _p?n=!0:r instanceof vp&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new h);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,r=this._height*this._pixelRatio;this.renderTarget1.setSize(n,r),this.renderTarget2.setSize(n,r);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(n,r)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}},bp=class extends fp{constructor(e,t,n=null,r=null,i=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=r,this.clearAlpha=i,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new K}render(e,t,n){let r=e.autoClear;e.autoClear=!1;let i,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==1&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(i),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=r}},xp={name:`LuminosityHighPassShader`,uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new K(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`},Sp=class e extends fp{constructor(e,t=1,n,r){super(),this.strength=t,this.radius=n,this.threshold=r,this.resolution=e===void 0?new h(256,256):new h(e.x,e.y),this.clearColor=new K(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new dt(i,a,{type:yt,depthBuffer:!1}),this.renderTargetBright.texture.name=`UnrealBloomPass.bright`,this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new dt(i,a,{type:yt,depthBuffer:!1});t.texture.name=`UnrealBloomPass.h`+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let n=new dt(i,a,{type:yt,depthBuffer:!1});n.texture.name=`UnrealBloomPass.v`+e,n.texture.generateMipmaps=!1,this.renderTargetsVertical.push(n),i=Math.round(i/2),a=Math.round(a/2)}let o=xp;this.highPassUniforms=z.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=r,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Ve({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let s=[6,10,14,18,22];i=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(s[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new h(1/i,1/a),i=Math.round(i/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new f(1,1,1),new f(1,1,1),new f(1,1,1),new f(1,1,1),new f(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=z.clone(dp.uniforms),this.blendMaterial=new Ve({uniforms:this.copyUniforms,vertexShader:dp.vertexShader,fragmentShader:dp.fragmentShader,premultipliedAlpha:!0,blending:2,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new K,this._oldClearAlpha=1,this._basic=new De,this._fsQuad=new hp(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),r=Math.round(t/2);this.renderTargetBright.setSize(n,r);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(n,r),this.renderTargetsVertical[e].setSize(n,r),this.separableBlurMaterials[e].uniforms.invSize.value=new h(1/n,1/r),n=Math.round(n/2),r=Math.round(r/2)}render(t,n,r,i,a){t.getClearColor(this._oldClearColor),this._oldClearAlpha=t.getClearAlpha();let o=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,t.setRenderTarget(null),t.clear(),this._fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this._fsQuad.render(t);let s=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this._fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=s.texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[n]),t.clear(),this._fsQuad.render(t),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=e.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[n]),t.clear(),this._fsQuad.render(t),s=this.renderTargetsVertical[n];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this._fsQuad.render(t),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this._fsQuad.render(t)):(t.setRenderTarget(r),this._fsQuad.render(t)),t.setClearColor(this._oldClearColor,this._oldClearAlpha),t.autoClear=o}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let r=0;r<e;r++)t.push(.39894*Math.exp(-.5*r*r/(n*n))/n);let r=[],i=[];for(let n=1;n<e;n+=2){let a=t[n],o=n+1<e?t[n+1]:0,s=a+o;r.push((n*a+(n+1)*o)/s),i.push(s)}return new Ve({defines:{KERNEL_PAIRS:r.length},uniforms:{colorTexture:{value:null},invSize:{value:new h(.5,.5)},direction:{value:new h(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:r},gaussianWeights:{value:i}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new Ve({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};Sp.BlurDirectionX=new h(1,0),Sp.BlurDirectionY=new h(0,1);var Cp={name:`OutputShader`,uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`},wp=class extends fp{constructor(){super(),this.isOutputPass=!0,this.uniforms=z.clone(Cp.uniforms),this.material=new te({name:Cp.name,uniforms:this.uniforms,vertexShader:Cp.vertexShader,fragmentShader:Cp.fragmentShader}),this._fsQuad=new hp(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},a.getTransfer(this._outputColorSpace)===`srgb`&&(this.material.defines.SRGB_TRANSFER=``),this._toneMapping===1?this.material.defines.LINEAR_TONE_MAPPING=``:this._toneMapping===2?this.material.defines.REINHARD_TONE_MAPPING=``:this._toneMapping===3?this.material.defines.CINEON_TONE_MAPPING=``:this._toneMapping===4?this.material.defines.ACES_FILMIC_TONE_MAPPING=``:this._toneMapping===6?this.material.defines.AGX_TONE_MAPPING=``:this._toneMapping===7?this.material.defines.NEUTRAL_TONE_MAPPING=``:this._toneMapping===5&&(this.material.defines.CUSTOM_TONE_MAPPING=``),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}},Tp={name:`FXAAShader`,uniforms:{tDiffuse:{value:null},resolution:{value:new h(1/1024,1/512)}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec2 resolution;
		varying vec2 vUv;

		#define EDGE_STEP_COUNT 6
		#define EDGE_GUESS 8.0
		#define EDGE_STEPS 1.0, 1.5, 2.0, 2.0, 2.0, 4.0
		const float edgeSteps[EDGE_STEP_COUNT] = float[EDGE_STEP_COUNT]( EDGE_STEPS );

		float _ContrastThreshold = 0.0312;
		float _RelativeThreshold = 0.063;
		float _SubpixelBlending = 1.0;

		vec4 Sample( sampler2D  tex2D, vec2 uv ) {

			return texture( tex2D, uv );

		}

		float SampleLuminance( sampler2D tex2D, vec2 uv ) {

			return dot( Sample( tex2D, uv ).rgb, vec3( 0.3, 0.59, 0.11 ) );

		}

		float SampleLuminance( sampler2D tex2D, vec2 texSize, vec2 uv, float uOffset, float vOffset ) {

			uv += texSize * vec2(uOffset, vOffset);
			return SampleLuminance(tex2D, uv);

		}

		struct LuminanceData {

			float m, n, e, s, w;
			float ne, nw, se, sw;
			float highest, lowest, contrast;

		};

		LuminanceData SampleLuminanceNeighborhood( sampler2D tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData l;
			l.m = SampleLuminance( tex2D, uv );
			l.n = SampleLuminance( tex2D, texSize, uv,  0.0,  1.0 );
			l.e = SampleLuminance( tex2D, texSize, uv,  1.0,  0.0 );
			l.s = SampleLuminance( tex2D, texSize, uv,  0.0, -1.0 );
			l.w = SampleLuminance( tex2D, texSize, uv, -1.0,  0.0 );

			l.ne = SampleLuminance( tex2D, texSize, uv,  1.0,  1.0 );
			l.nw = SampleLuminance( tex2D, texSize, uv, -1.0,  1.0 );
			l.se = SampleLuminance( tex2D, texSize, uv,  1.0, -1.0 );
			l.sw = SampleLuminance( tex2D, texSize, uv, -1.0, -1.0 );

			l.highest = max( max( max( max( l.n, l.e ), l.s ), l.w ), l.m );
			l.lowest = min( min( min( min( l.n, l.e ), l.s ), l.w ), l.m );
			l.contrast = l.highest - l.lowest;
			return l;

		}

		bool ShouldSkipPixel( LuminanceData l ) {

			float threshold = max( _ContrastThreshold, _RelativeThreshold * l.highest );
			return l.contrast < threshold;

		}

		float DeterminePixelBlendFactor( LuminanceData l ) {

			float f = 2.0 * ( l.n + l.e + l.s + l.w );
			f += l.ne + l.nw + l.se + l.sw;
			f *= 1.0 / 12.0;
			f = abs( f - l.m );
			f = clamp( f / l.contrast, 0.0, 1.0 );

			float blendFactor = smoothstep( 0.0, 1.0, f );
			return blendFactor * blendFactor * _SubpixelBlending;

		}

		struct EdgeData {

			bool isHorizontal;
			float pixelStep;
			float oppositeLuminance, gradient;

		};

		EdgeData DetermineEdge( vec2 texSize, LuminanceData l ) {

			EdgeData e;
			float horizontal =
				abs( l.n + l.s - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.se - 2.0 * l.e ) +
				abs( l.nw + l.sw - 2.0 * l.w );
			float vertical =
				abs( l.e + l.w - 2.0 * l.m ) * 2.0 +
				abs( l.ne + l.nw - 2.0 * l.n ) +
				abs( l.se + l.sw - 2.0 * l.s );
			e.isHorizontal = horizontal >= vertical;

			float pLuminance = e.isHorizontal ? l.n : l.e;
			float nLuminance = e.isHorizontal ? l.s : l.w;
			float pGradient = abs( pLuminance - l.m );
			float nGradient = abs( nLuminance - l.m );

			e.pixelStep = e.isHorizontal ? texSize.y : texSize.x;

			if (pGradient < nGradient) {

				e.pixelStep = -e.pixelStep;
				e.oppositeLuminance = nLuminance;
				e.gradient = nGradient;

			} else {

				e.oppositeLuminance = pLuminance;
				e.gradient = pGradient;

			}

			return e;

		}

		float DetermineEdgeBlendFactor( sampler2D  tex2D, vec2 texSize, LuminanceData l, EdgeData e, vec2 uv ) {

			vec2 uvEdge = uv;
			vec2 edgeStep;
			if (e.isHorizontal) {

				uvEdge.y += e.pixelStep * 0.5;
				edgeStep = vec2( texSize.x, 0.0 );

			} else {

				uvEdge.x += e.pixelStep * 0.5;
				edgeStep = vec2( 0.0, texSize.y );

			}

			float edgeLuminance = ( l.m + e.oppositeLuminance ) * 0.5;
			float gradientThreshold = e.gradient * 0.25;

			vec2 puv = uvEdge + edgeStep * edgeSteps[0];
			float pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
			bool pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !pAtEnd; i++ ) {

				puv += edgeStep * edgeSteps[i];
				pLuminanceDelta = SampleLuminance( tex2D, puv ) - edgeLuminance;
				pAtEnd = abs( pLuminanceDelta ) >= gradientThreshold;

			}

			if ( !pAtEnd ) {

				puv += edgeStep * EDGE_GUESS;

			}

			vec2 nuv = uvEdge - edgeStep * edgeSteps[0];
			float nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
			bool nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			for ( int i = 1; i < EDGE_STEP_COUNT && !nAtEnd; i++ ) {

				nuv -= edgeStep * edgeSteps[i];
				nLuminanceDelta = SampleLuminance( tex2D, nuv ) - edgeLuminance;
				nAtEnd = abs( nLuminanceDelta ) >= gradientThreshold;

			}

			if ( !nAtEnd ) {

				nuv -= edgeStep * EDGE_GUESS;

			}

			float pDistance, nDistance;
			if ( e.isHorizontal ) {

				pDistance = puv.x - uv.x;
				nDistance = uv.x - nuv.x;

			} else {

				pDistance = puv.y - uv.y;
				nDistance = uv.y - nuv.y;

			}

			float shortestDistance;
			bool deltaSign;
			if ( pDistance <= nDistance ) {

				shortestDistance = pDistance;
				deltaSign = pLuminanceDelta >= 0.0;

			} else {

				shortestDistance = nDistance;
				deltaSign = nLuminanceDelta >= 0.0;

			}

			if ( deltaSign == ( l.m - edgeLuminance >= 0.0 ) ) {

				return 0.0;

			}

			return 0.5 - shortestDistance / ( pDistance + nDistance );

		}

		vec4 ApplyFXAA( sampler2D  tex2D, vec2 texSize, vec2 uv ) {

			LuminanceData luminance = SampleLuminanceNeighborhood( tex2D, texSize, uv );
			if ( ShouldSkipPixel( luminance ) ) {

				return Sample( tex2D, uv );

			}

			float pixelBlend = DeterminePixelBlendFactor( luminance );
			EdgeData edge = DetermineEdge( texSize, luminance );
			float edgeBlend = DetermineEdgeBlendFactor( tex2D, texSize, luminance, edge, uv );
			float finalBlend = max( pixelBlend, edgeBlend );

			if (edge.isHorizontal) {

				uv.y += edge.pixelStep * finalBlend;

			} else {

				uv.x += edge.pixelStep * finalBlend;

			}

			return Sample( tex2D, uv );

		}

		void main() {

			gl_FragColor = ApplyFXAA( tDiffuse, resolution.xy, vUv );

		}`},Ep={name:`GradeShader`,uniforms:{tDiffuse:{value:null},uVignette:{value:.32},uSaturation:{value:1.08},uContrast:{value:1.04},uTint:{value:new K(1,1,1)},uTintAmount:{value:0},uFlash:{value:new K(1,0,0)},uFlashAmount:{value:0},uExposure:{value:1}},vertexShader:`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,fragmentShader:`
    uniform sampler2D tDiffuse;
    uniform float uVignette;
    uniform float uSaturation;
    uniform float uContrast;
    uniform vec3 uTint;
    uniform float uTintAmount;
    uniform vec3 uFlash;
    uniform float uFlashAmount;
    uniform float uExposure;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 c = texel.rgb * uExposure;
      float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(vec3(luma), c, uSaturation);
      c = (c - 0.18) * uContrast + 0.18;
      c = max(c, vec3(0.0));
      c = mix(c, c * uTint * 1.6, uTintAmount);
      vec2 q = vUv - 0.5;
      float r2 = dot(q, q);
      float vig = 1.0 - uVignette * smoothstep(0.12, 0.75, r2 * 1.9);
      c *= vig;
      float edge = smoothstep(0.08, 0.5, r2);
      c = mix(c, uFlash * (0.4 + luma), uFlashAmount * edge);
      gl_FragColor = vec4(c, texel.a);
    }`},Dp=class{composer;renderPass;bloom;grade;fxaa;renderer;size=new h;msaa=-1;constructor(e,t,n,r){this.renderer=e,e.getDrawingBufferSize(this.size),this.composer=new yp(e,this.makeTarget(r.msaa)),this.msaa=r.msaa,this.renderPass=new bp(t,n),this.bloom=new Sp(new h(this.size.x/2,this.size.y/2),.42,.62,1.22),this.grade=new gp(Ep),this.fxaa=new gp(Tp),this.composer.addPass(this.renderPass),this.composer.addPass(this.bloom),this.composer.addPass(this.grade),this.composer.addPass(new wp),this.composer.addPass(this.fxaa),this.applyQuality(r)}makeTarget(e){return new dt(Math.max(1,this.size.x),Math.max(1,this.size.y),{type:yt,samples:e})}applyQuality(e){this.bloom.enabled=e.bloom,this.fxaa.enabled=e.msaa===0,e.msaa!==this.msaa&&(this.msaa=e.msaa,this.composer.reset(this.makeTarget(e.msaa))),this.resize()}resize(){let e=this.renderer,t=e.getPixelRatio(),n=e.domElement.clientWidth||e.domElement.width,r=e.domElement.clientHeight||e.domElement.height;this.composer.setPixelRatio(t),this.composer.setSize(n,r),this.fxaa.material.uniforms.resolution.value.set(1/(n*t),1/(r*t))}get gradeUniforms(){return this.grade.uniforms}render(e){this.composer.render(e)}},Op=.4,kp=class{settings;renderer;scene=new lt;camera;post;canvas;timeScale=1;renderEnabled=!0;time=0;frameCount=0;fps=60;frameMs=16;accumulator=0;last=0;running=!1;handlers=null;raf=0;watchdog=0;lastFrame=0;fpsAccum=0;fpsFrames=0;renderScale=1;adaptive=!0;onStruggle=null;slowWindows=0;fastWindows=0;raiseAfter=6;stalls=0;graceUntil=0;graceFrames=0;wasDrawing=!1;sinceRaise=1e3;frameTimes=[];recordFrames=!1;constructor(e,n){this.settings=n,this.canvas=e,this.renderer=new wa({canvas:e,antialias:!1,powerPreference:`high-performance`,stencil:!1,preserveDrawingBuffer:!1}),this.renderer.outputColorSpace=Tt,this.renderer.toneMapping=4,this.renderer.toneMappingExposure=1,this.renderer.shadowMap.enabled=n.quality.shadows,this.renderer.shadowMap.type=1,this.renderer.info.autoReset=!1,this.camera=new t(n.data.fov,16/9,.12,n.quality.drawDistance),this.applyPixelRatio(),this.renderer.setSize(window.innerWidth,window.innerHeight,!1),this.post=new Dp(this.renderer,this.scene,this.camera,n.quality),this.resize(),window.addEventListener(`resize`,()=>this.resize())}applyPixelRatio(){let e=this.settings.quality.pixelRatio,t=window.devicePixelRatio||1;this.renderer.setPixelRatio((e<1?e:Math.min(t,e))*this.renderScale)}setRenderScale(e){let t=Math.max(Op,Math.min(1,e));Math.abs(t-this.renderScale)<.005||(this.renderScale=t,this.applyPixelRatio(),this.resize())}govern(){!this.adaptive||!this.renderEnabled||document.hidden?(this.slowWindows=0,this.fastWindows=0):(this.fps<42?(this.slowWindows++,this.fastWindows=0):this.fps>56?(this.fastWindows++,this.slowWindows=0):(this.slowWindows=0,this.fastWindows=0),this.sinceRaise++,this.slowWindows>=2?(this.slowWindows=0,this.renderScale>.405?(this.sinceRaise<=12&&(this.raiseAfter=Math.min(120,this.raiseAfter*2)),this.sinceRaise=1e3,this.setRenderScale(this.renderScale*(this.fps<24?.7:.85))):this.onStruggle?.()):this.fastWindows>=this.raiseAfter&&this.renderScale<1&&(this.fastWindows=0,this.sinceRaise>12&&this.sinceRaise<1e3&&(this.raiseAfter=Math.max(6,Math.round(this.raiseAfter/2))),this.sinceRaise=0,this.setRenderScale(this.renderScale*1.12)))}grace(e=3e3){this.graceUntil=performance.now()+e,this.graceFrames=this.frameCount+120,this.slowWindows=0,this.fastWindows=0,this.stalls=0}applyQuality(){this.grace();let e=this.settings.quality;this.applyPixelRatio(),this.renderer.shadowMap.enabled=e.shadows,this.camera.far=e.drawDistance,this.camera.updateProjectionMatrix(),this.post.applyQuality(e),this.resize()}resize(){let e=window.innerWidth,t=window.innerHeight;this.renderer.setSize(e,t,!1),this.camera.aspect=e/Math.max(1,t),this.camera.updateProjectionMatrix(),this.post.resize()}start(e){if(this.handlers=e,this.running)return;this.running=!0,this.last=performance.now(),this.lastFrame=this.last;let t=e=>{if(!this.running)return;this.raf=requestAnimationFrame(t);let n=Math.max(0,Math.min(.1,(e-this.last)/1e3));this.frameMs=Math.max(0,e-this.lastFrame),this.lastFrame=e,this.last=e,this.step(n*this.timeScale,n,Math.min(1,this.frameMs/1e3))};this.raf=requestAnimationFrame(t),this.watchdog=window.setInterval(()=>{if(!this.running||document.hidden)return;let e=performance.now();if(e-this.last<90)return;let t=Math.min(.1,(e-this.last)/1e3);this.last=e,this.advance(t*this.timeScale)},30)}stop(){this.running=!1,cancelAnimationFrame(this.raf),window.clearInterval(this.watchdog)}advance(e){let t=this.handlers;if(!t)return;this.accumulator+=e;let n=0;for(;this.accumulator>=.016666666666666666&&n<6;)t.fixed(Ct),this.time+=Ct,this.accumulator-=Ct,n++;this.accumulator>.03333333333333333&&(this.accumulator=0),t.frame(e,this.accumulator/Ct)}step(e,t=e,n=t){if(!this.handlers)return;this.advance(e),this.renderEnabled&&(this.renderer.info.reset(),this.post.render(t)),this.frameCount++,this.fpsAccum+=n,this.fpsFrames++,this.recordFrames&&this.frameTimes.push(this.frameMs),this.renderEnabled&&!this.wasDrawing&&this.grace(),this.wasDrawing=this.renderEnabled;let r=performance.now()>=this.graceUntil&&this.frameCount>=this.graceFrames;r&&this.running&&this.adaptive&&this.renderEnabled&&!document.hidden&&(this.stalls=this.frameMs>180?this.stalls+1:0,this.stalls>=3&&(this.stalls=0,this.sinceRaise=1e3,this.renderScale>.405?this.setRenderScale(Op):this.onStruggle?.())),this.fpsAccum>=.5&&(this.fps=this.fpsFrames/this.fpsAccum,this.fpsAccum=0,this.fpsFrames=0,this.running&&r&&this.govern())}fastForward(e,t=6){let n=this.handlers;if(!n)return;let r=Math.round(e/Ct);for(let e=0;e<r;e++)n.fixed(Ct),this.time+=Ct,e%t===t-1&&n.frame(Ct*t,0);let i=performance.now();this.last=i,this.lastFrame=i,this.fpsAccum=0,this.fpsFrames=0,this.stalls=0,this.slowWindows=0}},Ap=class{handlers=new Map;on(e,t){let n=this.handlers.get(e);return n||(n=new Set,this.handlers.set(e,n)),n.add(t),()=>n.delete(t)}emit(e,t){let n=this.handlers.get(e);if(n)for(let e of n)e(t)}clear(){this.handlers.clear()}},jp=class{down=new Set;pressedFixed=new Set;pressedFrame=new Set;releasedFixed=new Set;lookX=0;lookY=0;wheel=0;locked=!1;free=!1;lastX=NaN;lastY=NaN;enabled=!0;element;wantLock=!1;lockDenied=!1;everLocked=!1;gestureRequest=!1;edgeAt=0;constructor(e){this.element=e,window.addEventListener(`keydown`,this.onKeyDown),window.addEventListener(`keyup`,this.onKeyUp),window.addEventListener(`blur`,this.onBlur),e.addEventListener(`mousedown`,this.onMouseDown),window.addEventListener(`mouseup`,this.onMouseUp),window.addEventListener(`mousemove`,this.onMouseMove),e.addEventListener(`wheel`,this.onWheel,{passive:!0}),e.addEventListener(`contextmenu`,e=>e.preventDefault()),document.addEventListener(`pointerlockchange`,this.onLockChange),document.addEventListener(`pointerlockerror`,()=>this.onLockRefused())}onKeyDown=e=>{e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement||(this.enabled&&Mp.has(e.code)&&e.preventDefault(),e.repeat||this.press(e.code))};onKeyUp=e=>{this.release(e.code)};onBlur=()=>{for(let e of this.down)this.releasedFixed.add(e);this.down.clear()};onMouseDown=e=>{this.press(`Mouse${e.button}`),this.wantLock&&!this.locked&&this.requestLock()};onMouseUp=e=>{this.release(`Mouse${e.button}`)};onMouseMove=e=>{this.locked?(this.lookX+=e.movementX,this.lookY+=e.movementY):this.free&&document.pointerLockElement!==this.element&&(Number.isNaN(this.lastX)||(this.lookX+=e.clientX-this.lastX,this.lookY+=e.clientY-this.lastY),this.lastX=e.clientX,this.lastY=e.clientY)};get freeLook(){return this.free}set freeLook(e){this.free=e,this.lastX=NaN,e&&document.pointerLockElement===this.element&&(this.locked=!1,document.exitPointerLock())}onWheel=e=>{this.wheel+=Math.sign(e.deltaY)};onLockRefused(){this.locked=!1,!this.gestureRequest||this.everLocked||this.free||(this.lockDenied=!0,this.freeLook=!0)}onLockChange=()=>{this.locked=document.pointerLockElement===this.element,this.locked&&(this.everLocked=!0),this.lastX=NaN,this.locked&&this.free&&(this.locked=!1,document.exitPointerLock())};press(e){this.down.has(e)||(this.pressedFixed.add(e),this.pressedFrame.add(e)),this.down.add(e)}release(e){this.down.delete(e)&&this.releasedFixed.add(e)}setWantLock(e){this.wantLock=e,e?this.requestLock():document.pointerLockElement===this.element&&document.exitPointerLock()}requestLock(){if(!this.free){this.gestureRequest=navigator.userActivation?.isActive??!0;try{let e=this.element.requestPointerLock();e instanceof Promise&&e.catch(()=>void 0)}catch{this.onLockRefused()}}}held(e){return this.enabled&&this.down.has(e)}pressed(e){return this.enabled&&this.pressedFixed.has(e)}released(e){return this.enabled&&this.releasedFixed.has(e)}pressedThisFrame(e){return this.pressedFrame.has(e)}axis(e,t){return+!!this.held(t)-!!this.held(e)}consumeLook(e){if(this.lockDenied&&this.free&&!Number.isNaN(this.lastX)){let e=performance.now(),t=Math.min(.1,Math.max(0,(e-this.edgeAt)/1e3));this.edgeAt=e;let n=window.innerWidth,r=Math.max(48,n*.14),i=0;this.lastX<r?i=this.lastX/r-1:this.lastX>n-r&&(i=1-(n-this.lastX)/r),this.lookX+=i*1100*t}e.x=this.enabled?this.lookX:0,e.y=this.enabled?this.lookY:0,this.lookX=0,this.lookY=0}consumeWheel(){let e=this.wheel;return this.wheel=0,this.enabled?e:0}endFixedStep(){this.pressedFixed.clear(),this.releasedFixed.clear()}endFrame(){this.pressedFrame.clear()}releaseAll(){this.onBlur()}},Mp=new Set(`Space.Tab.ArrowUp.ArrowDown.ArrowLeft.ArrowRight.KeyW.KeyA.KeyS.KeyD.KeyE.KeyF.KeyQ.KeyR.KeyC.KeyG.KeyM.KeyH.KeyX.KeyV.ControlLeft.ShiftLeft.AltLeft.Digit1.Digit2.Digit3.Digit4.Digit5.Slash.Quote`.split(`.`)),Np={low:{label:`Low`,pixelRatio:.75,shadowMapSize:1024,shadows:!1,msaa:0,bloom:!1,ao:!1,waterGrid:96,drawDistance:900,animLodNear:20,particles:.4,propDensity:.5,streetLights:0,anisotropy:2},medium:{label:`Medium`,pixelRatio:1,shadowMapSize:2048,shadows:!0,msaa:0,bloom:!0,ao:!1,waterGrid:160,drawDistance:1400,animLodNear:30,particles:.7,propDensity:.8,streetLights:3,anisotropy:4},high:{label:`High`,pixelRatio:1,shadowMapSize:3072,shadows:!0,msaa:0,bloom:!0,ao:!1,waterGrid:224,drawDistance:2200,animLodNear:40,particles:1,propDensity:1,streetLights:5,anisotropy:8},ultra:{label:`Ultra`,pixelRatio:1.5,shadowMapSize:4096,shadows:!0,msaa:4,bloom:!0,ao:!0,waterGrid:288,drawDistance:3e3,animLodNear:60,particles:1.3,propDensity:1,streetLights:8,anisotropy:16}},Pp={quality:`high`,masterVolume:.8,sfxVolume:.9,musicVolume:.5,sensitivity:1,invertY:!1,fov:62,showFps:!1},Fp=[`low`,`medium`,`high`,`ultra`],Ip={masterVolume:[0,1],sfxVolume:[0,1],musicVolume:[0,1],sensitivity:[.2,3],fov:[50,100]};function Lp(e,t){let n=Ip[e];return n?Number.isFinite(t)?Math.min(n[1],Math.max(n[0],t)):Pp[e]:t}var Rp=`eyewall.settings.v2`,zp=`eyewall.settings.v1`,Bp=class{data;chosen;listeners=new Set;constructor(){this.data={...Pp};try{let e=localStorage.getItem(Rp),t=e?null:localStorage.getItem(zp),n=e??t;if(n){let e=JSON.parse(n);t&&delete e.quality;for(let t of Object.keys(Pp)){let n=e[t];typeof n==typeof Pp[t]&&(this.data[t]=typeof n==`number`?Lp(t,n):n)}this.data.quality in Np||(this.data.quality=Pp.quality)}}catch{}this.chosen={...this.data}}get quality(){return Np[this.data.quality]}set(e,t,n=!0){if(typeof t==`number`&&(t=Lp(e,t)),n&&this.chosen[e]!==t){this.chosen[e]=t;try{localStorage.setItem(Rp,JSON.stringify(this.chosen))}catch{}}if(this.data[e]!==t){this.data[e]=t;for(let t of this.listeners)t(this.data,e)}}reset(){for(let e of Object.keys(Pp))this.set(e,Pp[e])}onChange(e){return this.listeners.add(e),()=>this.listeners.delete(e)}},Vp=new f,Hp=new f,Up=new f,Wp=new f,Gp=class{camera;physics;yaw=0;pitch=-.12;forward=new f(0,0,-1);aimPoint=new f;aimDistance=100;baseFov=62;pivot=new f;hasPivot=!1;boom=3.4;fov=62;shoulder=.55;trauma=0;time=0;recoilPitch=new et(0,.09);recoilYaw=new et(0,.09);constructor(e,t){this.camera=e,this.physics=t}look(e,t,n,r){let i=.0022*n*(this.fov/this.baseFov);this.yaw-=e*i,this.pitch=W(this.pitch-t*i*(r?-1:1),-1.35,1.25)}shake(e){this.trauma=Math.min(1,this.trauma+e)}recoil(e,t){this.recoilPitch.velocity+=e*22,this.recoilYaw.velocity+=t*22}get recoilOffset(){return{pitch:this.recoilPitch.value,yaw:this.recoilYaw.value}}snap(){this.hasPivot=!1}update(e,t){this.time+=e;let n=this.recoilPitch.update(0,e),r=this.recoilYaw.update(0,e),i=this.yaw+r,a=W(this.pitch+n,-1.45,1.4),o=Math.cos(a);if(Up.set(-Math.sin(i)*o,Math.sin(a),-Math.cos(i)*o),Wp.set(Math.cos(i),0,-Math.sin(i)),Vp.copy(t.position),Vp.y+=t.height,!this.hasPivot)this.pivot.copy(Vp),this.hasPivot=!0,this.boom=t.distance;else{let n=1-Math.exp(-28*e);this.pivot.x+=(Vp.x-this.pivot.x)*n,this.pivot.z+=(Vp.z-this.pivot.z)*n,this.pivot.y=H(this.pivot.y,Vp.y,t.followRate??12,e),this.pivot.distanceToSquared(Vp)>36&&this.pivot.copy(Vp)}this.shoulder=H(this.shoulder,t.shoulder,10,e),Hp.copy(this.pivot);let s=this.shoulder;if(Math.abs(s)>.01){let e=Math.sign(s),n=this.physics.raycast(this.pivot.x,this.pivot.y,this.pivot.z,Wp.x*e,0,Wp.z*e,Math.abs(s)+.25,Ut.queryCamera,t.exclude);n&&(s=e*Math.max(0,n.distance-.25)),Hp.addScaledVector(Wp,s)}let c=Hp.x,l=Hp.y,u=Hp.z,d=G(t.distance,Math.min(t.distance,1.75),t.aim),f=d,p=this.physics.raycast(c,l,u,-Up.x,-Up.y,-Up.z,d+.3,Ut.queryCamera,t.exclude);p&&(f=Math.max(.35,p.distance-.3)),this.boom=f<this.boom?f:H(this.boom,f,6,e);let m=this.camera;m.position.set(c-Up.x*this.boom,l-Up.y*this.boom,u-Up.z*this.boom),this.trauma=Math.max(0,this.trauma-e*1.6);let h=this.trauma*this.trauma,g=this.time,_=(Math.sin(g*37.1)+Math.sin(g*61.7+1.3))*.5*h,v=(Math.sin(g*43.3+2.1)+Math.sin(g*57.9))*.5*h;m.rotation.set(a+v*.035,i+_*.035,_*.02,`YXZ`);let y=G(this.baseFov+t.fovKick,this.baseFov*(t.zoom??.74),t.aim);this.fov=H(this.fov,y,10,e),Math.abs(m.fov-this.fov)>.01&&(m.fov=this.fov,m.updateProjectionMatrix()),this.forward.copy(Up);let b=this.boom+.2,x=m.position.x+Up.x*b,S=m.position.y+Up.y*b,C=m.position.z+Up.z*b,w=this.physics.raycast(x,S,C,Up.x,Up.y,Up.z,420,Ut.queryBullet,t.exclude);this.aimDistance=w?w.distance+b:420,this.aimPoint.set(m.position.x+Up.x*this.aimDistance,m.position.y+Up.y*this.aimDistance,m.position.z+Up.z*this.aimDistance)}},Kp=new f,qp=new f,Jp=new f;function Yp(e,t,n,r,i,a,o,s,c,l){let u=e.root.matrixWorld;Kp.set(i,a,o).applyMatrix4(u),qp.set(s,c,l).transformDirection(u),yo(t,n,r,Kp,qp,1)}var Xp=(e,t,n)=>e+(t-e)*n;function Zp(e,t){let n=e.b,r=t.dive,i=t.time,a=e.root.matrixWorld;Jp.set(-1,0,0).transformDirection(a);let o=Xp(.16,.03,r);_o(n.spine1,Jp,o),_o(n.spine2,Jp,o),_o(n.spine3,Jp,o*.8),_o(n.neck,Jp,Xp(.3,.1,r)),_o(n.head,Jp,Xp(.42,.14,r));let s=Math.sin(i*9.3)*.022,c=Math.sin(i*11.1+1.7)*.022,l=Math.sin(i*7.7+.6)*.03,u=Math.sin(i*8.9+2.9)*.03,d=t.steer*.12,f=Xp(.52,.34,r),p=Xp(1.66,.98,r),m=Xp(.2,-.04,r);Yp(e,n.upperArmL,n.forearmL,n.handL,f,p+s,m+d,1,Xp(-.3,.2,r),Xp(.1,-.6,r)),Yp(e,n.upperArmR,n.forearmR,n.handR,-f,p+c,m-d,-1,Xp(-.3,.2,r),Xp(.1,-.6,r));let h=Xp(.25,.13,r),g=Xp(.4,.1,r),_=Xp(-.48,-.1,r);Yp(e,n.thighL,n.shinL,n.footL,h,g,_+l,.25,-.2,1),Yp(e,n.thighR,n.shinR,n.footR,-h,g,_+u,-.25,-.2,1)}function Qp(e,t){let n=e.b,r=e.root.matrixWorld;Jp.set(-1,0,0).transformDirection(r),_o(n.spine2,Jp,.06),_o(n.head,Jp,-.1);let i=Math.sin(t.time*1.3)*.02,a=Math.min(1,t.brake+Math.max(0,t.steer)),o=Math.min(1,t.brake+Math.max(0,-t.steer));Yp(e,n.upperArmL,n.forearmL,n.handL,.43,1.68-a*.4,.2+i,1,-.5,-.2),Yp(e,n.upperArmR,n.forearmR,n.handR,-.43,1.68-o*.4,.2-i,-1,-.5,-.2);let s=t.swing*.16+Math.sin(t.time*1.1)*.025;Yp(e,n.thighL,n.shinL,n.footL,.13,.13,.2-s,.1,0,1),Yp(e,n.thighR,n.shinR,n.footR,-.13,.11,.24-s,-.1,0,1)}var $p=900,em=600,tm=.95,nm=15,rm={sink:52,pull:15,speed:21,accel:15},im={sink:68,pull:18,speed:30,accel:15},am={sink:44,pull:15,speed:12,accel:15},om={sink:6.2,pull:40,speed:11.5,accel:7},sm={sink:8.6,pull:40,speed:15,accel:7},cm={sink:4.3,pull:40,speed:5.5,accel:7},lm=new f(1,0,0),um=new f(0,1,0),dm=new f(0,0,1),fm=new Ot,pm=new Ot,mm=new f,hm={x:0,z:0};function gm(e,t,n,r,i){let a=new s(e,t);return a.position.set(n,r,i),a.castShadow=!0,a}function _m(e,t=18){let n=new ye(e.map(([e,t])=>new h(t,e)),t);return n.rotateX(-Math.PI/2),n}function vm(){let e=new Je;e.name=`seaplane`;let t=new S({color:14209732,roughness:.78,metalness:0}),n=new S({color:1419168,roughness:.6,metalness:0}),r=new S({color:16740178,roughness:.5}),i=new S({color:1056812,roughness:.08,metalness:.6}),a=new S({color:2304560,roughness:.6}),o=gm(_m([[-4.7,.05],[-4.2,.2],[-3,.36],[-1.5,.58],[0,.74],[1.3,.76],[2.15,.66]]),t,0,0,0);o.scale.set(.9,1.08,1),e.add(o);let c=gm(_m([[2.15,.66],[2.9,.58],[3.3,.46],[3.42,.3]]),n,0,0,0);c.scale.set(.9,1.08,1),e.add(c),e.add(gm(_m([[3.42,.2],[3.62,.14],[3.78,.02]],12),a,0,0,0));for(let t of[-1,1])e.add(gm(new U(.02,.12,5.6),r,t*.655,-.02,-.2)),e.add(gm(new U(.03,.36,1.9),i,t*.66,.42,-.75));e.add(gm(new U(1.12,.34,.06),i,0,.52,-1.95)),e.add(gm(new U(10.4,.15,1.72),t,0,.98,-.62));for(let t of[-1,1]){e.add(gm(new U(.75,.155,1.72),n,t*5.55,.98,-.62));let r=gm(new U(.07,.07,2.72),a,t*1.72,.1,-.5);r.rotation.set(Math.PI/2,0,t*1.02),e.add(r)}e.add(gm(new U(3.7,.08,.92),t,0,.22,4.1));let l=gm(new U(.09,1.4,1.15),n,0,.82,4.15);l.rotation.x=-.32,e.add(l);let u=_m([[-3.1,.04],[-2.4,.26],[-.6,.36],[1.6,.37],[2.7,.27],[3.3,.05]],12);for(let n of[-1,1]){let i=gm(u,t,n*1.42,-1.82,-.3);i.scale.set(1,.92,1),e.add(i),e.add(gm(new U(.42,.06,5.2),r,n*1.42,-2.13,-.3));for(let t of[-1.3,.9]){let r=gm(new U(.07,1.62,.12),a,n*1.02,-1,t);r.rotation.z=n*-.46,e.add(r)}}e.add(gm(new U(2.84,.06,.1),a,0,-1.56,-1.3)),e.add(gm(new U(2.84,.06,.1),a,0,-1.56,.9));let d=new Je;d.position.set(0,0,-3.56);let f=new U(.17,2.2,.04);d.add(new s(f,a));let p=new s(new ne(1.1,24),new De({color:10135469,transparent:!0,opacity:.16,depthWrite:!1,side:2}));return d.add(p),e.add(d),{group:e,prop:d}}var ym=class{group=new Je;wing;lines;fabric;cord;constructor(e,t){let n=[],r=[],i=new K(16183782),a=(e,t,n,r)=>{let i=e*.6,a=.34*Math.sqrt(Math.max(0,t))*(1-t)*2.2,o=5+(n?a:-a*.25);return r.set(Math.sin(i)*o,Math.cos(i)*o-5+5.1,(t-.36)*2.5)},o=[new f,new f,new f,new f];for(let s=0;s<9;s++){let c=s/9*2-1,l=(s+1)/9*2-1,u=s===0||s===8?t:s%2==0?e:i;for(let e of[!0,!1])for(let t=0;t<5;t++){let i=t/5,s=(t+1)/5;a(c,i,e,o[0]),a(l,i,e,o[1]),a(l,s,e,o[2]),a(c,s,e,o[3]);for(let t of[0,1,2,0,2,3]){n.push(o[t].x,o[t].y,o[t].z);let i=e?1:.72;r.push(u.r*i,u.g*i,u.b*i)}}}let c=new se;c.setAttribute(`position`,new N(new Float32Array(n),3)),c.setAttribute(`color`,new N(new Float32Array(r),3)),c.computeVertexNormals(),this.fabric=new S({vertexColors:!0,roughness:.82,side:2,transparent:!0}),this.wing=new s(c,this.fabric),this.wing.castShadow=!0,this.wing.frustumCulled=!1,this.group.add(this.wing);let l=[];for(let e=0;e<=9;e+=1){let t=e/9*2-1;for(let e of[.08,.62]){a(t,e,!1,o[0]);let n=t<-.01?-1:+(t>.01);for(let t of n===0?[-1,1]:[n])l.push(o[0].x,o[0].y,o[0].z,t*.24,.12,e<.3?-.05:.06)}}let u=new se;u.setAttribute(`position`,new N(new Float32Array(l),3)),this.cord=new xe({color:1843752,transparent:!0,opacity:.75}),this.lines=new p(u,this.cord),this.lines.frustumCulled=!1,this.group.add(this.lines)}setOpen(e){let t=at(e),n=1+2.2*(t-1)**3+1.2*(t-1)**2,r=W(n,.06,1.08);this.group.scale.set(G(.1,1,r),G(.55,1,t),G(.25,1,r))}setFade(e){this.fabric.opacity=e,this.cord.opacity=.75*e}dispose(){this.group.removeFromParent(),this.wing.geometry.dispose(),this.lines.geometry.dispose(),this.fabric.dispose(),this.cord.dispose()}},bm=class{game;plane;prop;flying=!1;doorOpen=!1;travelled=0;start=new f;dir=new f(0,0,-1);planePos=new f;planePrev=new f;yaw=0;riders=[];jumpers=new Map;spent=[];subject;subjectPos=new f;time=0;constructor(e){this.game=e;let t=vm();this.plane=t.group,this.prop=t.prop,this.plane.visible=!1,e.engine.scene.add(this.plane),this.subject={position:this.subjectPos,height:2.2,distance:17,shoulder:0,aim:0,fovKick:0,followRate:40}}begin(e,t){this.clear();let n=new Bt(t^24301),r=n.range(0,Math.PI*2),i=n.range(-150,110),a=n.range(-150,150);this.dir.set(Math.cos(r),0,Math.sin(r)),this.start.set(i-this.dir.x*$p,st.planeAltitude,a-this.dir.z*$p),this.yaw=Qt(this.dir.x,this.dir.z),this.travelled=0,this.flying=!0,this.doorOpen=!1,this.planePos.copy(this.start),this.planePrev.copy(this.start),this.plane.visible=!0;let o=this.game.world.layout.pois;for(let t of e){t.vehicle?.exit(t),t.state=`plane`,t.rig.root.visible=!1,t.motor.setEnabled(!1),t.motor.velocity.set(0,0,0),t.motor.teleport(this.start.x,this.start.y,this.start.z),t.visual.copy(this.start),t.facing=this.yaw,t.input.jump=!1;let e=null,r=1/0;if(!t.isPlayer&&o.length>0){e=new f;let t=!1;for(let r=0;r<14;r++){let r=o[n.int(0,o.length-1)],i=r.r*.75*Math.sqrt(n.next()),a=n.range(0,Math.PI*2),s=r.x+Math.cos(a)*i,c=r.z+Math.sin(a)*i,l=Math.abs((s-this.start.x)*this.dir.z-(c-this.start.z)*this.dir.x),u=(s-this.start.x)*this.dir.x+(c-this.start.z)*this.dir.z-90,d=this.start.x+this.dir.x*u,f=this.start.z+this.dir.z*u;if(l>=290||Math.abs(d)>=570||Math.abs(f)>=570){t||e.set(s,0,c);continue}e.set(s,0,c),t=!0;let p=!1;for(let e of this.riders)e.target&&Math.hypot(e.target.x-s,e.target.z-c)<70&&(p=!0);if(!p)break}this.game.nav.nearestOpen(e.x,e.z,7,120,hm)&&e.set(hm.x,0,hm.z),r=(e.x-this.start.x)*this.dir.x+(e.z-this.start.z)*this.dir.z-n.range(20,160)}this.riders.push({c:t,jumpAt:r,target:e})}this.frame(0,1)}has(e){return e.state===`plane`||this.jumpers.has(e)}altitude(e){let t=e.motor.position,n=this.game.physics.groundHeight(t.x,t.y+.6,t.z,600,-100);return t.y-Math.max(n,this.game.env.waterHeight(t.x,t.z))}jump(e){let t=this.riders.findIndex(t=>t.c===e);if(t<0||!this.doorOpen)return!1;let n=this.riders[t];this.riders.splice(t,1);let r=this.planePos,i=this.riders.length%2==0?1:-1,a=r.x+this.dir.z*-i*1.6,o=r.z+this.dir.x*i*1.6;return this.launch(e,a,r.y-2.6,o,n.target),e.motor.velocity.set(this.dir.x*st.planeSpeed*.5,-3,this.dir.z*st.planeSpeed*.5),!0}skydive(e,t,n,r){this.release(e),e.vehicle?.exit(e),this.launch(e,t,n,r,null)}launch(e,t,n,r,i){let a={dive:0,steer:0,time:this.time+e.id*1.7},o={steer:0,brake:0,swing:0,time:this.time+e.id*2.3},s={c:e,canopy:null,air:0,open:0,glide:{...rm},sky:a,hang:o,pitch:1.2,bank:0,target:i,settled:0,lastSpeed:0};this.jumpers.set(e,s),e.state=`freefall`,e.rig.root.visible=!0,e.motor.setEnabled(!0),e.motor.teleport(t,n,r),e.motor.glide=s.glide,e.visual.set(t,n,r),e.input.jump=!1,e.anim.poseClip=`Jump_Loop`,e.anim.rootQuat=e.seatQuat,e.anim.poseFn=t=>{e.state===`chute`?Qp(t,s.hang):Zp(t,s.sky)},this.orient(s),e.anim.reset()}deploy(e){let t=this.jumpers.get(e);if(!t||e.state!==`freefall`)return!1;e.state=`chute`,t.open=0;let n=e.rig.outfit;return t.canopy=new ym(n.shirt,n.accent),t.canopy.setOpen(0),this.game.engine.scene.add(t.canopy.group),this.game.sound(`chute_open`,e.motor.position),!0}release(e){let t=this.riders.findIndex(t=>t.c===e);t>=0&&this.riders.splice(t,1);let n=this.jumpers.get(e);n&&(this.jumpers.delete(e),n.canopy&&this.spent.push({canopy:n.canopy,age:0,fall:0})),(e.state===`plane`||e.state===`freefall`||e.state===`chute`)&&(e.state=`normal`),e.rig.root.visible=!0,e.motor.glide=null,e.motor.setEnabled(!0),e.anim.poseFn=null,e.anim.poseClip=null,e.anim.rootQuat=null,e.anim.rootOffset.set(0,0,0),e.isPlayer&&this.game.controller&&(this.game.controller.subjectOverride=null,this.game.controller.promptOverride=``)}clear(){for(;this.riders.length>0;)this.release(this.riders[0].c);for(let e of this.jumpers.values())this.release(e.c);for(let e of this.spent)e.canopy.dispose();this.spent.length=0,this.flying=!1,this.doorOpen=!1,this.plane.visible=!1}fixedUpdate(e){if(this.time+=e,this.flying){this.planePrev.copy(this.planePos),this.travelled+=st.planeSpeed*e,this.planePos.copy(this.start).addScaledVector(this.dir,this.travelled);let t=this.planePos,n=Math.abs(t.x)<em&&Math.abs(t.z)<em,r=this.travelled>$p;this.doorOpen=n;for(let e=this.riders.length-1;e>=0;e--){let i=this.riders[e],a=i.c;a.motor.place(t.x,t.y,t.z),a.visual.copy(t),a.facing=this.yaw;let o=a.input.jump||this.travelled>=i.jumpAt;a.input.jump=!1,(n?o:r)&&(this.doorOpen=!0,this.jump(a))}this.doorOpen=n,this.travelled>$p*2&&(this.flying=!1,this.plane.visible=!1)}for(let t of this.jumpers.values()){let n=t.c,r=n.motor;t.air+=e;let i=n.input;t.target&&this.autopilot(t);let a=-Math.sin(n.facing),o=-Math.cos(n.facing),s=i.moveX*a+i.moveZ*o,c=this.altitude(n);if(n.state===`freefall`){let e=s>.5?im:s<-.5?am:rm;Object.assign(t.glide,e),(i.jump&&t.air>.5||c<Math.max(st.autoDeployHeight,-r.velocity.y*1.7))&&this.deploy(n)}else{t.open=Math.min(1,t.open+e/.9);let n=s>.5?sm:s<-.5?cm:om;Object.assign(t.glide,n),t.glide.pull=G(6,n.pull,t.open*t.open),t.glide.speed=G(r.speed,n.speed,t.open)}i.jump=!1}}autopilot(e){let t=e.c,n=t.motor.position,r=t.motor.velocity,i=e.target,a=t.state===`chute`,o=Math.hypot(r.x,r.z)/(2*(a?om.accel:rm.accel)),s=n.x+r.x*o,c=n.z+r.z*o,l=this.altitude(t);if(a&&e.air>e.settled&&(e.settled=e.air+1,Math.hypot(i.x-s,i.z-c)>l*1.5+4)){let e=this.game.nav,t=l*1.4+8;(e.nearestOpen(s,c,6,t,hm)||e.nearestOpen(s,c,2.5,t,hm))&&i.set(hm.x,0,hm.z)}let u=i.x-s,d=i.z-c,f=Math.hypot(u,d),p=t.input;if(f>.5){let e=Math.min(1,f/5)/f;p.moveX=u*e,p.moveZ=d*e}else p.moveX=0,p.moveZ=0;let m=i.x-n.x,h=i.z-n.z,g=Math.hypot(m,h);if(g>6&&(t.aimYaw=Qt(m,h)),!a&&e.air>.8){let e=(g-25)/1.7;l<Math.min(260,Math.max(e,135+t.id%5*11))&&(p.jump=!0)}}postPhysics(e){for(let e of this.jumpers.values()){let t=e.c,n=t.motor;if(!n.grounded&&!n.swimming)continue;let r=Math.max(n.landed,n.swimming?0:-n.velocity.y);this.release(t),t.anim.land(Math.max(3,r)),r>nm&&!n.swimming&&this.game.hurt(t,(r-nm)*4,{by:null,cause:`fall`}),this.game.sound(n.swimming?`splash`:`land`,n.position),this.game.events.emit(`landed`,{who:t,water:n.swimming})}}orient(e){let t=e.c;fm.setFromAxisAngle(um,t.facing),fm.multiply(pm.setFromAxisAngle(dm,e.bank)),fm.multiply(pm.setFromAxisAngle(lm,-e.pitch)),t.seatQuat.copy(fm),mm.set(0,tm,0).applyQuaternion(fm),t.anim.rootOffset.set(-mm.x,tm-mm.y,-mm.z)}frameUpdate(e,t){this.frame(e,t)}frame(e,t){let n=this.game;if(this.flying){let n=this.plane;n.position.lerpVectors(this.planePrev,this.planePos,t);let r=this.time;n.position.y+=Math.sin(r*.7)*.5,n.rotation.set(Math.sin(r*.5)*.02,this.yaw,Math.sin(r*.43)*.05,`YXZ`),this.prop.rotation.z+=e*46}for(let t of this.jumpers.values()){let n=t.c,r=n.motor,i=n.input,a=-Math.sin(n.facing),o=-Math.cos(n.facing),s=i.moveX*a+i.moveZ*o,c=-(i.moveX*-o+i.moveZ*a);if(n.state===`freefall`){t.sky.time+=e,t.sky.dive=H(t.sky.dive,at(s),3.5,e),t.sky.steer=H(t.sky.steer,c,5,e);let n=1.36+.5*t.sky.dive-.22*at(-s);t.pitch=H(t.pitch,n,4,e),t.bank=H(t.bank,c*.42,4,e)}else{t.hang.time+=e,t.hang.steer=H(t.hang.steer,c,5,e),t.hang.brake=H(t.hang.brake,at(-s),5,e);let n=r.speed,i=e>0?(n-t.lastSpeed)/e:0;t.lastSpeed=n,t.hang.swing=H(t.hang.swing,W(i/9,-1,1),3,e);let a=.05+Math.sin(t.hang.time*1.15)*.035+t.hang.swing*.12;t.pitch=H(t.pitch,a,G(2.4,6,t.open),e),t.bank=H(t.bank,c*.3+Math.sin(t.hang.time*.9)*.03,3,e)}if(this.orient(t),t.canopy){let e=t.canopy.group;mm.set(0,.5,0).applyQuaternion(n.seatQuat),e.position.set(n.visual.x+mm.x,n.visual.y+tm+mm.y,n.visual.z+mm.z),fm.setFromAxisAngle(um,n.facing),fm.multiply(pm.setFromAxisAngle(dm,t.bank*.55)),fm.multiply(pm.setFromAxisAngle(lm,-.12-t.hang.brake*.14)),e.quaternion.copy(fm),t.canopy.setOpen(t.open)}}for(let t=this.spent.length-1;t>=0;t--){let n=this.spent[t];n.age+=e,n.fall+=e*3.2;let r=n.canopy.group;r.position.y-=n.fall*e,r.rotation.x-=e*.9,r.scale.y=Math.max(.2,r.scale.y-e*.5),n.canopy.setFade(at(1-n.age/1.6)),n.age>1.6&&(n.canopy.dispose(),this.spent.splice(t,1))}let r=n.player,i=n.controller;if(r&&i){if(r.state===`plane`)this.subjectPos.copy(this.plane.position),this.subject.height=2.2,this.subject.distance=17,this.subject.fovKick=0,i.subjectOverride=this.subject,i.promptOverride=this.doorOpen?`Jump`:``;else if(this.jumpers.has(r)){let t=this.jumpers.get(r),n=r.state===`freefall`;this.subjectPos.copy(r.visual),this.subject.height=H(this.subject.height,n?1:2.3,3,e),this.subject.distance=H(this.subject.distance,n?7:10.5,n?5:2.5,e),this.subject.fovKick=H(this.subject.fovKick,n?6+8*t.sky.dive:0,3,e),i.subjectOverride=this.subject,i.promptOverride=n?`Open parachute`:``}}}dispose(){this.clear(),this.plane.removeFromParent()}},xm=4,Sm=class{game;combatants=[];round=0;running=!1;time=0;alive=0;feed=[];result=null;places=new Map;playerDiedAt=-1;aftermath=0;constructor(e){this.game=e,e.events.on(`kill`,({victim:t,info:n})=>{if(!this.running||!this.combatants.includes(t))return;let r=0;for(let e of this.combatants)e.alive&&r++;this.alive=r,this.places.set(t,r+1);let i=e.player;t===i&&(this.playerDiedAt=this.time),this.feed.push({at:this.time,killer:n.by&&n.by!==t?n.by.name:null,victim:t.name,cause:n.cause,weapon:n.weapon??null,headshot:n.headshot===!0,mine:t===i||n.by===i&&i!==null,left:r}),this.feed.length>40&&this.feed.shift(),r<=1&&this.finish()})}start(){let e=this.game,t=e.ensurePlayer();this.round++,this.running=!0,this.time=0,this.result=null,this.aftermath=0,this.playerDiedAt=-1,this.feed.length=0,this.places.clear(),this.combatants.length=0,this.combatants.push(t,...e.bots.characters),this.alive=this.combatants.length;let n=e.options.seed+this.round*7919;for(let t of this.combatants)t.alive=!0,t.health=t.maxHealth,t.armor=0,t.sinceHurt=99,t.sinceHurtBy=99,t.cash=t.isPlayer?300:0,e.combat.reset(t);e.combat.clear(),e.fx.clear(),e.loot.reset(n),e.zone.begin(n),e.bots.begin(n),e.drop.begin(this.combatants,n),e.camera.yaw=t.facing+.5,e.camera.pitch=-.42,e.camera.snap(),e.cameraOverride=!1,e.input.setWantLock(!0),e.setPhase(`match`)}stop(){this.running=!1,this.result=null,this.aftermath=0,this.game.drop.clear(),this.game.zone?.clear(),this.game.bots?.parkAll()}finish(){let e=this.game,t=e.player;this.running=!1;let n=null;for(let e of this.combatants)e.alive&&(n=e);n&&this.places.set(n,1);let r=n!==null&&n===t;this.result={winner:n,winnerName:n?n.name:`Nobody`,won:r,place:t?this.places.get(t)??1:0,total:this.combatants.length,kills:t?t.kills:0,time:this.time,survived:this.playerDiedAt>=0?this.playerDiedAt:this.time},this.aftermath=xm,e.sound(r?`win`:`lose`),e.events.emit(`over`,this.result)}fixedUpdate(e){this.running?this.time+=e:this.aftermath>0&&(this.aftermath-=e,this.aftermath<=0&&this.game.setPhase(`ended`))}get stage(){let e=this.game.player;return!e||!this.running&&!this.result?`none`:!e.alive||this.result?`over`:e.state===`plane`?`aboard`:e.state===`freefall`?`falling`:e.state===`chute`?`canopy`:`ground`}},Cm=new f,wm=new f,Tm=class{items=[];add(e){return this.items.push(e),e}remove(e){let t=this.items.indexOf(e);t>=0&&this.items.splice(t,1)}find(e,t){Cm.copy(e.position),Cm.y+=1;let n=null,r=-1/0;for(let i of this.items){wm.subVectors(i.position,Cm);let a=wm.length();if(a>i.radius||i.available&&!i.available(e))continue;let o=(i.priority??0)*100-a;t&&a>.4&&(o+=wm.dot(t)/a*2.5),o>r&&(r=o,n=i)}return n}labelOf(e,t){return typeof e.label==`string`?e.label:e.label(t)}},Em={x:0,y:0},Dm=class{character;input;camera;settings;interactions;aim=0;shoulderSide=1;crouchToggle=!1;locked=!1;target=null;subjectOverride=null;promptOverride=``;foot;sprintKick=0;constructor(e,t,n,r,i){this.character=e,this.input=t,this.camera=n,this.settings=r,this.interactions=i,this.foot={position:e.visual,height:1.55,distance:3.3,shoulder:.55,aim:0,fovKick:0}}get subject(){return this.subjectOverride?this.subjectOverride:this.character.vehicle?this.character.vehicle.cameraSubject:this.foot}get prompt(){return this.promptOverride?this.promptOverride:this.character.vehicle?`Get out`:this.character.state===`seated`?`Stand up`:this.target?this.interactions.labelOf(this.target,this.character):``}interact(){let e=this.character;if(!e.alive||this.locked)return!1;if(e.vehicle)return e.vehicle.exit(e),!0;if(e.state===`seated`)return e.rise(),!0;if(e.state!==`normal`)return!1;let t=this.target??this.interactions.find(e,this.camera.forward);return t?(t.use(e),this.target=null,!0):!1}frameUpdate(e,t){let n=this.input;n.consumeLook(Em);let r=this.settings.data;this.camera.look(Em.x,Em.y,r.sensitivity,r.invertY),n.pressedThisFrame(`KeyV`)&&(this.shoulderSide=-this.shoulderSide),this.aim=H(this.aim,+!!t,14,e);let i=this.character,a=i.motor,o=a.speed>5.6&&a.grounded;this.sprintKick=H(this.sprintKick,o?7:a.mode===`slide`?10:0,6,e);let s=this.foot;s.height=H(s.height,a.swimming?1.25:a.crouched?1.12:1.56,10,e),s.distance=3.3,s.shoulder=.55*this.shoulderSide*(1-.25*this.aim),s.aim=i.vehicle?0:i.aiming,s.zoom=i.loadout.weapon?.zoom,s.fovKick=this.sprintKick,i.aimYaw=this.camera.yaw,i.aimPitch=this.camera.pitch,i.aimPoint.copy(this.camera.aimPoint)}fixedUpdate(){let e=this.input,t=this.character,n=t.input,r=t.act;if(r.fire=!1,r.aim=!1,this.locked||!t.alive){n.moveX=0,n.moveZ=0,n.sprint=!1,n.jump=!1,this.target=null;return}let i=t.vehicle;if(i){if(this.target=null,this.crouchToggle=!1,i.driver===t){let t=i.controls;t.throttle=e.axis(`KeyS`,`KeyW`)+e.axis(`ArrowDown`,`ArrowUp`),t.steer=e.axis(`KeyA`,`KeyD`)+e.axis(`ArrowLeft`,`ArrowRight`),t.handbrake=e.held(`Space`),t.brake=0,t.boost=e.held(`ShiftLeft`)}e.consumeWheel(),(e.pressed(`KeyE`)||e.pressed(`KeyF`))&&i.exit(t);return}if(t.state===`seated`){this.target=null,(e.pressed(`KeyE`)||e.pressed(`KeyF`)||e.pressed(`Space`)||e.axis(`KeyS`,`KeyW`)!==0||e.axis(`KeyA`,`KeyD`)!==0)&&t.rise();return}let a=e.axis(`KeyS`,`KeyW`)+e.axis(`ArrowDown`,`ArrowUp`),o=e.axis(`KeyA`,`KeyD`)+e.axis(`ArrowLeft`,`ArrowRight`),s=this.camera.yaw,c=Math.sin(s),l=Math.cos(s),u=-c*a+l*o,d=-l*a-c*o,f=Math.hypot(u,d);if(f>1&&(u/=f,d/=f),t.state===`plane`||t.state===`freefall`||t.state===`chute`){this.target=null,this.crouchToggle=!1,n.moveX=u,n.moveZ=d,n.sprint=!1,n.walk=!1,n.crouch=!1,(e.pressed(`Space`)||e.pressed(`KeyE`)||e.pressed(`KeyF`))&&(n.jump=!0);return}if(t.state!==`normal`){this.target=null;return}this.target=this.interactions.find(t,this.camera.forward),this.target&&(e.pressed(`KeyE`)||e.pressed(`KeyF`))&&this.interact();let p=a<0?.7:o!==0&&a===0?.88:1;n.moveX=u*p,n.moveZ=d*p,r.fire=e.held(`Mouse0`),r.aim=e.held(`Mouse2`),e.pressed(`KeyR`)&&(r.reload=!0),e.pressed(`KeyG`)&&(r.throw=!0),e.pressed(`KeyQ`)&&(r.use=ps(t)),e.pressed(`KeyX`)&&(r.use=ms(t));for(let t=0;t<eo.length;t++)e.pressed(`Digit${t+1}`)&&(r.slot=eo[t]);let m=e.consumeWheel();m!==0&&(r.cycle=m),n.sprint=e.held(`ShiftLeft`)&&a>0&&this.aim<.5&&!r.fire&&t.loadout.using===null,n.walk=e.held(`AltLeft`),e.pressed(`KeyC`)&&(this.crouchToggle=!this.crouchToggle),e.pressed(`Space`)&&this.crouchToggle&&(this.crouchToggle=!1),n.sprint&&this.crouchToggle&&t.motor.mode!==`slide`&&t.motor.speed<5.4&&(this.crouchToggle=!1),n.crouch=this.crouchToggle||e.held(`ControlLeft`),t.motor.mode===`slide`&&!n.crouch&&(this.crouchToggle=!1),e.pressed(`Space`)&&(n.jump=!0),t.strafe=!0}},Om=(e,t,n,r,i,a,o,s,c,l,u,d=.05)=>({layer:e,count:t,speed:n,focus:r,life:i,size:a,color:o,gain:s,alpha:c,gravity:l,drag:u,spawn:d}),km={dust:[Om(0,6,[.5,1.8],.35,[.5,1.1],[.25,.95],13351066,1,.32,.2,2.5,.15)],smoke:[Om(0,5,[.4,1.3],.5,[1.2,2.4],[.5,2.3],5988452,1,.38,-.9,1.2,.2)],spark:[Om(1,9,[3,9],.45,[.15,.45],[.06,.012],16760928,3.2,1,9,.5)],spray:[Om(0,8,[2,6],.55,[.4,.9],[.18,.55],15267064,1,.5,9,.6,.2)],splash:[Om(0,14,[3,8],.7,[.5,1],[.25,.85],15661307,1,.55,11,.5,.25),Om(0,5,[.5,1.6],0,[.8,1.4],[.5,1.7],16055290,1,.32,0,2,.3)],wake:[Om(0,3,[.2,.9],0,[1.2,2.2],[.6,2],15923963,1,.3,0,1.6,.35)],skid:[Om(0,3,[.3,1.1],.3,[.6,1.2],[.4,1.5],14211288,1,.28,-.5,1.4,.2)],muzzle:[Om(1,3,[4,11],.9,[.03,.06],[.3,.1],16767392,4,1,0,0),Om(0,1,[.6,1.4],.8,[.35,.6],[.12,.5],10132122,1,.2,-.6,2)],impact:[Om(0,5,[.8,2.6],.6,[.3,.7],[.1,.45],12169894,1,.5,2.5,2.2),Om(1,3,[2,6],.5,[.1,.28],[.04,.01],16764800,3,1,9,.5)],glass:[Om(0,10,[2,6],.5,[.4,.8],[.07,.03],14677759,1,.9,12,.3,.1)],blood:[Om(0,6,[1,3.6],.6,[.25,.5],[.1,.32],12071498,1,.7,6,1.5)],explosion:[Om(1,14,[2,7],.2,[.25,.6],[1.3,3.1],16752704,3,.9,-1,2.5,.5),Om(0,16,[1.5,5],.2,[1.5,3],[1.5,4.6],3947840,1,.5,-.9,1.6,.8),Om(1,24,[8,20],.15,[.3,.8],[.09,.02],16760944,3.5,1,9,.6,.3)],shell:[Om(0,1,[2,3.2],.9,[.5,.8],[.05,.05],14263361,1,1,12,.2,0)]},Am=Object.keys(km),jm=`
attribute vec4 aColor;
attribute float aSize;
uniform float uScale;
varying vec4 vColor;
varying float vFog;
uniform float uFogDensity;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = max(0.05, -mv.z);
  // Size is in metres: turn it into pixels at this distance.
  gl_PointSize = min(260.0, aSize * uScale / dist);
  vColor = aColor;
  vFog = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
}`,Mm=`
varying vec4 vColor;
varying float vFog;
uniform vec3 uFogColor;
uniform float uLight;
uniform float uGlow;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float a = smoothstep(1.0, 0.25, d) * vColor.a;
  if (a < 0.004) discard;
  // Smoke and dust are lit by the sky; fire lights itself.
  vec3 col = vColor.rgb * mix(uLight, 1.0, uGlow);
  col = mix(col, uFogColor * (1.0 - uGlow), vFog);
  gl_FragColor = vec4(col, a * (1.0 - vFog * uGlow));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,Nm=`
attribute vec3 iA;
attribute vec3 iB;
attribute vec4 iColor;
uniform vec3 uEye;
varying vec4 vColor;
varying vec2 vUv;
void main() {
  vec3 p = mix(iA, iB, uv.x);
  vec3 along = normalize(iB - iA + vec3(0.0, 1e-5, 0.0));
  vec3 side = normalize(cross(along, uEye - p));
  // Keep the streak at least about a pixel wide however far away it is.
  float w = max(0.03, distance(uEye, p) * 0.0016);
  p += side * (uv.y - 0.5) * w * 2.0;
  vColor = iColor;
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}`,Pm=`
varying vec4 vColor;
varying vec2 vUv;
void main() {
  float across = 1.0 - abs(vUv.y - 0.5) * 2.0;
  // Bright at the head, fading to nothing at the tail.
  float a = across * smoothstep(0.0, 0.55, vUv.x) * vColor.a;
  gl_FragColor = vec4(vColor.rgb * a, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`,Fm=class{capacity;points;material;pos;vel;life;span;size;tint;force;outPos;outColor;outSize;geometry=new se;next=0;alive=0;constructor(e,t){this.capacity=e,this.pos=new Float32Array(e*3),this.vel=new Float32Array(e*3),this.life=new Float32Array(e),this.span=new Float32Array(e),this.size=new Float32Array(e*2),this.tint=new Float32Array(e*4),this.force=new Float32Array(e*2),this.outPos=new Float32Array(e*3),this.outColor=new Float32Array(e*4),this.outSize=new Float32Array(e);let n=this.geometry;n.setAttribute(`position`,new N(this.outPos,3).setUsage(me)),n.setAttribute(`aColor`,new N(this.outColor,4).setUsage(me)),n.setAttribute(`aSize`,new N(this.outSize,1).setUsage(me)),n.setDrawRange(0,0),this.material=new Ve({vertexShader:jm,fragmentShader:Mm,uniforms:{uScale:{value:800},uFogColor:{value:new K(16777215)},uFogDensity:{value:5e-4},uLight:{value:1},uGlow:{value:+!!t}},transparent:!0,depthWrite:!1,blending:t?2:1}),this.points=new Lt(n,this.material),this.points.frustumCulled=!1,this.points.renderOrder=t?12:11,this.points.name=t?`fx-glow`:`fx-soft`}spawn(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m){let h=this.next;this.next=(h+1)%this.capacity;let g=h*3;this.pos[g]=e,this.pos[g+1]=t,this.pos[g+2]=n,this.vel[g]=r,this.vel[g+1]=i,this.vel[g+2]=a,this.life[h]=o,this.span[h]=o,this.size[h*2]=s,this.size[h*2+1]=c;let _=h*4;this.tint[_]=l,this.tint[_+1]=u,this.tint[_+2]=d,this.tint[_+3]=f,this.force[h*2]=p,this.force[h*2+1]=m}update(e){let{pos:t,vel:n,life:r,span:i,size:a,tint:o,force:s,outPos:c,outColor:l,outSize:u}=this,d=0;for(let f=0;f<this.capacity;f++){let p=r[f];if(p<=0||(p-=e,r[f]=p,p<=0))continue;let m=f*3,h=Math.max(0,1-s[f*2+1]*e);n[m]=n[m]*h,n[m+1]=(n[m+1]-s[f*2]*e)*h,n[m+2]=n[m+2]*h,t[m]=t[m]+n[m]*e,t[m+1]=t[m+1]+n[m+1]*e,t[m+2]=t[m+2]+n[m+2]*e;let g=1-p/i[f],_=d*3;c[_]=t[m],c[_+1]=t[m+1],c[_+2]=t[m+2];let v=f*4,y=d*4;l[y]=o[v],l[y+1]=o[v+1],l[y+2]=o[v+2],l[y+3]=o[v+3]*Math.min(1,g*12)*(1-g)*(1-g*.35),u[d]=a[f*2]+(a[f*2+1]-a[f*2])*g,d++}this.alive=d;let f=this.geometry;if(f.setDrawRange(0,d),d>0)for(let e of[`position`,`aColor`,`aSize`]){let t=f.getAttribute(e);t.clearUpdateRanges(),t.addUpdateRange(0,d*t.itemSize),t.needsUpdate=!0}}clear(){this.life.fill(0),this.alive=0,this.geometry.setDrawRange(0,0)}},Im=48,Lm=160,Rm=420,zm=14,Bm=new K,Vm=new an,Hm=new Ot,Um=new f,Wm=new f,Gm=new f,Km=new f(0,0,1);function qm(){let e=document.createElement(`canvas`);e.width=64,e.height=64;let t=e.getContext(`2d`),n=t.createRadialGradient(32,32,2,32,32,31);return n.addColorStop(0,`rgba(8,8,10,0.95)`),n.addColorStop(.35,`rgba(18,18,20,0.75)`),n.addColorStop(.7,`rgba(30,30,32,0.28)`),n.addColorStop(1,`rgba(30,30,32,0)`),t.fillStyle=n,t.fillRect(0,0,64,64),new _(e)}var Jm=class{counts;tracers=0;decals=0;daylight=1;soft=null;glow=null;camera=null;scene=null;canvas=null;streaks=[];streakMesh=null;streakA;streakB;streakColor;marks=null;nextMark=0;light=null;lightLife=0;seed=49734321;constructor(){this.counts=Object.fromEntries(Am.map(e=>[e,0]))}attach(e,t,n){this.scene=e,this.canvas=n,this.camera=t,this.soft=new Fm(2400,!1),this.glow=new Fm(1200,!0),e.add(this.soft.points,this.glow.points);let r=new Wt(1,1);r.translate(.5,.5,0);let i=new Nt;i.index=r.index,i.setAttribute(`position`,r.getAttribute(`position`)),i.setAttribute(`uv`,r.getAttribute(`uv`)),this.streakA=new nt(new Float32Array(144),3).setUsage(me),this.streakB=new nt(new Float32Array(144),3).setUsage(me),this.streakColor=new nt(new Float32Array(192),4).setUsage(me),i.setAttribute(`iA`,this.streakA),i.setAttribute(`iB`,this.streakB),i.setAttribute(`iColor`,this.streakColor),i.instanceCount=0;let a=new Ve({vertexShader:Nm,fragmentShader:Pm,uniforms:{uEye:{value:new f}},transparent:!0,depthWrite:!1,blending:2,side:2});this.streakMesh=new s(i,a),this.streakMesh.frustumCulled=!1,this.streakMesh.renderOrder=13,this.streakMesh.name=`fx-tracers`,e.add(this.streakMesh);for(let e=0;e<Im;e++)this.streaks.push({ax:0,ay:0,az:0,dx:0,dy:0,dz:1,length:0,travelled:0,r:1,g:1,b:1,live:!1});let o=new De({map:qm(),transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2});this.marks=new St(new Wt(1,1),o,Lm),this.marks.count=0,this.marks.frustumCulled=!1,this.marks.renderOrder=3,this.marks.name=`fx-marks`,e.add(this.marks),this.light=new wt(16763274,0,14,1.8),this.light.name=`fx-flash`,e.add(this.light)}random(){let e=this.seed;return e^=e<<13,e^=e>>>17,e^=e<<5,this.seed=e,(e>>>0)/4294967296}burst(e,t,n,r,i){this.counts[e]++;let a=this.soft,o=this.glow,s=this.camera;if(!a||!o||!s)return;let c=t-s.position.x,l=n-s.position.y,u=r-s.position.z,d=e===`explosion`?500:230;if(c*c+l*l+u*u>d*d)return;let f=i?.dx??0,p=i?.dy??1,m=i?.dz??0,h=Math.hypot(f,p,m);h>1e-5?(f/=h,p/=h,m/=h):(f=0,p=1,m=0);let g=i?.amount??1,_=km[e];for(let e=0;e<_.length;e++){let s=_[e],c=s.layer===1?o:a;Bm.setHex(e===0&&i?.color!==void 0?i.color:s.color);let l=Math.max(1,Math.round(s.count*g));for(let e=0;e<l;e++){let e=this.random()*2-1,i=this.random()*Math.PI*2,a=Math.sqrt(1-e*e),o=a*Math.cos(i)*(1-s.focus)+f*s.focus,l=e*(1-s.focus)+p*s.focus,u=a*Math.sin(i)*(1-s.focus)+m*s.focus,d=Math.hypot(o,l,u)||1,h=s.speed[0]+(s.speed[1]-s.speed[0])*this.random();o=o/d*h,l=l/d*h,u=u/d*h;let g=s.life[0]+(s.life[1]-s.life[0])*this.random(),_=.75+this.random()*.5,v=.85+this.random()*.3;c.spawn(t+(this.random()-.5)*2*s.spawn,n+(this.random()-.5)*2*s.spawn,r+(this.random()-.5)*2*s.spawn,o,l,u,g,s.size[0]*_,s.size[1]*_,Bm.r*s.gain*v,Bm.g*s.gain*v,Bm.b*s.gain*v,s.alpha,s.gravity,s.drag)}}e===`explosion`&&this.flash(t,n+.6,r,60)}tracer(e,t,n,r,i,a,o=16769704){if(this.tracers++,!this.streakMesh)return;let s=Math.hypot(r-e,i-t,a-n);if(s<1.5)return;let c=this.streaks.find(e=>!e.live);c||=this.streaks[this.tracers%Im],c.ax=e,c.ay=t,c.az=n,c.dx=(r-e)/s,c.dy=(i-t)/s,c.dz=(a-n)/s,c.length=s,c.travelled=Math.min(s,1.2),Bm.setHex(o),c.r=Bm.r*4,c.g=Bm.g*4,c.b=Bm.b*4,c.live=!0}decal(e,t,n,r,i,a,o=.16){this.decals++;let s=this.marks;if(!s)return;Um.set(r,i,a).normalize(),Hm.setFromUnitVectors(Km,Um),Wm.set(e,t,n).addScaledVector(Um,.012),Vm.compose(Wm,Hm,Gm.set(o,o,o));let c=this.nextMark;this.nextMark=(c+1)%Lm,s.setMatrixAt(c,Vm),s.count=Math.min(Lm,Math.max(s.count,c+1)),s.instanceMatrix.needsUpdate=!0}flash(e,t,n,r=14){let i=this.light;i&&(this.lightLife>0&&r<i.intensity||(i.position.set(e,t,n),i.intensity=r,i.distance=r>30?34:14,this.lightLife=r>30?.22:.06))}clear(){this.soft?.clear(),this.glow?.clear();for(let e of this.streaks)e.live=!1;this.marks&&(this.marks.count=0),this.nextMark=0,this.light&&(this.light.intensity=0)}get alive(){return(this.soft?.alive??0)+(this.glow?.alive??0)}frameUpdate(e){let t=this.soft,n=this.glow,r=this.camera;if(!t||!n||!r||!this.scene)return;t.update(e),n.update(e);let i=this.scene.fog,a=(this.canvas?.height??window.innerHeight)/(2*Math.tan(r.fov*Math.PI/180*.5));for(let e of[t,n]){let t=e.material.uniforms;t.uScale.value=a,t.uLight.value=.22+this.daylight*.78,i&&(t.uFogColor.value.copy(i.color),t.uFogDensity.value=i.density??0)}let o=0,s=this.streakA.array,c=this.streakB.array,l=this.streakColor.array;for(let t of this.streaks){if(!t.live)continue;t.travelled+=Rm*e;let n=Math.max(0,t.travelled-zm);if(n>=t.length){t.live=!1;continue}let r=Math.min(t.length,t.travelled);s[o*3]=t.ax+t.dx*n,s[o*3+1]=t.ay+t.dy*n,s[o*3+2]=t.az+t.dz*n,c[o*3]=t.ax+t.dx*r,c[o*3+1]=t.ay+t.dy*r,c[o*3+2]=t.az+t.dz*r,l[o*4]=t.r,l[o*4+1]=t.g,l[o*4+2]=t.b,l[o*4+3]=1,o++}let u=this.streakMesh;u.geometry.instanceCount=o,o>0&&(this.streakA.needsUpdate=!0,this.streakB.needsUpdate=!0,this.streakColor.needsUpdate=!0,u.material.uniforms.uEye.value.copy(r.position));let d=this.light;this.lightLife>0&&(this.lightLife-=e,this.lightLife<=0?d.intensity=0:d.intensity*=Math.exp(-e*26))}dispose(){for(let e of[this.soft?.points,this.glow?.points,this.streakMesh,this.marks,this.light])e?.removeFromParent()}},Ym=110,Xm=13,Zm=1.15,Qm=[[`pistol`,24],[`smg`,24],[`rifle`,22],[`shotgun`,20],[`sniper`,10]],$m=[[0,50],[1,30],[2,15],[3,5]],eh=[[0,66],[1,24],[2,8],[3,2]],th=[[`bandage`,30],[`cola`,24],[`medkit`,14],[`vest`,10],[`grenade`,22]],nh={ammo_light:15909198,ammo_medium:5155038,ammo_shells:15228234,ammo_heavy:10182117},rh=[1018531,13194810,12174530,13212220,12725866],ih=[5003834,2373706,8014380,3816e3,9056058],ah=new an,oh=new Ot,sh=new f,ch=new f,lh=new K,uh=new f(0,1,0),dh=new f(1,1,1);function fh(e,t,n){if(e===`cash`)return`$${t}`;let r=$a[e];return r.kind===`weapon`?n>0?`${r.name} (${xo[n].name})`:r.name:t>1?`${t} ${r.name}`:r.name}var ph=class e{game;weapons;containers=[];pickups=[];group=new Je;coolers;lids;duffels;slotOf=new Map;floor=[];nextId=1;tick=0;time=0;seed;parts={};rings=new Map;ringGeometry=new Re(.3,.42,28).rotateX(-Math.PI/2);constructor(e,t){this.game=e,this.weapons=t,this.seed=e.options.seed,this.group.name=`loot`,e.engine.scene.add(this.group),this.buildParts(),this.place(),this.reset(this.seed),e.events.on(`kill`,({victim:e})=>this.dropFrom(e))}static async create(t){return new e(t,await t.assets.loadModel(`models/weapons.glb`))}place(){let e=this.game,t=e.world.field,n=e.physics,r=new Bt(this.seed^1050389),i=[],a=(e,t)=>n.groundHeight(e,320,t,400,NaN),o=(e,n)=>{let o=t.typeAt(e,n);if(o===_s.Water||o===_s.Road||o===_s.Bridge||o===_s.Pool)return!1;let s=o===_s.Building;if(s&&!r.chance(.3))return!1;let c=a(e,n);if(!(c>.6))return!1;for(let[t,r]of[[.9,0],[-.9,0],[0,.9],[0,-.9]])if(!(Math.abs(a(e+t,n+r)-c)<.12))return!1;if(!s&&Math.abs(c-t.heightAt(e,n))>.6)return!1;for(let t of i)if(Math.hypot(t.x-e,t.z-n)<Xm&&Math.abs(t.y-c)<6)return!1;return i.push({x:e,y:c,z:n,roof:s,cell:o}),!0};for(let t of e.world.layout.pois){let e=0;for(let n=0;n<60&&e<5;n++){let n=r.range(0,Math.PI*2),i=Math.sqrt(r.next())*Math.min(t.r,90);o(t.x+Math.cos(n)*i,t.z+Math.sin(n)*i)&&e++}}for(let e=0;e<9e3&&i.length<180;e++)o(r.range(-600,600),r.range(-600,600));r.shuffle(i);let s=i.slice(0,Math.min(Ym,Math.round(i.length*.61)));this.floor=i.slice(s.length);let c=0,l=0;for(let e of s){let t=e.cell===_s.Sand||e.cell===_s.Pier||e.cell===_s.Plaza||e.cell===_s.Yard?`cooler`:`duffel`,i={id:this.containers.length,kind:t,x:e.x,y:e.y,z:e.z,yaw:r.range(0,Math.PI*2),roof:e.roof,opened:!1,use:null};this.containers.push(i),this.slotOf.set(i,t===`cooler`?c++:l++),n.addStaticBox(i.x,i.y+.2,i.z,t===`cooler`?.33:.36,.2,t===`cooler`?.22:.2,{kind:`prop`,surface:t===`cooler`?`metal`:`wood`},i.yaw,Dt(It.prop,It.character))}let u=new S({roughness:.55,metalness:.05}),d=new S({color:13226704,roughness:.5}),f=new S({roughness:.92});this.coolers=new St(this.parts.coolerBody.geometry,u,Math.max(1,c)),this.lids=new St(this.parts.coolerLid.geometry,d,Math.max(1,c)),this.duffels=new St(this.parts.duffel.geometry,f,Math.max(1,l)),this.coolers.count=c,this.lids.count=c,this.duffels.count=l;for(let e of[this.coolers,this.lids,this.duffels])e.castShadow=!0,e.receiveShadow=!0,this.group.add(e);let p=new Bt(this.seed^12583396);for(let e of this.containers){let t=this.slotOf.get(e);e.kind===`cooler`?this.coolers.setColorAt(t,lh.setHex(p.pick(rh))):this.duffels.setColorAt(t,lh.setHex(p.pick(ih)))}for(let e of this.containers)this.drawContainer(e);for(let e of[this.coolers,this.lids,this.duffels])e.instanceColor&&(e.instanceColor.needsUpdate=!0),e.computeBoundingSphere()}buildParts(){let e=(e,t=.6,n=0)=>new S({color:e,roughness:t,emissive:n,emissiveIntensity:n?.35:0}),t=e(16055290),n=(e,t,n)=>{this.parts[e]={geometry:t,material:n}};n(`coolerBody`,new U(.62,.34,.4).translate(0,.17,0),t),n(`coolerLid`,Ta([new U(.66,.07,.44).translate(0,.035,.22),new U(.3,.03,.05).translate(0,.085,.22)]),t),n(`duffel`,Ta([new E(.19,.42,6,14).rotateZ(Math.PI/2).scale(1,.82,1).translate(0,.16,0),new U(.05,.33,.4).translate(-.14,.165,0),new U(.05,.33,.4).translate(.14,.165,0),new U(.34,.035,.04).translate(0,.34,0)]),t);for(let[t,r]of Object.entries(nh))n(t,Ta([new U(.22,.11,.13).translate(0,.055,0),new U(.23,.03,.14).translate(0,.125,0)]),e(r,.5));n(`bandage`,new Oe(.07,.07,.11,16).rotateZ(Math.PI/2).translate(0,.07,0),e(16249834,.9)),n(`medkit`,new U(.3,.2,.12).translate(0,.1,0),e(16743001,.5)),n(`medkitCross`,Ta([new U(.12,.04,.125).translate(0,.1,0),new U(.04,.12,.125).translate(0,.1,0)]),t),n(`cola`,new Oe(.045,.045,.15,14).translate(0,.075,0),e(1685716,.3)),n(`colaBand`,new Oe(.047,.047,.05,14).translate(0,.08,0),e(16727435,.4)),n(`vest`,Ta([new U(.36,.4,.14).translate(0,.2,0),new U(.09,.12,.14).translate(-.12,.45,0),new U(.09,.12,.14).translate(.12,.45,0)]),e(2832968,.8)),n(`vestStrap`,new U(.37,.05,.15).translate(0,.2,0),e(3530952,.5,3530952)),n(`cash`,Ta([new U(.2,.03,.1).translate(0,.015,0),new U(.2,.03,.1).rotateY(.3).translate(.01,.047,.01),new U(.2,.03,.1).rotateY(-.2).translate(-.01,.079,0)]),e(5226347,.7))}drawContainer(e){let t=this.slotOf.get(e);if(oh.setFromAxisAngle(uh,e.yaw),e.kind===`cooler`){this.coolers.setMatrixAt(t,ah.compose(sh.set(e.x,e.y,e.z),oh,dh));let n=new an().makeTranslation(0,.34,-.22),r=new an().makeRotationX(e.opened?-1.9:0);this.lids.setMatrixAt(t,ah.compose(sh.set(e.x,e.y,e.z),oh,dh).multiply(n).multiply(r)),this.coolers.instanceMatrix.needsUpdate=!0,this.lids.instanceMatrix.needsUpdate=!0}else this.duffels.setMatrixAt(t,ah.compose(sh.set(e.x,e.y,e.z),oh,ch.set(1,e.opened?.5:1,e.opened?1.12:1))),this.duffels.instanceMatrix.needsUpdate=!0}reset(e){for(this.seed=e;this.pickups.length>0;)this.remove(this.pickups[0]);let t=this.game.interactions;for(let e of this.containers){if(e.opened=!1,!e.use){let n=e.kind===`cooler`?`Open cooler`:`Open duffel bag`;e.use=t.add({kind:`chest`,position:new f(e.x,e.y+.3,e.z),radius:2.3,label:n,available:()=>!e.opened,use:t=>this.open(e,t),ref:e})}this.drawContainer(e)}let n=new Bt(e^987149);for(let e of this.floor){let t=n.next();if(t<.45){let t=n.weighted(Qm),r=Math.min(So,n.weighted(eh)+ +!!e.roof);this.spawn(t,1,r,e.x-.3,e.y,e.z),this.spawn(Co[t].ammo,$a[Co[t].ammo].stack,0,e.x+.45,e.y,e.z+.2)}else if(t<.75){let t=Co[n.weighted(Qm)].ammo;this.spawn(t,$a[t].stack,0,e.x,e.y,e.z)}else{let t=n.weighted(th);this.spawn(t,$a[t].stack,0,e.x,e.y,e.z)}}}roll(e){let t=new Bt((this.seed^Math.imul(e.id+1,2654435761))>>>0),n=[],r=t.weighted(Qm),i=Co[r].ammo;if(n.push({item:r,count:1,tier:Math.min(So,t.weighted($m)+ +!!e.roof)}),n.push({item:i,count:$a[i].stack*t.int(1,2),tier:0}),t.chance(.7)){let e=t.weighted(th);n.push({item:e,count:$a[e].stack,tier:0})}if(t.chance(.5)){let e=Co[t.weighted(Qm)].ammo;e!==i&&n.push({item:e,count:$a[e].stack,tier:0})}return n.push({item:`cash`,count:t.int(5,18)*5,tier:0}),n}open(e,t){if(e.opened)return!1;e.opened=!0,this.drawContainer(e);let n=this.game;n.sound(`chest_open`,e),t?.anim.play(`Interact`,{layer:`upper`,speed:1.8,from:.15,fadeIn:.1,fadeOut:.25});let r=this.roll(e),i=t?t.position:e,a=t?Math.atan2(e.x-i.x,e.z-i.z):e.yaw;return r.forEach((n,o)=>{let s=a+(o-(r.length-1)/2)*.55,[c,l,u]=this.landing(i.x,i.y,i.z,Math.sin(s),Math.cos(s),t?.55+o%2*.3:1.05+o%2*.28),d=this.spawn(n.item,n.count,n.tier,c,l,u);d.age=0,d.fromX=e.x,d.fromY=e.y+.35,d.fromZ=e.z}),n.events.emit(`opened`,{container:e,by:t}),!0}landing(e,t,n,r,i,a){let o=this.game.physics,s=o.raycast(e,t+.45,n,r,0,i,a+.3),c=s?Math.max(.3,s.distance-.3):a,l=e+r*c,u=n+i*c,d=o.raycast(l,t+1.2,u,0,-1,0,4);return[l,d?d.point.y:t,u]}spawn(e,t,n,r,i,a){let o=this.build(e,n);o.position.set(r,i,a),this.group.add(o);let s={id:this.nextId++,item:e,count:t,tier:n,x:r,y:i,z:a,node:o,age:99,fromX:r,fromY:i,fromZ:a,phase:this.nextId*1.618%(Math.PI*2),use:null};return s.use=this.game.interactions.add({kind:`loot`,position:new f(r,i+.3,a),radius:2,priority:1,label:()=>`Pick up ${fh(s.item,s.count,s.tier)}`,available:e=>this.wants(e,s),use:e=>{this.take(e,s)},ref:s}),this.pickups.push(s),s}build(e,t){let n=new Je,r=new Je;r.name=`body`;let i=e=>{let t=this.parts[e],n=new s(t.geometry,t.material);n.castShadow=!0,r.add(n)},a=16055290;if(e===`cash`)i(`cash`),a=5226347;else{let n=$a[e];if(n.kind===`weapon`){let n=Co[e],i=this.weapons.scene.getObjectByName(n.model);if(i){let e=i.clone(!0);e.scale.setScalar(n.scale*1.15),e.rotation.set(0,0,Math.PI/2),e.position.y=.12,e.traverse(e=>{e.castShadow=!0}),r.add(e)}a=xo[t].color}else if(n.kind===`ammo`)i(e),a=nh[e];else if(e===`grenade`){let e=this.weapons.scene.getObjectByName(`grenade-a`);if(e){let t=e.clone(!0);t.scale.setScalar(.85),r.add(t)}a=16765286}else i(e),e===`medkit`&&i(`medkitCross`),e===`cola`&&i(`colaBand`),e===`vest`&&i(`vestStrap`),a=n.kind===`heal`?16743001:3530952}let o=this.rings.get(a);o||(o=new De({color:a,transparent:!0,opacity:.85,depthWrite:!1}),o.color.multiplyScalar(1.6),this.rings.set(a,o));let c=new s(this.ringGeometry,o);return c.position.y=.03,c.name=`ring`,n.add(r,c),n}wants(e,t){if(t.item===`cash`)return!0;let n=$a[t.item];if(n.kind===`weapon`){let n=e.loadout.held[t.item];return!n||n.tier<t.tier}return e.inventory.count(t.item)<n.max}take(e,t){if(!e.alive||!this.pickups.includes(t))return!1;let n=this.game;if(t.item===`cash`)return e.cash+=t.count,n.sound(`cash`,t,.7),n.events.emit(`cash`,{to:e,amount:t.count}),this.remove(t),!0;let r=n.grant(e,t.item,t.count,t.tier);return r<=0?!1:(n.sound(`pickup`,t,.8),t.count-=r,(t.count<=0||$a[t.item].kind===`weapon`)&&this.remove(t),!0)}remove(e){let t=this.pickups.indexOf(e);t>=0&&this.pickups.splice(t,1),this.game.interactions.remove(e.use),e.node.removeFromParent()}dropFrom(e){let t=[],n=e.loadout;for(let e of n.carried())t.push({item:e,count:1,tier:n.held[e].tier});for(let[n,r]of Object.entries(e.inventory.counts))r>0&&$a[n].kind!==`weapon`&&t.push({item:n,count:r,tier:0});e.cash>0&&t.push({item:`cash`,count:e.cash,tier:0});let r=Math.min(t.length,9);for(let n=0;n<r;n++){let i=t[n],a=n/r*Math.PI*2+e.facing,[o,s,c]=this.landing(e.position.x,e.position.y,e.position.z,Math.sin(a),Math.cos(a),.8+n%3*.3),l=this.spawn(i.item,i.count,i.tier,o,s,c);l.age=0,l.fromX=e.position.x,l.fromY=e.position.y+.9,l.fromZ=e.position.z}n.clear(),e.inventory.clear(),e.cash=0}nearestContainer(e,t,n=1/0,r){let i=null,a=n;for(let n of this.containers){if(n.opened||r!==void 0&&Math.abs(n.y-r)>3)continue;let o=Math.hypot(n.x-e,n.z-t);o<a&&(a=o,i=n)}return i}fixedUpdate(e){if(this.time+=e,++this.tick%6!=0)return;let t=this.pickups;if(t.length!==0)for(let e of this.game.characters){if(!e.alive||e.state!==`normal`)continue;let n=e.position.x,r=e.position.y,i=e.position.z;for(let a=t.length-1;a>=0;a--){let o=t[a],s=o.x-n,c=o.z-i;s*s+c*c>Zm*Zm||Math.abs(o.y-r)>1.4||o.age<.5||this.wants(e,o)&&this.take(e,o)}}}frameUpdate(e){let t=this.game.engine.camera.position,n=this.time;for(let r of this.pickups){let i=r.x-t.x,a=r.z-t.z,o=i*i+a*a<5625&&Math.abs(r.y-t.y)<60;if(r.node.visible=o,r.age+=e,!o)continue;let s=r.node.children[0];if(s.rotation.y=n*1.1+r.phase,r.age<.5){let e=r.age/.5,t=1-(1-e)*(1-e);r.node.position.set(r.fromX+(r.x-r.fromX)*t,r.fromY+(r.y-r.fromY)*t+Math.sin(e*Math.PI)*.55,r.fromZ+(r.z-r.fromZ)*t),s.position.y=.2}else r.node.position.set(r.x,r.y,r.z),s.position.y=.26+Math.sin(n*2.1+r.phase)*.045}}},mh=`"Futura", "Century Gothic", "Avenir Next", "Gill Sans", "Trebuchet MS", "DejaVu Sans", sans-serif`,hh=`"Brush Script MT", "Snell Roundhand", "Segoe Script", "URW Chancery L", cursive`,gh=class{size=2048;texture;material;canvas;ctx;x=2;y=2;rowH=0;cache=new Map;constructor(){this.canvas=document.createElement(`canvas`),this.canvas.width=this.size,this.canvas.height=this.size,this.ctx=this.canvas.getContext(`2d`),this.texture=new _(this.canvas),this.texture.colorSpace=Tt,this.texture.minFilter=ht,this.texture.magFilter=de,this.texture.anisotropy=4,this.material=new De({map:this.texture,vertexColors:!0,alphaTest:.32,toneMapped:!0})}alloc(e,t){if(this.x+e+2>this.size&&(this.x=2,this.y+=this.rowH+4,this.rowH=0),this.y+t+2>this.size)return[2,2];let n=[this.x,this.y];return this.x+=e+4,this.rowH=Math.max(this.rowH,t),n}slot(e,t,n,r){let i=this.size;return{uv:[e/i,1-(t+r)/i,(e+n)/i,1-t/i],aspect:n/r}}horizontal(e,t=`block`){let n=`h:${t}:${e}`,r=this.cache.get(n);if(r)return r;let i=this.ctx,a=t===`script`?`italic 600 61.92px ${hh}`:`800 57.6px ${mh}`;i.font=a;let o=t===`script`?e:e.toUpperCase(),s=t===`script`?0:5,c=0;for(let e of o)c+=i.measureText(e).width+s;c=Math.ceil(c+20);let[l,u]=this.alloc(c,72);i.font=a,i.textBaseline=`middle`,i.textAlign=`left`,i.fillStyle=`#ffffff`,i.strokeStyle=`#ffffff`,i.lineWidth=3.2,i.lineJoin=`round`;let d=l+10;for(let e of o)t===`outline`?i.strokeText(e,d,u+36+2):i.fillText(e,d,u+36+2),d+=i.measureText(e).width+s;t===`script`&&(i.lineWidth=4,i.beginPath(),i.moveTo(l+12,u+72-8),i.quadraticCurveTo(l+c/2,u+72-2,l+c-12,u+72-12),i.stroke()),this.texture.needsUpdate=!0;let f=this.slot(l,u,c,72);return this.cache.set(n,f),f}vertical(e){let t=`v:${e}`,n=this.cache.get(t);if(n)return n;let r=this.ctx,i=e.toUpperCase().replace(/\s+/g,` `),a=i.length*46+12,[o,s]=this.alloc(54,a);r.font=`800 42.32px ${mh}`,r.textBaseline=`middle`,r.textAlign=`center`,r.fillStyle=`#ffffff`;let c=0;for(let e of i)e!==` `&&r.fillText(e,o+27,s+6+c*46+23),c++;this.texture.needsUpdate=!0;let l=this.slot(o,s,54,a);return this.cache.set(t,l),l}solid(){let e=`solid`,t=this.cache.get(e);if(t)return t;let[n,r]=this.alloc(16,16);this.ctx.fillStyle=`#ffffff`,this.ctx.fillRect(n,r,16,16),this.texture.needsUpdate=!0;let i=this.size,a={uv:[(n+4)/i,1-(r+12)/i,(n+12)/i,1-(r+4)/i],aspect:1};return this.cache.set(e,a),a}};function _h(e){let t=document.createElement(`canvas`);return t.width=e,t.height=e,[t,t.getContext(`2d`)]}function vh(e,t=!0,n=8){let r=new _(e);return r.wrapS=L,r.wrapT=L,r.colorSpace=t?Tt:``,r.minFilter=ht,r.anisotropy=n,r.generateMipmaps=!0,r}function yh(e,t){let[n,r]=_h(e),i=r.createImageData(e,e),a=i.data;for(let n=0;n<e;n++)for(let r=0;r<e;r++){let[i,o,s]=t(r/e,n/e,r,n),c=(n*e+r)*4;a[c]=i,a[c+1]=o,a[c+2]=s,a[c+3]=255}return r.putImageData(i,0,0),n}function bh(e,t,n,r,i){let a=Ke(e*n,t*n,r,i),o=Ke((e-1)*n,t*n,r,i),s=Ke(e*n,(t-1)*n,r,i),c=Ke((e-1)*n,(t-1)*n,r,i),l=e*e*(3-2*e),u=t*t*(3-2*t);return(a*(1-l)+o*l)*(1-u)+(s*(1-l)+c*l)*u}function xh(e){return vh(yh(512,(e,t,n,r)=>{let i=bh(e,t,6,4,11),a=gt(n,r,3),o=bh(e,t,2,2,29),s=58+i*22+(a>.92?16:a<.06?-12:0)+(o-.5)*16;return s=Math.max(30,Math.min(110,s)),[s*.98,s,s*1.04]}),!0,e)}function Sh(e){return vh(yh(512,(e,t,n,r)=>{let i=bh(e,t,8,3,5),a=gt(n,r,9),o=Math.min(Math.abs(e*2%1-.5),1)*2,s=Math.min(Math.abs(t*2%1-.5),1)*2,c=o>.975||s>.975?-34:0,l=gt(Math.floor(e*2),Math.floor(t*2),7)*10-5,u=196+i*26+(a>.95?-18:0)+c+l;return[u*1,u*.975,u*.93]}),!0,e)}function Ch(e){return vh(yh(512,(e,t,n,r)=>{let i=(Math.floor(e*4)+Math.floor(t*4))%2==0,a=bh(e,t,10,3,13),o=gt(n>>1,r>>1,21),s=e*4%1,c=t*4%1,l=s<.02||c<.02?-26:0,u=i?[236,214,196]:[226,150,138],d=.9+a*.14+(o>.965?.12:o<.03?-.12:0);return[u[0]*d+l,u[1]*d+l,u[2]*d+l]}),!0,e)}function wh(e){return vh(yh(512,(e,t,n,r)=>{let i=bh(e,t,5,4,2),a=Math.sin((t+bh(e,t,3,2,8)*.12)*Math.PI*2*14)*.5+.5,o=gt(n,r,5),s=.9+i*.14+a*.035+(o-.5)*.06;return[240*s,222*s,180*s]}),!0,e)}function Th(e){return vh(yh(512,(e,t,n,r)=>{let i=bh(e,t,7,4,17),a=gt(n,r,23),o=.78+i*.34+(a-.5)*.16;return[88*o,164*o,86*o]}),!0,e)}function Eh(e){return vh(yh(512,(e,t,n)=>{let r=Math.floor(e*6),i=e*6%1,a=gt(r,1,31)*.22+.86,o=Kt(e*90,t*6+r*3.1,41)*.12,s=i<.035||i>.965?.55:1,c=Math.abs(t*2%1-.5)<.012&&Math.abs(i-.5)>.36?.7:1,l=(a-o)*s*c+gt(n,r,4)*.02;return[176*l,132*l,86*l]}),!0,e)}function Dh(e){return vh(yh(512,(e,t,n,r)=>{let i=bh(e,t,5,4,51),a=bh(e,t*.5,9,2,61)**2.2,o=gt(n,r,6),s=150+i*36-a*42*(1-t)+(o>.96?-14:0);return[s,s*.985,s*.95]}),!0,e)}function Oh(e){return vh(yh(256,(e,t,n,r)=>{let i=226+bh(e,t,9,4,71)*26+(gt(n,r,8)-.5)*8;return[i,i,i]}),!0,e)}function kh(e){return vh(yh(256,(e,t,n,r)=>{let i=150+bh(e,t,10,3,81)*40+(gt(n,r,2)-.5)*30;return[i*.98,i*.97,i*.94]}),!0,e)}function Ah(){let e=new Float32Array(65536);for(let t=0;t<256;t++)for(let n=0;n<256;n++)e[t*256+n]=bh(n/256,t/256,7,5,91)+.5*bh(n/256,t/256,19,3,97);let t=(t,n)=>e[(n+256)%256*256+(t+256)%256];return vh(yh(256,(e,n,r,i)=>{let a=(t(r+1,i)-t(r-1,i))*9,o=(t(r,i+1)-t(r,i-1))*9,s=Math.hypot(a,o,1);return[-a/s*127+128,-o/s*127+128,1/s*127+128]}),!1,4)}function jh(){let[e,t]=_h(64),n=t.createRadialGradient(32,32,0,32,32,32);n.addColorStop(0,`rgba(255,255,255,1)`),n.addColorStop(.25,`rgba(255,255,255,0.62)`),n.addColorStop(.6,`rgba(255,255,255,0.18)`),n.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=n,t.fillRect(0,0,64,64);let r=new _(e);return r.colorSpace=Tt,r}function Mh(){let[e,t]=_h(256);t.clearRect(0,0,256,256);let n=t.createLinearGradient(0,0,256,0);n.addColorStop(0,`#3f7d32`),n.addColorStop(.6,`#4c9a3c`),n.addColorStop(1,`#7fc24e`),t.strokeStyle=n,t.lineCap=`round`;for(let e=0;e<26;e++){let n=e/25,r=10+n*236,i=Math.sin(Math.min(1,n*1.25+.12)*Math.PI)*92+10;t.lineWidth=7-n*3;for(let e of[-1,1])t.beginPath(),t.moveTo(r,128),t.quadraticCurveTo(r+14,128+e*i*.55,r+26+n*8,128+e*i),t.stroke()}t.strokeStyle=`#2f5f27`,t.lineWidth=5,t.beginPath(),t.moveTo(0,128),t.lineTo(252,128),t.stroke();let r=new _(e);return r.colorSpace=Tt,r.anisotropy=4,r}function Nh(e,t){e.onBeforeCompile=e=>{e.uniforms.uNight=t.uNight,e.vertexShader=e.vertexShader.replace(`#include <common>`,`#include <common>
attribute vec4 aStyle;
varying vec4 vStyle;
varying vec2 vFacadeUv;`).replace(`#include <begin_vertex>`,`#include <begin_vertex>
vStyle = aStyle;
vFacadeUv = uv;`),e.fragmentShader=e.fragmentShader.replace(`#include <common>`,`#include <common>
        uniform float uNight;
        varying vec4 vStyle;
        varying vec2 vFacadeUv;
        float facadeHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float gWindow = 0.0;
        float gFrame = 0.0;
        float gLit = 0.0;`).replace(`#include <map_fragment>`,`#include <map_fragment>
        {
          vec2 cell = floor(vFacadeUv);
          vec2 f = fract(vFacadeUv);
          float aa = max(max(fwidth(vFacadeUv.x), fwidth(vFacadeUv.y)) * 1.2, 1e-4);
          float fade = 1.0 - smoothstep(0.25, 0.6, aa);
          float w = vStyle.x;
          float h = vStyle.y;
          float kind = vStyle.z;
          float inside = 0.0;
          float frame = 0.0;
          if (w > 0.001) {
            vec2 c = vec2(0.5, kind > 2.5 ? 0.46 : 0.54);
            if (kind > 0.5 && kind < 1.5) {
              float r = length((f - c) * vec2(1.0, 1.08)) / (w * 0.5);
              inside = 1.0 - smoothstep(1.0 - aa * 4.0, 1.0 + aa * 4.0, r);
              frame = (1.0 - smoothstep(1.16 - aa * 4.0, 1.16 + aa * 4.0, r)) - inside;
            } else {
              vec2 half_ = vec2(kind > 1.5 && kind < 2.5 ? 0.5 : w * 0.5, h * 0.5);
              vec2 d = abs(f - c) - half_;
              float sd = max(d.x, d.y);
              inside = 1.0 - smoothstep(-aa, aa, sd);
              frame = (1.0 - smoothstep(0.035 - aa, 0.035 + aa, sd)) - inside;
              // Mullions split a window into panes.
              float mx = kind > 2.5 ? 0.0 : abs(f.x - c.x);
              float my = abs(f.y - (c.y + h * 0.12));
              float bars = max(1.0 - smoothstep(0.008, 0.008 + aa, mx), kind > 2.5 ? 0.0 : 1.0 - smoothstep(0.008, 0.008 + aa, my));
              frame = max(frame, bars * inside * 0.9);
              inside *= 1.0 - bars * 0.9;
            }
          }
          inside *= fade;
          frame *= fade;
          float rnd = facadeHash(cell + vStyle.w);
          float lit = step(1.0 - (0.1 + uNight * 0.3), rnd) * inside;
          vec3 glass = mix(vec3(0.05, 0.11, 0.15), vec3(0.10, 0.22, 0.27), rnd);
          // Blinds on some windows.
          float blind = step(0.72, facadeHash(cell * 1.7 + 3.1 + vStyle.w)) * step(f.y, 0.54 + h * (0.1 + 0.3 * rnd)) * (kind > 2.5 ? 0.0 : 1.0);
          glass = mix(glass, vec3(0.62, 0.6, 0.55), blind * 0.55);
          vec3 frameCol = vec3(0.93, 0.93, 0.9);
          diffuseColor.rgb = mix(diffuseColor.rgb, glass, inside);
          diffuseColor.rgb = mix(diffuseColor.rgb, frameCol, clamp(frame, 0.0, 1.0));
          gWindow = inside * (1.0 - blind * 0.7);
          gFrame = frame;
          gLit = lit;
        }`).replace(`#include <roughnessmap_fragment>`,`#include <roughnessmap_fragment>
        roughnessFactor = mix(roughnessFactor, 0.07, gWindow);`).replace(`#include <metalnessmap_fragment>`,`#include <metalnessmap_fragment>
        metalnessFactor = mix(metalnessFactor, 0.42, gWindow);`).replace(`#include <emissivemap_fragment>`,`#include <emissivemap_fragment>
        {
          vec3 warm = mix(vec3(1.0, 0.78, 0.46), vec3(0.75, 0.9, 1.0), step(0.8, facadeHash(floor(vFacadeUv) * 2.3 + vStyle.w)));
          totalEmissiveRadiance += warm * gLit * (0.16 + uNight * 1.05);
        }`)},e.customProgramCacheKey=()=>`facade`}var Ph=class{shared={uNight:{value:0}};asphalt;sidewalk;plaza;sand;grass;wood;concrete;facade;roof;paint;gloss;metal;glass;marking;neon;lamp;frond;pool;glow;signs=new gh;neonBase=1;constructor(e){let t=e.anisotropy;this.asphalt=new S({map:xh(t),roughness:.92,metalness:0,vertexColors:!0}),this.sidewalk=new S({map:Sh(t),roughness:.88,metalness:0,vertexColors:!0}),this.plaza=new S({map:Ch(t),roughness:.55,metalness:0,vertexColors:!0}),this.sand=new S({map:wh(t),roughness:1,metalness:0,vertexColors:!0}),this.grass=new S({map:Th(t),roughness:1,metalness:0,vertexColors:!0}),this.wood=new S({map:Eh(t),roughness:.85,metalness:0,vertexColors:!0}),this.concrete=new S({map:Dh(t),roughness:.9,metalness:0,vertexColors:!0}),this.roof=new S({map:kh(t),roughness:.95,metalness:0,vertexColors:!0}),this.facade=new S({map:Oh(t),roughness:.86,metalness:0,vertexColors:!0}),Nh(this.facade,this.shared),this.paint=new S({roughness:.7,metalness:0,vertexColors:!0}),this.gloss=new S({roughness:.25,metalness:.1,vertexColors:!0}),this.metal=new S({roughness:.35,metalness:.9,vertexColors:!0}),this.glass=new S({color:10475744,roughness:.05,metalness:.2,transparent:!0,opacity:.28,side:2,depthWrite:!1}),this.marking=new S({roughness:.75,metalness:0,vertexColors:!0,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),this.neon=new De({vertexColors:!0,toneMapped:!0,side:2}),this.lamp=new De({color:16773839,toneMapped:!0}),this.frond=new S({map:Mh(),roughness:.8,metalness:0,alphaTest:.35,side:2,vertexColors:!0}),this.glow=new De({map:jh(),color:0,blending:2,transparent:!0,depthWrite:!1,fog:!1,toneMapped:!0,polygonOffset:!0,polygonOffsetFactor:-3,polygonOffsetUnits:-3}),this.glow.visible=!1,this.pool=new S({color:4182246,roughness:.08,metalness:.1,emissive:new K(682624),emissiveIntensity:.35,side:0})}setNight(e){this.shared.uNight.value=e,this.neonBase=1.1+e*1.5,this.neon.color.setScalar(this.neonBase),this.signs.material.color.setScalar(.95+e*1.45),this.lamp.color.setRGB(.5+e*3.2,.48+e*2.8,.42+e*2),this.glow.color.setRGB(e*.2,e*.165,e*.1),this.glow.visible=e>.02,this.pool.emissiveIntensity=.3+e*1.6}flicker(e){let t=1+Math.sin(e*31)*.015+(Math.sin(e*7.3)>.985?-.25:0);this.neon.color.setScalar(this.neonBase*t)}all(){return Object.values(this).filter(e=>!!e&&e.isMaterial===!0)}},Fh=`
  uniform vec3 uSunDir;
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uGround;
  uniform vec3 uSunColor;
  uniform float uGlow;
  uniform float uNight;

  vec3 skyGradient(vec3 dir) {
    float h = dir.y;
    float up = clamp(h, 0.0, 1.0);
    vec3 col = mix(uHorizon, uZenith, pow(up, 0.42));
    float sd = max(dot(dir, uSunDir), 0.0);
    // Warm belt around the sun near the horizon, and the forward-scatter glow.
    float belt = pow(sd, 3.0) * pow(1.0 - up, 6.0);
    col += uSunColor * belt * 0.55 * uGlow;
    col += uSunColor * (pow(sd, 12.0) * 0.22 + pow(sd, 90.0) * 0.5) * uGlow;
    // Below the horizon fades to a darker ground tone.
    float below = clamp(-h * 14.0, 0.0, 1.0);
    col = mix(col, uGround, below);
    return col;
  }
`,Ih=`
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * p;
    gl_Position.z = gl_Position.w;
  }
`,Lh=`
  ${Fh}
  uniform float uSkyTime;
  uniform float uSunDisc;
  uniform float uCloudCover;
  uniform vec3 uCloudLit;
  uniform vec3 uCloudShade;
  varying vec3 vDir;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x), mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float s = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      s += a * vnoise(p);
      p = p * 2.02 + vec2(17.0, 9.0);
      a *= 0.5;
    }
    return s;
  }
  float hash31(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  void main() {
    vec3 dir = normalize(vDir);
    vec3 col = skyGradient(dir);
    float sd = max(dot(dir, uSunDir), 0.0);

    // Stars.
    if (uNight > 0.01 && dir.y > 0.0) {
      vec3 p = dir * 220.0;
      vec3 ip = floor(p);
      vec3 fp = fract(p) - 0.5;
      float h = hash31(ip);
      float star = step(0.9965, h) * smoothstep(0.32, 0.0, length(fp));
      float twinkle = 0.7 + 0.3 * sin(uSkyTime * 3.0 + h * 80.0);
      col += vec3(0.9, 0.95, 1.0) * star * twinkle * uNight * smoothstep(0.0, 0.25, dir.y) * 1.6;
    }

    // Sun disc, bright enough to bloom.
    float disc = smoothstep(0.99965, 0.99985, sd);
    col += uSunColor * disc * 28.0 * uSunDisc;

    // Cloud layer on a plane above the viewer.
    if (dir.y > 0.012) {
      vec2 uv = dir.xz / (dir.y + 0.16);
      vec2 wind = vec2(0.012, 0.004) * uSkyTime;
      float base = fbm(uv * 0.85 + wind);
      float detail = fbm(uv * 2.6 + wind * 1.7 + 4.0);
      float d = base * 0.72 + detail * 0.28;
      float cover = smoothstep(1.0 - uCloudCover, 1.0 - uCloudCover + 0.26, d);
      // Light from the sun side: thinner parts glow, thick parts shade.
      float thick = smoothstep(1.0 - uCloudCover + 0.05, 1.0 - uCloudCover + 0.5, d);
      vec3 cl = mix(uCloudLit, uCloudShade, thick * 0.75);
      cl += uSunColor * pow(sd, 6.0) * (1.0 - thick) * 0.7 * uGlow;
      float horizonFade = smoothstep(0.012, 0.16, dir.y);
      col = mix(col, cl, cover * horizonFade * 0.92);
    }

    gl_FragColor = vec4(col, 1.0);
  }
`,Rh=[{e:40,zenith:[.11,.3,.74],horizon:[.55,.76,.95],sun:[1,.96,.88],sunIntensity:3.4,ambient:1,cloudLit:[1,1,1],cloudShade:[.62,.68,.78]},{e:18,zenith:[.13,.3,.7],horizon:[.78,.74,.72],sun:[1,.86,.66],sunIntensity:3.2,ambient:.92,cloudLit:[1,.95,.86],cloudShade:[.6,.6,.72]},{e:8,zenith:[.16,.27,.62],horizon:[1,.62,.36],sun:[1,.66,.36],sunIntensity:2.7,ambient:.78,cloudLit:[1,.74,.52],cloudShade:[.52,.4,.56]},{e:2,zenith:[.14,.17,.46],horizon:[1,.4,.26],sun:[1,.42,.2],sunIntensity:1.7,ambient:.6,cloudLit:[1,.5,.38],cloudShade:[.4,.25,.45]},{e:-4,zenith:[.05,.06,.22],horizon:[.6,.22,.4],sun:[.9,.3,.3],sunIntensity:0,ambient:.42,cloudLit:[.7,.3,.42],cloudShade:[.16,.12,.3]},{e:-12,zenith:[.012,.016,.06],horizon:[.07,.07,.2],sun:[.5,.6,1],sunIntensity:0,ambient:.3,cloudLit:[.12,.13,.26],cloudShade:[.03,.03,.09]}];function zh(e){if(e>=Rh[0].e)return Rh[0];for(let t=0;t+1<Rh.length;t++){let n=Rh[t],r=Rh[t+1];if(e<=n.e&&e>=r.e){let t=I(0,1,(n.e-e)/(n.e-r.e)),i=(e,n)=>[G(e[0],n[0],t),G(e[1],n[1],t),G(e[2],n[2],t)];return{e,zenith:i(n.zenith,r.zenith),horizon:i(n.horizon,r.horizon),sun:i(n.sun,r.sun),sunIntensity:G(n.sunIntensity,r.sunIntensity,t),ambient:G(n.ambient,r.ambient,t),cloudLit:i(n.cloudLit,r.cloudLit),cloudShade:i(n.cloudShade,r.cloudShade)}}}return Rh[Rh.length-1]}var Bh=class e{renderer;scene;quality;uniforms;sun;hemi;fog;lightDir=new f(.4,.8,.3);night=0;hour=16.5;storm=0;dome;material;pmrem;envScene=new lt;envTarget=null;envHour=-99;envStorm=-1;shadowExtent=80;tmp=new f;tmp2=new f;horizonColor=new K;constructor(e,t,n){this.renderer=e,this.scene=t,this.quality=n,this.uniforms={uSunDir:{value:new f(0,1,0)},uZenith:{value:new K},uHorizon:{value:new K},uGround:{value:new K},uSunColor:{value:new K},uGlow:{value:1},uNight:{value:0},uSkyTime:{value:0}},this.material=new Ve({uniforms:{...this.uniforms,uSunDisc:{value:1},uCloudCover:{value:.46},uCloudLit:{value:new K(1,1,1)},uCloudShade:{value:new K(.6,.65,.75)}},vertexShader:Ih,fragmentShader:Lh,side:1,depthWrite:!1,depthTest:!0,fog:!1}),this.dome=new s(new qt(1,48,24),this.material),this.dome.frustumCulled=!1,this.dome.renderOrder=-1e3,this.dome.name=`sky`,t.add(this.dome);let r=new s(this.dome.geometry,this.material);r.scale.setScalar(50),this.envScene.add(r),this.pmrem=new Fn(e),this.sun=new Le(16777215,3),this.sun.castShadow=n.shadows,this.sun.shadow.mapSize.set(n.shadowMapSize,n.shadowMapSize),this.sun.shadow.camera.near=1,this.sun.shadow.camera.far=1600,this.sun.shadow.bias=-3e-4,this.sun.shadow.normalBias=.06,t.add(this.sun),t.add(this.sun.target),this.hemi=new Jt(16777215,8939076,1),t.add(this.hemi),this.fog=new ut(16777215,6e-4),t.fog=this.fog,this.setHour(this.hour,!0)}applyQuality(e){this.quality=e,this.sun.castShadow=e.shadows,this.sun.shadow.mapSize.x!==e.shadowMapSize&&(this.sun.shadow.mapSize.set(e.shadowMapSize,e.shadowMapSize),this.sun.shadow.map?.dispose(),this.sun.shadow.map=null)}static sunAngles(e){let t=(e-13)/6.25,n=68*Math.cos(W(t,-1.6,1.6)*(Math.PI/2)),r=t>1?-(t-1)*46:t<-1?(t+1)*46:0,i=G(-60,96,at((e-7)/12.5));return{elevation:t>1||t<-1?r:n,azimuth:i}}setHour(t,n=!1){this.hour=t;let{elevation:r,azimuth:i}=e.sunAngles(t),a=zh(r),o=this.uniforms,s=r*Ye,c=i*Ye;o.uSunDir.value.set(-Math.sin(c)*Math.cos(s),Math.sin(s),Math.cos(c)*Math.cos(s)).normalize();let l=1-this.storm*.45;o.uZenith.value.setRGB(a.zenith[0]*l,a.zenith[1]*l,a.zenith[2]*l),o.uHorizon.value.setRGB(a.horizon[0]*l,a.horizon[1]*l,a.horizon[2]*l),o.uSunColor.value.setRGB(a.sun[0],a.sun[1],a.sun[2]),o.uGlow.value=I(-8,4,r)*(1-this.storm*.6),this.night=1-I(-7,6,r),o.uNight.value=this.night;let u=this.material.uniforms;u.uCloudLit.value.setRGB(a.cloudLit[0],a.cloudLit[1],a.cloudLit[2]),u.uCloudShade.value.setRGB(a.cloudShade[0],a.cloudShade[1],a.cloudShade[2]),u.uCloudCover.value=.46+this.storm*.3,u.uSunDisc.value=+(r>-1);let d=I(1.5,-5,r);r>-1.5?this.lightDir.copy(o.uSunDir.value):this.lightDir.set(.42,.74,-.52).normalize(),this.lightDir.y<.1&&(this.lightDir.y=.1,this.lightDir.normalize());let f=a.sunIntensity*(1-d)*l,p=.62*I(-2,-7,r);r>-1.5?(this.sun.color.setRGB(a.sun[0],a.sun[1],a.sun[2]),this.sun.intensity=f):(this.sun.color.setRGB(.55,.66,1),this.sun.intensity=p);let m=a.ambient*l,h=this.night;this.hemi.color.setRGB(G(a.zenith[0],a.horizon[0],.55)+h*.1,G(a.zenith[1],a.horizon[1],.55)+h*.14,G(a.zenith[2],a.horizon[2],.55)+h*.3),this.hemi.groundColor.setRGB(.42*a.sun[0]+.1,.36*a.sun[1]+.1,.28*a.sun[2]+.12),this.hemi.intensity=.9*m+.25,this.scene.environmentIntensity=.55*m+.12,this.horizonColor.setRGB(a.horizon[0],a.horizon[1],a.horizon[2]).multiplyScalar(l),this.fog.color.copy(this.horizonColor).lerp(o.uZenith.value,.25),o.uGround.value.copy(this.fog.color),this.fog.density=42e-5+this.storm*.0045+this.night*2e-4,(n||Math.abs(t-this.envHour)>.03||Math.abs(this.storm-this.envStorm)>.08)&&this.bakeEnvironment()}bakeEnvironment(){this.envHour=this.hour,this.envStorm=this.storm;let e=this.material.uniforms,t=e.uSunDisc.value;e.uSunDisc.value=0;let n=this.pmrem.fromScene(this.envScene,0,.1,200);e.uSunDisc.value=t,this.scene.environment=n.texture,this.envTarget?.dispose(),this.envTarget=n}update(e,t,n,r){if(this.uniforms.uSkyTime.value=e,this.dome.position.copy(t.position),this.dome.scale.setScalar(t.far*.95),!this.quality.shadows)return;let i=W(70+r*1.9,70,720);Math.abs(i-this.shadowExtent)>this.shadowExtent*.12&&(this.shadowExtent=i);let a=this.shadowExtent,o=this.sun.shadow.camera;if(o.right!==a){o.left=-a,o.right=a,o.top=a,o.bottom=-a,o.updateProjectionMatrix();let e=2*a/this.sun.shadow.mapSize.x;this.sun.shadow.bias=-12e-5-e*.0016,this.sun.shadow.normalBias=.03+e*.9}let s=2*a/this.sun.shadow.mapSize.x,c=this.lightDir,l=this.tmp.set(c.z,0,-c.x).normalize(),u=this.tmp2.crossVectors(c,l).normalize(),d=Math.round(n.dot(l)/s)*s,f=Math.round(n.dot(u)/s)*s,p=n.dot(c),m=l.x*d+u.x*f+c.x*p,h=l.y*d+u.y*f+c.y*p,g=l.z*d+u.z*f+c.z*p;this.sun.target.position.set(m,h,g),this.sun.position.set(m+c.x*800,h+c.y*800,g+c.z*800),this.sun.target.updateMatrixWorld()}dispose(){this.envTarget?.dispose(),this.pmrem.dispose()}},Vh=[[-.94,.34,46,.34],[-.78,-.62,27,.2],[-.55,.83,15.5,.115],[-.99,-.12,8.7,.06],[-.3,-.95,5.1,.032]],Hh=.42,Uh=9.81,Wh=Vh.map(([e,t,n,r],i)=>{let a=Math.hypot(e,t),o=Math.PI*2/n;return{dx:e/a,dz:t/a,k:o,a:r,w:Math.sqrt(Uh*o),q:Hh/(o*Vh.length),phase:i*1.7}}),Gh=Vh.reduce((e,t)=>e+t[3],0),Kh=`
  #define NW ${Vh.length}
  uniform vec4 uWave[NW];
  uniform vec3 uWave2[NW];
  uniform vec3 uCenter;
  uniform float uRadius;
  uniform float uPow;
  uniform float uTime;
  uniform sampler2D uShore;
  uniform float uWorldHalf;
  varying vec3 vWorld;
  varying vec2 vBase;
  varying float vAmp;
  varying float vHeight;

  void main() {
    vec2 p = position.xz;
    float r = max(abs(p.x), abs(p.y));
    vec2 base = uCenter.xz + p * pow(max(r, 1e-4), uPow - 1.0) * uRadius;
    vec2 suv = base / (uWorldHalf * 2.0) + 0.5;
    float amp = texture2D(uShore, suv).g;
    float dist = length(base - cameraPosition.xz);
    amp *= 1.0 - smoothstep(260.0, 900.0, dist);

    vec3 disp = vec3(0.0);
    for (int i = 0; i < NW; i++) {
      vec2 d = uWave[i].xy;
      float ph = uWave[i].z * dot(d, base) - uWave2[i].x * uTime + uWave2[i].z;
      disp.xz += d * (uWave2[i].y * amp * cos(ph));
      disp.y += uWave[i].w * amp * sin(ph);
    }
    vec3 world = vec3(base.x + disp.x, disp.y, base.y + disp.z);
    vWorld = world;
    vBase = base;
    vAmp = amp;
    vHeight = disp.y;
    gl_Position = projectionMatrix * viewMatrix * vec4(world, 1.0);
  }
`,qh=`
  #define NW ${Vh.length}
  ${Fh}
  uniform vec4 uWave[NW];
  uniform vec3 uWave2[NW];
  uniform float uTime;
  uniform sampler2D uShore;
  uniform sampler2D uNormalMap;
  uniform float uWorldHalf;
  uniform vec3 uShallow;
  uniform vec3 uDeep;
  uniform vec3 uFoam;
  uniform vec3 uLight;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  uniform float uFar;
  uniform float uMaxHeight;
  varying vec3 vWorld;
  varying vec2 vBase;
  varying float vAmp;
  varying float vHeight;

  void main() {
    vec2 suv = vBase / (uWorldHalf * 2.0) + 0.5;
    vec4 shore = texture2D(uShore, suv);
    float shoreDist = shore.r * 60.0;
    float depth = shore.b * 10.0;
    float dist = length(vWorld - cameraPosition);

    // Analytic normal of the wave field at this pixel.
    vec3 n = vec3(0.0, 1.0, 0.0);
    for (int i = 0; i < NW; i++) {
      vec2 d = uWave[i].xy;
      float ph = uWave[i].z * dot(d, vBase) - uWave2[i].x * uTime + uWave2[i].z;
      float wa = uWave[i].z * uWave[i].w * vAmp;
      n.xz -= d * wa * cos(ph);
      n.y -= uWave[i].z * uWave2[i].y * vAmp * sin(ph);
    }

    // Small ripples from two scrolling layers of a detail normal map.
    vec2 uv1 = vBase * 0.043 + uTime * vec2(0.011, 0.017);
    vec2 uv2 = vBase * 0.117 - uTime * vec2(0.023, 0.008);
    vec2 uv3 = vBase * 0.39 + uTime * vec2(-0.03, 0.041);
    vec3 d1 = texture2D(uNormalMap, uv1).xyz * 2.0 - 1.0;
    vec3 d2 = texture2D(uNormalMap, uv2).xyz * 2.0 - 1.0;
    vec3 d3 = texture2D(uNormalMap, uv3).xyz * 2.0 - 1.0;
    float near = 1.0 - smoothstep(40.0, 260.0, dist);
    float ripple = mix(0.16, 0.42, vAmp) * (1.0 - smoothstep(500.0, 2200.0, dist) * 0.75);
    n.xz += (d1.xy + d2.xy * 0.8) * ripple + d3.xy * ripple * 0.5 * near;
    n = normalize(n);

    vec3 V = normalize(cameraPosition - vWorld);
    bool under = !gl_FrontFacing;
    if (under) n = -n;
    float ndv = max(dot(n, V), 0.0);
    float fres = 0.02 + 0.98 * pow(clamp(1.0 - ndv, 0.0, 1.0), 5.0);

    vec3 R = reflect(-V, n);
    R.y = abs(R.y) + 0.02;
    R = normalize(R);
    vec3 refl = skyGradient(R);
    float sunHit = max(dot(R, uSunDir), 0.0);
    float spec = pow(sunHit, 420.0) * 14.0 + pow(sunHit, 48.0) * 0.32;
    spec *= uGlow;

    // Water body colour: turquoise in the shallows, deep blue offshore.
    float depthF = smoothstep(0.0, 5.5, depth);
    vec3 body = mix(uShallow, uDeep, depthF) * uLight;
    // Light scattering through wave crests when looking toward the sun.
    float crest = clamp(vHeight / max(uMaxHeight, 0.01) * 0.5 + 0.5, 0.0, 1.0);
    float sss = pow(max(dot(V, -uSunDir) * 0.5 + 0.5, 0.0), 3.0) * crest * vAmp;
    body += uShallow * uSunColor * sss * 0.45 * uGlow;

    vec3 col = mix(body, refl, fres) + uSunColor * spec;

    // Foam: lapping bands near the shore plus whitecaps on the highest crests.
    float wob = texture2D(uNormalMap, vBase * 0.021 + uTime * 0.006).b;
    float tex = texture2D(uNormalMap, vBase * 0.19 + vec2(uTime * 0.02, 0.0)).r;
    float band = sin(shoreDist * 0.85 - uTime * 1.25 + wob * 7.0);
    // Lapping bands belong to shelving beaches; against a seawall only a thin wash line remains.
    float beach = 1.0 - smoothstep(0.4, 2.6, depth);
    float nearShore = (1.0 - smoothstep(0.0, 11.0, shoreDist)) * beach;
    float foam = smoothstep(0.62, 0.98, band) * nearShore * 0.75;
    foam += (1.0 - smoothstep(0.0, mix(0.55, 1.5 + wob * 1.6, beach), shoreDist)) * mix(0.55, 0.95, beach);
    // Whitecaps only where the grid is fine enough to resolve a crest.
    foam += smoothstep(0.7, 1.0, crest) * smoothstep(0.55, 1.0, vAmp) * 0.5 * (1.0 - smoothstep(160.0, 520.0, dist));
    foam *= smoothstep(0.25, 0.62, tex + foam * 0.35);
    foam = clamp(foam, 0.0, 1.0) * step(0.001, shoreDist + depth);
    col = mix(col, uFoam * (uLight * 0.9 + 0.1), foam);

    // Clear water over sand in the first half metre of depth.
    float alpha = mix(smoothstep(0.0, 0.55, depth) * 0.9 + 0.1, 1.0, max(fres, foam));
    if (under) {
      col = mix(uShallow * uLight * 1.3, refl * 0.5, 0.25);
      alpha = 0.82;
    }

    float fog = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
    // Sea haze: the surface dissolves into the horizon colour before the far plane cuts it.
    fog = max(fog, smoothstep(uFar * 0.4, uFar * 0.9, dist));
    col = mix(col, uFogColor, fog);
    alpha = max(alpha, fog);
    gl_FragColor = vec4(col, alpha);
  }
`,Jh=class e{field;sky;mesh;material;shoreTexture;time=0;lightColor=new K;constructor(t,n,r,i){this.field=n,this.sky=r,this.shoreTexture=this.buildShoreTexture(),this.material=new Ve({uniforms:{...r.uniforms,uWave:{value:Wh.map(e=>new ue(e.dx,e.dz,e.k,e.a))},uWave2:{value:Wh.map(e=>new f(e.w,e.q,e.phase))},uCenter:{value:new f},uRadius:{value:2600},uPow:{value:2.4},uTime:{value:0},uShore:{value:this.shoreTexture},uNormalMap:{value:Ah()},uWorldHalf:{value:V.half},uShallow:{value:new K(.06,.6,.58)},uDeep:{value:new K(.008,.085,.18)},uFoam:{value:new K(.95,.98,1)},uLight:{value:new K(1,1,1)},uFogColor:{value:new K},uFogDensity:{value:5e-4},uFar:{value:2200},uMaxHeight:{value:Gh},uRes:{value:new h}},vertexShader:Kh,fragmentShader:qh,transparent:!0,depthWrite:!0,side:2}),this.mesh=new s(e.grid(i.waterGrid),this.material),this.mesh.frustumCulled=!1,this.mesh.renderOrder=-10,this.mesh.name=`water`,t.add(this.mesh)}static grid(e){let t=new Float32Array((e+1)*(e+1)*3),n=0;for(let r=0;r<=e;r++)for(let i=0;i<=e;i++)t[n++]=i/e*2-1,t[n++]=0,t[n++]=r/e*2-1;let r=new Uint32Array(e*e*6),i=0;for(let t=0;t<e;t++)for(let n=0;n<e;n++){let a=t*(e+1)+n,o=a+1,s=a+e+1,c=s+1;r[i++]=a,r[i++]=s,r[i++]=o,r[i++]=o,r[i++]=s,r[i++]=c}let a=new se;return a.setAttribute(`position`,new N(t,3)),a.setIndex(new N(r,1)),a}setGrid(t){this.mesh.geometry.dispose(),this.mesh.geometry=e.grid(t)}buildShoreTexture(){let e=this.field,t=new Uint8Array(1048576),n=new Float32Array(262144),r=new Uint8Array(262144),i=V.half*2/512;for(let t=0;t<512;t++)for(let a=0;a<512;a++){let o=(a+.5)*i-V.half,s=(t+.5)*i-V.half,c=t*512+a,l=e.typeAt(o,s),u=e.heightAt(o,s);if(l===_s.Water||l===_s.Sand&&u<.25){let t=l===_s.Sand||u>-3.9?-u:4+at((e.shoreDistance(o,s)-14)/46)*6;n[c]=Math.max(0,t),r[c]=1}}for(let e=0;e<7;e++){let e=r.slice();for(let t=1;t<511;t++)for(let i=1;i<511;i++){let a=t*512+i;if(r[a])continue;let o=0,s=0;for(let e of[-1,1,-512,512])r[a+e]&&(o+=n[a+e],s++);s&&(n[a]=o/s,e[a]=1)}r.set(e)}for(let r=0;r<512;r++)for(let a=0;a<512;a++){let o=(a+.5)*i-V.half,s=(r+.5)*i-V.half,c=r*512+a;t[c*4]=Math.round(at(e.shoreDistance(o,s)/60)*255),t[c*4+1]=Math.round(at(e.waveAmp(o,s))*255),t[c*4+2]=Math.round(at(n[c]/10)*255),t[c*4+3]=255}let a=new Pt(t,512,512,jt,Xt);return a.wrapS=ge,a.wrapT=ge,a.minFilter=de,a.magFilter=de,a.needsUpdate=!0,a}update(e,t){this.time=e;let n=this.material.uniforms;n.uTime.value=e,n.uCenter.value.set(Math.round(t.position.x/4)*4,0,Math.round(t.position.z/4)*4),n.uRadius.value=Math.max(1800,t.far*1.05),n.uFar.value=t.far;let r=this.sky,i=I(-.05,.25,r.uniforms.uSunDir.value.y);this.lightColor.copy(r.hemi.color).multiplyScalar(r.hemi.intensity*.55),this.lightColor.r+=r.sun.color.r*r.sun.intensity*.2*i,this.lightColor.g+=r.sun.color.g*r.sun.intensity*.2*i,this.lightColor.b+=r.sun.color.b*r.sun.intensity*.2*i,n.uLight.value.copy(this.lightColor),n.uFogColor.value.copy(r.fog.color),n.uFogDensity.value=r.fog.density}height(e,t,n=this.time){let r=this.field.waveAmp(e,t);if(r<=.001)return 0;let i=0,a=0;for(let o of Wh){let s=o.k*(o.dx*e+o.dz*t)-o.w*n+o.phase,c=Math.cos(s)*o.q*r;i+=o.dx*c,a+=o.dz*c}let o=e-i,s=t-a,c=0;for(let e of Wh){let t=e.k*(e.dx*o+e.dz*s)-e.w*n+e.phase;c+=Math.sin(t)*e.a*r}return c}normal(e,t,n,r=this.time){let i=this.field.waveAmp(e,t),a=0,o=0;for(let n of Wh){let s=n.k*(n.dx*e+n.dz*t)-n.w*r+n.phase,c=n.k*n.a*i*Math.cos(s);a-=n.dx*c,o-=n.dz*c}return n.set(a,1,o).normalize()}drift(e,t,n,r=this.time){let i=this.field.waveAmp(e,t),a=0,o=0;for(let n of Wh){let s=n.k*(n.dx*e+n.dz*t)-n.w*r+n.phase,c=Math.sin(s)*n.q*i*n.w;a+=n.dx*c,o+=n.dz*c}return n.set(a,0,o)}get now(){return this.time}},Yh={n:`s`,s:`n`,e:`w`,w:`e`},Xh={s:`w`,n:`e`,e:`s`,w:`n`},Zh=class{rect;front;W;D;ox;oz;ux;uz;wx;wz;constructor(e,t){this.rect=e,this.front=t;let n=e;switch(t){case`s`:this.W=n.x1-n.x0,this.D=n.z1-n.z0,[this.ox,this.oz,this.ux,this.uz,this.wx,this.wz]=[n.x0,n.z1,1,0,0,-1];break;case`n`:this.W=n.x1-n.x0,this.D=n.z1-n.z0,[this.ox,this.oz,this.ux,this.uz,this.wx,this.wz]=[n.x1,n.z0,-1,0,0,1];break;case`e`:this.W=n.z1-n.z0,this.D=n.x1-n.x0,[this.ox,this.oz,this.ux,this.uz,this.wx,this.wz]=[n.x1,n.z1,0,-1,-1,0];break;default:this.W=n.z1-n.z0,this.D=n.x1-n.x0,[this.ox,this.oz,this.ux,this.uz,this.wx,this.wz]=[n.x0,n.z0,0,1,1,0]}}x(e,t){return this.ox+e*this.ux+t*this.wx}z(e,t){return this.oz+e*this.uz+t*this.wz}get yawOut(){return this.front===`n`?0:this.front===`s`?Math.PI:this.front===`e`?-Math.PI/2:Math.PI/2}get outX(){return-this.wx}get outZ(){return-this.wz}worldRect(e,t,n,r){let i=this.x(e,n),a=this.x(t,r),o=this.z(e,n),s=this.z(t,r);return{x0:Math.min(i,a),x1:Math.max(i,a),z0:Math.min(o,s),z1:Math.max(o,s)}}faces(e){let t=``;for(let n of e)t+=n===`f`?this.front:n===`k`?Yh[this.front]:n===`l`?Xh[this.front]:n===`r`?Yh[Xh[this.front]]:n;return t}box(e,t,n,r,i,a,o,s,c=`fklrtb`,l){let u=this.worldRect(t,n,a,o);e.box(u.x0,r,u.z0,u.x1,i,u.z1,s,this.faces(c),l)}wallFront(e,t,n,r,i,a,o,s){e.wall(this.x(t,a),this.z(t,a),this.x(n,a),this.z(n,a),r,i,o,s)}wallBack(e,t,n,r,i,a,o,s){e.wall(this.x(n,a),this.z(n,a),this.x(t,a),this.z(t,a),r,i,o,s)}wallLeft(e,t,n,r,i,a,o,s){e.wall(this.x(t,r),this.z(t,r),this.x(t,n),this.z(t,n),i,a,o,s)}wallRight(e,t,n,r,i,a,o,s){e.wall(this.x(t,n),this.z(t,n),this.x(t,r),this.z(t,r),i,a,o,s)}floor(e,t,n,r,i,a,o){let s=this.worldRect(t,n,r,i);e.floor(s.x0,s.z0,s.x1,s.z1,a,o)}ceiling(e,t,n,r,i,a,o){let s=this.worldRect(t,n,r,i);e.ceiling(s.x0,s.z0,s.x1,s.z1,a,o)}signFront(e,t,n,r,i,a,o,s){this.wallFront(e,t,n,r,i,a,o,s)}},Qh=class{pos=[];nor=[];uv=[];col=[];idx=[];ext=[];extUsed=!1;sx=0;sy=0;sz=0;sw=0;count=0;uvScale=.25;get vertexCount(){return this.count}get empty(){return this.idx.length===0}setStyle(e,t,n,r){this.sx=e,this.sy=t,this.sz=n,this.sw=r,e>0&&(this.extUsed=!0)}clearStyle(){this.sx=0,this.sy=0,this.sz=0}vertex(e,t,n,r,i,a,o,s,c){return this.ext.push(this.sx,this.sy,this.sz,this.sw),this.pos.push(e,t,n),this.nor.push(r,i,a),this.uv.push(o,s),this.col.push(c.r,c.g,c.b),this.count++}tri(e,t,n){this.idx.push(e,t,n)}quad(e,t,n,r,i,a=[0,0,1,1]){let o=t[0]-e[0],s=t[1]-e[1],c=t[2]-e[2],l=r[0]-e[0],u=r[1]-e[1],d=r[2]-e[2],f=s*d-c*u,p=c*l-o*d,m=o*u-s*l,h=Math.hypot(f,p,m);h<1e-9?(f=0,p=1,m=0):(f/=h,p/=h,m/=h);let g=this.vertex(e[0],e[1],e[2],f,p,m,a[0],a[1],i),_=this.vertex(t[0],t[1],t[2],f,p,m,a[2],a[1],i),v=this.vertex(n[0],n[1],n[2],f,p,m,a[2],a[3],i),y=this.vertex(r[0],r[1],r[2],f,p,m,a[0],a[3],i);this.idx.push(g,_,v,g,v,y)}triangle(e,t,n,r){let i=t[0]-e[0],a=t[1]-e[1],o=t[2]-e[2],s=n[0]-e[0],c=n[1]-e[1],l=n[2]-e[2],u=a*l-o*c,d=o*s-i*l,f=i*c-a*s,p=Math.hypot(u,d,f);if(p<1e-9)return;u/=p,d/=p,f/=p;let m=this.vertex(e[0],e[1],e[2],u,d,f,0,0,r),h=this.vertex(t[0],t[1],t[2],u,d,f,1,0,r),g=this.vertex(n[0],n[1],n[2],u,d,f,.5,1,r);this.idx.push(m,h,g)}floor(e,t,n,r,i,a,o=this.uvScale){let s=this.vertex(e,i,t,0,1,0,e*o,t*o,a),c=this.vertex(e,i,r,0,1,0,e*o,r*o,a),l=this.vertex(n,i,r,0,1,0,n*o,r*o,a),u=this.vertex(n,i,t,0,1,0,n*o,t*o,a);this.idx.push(s,c,l,s,l,u)}ceiling(e,t,n,r,i,a,o=this.uvScale){let s=this.vertex(e,i,t,0,-1,0,e*o,t*o,a),c=this.vertex(n,i,t,0,-1,0,n*o,t*o,a),l=this.vertex(n,i,r,0,-1,0,n*o,r*o,a),u=this.vertex(e,i,r,0,-1,0,e*o,r*o,a);this.idx.push(s,c,l,s,l,u)}wall(e,t,n,r,i,a,o,s){let c=n-e,l=r-t,u=Math.hypot(c,l)||1,d=-l/u,f=c/u,p=this.uvScale,m=s?s[0]:0,h=s?s[2]:u*p,g=s?s[1]:i*p,_=s?s[3]:a*p,v=this.vertex(e,i,t,d,0,f,m,g,o),y=this.vertex(n,i,r,d,0,f,h,g,o),b=this.vertex(n,a,r,d,0,f,h,_,o),x=this.vertex(e,a,t,d,0,f,m,_,o);this.idx.push(v,y,b,v,b,x)}box(e,t,n,r,i,a,o,s=`nsewtb`,c){s.includes(`n`)&&this.wall(r,n,e,n,t,i,o),s.includes(`s`)&&this.wall(e,a,r,a,t,i,o),s.includes(`e`)&&this.wall(r,a,r,n,t,i,o),s.includes(`w`)&&this.wall(e,n,e,a,t,i,o),s.includes(`t`)&&this.floor(e,n,r,a,i,c??o),s.includes(`b`)&&this.ceiling(e,n,r,a,t,o)}boxRot(e,t,n,r,i,a,o,s,c){let l=Math.cos(o),u=Math.sin(o),d=r/2,f=a/2,p=(t,r)=>[e+t*l+r*u,n-t*u+r*l],[m,h]=p(-d,-f),[g,_]=p(d,-f),[v,y]=p(d,f),[b,x]=p(-d,f),S=t+i;this.wall(g,_,m,h,t,S,s),this.wall(b,x,v,y,t,S,s),this.wall(v,y,g,_,t,S,s),this.wall(m,h,b,x,t,S,s),this.quad([m,S,h],[b,S,x],[v,S,y],[g,S,_],c??s),this.quad([m,t,h],[g,t,_],[v,t,y],[b,t,x],s)}cylinder(e,t,n,r,i,a,o,s=12,c=!0,l=0,u=Math.PI*2){let d=t+a,f=(r-i)/a,p=[];for(let a=0;a<=s;a++){let c=l+a/s*u,m=Math.sin(c),h=Math.cos(c),g=Math.hypot(1,f),_=this.vertex(e+m*r,t,n+h*r,m/g,f/g,h/g,a/s,0,o);this.vertex(e+m*i,d,n+h*i,m/g,f/g,h/g,a/s,1,o),p.push(_)}for(let e=0;e<s;e++){let t=p[e],n=p[e+1];this.idx.push(t,n,n+1,t,n+1,t+1)}if(c&&i>.001){let t=this.vertex(e,d,n,0,1,0,.5,.5,o),r=this.count;for(let t=0;t<=s;t++){let r=l+t/s*u;this.vertex(e+Math.sin(r)*i,d,n+Math.cos(r)*i,0,1,0,.5+Math.sin(r)/2,.5+Math.cos(r)/2,o)}for(let e=0;e<s;e++)this.idx.push(t,r+e,r+e+1)}}append(e,t=0,n=0,r=0){let i=this.count;for(let i=0;i<e.pos.length;i+=3)this.pos.push(e.pos[i]+t,e.pos[i+1]+n,e.pos[i+2]+r);for(let t of e.nor)this.nor.push(t);for(let t of e.uv)this.uv.push(t);for(let t of e.col)this.col.push(t);for(let t of e.ext)this.ext.push(t);e.extUsed&&(this.extUsed=!0);for(let t of e.idx)this.idx.push(t+i);this.count+=e.count}build(){let e=new se;return e.setAttribute(`position`,new N(new Float32Array(this.pos),3)),e.setAttribute(`normal`,new N(new Float32Array(this.nor),3)),e.setAttribute(`uv`,new N(new Float32Array(this.uv),2)),e.setAttribute(`color`,new N(new Float32Array(this.col),3)),this.extUsed&&e.setAttribute(`aStyle`,new N(new Float32Array(this.ext),4)),e.setIndex(this.count>65535?new N(new Uint32Array(this.idx),1):new N(new Uint16Array(this.idx),1)),e.computeBoundingSphere(),e.computeBoundingBox(),e}collisionData(){return{vertices:new Float32Array(this.pos),indices:new Uint32Array(this.idx)}}};new K;var $h={floorY:V.streetY+V.kerb,glassTop:3.5,ceiling:3.75,doorWidth:2,doorHeight:2.5,wall:.3,pilaster:.3,plinth:.5};function eg(e){let t=e.frame,n=e.plan,r=(e,n,r,i)=>{let a=t.x(e,r),o=t.x(n,i),s=t.z(e,r),c=t.z(n,i);return{x0:Math.min(a,o),z0:Math.min(s,c),x1:Math.max(a,o),z1:Math.max(s,c)}},i=$h.doorWidth/2+.6;return{room:r(n.u0,n.u1,0,n.w1),apron:r(n.doorU-i,n.doorU+i,-3.2,0)}}var tg={market:{bays:3,depth:10.5},ammo:{bays:3,depth:9.5},pharmacy:{bays:2,depth:9},surf:{bays:3,depth:10.5},cafe:{bays:3,depth:9.5},arcade:{bays:3,depth:10}},ng={s:`w`,n:`e`,e:`s`,w:`n`};function rg(e,t,n){let r=e.shop??`market`,i=tg[r],a=new Bt((e.seed^1597463007)>>>0),o=Math.max(1,Math.round(t/4.2)),s=t/o,c=Math.min(i.bays,o),l=0,u=o-c;if(e.cornerSide){let t=Math.min(2,u);e.cornerSide===ng[e.front]?l=t:u=Math.max(l,u-t)}let d=Math.round((o-c)/2),f=Math.max(l,Math.min(u,d+a.int(-1,1))),p=f+c,m=f*s,h=p*s,g=$h.wall,_=Math.min(g+i.depth,n-.8);return{type:r,bays:o,bayW:s,bay0:f,bay1:p,g0:m,g1:h,doorU:(m+h)/2,u0:m+$h.pilaster,u1:h-$h.pilaster,w0:g,w1:_,mirror:a.chance(.5)}}function ig(e,t,n,r){let i=$h.floorY,a=i+$h.ceiling,o=(n,r,i,a,o,s)=>{if(r-n<.01||a-i<.01||s-o<.01)return;let c=t.worldRect(n,r,i,a);e.addStaticBox((c.x0+c.x1)/2,(o+s)/2,(c.z0+c.z1)/2,(c.x1-c.x0)/2,(s-o)/2,(c.z1-c.z0)/2,{kind:`world`,surface:`concrete`},0,Ut.world)};o(0,n.u0,0,t.D,i,r),o(n.u1,t.W,0,t.D,i,r),o(n.u0,n.u1,n.w1,t.D,i,r),o(n.u0,n.u1,0,n.w1,a,r);let s=$h.doorWidth/2;o(n.u0,n.doorU-s,0,n.w0,i,i+$h.plinth),o(n.doorU+s,n.u1,0,n.w0,i,i+$h.plinth),o(n.u0,n.u1,0,n.w0,i+$h.glassTop,a)}function ag(e,t,n,r,i){let a=$h.floorY,o=a+$h.glassTop+.05,s=$h.doorWidth/2;for(let[r,s]of[[t.g0,t.u0],[t.u1,t.g1]])e.box(n,r,s,a,o,-.1,$h.wall,i.trim,`flrk`),e.box(n,r-.03,s+.03,a,a+$h.plinth,-.13,0,i.accent,`flrt`);for(let[r,o]of[[t.u0,t.doorU-s],[t.doorU+s,t.u1]])e.box(n,r,o,a,a+$h.plinth,-.06,.05,i.accent,`flrt`,i.trim);let c=s+.75,l=a+$h.doorHeight+.42;e.box(n,t.doorU-c,t.doorU+c,l,l+.14,-1.25,0,i.trim,`flrtb`,i.accent),e.box(n,t.doorU-c-.04,t.doorU+c+.04,l+.14,l+.2,-1.29,0,i.accent,`flrtb`),e.box(r,t.doorU-c+.08,t.doorU+c-.08,l-.05,l,-1.2,-1.14,i.neon,`flrb`),e.box(r,t.u0+.05,t.u1-.05,a+$h.glassTop-.02,a+$h.glassTop+.04,-.05,0,i.neon,`fb`),e.box(n,t.doorU-s,t.doorU+s,a,a+.012,-.12,.02,i.dark,`ft`)}var Q=V.streetY+V.kerb,og=4.3,sg=3.3,cg=.9,lg=e=>new K(e),ug=[16230584,11069135,9427424,16773544,16763812,13219570,11129845,16774880,16752266,8380612,16448245,16638692,12443902].map(lg),dg=[1620144,16732058,16762941,3073750,9067765,16743001,3842303].map(lg),fg=[new K(1,.22,.6),new K(.15,.95,1),new K(.72,.4,1),new K(1,.84,.28),new K(.35,1,.68),new K(1,.48,.18)],pg=lg(16645624),mg=lg(2240570),hg=new K(.9,.9,.88),gg=[7316392,12154975,8360888,11117711,9417626].map(lg),_g={rect:[.5,.52,0],wide:[.74,.54,0],slit:[.26,.7,0],porthole:[.44,.44,1],ribbon:[1,.44,2],store:[.9,.7,3],small:[.4,.26,0]};function vg(){return{facade:new Qh,paint:new Qh,roof:new Qh,neon:new Qh,sign:new Qh,gloss:new Qh}}function yg(e,t,n,r){let i={group:new Je,buildings:[],roofSpots:[],artSlots:[],shops:[]};i.group.name=`buildings`;let a=new Map;for(let t of e.lots){if(t.use!==`building`&&t.use!==`shop`)continue;let e=a.get(t.block);e||a.set(t.block,e=[]),e.push(t)}for(let[o,s]of a){let a=e.blocks[o],c=vg();for(let e of s){let a=new Bt(e.seed),o=xg(e,a),s=new Zh(o,e.front),l={f:s,r:a,b:c,lot:e,body:a.pick(ug).clone(),accent:a.pick(dg).clone(),neon:a.pick(fg).clone(),seed:e.seed%97+1,physics:r,materials:n,out:i},u;switch(e.style){case`tower`:u=Fg(l);break;case`hotel`:u=Pg(l);break;case`modern`:u=Ig(l);break;case`villa`:u=Lg(l);break;case`warehouse`:u=Rg(l);break;default:u=Ng(l)}t.markBuilding(o,u),i.buildings.push({lot:e,rect:o,roofY:u,frame:s}),i.roofSpots.push({x:on(o)+a.range(-2,2),z:dn(o)+a.range(-2,2),y:u})}bg(i.group,c,n,a)}return Bg(e,t,n,r,i),i}function bg(e,t,n,r){let i=(t,n,i,a)=>{if(t.empty)return;let o=new s(t.build(),n);o.name=`${i}-${r?r.id:`x`}`,o.castShadow=a,o.receiveShadow=!0,o.matrixAutoUpdate=!1,e.add(o)};i(t.facade,n.facade,`facade`,!0),i(t.paint,n.paint,`trim`,!0),i(t.roof,n.roof,`roof`,!1),i(t.gloss,n.gloss,`gloss`,!0),i(t.neon,n.neon,`neon`,!1),i(t.sign,n.signs.material,`signs`,!1)}function xg(e,t){let n=e.rect,r=new Zh(n,e.front),i=e.style===`deco`||e.style===`shop`?0:e.style===`villa`?t.range(3,5):t.range(1.2,2.4),a=e.style===`villa`?t.range(4,6):e.style===`tower`?1.5:0,o=e.style===`villa`?t.range(5,8):1.5;return r.worldRect(i,r.W-i,a,r.D-o)}function Sg(e,t,n){let r=_g[t];e.setStyle(r[0],r[1],r[2],n)}function Cg(e,t){let{f:n,b:r}=e,i=t.u1-t.u0,a=t.w1-t.w0,o=t.ground?og:0,s=t.ground?t.floors-1:t.floors,c=t.y0+o,l=c+s*sg,u=t.parapet??cg,d=Math.max(1,Math.round(i/3.2)),f=Math.max(1,Math.round(a/3.2)),p=r.facade;if(t.ground){Sg(p,`store`,e.seed);let r=t.shop;r?(r.bay0>0&&n.wallFront(p,t.u0,r.g0,t.y0,c,t.w0,e.body,[0,0,r.bay0,1]),r.bay1<r.bays&&n.wallFront(p,r.g1,t.u1,t.y0,c,t.w0,e.body,[r.bay1,0,r.bays,1]),p.clearStyle(),n.wallFront(p,r.g0,r.g1,t.y0+$h.glassTop,c,t.w0,e.body,[0,0,1,.2])):n.wallFront(p,t.u0,t.u1,t.y0,c,t.w0,e.body,[0,0,Math.max(1,Math.round(i/4.2)),1]),p.clearStyle(),n.wallLeft(p,t.u0,t.w0,t.w1,t.y0,c,t.color,[0,0,f,1]),n.wallRight(p,t.u1,t.w0,t.w1,t.y0,c,t.color,[0,0,f,1]),n.wallBack(p,t.u0,t.u1,t.y0,c,t.w1,t.color,[0,0,d,1])}if(s>0){Sg(p,t.front,e.seed),n.wallFront(p,t.u0,t.u1,c,l,t.w0,t.color,[0,0,d,s]),t.sides?Sg(p,t.sides,e.seed+3):p.clearStyle(),n.wallLeft(p,t.u0,t.w0,t.w1,c,l,t.color,[0,0,f,s]),n.wallRight(p,t.u1,t.w0,t.w1,c,l,t.color,[0,0,f,s]);let r=t.back===void 0?t.sides:t.back;r?Sg(p,r,e.seed+5):p.clearStyle(),n.wallBack(p,t.u0,t.u1,c,l,t.w1,t.color,[0,0,d,s]),p.clearStyle()}if(u>0){p.clearStyle(),n.wallFront(p,t.u0,t.u1,l,l+u,t.w0,t.color,[0,0,1,.3]),n.wallLeft(p,t.u0,t.w0,t.w1,l,l+u,t.color,[0,0,1,.3]),n.wallRight(p,t.u1,t.w0,t.w1,l,l+u,t.color,[0,0,1,.3]),n.wallBack(p,t.u0,t.u1,l,l+u,t.w1,t.color,[0,0,1,.3]);let e=.3;n.box(r.paint,t.u0,t.u1,l+u,l+u+.08,t.w0,t.w0+e,pg,`ftkb`),n.box(r.paint,t.u0,t.u1,l+u,l+u+.08,t.w1-e,t.w1,pg,`ftkb`),n.box(r.paint,t.u0,t.u0+e,l+u,l+u+.08,t.w0,t.w1,pg,`ltrb`),n.box(r.paint,t.u1-e,t.u1,l+u,l+u+.08,t.w0,t.w1,pg,`ltrb`),n.wallBack(r.paint,t.u0+e,t.u1-e,l,l+u,t.w0+e,t.color),n.wallFront(r.paint,t.u0+e,t.u1-e,l,l+u,t.w1-e,t.color),n.wallRight(r.paint,t.u0+e,t.w0+e,t.w1-e,l,l+u,t.color),n.wallLeft(r.paint,t.u1-e,t.w0+e,t.w1-e,l,l+u,t.color)}if(t.roof!==!1&&n.floor(r.roof,t.u0,t.u1,t.w0,t.w1,l+.01,hg),t.shop)ig(e.physics,n,t.shop,l);else if(!t.noCollider){let r=n.worldRect(t.u0,t.u1,t.w0,t.w1);e.physics.addStaticBox((r.x0+r.x1)/2,(t.y0+l)/2,(r.z0+r.z1)/2,(r.x1-r.x0)/2,(l-t.y0)/2,(r.z1-r.z0)/2,{kind:`world`,surface:`concrete`})}return l}function wg(e,t,n,r,i,a,o=.65){for(let s=0;s<a;s++){let a=i+s*sg+sg*.82;e.f.box(e.b.paint,t,n,a,a+.13,r-o,r,pg,`flrtb`)}}function Tg(e,t,n,r,i,a){for(let o=0;o<3;o++)e.f.box(e.b.paint,t,n,i+o*.3,i+o*.3+.12,r-.07,r,a,`flrtb`)}function Eg(e,t,n,r,i,a){let{f:o,b:s,r:c}=e,l=(e,t)=>!a||t<=a.g0||e>=a.g1;a?(a.g0-t>.05&&o.box(s.paint,t,a.g0,i,i+.5,r-.06,r,e.accent,`flrt`),n-a.g1>.05&&o.box(s.paint,a.g1,n,i,i+.5,r-.06,r,e.accent,`flrt`)):o.box(s.paint,t,n,i,i+.5,r-.06,r,e.accent,`flrt`),o.box(s.paint,t,n,i+og-.75,i+og-.1,r-.1,r,pg,`flrtb`);let u=Math.max(1,Math.round((n-t)/6)),d=(n-t)/u,f=c.chance(.5);for(let n=0;n<u;n++){if(c.chance(.25))continue;let a=t+n*d+.5,u=a+d-1;if(!l(a,u))continue;let p=i+3.45,m=i+2.85,h=1.35,g=f?Math.max(2,Math.round((u-a)/.8)):1;for(let t=0;t<g;t++){let n=a+(u-a)*t/g,i=a+(u-a)*(t+1)/g,c=f&&t%2==1?pg:e.accent;s.paint.quad([o.x(n,r),p,o.z(n,r)],[o.x(n,r-h),m,o.z(n,r-h)],[o.x(i,r-h),m,o.z(i,r-h)],[o.x(i,r),p,o.z(i,r)],c),s.paint.quad([o.x(i,r),p-.02,o.z(i,r)],[o.x(i,r-h),m-.02,o.z(i,r-h)],[o.x(n,r-h),m-.02,o.z(n,r-h)],[o.x(n,r),p-.02,o.z(n,r)],c)}o.box(s.paint,a,u,m-.22,m,r-h-.02,r-h+.04,e.accent,`flrtbk`)}let p=t+(n-t)*c.pick([.2,.5,.8]);a||(o.box(s.paint,p-.85,p+.85,i,i+2.5,r-.09,r,mg,`flrt`),o.box(s.gloss,p-.7,p+.7,i+.1,i+2.35,r-.12,r-.08,new K(.25,.42,.48),`f`))}function Dg(e,t,n,r,i,a,o){let{f:s,b:c}=e,l=.9;s.box(c.paint,t-a/2,t+a/2,r,i,n-l,n+.2,pg);for(let o of[-1,1]){let u=t+o*a/2;s.box(c.neon,u-.07,u+.07,r+.3,i-.2,n-l-.08,n-l,e.neon,`flrtb`)}if(o){let u=e.materials.signs.vertical(o),d=Math.min(i-r-1.2,a*.7/u.aspect),f=d*u.aspect,p=(r+i)/2;s.signFront(c.sign,t-f/2,t+f/2,p-d/2,p+d/2,n-l-.04,e.neon,u.uv)}return s.box(c.paint,t-a/2-.2,t+a/2+.2,i,i+.25,n-l-.2,n+.4,e.accent),i+.25}function Og(e,t,n,r,i,a){for(let o=0;o<a;o++){let s=i*(1-o/(a+.6));e.f.box(e.b.paint,t-s/2,t+s/2,r+o*.7,r+(o+1)*.7,n,n+.9,o%2==0?e.body:pg)}}function kg(e,t,n,r,i,a,o,s,c=!1){if(!t)return;let l=e.materials.signs.horizontal(t,s),u=o,d=u*l.aspect;if(d>a&&(d=a,u=d/l.aspect),c){e.f.box(e.b.paint,n-d/2-.3,n+d/2+.3,i-.25,i-.1,r+.1,r+.3,mg);for(let t=0;t<=4;t++){let a=n-d/2+d*t/4;e.f.box(e.b.paint,a-.06,a+.06,i-.9,i+u,r+.14,r+.26,mg)}}e.f.signFront(e.b.sign,n-d/2,n+d/2,i,i+u,r,e.neon,l.uv)}function Ag(e,t,n,r,i,a){let{f:o,b:s,r:c}=e,l=new K(.72,.74,.76),u=c.int(1,4);for(let e=0;e<u;e++){let e=c.range(t+2,n-2),u=c.range(r+3,i-2);if(c.chance(.6))o.box(s.paint,e-.9,e+.9,a,a+1.1,u-.7,u+.7,l),o.box(s.paint,e-.7,e+.7,a+1.1,a+1.2,u-.5,u+.5,mg);else{let t=o.worldRect(e-1,e+1,u-1,u+1);s.paint.cylinder((t.x0+t.x1)/2,a,(t.z0+t.z1)/2,1,1,1.9,l,10),s.paint.cylinder((t.x0+t.x1)/2,a+1.9,(t.z0+t.z1)/2,1.05,.2,.5,mg,10,!1)}}if(n-t>12&&c.chance(.7)){let r=c.range(t+3,n-3);o.box(s.paint,r-1.4,r+1.4,a,a+2.6,i-4.2,i-1.2,e.body),o.box(s.paint,r-.5,r+.5,a,a+2.05,i-4.25,i-4.2,mg,`f`)}}function jg(e,t){let{f:n,b:r,lot:i}=e;if(!i.cornerSide)return;let a={s:`w`,n:`e`,e:`s`,w:`n`}[i.front],o=i.cornerSide===a,s=Math.min(3.4,n.W*.2),c=o?s*.55:n.W-s*.55,l=s*.55,u=n.x(c,l),d=n.z(c,l),f=Math.max(1,Math.round((t-(Q+og))/sg));Sg(r.facade,`store`,e.seed),Mg(r.facade,u,d,s,Q,Q+og,e.body,8,1),Sg(r.facade,`ribbon`,e.seed),Mg(r.facade,u,d,s,Q+og,t+cg+.6,e.body,8,f+.45),r.facade.clearStyle(),r.paint.cylinder(u,t+cg+.6,d,s+.25,s+.25,.22,pg,20),r.paint.cylinder(u,Q+og-.3,d,s+.3,s+.3,.2,pg,20),r.neon.cylinder(u,t+cg+.3,d,s+.05,s+.05,.1,e.neon,20,!1)}function Mg(e,t,n,r,i,a,o,s,c){let l=[];for(let u=0;u<=20;u++){let d=u/20*Math.PI*2,f=Math.sin(d),p=Math.cos(d),m=e.vertex(t+f*r,i,n+p*r,f,0,p,u/20*s,0,o);e.vertex(t+f*r,a,n+p*r,f,0,p,u/20*s,c,o),l.push(m)}for(let t=0;t<20;t++){let n=l[t],r=l[t+1];e.tri(n,r,r+1),e.tri(n,r+1,n+1)}}function Ng(e){let{f:t,r:n,lot:r}=e,i=Math.max(1,r.floors),a=n.pick([`rect`,`rect`,`wide`,`porthole`,`slit`]),o=r.use===`shop`&&r.shop?rg(r,t.W,t.D):void 0,s=Cg(e,{u0:0,u1:t.W,w0:0,w1:t.D,y0:Q,floors:i,ground:!0,front:a,sides:r.cornerSide?a:n.chance(.4)?`small`:null,back:`small`,color:e.body,shop:o});Eg(e,.3,t.W-.3,0,Q,o),o&&(ag(t,o,e.b.paint,e.b.neon,{accent:e.accent,neon:e.neon,trim:pg,dark:mg}),e.out.shops.push({lot:r,plan:o,frame:t,top:s,body:e.body,accent:e.accent,neon:e.neon})),i>1&&(wg(e,.4,t.W-.4,0,Q+og,i-1),Tg(e,.2,t.W-.2,0,s-.2,e.accent));let c=t.W/2;return n.chance(.6)&&t.W>12&&Og(e,c,0,s+cg,Math.min(8,t.W*.45),n.int(2,3)),n.chance(.55)&&i>=2&&Dg(e,n.chance(.5)?c:t.W*n.pick([.22,.78]),0,Q+og-(o?-.05:.4),s+cg+n.range(1.5,4),1.5,r.name||n.pick([`CAFE`,`BAR`,`DELI`,`MODA`,`CINE`,`CLUB`,`SALSA`,`HELADO`])),r.name&&r.use===`shop`&&kg(e,r.name,o?o.doorU:c,-.12,Q+og-.72,o?o.g1-o.g0-1:t.W*.6,.58,n.pick([`block`,`script`])),jg(e,s),Ag(e,0,t.W,0,t.D,s),r.cornerSide===void 0&&t.D>12&&n.chance(.3)&&zg(e,s),s}function Pg(e){let{f:t,r:n,lot:r,b:i}=e,a=Math.max(3,r.floors),o=Cg(e,{u0:0,u1:t.W,w0:0,w1:t.D,y0:Q,floors:a,ground:!0,front:`wide`,sides:`rect`,back:`small`,color:e.body});Eg(e,.3,t.W-.3,0,Q);let s=a-1,c=t.W/2,l=2.2;for(let n=0;n<s;n++){let r=Q+og+n*sg;for(let[a,o]of[[.6,c-l/2-.5],[c+l/2+.5,t.W-.6]])o-a<2||(t.box(i.paint,a,o,r-.1,r+.06,-1.25,0,pg),t.box(i.paint,a,o,r+.06,r+.95,-1.25,-1.15,n%2==0?e.accent:pg))}let u=Dg(e,c,0,Q+.2,o+cg+n.range(3,6),l,r.name);return i.neon.cylinder(t.x(c,.2),u,t.z(c,.2),.12,.12,n.range(2,4),e.neon,6),Tg(e,.2,t.W-.2,0,o-.25,e.accent),Og(e,c,0,o+cg,Math.min(9,t.W*.5),2),jg(e,o),Ag(e,0,t.W,0,t.D,o),t.W>16&&kg(e,r.name,t.W/2,t.D*.35,o+cg+1.1,t.W*.8,1.9,`block`,!0),o}function Fg(e){let{f:t,r:n,lot:r,b:i}=e,a=Math.max(8,r.floors),o=Cg(e,{u0:0,u1:t.W,w0:0,w1:t.D,y0:Q,floors:2,ground:!0,front:`wide`,sides:`rect`,back:`small`,color:pg,parapet:1});Eg(e,.3,t.W-.3,0,Q);let s=Math.min(4,t.W*.14),c=s,l=t.W-s,u=2.5,d=t.D-2.5,f=a-2,p=Cg(e,{u0:c,u1:l,w0:u,w1:d,y0:o,floors:f,front:`ribbon`,sides:n.pick([`wide`,`ribbon`]),back:`ribbon`,color:e.body});for(let e=1;e<=f;e++){let n=o+e*sg;t.box(i.paint,c-1.1,l+1.1,n-.12,n+.05,1.4,u,pg),t.box(i.paint,c-1.1,l+1.1,n-.12,n+.05,d,d+1.1,pg),e<f&&(t.box(i.gloss,c-1.1,l+1.1,n+.05,n+.9,1.4,1.45,new K(.5,.8,.85),`fk`),t.box(i.gloss,c-1.1,l+1.1,n+.05,n+.9,d+1.05,d+1.1,new K(.5,.8,.85),`fk`))}let m=(c+l)/2,h=(u+d)/2,g=p+cg,_=Math.min(l-c,d-u)*.32;for(let n=0;n<3;n++)t.box(i.paint,m-_,m+_,g,g+2.2,h-_,h+_,n%2==0?e.body:pg),t.box(i.neon,m-_-.05,m+_+.05,g+2,g+2.12,h-_-.05,h+_+.05,e.neon,`fklr`),g+=2.2,_*=.62;i.paint.cylinder(t.x(m,h),g,t.z(m,h),.22,.08,9,pg,6),i.neon.cylinder(t.x(m,h),g+9,t.z(m,h),.3,.3,.5,new K(1,.2,.2),6);for(let n of[c,l])t.box(i.neon,n-.08,n+.08,o+.5,p,2.4,2.48,e.neon,`flr`);return kg(e,r.name,t.W/2,-.1,o-1.25,t.W*.7,1,`block`),Ag(e,0,s+1,0,t.D,o),e.out.roofSpots.push({x:t.x(1.5,t.D/2),z:t.z(1.5,t.D/2),y:o}),p}function Ig(e){let{f:t,r:n,lot:r,b:i}=e,a=Math.max(4,r.floors),o=pg,s=Cg(e,{u0:0,u1:t.W,w0:0,w1:t.D,y0:Q,floors:a,ground:!0,front:`ribbon`,sides:`ribbon`,back:`wide`,color:o});Eg(e,.3,t.W-.3,0,Q);let c=Q+og,l=t.W*n.range(.05,.3),u=t.W*n.range(.65,.95);t.box(i.paint,l,l+.35,c,s,-.9,0,e.accent),t.box(i.paint,u-.35,u,c,s,-.9,0,e.accent),t.box(i.paint,l,u,s-.35,s,-.9,0,e.accent),t.box(i.paint,l,u,c,c+.3,-.9,0,e.accent);for(let e=1;e<a-1;e++)t.box(i.paint,l+.35,u-.35,c+e*sg-.08,c+e*sg+.06,-.9*.8,0,pg);return t.box(i.neon,l+.35,u-.35,s-.5,s-.42,-.92,-.86,e.neon,`f`),Ag(e,0,t.W,0,t.D,s),r.name&&kg(e,r.name,t.W/2,-.12,Q+og-.72,t.W*.6,.58,`block`),s}function Lg(e){let{f:t,r:n,lot:r,b:i}=e,a=Math.max(1,Math.min(2,r.floors)),o=pg,s=t.W*n.range(.45,.62),c=Cg(e,{u0:0,u1:s,w0:0,w1:t.D,y0:Q,floors:a,front:`wide`,sides:`wide`,back:`wide`,color:o,parapet:.25}),l=Cg(e,{u0:s,u1:t.W,w0:t.D*.22,w1:t.D,y0:Q,floors:1,front:`wide`,sides:`rect`,back:`wide`,color:e.body,parapet:.25});t.box(i.paint,-1.1,s+.8,c+.25,c+.5,-1.4,t.D+.8,o),t.box(i.paint,s-.2,t.W+1,l+.25,l+.48,t.D*.22-1.6,t.D+.8,o),t.box(i.paint,s-.25,s+.25,Q,c+.2,-1.2,t.D*.5,e.accent),t.box(i.paint,s*.5-.8,s*.5+.8,Q,Q+2.4,-.08,0,mg,`flrt`);let u=new Zh(r.rect,r.front),d=new K(.2,.46,.26),f=u.W*n.range(.3,.7);for(let[t,n]of[[.4,f-1.8],[f+1.8,u.W-.4]]){if(n-t<1)continue;u.box(i.paint,t,n,Q,Q+.9,.3,.6,o),u.box(i.paint,t,n,Q+.9,Q+1.5,.25,.65,d);let r=u.worldRect(t,n,.3,.6);e.physics.addStaticBox((r.x0+r.x1)/2,Q+.75,(r.z0+r.z1)/2,(r.x1-r.x0)/2,.75,(r.z1-r.z0)/2,{kind:`world`,surface:`concrete`})}return c}function Rg(e){let{f:t,r:n,lot:r,b:i}=e,a=n.pick(gg).clone(),o=7+r.floors*1.6,s=Math.round(o/sg),c=Cg(e,{u0:0,u1:t.W,w0:0,w1:t.D,y0:Q,floors:s,front:`small`,sides:null,back:null,color:a,parapet:.5}),l=Math.max(1,Math.floor(t.W/8));for(let n=0;n<l;n++){let r=t.W*(n+.5)/l;t.box(i.paint,r-2,r+2,Q,Q+4.2,-.06,0,new K(.62,.64,.66),`flrt`);for(let e=1;e<9;e++)t.box(i.paint,r-2,r+2,Q+e*.46,Q+e*.46+.04,-.09,-.06,mg,`f`);t.box(i.paint,r-2.2,r+2.2,Q+4.2,Q+4.45,-.14,0,e.accent,`flrtb`)}return Tg(e,0,t.W,0,c-.9,e.accent),n.chance(.6)&&zg(e,c),kg(e,n.pick([`Cascabel Freight`,`Bahia Cold Store`,`Marazul Supply`,`Tidewater Cargo`,`Sol Imports`]),t.W/2,-.1,c-2.2,t.W*.6,1,`block`),c}function zg(e,t){let{f:n}=e,r=Math.min(t-Q-1.4,9),i=Math.min(n.D-2,r*1.5);if(r<3.5||i<4)return;let a=n.D/2,o=n.yawOut-Math.PI/2;e.out.artSlots.push({kind:`mural`,x:n.x(n.W+.06,a),y:Q+.9+r/2,z:n.z(n.W+.06,a),yaw:o,width:i,height:r})}function Bg(e,t,n,r,i){let a=e.blocks.find(e=>e.kind===`yard`);if(!a)return;let o=vg(),s=new Bt(e.seed+77);[{x0:a.rect.x0+14,x1:a.rect.x0+74,z0:a.rect.z0+26,z1:a.rect.z0+54},{x0:a.rect.x0+96,x1:a.rect.x0+150,z0:a.rect.z0+26,z1:a.rect.z0+54},{x0:a.rect.x1-92,x1:a.rect.x1-22,z0:a.rect.z0+30,z1:a.rect.z0+62},{x0:a.rect.x1-70,x1:a.rect.x1-26,z0:a.rect.z1-44,z1:a.rect.z1-16}].forEach((e,c)=>{let l={id:9e3+c,block:a.id,district:`port`,rect:e,front:`n`,use:`building`,style:`warehouse`,floors:s.int(1,2),name:``,seed:s.int(1,1e9)},u=new Bt(l.seed),d=new Zh(e,l.front),f=Rg({f:d,r:u,b:o,lot:l,body:u.pick(gg).clone(),accent:u.pick(dg).clone(),neon:u.pick(fg).clone(),seed:c+11,physics:r,materials:n,out:i});t.markBuilding(e,f),i.buildings.push({lot:l,rect:e,roofY:f,frame:d}),i.roofSpots.push({x:on(e),z:dn(e),y:f})}),bg(i.group,o,n,null)}var Vg=V.streetY+V.kerb;function Hg(e,t,n,r,i,a){let o=new Je;o.name=`props`;let c=new Bt(e.seed+5),l=[],u=[],d=new Qh,p=new Qh,m=new Qh,h=new Qh,g=new Qh,_=new Qh,v=a.propDensity,y=(e,n)=>{let r=t.typeAt(e,n);return r===_s.Sidewalk||r===_s.Grass||r===_s.Plaza||r===_s.Sand};for(let e of n)for(let t=e.a+4;t<e.b-3;t+=11){let n=e.axis===`z`?e.c:t,r=e.axis===`z`?t:e.c;l.push({x:n,y:V.streetY+.18,z:r,h:c.range(8.5,11.5),lean:c.range(0,.1),yaw:c.range(0,6.28)})}for(let t of e.blocks){if(t.kind===`yard`)continue;let e=t.rect,n=1.3,r=[];t.roadSides.includes(`n`)&&r.push({ax:`x`,c:e.z0+n,a:e.x0+3,b:e.x1-3,out:[0,-1]}),t.roadSides.includes(`s`)&&r.push({ax:`x`,c:e.z1-n,a:e.x0+3,b:e.x1-3,out:[0,1]}),t.roadSides.includes(`w`)&&r.push({ax:`z`,c:e.x0+n,a:e.z0+3,b:e.z1-3,out:[-1,0]}),t.roadSides.includes(`e`)&&r.push({ax:`z`,c:e.x1-n,a:e.z0+3,b:e.z1-3,out:[1,0]});for(let e of r){let t=0;for(let r=e.a+c.range(0,4);r<e.b;r+=14,t++){let a=e.ax===`x`?r:e.c,o=e.ax===`x`?e.c:r;y(a,o)&&(t%2==0?c.chance(.85*v)&&l.push({x:a,y:Vg,z:o,h:c.range(6.5,10),lean:c.range(0,.16),yaw:c.range(0,6.28)}):(Ug(d,g,a,o,e.out),u.push(new f(a+e.out[0]*1.4,Vg+6.2,o+e.out[1]*1.4)),Wg(_,a+e.out[0]*n,o+e.out[1]*n,e.out),i.addStaticCylinder(a,Vg+3.2,o,3.2,.12,{kind:`world`,surface:`metal`})))}}for(let n of t.waterSides){let t=n===`n`||n===`s`,r=(t?e.x0:e.z0)+4,a=(t?e.x1:e.z1)-4,o=n===`n`?e.z0+2.4:n===`s`?e.z1-2.4:n===`w`?e.x0+2.4:e.x1-2.4;for(let e=r+c.range(0,6);e<a;e+=17){let r=t?e:o,a=t?o:e;y(r,a)&&(c.chance(.5)?l.push({x:r,y:Vg,z:a,h:c.range(6,9),lean:c.range(.05,.22),yaw:c.range(0,6.28)}):Gg(d,p,r,a,t?n===`n`?Math.PI:0:n===`w`?-Math.PI/2:Math.PI/2,i))}}t.kind===`park`&&Kg(t.rect,c,l,d,p,i),t.kind===`plaza`&&qg(t.rect,c,l,d,m,h,i)}Jg(e,t,c,l,d,p,i,v);for(let n of e.islets){let e=Math.round(n.r/6);for(let r=0;r<e;r++){let e=c.range(0,6.28),r=c.range(0,n.r*.5),i=n.x+Math.cos(e)*r,a=n.z+Math.sin(e)*r;l.push({x:i,y:t.heightAt(i,a)-.1,z:a,h:c.range(6,11),lean:c.range(.08,.3),yaw:c.range(0,6.28)})}}Qg(e,t,d,m,g,i),$g(e,c,d,h,i);for(let e of l)i.addStaticCylinder(e.x,e.y+2.2,e.z,2.2,.24,{kind:`world`,surface:`wood`});o.add(e_(l,r));let b=(e,t,n,r=!0)=>{if(e.empty)return;let i=new s(e.build(),t);i.name=n,i.castShadow=r,i.receiveShadow=!0,i.matrixAutoUpdate=!1,o.add(i)};if(b(d,r.paint,`props-paint`),b(p,r.wood,`props-wood`),b(h,r.metal,`props-metal`),b(m,r.neon,`props-neon`,!1),b(g,r.lamp,`lamp-heads`,!1),!_.empty){let e=new s(_.build(),r.glow);e.name=`lamp-pools`,e.matrixAutoUpdate=!1,e.renderOrder=2,o.add(e)}return{group:o,lamps:u,palms:l.map(e=>new f(e.x,e.y,e.z))}}function Ug(e,t,n,r,i){let a=new K(.16,.2,.24);e.cylinder(n,Vg,r,.13,.08,6.3,a,6,!1),e.cylinder(n,Vg,r,.22,.16,.5,a,6,!1);let o=n+i[0]*.8,s=r+i[1]*.8;e.box(Math.min(n,n+i[0]*1.7)-.05,Vg+6.2,Math.min(r,r+i[1]*1.7)-.05,Math.max(n,n+i[0]*1.7)+.05,Vg+6.32,Math.max(r,r+i[1]*1.7)+.05,a),t.box(o+i[0]*.5-.3,Vg+6.08,s+i[1]*.5-.3,o+i[0]*.5+.3,Vg+6.2,s+i[1]*.5+.3,new K(1,1,1))}function Wg(e,t,n,r){let i=8.5,a=new K(1,1,1),o=-r[1],s=r[0],c=t-o*i,l=n-s*i,u=t+o*i,d=n+s*i,f=V.streetY+.03,p=Vg+.03;e.quad([c,f,l],[u,f,d],[u+r[0]*i,f,d+r[1]*i],[c+r[0]*i,f,l+r[1]*i],a,[0,.5,1,1]);let m=4.2;e.quad([u,p,d],[c,p,l],[c-r[0]*m,p,l-r[1]*m],[u-r[0]*m,p,d-r[1]*m],a,[1,.5,0,.2529411764705882])}function Gg(e,t,n,r,i,a){let o=new K(.14,.52,.5),s=new K(1,1,1);t.boxRot(n,Vg+.42,r,1.8,.07,.5,i,s);let c=n-Math.sin(i)*-.26,l=r-Math.cos(i)*-.26;t.boxRot(c,Vg+.5,l,1.8,.5,.06,i,s);for(let t of[-.75,.75]){let a=n+Math.cos(i)*t,s=r-Math.sin(i)*t;e.boxRot(a,Vg,s,.07,.42,.5,i,o)}a.addStaticBox(n,Vg+.3,r,.9,.3,.3,{kind:`world`,surface:`wood`},i)}function Kg(e,t,n,r,i,a){let o=Math.round((e.x1-e.x0)*(e.z1-e.z0)/260);for(let r=0;r<o;r++){let r=t.range(e.x0+4,e.x1-4),i=t.range(e.z0+4,e.z1-4);n.push({x:r,y:Vg,z:i,h:t.range(6,11),lean:t.range(0,.2),yaw:t.range(0,6.28)})}let s=(e.x0+e.x1)/2,c=(e.z0+e.z1)/2,l=new K(.98,.97,.93);r.cylinder(s,Vg,c,4.2,4.2,.5,l,8);for(let e=0;e<8;e++){let t=e/8*Math.PI*2;r.cylinder(s+Math.sin(t)*3.7,Vg+.5,c+Math.cos(t)*3.7,.12,.12,3.2,l,6,!1)}r.cylinder(s,Vg+3.7,c,4.6,.3,1.6,new K(.95,.42,.5),8,!1),a.addStaticCylinder(s,Vg+.25,c,.25,4.2,{kind:`world`,surface:`wood`});for(let e=0;e<4;e++){let t=e/4*Math.PI*2+.4;Gg(r,i,s+Math.sin(t)*8,c+Math.cos(t)*8,t+Math.PI,a)}}function qg(e,t,n,r,i,a,o){let s=(e.x0+e.x1)/2,c=(e.z0+e.z1)/2,l=new K(.95,.93,.88);r.cylinder(s,Vg,c,6.2,6.2,.55,l,24),r.cylinder(s,Vg+.55,c,5.6,5.6,.05,new K(.25,.75,.85),24),r.cylinder(s,Vg+.55,c,2.2,2,.9,l,16),r.cylinder(s,Vg+1.45,c,.7,.35,5.5,l,8),a.cylinder(s,Vg+6.95,c,.5,0,1.1,new K(1,.82,.4),8,!1),i.cylinder(s,Vg+.56,c,5.9,5.9,.07,new K(.2,.95,1),32,!1),i.cylinder(s,Vg+1.46,c,2.05,2.05,.06,new K(1,.3,.65),24,!1),o.addStaticCylinder(s,Vg+.5,c,.5,6.2,{kind:`world`,surface:`concrete`}),o.addStaticCylinder(s,Vg+3,c,3,.9,{kind:`world`,surface:`concrete`});for(let r=0;r<10;r++){let i=r/10*Math.PI*2,a=s+Math.sin(i)*Math.min(26,(e.x1-e.x0)/2-5),o=c+Math.cos(i)*Math.min(18,(e.z1-e.z0)/2-5);n.push({x:a,y:Vg,z:o,h:t.range(9,12),lean:.03,yaw:t.range(0,6.28)})}}function Jg(e,t,n,r,i,a,o,s){let c=e.beach;for(let e=c.z0+10;e<c.z1-10;e+=13)if(n.chance(.7*s)){let i=c.x0+n.range(4,22),a=e+n.range(-4,4);if(Math.abs(a)<9)continue;r.push({x:i,y:t.heightAt(i,a)-.15,z:a,h:n.range(7,12),lean:n.range(.1,.32),yaw:n.range(-.6,.6)})}let l=[16735631,3065014,16761917,8084735,16747069,3842303],u=0;for(let e=c.z0+70;e<c.z1-40;e+=150){let n=c.x0+34;Yg(i,a,n,t.heightAt(n,e),e,new K(l[u%l.length]),new K(l[(u+2)%l.length]),o),u++}for(let e=c.z0+30;e<c.z1-30;e+=24){if(Math.abs(e)<14||!n.chance(.75*s))continue;let r=c.x0+n.range(26,40),o=new K(n.pick(l)),u=n.int(2,4);for(let s=0;s<u;s++){let c=r+n.range(-2,2),l=e+s*4.2-u*2.1,d=t.heightAt(c,l);d<.7||(Xg(i,c,d,l,o,n),Zg(a,i,c+1.3,d,l+.4,n.range(-.3,.3)+Math.PI/2))}}}function Yg(e,t,n,r,i,a,o,s){let c=new K(1,1,1),l=r+2.4;for(let[e,a]of[[-1.4,-1.4],[1.4,-1.4],[-1.4,1.4],[1.4,1.4]])t.cylinder(n+e,r-.4,i+a,.12,.12,2.8,c,6,!1);t.box(n-2.2,l-.14,i-2,n+2.6,l,i+2,c),e.box(n-1.6,l,i-1.5,n+1.2,l+2.2,i+1.5,a),e.quad([n-2,l+2.2,i-1.9],[n-2,l+2.2,i+1.9],[n+1.9,l+2.9,i+1.9],[n+1.9,l+2.9,i-1.9],o),e.quad([n-2,l+2.16,i-1.9],[n+1.9,l+2.86,i-1.9],[n+1.9,l+2.86,i+1.9],[n-2,l+2.16,i+1.9],o),e.box(n+1.18,l+.9,i-1,n+1.22,l+1.8,i+1,new K(.1,.2,.26)),e.box(n-1.62,l+.7,i-1.52,n+1.22,l+.95,i+1.52,o,`nsew`);for(let e of[i-1.95,i+1.95])t.box(n+1.2,l+.85,e-.04,n+2.6,l+.93,e+.04,c);t.box(n+2.52,l+.85,i-1.95,n+2.6,l+.93,i+1.95,c),t.quad([n-2.2,l,i-.7],[n-2.2,l,i+.7],[n-6.2,r-.05,i+.7],[n-6.2,r-.05,i-.7],c),t.quad([n-2.2,l-.05,i-.7],[n-6.2,r-.1,i-.7],[n-6.2,r-.1,i+.7],[n-2.2,l-.05,i+.7],c),s.addStaticBox(n+.2,l-.07,i,2.4,.07,2,{kind:`world`,surface:`wood`}),s.addStaticBox(n-.2,l+1.1,i,1.4,1.1,1.5,{kind:`world`,surface:`wood`});let u=Math.atan2(l-r,4);s.addStaticBoxQuat(n-4.2,(l+r)/2-.1,i,Math.hypot(4,l-r)/2,.08,.7,{x:0,y:0,z:Math.sin(u/2),w:Math.cos(u/2)},{kind:`world`,surface:`wood`})}function Xg(e,t,n,r,i,a){let o=new K(1,1,1);e.cylinder(t,n-.3,r,.04,.04,2.6,o,5,!1);let s=n+2.35,c=n+1.95,l=1.55,u=a.range(-.15,.15);for(let n=0;n<8;n++){let a=n/8*Math.PI*2,d=(n+1)/8*Math.PI*2,f=n%2==0?i:o,p=[t+Math.sin(a)*l,c+Math.sin(a)*u,r+Math.cos(a)*l],m=[t+Math.sin(d)*l,c+Math.sin(d)*u,r+Math.cos(d)*l];e.triangle([t,s,r],p,m,f),e.triangle([t,s-.02,r],m,p,f)}}function Zg(e,t,n,r,i,a){let o=new K(1,1,1);e.boxRot(n,r+.28,i,.65,.06,1.9,a,o),t.boxRot(n,r+.34,i,.6,.05,1.8,a,new K(.3,.8,.82)),e.boxRot(n,r,i,.6,.28,.08,a,o)}function Qg(e,t,n,r,i,a){let{x:o,z:s}=e.lighthouse,c=t.heightAt(o,s)-.3,l=new K(.98,.97,.94),u=new K(.95,.3,.32);n.cylinder(o,c,s,5.2,5.2,1.2,new K(.7,.68,.64),16);let d=3.3,f=c+1.2;for(let e=0;e<6;e++){let t=d-.3;n.cylinder(o,f,s,d,t,4.2,e%2==0?l:u,16,!1),d=t,f+=4.2}n.cylinder(o,f,s,d+.9,d+.9,.25,new K(.15,.2,.24),16),i.cylinder(o,f+.25,s,d-.2,d-.2,2,new K(1,1,1),12,!1),n.cylinder(o,f+2.25,s,d+.2,.1,1.6,u,12,!1),r.cylinder(o,f+.02,s,d+.95,d+.95,.08,new K(1,.85,.4),16,!1),a.addStaticCylinder(o,c+13,s,13.5,3.2,{kind:`world`,surface:`concrete`}),a.addStaticCylinder(o,c+.6,s,.6,5.2,{kind:`world`,surface:`concrete`})}function $g(e,t,n,r,i){let a=e.blocks.find(e=>e.kind===`yard`);if(!a)return;let o=a.rect,s=[13715803,3049131,15576649,3967341,14711391,6253743,15921906,42662].map(e=>new K(e)),c=V.streetY,l=12.2,u=2.44,d=2.6;for(let e=o.x0+30;e<o.x1-96;e+=46)for(let r=0;r<5;r++){let a=o.z0+76+r*3.1+Math.floor(r/2)*9.5;for(let r=0;r<3;r++){let o=e+r*12.6-l,f=t.weighted([[0,2],[1,3],[2,4],[3,3],[4,1]]);for(let e=0;e<f;e++){let r=t.pick(s),i=c+e*d;n.box(o,i,a-u/2,o+l,i+d,a+u/2,r);for(let e=1;e<12;e++)n.box(o+l/12*e-.03,i+.15,a-u/2-.03,o+l/12*e+.03,i+d-.15,a-u/2,r.clone().multiplyScalar(.8),`n`),n.box(o+l/12*e-.03,i+.15,a+u/2,o+l/12*e+.03,i+d-.15,a+u/2+.03,r.clone().multiplyScalar(.8),`s`)}f>0&&i.addStaticBox(o+l/2,c+f*d/2,a,l/2,f*d/2,u/2,{kind:`world`,surface:`metal`})}}let f=new K(.95,.5,.15);for(let e of[o.x0+120,o.x0+300]){let t=o.z1-14;for(let[n,a]of[[-9,-7],[9,-7],[-9,7],[9,7]])r.box(e+n-.6,c,t+a-.6,e+n+.6,c+30,t+a+.6,f),i.addStaticBox(e+n,c+15,t+a,.6,15,.6,{kind:`world`,surface:`metal`});r.box(e-10,c+30,t-8,e+10,c+32,t+8,f),r.box(e-1.4,c+32,t-22,e+1.4,c+34.2,t+46,f),r.box(e-2.2,c+27.5,t+20,e+2.2,c+30,t+25,new K(.9,.9,.9)),r.box(e-.3,c+34.2,t-4,e+.3,c+44,t-3.4,f)}}function e_(e,t){let n=new Je;if(n.name=`palms`,e.length===0)return n;let r=new Qh,i=new K(.62,.5,.38),a=new K(.5,.4,.3);for(let e=0;e<9;e++){let t=e/9,n=(e+1)/9,o=e=>e*e*.09,s=.03-t*.012;r.cylinder(o(t),t,0,s*1.12,s,n-t,e%2==0?i:a,7,!1)}let o=new St(r.build(),t.paint,e.length),s=new Qh,c=new K(1,1,1);for(let e=0;e<13;e++){let t=e/13*Math.PI*2+e%2*.2,n=.55+e%3*.16,r=.36+e%4*.035,i=.085,a=Math.sin(t),o=Math.cos(t),l=-o,u=a,d=null;for(let e=0;e<=5;e++){let t=e/5,f=t*r,p=Math.sin(t*1.3)*.11-t*t*n*.24,m=a*f,h=o*f,g=s.vertex(m+l*i,p,h+u*i,0,1,0,t,0,c),_=s.vertex(m-l*i,p,h-u*i,0,1,0,t,1,c);d&&(s.tri(d[0],d[1],_),s.tri(d[0],_,g)),d=[g,_,0,0]}}s.cylinder(0,-.02,0,.022,.03,.03,new K(.3,.42,.18),6);let l=new St(s.build(),t.frond,e.length),u=new an,d=new Ot,p=new f(0,1,0),m=new f,h=new R;e.forEach((e,t)=>{m.set(Math.cos(e.yaw),0,Math.sin(e.yaw)),d.setFromAxisAngle(p,e.yaw),h.position.set(e.x,e.y,e.z),h.quaternion.setFromAxisAngle(m,e.lean).multiply(d),h.scale.set(e.h,e.h,e.h),h.updateMatrix(),o.setMatrixAt(t,h.matrix),u.copy(h.matrix);let n=new f(.09,1,0).applyMatrix4(u);h.position.copy(n),h.scale.setScalar(e.h*.9+3.2),h.updateMatrix(),l.setMatrixAt(t,h.matrix)});for(let e of[o,l])e.instanceMatrix.setUsage(me),e.instanceMatrix.needsUpdate=!0,e.castShadow=!0,e.receiveShadow=!0,e.frustumCulled=!1,n.add(e);return o.name=`palm-trunks`,l.name=`palm-crowns`,n}var t_=V.streetY,n_=t_+.012;function r_(e,t,n){let r=new Je;r.name=`roads`;let i=new Qh,a=new Qh,o=new Qh,c=new Qh,l=new Qh,u=new Qh,d=[],f=new K(.74,.74,.72),p=new K(.86,.62,.1),m=new K(.82,.82,.8);for(let t of e.segments){if(t.bridge){i_(t,a,o,l,i,u,n);continue}if(t.b-t.a<4)continue;let e=(e,n,r,a,o,s,c=i)=>{t.axis===`z`?c.floor(t.c+r,e,t.c+a,n,o,s):c.floor(e,t.c+r,n,t.c+a,o,s)},r=t.w/2;if(t.median){let i=1.3,a=t.a+5,s=t.b-5;s-a>6&&(t.axis===`z`?(o.box(t.c-i,t_,a,t.c+i,t_+.18,s,m,`nsew`),c.floor(t.c-i,a,t.c+i,s,t_+.18,new K(1,1,1)),n.addStaticBox(t.c,t_+.09,(a+s)/2,i,.09,(s-a)/2,{kind:`world`,surface:`grass`})):(o.box(a,t_,t.c-i,s,t_+.18,t.c+i,m,`nsew`),c.floor(a,t.c-i,s,t.c+i,t_+.18,new K(1,1,1)),n.addStaticBox((a+s)/2,t_+.09,t.c,(s-a)/2,.09,i,{kind:`world`,surface:`grass`})),d.push({axis:t.axis,c:t.c,a,b:s}));let l=(r+i)/2;for(let n=t.a+3;n+3<t.b-3;n+=9)e(n,n+3,l-.07,l+.07,n_,f),e(n,n+3,-l-.07,-l+.07,n_,f)}else if(e(t.a+1.5,t.b-1.5,-.2,-.08,n_,p),e(t.a+1.5,t.b-1.5,.08,.2,n_,p),t.w>=12){let n=r-2.4;for(let i=t.a+4;i+5.5<t.b-4;i+=6)e(i,i+.1,n,r-.2,n_,f),e(i,i+.1,-r+.2,-n,n_,f);e(t.a+4,t.b-4,n-.05,n+.05,n_,f),e(t.a+4,t.b-4,-n-.05,-n+.05,n_,f)}for(let n of[0,1]){let i=n===0?t.a:t.b,a=n===0?1:-1,o=i+a*.8,s=i+a*3.4;for(let t=-r+.5;t+.55<=r-.4;t+=1.1)e(Math.min(o,s),Math.max(o,s),t,t+.55,n_,f);let c=i+a*4.1,l=i+a*4.45,u=t.axis===`z`?n===0?1:-1:n===0?-1:1,d=u>0?.3:-r+.4,p=u>0?r-.4:-.3;e(Math.min(c,l),Math.max(c,l),d,p,n_,f)}}let h=(e,t,n,i=!1)=>{if(e.empty)return;let a=new s(e.build(),t);a.name=n,a.receiveShadow=!0,a.castShadow=i,a.matrixAutoUpdate=!1,r.add(a)};return h(i,t.marking,`road-paint`),h(a,t.asphalt,`bridge-decks`,!0),h(o,t.concrete,`road-concrete`,!0),h(c,t.grass,`medians`),h(l,t.paint,`bridge-trim`,!0),h(u,t.neon,`bridge-neon`),{group:r,medians:d}}function i_(e,t,n,r,i,a,o){let s=e.bridge.rise,c=e.b-e.a,l=Math.max(12,Math.round(c/3.2)),u=e.w/2,d=new K(1,1,1),f=new K(.93,.9,.86),p=e.bridge.over===`bay`?new K(.99,.62,.5):new K(.56,.9,.85),m=e.bridge.over===`bay`?new K(1,.35,.55):new K(.2,.95,.9),h=new K(.86,.62,.1),g=.7,_=1.05,v=.35,y=(t,n,r)=>e.axis===`z`?[e.c+n,r,t]:[t,r,e.c+n];for(let b=0;b<l;b++){let x=b/l,S=(b+1)/l,C=e.a+x*c,w=e.a+S*c,T=t_+un(x,s),E=t_+un(S,s);e.axis===`z`?t.quad(y(C,-u,T),y(w,-u,E),y(w,u,E),y(C,u,T),d,[(e.c-u)*.25,C*.25,(e.c+u)*.25,w*.25]):t.quad(y(C,-u,T),y(C,u,T),y(w,u,E),y(w,-u,E),d,[C*.25,(e.c-u)*.25,w*.25,(e.c+u)*.25]);let D=T-g,O=E-g;e.axis===`z`?(n.quad(y(C,-u,D),y(C,u,D),y(w,u,O),y(w,-u,O),f),n.quad(y(C,-u,D),y(w,-u,O),y(w,-u,E),y(C,-u,T),f),n.quad(y(w,u,O),y(C,u,D),y(C,u,T),y(w,u,E),f)):(n.quad(y(C,-u,D),y(w,-u,O),y(w,u,O),y(C,u,D),f),n.quad(y(w,-u,O),y(C,-u,D),y(C,-u,T),y(w,-u,E),f),n.quad(y(C,u,D),y(w,u,O),y(w,u,E),y(C,u,T),f));for(let t of[-1,1]){let n=t<0?-u:u-v,i=n+v,o=(e,t,n)=>y(e,t,n),s=t<0?i:n,c=t<0?n:i,l=[[o(C,s,T),o(w,s,E),o(w,s,E+_),o(C,s,T+_)],[o(w,c,E),o(C,c,T),o(C,c,T+_),o(w,c,E+_)],[o(C,s,T+_),o(w,s,E+_),o(w,c,E+_),o(C,c,T+_)]];for(let n of l)e.axis===`z`==t<0?r.quad(n[0],n[1],n[2],n[3],p):r.quad(n[1],n[0],n[3],n[2],p);let d=T+_*.55,f=E+_*.55,h=c+t*.02;a.quad(o(C,h,d-.05),o(w,h,f-.05),o(w,h,f+.05),o(C,h,d+.05),m)}let k=T+.015,A=E+.015;b%2==0&&(e.axis===`z`?i.quad(y(C,-.08,k),y(w,-.08,A),y(w,.08,A),y(C,.08,k),h):i.quad(y(C,-.08,k),y(C,.08,k),y(w,.08,A),y(w,-.08,A),h));let j=E-T,ee=w-C,te=Math.atan2(j,ee),M=Math.hypot(ee,j)/2+.02,ne=(C+w)/2,re=(T+E)/2,ie=te/2,N=e.axis===`z`?{x:-Math.sin(ie),y:0,z:0,w:Math.cos(ie)}:{x:0,y:0,z:Math.sin(ie),w:Math.cos(ie)},ae=y(ne,0,re-g/2*Math.cos(te));e.axis===`z`?o.addStaticBoxQuat(ae[0],ae[1],ae[2],u,g/2,M,N,{kind:`world`,surface:`asphalt`}):o.addStaticBoxQuat(ae[0],ae[1],ae[2],M,g/2,u,N,{kind:`world`,surface:`asphalt`});for(let t of[-1,1]){let n=y(ne,t*(u-v/2),re+_/2);e.axis===`z`?o.addStaticBoxQuat(n[0],n[1],n[2],v/2,_/2,M,N,{kind:`world`,surface:`concrete`}):o.addStaticBoxQuat(n[0],n[1],n[2],M,_/2,v/2,N,{kind:`world`,surface:`concrete`})}}let b=e.bridge.over===`bay`?5:2;for(let t=1;t<=b;t++){let r=t/(b+1),i=e.a+r*c,a=t_+un(r,s)-g;if(!(a<.8))for(let e of[-1,1]){let t=y(i,e*(u-1.6),0);n.cylinder(t[0],-4,t[2],.75,.6,a- -4,f,10,!1),o.addStaticCylinder(t[0],(a+-4)/2,t[2],(a- -4)/2,.7,{kind:`world`,surface:`concrete`})}}}var a_=class{scene;lamps;lights=[];slot=[];timer=0;constructor(e,t,n){this.scene=e,this.lamps=t,this.setCount(n)}setCount(e){for(;this.lights.length>e;)this.lights.pop().removeFromParent(),this.slot.pop();for(;this.lights.length<e;){let e=new wt(16767392,0,26,1.7);e.castShadow=!1,e.position.set(0,-50,0),this.scene.add(e),this.lights.push(e),this.slot.push(-1)}this.timer=0}update(e,t,n){if(this.lights.length!==0){this.timer-=e,this.timer<=0&&n>.02&&(this.timer=.3,this.assign(t));for(let e=0;e<this.lights.length;e++){let r=this.lights[e];if(this.slot[e]<0||n<=.02){r.intensity=0;continue}let i=Math.hypot(r.position.x-t.x,r.position.z-t.z);r.intensity=n*46*(1-I(34,58,i))}}}assign(e){let t=this.lights.length,n=[],r=[];for(let i=0;i<this.lamps.length;i++){let a=this.lamps[i],o=(a.x-e.x)**2+(a.z-e.z)**2;if(n.length===t&&o>=r[t-1])continue;let s=n.length<t?n.length:t-1;for(;s>0&&r[s-1]>o;)n[s]=n[s-1],r[s]=r[s-1],s--;n[s]=i,r[s]=o}let i=new Set(n),a=[];for(let e=0;e<t;e++){let t=this.slot[e];t>=0&&i.has(t)?i.delete(t):a.push(e)}for(let e of i){let t=a.pop();if(t===void 0)break;this.slot[t]=e;let n=this.lamps[e];this.lights[t].position.set(n.x,n.y-.4,n.z)}}},o_=V.streetY,s_=V.streetY+V.kerb,c_=new K(1,1,1);function l_(e,t,n){let r=new Je;r.name=`terrain`;let i=new Qh,a=new Qh,o=new Qh,c=new Qh,l=new Qh,u=new Qh,d=new Qh,f=new Qh;a.uvScale=.2;let p=new K(.86,.84,.8),m=new K(.97,.95,.9),h=new K(.8,.8,.78),g=[...e.islands.map(e=>e.rect),e.blocks.find(e=>e.kind===`yard`).rect];for(let e of g)i.floor(e.x0,e.z0,e.x1,e.z1,o_,c_),a.box(e.x0,-5,e.z0,e.x1,o_,e.z1,p,`nsew`),n.addStaticBox((e.x0+e.x1)/2,(o_+-4-2)/2,(e.z0+e.z1)/2,(e.x1-e.x0)/2,(o_- -4+2)/2,(e.z1-e.z0)/2,{kind:`world`,surface:`asphalt`});for(let t of e.blocks){if(t.kind===`yard`)continue;let r=t.rect;if((t.kind===`park`?c:t.kind===`plaza`?l:o).floor(r.x0,r.z0,r.x1,r.z1,s_,c_),a.box(r.x0,o_,r.z0,r.x1,s_,r.z1,h,`nsew`),t.kind===`park`){let e=2.2;o.floor(r.x0,r.z0,r.x1,r.z0+e,s_+.012,c_),o.floor(r.x0,r.z1-e,r.x1,r.z1,s_+.012,c_),o.floor(r.x0,r.z0+e,r.x0+e,r.z1-e,s_+.012,c_),o.floor(r.x1-e,r.z0+e,r.x1,r.z1-e,s_+.012,c_)}n.addStaticBox((r.x0+r.x1)/2,(o_+s_)/2,(r.z0+r.z1)/2,(r.x1-r.x0)/2,V.kerb/2,(r.z1-r.z0)/2,{kind:`world`,surface:t.kind===`park`?`grass`:t.kind===`plaza`?`tile`:`concrete`});for(let n of t.waterSides)d_(a,d,r,n,m,u_(e,r,n))}let _=new K(.9,.9,.86);for(let t of e.lots){let e=t.rect;if(t.use===`parking`){i.floor(e.x0,e.z0,e.x1,e.z1,s_+.015,new K(.82,.82,.84));let t=e.x1-e.x0>e.z1-e.z0,n=Math.floor((t?e.x1-e.x0:e.z1-e.z0)/2.8);for(let r=1;r<n;r++){let n=(t?e.x0:e.z0)+r*2.8;t?(d.floor(n-.06,e.z0+.6,n+.06,e.z0+5.4,s_+.03,_),d.floor(n-.06,e.z1-5.4,n+.06,e.z1-.6,s_+.03,_)):(d.floor(e.x0+.6,n-.06,e.x0+5.4,n+.06,s_+.03,_),d.floor(e.x1-5.4,n-.06,e.x1-.6,n+.06,s_+.03,_))}}else t.use===`garden`?c.floor(e.x0+.5,e.z0+.5,e.x1-.5,e.z1-.5,s_+.02,c_):t.use===`pool`&&f_(e,t.seed,l,f,d,n)}let v=e.blocks.find(e=>e.kind===`yard`).rect,y=new K(.95,.72,.12);for(let e=v.x0+20;e<v.x1-10;e+=50)d.floor(e-.1,v.z0+14,e+.1,v.z1-8,o_+.02,y);for(let t of[`w`,`e`,`s`])d_(a,d,v,t,m,u_(e,v,t));let b=new K(1,1,1),x=new K(.55,.42,.3);for(let t of e.piers){let e=t.rect,r=t.y;u.uvScale=.5;let i=e.x1-e.x0>e.z1-e.z0;i?u.floor(e.x0,e.z0,e.x1,e.z1,r,b):u.quad([e.x0,r,e.z0],[e.x0,r,e.z1],[e.x1,r,e.z1],[e.x1,r,e.z0],b,[e.z0*.5,e.x0*.5,e.z1*.5,e.x1*.5]),u.box(e.x0,r-.35,e.z0,e.x1,r,e.z1,x,`nsewb`);for(let t=(i?e.x0:e.z0)+1.5;t<(i?e.x1:e.z1);t+=7)for(let n of[.25,-.25]){let a=i?t:n>0?e.x0+.25:e.x1-.25,o=i?n>0?e.z0+.25:e.z1-.25:t;u.cylinder(a,-4,o,.2,.2,r- -4+.9,x,7,!0)}n.addStaticBox((e.x0+e.x1)/2,r-.2,(e.z0+e.z1)/2,(e.x1-e.x0)/2,.2,(e.z1-e.z0)/2,{kind:`world`,surface:`wood`})}for(let t of e.stairs)p_(t.x,t.z,t.dir,t.width,a,n);n.addStaticBox(0,-5,0,V.bound+100,1,V.bound+100,{kind:`world`,surface:`sand`});let S=(e,t,n,i=!1)=>{if(e.empty)return;let a=new s(e.build(),t);a.name=n,a.receiveShadow=!0,a.castShadow=i,a.matrixAutoUpdate=!1,r.add(a)};return S(i,t.asphalt,`asphalt`),S(a,t.concrete,`concrete`,!0),S(o,t.sidewalk,`sidewalk`),S(c,t.grass,`grass`),S(l,t.plaza,`plaza`),S(u,t.wood,`piers`,!0),S(d,t.marking,`ground-paint`),S(f,t.pool,`pools`),r.add(m_(e,t,n)),r}function u_(e,t,n){let r=[];for(let i of e.stairs)(n===`n`&&i.dir===`n`&&Math.abs(i.z-t.z0)<.6&&i.x>t.x0&&i.x<t.x1||n===`s`&&i.dir===`s`&&Math.abs(i.z-t.z1)<.6&&i.x>t.x0&&i.x<t.x1||n===`w`&&i.dir===`w`&&Math.abs(i.x-t.x0)<.6&&i.z>t.z0&&i.z<t.z1||n===`e`&&i.dir===`e`&&Math.abs(i.x-t.x1)<.6&&i.z>t.z0&&i.z<t.z1)&&r.push(n===`n`||n===`s`?i.x:i.z);return r}function d_(e,t,n,r,i,a){let o=.45,s=.22,c=r===`n`||r===`s`,l=c?n.x0:n.z0,u=c?n.x1:n.z1,d=a.slice().sort((e,t)=>e-t),f=[],p=l;for(let e of d)e-2.2>p&&f.push([p,e-2.2]),p=e+2.2;u>p&&f.push([p,u]);let m=new K(.2,.75,.72);for(let[a,c]of f)r===`n`?(e.box(a,s_,n.z0,c,s_+s,n.z0+o,i),t.floor(a,n.z0+o+.15,c,n.z0+o+.3,s_+.02,m)):r===`s`?(e.box(a,s_,n.z1-o,c,s_+s,n.z1,i),t.floor(a,n.z1-o-.3,c,n.z1-o-.15,s_+.02,m)):r===`w`?(e.box(n.x0,s_,a,n.x0+o,s_+s,c,i),t.floor(n.x0+o+.15,a,n.x0+o+.3,c,s_+.02,m)):(e.box(n.x1-o,s_,a,n.x1,s_+s,c,i),t.floor(n.x1-o-.3,a,n.x1-o-.15,c,s_+.02,m))}function f_(e,t,n,r,i,a){n.floor(e.x0,e.z0,e.x1,e.z1,s_+.02,new K(1,1,1));let o=(e.x1-e.x0)*.22,s=(e.z1-e.z0)*.24,c={x0:e.x0+o,x1:e.x1-o,z0:e.z0+s,z1:e.z1-s},l=new K(.98,.98,.95),u=.35,d=s_+.02;i.box(c.x0-u,d,c.z0-u,c.x1+u,d+.12,c.z0,l),i.box(c.x0-u,d,c.z1,c.x1+u,d+.12,c.z1+u,l),i.box(c.x0-u,d,c.z0,c.x0,d+.12,c.z1,l),i.box(c.x1,d,c.z0,c.x1+u,d+.12,c.z1,l),r.floor(c.x0,c.z0,c.x1,c.z1,d+.06,new K(1,1,1))}function p_(e,t,n,r,i,a){let{steps:o,rise:s,run:c}=mn,l=new K(.9,.88,.84),u=n===`e`?1:n===`w`?-1:0,d=n===`s`?1:n===`n`?-1:0,f=r/2;for(let n=0;n<o;n++){let r=s_-n*s-0,a=n*c,o=a+c,p=u===0?e-f:e+Math.min(a*u,o*u),m=u===0?e+f:e+Math.max(a*u,o*u),h=d===0?t-f:t+Math.min(a*d,o*d),g=d===0?t+f:t+Math.max(a*d,o*d);i.box(p,-4,h,m,r,g,l,`nsewt`)}let p=o*c,m=o*s,h=Math.atan2(m,p),g=Math.hypot(p,m)/2,_=e+p/2*u,v=t+p/2*d,y=s_-m/2-.3*Math.cos(h),b=h/2,x=u===0?{x:Math.sin(b)*d,y:0,z:0,w:Math.cos(b)}:{x:0,y:0,z:-Math.sin(b)*u,w:Math.cos(b)};a.addStaticBoxQuat(_,y,v,u===0?f:g,.3,d===0?f:g,x,{kind:`world`,surface:`concrete`})}function m_(e,t,n){let r=new Je;r.name=`sand`;let i=e.beach.rect,a=[{x0:i.x0,x1:i.x1+126,z0:-V.half,z1:V.half,step:2.5,height:(t,n)=>bs(e,t,n),skip:(e,t)=>cn(i,e,t,-3)},...e.islets.map(e=>({x0:e.x-e.r*1.85,x1:e.x+e.r*1.85,z0:e.z-e.r*1.85,z1:e.z+e.r*1.85,step:2,height:(t,n)=>xs(e,t,n)}))],o=new K(1,1,1),c=new K(.74,.68,.56),l=new K(.5,.62,.6),u=new K;for(let e of a){let i=Math.round((e.x1-e.x0)/e.step),a=Math.round((e.z1-e.z0)/e.step),d=new Qh,f=new Int32Array((i+1)*(a+1)).fill(-1),p=new Float32Array((i+1)*(a+1));for(let t=0;t<=a;t++)for(let n=0;n<=i;n++)p[t*(i+1)+n]=e.height(e.x0+n*e.step,e.z0+t*e.step);let m=(t,n)=>{let r=n*(i+1)+t;if(f[r]>=0)return f[r];let s=e.x0+t*e.step,m=e.z0+n*e.step,h=p[r],g=p[n*(i+1)+Math.max(0,t-1)],_=p[n*(i+1)+Math.min(i,t+1)],v=p[Math.max(0,n-1)*(i+1)+t],y=p[Math.min(a,n+1)*(i+1)+t],b=(g-_)/(2*e.step),x=(v-y)/(2*e.step),S=Math.hypot(b,1,x),C=1-I(.05,.7,h);u.copy(o).lerp(c,C*.8),h<0&&u.lerp(l,I(0,-3,h));let w=.96+gt(t,n,5)*.08;u.multiplyScalar(w);let T=d.vertex(s,h,m,b/S,1/S,x/S,s*.12,m*.12,u);return f[r]=T,T},h=new Uint8Array(i*a);for(let t=0;t<a;t++)for(let n=0;n<i;n++)if(e.skip?.(e.x0+(n+.5)*e.step,e.z0+(t+.5)*e.step))h[t*i+n]=2;else{let e=Math.max(p[t*(i+1)+n],p[(t+1)*(i+1)+n+1],p[t*(i+1)+n+1],p[(t+1)*(i+1)+n]);h[t*i+n]=e<-3.98?0:1}let g=(t,n,r,a,o,s)=>{let c=p[n*(i+1)+t],u=p[a*(i+1)+r];if(Math.max(c,u)<-3.98)return;let f=e.x0+t*e.step,m=e.z0+n*e.step,h=e.x0+r*e.step,g=e.z0+a*e.step,_=-4.4,v=d.vertex(f,c,m,o,0,s,f*.12,m*.12,l),y=d.vertex(h,u,g,o,0,s,h*.12,g*.12,l),b=d.vertex(f,_,m,o,0,s,f*.12,m*.12+.5,l),x=d.vertex(h,_,g,o,0,s,h*.12,g*.12+.5,l);(g-m)*o+(f-h)*s<0?(d.tri(v,y,x),d.tri(v,x,b)):(d.tri(v,x,y),d.tri(v,b,x))},_=(e,t)=>e<0||t<0||e>=i||t>=a||h[t*i+e]===0;for(let e=0;e<a;e++)for(let t=0;t<i;t++){if(h[e*i+t]!==1)continue;let n=m(t,e),r=m(t,e+1),a=m(t+1,e+1),o=m(t+1,e);d.tri(n,r,a),d.tri(n,a,o),_(t-1,e)&&g(t,e,t,e+1,-1,0),_(t+1,e)&&g(t+1,e,t+1,e+1,1,0),_(t,e-1)&&g(t,e,t+1,e,0,-1),_(t,e+1)&&g(t,e+1,t+1,e+1,0,1)}if(d.empty)continue;let v=new s(d.build(),t.sand);v.receiveShadow=!0,v.matrixAutoUpdate=!1,v.name=`sand-patch`,r.add(v);let y=d.collisionData();n.addStaticTrimesh(y.vertices,y.indices,{kind:`world`,surface:`sand`})}return r}var h_=class e{seed;group=new Je;layout;field;materials;sky;water;city;props;streetLights;lastTime=0;constructor(e,t,n,r,i,a){this.seed=e;let o=i.quality;this.group.name=`world`,a(.2,`Surveying Marazul Bay`),this.layout=fn(e),this.field=new Ss(this.layout),this.materials=new Ph(o),this.sky=new Bh(n,t,o),a(.32,`Pouring streets and seawalls`),this.group.add(l_(this.layout,this.materials,r));let s=r_(this.layout,this.materials,r);this.group.add(s.group),a(.48,`Raising the skyline`),this.city=yg(this.layout,this.field,this.materials,r),this.group.add(this.city.group),a(.62,`Planting palms`),this.props=Hg(this.layout,this.field,s.medians,this.materials,r,o),this.group.add(this.props.group),this.streetLights=new a_(t,this.props.lamps,o.streetLights),a(.7,`Filling the canals`),this.water=new Jh(t,this.field,this.sky,o),t.add(this.group),this.materials.setNight(this.sky.night)}static create(t,n,r,i,a,o){return new e(t,n,r,i,a,o)}setHour(e){this.sky.setHour(e),this.materials.setNight(this.sky.night)}update(e,t,n,r){let i=Math.min(.25,Math.max(0,e-this.lastTime));this.lastTime=e,this.sky.update(e,t,n,r),this.streetLights.update(i,n,this.sky.night),this.water.update(e,t),this.materials.flicker(e)}},g_=[{hold:90,shrink:60,radius:360,damage:1},{hold:60,shrink:45,radius:210,damage:2},{hold:45,shrink:40,radius:115,damage:4},{hold:35,shrink:30,radius:55,damage:7},{hold:25,shrink:25,radius:20,damage:10},{hold:15,shrink:20,radius:0,damage:14}],__=940,v_=420,y_={x:0,z:0},b_=`
  varying vec3 vWorld;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`,x_=`
  uniform float uTime;
  uniform float uRadius;
  uniform float uFlash;
  uniform float uDay;
  uniform float uFar;
  uniform vec3 uRain;
  uniform vec3 uGlow;
  varying vec3 vWorld;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  void main() {
    // Metres around the wall and up it, so the pattern keeps its size as the eye closes.
    float around = vUv.x * 6.2831853 * max(uRadius, 30.0);
    float up = vWorld.y;
    // Rain driven sideways: long streaks leaning with the wind, in two layers.
    float lean = around + up * 0.55;
    float streaks = noise(vec2(lean * 0.9, up * 0.035 + uTime * 2.6));
    streaks = smoothstep(0.55, 0.95, streaks);
    float sheets = noise(vec2(around * 0.012 - uTime * 0.11, up * 0.01 + uTime * 0.05));
    float bands = noise(vec2(around * 0.045 - uTime * 0.35, up * 0.02 - uTime * 0.2));
    float body = 0.34 + 0.3 * sheets + 0.22 * bands;
    // Thick at the ground where the spray is, thinning into the cloud above.
    float foot = 1.0 - smoothstep(0.0, 26.0, up);
    float top = 1.0 - smoothstep(180.0, ${v_.toFixed(1)}, up);
    float alpha = clamp((body + streaks * 0.3 + foot * 0.35) * top, 0.0, 0.92);
    vec3 col = mix(uRain * 0.55, uRain, sheets) * (0.35 + 0.65 * uDay);
    col += uGlow * (foot * 0.5 + streaks * 0.25);
    // Lightning inside the wall lights a patch of it.
    float lit = smoothstep(0.62, 1.0, noise(vec2(around * 0.006 + floor(uTime * 0.9) * 3.7, up * 0.004)));
    col += vec3(0.85, 0.95, 1.0) * uFlash * lit * 2.4;
    // The wall melts into the haze well before the far end of the view, so it never ends in a cut edge.
    alpha *= 1.0 - smoothstep(uFar * 0.5, uFar * 0.9, distance(cameraPosition, vWorld));
    gl_FragColor = vec4(col, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`,S_=class{game;x=0;z=0;radius=__;nextX=0;nextZ=0;nextRadius=__;phase=0;stage=`idle`;left=0;damage=0;fromX=0;fromZ=0;fromRadius=__;tick=0;time=0;flash=0;flashIn=3;rng=new Bt(1);sparks=new Bt(20903);wall;material;playerOutside=0;constructor(e){this.game=e,this.material=new Ve({uniforms:{uTime:{value:0},uRadius:{value:__},uFlash:{value:0},uDay:{value:1},uFar:{value:2e3},uRain:{value:new K(9418436)},uGlow:{value:new K(2806722).multiplyScalar(.5)}},vertexShader:b_,fragmentShader:x_,transparent:!0,depthWrite:!1,side:2,fog:!1});let t=new Oe(1,1,v_,160,1,!0);t.translate(0,v_/2-6,0),this.wall=new s(t,this.material),this.wall.name=`eyewall`,this.wall.renderOrder=6,this.wall.frustumCulled=!1,this.wall.visible=!1,e.engine.scene.add(this.wall)}begin(e){this.rng=new Bt(e^243153425),this.phase=0,this.x=this.fromX=0,this.z=this.fromZ=0,this.radius=this.fromRadius=__,this.stage=`hold`,this.left=g_[0].hold,this.damage=g_[0].damage,this.tick=0,this.pickNext(),this.wall.visible=!0,this.emit()}clear(){this.stage=`idle`,this.radius=this.nextRadius=__,this.wall.visible=!1,this.playerOutside=0,this.game.world.sky.storm=0}pickNext(){let e=g_[this.phase],t=this.rng,n=this.game.nav,r=Math.max(0,this.fromRadius-e.radius),i=this.fromX,a=this.fromZ;for(let o=0;o<24;o++){let o,s;if(this.phase===0){let n=this.game.world.layout.pois,r=n.length>0?t.pick(n):{x:0,z:0,r:60};o=r.x+t.range(-70,70),s=r.z+t.range(-70,70);let i=V.half-e.radius*.7;if(Math.abs(o)>i||Math.abs(s)>i)continue}else{let e=t.range(0,Math.PI*2),n=r*.85*Math.sqrt(t.next());o=this.fromX+Math.cos(e)*n,s=this.fromZ+Math.sin(e)*n}if(n.nearestOpen(o,s,Math.min(5,2+e.radius*.05),60,y_)&&Math.hypot(y_.x-this.fromX,y_.z-this.fromZ)<=r){i=y_.x,a=y_.z;break}}this.nextX=i,this.nextZ=a,this.nextRadius=e.radius}emit(){this.game.events.emit(`zone`,{phase:this.phase,stage:this.stage,left:this.left})}inside(e,t,n=0){return Math.hypot(e-this.x,t-this.z)<=this.radius-n}outsideNext(e,t){return Math.hypot(e-this.nextX,t-this.nextZ)-this.nextRadius}toWall(e,t){return this.radius-Math.hypot(e-this.x,t-this.z)}get closesIn(){return this.stage===`hold`?this.left+g_[this.phase].shrink:this.stage===`shrink`?this.left:0}fixedUpdate(e){if(this.stage===`idle`)return;let t=this.game;if(this.time+=e,this.stage!==`closed`&&t.match.running){if(this.left-=e,this.stage===`shrink`){let e=g_[this.phase],t=I(0,1,at(1-this.left/e.shrink));this.x=G(this.fromX,this.nextX,t),this.z=G(this.fromZ,this.nextZ,t),this.radius=G(this.fromRadius,this.nextRadius,t)}this.left<=0&&(this.stage===`hold`?(this.stage=`shrink`,this.left=g_[this.phase].shrink,this.damage=g_[this.phase].damage,t.sound(`zone_warning`)):(this.x=this.fromX=this.nextX,this.z=this.fromZ=this.nextZ,this.radius=this.fromRadius=this.nextRadius,this.phase++,this.phase>=g_.length?(this.phase=g_.length-1,this.stage=`closed`,this.left=0):(this.stage=`hold`,this.left=g_[this.phase].hold,this.pickNext())),this.emit())}if(this.tick+=e,!(this.tick<1)&&(--this.tick,t.match.running))for(let e of t.match.combatants){if(!e.alive||e.state===`plane`)continue;let n=e.position;if(!this.inside(n.x,n.z)&&(t.hurt(e,this.damage,{by:null,cause:`storm`}),!t.match.running))return}}frameUpdate(e){if(this.stage===`idle`)return;let t=this.material.uniforms,n=this.game.world.sky;this.wall.position.set(this.x,0,this.z);let r=Math.max(.5,this.radius);this.wall.scale.set(r,1,r),this.flashIn-=e,this.flashIn<=0&&(this.flash=1,this.flashIn=2.5+this.sparks.next()*7),this.flash=Math.max(0,this.flash-e*3.2),t.uTime.value=this.time,t.uRadius.value=r,t.uFlash.value=this.flash,t.uDay.value=1-n.night*.75,t.uFar.value=this.game.engine.camera.far;let i=this.game.engine.camera.position,a=this.inside(i.x,i.z)?0:at((Math.hypot(i.x-this.x,i.z-this.z)-this.radius)/12+.35);this.playerOutside=H(this.playerOutside,a,4,e),n.storm=this.playerOutside*.55}dispose(){this.wall.removeFromParent(),this.wall.geometry.dispose(),this.material.dispose()}},C_=`modulepreload`,w_=function(e,t){return new URL(e,t).href},T_={},E_=function(e){return e.pathname.endsWith(`.css`)},D_=function(e,t,n){if(t in e)return e[t];let r=n();if(!r){e[t]=void 0;return}let i=r.then(()=>{e[t]=void 0},n=>{throw e[t]=void 0,n});return e[t]=i,i},O_=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e,i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}function s(e){return import.meta.resolve?new URL(import.meta.resolve(e)):new URL(e,import.meta.url)}r=o(t.map(t=>{t=w_(t,n);let r=s(t),i=E_(r);return D_(T_,r.href,()=>{if(e===void 0){e={all:new Set,styles:new Set};let t=document.getElementsByTagName(`link`);for(let n=t.length-1;n>=0;n--){let r=t[n];e.all.add(r.href),r.rel===`stylesheet`&&e.styles.add(r.href)}}if((i?e.styles:e.all).has(r.href))return;let t=document.createElement(`link`);if(t.rel=i?`stylesheet`:C_,i||(t.as=`script`),t.crossOrigin=``,t.href=r.href,a&&t.setAttribute(`nonce`,a),document.head.appendChild(t),i)return new Promise((e,n)=>{let i=a=>{t.removeEventListener(`load`,i),t.removeEventListener(`error`,i),a.type===`error`?n(Error(`Unable to preload CSS for ${r}`)):e(a)};t.addEventListener(`load`,i),t.addEventListener(`error`,i)})})}).filter(e=>e!==void 0))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},k_=`models/character.glb`,A_=class{canvas;options;settings=new Bp;assets=new up;events=new Ap;engine;input;physics;world;clips;characterAsset;camera;drop;fx=new Jm;match=new Sm(this);combat;loot;nav;zone;bots;audio=null;characters=[];interactions=new Tm;vehicles=[];systems=[];debugExt={};player=null;controller=null;phase=`boot`;errors=[];viewTarget=new f(0,10,0);orbit=0;cameraOverride=!1;debugChase=null;env={waterHeight:(e,t)=>this.world.field.isLand(e,t)?-50:this.world.water.height(e,t)};constructor(e,t){this.canvas=e,this.options=t}async init(e){e(.05,`Starting physics`),this.physics=await sn.create(),e(.1,`Loading models`),this.characterAsset=await this.assets.loadModel(k_),this.clips=new Na(this.characterAsset),e(.16,`Starting renderer`),this.engine=new kp(this.canvas,this.settings),this.input=new jp(this.canvas),this.camera=new Gp(this.engine.camera,this.physics),this.camera.baseFov=this.settings.data.fov,this.world=h_.create(this.options.seed,this.engine.scene,this.engine.renderer,this.physics,this.settings,e),this.fx.attach(this.engine.scene,this.engine.camera,this.canvas),this.addSystem(this.fx),e(.74,`Stocking the coolers`),this.physics.step(),this.combat=this.addSystem(await gs.create(this)),this.loot=this.addSystem(await ph.create(this)),this.drop=this.addSystem(new bm(this));let t=new Set((new URLSearchParams(location.search).get(`without`)??``).split(`,`));t.has(`cars`)||(e(.78,`Parking cars`),await(await O_(async()=>{let{installCars:e}=await import(`./cars-NqDthZbP.js`);return{installCars:e}},__vite__mapDeps([0,1,2,3]),import.meta.url)).installCars(this)),t.has(`boats`)||(e(.82,`Mooring boats`),await(await O_(async()=>{let{installBoats:e}=await import(`./boats-CWCeTqYu.js`);return{installBoats:e}},__vite__mapDeps([4,1,2,3]),import.meta.url)).installBoats(this)),t.has(`shops`)||(e(.86,`Opening the shops`),await(await O_(async()=>{let{installShops:e}=await import(`./shops-DOAiIgub.js`);return{installShops:e}},__vite__mapDeps([5,1,6]),import.meta.url)).installShops(this)),e(.88,`Charting the streets`),this.physics.step(),this.nav=new Ps(this.world.field,this.world.layout,this.physics),this.zone=this.addSystem(new S_(this)),this.addSystem(this.match),e(.89,`Waking the rivals`);let n=this.ensurePlayer();this.bots=this.addSystem(new Ys(this)),this.bots.park(n),this.settings.onChange((e,t)=>{t===`quality`&&(this.engine.applyQuality(),this.world.sky.applyQuality(this.settings.quality),this.world.water.setGrid(this.settings.quality.waterGrid),this.world.streetLights.setCount(this.settings.quality.streetLights))}),this.engine.onStruggle=()=>{let e=[`ultra`,`high`,`medium`,`low`],t=e[e.indexOf(this.settings.data.quality)+1];t&&t in Np&&this.settings.set(`quality`,t,!1)},e(.9,`Warming up`),this.physics.step(),this.warmUp(),this.audio=new xd(this),this.engine.start({fixed:e=>this.fixedUpdate(e),frame:(e,t)=>this.frameUpdate(e,t)}),e(1,`Ready`),this.setPhase(`menu`)}warmUp(){let e=this.engine.camera,t=e.position.clone(),n=e.quaternion.clone();try{e.position.set(0,900,1),e.lookAt(0,0,0),e.updateMatrixWorld(!0),this.engine.post.render(0),e.position.set(-60,4,13),e.lookAt(200,6,0),e.updateMatrixWorld(!0),this.engine.post.render(0)}catch(e){console.warn(`warm-up draw failed`,e)}e.position.copy(t),e.quaternion.copy(n),e.updateMatrixWorld(!0)}hurtScale=null;hurt(e,t,n){if(!e.alive||t<=0)return 0;this.hurtScale&&(t*=this.hurtScale(e,n));let r=t;if(n.cause!==`storm`&&n.cause!==`drown`&&n.cause!==`fall`){let t=Math.min(e.armor,r);e.armor-=t,r-=t}return e.health=Math.max(0,e.health-r),e.sinceHurt=0,n.by&&n.by!==e&&(e.lastHurtBy=n.by,e.sinceHurtBy=0),n.dir&&e.anim.flinch(n.dir.x,n.dir.z,Math.min(1,t/40)),this.events.emit(`hurt`,{target:e,amount:t,info:n}),e.health<=0&&(e.alive=!1,!n.by&&e.lastHurtBy&&e.sinceHurtBy<12&&(n.by=e.lastHurtBy),n.by&&n.by!==e&&n.by.kills++,e.vehicle?.exit(e),this.events.emit(`kill`,{victim:e,info:n})),t}grant(e,t,n=$a[t].stack,r=0){if($a[t].kind===`weapon`){let n=t;return e.loadout.give(n,r)?(e.inventory.counts[n]=1,!e.loadout.current&&!e.act.slot&&(e.act.slot=n),this.events.emit(`grant`,{to:e,item:t,count:1}),1):0}let i=e.inventory.add(t,n);return i>0&&this.events.emit(`grant`,{to:e,item:t,count:i}),i}sound(e,t,n=1){this.audio?.play(e,t,n)}addSystem(e){return this.systems.push(e),e}removeSystem(e){let t=this.systems.indexOf(e);t>=0&&this.systems.splice(t,1)}setPhase(e){this.phase=e,this.events.emit(`phase`,e)}spawnCharacter(e,t,n,r,i,a=Va()){let o=this.physics.groundHeight(n,200,r,400,this.world.field.heightAt(n,r))+.05,s=new sf(this.characters.length,e,t,this.characterAsset,this.clips,this.physics,this.engine.scene,a,n,o,r);return s.teleport(n,o,r,i),this.characters.push(s),s}ensurePlayer(e=-60,t=13,n=0){return this.player||(this.player=this.spawnCharacter(`You`,!0,e,t,n),this.player.cash=300,this.controller=new Dm(this.player,this.input,this.camera,this.settings,this.interactions)),this.player}startMatch(){this.match.start()}startAt(e,t,n=0){let r=this.ensurePlayer(e,t,n);this.match.stop();let i=this.physics.groundHeight(e,200,t,400,this.world.field.heightAt(e,t))+.05;return this.drop.release(r),r.vehicle?.exit(r),r.alive||(r.alive=!0,r.health=r.maxHealth,r.armor=0,this.combat.reset(r)),r.teleport(e,i,t,n),this.camera.yaw=n,this.camera.pitch=-.12,this.camera.snap(),this.cameraOverride=!1,this.input.setWantLock(!0),this.setPhase(`match`),r}fixedUpdate(e){let t=this.systems;if(this.phase===`match`){this.controller?.fixedUpdate();for(let n=0;n<t.length;n++)t[n].fixedUpdate?.(e);for(let t of this.characters)t.fixedUpdate(e,this.env)}if(this.physics.step(),this.phase===`match`)for(let n=0;n<t.length;n++)t[n].postPhysics?.(e);this.input.endFixedStep()}frameUpdate(e,t){let{camera:n}=this.engine;if(this.phase===`match`&&this.player&&this.controller){let r=this.input;this.controller.frameUpdate(e,r.held(`Mouse2`));for(let n=0;n<this.systems.length;n++)this.systems[n].frameUpdate?.(e,t);for(let n of this.characters)n.frameUpdate(e,t);if(this.debugChase){let e=this.player.visual;n.position.set(e.x+this.debugChase.x,e.y+this.debugChase.y,e.z+this.debugChase.z),this.viewTarget.set(e.x,e.y+.95,e.z),n.lookAt(this.viewTarget)}else this.cameraOverride||(this.camera.update(e,this.controller.subject),this.viewTarget.copy(this.player.visual))}else this.cameraOverride||(this.orbit+=e*.035,n.position.set(Math.sin(this.orbit)*430+40,150,Math.cos(this.orbit)*430),this.viewTarget.set(40,10,0),n.lookAt(this.viewTarget));this.fx.daylight=1-this.world.sky.night;let r=this.world.field.heightAt(n.position.x,n.position.z);this.world.update(this.engine.time,n,this.viewTarget,Math.max(0,n.position.y-r)),this.audio?.frame(e),this.input.endFrame()}};function $(e,t,n){let r=document.createElement(e);return r.className=t,n!==void 0&&(r.textContent=n),r}function j_(e,t,n){let r=$(`button`,e,t);return r.type=`button`,r.addEventListener(`click`,n),r}var M_=1.6,N_=350;function P_(e,t,n){switch(e){case`bullet`:return n?t&&to(t)?`${n} got you with the ${$a[t].name}.`:`${n} got you.`:`A stray shot found you.`;case`explosion`:return n?`${n} caught you in a blast.`:`A blast caught you.`;case`vehicle`:return n?`${n} ran you down.`:`A wreck took you with it.`;case`storm`:return n?`The storm finished what ${n} started.`:`The storm caught you outside the eye.`;case`fall`:return n?`${n} sent you over the edge.`:`It was a long way down.`;case`drown`:return`The bay took you.`}}var F_=class{game;ui;target=null;label=$(`div`,`spectate`);labelKicker=$(`span`,`spectate-kicker`);labelName=$(`span`,`spectate-name`);card=$(`section`,`result`);kicker=$(`div`,`result-kicker`);title=$(`h2`,`result-title`);note=$(`p`,`result-note`);stats=$(`dl`,`result-stats`);place=$(`dd`,`result-place`);kills=$(`dd`,`result-kills`);time=$(`dd`,`result-time`);again;back;subject={position:new f,height:1.56,distance:4.6,shoulder:0,aim:0,fovKick:0};held=null;deadFor=-1;killer=null;cause=`storm`;weapon=null;diedAt=0;inRound=!1;open=!1;armedAt=0;labelled=-2;constructor(e,t){this.game=e,this.ui=t;let n=$(`span`,`spectate-hint spectate-switch`);n.append($(`kbd`,`key key-small`,`A`),$(`kbd`,`key key-small`,`D`),`Switch`);let r=$(`span`,`spectate-hint`);r.append($(`kbd`,`key key-small`,`Enter`),`Results`);let i=$(`span`,`spectate-keys`);i.append(n,r),this.label.append(this.labelKicker,this.labelName,i),this.label.setAttribute(`role`,`status`),this.card.setAttribute(`role`,`dialog`),this.card.setAttribute(`aria-label`,`Round result`);let a=$(`div`,`result-card`);for(let[e,t]of[[`Place`,this.place],[`Kills`,this.kills],[`Time survived`,this.time]]){let n=$(`div`,`result-stat`);n.append($(`dt`,`result-label`,e),t),this.stats.append(n)}this.again=j_(`result-again`,`Play again`,e=>{this.armed(e)&&this.game.startMatch()}),this.back=j_(`result-back`,`Title`,e=>{this.armed(e)&&this.toTitle()});let o=$(`div`,`result-actions`);o.append(this.again,this.back),a.append(this.kicker,this.title,this.note,this.stats,o),this.card.append(a),t.append(this.card);let s=e;s.events.on(`kill`,({victim:e,info:t})=>{e===s.player?this.fell(t):e===this.target&&this.watch(this.pick(t.by,e))}),s.events.on(`over`,()=>this.show()),s.events.on(`phase`,e=>{(e===`menu`||e===`match`&&s.player?.alive===!0&&!s.match.result)&&this.reset()}),window.addEventListener(`keydown`,e=>{if(e.repeat)return;if(!this.open){e.code===`Enter`&&this.deadFor>=0&&s.phase===`match`&&s.input.enabled&&(this.show(),e.preventDefault());return}let t=document.activeElement;e.code===`ArrowLeft`||e.code===`ArrowRight`||e.code===`ArrowUp`||e.code===`ArrowDown`?((t===this.again?this.back:this.again).focus(),e.preventDefault()):(e.code===`Enter`||e.code===`NumpadEnter`||e.code===`Space`)&&t!==this.again&&t!==this.back&&(e.preventDefault(),this.again.focus(),performance.now()>=this.armedAt&&s.startMatch())})}get showing(){return this.open}armed(e){return e.detail>0||performance.now()>=this.armedAt}toTitle(){let e=this.game;e.input.setWantLock(!1),e.match.stop(),e.setPhase(`menu`)}fell(e){let t=this.game,n=t.match,r=t.player;this.deadFor=0,this.killer=e.by&&e.by!==r?e.by:null,this.cause=e.cause,this.weapon=e.weapon??null,this.diedAt=n.time,this.inRound=n.combatants.includes(r)&&(n.running||n.result!==null),this.open&&this.render()}watch(e){this.target=e,e&&(this.subject.position=e.visual)}pick(e,t){let n=this.game,r=n.player,i=n.match.combatants;if(e&&e!==r&&e.alive&&i.includes(e))return e;let a=null,o=1/0;for(let e of i){if(e===r||!e.alive)continue;let n=e.position.distanceToSquared(t.position);n<o&&(o=n,a=e)}return a}step(e){let t=this.game,n=t.match.combatants,r=n.length,i=this.target?n.indexOf(this.target):0;for(let a=0;a<r;a++){i=(i+e+r)%r;let a=n[i];if(a.alive&&a!==t.player){this.watch(a);return}}}fixedUpdate(){if(!this.target||this.open)return;let e=this.game.input;e.pressed(`KeyD`)||e.pressed(`ArrowRight`)||e.pressed(`Mouse0`)?this.step(1):(e.pressed(`KeyA`)||e.pressed(`ArrowLeft`))&&this.step(-1)}update(e){if(this.deadFor<0)return;let t=this.game;this.deadFor+=e,!this.target&&this.deadFor>=M_&&(t.match.running&&this.watch(this.pick(this.killer,t.player)),!this.target&&!this.open&&this.show());let n=this.target,r=t.controller;if(n&&r){let e=this.subject;if(n.vehicle)e=n.vehicle.cameraSubject;else{let t=n.state===`plane`||n.state===`freefall`||n.state===`chute`;e.height=t?1.4:n.motor.crouched?1.15:1.56,e.distance=t?9:4.6}r.subjectOverride=e,this.held=e}let i=this.open?-2:n?n.id:-1;if(i!==this.labelled){if(this.labelled=i,this.label.classList.toggle(`show`,i!==-2),this.label.classList.toggle(`watching`,i>=0),n&&i>=0)this.labelKicker.textContent=`Spectating`,this.labelName.textContent=n.name;else if(i===-1){let e=t.match.places.get(t.player);this.labelKicker.textContent=`Eliminated`,this.labelName.textContent=this.inRound&&e?`Place ${e} of ${t.match.combatants.length}`:`Out of the fight`}}}show(){let e=this.game;this.open||(this.open=!0,this.armedAt=performance.now()+N_,this.ui.classList.add(`result-open`),this.card.classList.add(`show`),e.input.enabled=!1,e.input.setWantLock(!1),this.again.focus({preventScroll:!0})),this.render()}render(){let e=this.game,t=e.match,n=e.player,r=t.result,i=r?.won===!0,a=(r?r.total:t.combatants.length)-1;this.card.classList.toggle(`win`,i),this.card.classList.toggle(`loss`,!i),this.kicker.textContent=i?`Round won`:r?`Round over`:this.inRound?`Out of the round`:`Down`,this.title.textContent=i?`Last one standing`:`Eliminated`;let o=i?`You outlasted ${a} rivals and the storm.`:P_(this.cause,this.weapon,this.killer?.name??null);r&&!i&&r.winner&&(o+=` ${r.winnerName} won the round.`),this.note.textContent=o;let s=r!==null||this.inRound;if(this.stats.classList.toggle(`show`,s),!s||!n)return;let c=r?r.place:t.places.get(n)??0,l=r?r.total:t.combatants.length;this.place.textContent=`${c} of ${l}`,this.kills.textContent=String(r?r.kills:n.kills),this.time.textContent=Yt(Math.floor(r?r.survived:this.diedAt))}reset(){let e=this.game;this.deadFor=-1,this.killer=null,this.target=null,e.controller&&this.held&&e.controller.subjectOverride===this.held&&(e.controller.subjectOverride=null),this.held=null,this.labelled=-2,this.label.classList.remove(`show`,`watching`),this.open&&(this.open=!1,this.ui.classList.remove(`result-open`),this.card.classList.remove(`show`),e.input.enabled=!0,(document.activeElement===this.again||document.activeElement===this.back)&&e.canvas.focus({preventScroll:!0}))}snapshot(){return{spectating:this.target?this.target.name:null,label:this.label.classList.contains(`show`)?`${this.labelKicker.textContent}: ${this.labelName.textContent}`:``,result:this.open?{won:this.card.classList.contains(`win`),title:this.title.textContent,note:this.note.textContent,place:this.place.textContent,kills:this.kills.textContent,time:this.time.textContent}:null}}},I_=520,L_=V.half*2,R_=208,z_=Math.PI*2,B_=`rgba(6, 16, 26, 0.8)`,V_=`#0e2f43`,H_=`#35e0c8`,U_=`#ffd166`,W_=`rgba(40, 24, 78, 0.5)`,G_=`#f4fbfa`,K_=`#ff7a59`,q_=[14,47,67,43,58,70,134,153,162,232,238,240,217,197,143,79,168,122,176,158,196,168,130,90,96,114,128,104,120,130,74,168,255,88,104,116],J_=1800,Y_=12,X_=2.4,Z_=140;function Q_(e){let t=e.size,n=document.createElement(`canvas`);n.width=t,n.height=t;let r=n.getContext(`2d`),i=r.createImageData(t,t),a=i.data,{type:o,shore:s,height:c}=e;for(let e=0;e<t;e++)for(let n=0;n<t;n++){let r=e*t+n,i=o[r],l=q_[i*3]??0,u=q_[i*3+1]??0,d=q_[i*3+2]??0;if(i===_s.Water){let e=Math.min(1,s[r]/34);l=G(27,l,e),u=G(88,u,e),d=G(108,d,e)}else if(i===_s.Building){let a=n>0&&o[r-1]!==i||n<t-1&&o[r+1]!==i||e>0&&o[r-t]!==i||e<t-1&&o[r+t]!==i?.56:G(.8,1.04,Math.min(1,Math.max(0,(c[r]-6)/70)));l*=a,u*=a,d*=a}let f=r*4;a[f]=l,a[f+1]=u,a[f+2]=d,a[f+3]=255}return r.putImageData(i,0,0),n}var $_=()=>({cx:0,cz:0,span:L_,size:0,eye:!1,next:!1,guide:!1,route:!1,blips:0,draws:0}),ev=class{game;ui;root=$(`div`,`minimap`);full=$(`div`,`fullmap`);open=!1;shown=$_();fullShown=$_();canvas=$(`canvas`,`minimap-canvas`);ctx;fullCanvas=$(`canvas`,`fullmap-canvas`);fullCtx;chart=$(`div`,`fullmap-chart`);base=null;now=new Float64Array(24);drawn=new Float64Array(24).fill(NaN);fullDrawn=new Float64Array(24).fill(NaN);air=-1;blipX=new Float32Array(Y_);blipZ=new Float32Array(Y_);blipUntil=new Float64Array(Y_);blipNext=0;focus=null;fallen=null;yaw=0;dashScale=0;dashNext=[];dashRoute=[];solid=[];constructor(e,t){this.game=e,this.ui=t,this.ctx=this.canvas.getContext(`2d`),this.fullCtx=this.fullCanvas.getContext(`2d`);let n=$(`span`,`minimap-key`);n.append($(`kbd`,`key key-small`,`M`),` Map`),this.root.append(this.canvas,$(`span`,`minimap-north`,`N`),n);let r=$(`div`,`fullmap-panel`),i=$(`header`,`fullmap-head`),a=$(`div`,`fullmap-legend`);for(let[e,t]of[[`you`,`You`],[`eye`,`The eye now`],[`next`,`Where it closes to`]]){let n=$(`span`,`legend-item`);n.append($(`i`,`legend-mark ${e}`),t),a.append(n)}let o=$(`span`,`fullmap-close`);o.append($(`kbd`,`key key-small`,`M`),` Close`),i.append($(`h2`,`fullmap-title`,`Marazul Bay`),a,o),this.chart.append(this.fullCanvas,$(`span`,`fullmap-north`,`N`));let s=e.world.layout,c=(e,t,n,r)=>{let i=$(`span`,r,e);i.style.left=`${(t+V.half)/L_*100}%`,i.style.top=`${(n+V.half)/L_*100}%`,this.chart.append(i)};for(let e of s.pois)c(e.name,e.x,e.z,e.r<70?`map-label minor`:`map-label`);for(let e of s.islets)c(e.name,e.x,e.z,`map-label minor`);r.append(i,this.chart),this.full.append(r),window.addEventListener(`keydown`,t=>{!t.repeat&&e.phase===`match`&&e.input.enabled&&(t.code===`KeyM`?this.toggle():t.code===`Escape`&&this.open&&(this.toggle(!1),t.stopImmediatePropagation()))}),window.addEventListener(`resize`,()=>{this.drawn.fill(NaN),this.fullDrawn.fill(NaN)}),e.events.on(`phase`,e=>{e!==`match`&&this.toggle(!1),this.reset()}),e.events.on(`shot`,({by:t,x:n,z:r})=>{let i=this.focus;if(!i||t===i||t===e.player||Math.hypot(n-i.visual.x,r-i.visual.z)>Z_)return;let a=this.blipNext;this.blipNext=(a+1)%Y_,this.blipX[a]=n,this.blipZ[a]=r,this.blipUntil[a]=e.engine.time+X_})}toggle(e=!this.open){e!==this.open&&(this.open=e,this.full.classList.toggle(`show`,e),this.ui.classList.toggle(`map-open`,e),this.fullDrawn.fill(NaN))}reset(){this.air=-1,this.blipUntil.fill(0),this.drawn.fill(NaN),this.fullDrawn.fill(NaN)}update(e,t,n,r){let i=this.game;this.base||=Q_(i.world.field),this.focus=t,this.fallen=n,this.yaw=r;let a=t.visual,o=+(t.state===`plane`||t.state===`freefall`);this.air=this.air<0?o:H(this.air,o,2.4,e),Math.abs(this.air-o)<.004&&(this.air=o);let s=I(0,1,this.air),c=G(I_,L_,s),l=G(a.x,0,s),u=G(a.z,0,s),d=i.zone,f=i.drop,p=i.engine.time,m=0;for(let e=0;e<Y_;e++)this.blipUntil[e]>p&&m++;let h=Math.min(2,window.devicePixelRatio||1),g=this.now;g[0]=Math.round(l*2),g[1]=Math.round(u*2),g[2]=Math.round(c),g[3]=Math.round(a.x*2),g[4]=Math.round(a.z*2),g[5]=Math.round(r*40);let _=d.stage!==`idle`;if(g[6]=_?Math.round(d.x*2):0,g[7]=_?Math.round(d.z*2):0,g[8]=_?Math.round(d.radius*2):-1,g[9]=_?Math.round(d.nextX*2):0,g[10]=_?Math.round(d.nextZ*2):0,g[11]=_?Math.round(d.nextRadius*2):-1,g[12]=d.stage===`idle`?0:d.stage===`hold`?1:d.stage===`shrink`?2:3,g[13]=f.flying?Math.round(f.travelled/3):-1,g[14]=m>0?Math.floor(p*12):-1,g[15]=+!!t.alive,g[16]=n?Math.round(n.visual.x)*4096+Math.round(n.visual.z):-1,g[17]=h,g[18]=t.id,this.changed(this.drawn)){let e=Math.round(R_*h);this.canvas.width!==e&&(this.canvas.width=e,this.canvas.height=e),this.draw(this.ctx,this.shown,e,e/R_,l,u,c)}if(this.open&&this.changed(this.fullDrawn)){let e=this.chart.clientWidth||560,t=Math.round(e*h);this.fullCanvas.width!==t&&(this.fullCanvas.width=t,this.fullCanvas.height=t),this.draw(this.fullCtx,this.fullShown,t,t/e,0,0,L_)}}changed(e){let t=this.now,n=!1;for(let r=0;r<t.length;r++)e[r]!==t[r]&&(n=!0,e[r]=t[r]);return n}draw(e,t,n,r,i,a,o){let s=this.game,c=n/o,l=n/2;r!==this.dashScale&&(this.dashScale=r,this.dashNext=[6*r,5*r],this.dashRoute=[2*r,5*r]),e.setTransform(1,0,0,1,0,0),e.setLineDash(this.solid),e.globalAlpha=1,e.fillStyle=V_,e.fillRect(0,0,n,n);let u=this.base,d=L_/u.width,f=(i-o/2+V.half)/d,p=(a-o/2+V.half)/d,m=o/d,h=Math.max(0,f),g=Math.max(0,p),_=Math.min(u.width,f+m),v=Math.min(u.height,p+m);if(_>h&&v>g){let t=n/m;e.imageSmoothingEnabled=!0,e.imageSmoothingQuality=`high`,e.drawImage(u,h,g,_-h,v-g,(h-f)*t,(g-p)*t,(_-h)*t,(v-g)*t)}let y=this.focus,b=(y.visual.x-i)*c+l,x=(y.visual.z-a)*c+l,S=s.zone;if(t.eye=!1,t.next=!1,t.guide=!1,S.stage!==`idle`){let o=(S.x-i)*c+l,s=(S.z-a)*c+l,u=Math.max(0,S.radius*c);if(e.fillStyle=W_,e.beginPath(),e.rect(0,0,n,n),e.arc(o,s,u,0,z_),e.fill(`evenodd`),S.stage!==`closed`){let n=(S.nextX-i)*c+l,o=(S.nextZ-a)*c+l,s=S.nextRadius*c;e.setLineDash(this.dashNext),this.ring(e,n,o,Math.max(s,3*r),U_,2.2*r),e.setLineDash(this.solid),t.next=!0;let u=S.outsideNext(y.visual.x,y.visual.z);if(u>2&&y.alive&&y.state!==`plane`){let i=n-b,a=o-x,s=Math.hypot(i,a)||1,l=u*c;this.line(e,b,x,b+i/s*l,x+a/s*l,U_,2.4*r),t.guide=!0}}this.ring(e,o,s,u,H_,2.6*r),t.eye=!0}let C=s.drop;if(t.route=C.flying,C.flying){let t=(C.start.x-i)*c+l,n=(C.start.z-a)*c+l,o=J_*c;e.globalAlpha=.7,e.setLineDash(this.dashRoute),this.line(e,t,n,t+C.dir.x*o,n+C.dir.z*o,G_,1.6*r),e.setLineDash(this.solid),e.globalAlpha=1,y.state!==`plane`&&this.arrow(e,(C.planePos.x-i)*c+l,(C.planePos.z-a)*c+l,Math.atan2(C.dir.x,-C.dir.z),r*.8,U_)}let w=s.engine.time;t.blips=0;for(let n=0;n<Y_;n++){let o=this.blipUntil[n]-w;if(o<=0)continue;t.blips++;let s=(this.blipX[n]-i)*c+l,u=(this.blipZ[n]-a)*c+l;e.globalAlpha=Math.min(1,o/(X_*.6)),e.fillStyle=K_,e.strokeStyle=B_,e.lineWidth=1.2*r,e.beginPath(),e.arc(s,u,3.4*r,0,z_),e.fill(),e.stroke()}e.globalAlpha=1;let T=this.fallen;if(T&&T!==y){let t=(T.visual.x-i)*c+l,n=(T.visual.z-a)*c+l,o=4.5*r;this.line(e,t-o,n-o,t+o,n+o,K_,2*r),this.line(e,t-o,n+o,t+o,n-o,K_,2*r)}let E=9*r;this.arrow(e,Math.min(n-E,Math.max(E,b)),Math.min(n-E,Math.max(E,x)),-this.yaw,r,T&&T!==y?H_:G_),t.cx=i,t.cz=a,t.span=o,t.size=n,t.draws++}ring(e,t,n,r,i,a){e.beginPath(),e.arc(t,n,r,0,z_),e.strokeStyle=B_,e.lineWidth=a*1.9,e.stroke(),e.strokeStyle=i,e.lineWidth=a,e.stroke()}line(e,t,n,r,i,a,o){e.beginPath(),e.moveTo(t,n),e.lineTo(r,i),e.lineCap=`round`,e.strokeStyle=B_,e.lineWidth=o*1.9,e.stroke(),e.strokeStyle=a,e.lineWidth=o,e.stroke()}arrow(e,t,n,r,i,a){e.save(),e.translate(t,n),e.rotate(r),e.beginPath(),e.moveTo(0,-8.5*i),e.lineTo(6*i,6.5*i),e.lineTo(0,3*i),e.lineTo(-6*i,6.5*i),e.closePath(),e.lineJoin=`round`,e.strokeStyle=B_,e.lineWidth=2.6*i,e.stroke(),e.fillStyle=a,e.fill(),e.restore()}},tv=3,nv=372,rv=[`N`,`NE`,`E`,`SE`,`S`,`SW`,`W`,`NW`],iv=6,av=6;function ov(e){if(e.weapon&&to(e.weapon))return $a[e.weapon].name;switch(e.cause){case`storm`:return e.killer?`storm`:`took`;case`fall`:return e.killer?`fall`:`broke`;case`drown`:return e.killer?`drowned`:`took`;case`vehicle`:return e.killer?`ran down`:`crushed`;case`explosion`:return`blast`;default:return`shot`}}function sv(e){switch(e.cause){case`storm`:return`The storm`;case`fall`:return`The fall`;case`drown`:return`The bay`;case`vehicle`:return`A wreck`;case`explosion`:return`A blast`;default:return`A stray shot`}}var cv=class e{game;compass=$(`div`,`compass`);storm=$(`div`,`storm`);warn=$(`div`,`storm-warn`);tally=$(`div`,`tally`);feed=$(`div`,`feed`);tint=$(`div`,`storm-tint`);tape=$(`div`,`compass-tape`);point=$(`span`,`compass-point`,`N`);degrees=$(`span`,`compass-deg`,`000`);stormPhase=$(`span`,`storm-phase`);stormText=$(`span`,`storm-text`);warnTitle=$(`b`,`storm-warn-title`);warnText=$(`span`,`storm-warn-text`);alive=$(`b`,`tally-alive`,`0`);kills=$(`b`,`tally-kills`,`0`);lines=[];lineAt=[];lastLine=null;headingQ=-1;degree=-1;clock=-1;warning=-1;tintQ=-1;aliveN=-1;killsN=-1;inRound=-1;constructor(e){this.game=e;for(let e=-90;e<=450;e+=15){let t=(e%360+360)%360,n=t%45==0?rv[t/45]:String(t),r=$(`span`,`compass-mark${t%90==0?` cardinal`:t%45==0?` half`:``}${t===0?` north`:``}`,n);r.style.left=`${(e+90)*tv}px`,this.tape.append(r)}let t=$(`div`,`compass-read`);t.append(this.point,this.degrees),this.compass.append(this.tape,$(`i`,`compass-needle`),t),this.storm.append($(`i`,`storm-dot`),this.stormPhase,this.stormText),this.warn.append(this.warnTitle,this.warnText),this.warn.setAttribute(`role`,`status`);let n=$(`span`,`tally-item`);n.append(this.alive,$(`span`,`tally-label`,`Alive`));let r=$(`span`,`tally-item`);r.append(this.kills,$(`span`,`tally-label`,`Kills`)),this.tally.append(n,r)}static bearing(e){return(-e*180/Math.PI%360+360)%360}update(t,n){let r=this.game,i=r.match,a=r.zone,o=e.bearing(n),s=Math.round(o*4);s!==this.headingQ&&(this.headingQ=s,this.tape.style.transform=`translateX(${(nv/2-(s/4+90)*tv).toFixed(2)}px)`);let c=Math.round(o)%360;c!==this.degree&&(this.degree=c,this.degrees.textContent=String(c).padStart(3,`0`),this.point.textContent=rv[Math.round(c/45)%8]);let l=i.running||i.result!==null?1:0;l!==this.inRound&&(this.inRound=l,this.tally.classList.toggle(`show`,l===1),this.feed.classList.toggle(`show`,l===1)),i.alive!==this.aliveN&&(this.aliveN=i.alive,this.alive.textContent=String(i.alive)),t.kills!==this.killsN&&(this.killsN=t.kills,this.kills.textContent=String(t.kills));let u=l===1?a.stage:`idle`,d=Math.max(0,Math.ceil(a.left)),f=u===`idle`?0:u===`hold`?1:u===`shrink`?2:3,p=f===0?0:f*1e6+a.phase*1e4+d;p!==this.clock&&(this.clock=p,this.storm.classList.toggle(`show`,f!==0),this.storm.classList.toggle(`closing`,f===2),this.storm.classList.toggle(`shut`,f===3),this.stormPhase.textContent=`Eye ${a.phase+1} of ${g_.length}`,this.stormText.textContent=f===1?`Eye closes in ${Yt(d)}`:f===2?`Closing ${Yt(d)}`:`The eye has shut`);let m=0;if(f!==0&&i.running&&t.alive&&t.state!==`plane`){let e=t.position,n=-a.toWall(e.x,e.z);if(n>0)m=1e6+Math.min(9999,Math.ceil(n))+a.damage*1e4;else if(f!==3){let t=a.outsideNext(e.x,e.z);t>0&&(m=2e6+Math.min(9999,Math.ceil(t)))}}if(m!==this.warning){let e=Math.floor(this.warning/1e6),t=Math.floor(m/1e6);this.warning=m;let n=m%1e4;t!==e&&(this.warn.classList.toggle(`show`,t!==0),this.warn.classList.toggle(`out`,t===1),this.warnTitle.textContent=t===1?`In the storm`:`Eye is moving`),t===1?this.warnText.textContent=`${n} m to the eye, losing ${a.damage} health a second`:t===2&&(this.warnText.textContent=`${n} m to the next eye`)}let h=Math.round(a.playerOutside*20);h!==this.tintQ&&(this.tintQ=h,this.tint.style.opacity=String(h/20),this.tint.classList.toggle(`show`,h>0)),this.syncFeed()}syncFeed(){let e=this.game.match.feed,t=e.length,n=t>0?e[t-1]:null;if(n!==this.lastLine){let r=-1;if(this.lastLine)for(let n=t-2;n>=0&&r<0;n--)e[n]===this.lastLine&&(r=n);r<0&&this.clearFeed();for(let n=Math.max(r+1,t-av);n<t;n++)this.addLine(e[n]);this.lastLine=n}this.lines.length>0&&this.game.match.time-this.lineAt[0]>iv&&this.dropLine()}addLine(e){let t=$(`div`,`feed-line${e.mine?` mine`:``}`);if(t.append($(`span`,`feed-killer${e.killer?``:` nature`}`,e.killer??sv(e)),$(`span`,`feed-how`,ov(e))),e.headshot){let e=$(`i`,`feed-head`);e.title=`Headshot`,e.setAttribute(`aria-label`,`headshot`),t.append(e)}for(t.append($(`span`,`feed-victim`,e.victim)),t.dataset.at=e.at.toFixed(1),this.feed.append(t),this.lines.push(t),this.lineAt.push(e.at);this.lines.length>av;)this.dropLine(!0)}dropLine(e=!1){let t=this.lines.shift();this.lineAt.shift(),t&&(e?t.remove():(t.classList.add(`out`),window.setTimeout(()=>t.remove(),450)))}clearFeed(){for(let e of this.lines)e.remove();this.lines.length=0,this.lineAt.length=0}snapshot(){return{alive:Number(this.alive.textContent),kills:Number(this.kills.textContent),bearing:Number(this.degrees.textContent),point:this.point.textContent,storm:this.storm.classList.contains(`show`)?`${this.stormPhase.textContent}: ${this.stormText.textContent}`:``,warning:this.warn.classList.contains(`show`)?`${this.warnTitle.textContent}: ${this.warnText.textContent}`:``,tint:Number(this.tint.style.opacity||0),feed:this.lines.map(e=>[...e.children].map(e=>e.classList.contains(`feed-head`)?`*`:e.textContent).join(` `))}}},lv=e=>`#${e.toString(16).padStart(6,`0`)}`,uv=[{id:`bandage`,key:`Q`,short:`Bandage`},{id:`medkit`,key:`Q`,short:`Medkit`},{id:`cola`,key:`X`,short:`Cola`},{id:`vest`,key:`X`,short:`Vest`},{id:`grenade`,key:`G`,short:`Frag`}],dv=class{game;root=$(`div`,`hud`);cross=$(`div`,`cross`);ticks=[];marker=$(`div`,`hitmark`);scope=$(`div`,`scope`);hurtRing=$(`div`,`hurt-ring`);vignette=$(`div`,`hurt-vignette`);health=$(`div`,`bar-fill health`);armor=$(`div`,`bar-fill armor`);healthText=$(`span`,`bar-num`);armorText=$(`span`,`bar-num`);cash=$(`div`,`cash`);ammo=$(`div`,`ammo`);ammoMag=$(`span`,`ammo-mag`,`0`);ammoReserve=$(`span`,`ammo-reserve`,`0`);weaponName=$(`div`,`weapon-name`);reload=$(`div`,`reload`);reloadFill=$(`div`,`reload-fill`);reloadText=$(`span`,`reload-text`);slots=[];pouch=[];toasts=$(`div`,`toasts`);map;round;after;shown=``;down=!1;markTimer=0;hurtTimer=0;hurtFrom=0;last={};constructor(e,t){this.game=e;for(let e of[`n`,`e`,`s`,`w`]){let t=$(`i`,`tick tick-${e}`);this.ticks.push(t),this.cross.append(t)}this.cross.append($(`i`,`dot`));let n=$(`div`,`vitals`),r=$(`div`,`bar`);r.append(this.health,$(`span`,`bar-label`,`Health`),this.healthText);let i=$(`div`,`bar bar-armor`);i.append(this.armor,$(`span`,`bar-label`,`Armor`),this.armorText);let a=$(`div`,`pouch`);for(let e of uv){let t=$(`div`,`pouch-item`),n=$(`span`,`pouch-count`,`0`);t.append($(`kbd`,`key key-small`,e.key),$(`span`,`pouch-name`,e.short),n),t.dataset.item=e.id,a.append(t),this.pouch.push({node:t,count:n,id:e.id})}n.append(i,r,a,this.cash);let o=$(`div`,`arms`);this.ammo.append(this.ammoMag,$(`span`,`ammo-sep`,`/`),this.ammoReserve);let s=$(`div`,`rack`);eo.forEach((e,t)=>{let n=$(`div`,`slot`);n.dataset.weapon=e,n.append($(`kbd`,`key key-small`,String(t+1)),$(`span`,`slot-name`,$a[e].name),$(`i`,`slot-tier`)),s.append(n),this.slots.push(n)}),o.append(this.weaponName,this.ammo,s),this.reload.append(this.reloadFill,this.reloadText),this.map=new ev(e,t),this.round=new cv(e),this.after=new F_(e,t);let c=$(`div`,`hud-top`);c.append(this.round.compass,this.round.storm,this.round.warn);let l=$(`div`,`hud-corner`);l.append(this.map.root,this.round.tally),this.root.append(this.round.tint,this.vignette,this.scope,this.hurtRing,this.cross,this.marker,this.reload,c,l,this.round.feed,n,o,this.toasts,this.after.label,this.map.full),t.prepend(this.root);let u=e;u.events.on(`phase`,()=>this.sync()),u.events.on(`hurt`,({target:e,info:t})=>{let n=u.player;if(n&&(t.by===n&&e!==n&&this.mark(t.headshot===!0,!e.alive),e===n)){this.hurtTimer=1;let e=t.by&&t.by!==n?t.by.position:null;this.hurtFrom=e?Math.atan2(-(e.x-n.position.x),-(e.z-n.position.z)):NaN}}),u.events.on(`kill`,({victim:e,info:t})=>{t.by===u.player&&e!==u.player&&this.toast(`Eliminated ${e.name}`,`kill`)}),u.events.on(`grant`,({to:e,item:t,count:n})=>{if(e!==u.player)return;let r=$a[t].kind===`weapon`?e.loadout.held[t]?.tier??0:0;this.toast(`+ ${fh(t,n,r)}`,$a[t].kind)}),u.events.on(`cash`,({to:e,amount:t})=>{e===u.player&&this.toast(`+ $${t}`,`cash`)}),this.sync()}sync(){this.root.classList.toggle(`show`,this.game.phase===`match`)}mark(e,t){this.marker.className=`hitmark show${e?` head`:``}${t?` kill`:``}`,this.markTimer=t?.32:.16}toast(e,t=``){let n=$(`div`,`toast ${t}`,e);for(this.toasts.prepend(n);this.toasts.children.length>6;)this.toasts.lastElementChild?.remove();window.setTimeout(()=>n.classList.add(`out`),2600),window.setTimeout(()=>n.remove(),3100)}set(e,t,n){this.last[e]!==t&&(this.last[e]=t,n(t))}fixedUpdate(){this.after.fixedUpdate()}frameUpdate(e){let t=this.game,n=t.player;if(!n)return;this.after.update(e);let r=this.after.target;this.round.update(n,t.camera.yaw),this.map.update(e,r??n,r?n:null,t.camera.yaw),n.alive===this.down&&(this.down=!n.alive,this.root.classList.toggle(`dead`,this.down));let i=n.loadout,a=i.weapon,o=i.heldNow,s=n.alive&&n.state===`normal`,c=t.engine.camera,l=a?t.combat.spreadOf(n)*window.innerHeight/(2*Math.tan(c.fov*Math.PI/360)):0,u=Math.round(Math.min(90,4+l)),d=a?.id===`sniper`&&n.aiming>.82;this.set(`cross`,s&&a&&!d?u:-1,e=>{this.cross.classList.toggle(`show`,e!==-1),this.cross.style.setProperty(`--gap`,`${e}px`)}),this.set(`scope`,+!!d,e=>this.scope.classList.toggle(`show`,e===1)),this.markTimer>0&&(this.markTimer-=e,this.markTimer<=0&&this.marker.classList.remove(`show`)),this.hurtTimer>0&&(this.hurtTimer=Math.max(0,this.hurtTimer-e*1.4),this.hurtRing.style.opacity=Number.isNaN(this.hurtFrom)?`0`:String(this.hurtTimer),Number.isNaN(this.hurtFrom)||(this.hurtRing.style.transform=`translate(-50%, -50%) rotate(${-At(t.camera.yaw,this.hurtFrom)}rad)`));let f=n.alive&&n.health<30?.35+.25*Math.sin(t.engine.time*5):0;this.set(`vignette`,Math.round(Math.max(f,this.hurtTimer*.55)*20),e=>{this.vignette.style.opacity=String(Number(e)/20)}),this.set(`hp`,Math.ceil(n.health),e=>{this.health.style.width=`${Number(e)/n.maxHealth*100}%`,this.healthText.textContent=String(e),this.health.classList.toggle(`low`,Number(e)<30)}),this.set(`armor`,Math.ceil(n.armor),e=>{this.armor.style.width=`${Number(e)/n.maxArmor*100}%`,this.armorText.textContent=String(e)}),this.set(`cash`,n.cash,e=>{this.cash.textContent=`$${e}`});for(let e of this.pouch)this.set(`pouch-${e.id}`,n.inventory.count(e.id),t=>{e.count.textContent=String(t),e.node.classList.toggle(`have`,Number(t)>0)});let p=a&&o?`${$a[a.id].name}|${o.tier}`:``;this.set(`weapon`,p,()=>{this.weaponName.textContent=a&&o?$a[a.id].name:`Unarmed`,this.weaponName.style.setProperty(`--tier`,a&&o?lv(xo[o.tier].color):`transparent`),this.weaponName.dataset.tier=a&&o?xo[o.tier].name:``,this.ammo.classList.toggle(`show`,!!a)}),a&&o&&(this.set(`mag`,o.mag,e=>{this.ammoMag.textContent=String(e),this.ammoMag.classList.toggle(`low`,Number(e)<=Math.ceil(a.mag*.25))}),this.set(`reserve`,n.inventory.count(a.ammo),e=>{this.ammoReserve.textContent=String(e)}));let m=eo.map(e=>i.held[e]?`${i.held[e].tier}${e===i.current?`*`:``}`:`-`).join(``);this.set(`rack`,m,()=>{eo.forEach((e,t)=>{let n=this.slots[t],r=i.held[e];n.classList.toggle(`have`,!!r),n.classList.toggle(`on`,e===i.current),n.style.setProperty(`--tier`,r?lv(xo[r.tier].color):`transparent`)})});let h=``,g=0;i.using?(h=`Using ${$a[i.using].name}`,g=1-i.useLeft/wo[i.using].time):i.reloading>0&&i.reloadTotal>0&&(h=`Reloading`,g=1-i.reloading/i.reloadTotal),h!==this.shown&&(this.shown=h,this.reload.classList.toggle(`show`,h!==``),this.reloadText.textContent=h),h&&(this.reloadFill.style.width=`${Math.round(Math.min(1,Math.max(0,g))*100)}%`)}snapshot(){let e=this.game.player;return{visible:this.root.classList.contains(`show`),crosshair:this.cross.classList.contains(`show`),weapon:this.weaponName.textContent,mag:Number(this.ammoMag.textContent),reserve:Number(this.ammoReserve.textContent),health:Number(this.healthText.textContent),armor:Number(this.armorText.textContent),slots:this.slots.filter(e=>e.classList.contains(`have`)).map(e=>e.dataset.weapon),active:this.slots.find(e=>e.classList.contains(`on`))?.dataset.weapon??null,bar:this.shown,toasts:[...this.toasts.children].map(e=>e.textContent),player:e?.name??null,...this.round.snapshot(),...this.after.snapshot(),map:{...this.map.shown},fullMap:this.map.open?{...this.map.fullShown}:null}}},fv=e=>e<=0?`Off`:String(Math.round(e*100)),pv=[{key:`masterVolume`,id:`settings-master`,label:`Master`,scale:100,step:1,show:fv},{key:`sfxVolume`,id:`settings-effects`,label:`Effects`,scale:100,step:1,show:fv},{key:`musicVolume`,id:`settings-music`,label:`Music`,scale:100,step:1,show:fv}],mv=[{key:`sensitivity`,id:`settings-sensitivity`,label:`Sensitivity`,scale:100,step:5,show:e=>`${e.toFixed(2)}x`}];function hv(e){return`${[e.pixelRatio<1?`${Math.round(e.pixelRatio*100)}% resolution`:e.pixelRatio>1?`Up to ${e.pixelRatio}x resolution`:`Full resolution`,e.shadows?`${e.shadowMapSize} px shadows`:`no shadows`,e.bloom?`glow`:`no glow`,e.msaa>0?`${e.msaa}x smoothing`:`light smoothing`,`${(e.drawDistance/1e3).toFixed(1)} km view`].join(`, `)}.`}var gv=class{game;root;screen;card;sliders=[];presets=new Map;presetNote;invert;done;shown=!1;opener=null;inputWas=!0;hadLock=!1;constructor(e,t){this.game=e,this.root=t,this.screen=$(`section`,`settings`),this.screen.setAttribute(`role`,`dialog`),this.screen.setAttribute(`aria-modal`,`true`),this.screen.setAttribute(`aria-labelledby`,`settings-title`),this.card=$(`div`,`settings-card`),this.card.tabIndex=-1;let n=$(`header`,`settings-head`),r=$(`h2`,`settings-title`,`Settings`);r.id=`settings-title`,n.append(r,$(`p`,`settings-sub`,`Changes apply at once and are kept on this device.`));let i=this.group(`Sound`);for(let e of pv)i.append(this.slider(e));let a=this.group(`Picture`),o=$(`div`,`settings-row`);o.append($(`span`,`settings-label`,`Quality`));let s=$(`div`,`settings-presets`);s.setAttribute(`role`,`group`),s.setAttribute(`aria-label`,`Picture quality`);for(let e of Fp){let t=j_(`settings-preset`,Np[e].label,()=>this.game.settings.set(`quality`,e));t.dataset.quality=e,this.presets.set(e,t),s.append(t)}o.append(s),this.presetNote=$(`p`,`settings-note`),this.presetNote.setAttribute(`role`,`status`),a.append(o,this.presetNote);let c=this.group(`Mouse`);for(let e of mv)c.append(this.slider(e));let l=$(`label`,`settings-row settings-switch`);l.append($(`span`,`settings-label`,`Invert up and down`)),this.invert=$(`input`,`settings-check`),this.invert.type=`checkbox`,this.invert.id=`settings-invert`,this.invert.addEventListener(`change`,()=>this.game.settings.set(`invertY`,this.invert.checked)),l.append(this.invert,$(`span`,`settings-toggle`)),c.append(l);let u=$(`footer`,`settings-foot`),d=j_(`settings-reset`,`Reset`,()=>this.game.settings.reset());d.title=`Put every setting back to how the game came`,this.done=j_(`settings-done`,`Done`,()=>this.close()),u.append(d,this.done);let f=$(`div`,`settings-body`);f.append(i,a,c),this.card.append(n,f,u),this.screen.append(this.card),this.screen.addEventListener(`mousedown`,e=>{e.target===this.screen&&this.close()}),t.append(this.screen),e.settings.onChange(()=>this.refresh()),window.addEventListener(`keydown`,this.onKey,!0),this.refresh()}get open(){return this.shown}show(){if(this.shown)return;let e=this.game.input;this.shown=!0,this.opener=document.activeElement instanceof HTMLElement?document.activeElement:null,this.root.classList.add(`settings-open`),this.screen.classList.add(`show`),this.inputWas=e.enabled,e.enabled=!1,this.hadLock=e.locked,this.hadLock&&e.setWantLock(!1),this.refresh(),this.card.focus({preventScroll:!0})}close(){if(!this.shown)return;let e=this.game.input;this.shown=!1,this.screen.classList.remove(`show`),this.root.classList.remove(`settings-open`),e.enabled=this.inputWas,this.inputWas&&(e.endFixedStep(),e.endFrame()),this.hadLock&&this.game.phase===`match`&&e.setWantLock(!0),this.opener?.focus({preventScroll:!0}),this.opener=null}describe(){return{open:this.shown,...this.game.settings.data}}group(e){let t=$(`section`,`settings-group`);return t.append($(`h3`,`settings-legend`,e)),t}slider(e){let[t,n]=Ip[e.key],r=$(`label`,`settings-row`);r.htmlFor=e.id;let i=$(`input`,`settings-range`);i.type=`range`,i.id=e.id,i.min=String(t*e.scale),i.max=String(n*e.scale),i.step=String(e.step);let a=$(`output`,`settings-value`);return a.htmlFor.add(e.id),i.addEventListener(`input`,()=>this.game.settings.set(e.key,Number(i.value)/e.scale)),r.append($(`span`,`settings-label`,e.label),i,a),this.sliders.push({def:e,input:i,value:a}),r}refresh(){let e=this.game.settings.data;for(let t of this.sliders){let n=e[t.def.key],[r,i]=Ip[t.def.key],a=String(Math.round(n*t.def.scale));t.input.value!==a&&(t.input.value=a),t.input.style.setProperty(`--fill`,`${(n-r)/(i-r)*100}%`),t.value.textContent=t.def.show(n)}for(let[t,n]of this.presets){let r=t===e.quality;n.classList.toggle(`on`,r),n.setAttribute(`aria-pressed`,String(r))}this.presetNote.textContent=hv(Np[e.quality]),this.invert.checked=e.invertY}onKey=e=>{if(this.shown){if(e.code===`Escape`)e.preventDefault(),e.stopPropagation(),this.close();else if(e.code===`Tab`){let t=[...this.card.querySelectorAll(`input, button`)],n=t[0],r=t[t.length-1],i=document.activeElement;if(!n||!r)return;e.shiftKey&&(i===n||i===this.card)?(e.preventDefault(),r.focus()):!e.shiftKey&&i===r?(e.preventDefault(),n.focus()):this.card.contains(i)||(e.preventDefault(),n.focus())}}}},_v=null;function vv(e,t){_v??=new gv(e,t);let n=_v;return e.debugExt.settings=()=>n.describe(),n}function yv(){_v?.show()}function bv(){return j_(`settings-button`,`Settings`,()=>yv())}var xv=[{name:`Seaplane drop`,note:`Jump, fly, land`,drop:!0,x:0,z:0,yaw:0},{name:`Deco Row`,note:`Avenida del Sol`,x:-60,z:13,yaw:-Math.PI/2},{name:`Ocean Parade`,note:`The beach`,x:385,z:150,yaw:-Math.PI/2},{name:`Gran Via`,note:`Canal bridge`,x:-5,z:-118,yaw:0},{name:`Parade Pier`,note:`Out over the surf`,x:430,z:0,yaw:-Math.PI/2},{name:`El Mercado`,note:`Market streets`,x:-60,z:245,yaw:Math.PI}],Sv=[[`W A S D`,`Move, steer, drive`],[`Mouse`,`Look, fire, aim`],[`Space`,`Jump, parachute`],[`Shift`,`Sprint`],[`C`,`Crouch, slide`],[`E`,`Use, open, get in`],[`1 to 5`,`Weapons`],[`R`,`Reload`],[`Q  X`,`Heal, armor up`],[`G`,`Throw a frag`],[`M`,`Map`],[`Esc`,`Pause`]],Cv=[`shop-open`,`map-open`,`result-open`,`settings-open`],wv=class{game;root;pauseSlot=$(`div`,`pause-slot`);title;prompt;promptText;pause;resume;hint=$(`div`,`look-hint`,`Click to look around`);paused=!1;hadLock=!1;place;note;altimeter;altValue;altLabel;toldFreeLook=!1;start=0;shownPrompt=``;timer=0;constructor(e,t){this.game=e,this.root=t,this.title=this.buildTitle(),this.resume=j_(`pause-resume`,`Resume`,()=>this.setPaused(!1)),this.pause=this.buildPause(),vv(e,t),this.pauseSlot.append(bv()),this.prompt=$(`div`,`prompt`),this.prompt.append($(`kbd`,`key`,`E`)),this.promptText=$(`span`,`prompt-text`),this.prompt.append(this.promptText),this.place=$(`div`,`place`),this.note=$(`div`,`note`),this.altimeter=$(`div`,`altimeter`),this.altValue=$(`span`,`altimeter-value`,`0`),this.altLabel=$(`span`,`altimeter-label`,`m above ground`),this.altimeter.append(this.altValue,this.altLabel),t.append(this.place,this.note,this.altimeter,this.prompt,this.hint,this.pause,this.title),e.events.on(`phase`,()=>{this.setPaused(!1,!1),this.sync()}),document.addEventListener(`pointerlockchange`,()=>this.onLock()),window.addEventListener(`keydown`,e=>{e.repeat||(e.code===`Enter`&&this.game.phase===`menu`?this.play():e.code===`Escape`&&!e.defaultPrevented&&this.game.phase===`match`&&!this.busy()&&this.setPaused(!this.paused))}),this.sync(),this.timer=window.setInterval(()=>this.tick(),100)}dispose(){window.clearInterval(this.timer)}play(){let e=xv[this.start]??xv[0];e.drop?this.game.startMatch():this.game.startAt(e.x,e.z,e.yaw),this.place.textContent=e.drop?`Marazul Bay`:e.name,this.place.classList.remove(`show`),this.place.offsetWidth,this.place.classList.add(`show`),this.sync()}buildTitle(){let e=$(`section`,`title`);e.setAttribute(`aria-label`,`Title screen`);let t=$(`div`,`title-panel`);t.append($(`div`,`title-kicker`,`Hurricane season, Marazul Bay`)),t.append($(`h1`,`title-name`,`EYEWALL`)),t.append($(`p`,`title-line`,`The storm is closing on the city. Land, gear up and be the last one standing in the eye.`));let n=$(`div`,`title-pick`);n.append($(`div`,`title-label`,`Start in`));let r=$(`div`,`chips`);xv.forEach((e,t)=>{let n=$(`button`,`chip`);n.type=`button`,n.dataset.start=String(t),n.append($(`span`,`chip-name`,e.name),$(`span`,`chip-note`,e.note)),n.addEventListener(`click`,()=>{this.start=t;for(let e of r.children)e.classList.toggle(`on`,e===n)}),t===0&&n.classList.add(`on`),r.append(n)}),n.append(r),t.append(n);let i=$(`button`,`play`,`Play`);i.type=`button`,i.id=`play`,i.addEventListener(`click`,()=>this.play()),t.append(i),t.append(bv());let a=$(`dl`,`keys`);for(let[e,t]of Sv){let n=$(`div`,`keys-row`);n.append($(`dt`,`key`,e),$(`dd`,`keys-what`,t)),a.append(n)}return t.append(a),t.append($(`p`,`title-note`,`One round: 23 rivals drop with you. Loot coolers and duffel bags, take a car, buy at the shops, and stay inside the eye as the storm closes.`)),e.append(t),e}buildPause(){let e=$(`div`,`pause`);e.setAttribute(`role`,`dialog`),e.setAttribute(`aria-label`,`Paused`);let t=j_(`pause-back`,`Title`,()=>{this.game.input.setWantLock(!1),this.game.match.stop(),this.game.setPhase(`menu`)}),n=$(`div`,`pause-actions`);n.append(this.resume,this.pauseSlot,t);let r=$(`div`,`pause-text`);return r.append($(`kbd`,`key key-small`,`Esc`),` resumes`),e.append($(`div`,`pause-title`,`Paused`),n,r),e}busy(){let e=this.root.classList;for(let t of Cv)if(e.contains(t))return!0;return!1}onLock(){let e=this.game,t=document.pointerLockElement===e.canvas;!this.hadLock||t||e.phase!==`match`||this.paused||e.input.freeLook||this.busy()||this.setPaused(!0),this.hadLock=t,this.sync()}setPaused(e,t=!0){if(e===this.paused)return;let n=this.game;this.paused=e,n.engine.timeScale=+!e,n.input.enabled=!e,this.root.classList.toggle(`paused`,e),this.sync(),e?(n.input.setWantLock(!1),this.resume.focus({preventScroll:!0})):(n.input.endFixedStep(),n.input.endFrame(),n.canvas.focus({preventScroll:!0}),t&&n.phase===`match`&&n.input.setWantLock(!0))}sync(){let e=this.game,t=e.phase===`menu`&&!e.cameraOverride;this.title.classList.toggle(`hidden`,!t),this.title.inert=!t,e.engine&&(e.engine.renderEnabled=!t);let n=e.input,r=e.phase===`match`;this.pause.classList.toggle(`show`,r&&this.paused);let i=r&&!this.paused&&!!n&&!n.locked&&!n.freeLook&&!this.busy();this.hint.classList.toggle(`show`,i)}tick(){let e=this.game;e.input?.lockDenied&&!this.toldFreeLook&&(this.toldFreeLook=!0,this.note.textContent=`Move the pointer to look. Rest it near a side edge to keep turning.`,this.note.classList.add(`show`),window.setTimeout(()=>this.note.classList.remove(`show`),9e3));let t=e.phase===`match`?e.match.stage:`none`,n=t===`aboard`||t===`falling`||t===`canopy`;this.altimeter.classList.toggle(`show`,n),n&&e.player&&(this.altValue.textContent=String(Math.max(0,Math.round(e.drop.altitude(e.player)))),this.altLabel.textContent=t===`aboard`?`m, aboard the seaplane`:t===`falling`?`m, freefall`:`m, under canopy`);let r=e.phase===`match`?e.controller?.prompt??``:``,i=e.player?.vehicle;i&&Math.abs(i.speed)>2.5&&(r=``),r!==this.shownPrompt&&(this.shownPrompt=r,r!==``&&(this.promptText.textContent=r),this.prompt.classList.toggle(`show`,r!==``)),this.sync()}},Tv=document.getElementById(`game`),Ev=document.getElementById(`boot`),Dv=document.getElementById(`boot-fill`),Ov=document.getElementById(`boot-text`),kv=new URLSearchParams(location.search),Av=new A_(Tv,{seed:Number(kv.get(`seed`)??1977)||1977}),jv=Jo(Av);window.addEventListener(`error`,e=>Av.errors.push(String(e.message))),window.addEventListener(`unhandledrejection`,e=>Av.errors.push(String(e.reason)));function Mv(e,t){Dv.style.width=`${Math.round(e*100)}%`,Ov.textContent=t}Av.init(Mv).then(()=>{Ev.classList.add(`hidden`);let e=document.getElementById(`ui`);new wv(Av,e);let t=Av.addSystem(new dv(Av,e));Av.debugExt.hud=()=>t.snapshot();let n=kv.get(`at`);if(n){let[e,t,r]=n.split(`,`).map(Number);Av.startAt(e??0,t??0,r??0),Av.input.freeLook=kv.has(`freelook`)}jv.ready=!0}).catch(e=>{console.error(e),Av.errors.push(String(e)),Ov.textContent=`Could not start: ${String(e)}`});export{$a as a,ja as c,_s as i,Ta as l,eg as n,Qa as o,Qh as r,Ba as s,$h as t};
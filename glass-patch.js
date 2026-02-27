// GLASS PATCH — Apply this to tawaf-gl.js
// 
// This patch replaces Three.js's weak built-in dispersion with a 10-sample
// chromatic aberration technique (Franky Hung / Maxime Heckel method).
// Each R/G/B channel gets its own IOR, then each is spread across 10 
// sub-samples for smooth prismatic rainbows — exactly like a real dichroic cube.
//
// INSTRUCTIONS:
// 1. In tawaf-gl.js, find the line:
//    const glassCube = new THREE.Mesh(_glassCubeGeo, _glassCubeMat);
//
// 2. INSERT the following block BEFORE that line (after the }); that closes the material):

// ── CHROMATIC DISPERSION OVERRIDE ──────────────────────────────
// Replace Three.js's weak 3-sample dispersion with a 10-sample smooth spread
// per channel. This is the Franky Hung / Maxime Heckel technique.
_glassCubeMat.onBeforeCompile = function(shader) {
    shader.fragmentShader = shader.fragmentShader.replace(
        '#include <transmission_pars_fragment>',
        /* glsl */`
        #ifdef USE_TRANSMISSION

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

            // Bicubic filtering (from Three.js source — required for transmission sampling)
            float w0( float a ) { return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 ); }
            float w1( float a ) { return ( 1.0 / 6.0 ) * ( a * a * ( 3.0 * a - 6.0 ) + 4.0 ); }
            float w2( float a ) { return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 ); }
            float w3( float a ) { return ( 1.0 / 6.0 ) * ( a * a * a ); }
            float g0( float a ) { return w0( a ) + w1( a ); }
            float g1( float a ) { return w2( a ) + w3( a ); }
            float h0( float a ) { return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) ); }
            float h1( float a ) { return 1.0 + w3( a ) / ( w2( a ) + w3( a ) ); }

            vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
                uv = uv * texelSize.zw + 0.5;
                vec2 iuv = floor( uv );
                vec2 fuv = fract( uv );
                float g0x = g0( fuv.x ); float g1x = g1( fuv.x );
                float h0x = h0( fuv.x ); float h1x = h1( fuv.x );
                float h0y = h0( fuv.y ); float h1y = h1( fuv.y );
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
                    vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );
                    return transmittance;
                }
            }

            // ── CHROMATIC DISPERSION — 10-sample smooth spread per channel ──
            // Each color channel refracts at a different IOR, spread across 10
            // sub-samples for smooth rainbow gradients like a real dichroic prism.
            vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
                const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
                const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
                const in vec3 attenuationColor, const in float attenuationDistance ) {

                // Per-channel IOR — red bends least, blue most (real glass physics)
                const float rIOR = 1.40;
                const float gIOR = 1.45;
                const float bIOR = 1.52;

                // Compute refracted rays for each channel
                vec3 transmissionRayRed = getVolumeTransmissionRay( n, v, thickness, rIOR, modelMatrix );
                vec4 ndcPos = projMatrix * viewMatrix * vec4( position + transmissionRayRed, 1.0 );
                vec2 refractionCoordsRed = ndcPos.xy / ndcPos.w;

                vec3 transmissionRayGrn = getVolumeTransmissionRay( n, v, thickness, gIOR, modelMatrix );
                ndcPos = projMatrix * viewMatrix * vec4( position + transmissionRayGrn, 1.0 );
                vec2 refractionCoordsGrn = ndcPos.xy / ndcPos.w;

                vec3 transmissionRayBlu = getVolumeTransmissionRay( n, v, thickness, bIOR, modelMatrix );
                ndcPos = projMatrix * viewMatrix * vec4( position + transmissionRayBlu, 1.0 );
                vec2 refractionCoordsBlu = ndcPos.xy / ndcPos.w;

                // 10 sub-samples per channel — dissolves sharp refraction into smooth rainbow
                const int LOOP = 10;
                const float rSpread = 0.08;
                const float gSpread = 0.10;
                const float bSpread = 0.12;

                vec4 transmittedLight = vec4(0.0, 0.0, 0.0, 1.0);

                for ( int i = 0; i < LOOP; i++ ) {
                    float fi = float(i) / float(LOOP);
                    vec2 rSlide = vec2(1.0 + fi * rSpread * transmissionRayRed.xy);
                    vec2 gSlide = vec2(1.0 + fi * gSpread * transmissionRayGrn.xy);
                    vec2 bSlide = vec2(1.0 + fi * bSpread * transmissionRayBlu.xy);
                    transmittedLight.r += getTransmissionSample( (refractionCoordsRed + 1.0) / 2.0 * rSlide, roughness, rIOR ).r;
                    transmittedLight.g += getTransmissionSample( (refractionCoordsGrn + 1.0) / 2.0 * gSlide, roughness, gIOR ).g;
                    transmittedLight.b += getTransmissionSample( (refractionCoordsBlu + 1.0) / 2.0 * bSlide, roughness, bIOR ).b;
                }
                transmittedLight.rgb /= float(LOOP);

                vec3 transmittance = diffuseColor * volumeAttenuation( length( transmissionRayGrn ), attenuationColor, attenuationDistance );
                vec3 attenuatedColor = transmittance * transmittedLight.rgb;

                vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
                float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
                return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
            }
        #endif
        `
    );
};
_glassCubeMat.needsUpdate = true;

// 3. Also add gentle rotation animation. In the render loop (the animate() function),
//    add this line where the glassCube breathing/rotation is updated:
//    glassCube.rotation.y += 0.003;  // slow continuous rotation reveals Fresnel shifts


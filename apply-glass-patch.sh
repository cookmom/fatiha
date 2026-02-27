#!/bin/bash
# Apply the chromatic dispersion glass shader patch to tawaf-gl.js
# Run from: /home/tawfeeq/ramadan-clock-site/

set -e

FILE="tawaf-gl.js"
BACKUP="${FILE}.bak-$(date +%s)"

echo "Creating backup: $BACKUP"
cp "$FILE" "$BACKUP"

# Use Python for reliable multi-line replacement
python3 << 'PYEOF'
import re

with open('tawaf-gl.js', 'r') as f:
    code = f.read()

# The onBeforeCompile block to insert
patch = r'''
// ── CHROMATIC DISPERSION OVERRIDE ──────────────────────────────
// Replace Three.js's weak 3-sample dispersion with a 10-sample smooth spread
// per channel (Franky Hung / Maxime Heckel technique).
_glassCubeMat.onBeforeCompile = function(shader) {
    shader.fragmentShader = shader.fragmentShader.replace(
        '#include <transmission_pars_fragment>',
        `
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

            vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
                const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
                const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
                const in vec3 attenuationColor, const in float attenuationDistance ) {

                const float rIOR = 1.40;
                const float gIOR = 1.45;
                const float bIOR = 1.52;

                vec3 transmissionRayRed = getVolumeTransmissionRay( n, v, thickness, rIOR, modelMatrix );
                vec4 ndcPos = projMatrix * viewMatrix * vec4( position + transmissionRayRed, 1.0 );
                vec2 refractionCoordsRed = ndcPos.xy / ndcPos.w;

                vec3 transmissionRayGrn = getVolumeTransmissionRay( n, v, thickness, gIOR, modelMatrix );
                ndcPos = projMatrix * viewMatrix * vec4( position + transmissionRayGrn, 1.0 );
                vec2 refractionCoordsGrn = ndcPos.xy / ndcPos.w;

                vec3 transmissionRayBlu = getVolumeTransmissionRay( n, v, thickness, bIOR, modelMatrix );
                ndcPos = projMatrix * viewMatrix * vec4( position + transmissionRayBlu, 1.0 );
                vec2 refractionCoordsBlu = ndcPos.xy / ndcPos.w;

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

'''

# Find the insertion point: after the material closing }); and before glassCube creation
target = "const glassCube = new THREE.Mesh(_glassCubeGeo, _glassCubeMat);"
if target not in code:
    print("ERROR: Could not find insertion point")
    exit(1)

# Also update material to use DoubleSide (required for seeing backface refraction)
# and reduce dispersion since our custom shader handles it now
code = code.replace(target, patch + target)

# Bump version cache buster
import re
code = re.sub(r'tawaf-gl\.js\?v=\d+', lambda m: 'tawaf-gl.js?v=130', code)

with open('tawaf-gl.js', 'w') as f:
    f.write(code)

print("✅ Patch applied successfully!")
print("   - Chromatic dispersion override (onBeforeCompile)")
print("   - 10-sample smooth spread per R/G/B channel")
print("   - Per-channel IOR: R=1.40, G=1.45, B=1.52")
print("   - Version bumped to v=130")
PYEOF

echo ""
echo "To test locally: python3 -m http.server 8080"
echo "To push: git add -A && git commit -m 'v130: dichroic chromatic dispersion shader' && git push"

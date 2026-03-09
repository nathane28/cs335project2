export let defaultVSText = `
    precision mediump float;

    attribute vec4 vertPosition;
    attribute vec4 aNorm;

    varying vec4 lightDir;
    varying vec4 normal;

    uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    void main () {
        // Transform vertex position to clip space
        gl_Position = mProj * mView * mWorld * vertPosition;

        // Light direction in world coordinates
        lightDir = lightPosition - mWorld * vertPosition;

        // Pass normal in world coordinates
        normal = mWorld * aNorm;
    }
`;

export let defaultFSText = `
    precision mediump float;

    varying vec4 lightDir;
    varying vec4 normal;

    void main () {
        // Normalize vectors for lighting
        vec3 N = normalize(normal.xyz);
        vec3 L = normalize(lightDir.xyz);

        // Diffuse shading: how much does this face point toward the light?
        float diffuse = max(dot(N, L), 0.0);

        // Color the face based on which axis the normal points along
        // We use the ABSOLUTE value to handle both + and - directions
        vec3 baseColor;
        vec3 absN = abs(N);

        if (absN.x >= absN.y && absN.x >= absN.z) {
            // Normal points most along X axis -> red
            baseColor = vec3(1.0, 0.0, 0.0);
        } else if (absN.y >= absN.x && absN.y >= absN.z) {
            // Normal points most along Y axis -> green
            baseColor = vec3(0.0, 1.0, 0.0);
        } else {
            // Normal points most along Z axis -> blue
            baseColor = vec3(0.0, 0.0, 1.0);
        }

        // Apply diffuse shading to the base color
        // Add a small ambient term so dark faces aren't completely black
        float ambient = 0.2;
        vec3 finalColor = baseColor * (ambient + (1.0 - ambient) * diffuse);

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

// Floor vertex shader - passes world position through for checkerboard
export let floorVSText = `
    precision mediump float;

    attribute vec4 vertPosition;
    attribute vec4 aNorm;

    varying vec4 lightDir;
    varying vec4 normal;
    varying vec4 worldPos;

    uniform vec4 lightPosition;
    uniform mat4 mWorld;
    uniform mat4 mView;
    uniform mat4 mProj;

    void main () {
        worldPos = mWorld * vertPosition;
        gl_Position = mProj * mView * worldPos;
        lightDir = lightPosition - worldPos;
        normal = mWorld * aNorm;
    }
`;

// Floor fragment shader - draws a checkerboard pattern
export let floorFSText = `
    precision mediump float;

    varying vec4 lightDir;
    varying vec4 normal;
    varying vec4 worldPos;

    void main () {
        // Normalize for lighting
        vec3 N = normalize(normal.xyz);
        vec3 L = normalize(lightDir.xyz);
        float diffuse = max(dot(N, L), 0.0);
        float ambient = 0.2;
        float light = ambient + (1.0 - ambient) * diffuse;

        // Checkerboard: divide world x and z into 5x5 cells
        float cellSize = 5.0;
        float cx = floor(worldPos.x / cellSize);
        float cz = floor(worldPos.z / cellSize);

        // mod(cx + cz, 2) alternates 0 and 1 in a checkerboard pattern
        float checker = mod(cx + cz + 1.0, 2.0);

        // 0 = white cell, 1 = black cell
        vec3 baseColor = checker < 1.0 ? vec3(1.0, 1.0, 1.0) : vec3(0.0, 0.0, 0.0);

        gl_FragColor = vec4(baseColor * light, 1.0);
    }
`;
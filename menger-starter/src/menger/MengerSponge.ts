import { Mat3, Mat4, Vec3, Vec4 } from "../lib/TSM.js";

/* A potential interface that students should implement */
interface IMengerSponge {
  setLevel(level: number): void;
  isDirty(): boolean;
  setClean(): void;
  normalsFlat(): Float32Array;
  indicesFlat(): Uint32Array;
  positionsFlat(): Float32Array;
}

/**
 * Represents a Menger Sponge
 */
export class MengerSponge implements IMengerSponge {

  // TODO: sponge data structures
  private positions: number[] = [];
  private indices: number[] = [];
  private normals: number[] = [];
  private level: number = 0;
  private dirty: boolean = true;
  
  constructor(level: number) {
	  this.setLevel(level);
	  // TODO: other initialization	
  }

  /**
   * Returns true if the sponge has changed.
   */
  public isDirty(): boolean {
    return this.dirty;
  }

  public setClean(): void {
    this.dirty = false;
  }
  // Add one cube's 6 face into geometry arrays
  private addCube(x: number, y: number, z: number, size: number): void {
    const s = size;

    // 8 corners in a cube
    const corners: number[][] = [
      [x,     y,     z],
      [x + s, y,     z],
      [x + s, y + s, z],
      [x,     y + s, z],
      [x,     y,     z + s],
      [x + s, y,     z + s],
      [x + s, y + s, z + s],
      [x,     y + s, z + s],
    ];
    
    // 6 faces each has 4 vertices
    const faces = [
      { verts: [4, 5, 6, 7], normal: [ 0,  0,  1] }, // front  (+z)
      { verts: [1, 0, 3, 2], normal: [ 0,  0, -1] }, // back   (-z)
      { verts: [0, 4, 7, 3], normal: [-1,  0,  0] }, // left   (-x)
      { verts: [5, 1, 2, 6], normal: [ 1,  0,  0] }, // right  (+x)
      { verts: [3, 7, 6, 2], normal: [ 0,  1,  0] }, // top    (+y)
      { verts: [0, 1, 5, 4], normal: [ 0, -1,  0] }, // bottom (-y)
    ];

    for (const face of faces) {
      const startIndex = this.positions.length / 4; // 4 components per vertex (x, y, z, w)
      for (const vert of face.verts) {
        const [vx, vy, vz] = corners[vert];
        this.positions.push(vx, vy, vz, 1.0); // w = 1.0 for position
        this.normals.push(face.normal[0], face.normal[1], face.normal[2], 0.0); // w = 0.0 for normal
      }
      // Two triangles per face
      this.indices.push(startIndex, startIndex + 1, startIndex + 2);
      this.indices.push(startIndex + 2, startIndex + 3, startIndex);
    }
  }

  public saveOBJ(): void {
    let objContent = "# Menger Sponge Export\n";
    
    // 1. Export Vertices
    // positions array has 4 floats per vertex (x, y, z, w)
    for (let i = 0; i < this.positions.length; i += 4) {
      objContent += `v ${this.positions[i]} ${this.positions[i+1]} ${this.positions[i+2]}\n`;
    }

    // 2. Export Faces
    // indices array has 3 integers per triangle
    for (let i = 0; i < this.indices.length; i += 3) {
      objContent += `f ${this.indices[i]+1} ${this.indices[i+1]+1} ${this.indices[i+2]+1}\n`;
    }

    // 3. Trigger Browser Download
    const element = document.createElement('a');
    const file = new Blob([objContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'menger_sponge.obj';
    document.body.appendChild(element); // Required for Firefox
    element.click();
    document.body.removeChild(element);
  }

  // Recursively subdivide the cube to create the Menger geometry
  private generate(x: number, y: number, z: number, size: number, level: number): void {
    if (level === 0) {
      this.addCube(x, y, z, size);
      return;
    }
    const newSize = size / 3;
    for (let dx = 0; dx < 3; dx++) {
      for (let dy = 0; dy < 3; dy++) {
        for (let dz = 0; dz < 3; dz++) {
          // Count how many of the three axes are at the middle position (1)
          const midCount = ((dx === 1 ? 1 : 0) + (dy === 1 ? 1 : 0) + (dz === 1 ? 1 : 0));
          // Skip the center cube and the cubes in the middle of each face
          if (midCount >= 2) continue;
          this.generate(x + dx * newSize, y + dy * newSize, z + dz * newSize, newSize, level - 1);
        }
      }
    }   
  }

  public setLevel(level: number)
  {
	  // TODO: initialize the cube
    this.level = level;

    // Clear previous geometry
    this.positions = [];
    this.indices = [];
    this.normals = [];

    // Generate new geometry
    this.generate(-0.5, -0.5, -0.5, 1.0, level);
    this.dirty = true;
  }

  /* Returns a flat Float32Array of the sponge's vertex positions */
  public positionsFlat(): Float32Array {
	  // TODO: right now this makes a single triangle. Make the cube fractal instead.
	  return new Float32Array(this.positions);
  }

  /**
   * Returns a flat Uint32Array of the sponge's face indices
   */
  public indicesFlat(): Uint32Array {
    // TODO: right now this makes a single triangle. Make the cube fractal instead.
    return new Uint32Array(this.indices);
  }

  /**
   * Returns a flat Float32Array of the sponge's normals
   */
  public normalsFlat(): Float32Array {
	  // TODO: right now this makes a single triangle. Make the cube fractal instead.
	  return new Float32Array(this.normals);
  }

  /**
   * Returns the model matrix of the sponge
   */
  public uMatrix(): Mat4 {

    // TODO: change this, if it's useful
    const ret : Mat4 = new Mat4().setIdentity();
    return ret;    
  }
}

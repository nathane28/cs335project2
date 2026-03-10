import { Camera } from "../lib/webglutils/Camera.js";
import { CanvasAnimation } from "../lib/webglutils/CanvasAnimation.js";
import { MengerSponge } from "./MengerSponge.js";
import { Mat4, Vec3 } from "../lib/TSM.js";

/**
 * Might be useful for designing any animation GUI
 */
interface IGUI {
  viewMatrix(): Mat4;
  projMatrix(): Mat4;
  dragStart(me: MouseEvent): void;
  drag(me: MouseEvent): void;
  dragEnd(me: MouseEvent): void;
  onKeydown(ke: KeyboardEvent): void;
}

/**
 * Handles Mouse and Button events along with
 * the the camera.
 */
export class GUI implements IGUI {
  private static readonly rotationSpeed: number = 0.05;
  private static readonly zoomSpeed: number = 0.1;
  private static readonly rollSpeed: number = 0.1;
  private static readonly panSpeed: number = 0.1;

  private camera: Camera;
  private dragging: boolean;
  private fps: boolean;
  private prevX: number;
  private prevY: number;

  private height: number;
  private width: number;

  private sponge: MengerSponge;
  private animation: CanvasAnimation;

  /**
   *
   * @param canvas required to get the width and height of the canvas
   * @param animation required as a back pointer for some of the controls
   * @param sponge required for some of the controls
   */
  constructor(
    canvas: HTMLCanvasElement,
    animation: CanvasAnimation,
    sponge: MengerSponge
  ) {
    this.height = canvas.height;
    this.width = canvas.width;
    this.prevX = 0;
    this.prevY = 0;

    this.sponge = sponge;
    this.animation = animation;

	  this.reset();
    this.registerEventListeners(canvas);
  }

  /**
   * Resets the state of the GUI
   */
  public reset(): void {
    this.fps = false;
    this.dragging = false;
    this.prevX = 0;
    this.prevY = 0;

    /* Create camera setup */
    this.camera = new Camera(
      new Vec3([0, 0, -6]),
      new Vec3([0, 0, 0]),
      new Vec3([0, 1, 0]),
      45,
      this.width / this.height,
      0.1,
      1000.0
    );
  }

  /**
   * Sets the GUI's camera to the given camera
   * @param cam a new camera
   */
  public setCamera(
    pos: Vec3,
    target: Vec3,
    upDir: Vec3,
    fov: number,
    aspect: number,
    zNear: number,
    zFar: number
  ) {
    this.camera = new Camera(pos, target, upDir, fov, aspect, zNear, zFar);
  }

  /**
   * Returns the view matrix of the camera
   */
  public viewMatrix(): Mat4 {
    return this.camera.viewMatrix();
  }

  /**
   * Returns the projection matrix of the camera
   */
  public projMatrix(): Mat4 {
    return this.camera.projMatrix();
  }

  /**
   * Callback function for the start of a drag event.
   * @param mouse
   */
  public dragStart(mouse: MouseEvent): void {
    this.dragging = true;
    this.prevX = mouse.screenX;
    this.prevY = mouse.screenY;
  }

  /**
   * The callback function for a drag event.
   * This event happens after dragStart and
   * before dragEnd.
   * @param mouse
   */
  public drag(mouse: MouseEvent): void {
	  
	  // TODO: Your code here for left and right mouse drag
    // Left click = FPS rotation
    // Right click = Zoom in and out
    if (mouse.buttons === 0) return; // No buttons are pressed, so do nothing

    const deltaX = mouse.screenX - this.prevX;
    const deltaY = mouse.screenY - this.prevY;
    this.prevX = mouse.screenX;
    this.prevY = mouse.screenY;

    if (mouse.buttons === 1) {
      // Left button is pressed: FPS rotation
      // Compute a single rotation axis from the mouse drag direction
      if (deltaX !== 0 || deltaY !== 0) {
        // World-space direction of mouse movement (negate deltaY since screen Y is inverted)
        const viewChange = this.camera.right().scale(deltaX).add(this.camera.up().scale(-deltaY));
        // Look direction is -forward (forward points behind camera by convention)
        const look = this.camera.forward().scale(-1);
        // Rotation axis perpendicular to look and the view change direction
        const axis = Vec3.cross(look, viewChange);
        if (axis.length() > 0.0001) {
          this.camera.rotate(axis, GUI.rotationSpeed);
        }
      }
    } else if (mouse.buttons === 2) {
      // Right button is pressed: Zoom in/out
      if (deltaY !== 0) {
        this.camera.offsetDist(deltaY > 0 ? GUI.zoomSpeed : -GUI.zoomSpeed);
      }
    }
  }

  /**
   * Callback function for the end of a drag event
   * @param mouse
   */
  public dragEnd(mouse: MouseEvent): void {
    this.dragging = false;
    this.prevX = 0;
    this.prevY = 0;
  }

  /**
   * Callback function for a key press event
   * @param key
   */
  public onKeydown(key: KeyboardEvent): void {
    /*
       Note: key.code uses key positions, i.e a QWERTY user uses y where
             as a Dvorak user must press F for the same action.
       Note: arrow keys are only registered on a KeyDown event not a
       KeyPress event
       We can use KeyDown due to auto repeating.
     */

	// TOOD: Your code for key handling

    switch (key.code) {
      case "KeyW": {
        this.camera.offset(this.camera.forward(), -GUI.zoomSpeed, true);
        break;
      }
      case "KeyA": {
        this.camera.offset(this.camera.right(), -GUI.zoomSpeed, true);
        break;
      }
      case "KeyS": {
        // extra credit: save current geometry to an OBJ File
        if (key.ctrlKey){
          this.sponge.saveOBJ();
        } else {
          this.camera.offset(this.camera.forward(), GUI.zoomSpeed, true);
        }
        break;
      }
      case "KeyD": {
        this.camera.offset(this.camera.right(), GUI.zoomSpeed, true);
        break;
      }
      case "KeyR": {
        this.reset();
        break;
      }
      case "ArrowLeft": {
        this.camera.roll(GUI.rollSpeed, false);
        break;
      }
      case "ArrowRight": {
        this.camera.roll(GUI.rollSpeed, true);
        break;
      }
      case "ArrowUp": {
        this.camera.offset(this.camera.up(), GUI.panSpeed, true);
        break;
      }
      case "ArrowDown": {
        this.camera.offset(this.camera.up(), -GUI.panSpeed, true);
        break;
      }
      case "Digit1": {
        this.sponge.setLevel(0);
        break;
      }
      case "Digit2": {
        this.sponge.setLevel(1);
        break;
      }
      case "Digit3": {
        this.sponge.setLevel(2);
        break;
      }
      case "Digit4": {
        this.sponge.setLevel(3);
        break;
      }
      default: {
        console.log("Key : '", key.code, "' was pressed.");
        break;
      }
    }
  }

  /**
   * Registers all event listeners for the GUI
   * @param canvas The canvas being used
   */
  private registerEventListeners(canvas: HTMLCanvasElement): void {
    /* Event listener for key controls */
    window.addEventListener("keydown", (key: KeyboardEvent) =>
      this.onKeydown(key)
    );

    /* Event listener for mouse controls */
    canvas.addEventListener("mousedown", (mouse: MouseEvent) =>
      this.dragStart(mouse)
    );

    canvas.addEventListener("mousemove", (mouse: MouseEvent) =>
      this.drag(mouse)
    );

    canvas.addEventListener("mouseup", (mouse: MouseEvent) =>
      this.dragEnd(mouse)
    );

    /* Event listener to stop the right click menu */
    canvas.addEventListener("contextmenu", (event: any) =>
      event.preventDefault()
    );
  }
}

export type CameraPermissionState = 
  | 'granted' 
  | 'denied' 
  | 'prompt' 
  | 'prompt-with-rationale' 
  | 'unavailable';

export interface CameraPermissionResult {
  camera: CameraPermissionState;
  isNative: boolean;
}

import { RoomEnvironment as _RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { PMREMGenerator } from "three";

/**
 * Lightweight scene lighting, by dynamically-generated IBL. Higher quality
 * than analytical lights and lower bandwidth cost than downloading an HDR image.
 */
export function RoomEnvironment() {
  const { gl, scene } = useThree(({ gl, scene }) => ({ gl, scene }));

  useEffect(() => {
    const environment = new _RoomEnvironment();
    const pmremGenerator = new PMREMGenerator(gl);
    scene.environment = pmremGenerator.fromScene(environment).texture;
    gl.toneMappingExposure = Math.pow(2, -1.5);
    environment.dispose();
  }, [gl, scene]);

  return <></>;
}

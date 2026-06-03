import { Image, useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect } from "react";
import { isMobile } from "react-device-detect";
import * as THREE from "three";
import { usePortalStore } from "@stores";
import { Memory } from "../../models/Memory";
import UiHubProjectsCarousel from "../projects/UiHubProjectsCarousel";
import { TouchPanControls } from "../projects/TouchPanControls";

const UiHubProjects = () => {
  const { camera } = useThree();
  const isActive = usePortalStore((state) => state.activePortalId === "ui-hub");
  const data = useScroll();

  useEffect(() => {
    // Hide scrollbar when active.
    data.el.style.overflow = isActive ? 'hidden' : 'auto';
    if (isActive) {
      if (isMobile) {
        gsap.to(camera.position, { z: 11.5, y: -39, x: -1, duration: 1 });
      } else {
        gsap.to(camera.position, { y: -39, x: -2, duration: 1 });
      }
    }
  }, [isActive]);

  useFrame((state, delta) => {
    if (isActive) {
      if (!isMobile) {
        camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -(state.pointer.x * Math.PI) / 4, 0.03);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, 11.5 - state.pointer.y, 7, delta);
      }
    }
  });

  return (
    <group>
      {isActive ? (
        <>
          <Memory scale={new THREE.Vector3(5, 5, 5)} position={new THREE.Vector3(0, -6, 1)}/>
          <UiHubProjectsCarousel />
        </>
      ) : (
        <Image url="/UI HUB.png" scale={[4, 4]} />
      )}
      { isActive && isMobile && <TouchPanControls /> }
    </group>
  );
};

export default UiHubProjects;

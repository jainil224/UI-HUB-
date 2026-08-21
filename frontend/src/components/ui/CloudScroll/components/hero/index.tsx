'use client';

import { Text } from "@react-three/drei";
import { useProgress } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useIsMobile } from "../../hooks/useIsMobile";
import CloudContainer from "../models/Cloud";
import StarsContainer from "../models/Stars";
import WindowModel from "../models/WindowModel";
import TextWindow from "./TextWindow";

const Hero = () => {
  const titleRef = useRef<THREE.Mesh>(null);
  const { progress } = useProgress();
  const { width } = useThree().viewport;
  const isMobile = useIsMobile();

  useEffect(() => {
    if (titleRef.current) {
      gsap.fromTo(titleRef.current.position, {
        y: -3,
      }, {
        y: 0,
        duration: 1.8,
        ease: "power2.out"
      });
    }
  }, []);

  // Dynamically scale font size based on 3D viewport width to prevent horizontal clipping
  const fontProps = {
    font: "/soria-font.ttf",
    fontSize: Math.min(1.2, width * 0.11),
  };

  return (
    <>
      <Text position={[0, 2, -10]} {...fontProps} ref={titleRef}>Hi, I am Jainil Patel.</Text>
      <StarsContainer />
      <CloudContainer/>
      <group position={[0, -25, 5.69]} scale={isMobile ? [0.6, 0.6, 0.6] : [1, 1, 1]}>
        <pointLight castShadow position={[1, 1, -2.5]} intensity={60} distance={10}/>
        <WindowModel receiveShadow/>
        <TextWindow/>
      </group>
    </>
  );
};

export default Hero;

import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "react-hooks/exhaustive-deps": "off",
      // @react-three/fiber's useFrame requires mutating camera/object3D refs
      // each frame; the immutability rule is incompatible with this pattern.
      "react-hooks/immutability": "off",
    },
  },
];

export default eslintConfig;

import React, { useState } from 'react';

export type CubeLoaderVariantId = 'caustic' | 'monolith';

export const CUBE_LOADER_VARIANT_ORDER: CubeLoaderVariantId[] = ['caustic', 'monolith'];

export const CUBE_LOADER_VARIANT_LABELS: Record<CubeLoaderVariantId, string> = {
  caustic: 'Caustic Cube',
  monolith: 'Monolith Cube',
};

// ── VARIANT: caustic ───────────────────────────────────────────────

export const CausticCube: React.FC = () => {
  return (
    <>
      <style>{`
        .caustic-cube {
          position: relative;
          width: 75px;
          height: 75px;
          transform-style: preserve-3d;
          transform: rotateX(-30deg);
          animation: caustic-cube-spin 4s linear infinite;
        }

        @keyframes caustic-cube-spin {
          0% {
            transform: rotateX(-30deg) rotateY(0);
          }
          100% {
            transform: rotateX(-30deg) rotateY(360deg);
          }
        }

        .caustic-cube__wrapper {
          position: absolute;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }

        .caustic-cube__wrapper .caustic-cube__span {
          position: absolute;
          width: 100%;
          height: 100%;
          transform: rotateY(calc(90deg * var(--i))) translateZ(37.5px);
          background: linear-gradient(
            to bottom,
            hsl(182, 100%, 73%) 0%,
            hsl(177, 100%, 71%) 2%,
            hsl(176.89, 99.07%, 58.04%) 5.5%,
            hsl(177.27, 21.71%, 32.06%) 80%,
            hsl(60, 88%, 75%) 85%,
            hsl(60, 36%, 55%) 100%
          );
        }

        .caustic-cube__top {
          position: absolute;
          width: 75px;
          height: 75px;
          background: hsl(182, 100%, 73%);
          transform: rotateX(90deg) translateZ(37.5px);
          transform-style: preserve-3d;
        }

        .caustic-cube__top rect {
          fill: white;
        }

        .caustic-cube__top::before {
          content: "";
          position: absolute;
          width: 75px;
          height: 75px;
          background: hsl(177, 43%, 39%);
          transform: translateZ(-90px);
          filter: blur(20px);
        }

        .caustic-cube-container {
          filter: drop-shadow(0px 0px 0.03rem rgb(0, 0, 0))
            drop-shadow(0px 0px 0.02rem rgb(0, 0, 0));
        }
      `}</style>
      <div className="caustic-cube-container">
        <div className="caustic-cube">
          <div className="caustic-cube__top">
            <svg style={{ width: 'inherit', height: 'inherit' }}>
              <rect x={0} y={0} width="100%" height="100%" filter="url(#caustic-cube-noise)" />
            </svg>
          </div>
          <div className="caustic-cube__wrapper">
            <span style={{ '--i': 0 } as React.CSSProperties} className="caustic-cube__span" />
            <span style={{ '--i': 1 } as React.CSSProperties} className="caustic-cube__span" />
            <span style={{ '--i': 2 } as React.CSSProperties} className="caustic-cube__span" />
            <span style={{ '--i': 3 } as React.CSSProperties} className="caustic-cube__span" />
          </div>
        </div>
        <svg style={{ display: 'none' }}>
          <defs>
            <filter id="caustic-cube-noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.09"
                numOctaves={1}
                result="turbulence"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="turbulence"
                scale={600}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      </div>
    </>
  );
};

// ── VARIANT: monolith ──────────────────────────────────────────────

export const MonolithCube: React.FC = () => {
  return (
    <>
      <style>{`
        .monolith-cube {
          position: relative;
          width: 75px;
          height: 75px;
          transform-style: preserve-3d;
          transform: rotateX(-30deg);
          animation: monolith-cube-spin 4s linear infinite;
        }

        @keyframes monolith-cube-spin {
          0% {
            transform: rotateX(-30deg) rotateY(0);
          }
          100% {
            transform: rotateX(-30deg) rotateY(360deg);
          }
        }

        .monolith-cube__wrapper {
          position: absolute;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
        }

        .monolith-cube__wrapper .monolith-cube__span {
          position: absolute;
          width: 100%;
          height: 100%;
          transform: rotateY(calc(90deg * var(--i))) translateZ(37.5px);
          background: linear-gradient(
            to bottom,
            hsl(0, 0%, 0%) 0%,
            hsl(0, 0%, 100%) 5.5%,
            hsl(0, 0%, 0%) 12.1%,
            hsl(0, 0%, 100%) 27.9%,
            hsl(0, 0%, 0%) 36.6%,
            hsl(0, 0%, 100%) 45.6%,
            hsl(0, 0%, 0%) 63.4%,
            hsl(0, 0%, 100%) 71.7%,
            hsl(0, 0%, 0%) 79.4%,
            hsl(0, 0%, 0%) 100%
          );
        }

        .monolith-cube__top {
          position: absolute;
          width: 75px;
          height: 75px;
          background: hsl(330, 3.13%, 25.1%);
          transform: rotateX(90deg) translateZ(37.5px);
          transform-style: preserve-3d;
        }

        .monolith-cube__top::before {
          content: '';
          position: absolute;
          width: 75px;
          height: 75px;
          background: hsl(0, 0%, 0%);
          transform: translateZ(-90px);
          filter: blur(10px);
          box-shadow: 0 0 10px #323232,
            0 0 20px hsl(0, 0%, 100%),
            0 0 30px #323232,
            0 0 40px hsl(0, 0%, 100%);
        }
      `}</style>
      <div className="monolith-cube">
        <div className="monolith-cube__top" />
        <div className="monolith-cube__wrapper">
          <span className="monolith-cube__span" style={{ '--i': 0 } as React.CSSProperties} />
          <span className="monolith-cube__span" style={{ '--i': 1 } as React.CSSProperties} />
          <span className="monolith-cube__span" style={{ '--i': 2 } as React.CSSProperties} />
          <span className="monolith-cube__span" style={{ '--i': 3 } as React.CSSProperties} />
        </div>
      </div>
    </>
  );
};

const VARIANT_COMPONENTS: Record<CubeLoaderVariantId, React.FC> = {
  caustic: CausticCube,
  monolith: MonolithCube,
};

export type CubeLoaderProps = {
  variant?: CubeLoaderVariantId;
  onVariantChange?: (variant: CubeLoaderVariantId) => void;
  showToggle?: boolean;
  className?: string;
};

export const CubeLoader: React.FC<CubeLoaderProps> = ({
  variant,
  onVariantChange,
  showToggle = true,
  className = '',
}) => {
  const [internalVariant, setInternalVariant] = useState<CubeLoaderVariantId>('caustic');
  const activeVariant = variant ?? internalVariant;

  const handleSelect = (next: CubeLoaderVariantId) => {
    setInternalVariant(next);
    onVariantChange?.(next);
  };

  const ActiveVariant = VARIANT_COMPONENTS[activeVariant] ?? CausticCube;

  return (
    <div className={`cube-loader ${className}`.trim()}>
      {showToggle && (
        <>
          <style>{`
            .cube-loader-switcher {
              display: inline-flex;
              flex-wrap: wrap;
              justify-content: center;
              gap: 6px;
              padding: 5px;
              border: 2px solid #ffffff;
              border-radius: 999px;
              background: #0a0a0a;
            }

            .cube-loader-switcher__btn {
              appearance: none;
              cursor: pointer;
              font: inherit;
              font-weight: 800;
              font-size: 12px;
              letter-spacing: 0.06em;
              text-transform: uppercase;
              color: #a3a3a3;
              background: transparent;
              border: 0;
              border-radius: 999px;
              padding: 0 16px;
              min-height: 44px;
              transition: color 0.18s ease, background-color 0.18s ease;
            }

            .cube-loader-switcher__btn:hover {
              color: #ffffff;
            }

            .cube-loader-switcher__btn:focus-visible {
              outline: 2px solid #22d3ee;
              outline-offset: 2px;
            }

            .cube-loader-switcher__btn[aria-pressed='true'] {
              background: #ffffff;
              color: #000000;
            }
          `}</style>
          <div className="cube-loader-switcher" role="group" aria-label="Choose cube loader variant">
            {CUBE_LOADER_VARIANT_ORDER.map((id) => (
              <button
                key={id}
                type="button"
                className="cube-loader-switcher__btn"
                aria-pressed={activeVariant === id}
                onClick={() => handleSelect(id)}
              >
                {CUBE_LOADER_VARIANT_LABELS[id]}
              </button>
            ))}
          </div>
        </>
      )}
      <div className="cube-loader__stage">
        <ActiveVariant />
      </div>
    </div>
  );
};

export default CubeLoader;

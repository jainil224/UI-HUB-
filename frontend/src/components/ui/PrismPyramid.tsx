import React from 'react';

export const PrismPyramid: React.FC = () => {
  return (
    <>
      <style>{`
        .prism-pyramid {
          position: relative;
          display: block;
          width: min(300px, 100%);
          aspect-ratio: 1 / 1;
          transform-style: preserve-3d;
          transform: rotateX(-20deg);
        }

        .prism-pyramid__wrapper {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          animation: prism-pyramid-spin 4s linear infinite;
        }

        @keyframes prism-pyramid-spin {
          100% {
            transform: rotateY(360deg);
          }
        }

        .prism-pyramid .prism-pyramid__side {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 70px;
          height: 70px;
          margin: auto;
          transform-origin: center top;
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }

        .prism-pyramid .prism-pyramid__side1 {
          transform: rotateZ(-30deg) rotateY(90deg);
          background: conic-gradient(#2BDEAC, #F028FD, #D8CCE6, #2F2585);
        }

        .prism-pyramid .prism-pyramid__side2 {
          transform: rotateZ(30deg) rotateY(90deg);
          background: conic-gradient(#2F2585, #D8CCE6, #F028FD, #2BDEAC);
        }

        .prism-pyramid .prism-pyramid__side3 {
          transform: rotateX(30deg);
          background: conic-gradient(#2F2585, #D8CCE6, #F028FD, #2BDEAC);
        }

        .prism-pyramid .prism-pyramid__side4 {
          transform: rotateX(-30deg);
          background: conic-gradient(#2BDEAC, #F028FD, #D8CCE6, #2F2585);
        }

        .prism-pyramid__shadow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 60px;
          height: 60px;
          margin: auto;
          background: #8B5AD5;
          transform: rotateX(90deg) translateZ(-40px);
          filter: blur(12px);
        }
      `}</style>
      <div className="prism-pyramid">
        <div className="prism-pyramid__wrapper">
          <span className="prism-pyramid__side prism-pyramid__side1" />
          <span className="prism-pyramid__side prism-pyramid__side2" />
          <span className="prism-pyramid__side prism-pyramid__side3" />
          <span className="prism-pyramid__side prism-pyramid__side4" />
          <span className="prism-pyramid__shadow" />
        </div>
      </div>
    </>
  );
};

export default PrismPyramid;

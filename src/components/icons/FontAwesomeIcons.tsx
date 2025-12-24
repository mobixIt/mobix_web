'use client';

import React, { forwardRef } from 'react';
import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon';
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  faBrain,
  faChartLine,
  faClockRotateLeft,
  faFileLines,
  faLightbulb,
  faPaperPlane,
  faWandSparkles,
} from '@fortawesome/free-solid-svg-icons';

type FAIconProps = Omit<SvgIconProps, 'viewBox'>;

const createFaIcon = (definition: IconDefinition, classNameOverride?: string) =>
  forwardRef<SVGSVGElement, FAIconProps>(({ className, ...props }, ref) => {
    const [width, height, , , svgPathData] = definition.icon;
    const paths = Array.isArray(svgPathData) ? svgPathData : [svgPathData];
    const mergedClassName = ['svg-inline--fa', `fa-${classNameOverride ?? definition.iconName}`, className]
      .filter(Boolean)
      .join(' ');

    return (
      <SvgIcon
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        className={mergedClassName}
        {...props}
      >
        {paths.map((d, index) => (
          <path key={index} d={d} />
        ))}
      </SvgIcon>
    );
  });

export const FaBrainIcon = createFaIcon(faBrain, 'brain');
export const FaLightbulbIcon = createFaIcon(faLightbulb, 'lightbulb');
export const FaSparklesIcon = createFaIcon(faWandSparkles, 'sparkles');
export const FaClockRotateLeftIcon = createFaIcon(faClockRotateLeft, 'clock-rotate-left');
export const FaFileLinesIcon = createFaIcon(faFileLines, 'file-lines');
export const FaChartLineIcon = createFaIcon(faChartLine, 'chart-line');
export const FaPaperPlaneIcon = createFaIcon(faPaperPlane, 'paper-plane');

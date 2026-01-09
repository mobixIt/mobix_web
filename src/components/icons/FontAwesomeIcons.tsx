'use client';

import * as React from 'react';
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
type SvgIconRef = React.ElementRef<typeof SvgIcon>;

const createFaIcon = (definition: IconDefinition, nameOverride?: string) => {
  const Component = React.forwardRef<SvgIconRef, FAIconProps>(
    ({ className, ...props }, ref) => {
      const [width, height, , , svgPathData] = definition.icon;
      const paths = Array.isArray(svgPathData) ? svgPathData : [svgPathData];

      const iconName = nameOverride ?? definition.iconName;
      const mergedClassName = ['svg-inline--fa', `fa-${iconName}`, className]
        .filter(Boolean)
        .join(' ');

      return (
        <SvgIcon
          ref={ref}
          viewBox={`0 0 ${width} ${height}`}
          className={mergedClassName}
          {...props}
        >
          {paths.map((d, i) => (
            <path key={`${iconName}-${i}`} d={d} />
          ))}
        </SvgIcon>
      );
    },
  );

  Component.displayName = `Fa${toPascalCase(nameOverride ?? definition.iconName)}Icon`;

  return Component;
};

function toPascalCase(value: string) {
  return value
    .replace(/(^\w|[-_]\w)/g, (m) => m.replace(/[-_]/, '').toUpperCase())
    .replace(/\W/g, '');
}

export const FaBrainIcon = createFaIcon(faBrain, 'brain');
export const FaLightbulbIcon = createFaIcon(faLightbulb, 'lightbulb');
export const FaSparklesIcon = createFaIcon(faWandSparkles, 'sparkles');
export const FaClockRotateLeftIcon = createFaIcon(faClockRotateLeft, 'clock-rotate-left');
export const FaFileLinesIcon = createFaIcon(faFileLines, 'file-lines');
export const FaChartLineIcon = createFaIcon(faChartLine, 'chart-line');
export const FaPaperPlaneIcon = createFaIcon(faPaperPlane, 'paper-plane');

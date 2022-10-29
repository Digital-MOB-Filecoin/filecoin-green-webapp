import cn from 'classnames';

import { Svg } from 'components/Svg';

import s from './s.module.css';
import { SVGProps } from 'react';

export const Spinner = ({ className, ...rest }: SVGProps<SVGSVGElement>) => (
  <Svg
    className={cn(s.icon, className)}
    aria-label="Loading"
    {...rest}
    id="loading"
  />
);

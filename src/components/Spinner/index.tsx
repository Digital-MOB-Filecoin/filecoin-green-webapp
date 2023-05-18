import cn from 'classnames';
import { ReactElement, SVGProps } from 'react';

import { Svg } from 'components/Svg';

import s from './s.module.css';

export const Spinner = ({ className, ...rest }: SVGProps<SVGSVGElement>): ReactElement => (
  <Svg className={cn(s.icon, className)} aria-label="Loading" {...rest} id="loading" />
);

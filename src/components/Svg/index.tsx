import { ReactElement, SVGProps } from 'react';

type TSvgIds =
  | 'loading'
  | 'search'
  | 'navigation-left'
  | 'navigation-right'
  | 'calendar'
  | 'dropdown-arrow-down'
  | 'close'
  | 'sort-asc'
  | 'sort-desc'
  | 'calendar-arrow-left'
  | 'calendar-arrow-right'
  | 'earth-on-heart'
  | 'rainforest'
  | 'sprout'
  | 'back-arrow'
  | 'info';

export interface TSvg extends SVGProps<SVGSVGElement> {
  id: TSvgIds;
}

export const Svg = ({
  id,
  width = 24,
  height = 24,
  ...rest
}: TSvg): ReactElement<SVGElement> => (
  <svg width={width} height={height} aria-label={id} {...rest}>
    <use xlinkHref={`/sprite.svg#icon__${id}`} />
  </svg>
);

export const Svg = ({ id, width = 24, height = 24, ...rest }) => (
  <svg width={width} height={height} aria-label={id} {...rest}>
    <use xlinkHref={`/sprite.svg#icon__${id}`} />
  </svg>
);

import cn from 'classnames';

import s from './s.module.css';

export const IconButton = ({ className, ...rest }) => {
  return <button type="button" className={cn(s.button, className)} {...rest} />;
};

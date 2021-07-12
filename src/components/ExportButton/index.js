import cn from 'classnames';

import s from './s.module.css';

export const ExportButton = ({ className, data }) => {
  const handlerClick = (e) => {
    e.preventDefault();
    console.log('export', data);
  };

  return (
    <button
      type="button"
      className={cn(s.button, className)}
      onClick={handlerClick}
    >
      Export
    </button>
  );
};

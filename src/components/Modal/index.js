import { useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
// import outy from 'outy';
import cn from 'classnames';

import { Svg } from 'components/Svg';
import s from './s.module.css';

const root = document.getElementById('root');
const rootModal = document.getElementById('root-modal');
// let outsideTap;

export const Modal = ({ open, onClose, children, header, className }) => {
  const innerRef = useRef(null);

  const handlerClose = () => {
    onClose();
  };

  const keyboardHandler = useCallback((event) => {
    if (event.key === 'Escape') {
      handlerClose();
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', keyboardHandler, false);
      // if (innerRef.current) {
      //   outsideTap = outy(innerRef.current, ['click', 'touchend'], onClose);
      // }
      if (root) {
        root.setAttribute('inert', 'true');
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', keyboardHandler, false);
      // if (outsideTap) {
      //   outsideTap.remove();
      // }
      if (root) {
        root.removeAttribute('inert');
        document.body.style.overflow = 'visible';
      }
    };
  }, []);

  if (!open) return null;

  return createPortal(
    <div className={s.wrap}>
      <div className={cn(s.inner, className)} ref={innerRef}>
        <div className={s.header}>
          {header}
          <button
            className={s.closeButton}
            type="button"
            onClick={handlerClose}
          >
            <Svg id="close" size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>,
    rootModal
  );
};

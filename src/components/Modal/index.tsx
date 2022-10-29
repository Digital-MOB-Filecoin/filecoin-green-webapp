import { useRef, useEffect } from 'react';
import ReactDOM, { createPortal } from 'react-dom';
import cn from 'classnames';

import { Svg } from 'components/Svg';
import s from './s.module.css';

const root = document.getElementById('root');
const rootModal = document.getElementById('root-modal');

export const Modal = ({ open, onClose, children, header, className }) => {
  const innerRef = useRef<any>();

  useEffect(() => {
    const clickHandler = (e) => {
      if (!ReactDOM.findDOMNode(innerRef.current)?.contains(e.target)) {
        onClose();
      }
    };

    const keyboardHandler = (e) => {
      if (e.code === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('click', clickHandler, { capture: true });
      document.addEventListener('keyup', keyboardHandler, { capture: true });
      if (root) {
        root.setAttribute('inert', 'true');
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('click', clickHandler);
      document.removeEventListener('keyup', keyboardHandler);
      if (root) {
        root.removeAttribute('inert');
        document.body.style.overflow = 'visible';
      }
    };
  }, [open, onClose]);

  if (!open || !rootModal) return null;

  return createPortal(
    <div className={s.wrap}>
      <div className={cn(s.inner, className)} ref={innerRef}>
        <div className={s.header}>
          {header}
          <button
            className={s.closeButton}
            type="button"
            onClick={() => onClose()}
          >
            <Svg id="close" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    rootModal
  );
};

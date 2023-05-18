import cn from 'classnames';
import { ForwardedRef, ReactElement, forwardRef, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

import { Svg } from 'components/Svg';

import s from './s.module.css';

const root = document.getElementById('root');
const rootModal = document.getElementById('root-modal') || document.body;

interface IModal {
  open: boolean;
  onClose: () => void;
  children: ReactElement;
  header: ReactElement;
  className: string;
}

interface IModalChildren {
  header: IModal['header'];
  children: IModal['children'];
  className: IModal['className'];
  onClose: IModal['onClose'];
}
const ModalChildren = forwardRef(
  ({ header, children, className, onClose }: IModalChildren, ref: ForwardedRef<any>) =>
    ReactDOM.createPortal(
      <div className={s.wrap}>
        <div className={cn(s.inner, className)} ref={ref}>
          <div className={s.header}>
            {header}
            <button className={s.closeButton} type="button" onClick={() => onClose()}>
              <Svg id="close" />
            </button>
          </div>
          {children}
        </div>
      </div>,
      rootModal,
    ),
);
ModalChildren.displayName = 'ModalChildren';

export const Modal = ({
  open,
  onClose,
  children,
  header,
  className,
}: IModal): ReactElement | null => {
  const innerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const clickHandler = (e) => {
      // eslint-disable-next-line react/no-find-dom-node
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
      document.removeEventListener('click', clickHandler, { capture: true });
      document.removeEventListener('keyup', keyboardHandler, { capture: true });
      if (root) {
        root.removeAttribute('inert');
        document.body.style.overflow = 'visible';
      }
    };
  }, [open, onClose]);

  if (!open || !rootModal) return null;

  return (
    <ModalChildren ref={innerRef} header={header} onClose={onClose} className={className}>
      {children}
    </ModalChildren>
  );
};

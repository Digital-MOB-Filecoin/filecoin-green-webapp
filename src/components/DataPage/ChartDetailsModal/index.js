import ReactMarkdown from 'react-markdown';

import { getCategoryName } from 'utils/string';
import { Modal } from 'components/Modal';

import s from './s.module.css';

export const ChartDetailsModal = ({
  open,
  model,
  onClose,
  backButton = null,
}) => {
  if (!open) {
    return null;
  }

  return (
    <Modal
      open={open}
      className={s.modal}
      onClose={onClose}
      header={
        <hgroup>
          {backButton}
          <h2 className={s.title}>{model.name}</h2>
          <h3 className={s.subtitle}>{getCategoryName(model.category)}</h3>
        </hgroup>
      }
    >
      <ReactMarkdown className={s.description} children={model.details} />
    </Modal>
  );
};

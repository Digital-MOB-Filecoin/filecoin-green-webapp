import { ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';

import { TChartModel } from 'api';
import { getCategoryName } from 'utils/string';

import { Modal } from 'components/Modal';

import s from './s.module.css';

type TChartDetailsModal = {
  open?: boolean | null;
  model?: TChartModel | null;
  onClose: () => void;
  backButton?: ReactElement;
};
export const ChartDetailsModal = ({
  open,
  model,
  onClose,
}: TChartDetailsModal): ReactElement | null => {
  if (!open || !model) {
    return null;
  }

  return (
    <Modal
      open={open}
      className={s.modal}
      onClose={() => onClose()}
      header={
        <hgroup>
          <h2 className={s.title}>{model.name}</h2>
          <h3 className={s.subtitle}>{getCategoryName(model.category)}</h3>
        </hgroup>
      }
    >
      <ReactMarkdown className={s.description}>{model.details}</ReactMarkdown>
    </Modal>
  );
};

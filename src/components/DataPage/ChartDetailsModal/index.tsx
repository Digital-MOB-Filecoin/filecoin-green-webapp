import ReactMarkdown from 'react-markdown';

import { getCategoryName } from 'utils/string';
import { Modal } from 'components/Modal';

import s from './s.module.css';
import { TChartModel } from '../index';
import { ReactElement } from 'react';

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
}: TChartDetailsModal) => {
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
      <ReactMarkdown className={s.description} children={model.details} />
    </Modal>
  );
};

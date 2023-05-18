import { nanoid } from 'nanoid';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { TChartModel } from 'api';
import { getCategoryName } from 'utils/string';

import { Modal } from 'components/Modal';
import { Pagination } from 'components/Pagination';
import { Spinner } from 'components/Spinner';
import { Svg } from 'components/Svg';

import s from './s.module.css';

const MODELS_PER_PAGE = 6;

type TChartsModal = {
  open: boolean;
  models: TChartModel[];
  selected: TChartModel[];
  onClose: (models?: TChartModel[]) => void;
  loading: boolean;
  failed: boolean;
};
export const ChartsModal = ({
  open,
  models,
  selected,
  onClose,
  loading,
  failed,
}: TChartsModal): ReactElement | null => {
  const [modelDetails, setModelDetails] = useState<TChartModel | null>(null);
  const [localSelected, setLocalSelected] = useState<TChartModel[]>(selected);
  const [page, setPage] = useState<number>(1);

  const handlerClose = useCallback(
    (arr?: TChartModel[]) => {
      onClose(arr);
      setModelDetails(null);
    },
    [onClose],
  );

  useEffect(() => {
    setLocalSelected(selected);
  }, [open, selected]);

  const handlerSelect = useCallback((model: TChartModel) => {
    setLocalSelected((prevState) => {
      if (prevState.some(({ id }) => id === model.id)) {
        return prevState.filter(({ id }) => id !== model.id);
      }

      return [...prevState, model];
    });
  }, []);

  if (!open) {
    return null;
  }

  const handlerSelectAll = () => {
    if (models.length === localSelected.length) {
      setLocalSelected([]);
    } else {
      setLocalSelected(models);
    }
  };

  return (
    <Modal
      open={open}
      className={s.modal}
      onClose={handlerClose}
      header={
        modelDetails ? (
          <hgroup>
            {
              <button type="button" className={s.backButton} onClick={() => setModelDetails(null)}>
                <Svg id="back-arrow" />
                <span>Select charts</span>
              </button>
            }
            <h2 className={s.title}>{modelDetails.name}</h2>
            <h3 className={s.subtitle}>{getCategoryName(modelDetails.category)}</h3>
          </hgroup>
        ) : (
          <hgroup>
            <h2 className={s.title}>Select charts</h2>
            <h3 className={s.subtitle}>
              Choose the charts you want to see
              <button type="button" className={s.selectAllBtn} onClick={handlerSelectAll}>
                Select all
              </button>
            </h3>
          </hgroup>
        )
      }
    >
      {modelDetails ? (
        <ReactMarkdown className={s.description}>{modelDetails.details}</ReactMarkdown>
      ) : (
        <>
          <div className={s.grid}>
            {failed ? 'Failed to Load Data.' : null}
            {loading ? (
              <div
                style={{
                  gridColumnStart: 1,
                  gridColumnEnd: 3,
                  textAlign: 'center',
                }}
              >
                <Spinner />
              </div>
            ) : (
              models.slice((page - 1) * MODELS_PER_PAGE, page * MODELS_PER_PAGE).map((item) => {
                const id = nanoid();

                return (
                  <div className={s.itemWrap} key={id}>
                    <input
                      id={id}
                      type="checkbox"
                      name={id}
                      className={s.itemInput}
                      checked={localSelected.some((model) => model.id === item.id)}
                      onChange={() => handlerSelect(item)}
                    />
                    <div className={s.itemInner}>
                      <label htmlFor={id} className={s.itemLabel} tabIndex={0} />
                      <div className={s.itemTitles}>
                        <label className={s.itemTitle} htmlFor={id}>
                          {item.name}
                        </label>
                        <div className={s.itemSubtitle}>
                          <span>{getCategoryName(item.category)}</span>
                          <span className={s.itemSubtitleSeparator} />
                          <button
                            type="button"
                            className={s.itemDetailsButton}
                            onClick={() => {
                              setModelDetails(() => item);
                            }}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className={s.footer}>
            <Pagination
              skip={(page - 1) * MODELS_PER_PAGE}
              take={MODELS_PER_PAGE}
              total={models.length}
              onChangePage={setPage}
            />
            <button
              className="button-primary"
              type="button"
              onClick={() => handlerClose(localSelected)}
            >
              View selected charts
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

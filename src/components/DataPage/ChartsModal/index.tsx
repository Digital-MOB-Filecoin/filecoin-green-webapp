import { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import ReactMarkdown from 'react-markdown';

import { getCategoryName } from 'utils/string';
import { Modal } from 'components/Modal';
import { Pagination } from 'components/Pagination';
import { Svg } from 'components/Svg';
import { Spinner } from 'components/Spinner';

import s from './s.module.css';
import { TChartModel } from '../index';

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
}: TChartsModal) => {
  const [modelDetails, setModelDetails] = useState<TChartModel | null>(null);
  const [localSelected, setLocalSelected] = useState<TChartModel[]>(selected);

  const handlerClose = useCallback(
    (arr?: TChartModel[]) => {
      onClose(arr);
      setModelDetails(null);
    },
    [onClose]
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

  const handlerChangePage = () => {
    console.log('change page');
  };

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
              <button
                type="button"
                className={s.backButton}
                onClick={() => setModelDetails(null)}
              >
                <Svg id="back-arrow" />
                <span>Select charts</span>
              </button>
            }
            <h2 className={s.title}>{modelDetails.name}</h2>
            <h3 className={s.subtitle}>
              {getCategoryName(modelDetails.category)}
            </h3>
          </hgroup>
        ) : (
          <hgroup>
            <h2 className={s.title}>Select charts</h2>
            <h3 className={s.subtitle}>
              Choose the charts you want to see
              <button
                type="button"
                className={s.selectAllBtn}
                onClick={handlerSelectAll}
              >
                Select all
              </button>
            </h3>
          </hgroup>
        )
      }
    >
      {modelDetails ? (
        <ReactMarkdown
          className={s.description}
          children={modelDetails.details}
        />
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
              models.map((item) => {
                const id = nanoid();

                return (
                  <div className={s.itemWrap} key={id}>
                    <input
                      id={id}
                      type="checkbox"
                      name={id}
                      className={s.itemInput}
                      checked={localSelected.some(
                        (model) => model.id === item.id
                      )}
                      onChange={() => handlerSelect(item)}
                    />
                    <div className={s.itemInner}>
                      <label
                        htmlFor={id}
                        className={s.itemLabel}
                        tabIndex={0}
                      />
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
              skip={0}
              take={10}
              total={10}
              onChangePage={handlerChangePage}
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

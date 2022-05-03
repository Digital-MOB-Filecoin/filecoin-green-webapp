import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';

import { getCategoryName } from 'utils/string';
import { Modal } from 'components/Modal';
import { Pagination } from 'components/Pagination';
import { Svg } from 'components/Svg';
import { Spinner } from 'components/Spinner';
import { ChartDetailsModal } from 'components/DataPage/ChartDetailsModal';

import s from './s.module.css';

export const ChartsModal = ({ open, models, selected, onClose }) => {
  const [shownDetails, setShownDetails] = useState(null);
  const [localSelected, setLocalSelected] = useState(selected);

  useEffect(() => {
    setLocalSelected(selected);
  }, [open]);

  if (!open) {
    return null;
  }

  const handlerApply = () => {
    onClose(localSelected);
  };

  const handlerSelect = (model) => {
    setLocalSelected((prevState) => {
      if (prevState.some(({ id }) => id === model.id)) {
        return prevState.filter(({ id }) => id !== model.id);
      }

      return [...prevState, model];
    });
  };

  const handlerChangePage = () => {
    console.log('change page');
  };

  const handlerSelectAll = () => {
    if (models.results.length === localSelected.length) {
      setLocalSelected([]);
    } else {
      setLocalSelected(models.results);
    }
  };

  return (
    <>
      <Modal
        open={open && !shownDetails}
        className={s.modal}
        onClose={() => onClose()}
        header={
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
        }
      >
        <div className={s.grid}>
          {models.loading ? (
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
            models.results.map((item) => {
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
                          onClick={() => setShownDetails(item)}
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
            pageHandler={handlerChangePage}
          />
          <button
            className="button-primary"
            type="button"
            onClick={handlerApply}
          >
            View selected charts
          </button>
        </div>
      </Modal>

      <ChartDetailsModal
        model={shownDetails}
        open={shownDetails}
        onClose={() => setShownDetails(null)}
        backButton={
          <button
            type="button"
            className={s.backButton}
            onClick={() => setShownDetails(null)}
          >
            <Svg id="back-arrow" />
            <span>Select charts</span>
          </button>
        }
      />
    </>
  );
};

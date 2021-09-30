import { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { Modal } from 'components/Modal';
import { Pagination } from 'components/Pagination';
import { Svg } from 'components/Svg';
import { Spinner } from 'components/Spinner';

import { LOCALSTORAGE_SELECTED_CHARTS } from 'constant';

import s from './s.module.css';

export const SelectChartsModal = ({ open, data, onClose }) => {
  const [shownDetails, setShownDetails] = useState(null);
  const [selectedCharts, setSelectedCharts] = useState([]);

  useEffect(() => {
    if (!open) return;

    const userCharts = localStorage.getItem(LOCALSTORAGE_SELECTED_CHARTS);

    if (userCharts) {
      setSelectedCharts(JSON.parse(userCharts));
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handlerApply = () => {
    localStorage.setItem(
      LOCALSTORAGE_SELECTED_CHARTS,
      JSON.stringify(selectedCharts)
    );
    onClose();
  };

  const handlerSelect = (id) => {
    setSelectedCharts((prevState) =>
      prevState.some((itemId) => itemId === id)
        ? prevState.filter((itemId) => itemId !== id)
        : [...prevState, id]
    );
  };

  const handlerChangePage = () => {
    console.log('change page');
  };

  return (
    <>
      <Modal
        open={open & !shownDetails}
        className={s.modal}
        onClose={() => onClose()}
        header={
          <hgroup>
            <h2 className={s.title}>Select charts</h2>
            <h3 className={s.subtitle}>Choose the charts you want to see</h3>
          </hgroup>
        }
      >
        <div className={s.grid}>
          {data.loading ? (
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
            data.results.map((item) => {
              const id = nanoid();

              return (
                <div className={s.itemWrap} key={id}>
                  <input
                    id={id}
                    type="checkbox"
                    name={id}
                    className={s.itemInput}
                    checked={selectedCharts.some(
                      (itemId) => itemId === item.id
                    )}
                    onChange={() => handlerSelect(item.id)}
                  />
                  <div className={s.itemInner}>
                    <label htmlFor={id} className={s.itemLabel} tabIndex={0} />
                    <div className={s.itemTitles}>
                      <label className={s.itemTitle} htmlFor={id}>
                        {item.name}
                      </label>
                      <div className={s.itemSubtitle}>
                        <span>{item.category}</span>
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

      {shownDetails ? (
        <Modal
          open={shownDetails}
          className={s.modal}
          onClose={() => setShownDetails(null)}
          header={
            <hgroup>
              <button
                type="button"
                className={s.backButton}
                onClick={() => setShownDetails(null)}
              >
                <Svg id="back-arrow" />
                <span>Select charts</span>
              </button>
              <h2 className={s.title}>{shownDetails.name}</h2>
              <h3 className={s.subtitle}>{shownDetails.category}</h3>
            </hgroup>
          }
        >
          <div className={s.description}>{shownDetails.name}</div>
        </Modal>
      ) : (
        shownDetails
      )}
    </>
  );
};

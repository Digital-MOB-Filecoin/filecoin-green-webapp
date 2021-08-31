import { useState } from 'react';

import { Modal } from 'components/Modal';
import { Pagination } from 'components/Pagination';
import { Svg } from 'components/Svg';

import s from './s.module.css';

const options = Array(10)
  .fill(undefined)
  .map((_, idx) => ({
    key: `key${idx}`,
    title: 'Used Capacity (V1.0)',
    subtitle: 'Capacity Committed and Used',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed hendrerit ligula sed purus ullamcorper condimentum. Ut tempor a libero vulputate laoreet. Fusce pretium eros mollis velit fringilla, sit amet mollis erat cursus. Praesent suscipit porta quam eget sollicitudin. Morbi accumsan, sem vitae aliquet sagittis, sapien leo iaculis libero, ut interdum orci urna sit amet diam. Phasellus lacinia tincidunt mauris in rhoncus. Fusce vestibulum magna a risus volutpat, sed aliquet odio interdum. Ut dignissim diam arcu, in congue dolor facilisis non. Vivamus hendrerit ante et convallis interdum. Integer ligula erat, lacinia non pharetra id, malesuada sed risus. Quisque quis hendrerit ligula. Suspendisse potenti. Fusce at condimentum nisi.',
  }));

export const SelectCharts = () => {
  const [open, setOpen] = useState(false);
  const [shownDetails, setShownDetails] = useState(null);

  const handlerApply = () => {
    console.log('save changes');
  };

  const handlerChangePage = () => {
    console.log('change page');
  };

  return (
    <>
      <button
        type="button"
        className={s.chooseChartsButton}
        onClick={() => setOpen(true)}
      >
        <span className={s.chooseChartsButtonCounter}>3</span>
        Charts displayed
      </button>

      <Modal
        open={open & !shownDetails}
        className={s.modal}
        onClose={() => setOpen(false)}
        header={
          <hgroup>
            <h2 className={s.title}>Select charts</h2>
            <h3 className={s.subtitle}>Choose the charts you want to see</h3>
          </hgroup>
        }
      >
        <div className={s.grid}>
          {options.map((item) => (
            <div className={s.itemWrap} key={item.key}>
              <input
                id={item.key}
                type="checkbox"
                name={item.key}
                className={s.itemInput}
                onChange={console.log}
              />
              <div className={s.itemInner}>
                <label
                  htmlFor={item.key}
                  className={s.itemLabel}
                  tabIndex={0}
                />
                <div className={s.itemTitles}>
                  <label className={s.itemTitle} htmlFor={item.key}>
                    {item.title}
                  </label>
                  <div className={s.itemSubtitle}>
                    <span>{item.subtitle}</span>
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
          ))}
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
              <h2 className={s.title}>{shownDetails.title}</h2>
              <h3 className={s.subtitle}>{shownDetails.subtitle}</h3>
            </hgroup>
          }
        >
          <div className={s.description}>{shownDetails.description}</div>
        </Modal>
      ) : (
        shownDetails
      )}
    </>
  );
};

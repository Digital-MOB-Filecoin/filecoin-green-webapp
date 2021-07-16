import { useMemo } from 'react';
import { nanoid } from 'nanoid';
import cn from 'classnames';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import BN from 'bignumber.js';

import format from 'date-fns/format';
import isValid from 'date-fns/isValid';

import { Spinner } from 'components/Spinner';
import { TimeIntervalButtons } from 'components/TimeIntervalButtons';
import { ExportButton } from 'components/ExportButton';
import { convertBytesToIEC } from 'utils/bytes';
import { convertEpochToTimestamp } from 'utils/dates';

import s from './s.module.css';

const getFormattedValue = (type, value) => {
  let temp;
  switch (type) {
    case 'date':
      temp = new Date(value);
      return isValid(temp) ? format(temp, 'MMMM uuuu') : value;
    case 'epoch':
      temp = new Date(convertEpochToTimestamp(value));
      return isValid(temp) ? format(temp, 'MMM d, yyyy hh:mm aa') : value;
    case 'bytes':
      return convertBytesToIEC(value);
    case 'bytes/block':
      return `${convertBytesToIEC(value)}/block`;
    case 'percent':
      return `${new BN(value).multipliedBy(100)}%`;
    default:
      return value;
  }
};

const renderLegend = ({ payload }) => {
  if (!payload) return null;
  return (
    <div className={s.legend}>
      {payload.map((entry, idx) => (
        <span
          key={idx}
          className={s.legendItem}
          style={{ '--color': entry.color }}
        >
          {entry.value}
        </span>
      ))}
    </div>
  );
};

const renderTooltip = ({ payload, data }) => {
  if (!payload) return null;

  return (
    <div className={s.tooltip}>
      {payload.map((item, idx) => {
        const { type } = data.find((el) => el.key === item.dataKey);
        return (
          <div className={s.tooltipItem} key={idx}>
            <span
              className={s.tooltipItemName}
              style={{ '--color': item.color }}
            >
              {item.name}
            </span>
            <span className={s.tooltipItemValue}>
              {getFormattedValue(type, item.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const Chart = ({
  data: {
    data: { results, loading, failed },
    meta,
    XData,
    YData,
  },
  exportData,
  title,
}) => {
  const gradient1Id = useMemo(nanoid, []);
  const gradient2Id = useMemo(nanoid, []);

  const colors = useMemo(
    () => [
      {
        stroke: 'var(--theme-color-primary)',
        fill: 'var(--theme-background-secondary)',
        gradient: `url(#${gradient1Id})`,
      },
      {
        stroke: 'var(--theme-color-secondary)',
        fill: 'var(--theme-background-secondary)',
        gradient: `url(#${gradient2Id})`,
      },
    ],
    []
  );

  return (
    <div className={s.wrap}>
      <div className={cn(s.header, { [s.withMeta]: meta })}>
        <h2 className={cn('h2', s.title)}>{title}</h2>
        <TimeIntervalButtons />
        <ExportButton className={s.exportButton} data={exportData} />
      </div>
      {meta ? (
        <div className={s.meta}>
          {meta.map((item, idx) => {
            const { value, unit } = convertBytesToIEC(item.value, {
              output: 'object',
            });

            return (
              <div className={s.metaItem} key={idx}>
                <div className={s.metaTitle}>{item.title}</div>
                <div className={s.metaValue}>
                  <span>{value}</span>
                  <span className={s.metaUnit}>{unit}</span>
                  {item.percent ? (
                    <span className={s.metaPercent}>{item.percent}%</span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" aspect={2.5}>
          <AreaChart data={results}>
            <defs>
              <linearGradient id={gradient1Id} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0"
                  stopColor="var(--theme-color-primary)"
                  stopOpacity={0.12}
                />
                <stop
                  offset="100%"
                  stopColor="var(--theme-color-primary)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id={gradient2Id} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--theme-color-secondary)"
                  stopOpacity={0.12}
                />
                <stop
                  offset="100%"
                  stopColor="var(--theme-color-secondary)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            {XData.map((item) => (
              <XAxis
                key={nanoid()}
                dataKey={item.key}
                tickLine={false}
                stroke="var(--color-nepal)"
                tickFormatter={(value) => getFormattedValue(item.type, value)}
                y={1}
              />
            ))}
            {YData.map((item) => (
              <YAxis
                key={nanoid()}
                dataKey={item.key}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => getFormattedValue(item.type, value)}
                stroke="var(--color-nepal)"
              />
            ))}
            {YData.map((item, idx) => {
              return (
                <Area
                  key={nanoid()}
                  dataKey={item.key}
                  name={item.title}
                  stroke={colors[idx].stroke}
                  strokeWidth={2}
                  isAnimationActive={false}
                  activeDot={{
                    stroke: colors[idx].stroke,
                    fill: colors[idx].fill,
                    strokeWidth: 2,
                    r: 5,
                  }}
                  fillOpacity={1}
                  fill={colors[idx].gradient}
                />
              );
            })}
            <CartesianGrid
              strokeDasharray="5 7"
              vertical={false}
              stroke="var(--color-solitude-dark)"
            />
            <Tooltip
              cursor={{
                stroke: 'var(--color-nepal)',
                strokeWidth: 2,
                strokeDasharray: '5 7',
              }}
              isAnimationActive={false}
              content={renderTooltip}
              offset={0}
              allowEscapeViewBox={{ x: true, y: true }}
              position={{ y: -100 }}
              data={YData}
            />
            <Legend content={renderLegend} />
          </AreaChart>
        </ResponsiveContainer>
        {loading ? (
          <div className={s.loader}>
            <Spinner className={s.spinner} width={40} height={40} />
          </div>
        ) : null}
        {failed ? (
          <div className={s.loader}>
            <p className={s.failed}>Failed to Load Data.</p>
          </div>
        ) : null}
        {!loading && !failed && !results.length ? (
          <div className={s.loader}>
            <p className={s.failed}>No data for selected date range.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

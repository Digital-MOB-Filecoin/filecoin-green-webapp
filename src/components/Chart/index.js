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

import format from 'date-fns/format';

import { TimeIntervalButtons } from 'components/TimeIntervalButtons';
import { ExportButton } from 'components/ExportButton';
import { convertBytesToIEC } from 'utils/bytes';

import s from './s.module.css';

const getFormattedValue = (type, value) => {
  switch (type) {
    case 'date':
      return format(new Date(value), 'MMMM uuuu');
    case 'bytes':
      return convertBytesToIEC(value);
    default:
      return value;
  }
};

const renderLegend = ({ payload }) => {
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

export const Chart = ({ data: { data, meta, XData, YData }, title }) => {
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
        <ExportButton className={s.exportButton} />
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
      <ResponsiveContainer width="100%" aspect={2.5}>
        <AreaChart data={data} margin={{ top: 10 }}>
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
    </div>
  );
};

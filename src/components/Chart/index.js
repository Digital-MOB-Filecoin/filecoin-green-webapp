import { useMemo } from 'react';
import { nanoid } from 'nanoid';
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

import { TimeIntervalButtons } from './TimeIntervalButtons';

import s from './s.module.css';

const renderLegend = (props) => {
  const { payload } = props;

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

const renderTooltip = (props) => {
  const { payload } = props;

  return (
    <div className={s.tooltip}>
      {payload.map((item, idx) => (
        <div className={s.tooltipItem} key={idx}>
          <span className={s.tooltipItemName} style={{ '--color': item.color }}>
            {item.name}
          </span>
          <span className={s.tooltipItemValue}>{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export const Chart = ({ data, title }) => {
  const gradient1Id = useMemo(nanoid, []);
  const gradient2Id = useMemo(nanoid, []);

  return (
    <div className={s.wrap}>
      <div className={s.header}>
        <h2 className={s.title}>{title}</h2>
        <TimeIntervalButtons />
      </div>
      <ResponsiveContainer width="100%" aspect={2.5}>
        <AreaChart
          width={730}
          height={250}
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
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
          <XAxis
            dataKey="name"
            tickLine={false}
            stroke="var(--color-nepal)"
            y={1}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            stroke="var(--color-nepal)"
          />
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
            // wrapperStyle={{ width: 0, height: 0 }}
          />
          <Legend content={renderLegend} />
          <Area
            dataKey="uv"
            name="Used Capacity"
            stroke="var(--theme-color-primary)"
            strokeWidth={2}
            activeDot={{
              stroke: 'var(--theme-color-primary)',
              fill: 'white',
              strokeWidth: 2,
              r: 5,
            }}
            fillOpacity={1}
            fill={`url(#${gradient1Id})`}
          />
          <Area
            dataKey="pv"
            name="Commited Capacity"
            stroke="var(--theme-color-secondary)"
            strokeWidth={2}
            activeDot={{
              stroke: 'var(--theme-color-secondary)',
              fill: 'white',
              strokeWidth: 2,
              r: 5,
            }}
            fillOpacity={1}
            fill={`url(#${gradient2Id})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

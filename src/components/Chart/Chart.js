import { useMemo } from 'react';
import { nanoid } from 'nanoid';
import cn from 'classnames';
import { Link } from 'react-router-dom';
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
import isValid from 'date-fns/isValid';

import { Spinner } from 'components/Spinner';
import { formatBytes } from 'utils/bytes';
import { formatWatts } from 'utils/numbers';
import { convertNumberToPercent } from 'utils/numbers';
import { camelCase, getCategoryName } from 'utils/string';

import { TimeIntervalButtons } from './TimeIntervalButtons';
import { ExportButton } from './ExportButton';
import s from './s.module.css';

const getFormattedValue = (type, value, precision = 2) => {
  const isMobileVersion = window.innerWidth <= 768;

  let temp;
  switch (type) {
    case 'day':
      temp = new Date(value);
      return isValid(temp) ? format(temp, 'MMM d, yyyy') : value;
    case 'week':
      temp = new Date(value);
      return isValid(temp) ? format(temp, 'MMM, yyyy') : value;
    case 'month':
      temp = new Date(value);
      return isValid(temp) ? format(temp, 'MMM, yyyy') : value;
    case 'time':
      temp = new Date(value);
      return isValid(temp)
        ? format(temp, isMobileVersion ? 'MMM uuuu' : 'MMMM uuuu')
        : value;
    case 'GiB':
      return formatBytes(value, { inputUnit: 'GiB', precision });
    case 'percentage':
      return convertNumberToPercent(value);
    case 'kWh':
      return formatWatts(value, { precision }) + '/h';
    case 'kW':
      return formatWatts(value, { precision });
    default:
      return value;
  }
};

const renderLegend = (payload, showMethodologyLink) => {
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
      {showMethodologyLink ? (
        <Link to="/methodology" className={s.legendLink}>
          View methodology
        </Link>
      ) : null}
    </div>
  );
};

const StyledTooltip = (props) => {
  const { payload, filter, type: dataFormatType } = props;
  if (!payload) return null;

  const date =
    filter === 'day'
      ? getFormattedValue('day', payload[0]?.payload.start_date)
      : `${getFormattedValue(
          'day',
          payload[0]?.payload.start_date
        )} – ${getFormattedValue('day', payload[0]?.payload.end_date)}`;

  return (
    <div className={s.tooltip}>
      <div className={s.tooltipDate}>{date}</div>
      {payload.map((item, idx) => {
        return (
          <div className={s.tooltipItem} key={idx}>
            <span
              className={s.tooltipItemName}
              style={{ '--color': item.color }}
            >
              {item.name}
            </span>
            <span className={s.tooltipItemValue}>
              {getFormattedValue(dataFormatType, item.value, 3)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const ChartComponent = ({
  id,
  name,
  x,
  y,
  filter,
  data,
  meta,
  showMethodologyLink,
  loading,
  failed,
  interval,
  category,
  showCategory,
}) => {
  const colors = useMemo(
    () => ({
      green: {
        id: nanoid(),
        stroke: 'var(--theme-color-primary)',
        fill: 'var(--theme-background-secondary)',
      },
      orange: {
        id: nanoid(),
        stroke: 'var(--theme-color-secondary)',
        fill: 'var(--theme-background-secondary)',
      },
      silver: {
        id: nanoid(),
        stroke: 'var(--color-nepal)',
        fill: 'var(--theme-background-secondary)',
      },
    }),
    []
  );

  return (
    <div className={s.wrap}>
      <div className={cn(s.header /* , { [s.withMeta]: meta } */)}>
        <h2 className={cn('h2', s.title)}>
          {name}
          {showCategory ? (
            <div className={s.subtitle}>{getCategoryName(category)}</div>
          ) : null}
        </h2>
        <TimeIntervalButtons chartId={id} />
        <ExportButton
          interval={interval}
          id={id}
          filename={camelCase(name)}
          className={s.exportButton}
        />
      </div>
      {/* {meta ? (
        <div className={s.meta}>
          {meta.map((item, idx) => {
            const { value, unit } = formatBytes(item.value, {
              output: 'object',
              inputUnit: 'GiB',
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
      ) : null} */}
      <div className={s.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              {Object.values(colors).map((color) => (
                <linearGradient
                  key={color.id}
                  id={color.id}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0"
                    stopColor={color.stroke}
                    stopOpacity={0.12}
                  />
                  <stop
                    offset="100%"
                    stopColor={color.stroke}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <XAxis
              dataKey="start_date"
              tickLine={false}
              stroke="var(--color-nepal)"
              tickFormatter={(value) => getFormattedValue(x, value)}
              y={1}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              domain={['minData', 'maxData']}
              tickFormatter={(value) => getFormattedValue(y, value, 3)}
              stroke="var(--color-nepal)"
            />
            {meta?.map((item, idx) => {
              const color = colors[item.color] || colors.green;

              return (
                <Area
                  key={`area-${idx}`}
                  dataKey={`value${idx}`}
                  name={item.title}
                  stroke={color.stroke}
                  strokeWidth={2}
                  isAnimationActive={false}
                  activeDot={{
                    stroke: color.stroke,
                    fill: color.fill,
                    strokeWidth: 2,
                    r: 5,
                  }}
                  fillOpacity={1}
                  fill={`url(#${color.id})`}
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
              animationDuration={0}
              content={<StyledTooltip filter={filter} type={y} />}
              offset={0}
              allowEscapeViewBox={{ x: false, y: true }}
              position={{ y: -100 }}
            />
            <Legend
              content={({ payload }) =>
                renderLegend(payload, showMethodologyLink)
              }
            />
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
        {!loading && !failed && !data.length ? (
          <div className={s.loader}>
            <p className={s.failed}>No data for selected date range.</p>
          </div>
        ) : null}
      </div>
      <ExportButton
        interval={interval}
        id={id}
        filename={camelCase(name)}
        className={s.mobileExportButton}
      />
    </div>
  );
};

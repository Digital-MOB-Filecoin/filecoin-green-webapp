import { useMemo, useState } from 'react';
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

import { formatBytes } from 'utils/bytes';
import { formatNumber, formatWatts } from 'utils/numbers';
import { convertNumberToPercent } from 'utils/numbers';
import { camelCase, getCategoryName } from 'utils/string';

import { Spinner } from 'components/Spinner';
import { Svg } from 'components/Svg';
import { ChartDetailsModal } from 'components/DataPage/ChartDetailsModal';
import { TimeIntervalButtons } from './TimeIntervalButtons';
import { ExportButton } from './ExportButton';
import s from './s.module.css';

const getFormattedValue = ({ type, value, precision = 2, filter }) => {
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
      if (filter === 'month') {
        return isValid(temp) ? format(temp, 'MMMM, yyyy') : value;
      }
      return isValid(temp) ? format(temp, 'MMM d, yyyy') : value;
    case 'GiB':
      return formatBytes(value, { inputUnit: 'GiB', precision });
    case 'percentage':
      return convertNumberToPercent(value);
    case 'kWh':
      return formatWatts(value, { precision }) + 'h';
    case 'kW':
      return formatWatts(value, { precision });
    case 'MW_per_EiB':
      return formatNumber(value, 3) + ' MW/EiB';
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

  const formattedStartDate = getFormattedValue({
    type: 'day',
    value: payload[0]?.payload.start_date,
  });
  const formattedEndDate = getFormattedValue({
    type: 'day',
    value: payload[0]?.payload.end_date,
  });

  const date =
    filter === 'day'
      ? formattedStartDate
      : `${formattedStartDate} – ${formattedEndDate}`;

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
              {getFormattedValue({
                type: dataFormatType,
                value: item.value,
                precision: 3,
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const ChartComponent = ({
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
  showCategory,
  model,
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
    <>
      <div className={s.wrap}>
        <div className={cn(s.header /* , { [s.withMeta]: meta } */)}>
          <hgroup className={s.hgroup}>
            {!loading ? (
              <>
                <h2 className={cn('h2', s.title)}>
                  <span>{name}</span>
                  <button
                    type="button"
                    onClick={() => setShowDetailsModal(true)}
                    className={s.detailsButton}
                  >
                    <Svg id="info" />
                  </button>
                </h2>
                {showCategory ? (
                  <h3 className={s.subtitle}>
                    {getCategoryName(model.category)}
                  </h3>
                ) : null}
              </>
            ) : null}
          </hgroup>
          <TimeIntervalButtons chartId={Number(model.id)} />
          <ExportButton
            interval={interval}
            id={Number(model.id)}
            filename={camelCase(name)}
            className={s.exportButton}
            filter={filter}
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
        <div style={{ position: 'relative' }}>
          <ResponsiveContainer width="100%" aspect={2.5}>
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
              <CartesianGrid
                strokeDasharray="5 7"
                vertical={false}
                stroke="var(--color-solitude-dark)"
              />
              <XAxis
                dataKey="start_date"
                tickLine={false}
                stroke="var(--color-nepal)"
                tickFormatter={(value) =>
                  getFormattedValue({ type: x, value, filter })
                }
                interval="preserveEnd"
                y={1}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[0, 'auto']}
                tickFormatter={(value) =>
                  getFormattedValue({ type: y, value, precision: 3 })
                }
                stroke="var(--color-nepal)"
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
      </div>

      <ChartDetailsModal
        model={model}
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </>
  );
};

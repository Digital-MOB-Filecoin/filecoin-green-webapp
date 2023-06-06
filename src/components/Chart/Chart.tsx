import cn from 'classnames';
import { Interval, format, isValid } from 'date-fns';
import { nanoid } from 'nanoid';
import { CSSProperties, ReactElement, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Payload } from 'recharts/types/component/DefaultLegendContent';

import { TChartFiler } from 'api';
import { TChartModel } from 'api';
import { formatBytes } from 'utils/bytes';
import { formatCO2, formatNumber, formatWatts } from 'utils/numbers';
import { convertNumberToPercent } from 'utils/numbers';
import { camelCase, getCategoryName } from 'utils/string';

import { ChartDetailsModal } from 'components/DataPage/ChartDetailsModal';
import { Spinner } from 'components/Spinner';
import { Svg } from 'components/Svg';

import { ExportButton } from './ExportButton';
import { TimeIntervalButtons } from './TimeIntervalButtons';
import { TNormalizedChartData } from './index';
import s from './s.module.css';

type TGetFormattedValue = {
  type: string;
  value: string;
  precision?: number;
  filter?: string;
};
const getFormattedValue = ({ type, value, precision = 2, filter }: TGetFormattedValue): any => {
  let temp;
  switch (type) {
    case 'day':
      if (!value) return null;
      temp = new Date(value);
      return isValid(temp) ? format(temp, 'MMM d, yyyy') : value;
    case 'week':
      if (!value) return null;
      temp = new Date(value);
      return isValid(temp) ? format(temp, 'MMM, yyyy') : value;
    case 'month':
      if (!value) return null;
      temp = new Date(value);
      return isValid(temp) ? format(temp, 'MMM, yyyy') : value;
    case 'time':
      if (!value) return null;
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
    case 'co2':
      return formatCO2(value, { precision: 2 });
    default:
      return value;
  }
};

const renderLegend = (payload: Payload[] | undefined, showMethodologyLink?: boolean) => {
  if (!payload) return null;

  let sortedPayload = payload;

  const compareStr = (str1, str2) => str1.toLowerCase().includes(str2);
  if (
    payload.some(({ value }) => compareStr(value, 'lower')) &&
    payload.some(({ value }) => compareStr(value, 'upper'))
  ) {
    sortedPayload = payload.reduce((acc, item) => {
      if (compareStr(item.value, 'lower')) {
        acc[2] = item;
      }
      if (compareStr(item.value, 'upper')) {
        acc[0] = item;
      }
      acc[1] = item;
      return acc;
    }, [] as Payload[]);
  }

  return (
    <div className={s.legend}>
      {sortedPayload.map((entry, idx) => {
        return (
          <span
            key={idx}
            className={s.legendItem}
            style={{ '--color': entry.color } as CSSProperties}
          >
            {entry.value}
          </span>
        );
      })}

      {showMethodologyLink ? (
        <Link to="/methodology" className={s.legendLink}>
          View methodology
        </Link>
      ) : null}
    </div>
  );
};

const StyledTooltip = (props: any) => {
  const { payload, filter, type: dataFormatType } = props;
  if (!payload) return null;

  let sortedPayload = payload;

  const formattedStartDate =
    getFormattedValue({
      type: 'day',
      value: payload[0]?.payload.start_date,
    }) || ' N/A';
  const formattedEndDate =
    getFormattedValue({
      type: 'day',
      value: payload[0]?.payload.end_date,
    }) || ' N/A';

  const date =
    filter === 'day' ? formattedStartDate : `${formattedStartDate} – ${formattedEndDate}`;

  const compareStr = (str1, str2) => str1.toLowerCase().includes(str2);
  if (
    payload.some(({ name }) => compareStr(name, 'lower')) &&
    payload.some(({ name }) => compareStr(name, 'upper'))
  ) {
    sortedPayload = payload.reduce((acc, item) => {
      if (compareStr(item.name, 'lower')) {
        acc[2] = item;
      }
      if (compareStr(item.name, 'upper')) {
        acc[0] = item;
      }
      acc[1] = item;
      return acc;
    }, [] as Payload[]);
  }

  return (
    <div className={s.tooltip}>
      <div className={s.tooltipDate}>{date}</div>
      {sortedPayload.map((item, idx) => {
        return (
          <div className={s.tooltipItem} key={idx}>
            <span className={s.tooltipItemName} style={{ '--color': item.color } as CSSProperties}>
              {item.name}
            </span>
            <span className={s.tooltipItemValue}>
              {getFormattedValue({
                type: dataFormatType,
                value: item.payload[item.dataKey.replace('range', 'value')],
                precision: 3,
              })}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface IChartComponent {
  name: string;
  x: string;
  y: string;
  filter: TChartFiler;
  data: TNormalizedChartData['data'];
  meta: TNormalizedChartData['meta'];
  loading: boolean;
  failed: boolean;
  interval: Interval;
  model: TChartModel;
  showCategory?: boolean;
  showMethodologyLink?: boolean;
}
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
}: IChartComponent): ReactElement => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const withEstimateValue = Boolean(meta?.some(({ isEstimate }) => isEstimate));

  const colors = useMemo(
    () => ({
      green: {
        key: 'green',
        id: nanoid(),
        stroke: 'var(--theme-color-primary)',
        fill: 'var(--theme-background-secondary)',
      },
      orange: {
        key: 'orange',
        id: nanoid(),
        stroke: 'var(--theme-color-secondary)',
        fill: 'var(--theme-background-secondary)',
      },
      silver: {
        key: 'silver',
        id: nanoid(),
        stroke: 'var(--color-nepal)',
        fill: 'var(--theme-background-secondary)',
      },
    }),
    [],
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
                  <h3 className={s.subtitle}>{getCategoryName(model.category)}</h3>
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
            <ComposedChart data={data}>
              <defs>
                {Object.values(colors).map((color) => {
                  return (
                    <linearGradient key={color.id} id={color.id} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0"
                        stopColor={color.stroke}
                        stopOpacity={withEstimateValue ? 0.16 : 0.12}
                      />
                      <stop
                        offset="100%"
                        stopColor={color.stroke}
                        stopOpacity={withEstimateValue ? 0.16 : 0}
                      />
                    </linearGradient>
                  );
                })}
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
                  value ? getFormattedValue({ type: x, value, filter }) : ''
                }
                interval="preserveEnd"
                y={1}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={['dataMin', 'auto']}
                tickFormatter={(value) => getFormattedValue({ type: y, value, precision: 3 })}
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

                if (item.isEstimate) {
                  return null;
                }

                return (
                  <Area
                    key={`area-${idx}`}
                    dataKey={withEstimateValue ? `range${idx}` : `value${idx}`}
                    name={item.title}
                    stroke={color.stroke}
                    strokeWidth={withEstimateValue && !item.isEstimate ? 0 : 2}
                    isAnimationActive={false}
                    activeDot={{
                      stroke: color.stroke,
                      fill: color.fill,
                      strokeWidth: 2,
                      r: 5,
                    }}
                    fillOpacity={1}
                    fill={`url(#${color.id})`}
                    isRange={withEstimateValue}
                  />
                );
              })}

              {withEstimateValue ? (
                <Line
                  strokeWidth={2}
                  type="linear"
                  dataKey={`value${1}`}
                  stroke={colors.silver.stroke}
                  activeDot={{
                    stroke: colors.silver.stroke,
                    fill: colors.silver.fill,
                    strokeWidth: 2,
                    r: 5,
                  }}
                  dot={false}
                  isAnimationActive={false}
                  name={'Estimate'}
                />
              ) : null}

              <Legend
                content={({ payload }) => {
                  return renderLegend(payload, showMethodologyLink);
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>

          {loading ? (
            <div className={s.loader}>
              <Spinner className={s.spinner} width={40} height={40} />
            </div>
          ) : null}
          {!loading && failed ? (
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

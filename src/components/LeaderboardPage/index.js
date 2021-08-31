import cn from 'classnames';
import { NavLink } from 'react-router-dom';
import { NumberParam, StringParam, useQueryParams } from 'use-query-params';

import lightFormat from 'date-fns/lightFormat';
import sub from 'date-fns/sub';

import { DEFAULT_CHART_SCALE } from 'constant';
import { EnergyChart } from './EnergyChart';
import { LeaderboardTable } from './LeaderboadTable';
import s from './s.module.css';

export default function LeaderboardPage() {
  const [query, setQuery] = useQueryParams({
    miner: StringParam,
    limit: NumberParam,
    offset: NumberParam,
    total: NumberParam,
    start: StringParam,
    end: StringParam,
    capacity: StringParam,
    fraction: StringParam,
    sealed: StringParam,
    sortBy: StringParam,
    order: StringParam,
  });

  return (
    <div className="container">
      <div className={s.metricsWrap}>
        <div className={s.metricsHeader}>
          <h2 className="h2">Filecoin network energy use</h2>
          <div className={s.metricsPeriod}>Past 30 days</div>
        </div>
        <div className={s.metrics}>
          <div className={cn(s.metricsItem, s.primary)}>
            <div className={s.metricValue}>
              23.5 <span className={s.metricUnit}>GWh</span>
            </div>
            <div className={s.metricName}>Renewable energy use</div>
          </div>
          <div className={cn(s.metricsItem, s.secondary)}>
            <div className={s.metricValue}>
              108 <span className={s.metricUnit}>GWh</span>
            </div>
            <div className={s.metricName}>Total energy use</div>
          </div>
        </div>
        <div className={s.metricsFooter}>
          <NavLink to="/" className={s.metricsFooterLink}>
            For storage providers
          </NavLink>
          <NavLink to="/methodology" className={s.metricsFooterLink}>
            View Methodology
          </NavLink>
        </div>
      </div>
      <div>
        <EnergyChart
          miner={query.miner}
          start={lightFormat(
            sub(new Date(), { years: 1, days: 1 }),
            'yyyy-MM-dd'
          )}
          end={lightFormat(sub(new Date(), { days: 1 }), 'yyyy-MM-dd')}
          filter={query.fraction ?? DEFAULT_CHART_SCALE}
        />
      </div>
      <div>
        <LeaderboardTable />
      </div>
    </div>
  );
}

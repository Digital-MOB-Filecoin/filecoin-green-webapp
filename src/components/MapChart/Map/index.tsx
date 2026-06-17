import { GeoProjection, geoEqualEarth, geoPath } from 'd3-geo';
import { scaleLinear } from 'd3-scale';
import { Feature } from 'geojson';
import { ReactElement, useCallback, useEffect, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Point,
  ZoomableGroup,
} from 'react-simple-maps';
import ReactTooltip from 'react-tooltip';
import { feature } from 'topojson-client';

import { TFetchMapChartCountries } from 'api';

import { Spinner } from 'components/Spinner';

import geography from './geography.json';
import s from './s.module.css';

export const colorScale = (value: any, domain: [number, number]): string => {
  if ((typeof value !== 'number' && !value) || !domain) {
    return '#F3F5F6';
  }

  return String(
    scaleLinear()
      .domain([domain[0], domain[1] / 2, domain[1]])
      .range(['#4EA394', '#FF974D'] as any)(value),
  );
};

const defaultCenter: Point = [15, 10];
const defaultScale = 1.5;
const width = 723;
const height = 381;

const projection: GeoProjection = geoEqualEarth()
  .scale(defaultScale * 100)
  .center(defaultCenter);

const path = geoPath(projection);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const geos = feature(geography, geography.objects['ne_10m_admin_0_countries']).features;

const getMinMax = (arr: number[]): Point => {
  return [Math.min.apply(null, arr), Math.max.apply(null, arr)];
};

type TMap = {
  loading: boolean;
  countries: TFetchMapChartCountries[];
};

export function Map({ loading, countries }: TMap): ReactElement {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<Point>(defaultCenter);
  const [domain, setDomain] = useState<Point>([0, 0]);
  const [availableCountryCodes, setAvailableCountryCodes] = useState<string[]>([]);

  useEffect(() => {
    ReactTooltip.rebuild();
  }, [countries.length, loading]);

  useEffect(() => {
    const { emissionsIntensity, codes } = countries.reduce(
      (acc, item) => {
        const intensity = Number(item.emissions_intensity);

        if (intensity > 1) {
          return acc;
        }

        acc.emissionsIntensity.push(intensity);
        acc.codes.push(item.country);

        return acc;
      },
      {
        codes: [] as string[],
        emissionsIntensity: [] as number[],
      },
    );

    setDomain(getMinMax(emissionsIntensity));
    setAvailableCountryCodes(codes);
  }, [countries]);

  const countryFill = useCallback(
    ({ alpha2, emissionsIntensity, isAvailable }) => {
      if (!isAvailable) {
        return '#F3F5F6';
      }
      return colorScale(emissionsIntensity, domain);
    },
    [domain],
  );

  const countryTip = useCallback(({ isAvailable, name, storageProviders }) => {
    if (!isAvailable) {
      return JSON.stringify({
        title: name,
        data: [{ title: 'No data' }],
      });
    }

    return JSON.stringify({
      title: name,
      data: [{ value: storageProviders, title: 'storage providers' }],
    });
  }, []);

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        position: 'relative',
        flexShrink: 0,
        borderRadius: '8px 0 0 8px',
        overflow: 'hidden',
      }}
    >
      <ComposableMap
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        projection={projection}
        width={width}
        height={height}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          translateExtent={[
            [60, 0],
            [180 + width, 120 + height],
          ]}
          zoom={zoom}
          center={center}
          minZoom={1}
          maxZoom={4}
          onMoveEnd={({ zoom: zoomAfter, coordinates }) => {
            setZoom(zoomAfter);
            setCenter(coordinates);
          }}
        >
          <Geographies geography={geography}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const alpha2 = geo.properties['ISO_A2'];

                const isAvailable =
                  alpha2 &&
                  availableCountryCodes.find((code) => code.toLowerCase() === alpha2.toLowerCase());

                let storageProviders: string | number = 0;
                let emissionsIntensity: string | number = 0;

                if (isAvailable) {
                  const item = countries.find((item) => item.country === alpha2);

                  if (item) {
                    storageProviders = item.storage_providers;
                    emissionsIntensity = Number(item.emissions_intensity);
                  }
                }

                const bgColor = countryFill({ alpha2, emissionsIntensity, isAvailable });

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={bgColor}
                    stroke={geo?.geometry?.type === 'Polygon' ? bgColor : '#fff'}
                    strokeWidth={0.5}
                    data-tip={countryTip({ isAvailable, name: geo.properties.NAME, storageProviders })}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      {loading ? <Spinner className={s.spinner} /> : null}
      <ReactTooltip
        place="top"
        className={s.tooltip}
        getContent={handleTooltipContent}
      />
    </div>
  );
}

const handleTooltipContent = (props) => {
  if (!props) return null;

  const { data, title } = JSON.parse(props);

  return (
    <>
      <div className={s.tooltipHeading}>{title}</div>
      <dl className={s.tooltipDL}>
        {data.map((item, idx) => (
          <div key={idx} className={s.tooltipDRow}>
            <dt className={s.tooltipDt}>{item.value}</dt>
            <dd className={s.tooltipDd}>{item.title}</dd>
          </div>
        ))}
      </dl>
    </>
  );
};

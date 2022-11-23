import { useCallback, useEffect, useState } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';
import ReactTooltip from 'react-tooltip';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
  Point,
} from 'react-simple-maps';
import { Feature } from 'geojson';
import { feature } from 'topojson-client';
import { scaleLog } from 'd3-scale';
import { geoPath, geoEqualEarth } from 'd3-geo';

import {
  TFetchMapChartCountries,
  TFetchMapChartCountryMiners,
  TFetchMapChartMinerMarkers,
} from 'api';

import { getCountryNameByCode } from 'utils/country';
import { Spinner } from 'components/Spinner';
import { Svg } from 'components/Svg';

import { MapInfoModal } from '../MapInfoModal';
// import geography from './world-countries-sans-antarctica.json';
import geography from './geography.json';
import s from './s.module.css';

export const colorScale = (value, domain): string => {
  if (!value || !domain) {
    return '#F3F5F6';
  }

  return String(
    scaleLog()
      .domain(domain)
      // @ts-ignore
      .range(['#F3F5F6', '#4EA394'])(value)
  );
};

const defaultZoom = 1;
const defaultCenter: Point = [15, 10];
// const defaultCenter: Point = [0, 0];
const defaultCountryZoom = 4;
const defaultScale = 1.5;
const width = 723;
const height = 381;

const projection = geoEqualEarth()
  .scale(defaultScale * 100)
  .center(defaultCenter);

const path = geoPath(projection);

const geos: Feature[] = feature(
  geography,
  geography.objects[Object.keys(geography.objects)[0]]
).features;

const getGeoByCountryCode = (
  countryCode?: string | null
): Feature | undefined => {
  if (!countryCode || !geos || !geos.length) {
    return undefined;
  }

  return geos.find(
    (geo) =>
      geo?.properties?.['ISO_A2']?.toLowerCase() === countryCode.toLowerCase()
  );
};

const getCentroid = (geo?: Feature): Point | null => {
  if (!geo) {
    return null;
  }

  // @ts-ignore
  return projection.invert(path.centroid(geo));
};

const getBounds = (
  geo?: Feature
): [[number, number], [number, number]] | undefined => {
  if (!geo) {
    return undefined;
  }

  return path.bounds(geo);
};

// props?: {
//   title: string;
//   data: { value: string; title: string }[];
// }
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

const getMinMax = (arr: number[]): Point => {
  return [Math.min.apply(null, arr), Math.max.apply(null, arr)];
};

type TMap = {
  loading: boolean;
  countries: TFetchMapChartCountries[];
  countryMiners: TFetchMapChartCountryMiners[];
  minerMarkers: TFetchMapChartMinerMarkers[];
};

export function Map({ loading, countries, countryMiners, minerMarkers }: TMap) {
  const [query, setQuery] = useQueryParams({
    country: StringParam,
    miner: StringParam,
  });
  const [zoom, setZoom] = useState(defaultZoom);
  const [center, setCenter] = useState<Point>(defaultCenter);
  const [domain, setDomain] = useState<Point>([0, 0]);
  const [availableCountryCodes, setAvailableCountryCodes] = useState<string[]>(
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!query.miner && !query.country) {
      setCenter(defaultCenter);
      setZoom(defaultZoom);
      return;
    }

    const getCountryScaledZoom = (countryCode: string): number => {
      const bounds = getBounds(getGeoByCountryCode(countryCode)); // [[x₀, y₀], [x₁, y₁]]

      if (bounds) {
        const x0 = bounds[0][0];
        const y0 = bounds[0][1];
        const x1 = bounds[1][0];
        const y1 = bounds[1][1];

        const geoWidth = Math.abs(x1 - x0);
        const geoHeight = Math.abs(y1 - y0);

        const maxXScale = width / geoWidth;
        const maxYScale = height / geoHeight;

        return Math.min(maxXScale, maxYScale);
      }

      return defaultCountryZoom;
    };

    if (
      !query.miner &&
      query.country &&
      countries.length &&
      availableCountryCodes.length
    ) {
      const countryCode = query.country;
      const isAvailable = availableCountryCodes.some(
        (code) => code === countryCode
      );

      if (isAvailable) {
        const zoomScale = getCountryScaledZoom(countryCode);
        const centroid = getCentroid(getGeoByCountryCode(countryCode));

        setZoom(zoomScale);
        if (centroid) {
          setCenter(centroid);
        }
      }
    }

    if (
      !query.country &&
      query.miner &&
      minerMarkers.length &&
      countries.length &&
      availableCountryCodes.length
    ) {
      const countryCode = minerMarkers[0].country.toLowerCase();

      const isSameCountry = minerMarkers.every(
        (marker) => marker.country.toLowerCase() === countryCode
      );

      const isAvailable =
        isSameCountry &&
        availableCountryCodes.some(
          (code) => code.toLowerCase() === countryCode
        );

      if (isAvailable) {
        const centroid = getCentroid(getGeoByCountryCode(countryCode));
        const zoomScale = getCountryScaledZoom(countryCode);

        if (centroid) {
          setCenter(centroid);
          setZoom(zoomScale);
        }
      } else {
        setCenter(defaultCenter);
        setZoom(defaultZoom);
      }
    }
  }, [
    availableCountryCodes,
    availableCountryCodes.length,
    countries.length,
    minerMarkers,
    minerMarkers.length,
    query.country,
    query.miner,
  ]);

  useEffect(() => {
    ReactTooltip.rebuild();
  }, [countries.length, query.country, countryMiners?.length, loading]);

  useEffect(() => {
    const providers: number[] = [];
    const codes: string[] = [];

    countries.forEach((item) => {
      providers.push(Number(item.storage_providers));
      codes.push(item.country);
    });

    setDomain(getMinMax(providers));
    setAvailableCountryCodes(codes);
  }, [countries]);

  const handlerGeoClick = useCallback(
    ({ alpha2, isAvailable }) =>
      () => {
        if (!query.miner && !query.country && isAvailable) {
          setQuery((prevQuery) => ({
            ...prevQuery,
            country: alpha2,
          }));
        }
      },
    [query.country, query.miner, setQuery]
  );

  const countryFill = useCallback(
    ({ alpha2, storageProviders }) => {
      if (query.country || query.miner) {
        if (query.country === alpha2 || query.miner) {
          return '#F3F5F6';
        }
        return 'transparent';
      }

      return colorScale(storageProviders, domain);
    },
    [domain, query.country, query.miner]
  );

  const countryTip = useCallback(
    ({ isAvailable, name, storageProviders }) => {
      if (query.country || query.miner) {
        return '';
      }

      if (!isAvailable || query.country || query.miner) {
        return JSON.stringify({
          title: name,
          data: [
            {
              // value: storageProviders,
              title: 'No data',
            },
          ],
        });
      }

      return JSON.stringify({
        title: name,
        data: [
          {
            value: storageProviders,
            title: 'storage providers',
          },
        ],
      });
    },
    [query.country, query.miner]
  );

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
        // @ts-ignore
        projection={projection}
        width={width}
        height={height}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          // translateExtent={[
          //   [119, 60],
          //   [119 + width, 59 + height],
          // ]}
          translateExtent={[
            [60, 0],
            [180 + width, 120 + height],
          ]}
          zoom={zoom}
          center={center}
          minZoom={1}
          maxZoom={query.country || query.miner ? 500 : 4}
          onMoveEnd={({ zoom: zoomAfter, coordinates }) => {
            // if (zoomAfter < defaultCountryZoom) {
            //   setQuery((prevQuery) => ({
            //     ...prevQuery,
            //     country: undefined,
            //   }));
            // }
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
                  availableCountryCodes.find(
                    (code) => code.toLowerCase() === alpha2.toLowerCase()
                  );

                const storageProviders =
                  (isAvailable &&
                    countries.find((item) => item.country === alpha2)
                      ?.storage_providers) ||
                  0;

                const bgColor = countryFill({
                  alpha2,
                  storageProviders,
                });

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={handlerGeoClick({ alpha2, isAvailable })}
                    fill={bgColor}
                    stroke={
                      geo?.geometry?.type === 'Polygon' ? bgColor : '#fff'
                    }
                    strokeWidth={0.5}
                    data-tip={countryTip({
                      isAvailable,
                      name: geo.properties.NAME,
                      storageProviders,
                    })}
                  />
                );
              })
            }
          </Geographies>
          {countryMiners.map((marker, idx) => {
            return (
              <Marker
                key={idx}
                coordinates={[marker.long, marker.lat]}
                data-tip={JSON.stringify({
                  title: marker.miner,
                  data: [{ value: marker.power, title: 'total raw power' }],
                })}
                onClick={() => {
                  setQuery((prevQuery) => ({
                    ...prevQuery,
                    miner: marker.miner,
                  }));
                }}
              >
                <circle r={7 / zoom} fill="#4EA394" opacity="0.24" />
                <circle r={3 / zoom} fill="#4EA394" />
              </Marker>
            );
          })}
          {minerMarkers.map((marker, idx) => {
            return (
              <Marker
                key={idx}
                coordinates={[marker.long, marker.lat]}
                data-tip={JSON.stringify({
                  title:
                    marker.city === 'n/a'
                      ? getCountryNameByCode(marker.country) +
                        ' (' +
                        marker.miner +
                        ')'
                      : marker.city +
                        ', ' +
                        getCountryNameByCode(marker.country) +
                        ' (' +
                        marker.miner +
                        ')',
                  data: [{ value: marker.power, title: 'total raw power' }],
                })}
              >
                <circle r={7 / zoom} fill="#4EA394" opacity="0.24" />
                <circle r={3 / zoom} fill="#4EA394" />
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
      {loading ? <Spinner className={s.spinner} /> : null}
      <ReactTooltip
        // effect="solid"
        place="top"
        className={s.tooltip}
        key={query.country}
        getContent={handleTooltipContent}
      />

      <button
        type="button"
        className={s.infoButton}
        onClick={() => setIsModalOpen(true)}
      >
        <Svg id="info" />
      </button>

      <MapInfoModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
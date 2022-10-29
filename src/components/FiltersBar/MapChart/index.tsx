import { useCallback, useEffect, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import * as d3Projection from 'd3-geo-projection';
import ReactTooltip from 'react-tooltip';

import { Spinner } from 'components/Spinner';

import geography from './world-countries-sans-antarctica.json';
import s from './s.module.css';
import { TFetchMapChartMarkersResponse, TFetchMapChartResponse } from 'api';

const projection = d3Projection.geoNaturalEarth2().scale(150);

const defaultZoom = 1;
const defaultCenter: [number, number] = [10, 10];
const defaultCountryZoom = 4;

const colorScale = (value, domain): string => {
  if (!value || !domain) {
    return '#F3F5F6';
  }

  return String(
    scaleLinear()
      .domain(domain)
      // @ts-ignore
      .range(['#F3F5F6', '#4EA394'])(value)
  );
};

const handleTooltipContent = (props) => {
  if (!props) return null;
  const { data, title } = props;

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

const getMinMax = (arr: number[]): [number, number] => {
  return [Math.min.apply(null, arr), Math.max.apply(null, arr)];
};

type TMapChart = {
  width: number;
  height: number;
  countries: TFetchMapChartResponse;
  loading: boolean;
  onSelectCountry: (country: string) => void;
  markers: TFetchMapChartMarkersResponse;
  selectedCountry: string | null;
  onZoomOut: () => void;
};

export function MapChart({
  width,
  height,
  countries,
  loading,
  markers,
  selectedCountry,
  onSelectCountry,
  onZoomOut,
}: TMapChart) {
  const [zoom, setZoom] = useState(defaultZoom);
  const [center, setCenter] = useState<[number, number]>(defaultCenter);
  const [domain, setDomain] = useState<number[]>([0, 0]);
  const [tooltipContent, setTooltipContent] = useState<null | {
    title: string;
    data: { value: string; title: string }[];
  }>(null);
  const [availableCountryCodes, setAvailableCountryCodes] = useState<string[]>(
    []
  );

  useEffect(() => {
    ReactTooltip.rebuild();
  }, [countries.length, selectedCountry, markers?.length, loading]);

  useEffect(() => {
    const providers: number[] = [];
    const codes: string[] = [];

    countries.forEach((item) => {
      providers.push(Number(item.storage_providers));
      codes.push(item.country);
    });

    setDomain(getMinMax(providers));
    setAvailableCountryCodes(codes);
  }, [countries, countries?.length]);

  useEffect(() => {
    if (!selectedCountry && markers.length === 0) {
      setZoom(defaultZoom);
      setCenter(defaultCenter);
    }
  }, [selectedCountry, loading, markers?.length]);

  const handlerZoomCountry = useCallback(
    (geo, projection, path) => {
      const centroid = projection.invert(path.centroid(geo));
      setCenter(centroid);
      setZoom(defaultCountryZoom);
      onSelectCountry(geo.properties['Alpha-2']);
    },
    [onSelectCountry]
  );

  const handlerShowGeoTooltip = useCallback(
    ({ tip, isAvailable }) =>
      () => {
        if (isAvailable && !selectedCountry) {
          setTooltipContent(tip);
        }
      },
    [selectedCountry]
  );

  const handlerHideGeoTooltip = useCallback(
    ({ isAvailable, alpha2 }) =>
      () => {
        if (isAvailable && selectedCountry && selectedCountry === alpha2) {
          setTooltipContent(null);
        }
      },
    [selectedCountry]
  );

  const handlerGeoClick = useCallback(
    ({ isAvailable, geo, path, projection, alpha2 }) =>
      () => {
        if (isAvailable && !selectedCountry) {
          handlerZoomCountry(geo, projection, path);
        }
      },
    [handlerZoomCountry, selectedCountry]
  );

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <ComposableMap
        projection={projection}
        width={width}
        height={height}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          translateExtent={[
            [141, 33],
            [width + 140, height + 33],
          ]}
          zoom={zoom}
          center={center}
          minZoom={1}
          maxZoom={selectedCountry ? 300 : 2}
          onMoveEnd={({ zoom: zoomAfter }) => {
            if (zoomAfter < defaultCountryZoom) {
              onZoomOut();
            }
          }}
        >
          <Geographies geography={geography}>
            {({ geographies, projection, path }) =>
              geographies.map((geo) => {
                const alpha2 = geo.properties['Alpha-2'];

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

                const tip = {
                  title: geo.properties.name,
                  data: [
                    {
                      value: storageProviders,
                      title: 'storage providers',
                    },
                  ],
                };

                const fill = (): string => {
                  if (selectedCountry) {
                    if (selectedCountry === alpha2) {
                      return '#F3F5F6';
                    }
                    return 'transparent';
                  }
                  if (!isAvailable) {
                    return '#FbFbFb';
                  }

                  return colorScale(storageProviders, domain);
                };

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={handlerShowGeoTooltip({ tip, isAvailable })}
                    onMouseLeave={handlerHideGeoTooltip({
                      isAvailable,
                      alpha2,
                    })}
                    onClick={handlerGeoClick({
                      isAvailable,
                      geo,
                      path,
                      projection,
                      alpha2,
                    })}
                    fill={fill()}
                    stroke="#fff"
                    strokeWidth={0.5}
                    data-tip={''}
                  />
                );
              })
            }
          </Geographies>
          {markers.map(
            (
              marker: {
                miner: string;
                power: string;
                long: number;
                lat: number;
              },
              idx
            ) => {
              const tip = {
                title: marker.miner,
                data: [
                  {
                    value: marker.power,
                    title: 'total raw power',
                  },
                ],
              };

              return (
                <Marker
                  key={idx}
                  coordinates={[marker.long, marker.lat]}
                  data-tip=""
                  onMouseEnter={() => setTooltipContent(tip)}
                  onMouseLeave={() => setTooltipContent(null)}
                >
                  <circle r={7 / zoom} fill="#4EA394" opacity="0.24" />
                  <circle r={3 / zoom} fill="#4EA394" />
                </Marker>
              );
            }
          )}
        </ZoomableGroup>
      </ComposableMap>
      {loading ? <Spinner className={s.spinner} /> : null}
      <ReactTooltip
        // effect="solid"
        place="top"
        className={s.tooltip}
        key={selectedCountry}
      >
        {handleTooltipContent(tooltipContent)}
      </ReactTooltip>
    </div>
  );
}

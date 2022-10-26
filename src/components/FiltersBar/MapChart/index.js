import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { formatBytes } from '../../../utils/bytes';

const projection = d3Projection.geoNaturalEarth2().scale(150).center([65, -10]);

const colorScale = (value, domain) => {
  if (!value || !domain) {
    return '#F3F5F6';
  }

  return scaleLinear().domain(domain).range(['#F3F5F6', '#4EA394'])(value);
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

const getMinMax = (arr) => {
  return [Math.min.apply(null, arr), Math.max.apply(null, arr)];
};

const defaultZoom = 1;
const defaultCenter = [0, 0];
const defaultCountryZoom = 4;

export function MapChart({
  width,
  height,
  countries,
  loading,
  onSelectCountry,
  markers,
  selectedCountry,
  onZoomOut,
}) {
  const [parsedData, setParsedData] = useState([]);
  const [domain, setDomain] = useState(null);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [zoom, setZoom] = useState(defaultZoom);
  const [center, setCenter] = useState(defaultCenter);

  const availableCountryCodes = useMemo(() => {
    return countries.map(({ country }) => country);
  }, [countries, countries?.length]);

  useEffect(() => {
    ReactTooltip.rebuild();
  }, [countries?.length, selectedCountry, markers?.length]);

  useEffect(() => {
    setParsedData(countries);
    setDomain(
      getMinMax(countries.map((item) => Number(item.storage_providers)))
    );
  }, [countries, countries?.length]);

  useEffect(() => {
    if (!selectedCountry && markers.length === 0) {
      setZoom(defaultZoom);
      setCenter(defaultCenter);
    }
  }, [selectedCountry, loading, markers?.length]);

  const handleGeographyClick = useCallback((geo, projection, path) => {
    const centroid = projection.invert(path.centroid(geo));
    setCenter(centroid);
    setZoom(defaultCountryZoom);
    onSelectCountry(geo.properties['Alpha-2']);
  }, []);

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
          zoom={zoom}
          center={center}
          minZoom={1}
          maxZoom={selectedCountry ? 300 : 2}
          onMoveEnd={({ coordinates, zoom: zoomAfter }) => {
            if (zoomAfter < defaultCountryZoom) {
              onZoomOut();
            }
            setZoom(zoomAfter);
            setCenter(coordinates);
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
                    parsedData.find((item) => item.country === alpha2)
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

                const fill = () => {
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
                    onMouseEnter={() => {
                      if (isAvailable) {
                        if (selectedCountry === alpha2) {
                          return;
                        }
                        setTooltipContent(tip);
                      }
                    }}
                    onMouseLeave={() => {
                      if (isAvailable) {
                        if (selectedCountry === alpha2) {
                          return;
                        }
                        setTooltipContent(null);
                      }
                    }}
                    onClick={() =>
                      isAvailable && handleGeographyClick(geo, projection, path)
                    }
                    fill={fill()}
                    stroke="#fff"
                    strokeWidth={0.5}
                    {...(selectedCountry || !isAvailable
                      ? {}
                      : { 'data-tip': '' })}
                  />
                );
              })
            }
          </Geographies>
          {markers.map((marker, idx) => {
            const tip = {
              title: marker.miner,
              data: [
                {
                  value: formatBytes(marker.power, {
                    precision: 2,
                    inputUnit: 'GiB',
                    iec: true,
                  }),
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
          })}
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

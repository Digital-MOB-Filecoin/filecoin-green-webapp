import React, { useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  // Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import * as d3Projection from 'd3-geo-projection';
import ReactTooltip from 'react-tooltip';
import { scaleLinear } from 'd3-scale';

import s from './s.module.css';

import geography from './world-countries-sans-antarctica.js';

const projection = d3Projection.geoNaturalEarth2().center([50, 0]);

const colorScale = (value, domain) => {
  if (!value || !domain) {
    return '#F3F5F6';
  }

  return scaleLinear().domain(domain).range(['#F3F5F6', '#4EA394'])(value);
};

const getText = (key) => {
  switch (key) {
    case 'storage_providers':
      return 'storage providers';
    default:
      return key;
  }
};

const handleTooltipContent = (props) => {
  if (!props) return null;
  const { storage_providers, name } = props;

  return (
    <>
      <div className={s.tooltipHeading}>{name}</div>
      <dl className={s.tooltipDL}>
        <div className={s.tooltipDRow}>
          <dt className={s.tooltipDt}>{storage_providers || 0}</dt>
          <dd className={s.tooltipDd}>{getText('storage_providers')}</dd>
        </div>
      </dl>
    </>
  );
};

const getMinMax = (arr) => {
  return [Math.min.apply(null, arr), Math.max.apply(null, arr)];
};

export default function MapChart({ width, height, data }) {
  const [parsedData, setParsedData] = useState([]);
  const [domain, setDomain] = useState(null);
  const [tooltipContent, setTooltipContent] = useState(null);

  React.useEffect(() => {
    ReactTooltip.rebuild();
  }, [data?.length]);

  React.useEffect(() => {
    setTimeout(() => {
      setParsedData(data);
      setDomain(getMinMax(data.map((item) => Number(item.storage_providers))));
    }, 1000);
  }, [data, data?.length]);

  const mockDotsCount = 50;

  const groupedLocations = Array.from({ length: mockDotsCount }).reduce(
    (acc, item, idx) => {
      const key = `${idx * 2},${idx * 2}`;

      if (!acc[key]) {
        acc[key] = [];
      }

      return {
        ...acc,
        [key]: [...acc[key], { id: idx * 1234 }],
      };
    },
    {}
  );

  return (
    <>
      <div data-tip="" style={{ width, height }}>
        <ComposableMap projection={projection} width={width} height={height}>
          <ZoomableGroup>
            <Geographies geography={geography}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const tip = {
                    alpha2: geo.properties['Alpha-2'],
                    name: geo.properties.name,
                    storage_providers:
                      parsedData.find(
                        (item) => item.country === geo.properties['Alpha-2']
                      )?.storage_providers || 0,
                  };

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      stroke="#fff"
                      strokeWidth={0.5}
                      fill={colorScale(tip.storage_providers, domain)}
                      onMouseEnter={() => {
                        setTooltipContent(tip);
                      }}
                      onMouseLeave={() => {
                        setTooltipContent(null);
                      }}
                      style={{
                        pressed: { fill: '', stroke: '' },
                      }}
                    />
                  );
                })
              }
            </Geographies>
            {/*{Object.entries(groupedLocations).map(([coords, items]) => (*/}
            {/*  <Marker*/}
            {/*    key={coords}*/}
            {/*    coordinates={coords.split(',')}*/}
            {/*    data-tip={items.map((item) => item.id)}*/}
            {/*  >*/}
            {/*    <circle r={14} fill="#4EA394" opacity="0.24" />*/}
            {/*    <circle r={6} fill="#4EA394" />*/}
            {/*  </Marker>*/}
            {/*))}*/}
          </ZoomableGroup>
        </ComposableMap>
      </div>
      <ReactTooltip
        // effect="solid"
        place="top"
        className={s.tooltip}
      >
        {handleTooltipContent(tooltipContent)}
      </ReactTooltip>
    </>
  );
}

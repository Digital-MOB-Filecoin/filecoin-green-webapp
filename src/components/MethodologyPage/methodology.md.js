export default `
# Filecoin Energy Use Estimate Methodology

**Filecoin is *the* data storage layer of Web3**, and the world's largest decentralized storage network. It is a permissionless system in which *Storage Providers* (SPs) offer data storage services to clients in return for payments denominated in the network's native token, Filecoin. The SPs submit regular proofs to the Filecoin blockchain, demonstrating that data is being stored safely over time.

**We believe in the core Web3 principles of data transparency, verifiability and interoperability**, and that every effort should be made to apply these principles to the environmental impacts of Web3 infrastructure itself. To that end, this dashboard provides granular and verifiable estimates of Filecoin electricity use, both at the level of the network as a whole and that of individual SPs. Energy use is estimated based on proofs submitted to the Filecoin blockchain, according to the methodology outlined below. Bounds on energy use are given in an accessible UI and can also be downloaded at single-epoch time resolution (30s) in order to facilitate applications in research and cryptoeconomics. **These data make interactions between Filecoin and global power systems more transparent than those of any other major blockchain**, a crucial step in ongoing efforts of our community to speed worldwide decarbonization.

In addition to the description below, the [filecoin-energy-estimation repository](https://github.com/redransil/filecoin-energy-estimation) contains model versions, data and a detailed methodological summary.

For more information about the Filecoin Green program, see this [summary video](https://www.youtube.com/watch?v=mZ4fdQIv7j4) and [Meetup recording](https://www.youtube.com/watch?v=GqtXc0pFxuk&list=PL_0VrY55uV18i8gXWcuVLK3J60cetDP6E). If you are interested in contributing to the Filecoin Green community, please join the **#fil-green** channel on [Filecoin Slack](https://filecoin.io/slack)!

## Model Design (v1.0.1)

The model incorporates the three dominant processes which consume energy on Filecoin:

 1. Sealing, a one-time setup process onboarding data to the network
 2. Storage of files over time
 3. Overhead energy used to perform functions such as cooling and power conversion accounted for by *Power Usage Effectiveness* (PUE)

See [filecoin-energy-estimation](https://github.com/redransil/filecoin-energy-estimation) for a more detailed discussion.

These components contribute to energy use following the equation:

**Electrical Power = ( A • (Sealing Rate) + B • (Raw Capacity) ) • PUE**

Where:

**Electrical Power ∝ watts** is the total electricity use

**A ∝ Wh/byte** is the energy required to seal a sector

**Sealing Rate ∝ bytes/hour** is the rate at which new data is being sealed, determined from on-chain proofs

**B ∝ W/byte** is the electrical power required to store data over time

**Raw Capacity ∝ bytes** is the amount of data stored, determined from on-chain proofs

**PUE ∝ dimensionless** is the [Power Usage Effectiveness](https://en.wikipedia.org/wiki/Power_usage_effectiveness), which is the ratio of total electrical power consumed to that consumed by useful IT processes such as sealing and storage

## Sealing Energy (v1.0.1)

The energy required to seal data is estimated by multiplying sealing rate by a constant value as shown in the following table:
|Lower Bound| Estimate | Upper Bound |
|--|--|--|
|6.01•10<sup>-9</sup> Wh/byte|3.42•10<sup>-8</sup> Wh/byte|5.60•10<sup>-8</sup> Wh/byte|

These values were determined by examining questionnaires sent to storage providers, interview results with individual storage providers, energy consumption from Filecoin operations owned by Protocol Labs, sealing benchmarks, and hardware specifications. Details are given in [filecoin-energy-estimation](https://github.com/redransil/filecoin-energy-estimation).

It should be noted that this version of the model treats sealing as a single delta function of energy use occurring when a proof is submitted. For individual SP data in particular, time averages over a period of at least 6 hours thus give a better estimate of energy use than the raw model output.


## Storage Energy (v1.0.1)

The energy required to store data is estimated by multiplying the amount of data stored by a constant value as shown in the following table:
|Lower Bound| Estimate | Upper Bound |
|--|--|--|
|9.02•10<sup>-13</sup> W/byte|3.00•10<sup>-12</sup> W/byte|8.10•10<sup>-12</sup> W/byte|

These values were determined by examining questionnaires sent to storage providers, interview results with individual storage providers, energy consumption from Filecoin operations owned by Protocol Labs, and hardware specifications. Details are given in [filecoin-energy-estimation](https://github.com/redransil/filecoin-energy-estimation).

## Total Energy

Total energy use is estimated by adding the sealing and storage energy, then multiplying by a PUE value as shown in the following table:
|Lower Bound| Estimate | Upper Bound |
|--|--|--|
|1.18|1.57|1.93|

PUE values were used from the following sources:
1. [Masanet, Eric, et al. "Recalibrating global data center energy-use estimates." _Science_ 367.6481 (2020): 984-986.](https://www.science.org/doi/10.1126/science.aba3758)
2. [Uptime Institute 2021 Data Center Industry Survey Results](https://uptimeinstitute.com/2021-data-center-industry-survey-results)

The model was backtested by comparing estimated total energy consumption to metered results for a limited number of SPs.

Additional discussion is given in [filecoin-energy-estimation](https://github.com/redransil/filecoin-energy-estimation).
`;

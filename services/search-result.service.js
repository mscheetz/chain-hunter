const searchRepo = require('../data/search-results.repo');
const countryRepo = require('../data/country.repo');
const helperSvc = require('./helper.service.js')
const responseSvc = require('./response.service');
const _ = require('lodash');

/**
 * Update search results table in database
 * @param {*} ipAddress ip address
 * @param {*} ipInfo ip information
 * @param {*} chain chain with results
 * @param {*} type type of results
 */
const updateSearchResult = async(ipAddress, ipInfo, chain, type) => {

  if(ipAddress !== "::1") {
    let searchResult = {};
    if(typeof ipInfo === 'undefined' || ipInfo === null) {
      searchResult = {
        country: '?', 
        region: '?', 
        city: '?', 
        metro: 0,
        timezone: '?', 
        chain: chain,
        searchAt: helperSvc.getUnixTS(),
        searchType: type
      };
    } else {
      searchResult = {
        country: ipInfo.country, 
        region: ipInfo.region, 
        city: ipInfo.city, 
        metro: ipInfo.metro,
        timezone: ipInfo.timezone, 
        chain: chain,
        searchAt: helperSvc.getUnixTS(),
        searchType: type
      };
    }
    await searchRepo.add(searchResult);
  }
}

/**
 * Get search counts by country
 */
const getResultsByCountry = async() => {    
    const results = await searchRepo.getAll();

    let countries = results.map(r => r.country)
    .filter((value, idx, self) => self.indexOf(value) === idx);

    let chains = results.map(r => r.chain)
    .filter((value, idx, self) => self.indexOf(value) === idx);

    let counts = [];

    countries.forEach(country => {
      let chainCounts = [];
      chains.forEach(chain => {
        let count = results.filter(r => r.country === country && r.chain === chain).length;
        chainCounts.push({ chain, count});
      })
      counts.push(country, ...chainCounts);
    })

    return responseSvc.successMessage(counts);
}

/**
 * Get search counts by region
 * 
 * @param {*} country country to filter on (optional)
 */
const getResultsByRegion = async(country = null) => {    
    const results = await searchRepo.getAll();

    let filtered = country === null ? results : results.filter(r => r.country === country);

    let regions = filtered.map(f => f.region)
    .filter((value, idx, self) => self.indexOf(value) === idx);

    let chains = results.map(r => r.chain)
    .filter((value, idx, self) => self.indexOf(value) === idx);

    let counts = [];

    regions.forEach(region => {
        let chainCounts = [];
        chains.forEach(chain => {
            let count = results.filter(r => r.region === region && r.chain === chain).length;
            chainCounts.push({ chain, count});
        })
        counts.push(region, ...chainCounts);
    })
    
    return responseSvc.successMessage(counts);
}

/**
 * Get search counts by city
 * 
 * @param {*} country country to filter on (optional)
 * @param {*} region region to filter on (optional)
 */
const getResultsByCity = async(country = null, region = null) => {
    const results = await searchRepo.getAll();

    let filtered = country === null ? results : results.filter(r => r.country === country);
    
    if(region !== null) {
      filtered = filtered.filter(f => f.region === region);
    }

    let cities = filtered.map(r => r.city)
    .filter((value, idx, self) => self.indexOf(value) === idx);

    let chains = results.map(r => r.chain)
    .filter((value, idx, self) => self.indexOf(value) === idx);

    let counts = [];

    cities.forEach(city => {
      let chainCounts = [];
      chains.forEach(chain => {
        let count = results.filter(r => r.city === city && r.chain === chain).length;
        chainCounts.push({ chain, count});
      })
      counts.push(city, ...chainCounts);
    })
    
    return responseSvc.successMessage(counts);
}

/**
 * Get search counts by timezone
 */
const getResultsByTimezone = async() => {    
    const results = await searchRepo.getAll();

    let timezones = results.map(r => r.timezone)
    .filter((value, idx, self) => self.indexOf(value) === idx);

    let chains = results.map(r => r.chain)
    .filter((value, idx, self) => self.indexOf(value) === idx);

    let counts = [];

    timezones.forEach(timezone => {
      let chainCounts = [];
      chains.forEach(chain => {
        let count = results.filter(r => r.timezone === timezone && r.chain === chain).length;
        chainCounts.push({ chain, count});
      })
      counts.push(timezone, ...chainCounts);
    })

    return responseSvc.successMessage(counts);
}

const getResultsByBlockchain = async() => {
  const results = await searchRepo.getAll();


  let chains = results.map(r => r.chain)
  .filter((value, idx, self) => self.indexOf(value) === idx);

  let searchTypes = results.map(r => r.searchType)
  .filter((value, idx, self) => self.indexOf(value) === idx);

  let counts = [];

  chains.forEach(chain => {
    let typeCounts = [];
    searchTypes.forEach(type => {
      let count = results.filter(r => r.chain === chain && r.searchType === type).length;
      typeCounts.push({ type, count});
    })
    counts.push(chain, ...typeCounts);
  })

  return responseSvc.successMessage(counts);
}

const getLastSearch = async() => {
  let searches = await searchRepo.getLastSearch();

  searches.forEach(s => {
    const ts = Math.floor(s.searchAt/1000);
    s.searchDate = helperSvc.unixToUTC(ts);
  });

  return responseSvc.successMessage(searches);
}

/**
 * Get top searched chain by country
 */
const getTopSearchChainByCountry = async() => {
  let searches = await searchRepo.getTopSearchChainByCountry();
  let datas = await matchResults(searches);

  return responseSvc.successMessage(datas);
}

/**
 * Get top searched type by country
 */
const getTopSearchTypeByCountry = async() => {
  let searches = await searchRepo.getTopSearchTypeByCountry();
  let datas = await matchResults(searches);

  return responseSvc.successMessage(datas);
}

/**
 * Match search results to contry codes
 * @param {*} searches search results
 */
const matchResults = async(searches) => {
  const countries = await countryRepo.getAll();
  const uniques = [...new Set(searches.map(s => s.country))];

  let datas = [];
  for(let unique of uniques) {
    let country = unique;
    if(country === "GB") {
      country = "UK";
    }
    let countryCodes = countries.filter(c => c.code === country);
    
    if(countryCodes.length > 0) {
      let results = searches.filter(s => s.country === unique);
      results = _.orderBy(results, "value");
      let value = "";
      for(let i = 0; i < results.length; i++){
        if(i > 0) {
          value +=" | ";
        }
        value+=results[i].value.toUpperCase();
      }

      let data = {
        id: countryCodes[0].code,
        name: countryCodes[0].name,
        chain: value,
        //value: 100
      };
      datas.push(data);
    }
  }

  return datas;
}

module.exports = {
    updateSearchResult,
    getResultsByCountry,
    getResultsByRegion,
    getResultsByCity,
    getResultsByTimezone,
    getResultsByBlockchain,
    getTopSearchChainByCountry,
    getTopSearchTypeByCountry,
    getLastSearch
}

const db = require('./dataRepo');
const helperSvc = require('./helperService.js')

/**
 * Update search results table in database
 * @param {*} ipAddress ip address
 * @param {*} ipInfo ip information
 * @param {*} chain chain with results
 * @param {*} type type of results
 */
const updateSearchResult = async(ipAddress, ipInfo, chain, type) => {

  if(ipAddress !== "::1") {
    let searchResult = {
      country: ipInfo.country, 
      region: ipInfo.region, 
      city: ipInfo.city, 
      metro: ipInfo.metro,
      timezone: ipInfo.timezone, 
      chain: chain,
      searchAt: helperSvc.getUnixTS(),
      searchType: type
    };
    await db.postSearchResult(searchResult);
  }
}

/**
 * Get search counts by country
 */
const getResultsByCountry = async() => {    
    const results = await db.getSearchResults();

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

    return counts;
}

/**
 * Get search counts by region
 * 
 * @param {*} country country to filter on (optional)
 */
const getResultsByRegion = async(country = null) => {    
    const results = await db.getSearchResults();

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
    
    return counts;
}

/**
 * Get search counts by city
 * 
 * @param {*} country country to filter on (optional)
 * @param {*} region region to filter on (optional)
 */
const getResultsByCity = async(country = null, region = null) => {
    const results = await db.getSearchResults();

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
    
    return counts;
}

/**
 * Get search counts by timezone
 */
const getResultsByTimezone = async() => {    
    const results = await db.getSearchResults();

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

    return counts;
}

module.exports = {
    updateSearchResult,
    getResultsByCountry,
    getResultsByRegion,
    getResultsByCity,
    getResultsByTimezone
}

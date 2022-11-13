import React, { useEffect, useState } from 'react';
import {getEBirdTaxonomy, getIpGeo} from './api_functions'

import BirdSearchBar from './bird_search_bar';
import BirdResults from './bird_results';

const BirdApp = (props) => {
    const [taxonomy, setTaxonomy] = useState({});
    const [taxonomyLoaded, setTaxonomyLoaded] = useState(false);
    const [taxonomyError, setTaxonomyError] = useState(null);
  
    const [ipGeoError, setIpGeoError] = useState(null);
  
    const [searchAttributes, setSearchAttributes] = useState(
      {
        areaCode: null,
        speciesCode: null,
        lattitude: null,
        longitude: null,
        searchNotable: false
      }
    );
    const [searchReady, setSearchReady] = useState(false);
  
    useEffect( () => {
      getEBirdTaxonomy().catch((error) => {
        setTaxonomyError(error);
        setTaxonomyLoaded(true);
      })
      .then((data) => {
        const data_filtered = data.map(species => species = {comName: species.comName, sciName: species.sciName, speciesCode: species.speciesCode});
        setTaxonomy(data_filtered);
        setTaxonomyLoaded(true);
      })
    }, []);
  
    useEffect( () => {
      if(searchAttributes.areaCode === null && searchAttributes.lattitude === null && searchAttributes.longitude === null) {
        getIpGeo().catch((error) => {
          setIpGeoError(error);
          // in case of error assign some default values
          const newSearchAttributes =  {...searchAttributes};
          newSearchAttributes.areaCode = "GB";
          newSearchAttributes.lattitude = 55.95;
          newSearchAttributes.longitude = 3.19;
          setSearchAttributes(newSearchAttributes);
          setSearchReady(true);
        })
        .then((data) => {
          const newSearchAttributes =  {...searchAttributes};
          newSearchAttributes.areaCode = data.countryCode;
          newSearchAttributes.lattitude = Math.round(data.lat * 100) / 100;
          newSearchAttributes.longitude = Math.round(data.lon * 100) / 100;
          setSearchAttributes(newSearchAttributes);
          setSearchReady(true);
        })
      }
    }, [searchAttributes]);
  
    return (
      <div className="bird_app">
          <div className="intro_section">
            <h1> Welcome to BirdWatch (WIP) </h1>
            <p> BirdWatch is a project by <a href="https://github.com/OliveMcCullough"> Olive McCullough </a> that uses the eBird API, the Pixabay API, and a number of geolocation APIs to help you discover what birds can be found near you. </p>
          </div>
        <BirdSearchBar
          taxonomy={taxonomy}
          taxonomyLoaded={taxonomyLoaded}
          taxonomyError={taxonomyError}
          setSearchAttributes={setSearchAttributes}
          searchAttributes={searchAttributes}
          searchReady={searchReady}
        />
        <BirdResults
          searchAttributes={searchAttributes}
          searchReady={searchReady}
          taxonomy={taxonomy}
          taxonomyLoaded={taxonomyLoaded}
          taxonomyError={taxonomyError}
        />
      </div>
    )
  }

  export default BirdApp;
import React, { useEffect, useState } from 'react';
import {getRecentBirdObservations} from './api_functions'

const BirdResults = (props) => {
    const[results, setResults] = useState([]);
    const[error, setError] = useState(null);
    const[isLoaded, setIsLoaded] = useState(false);
  
    const[speciesInResults, setSpeciesInResults] = useState([]);
  
    // when given a search, search for it
    useEffect( () => {
      if(props.searchReady) {
        setResults([]);
        getRecentBirdObservations(props.searchAttributes).catch((error) => {
          setIsLoaded(true);
          setError(error);
        })
        .then((data) => {
          setIsLoaded(true);
          setResults(data);
        })
      }
    }, [props.searchAttributes, props.searchReady])
  
    // when new results are available, get a list of all species codes
    useEffect( () => {
      if(props.searchReady && props.taxonomyLoaded && typeof props.taxonomyError !== Error)
      {
        const newSpeciesCodesInResults = [];
        results.forEach(logEntry => {
          if (!newSpeciesCodesInResults.includes(logEntry.speciesCode)) {
            newSpeciesCodesInResults.push(logEntry.speciesCode);
          }
        });
        const newSpeciesInResults = props.taxonomy.filter(speciesEntry => newSpeciesCodesInResults.includes(speciesEntry.speciesCode))
  
        setSpeciesInResults(newSpeciesInResults);
      }
    }, [results, props.searchReady, props.taxonomy, props.taxonomyLoaded, props.taxonomyError])
  
    return (
      <ul>
        {results.map(birdObservation => (
          <li key={birdObservation.subId+birdObservation.speciesCode}> {birdObservation.comName} ({birdObservation.sciName}) - {birdObservation.howMany} - {birdObservation.locName} - {birdObservation.lat}, {birdObservation.lng} - {birdObservation.obsDt} </li>
        ))}
      </ul>
    )
  }

  export default BirdResults;
import React, { useEffect, useState, Fragment } from 'react';
import {getRecentBirdObservations, getPixabay} from './api_functions'
import { SearchAttributes, Taxonomy } from './interfaces';

interface BirdResultsProps {
  taxonomyError: Error | undefined;
  searchReady: Boolean;
  searchAttributes: SearchAttributes;
  taxonomyLoaded: Boolean;
  taxonomy: Taxonomy;
}

interface ObservationResult {
  subId: string;
  speciesCode: string;
  comName: string;
  sciName: string;
  howMany: number;
  locName: string;
  lat: number;
  lng: number;
  obsDt: string;
}

interface FoundImageData {
  webformatURL: string;
  tags: string;
}

type SpeciesCodeImageDict = {[key:string]:string|undefined};

const BirdResults = (props: BirdResultsProps) => {
    const[results, setResults] = useState<ObservationResult[]>([]);
    const[error, setError] = useState<Error | undefined>(undefined);
    const[isLoaded, setIsLoaded] = useState<Boolean>(false);
  
    const[speciesInResults, setSpeciesInResults] = useState<Taxonomy>([]);
    const[speciesCodeImagesDict, setSpeciesCodeImagesDict] = useState<SpeciesCodeImageDict>({});
  
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
      if(props.searchReady && props.taxonomyLoaded && !(props.taxonomyError instanceof Error))
      {
        const newSpeciesCodesInResults:string[] = [];
        results.forEach(logEntry => {
          if (!(newSpeciesCodesInResults.includes(logEntry.speciesCode))) {
            newSpeciesCodesInResults.push(logEntry.speciesCode);
          }
        });
        // add full species to list if it is included in newly created species code array
        const newSpeciesInResults = props.taxonomy.filter(speciesEntry => newSpeciesCodesInResults.includes(speciesEntry.speciesCode))

        setSpeciesInResults(newSpeciesInResults);
      }
    }, [results, props.searchReady, props.taxonomy, props.taxonomyLoaded, props.taxonomyError])

    // get images for each species that isn't included in the species code to image dictionary
    useEffect( () => {
      const notIncluded = speciesInResults.filter((speciesEntry) => !Object.keys(speciesCodeImagesDict).includes(speciesEntry.speciesCode))
      // if some images lists are not included in the dictionary
      if (notIncluded.length > 0) {
        // make a request to the API to add the first one in
        const keyword = `${notIncluded[0].comName} (${notIncluded[0].sciName})`
        getPixabay(keyword).catch((error) => {
          // error handling
          console.log(error)
        })
        .then((data) => {
          // check there are hits
          if(data.hits.length > 0) {
            // find the best entry:
            let result;
            // first, within the data, look through tags for scientific name
            result = data.hits.find((hit:FoundImageData) => {
              return hit.tags.toLowerCase().includes(notIncluded[0].sciName.toLowerCase());
            });
            // then if not found, try formal common name
            if(result === undefined) {
              result = data.hits.find((hit:FoundImageData) => {
                return hit.tags.toLowerCase().includes(notIncluded[0].comName.toLowerCase());
              });
            }
            // if still not found, use first entry
            if(result === undefined) {
              result = data.hits[0];
            }
            const newSpeciesCodeImagesDict = {...speciesCodeImagesDict};
            newSpeciesCodeImagesDict[notIncluded[0].speciesCode] = result.webformatURL;
            setSpeciesCodeImagesDict(newSpeciesCodeImagesDict);
          } else {
            // update the array with no image
            const newSpeciesCodeImagesDict = {...speciesCodeImagesDict};
            newSpeciesCodeImagesDict[notIncluded[0].speciesCode] = undefined;
            setSpeciesCodeImagesDict(newSpeciesCodeImagesDict);
          }
        })
      }
    }, [speciesInResults, speciesCodeImagesDict])
  
    return (
      <Fragment>
        <div className="speciesDisplay">
          {speciesInResults.map(speciesInstance => (
            <div key={speciesInstance.speciesCode} className="polaroid"> <div className={typeof speciesCodeImagesDict[speciesInstance.speciesCode] === "string"?"":"hidden"}> <img src={speciesCodeImagesDict[speciesInstance.speciesCode]}/> </div> <span className="common">{speciesInstance.comName} </span> <span className="scientific"> ({speciesInstance.sciName})</span> </div>
          ))}
        </div>
        <ul>
          {results.map(result => (
            <li key={result.subId+result.speciesCode}> {result.comName} ({result.sciName}) - {result.howMany} - {result.locName} - {result.lat}, {result.lng} - {result.obsDt} </li>
          ))}
        </ul>
      </Fragment>
    )
  }

  export default BirdResults;
import React, { useEffect, useState, Fragment } from 'react';
import {getRecentBirdObservations, getPixabay} from './api_functions'
import BirdSightingsList from './bird_sightings_list';
import { ObservationResult, SearchAttributes, SpeciesCodeImageDict, Taxonomy } from './interfaces';
import BirdSpeciesInResultsList from './bird_species_in_results_list';

interface BirdResultsProps {
  taxonomyError: Error | undefined;
  searchReady: Boolean;
  searchAttributes: SearchAttributes;
  taxonomyLoaded: Boolean;
  taxonomy: Taxonomy;
}

interface FoundImageData {
  webformatURL: string;
  tags: string;
}

const BirdResults = (props: BirdResultsProps) => {
    const[results, setResults] = useState<ObservationResult[]>([]);
    const[error, setError] = useState<Error | undefined>(undefined);
    const[isLoaded, setIsLoaded] = useState<Boolean>(false);
  
    const[speciesInResults, setSpeciesInResults] = useState<Taxonomy>([]);
    const[speciesFiltered, setSpeciesFiltered] = useState<string[]>([])
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
      if(props.searchReady && props.taxonomyLoaded && !(props.taxonomyError instanceof Error)) {
        const newSpeciesCodesInResults:string[] = [];
        results.forEach(logEntry => {
          if (!(newSpeciesCodesInResults.includes(logEntry.speciesCode))) {
            newSpeciesCodesInResults.push(logEntry.speciesCode);
          }
        });
        // add full species to list if it is included in newly created species code array
        const newSpeciesInResults = props.taxonomy.filter(speciesEntry => newSpeciesCodesInResults.includes(speciesEntry.speciesCode))

        // reset SpeciesFiltered
        setSpeciesFiltered([]);

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

    const addSpeciesToFilter = (event:React.MouseEvent<HTMLDivElement>, speciesCode: string) => {
      const newSpeciesFiltered = [...speciesFiltered];
      if(newSpeciesFiltered.includes(speciesCode)) {
        const index = newSpeciesFiltered.indexOf(speciesCode);
        newSpeciesFiltered.splice(index, 1)
      } else {
        newSpeciesFiltered.push(speciesCode);
      }
      setSpeciesFiltered(newSpeciesFiltered);
    }
  
    return (
      <Fragment>
        {results.length > 0 &&
        <>
          <BirdSpeciesInResultsList addSpeciesToFilter={addSpeciesToFilter} speciesFiltered={speciesFiltered} speciesInResults={speciesInResults} speciesCodeImagesDict={speciesCodeImagesDict}></BirdSpeciesInResultsList>
          <BirdSightingsList speciesFiltered={speciesFiltered} results={results}></BirdSightingsList>
        </>}
      </Fragment>
    )
  }

  export default BirdResults;
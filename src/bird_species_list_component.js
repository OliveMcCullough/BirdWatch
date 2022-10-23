import React, { useEffect, useState } from 'react';
import {getRegionSpeciesList} from './api_functions'

const BirdSpeciesListComponent = (props) => {
    const [searchText, setSearchText] = useState("");
    const [speciesDisplayed, setSpeciesDisplayed] = useState([]);
  
    const [speciesList, setSpeciesList] = useState([]);
    const [speciesError, setSpeciesError] = useState(null);
    const [speciesLoaded, setSpeciesLoaded] = useState(false);
  
    // if taxonomy is present, get the local species list based on areaCode
    // use taxonomy to get human readable information from speciesCodes list
    useEffect( () => {
      if(props.taxonomyLoaded && typeof props.taxonomyError !== Error)
      {
        setSpeciesList([]);
        getRegionSpeciesList(props.areaCode).catch((error) => {
          setSpeciesError(error);
          setSpeciesLoaded(true);
        })
        .then((data) => {
          const localSpecies = props.taxonomy.filter(speciesEntry => data.includes(speciesEntry.speciesCode));
          setSpeciesList(localSpecies);
          setSpeciesLoaded(true);
        })
      }
    }, [props.taxonomyLoaded, props.taxonomyError, props.taxonomy, props.areaCode])
  
    // when local species have been defined or re-defined
    useEffect( () => {
  
      const getSpeciesDisplayed = (searchText) => {
        if(searchText === "") {
          return [];
        }
        return speciesList.filter((speciesEntry) => ((`${speciesEntry.comName} (${speciesEntry.sciName})`).toLowerCase().includes(searchText.toLowerCase())));
      }
  
      const speciesDisplayed = getSpeciesDisplayed(searchText);
      setSpeciesDisplayed(speciesDisplayed);
  
    }, [speciesList, searchText]);
  
    const updateSearchText = (event) => {
      const searchText = event.target.value;
      //const speciesDisplayed = getSpeciesDisplayed(searchText);
      setSearchText(searchText);
      //setSpeciesDisplayed(speciesDisplayed);
      props.setSelectedSpecies({name: null, code: null});
    }
  
    const selectSpeciesHandler = (event) => {
      const speciesCode = event.target.getAttribute("data-species-code");
      const speciesName = event.target.textContent;
      props.setSelectedSpecies({name: speciesName, code: speciesCode});
    }
  
    const render = () => {
      const dropDownOpen = speciesDisplayed.length > 0 && props.selectedSpecies.code === null;
      if(typeof props.selectedSpecies.code !== "string") {
          return (
            <div className="bird-species-search-tool"> 
              <input type="text" className={dropDownOpen?"open":""} value={searchText} onChange={event => updateSearchText(event)}/>
              <div className="drop-down-menu">
                <div className="drop-down-scroll-container">
                  <div>
                    {speciesDisplayed.slice(0,10).map(speciesEntry => (
                        <button 
                          key={speciesEntry.speciesCode} 
                          className="species-option" 
                          data-species-code={speciesEntry.speciesCode}
                          onClick={(event) => selectSpeciesHandler(event)}
                        > 
                          {speciesEntry.comName} ({speciesEntry.sciName}) 
                        </button>
                    ))}
                  </div>
                </div>
              </div>
            </div> 
          )
      } else {
        return (
          <div className="bird-species-search-tool"> 
            <input type="text" className={dropDownOpen?"open":""} value={props.selectedSpecies.name} onChange={event => updateSearchText(event)}/>
          </div> 
        )
      }
    }
  
    return (
      render()
    )
}

export default BirdSpeciesListComponent;

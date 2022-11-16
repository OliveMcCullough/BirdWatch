import { useEffect, useState } from 'react';
import {getRegionSpeciesList} from './api_functions'
import { SelectedSpecies, Taxonomy } from './interfaces';

interface BirdSpeciesListComponentProps {
  taxonomyLoaded: Boolean;
  taxonomyError: Error | undefined;
  areaCode: string | undefined;
  taxonomy: Taxonomy;
  selectedSpecies: SelectedSpecies;
  setSelectedSpecies: React.Dispatch<React.SetStateAction<SelectedSpecies>>;
}

const BirdSpeciesListComponent = (props:BirdSpeciesListComponentProps) => {
    const [searchText, setSearchText] = useState<string>("");
    const [speciesDisplayed, setSpeciesDisplayed] = useState<Taxonomy>([]);
  
    const [speciesList, setSpeciesList] = useState<Taxonomy>([]);
    const [speciesError, setSpeciesError] = useState<Error | undefined>(undefined);
    const [speciesLoaded, setSpeciesLoaded] = useState<Boolean>(false);
  
    // if taxonomy is present, get the local species list based on areaCode
    // use taxonomy to get human readable information from speciesCodes list
    useEffect( () => {
      if(props.taxonomyLoaded && !(props.taxonomyError instanceof Error) && props.areaCode)
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
  
      const getSpeciesDisplayed = (searchText:string) => {
        if(searchText === "") {
          return [];
        }
        return speciesList.filter((speciesEntry) => ((`${speciesEntry.comName} (${speciesEntry.sciName})`).toLowerCase().includes(searchText.toLowerCase())));
      }
  
      const speciesDisplayed = getSpeciesDisplayed(searchText);
      setSpeciesDisplayed(speciesDisplayed);
  
    }, [speciesList, searchText]);
  
    const updateSearchText = (event:React.ChangeEvent<HTMLInputElement>) => {
      const searchText = event.target.value;
      //const speciesDisplayed = getSpeciesDisplayed(searchText);
      setSearchText(searchText);
      //setSpeciesDisplayed(speciesDisplayed);
      props.setSelectedSpecies({name: undefined, code: undefined});
    }
  
    const selectSpeciesHandler = (event:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const target = event.target as HTMLButtonElement;
      if(!(target.getAttribute("data-species-code") && target.textContent)){
        return ;
      }
      let speciesCode:undefined|null|string = target.getAttribute("data-species-code");
      if (speciesCode === null) {
        speciesCode = undefined;
      }
      const speciesName = target.textContent;
      props.setSelectedSpecies({name: speciesName, code: speciesCode});
    }

    const renderBirdSpeciesSearchToolContent = (dropDownOpen:Boolean) => {
      if(typeof props.selectedSpecies.code !== "string") {
        return (
          <>
            <input type="text" className={dropDownOpen?"open":""} value={searchText} onChange={event => updateSearchText(event)}/>
            <div className="drop_down_menu">
              <div className="drop_down_scroll_container">
                <div>
                  {speciesDisplayed.slice(0,10).map(speciesEntry => (
                      <button 
                        key={speciesEntry.speciesCode} 
                        className="species_option" 
                        data-species-code={speciesEntry.speciesCode}
                        onClick={(event) => selectSpeciesHandler(event)}
                      > 
                        {speciesEntry.comName} ({speciesEntry.sciName}) 
                      </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )
      } else {
        return (
          <input type="text" className={dropDownOpen?"open":""} value={(typeof props.selectedSpecies.name === "string"?props.selectedSpecies.name:"")} onChange={event => updateSearchText(event)}/>
        )
      }
    }

    return (
      <div className="bird_species_search_tool">
        {renderBirdSpeciesSearchToolContent(speciesDisplayed.length > 0 && !props.selectedSpecies.code)}
      </div>
    )
}

export default BirdSpeciesListComponent;

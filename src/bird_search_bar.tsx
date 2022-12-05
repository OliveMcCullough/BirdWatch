import React, { useEffect, useState, Fragment } from 'react';
import {getCountryInfo} from './api_functions';

import BirdSpeciesListComponent from './bird_species_list_component';
import {Coords, SearchAttributes, SelectedSpecies, Taxonomy } from './interfaces';

interface BirdSearchBarProps {
  searchReady: Boolean;
  searchAttributes: SearchAttributes;
  setSearchAttributes: React.Dispatch<React.SetStateAction<SearchAttributes>>;
  taxonomy: Taxonomy;
  taxonomyLoaded: Boolean;
  taxonomyError: Error | undefined;
}

interface CountryData {
  name: string;
  code: string;
  coordinates: Coords;
}

type CountryCodeList = CountryData[];

type SearchFor = "all" | "species" | "notable";

type GeoType = "coordinates" | "area";

// Component that corresponds to search bar, and handles all the search criteria
const BirdSearchBar = (props:BirdSearchBarProps) => {
    const [localAreaCode, setLocalAreaCode] = useState<string | undefined>(undefined);
    const [localSpecies, setLocalSpecies] = useState<SelectedSpecies>({name: undefined, code: undefined});
    const [localLattitude, setLocalLattitude] = useState<number | undefined>(undefined);
    const [localLongitude, setLocalLongitude] = useState<number | undefined>(undefined);
    const [searchByGeoType, setSearchByGeoType] = useState<GeoType>("coordinates");
    const [searchFor, setSearchFor] = useState<SearchFor>("all");
    
    const [countryCodeList, setCountryCodeList] = useState<CountryCodeList>([]);
    const [countryListError, setCountryListError] = useState<Error | undefined>(undefined);
    const [countryListReady, setCountryListReady] = useState<Boolean>(true);
  
    const [exactLocationError, setExactLocationError] = useState<Error | undefined>(undefined);
  
    // run this once parent says the search is ready
    useEffect( () => {
      if(props.searchReady) {
        // if we don't have coordinates in the search results, extrapolate a base set of coordinates based on the country instead of using the ones that are available
        if(typeof props.searchAttributes.lattitude === "undefined" || typeof props.searchAttributes.longitude === "undefined") {
          const country = countryCodeList.find(country => country.code === props.searchAttributes.areaCode);
          if (country) {
            setLocalLattitude(country.coordinates.lattitude);
            setLocalLongitude(country.coordinates.longitude);
          }
        } else {
          setLocalLattitude(props.searchAttributes.lattitude);
          setLocalLongitude(props.searchAttributes.longitude);
        }
        setLocalAreaCode(props.searchAttributes.areaCode);
      }
    }, [props.searchReady, props.searchAttributes.areaCode, props.searchAttributes.lattitude, props.searchAttributes.longitude])
  
    // run this once to get all the countries from API
    useEffect( () => {
      getCountryInfo().catch((error) => {
        setCountryListError(error);
        setCountryListReady(true);
      })
      .then((data) => {
        const data_filtered = data.map((country:any) => country = {
          "name":country.name.common, 
          "code":country.cca2,
          "coordinates":{lattitude:(country.capitalInfo.latlng?country.capitalInfo.latlng[0]:country.latlng[0]), longitude:country.capitalInfo.latlng?country.capitalInfo.latlng[1]:country.latlng[1]}
        } as CountryData);
        const data_filterered_ordered = data_filtered.sort( (a:CountryData, b:CountryData) => {
          return a.name.localeCompare(b.name, "en", {sensitivity: "base"})
        })
        setCountryCodeList(data_filterered_ordered);
        setCountryListReady(true);
      })
    }, [])
  
    const checkSubmittable = () => {
      const checkGeoSubmittable = () => {
        if(searchByGeoType === "area") {
          if(localAreaCode) {
            return true;
          }
        } else if (searchByGeoType === "coordinates") {
          if(typeof localLattitude === "number" && typeof localLongitude === "number") {
            if(localLattitude >= -90 && localLattitude <= 90 && localLongitude >= -180 && localLongitude <= 180) {
              return true;
            }
          }
        }
        return false;
      }
  
      const checkSearchForSubmittable = () => {
        if(searchFor === "species") {
          if(localSpecies.code) {
            return true;
          }
        }
        else {
          return true;
        }
        return false;
      }
  
      return checkGeoSubmittable() && checkSearchForSubmittable();
    }
  
    const formSubmit = (event:React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if(checkSubmittable()) {
        const attributes:SearchAttributes = {
          areaCode: undefined,
          speciesCode: undefined,
          lattitude: undefined,
          longitude: undefined,
          searchNotable: false
        }
  
        if(searchByGeoType === "area") {
          attributes.areaCode = localAreaCode;
        } else if (searchByGeoType === "coordinates") {
          if(localLattitude && localLongitude) {
            attributes.areaCode = localAreaCode;
            attributes.lattitude = Math.round(localLattitude * 100) / 100;
            attributes.longitude = Math.round(localLongitude * 100) / 100;
          }
        }
  
        if(searchFor === "notable") {
          attributes.searchNotable = true;
        } else if (searchFor === "species") {
          attributes.speciesCode = localSpecies.code;
        }
  
        props.setSearchAttributes(attributes);
      }
    }
  
    const renderGeoTypeInput = () => {
      if(searchByGeoType === "coordinates") {
        return (
          <Fragment>
            <input type="number" min="-90" max="90" step="0.01" value={(typeof localLattitude == "number"? localLattitude:"")} onChange={(event) => (event.target.value===""?setLocalLattitude(undefined):setLocalLattitude(parseFloat(event.target.value)))}/>
            <input type="number" min="-180" max= "180" step="0.01" value={(typeof localLongitude == "number"? localLongitude:"")} onChange={(event) => (event.target.value===""?setLocalLongitude(undefined):setLocalLongitude(parseFloat(event.target.value)))}/>
            {navigator.geolocation?<button type="button" onClick={useExactLocationButtonHandler}> Use my exact location </button>:null}
          </Fragment>
        )
      } else if(searchByGeoType === "area" && localAreaCode) {
        return (
          <select value={localAreaCode} onChange={(event) => setLocalAreaCode(event.target.value)}>
            {countryCodeList.map(country => (
              <option value={country.code}> {country.name} </option>
            ))}
          </select>
        )
      }
    }
  
    const renderSearchForInput = () => {
      if(searchFor === "species") {
        return (
          <BirdSpeciesListComponent 
            taxonomy={props.taxonomy}
            taxonomyLoaded={props.taxonomyLoaded}
            taxonomyError={props.taxonomyError}
            areaCode={localAreaCode}
            setSelectedSpecies={setLocalSpecies}
            selectedSpecies={localSpecies}
          />
        )
      }
      return null;
    }
  
    const useExactLocationButtonHandler = (event:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const success = (position:GeolocationPosition) => {
        setLocalLattitude(Math.round(position.coords.latitude * 100) / 100);
        setLocalLongitude(Math.round(position.coords.longitude * 100) / 100);
      }
  
      const error = (error:GeolocationPositionError) => {
        // handle error
        setExactLocationError(Error(error.message));
      }
  
      navigator.geolocation.getCurrentPosition(success, error);
    }

    const setSearchGeoTypeHandler = (event:React.ChangeEvent<HTMLSelectElement>) => {
      const target = event.target; 
      const value = target.value;
      if(value === "coordinates" || value === "area") {
        setSearchByGeoType(value)
      }
    }

    const setSearchForHandler = (event:React.ChangeEvent<HTMLSelectElement>) => {
      const target = event.target; 
      const value = target.value;
      if(value === "all" || value === "species" || value === "notable") {
        setSearchFor(value)
      }
    }
  
    return (
      <form className="bird_search_bar" onSubmit={formSubmit}>
        <fieldset>
          <select value={searchByGeoType} onChange={(event) => setSearchGeoTypeHandler(event)}>
            <option value="coordinates">Coordinates</option>
            <option value="area">Country</option>
          </select>
          {renderGeoTypeInput()}
        </fieldset>
        <fieldset>
          <select value={searchFor} onChange={(event) => setSearchForHandler(event)}>
            <option value="all">All Species</option>
            <option value="species">Specic Species</option>
            <option value="notable">Notable Sightings</option>
          </select>
          {renderSearchForInput()}
        </fieldset>
        <button type="submit" disabled={!checkSubmittable()}> Apply </button>
      </form>
    )
  }

  export default BirdSearchBar;
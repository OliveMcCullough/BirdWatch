import React, { useEffect, useState, Fragment } from 'react';
import {getCountryInfo} from './api_functions';

import BirdSpeciesListComponent from './bird_species_list_component';

// Component that corresponds to search bar, and handles all the search criteria
const BirdSearchBar = (props) => {
    const [localAreaCode, setLocalAreaCode] = useState(null);
    const [localSpecies, setLocalSpecies] = useState({name: null, code: null});
    const [localLattitude, setLocalLattitude] = useState(null);
    const [localLongitude, setLocalLongitude] = useState(null);
    const [searchByGeoType, setSearchByGeoType] = useState("coordinates");
    const [searchFor, setSearchFor] = useState("all");
    
    const [countryCodeList, setCountryCodeList] = useState([]);
    const [countryListError, setCountryListError] = useState(null);
    const [countryListReady, setCountryListReady] = useState(true);
  
    const [exactLocationError, setExactLocationError] = useState(null);
  
    // run this once parent says the search is ready
    useEffect( () => {
      if(props.searchReady) {
        setLocalAreaCode(props.searchAttributes.areaCode);
        setLocalLattitude(props.searchAttributes.lattitude);
        setLocalLongitude(props.searchAttributes.longitude);
      }
    }, [props.searchReady, props.searchAttributes.areaCode, props.searchAttributes.lattitude, props.searchAttributes.longitude])
  
    // run this once to get all the countries from API
    useEffect( () => {
      getCountryInfo().catch((error) => {
        setCountryListError(error);
        setCountryListReady(true);
      })
      .then((data) => {
        const data_filtered = data.map(country => country = {"name":country.name.common, "code":country.cca2});
        const data_filterered_ordered = data_filtered.sort( (a, b) => {
          return a.name.localeCompare(b.name, "en", {sensitivity: "base"})
        })
        setCountryCodeList(data_filterered_ordered);
        setCountryListReady(true);
      })
    }, [])
  
    const checkSubmittable = () => {
      const checkGeoSubmittable = () => {
        if(searchByGeoType === "area") {
          if(localAreaCode !== null) {
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
          if(localSpecies.code !== null) {
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
  
    const formSubmit = (event) => {
      event.preventDefault();
      if(checkSubmittable()) {
        const attributes = {
          areaCode: null,
          speciesCode: null,
          lattitude: null,
          longitude: null,
          searchNotable: false
        }
  
        if(searchByGeoType === "area") {
          attributes.areaCode = localAreaCode;
        } else if (searchByGeoType === "coordinates") {
          attributes.areaCode = localAreaCode;
          attributes.lattitude = Math.round(localLattitude * 100) / 100;
          attributes.longitude = Math.round(localLongitude * 100) / 100;
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
            <input type="number" min="-90" max="90" step="0.01" value={localLattitude} onChange={(event) => (event.target.value===""?setLocalLattitude(""):setLocalLattitude(parseFloat(event.target.value)))}/>
            <input type="number" min="-180" max= "180" step="0.01" value={localLongitude} onChange={(event) => (event.target.value===""?setLocalLongitude(""):setLocalLongitude(parseFloat(event.target.value)))}/>
            {navigator.geolocation?<button type="button" onClick={useExactLocationButtonHandler}> Use my exact location </button>:null}
          </Fragment>
        )
      } else if(searchByGeoType === "area") {
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
  
    const useExactLocationButtonHandler = (event) => {
      const success = (position) => {
        setLocalLattitude(Math.round(position.coords.latitude * 100) / 100);
        setLocalLongitude(Math.round(position.coords.longitude * 100) / 100);
      }
  
      const error = (position) => {
        // handle error
      }
  
      navigator.geolocation.getCurrentPosition(success, error);
    }
  
    return (
      <form className="bird-search-bar" onSubmit={formSubmit}>
        <fieldset>
          <select value={searchByGeoType} onChange={(event) => setSearchByGeoType(event.target.value)}>
            <option value="coordinates">Coordinates</option>
            <option value="area">Country</option>
          </select>
          {renderGeoTypeInput()}
        </fieldset>
        <fieldset>
          <select value={searchFor} onChange={(event) => setSearchFor(event.target.value)}>
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
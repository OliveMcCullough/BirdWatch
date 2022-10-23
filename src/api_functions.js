export const getRecentBirdObservations = async (attributes) => {

    // # Other attributes that could be used: distance (if not area), days since

    const { speciesCode, areaCode, lattitude, longitude, searchNotable} = attributes;
    if(typeof lattitude === "number" && typeof longitude === "number") {
        if(typeof speciesCode === "string") {
            /*
            if(searchNearest) {
                // nearest observations of a species 
                // #NEAREST #SPECIES #LATTITUDE #LONGITUDE
                return getBirdData(`nearest/geo/recent/${speciesCode}?lat=${lattitude}&lng=${longitude}`);
            } else {
                // recent nearby observations of a species
                // #SPECIES #LATTITUDE #LONGITUDE
                return getBirdData(`obs/geo/recent/${speciesCode}?lat=${lattitude}&lng=${longitude}`);
            }
            */
            return getBirdData(`obs/geo/recent/${speciesCode}?lat=${lattitude}&lng=${longitude}`);

        } else {
            if(searchNotable) {
                // recent nearby notable observations
                // #NOTABLE #LATTITUDE #LONGITUDE
                return getBirdData(`obs/geo/recent/notable?lat=${lattitude}&lng=${longitude}`);
            } else {
                // recent nearby observations
                // #LATTITUDE #LONGITUDE
                return getBirdData(`obs/geo/recent?lat=${lattitude}&lng=${longitude}`);
            }
        }
    } else {
        if(typeof areaCode === "string") {
            if(typeof speciesCode === "string") {
            // recent observations of a species in a region
            // #REGION #SPECIES
            return getBirdData(`obs/${areaCode}/recent/${speciesCode}`);
            } else {
                if (searchNotable) {
                // recent notable observations in a region
                // #REGION #NOTABLE
                return getBirdData(`obs/${areaCode}/recent/notable`);
                } else {
                // recent observations in a region
                // #REGION
                return getBirdData(`obs/${areaCode}/recent`);
                }
            }
        }
    }
};

const getBirdData = async (url_data) => {
    const response = await fetch(`https://api.ebird.org/v2/data/${url_data}`, {
        method: "GET",
        withCredentials: true,
        headers: {
            "X-eBirdApiToken": process.env.REACT_APP_EBIRD_API_KEY
        }
    })
    if(!response.ok) {
        throw new Error("Bad response");
    }
    const data = await response.json();
    return data;
}

export const getIpGeo = async () => {
    const response = await fetch("https://api.techniknews.net/ipgeo/");
    if(!response.ok) {
        throw new Error("Bad response");
    }
    const data = await response.json();
    return data;
}

export const getEBirdTaxonomy = async () => {
    const response = await fetch("https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json", {
        method: "GET",
        withCredentials: true,
        headers: {
        "X-eBirdApiToken": process.env.REACT_APP_EBIRD_API_KEY
        }
    })
    if(!response.ok) {
        throw new Error("Bad response");
    }
    const data = await response.json();
    return data;
    }

    export const getCountryInfo = async () => {
    const response = await fetch("https://restcountries.com/v3.1/all");
    if(!response.ok) {
        throw new Error("Bad response");
    }
    const data = await response.json();
    return data;
}

export const getRegionSpeciesList = async (regionCode) => {
    const response = await fetch(`https://api.ebird.org/v2/product/spplist/${regionCode}`, {
        method: "GET",
        withCredentials: true,
        headers: {
        "X-eBirdApiToken": process.env.REACT_APP_EBIRD_API_KEY
        }
    })
    if(!response.ok) {
        throw new Error("Bad response");
    }
    const data = await response.json();
    return data;
}
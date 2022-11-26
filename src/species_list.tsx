import { Fragment } from "react";
import { SpeciesCodeImageDict, Taxonomy } from "./interfaces";


interface SpeciesListProps {
    speciesInResults: Taxonomy;
    speciesCodeImagesDict: SpeciesCodeImageDict;
}

const SpeciesList = (props: SpeciesListProps) => {
    return (
        <Fragment>
            <h2> Species </h2>
            <div className="speciesDisplay">
                {props.speciesInResults.map(speciesInstance => (
                    <div key={speciesInstance.speciesCode} className="polaroid"> <div className={typeof props.speciesCodeImagesDict[speciesInstance.speciesCode] === "string"?"":"hidden"}> <img src={props.speciesCodeImagesDict[speciesInstance.speciesCode]}/> </div> <span className="common_name">{speciesInstance.comName} </span> <span className="scientific_name"> ({speciesInstance.sciName})</span> </div>
                ))}
            </div>
        </Fragment>
    )
}

export default SpeciesList;
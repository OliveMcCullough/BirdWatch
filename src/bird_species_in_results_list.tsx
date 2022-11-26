import { Fragment, useState } from "react";
import { SpeciesCodeImageDict, Taxonomy } from "./interfaces";


interface SpeciesListProps {
    speciesInResults: Taxonomy;
    speciesCodeImagesDict: SpeciesCodeImageDict;
    addSpeciesToFilter: (event: React.MouseEvent<HTMLDivElement>, speciesCode:string) => void;
    speciesFiltered: string[];
}

const BirdSpeciesInResultsList = (props: SpeciesListProps) => {
    const [accordionOpen, setAccordionOpen] = useState(false);

    const toggleAccordion = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        // toggle the accordion open value
        setAccordionOpen(!accordionOpen)

        // also, move display scroll back to top
        const button = event.currentTarget;
        const fullDisplay = button.parentElement;
        if (fullDisplay !== null) {
            const collaspableDisplay = fullDisplay.querySelector(".speciesDisplayCollapsableContent");
            if(collaspableDisplay !== null) {
                collaspableDisplay.scrollTop = 0;
            }
        }
        
    }

    return (
        <Fragment>
            {props.speciesInResults.length > 0 &&
            <>
                <div className="speciesDisplay">
                    <h2> Here are some of the species that have been spotted recently </h2>
                    <p> Expand and select which species you want to filter for in the results </p>
                    <div className={`speciesDisplayCollapsableContent ${(accordionOpen?"opened":"closed")}`}>
                        {props.speciesInResults.map(speciesInstance => (
                            <div 
                                key={speciesInstance.speciesCode} 
                                className={`polaroid${(props.speciesFiltered.includes(speciesInstance.speciesCode)?" selected":"")}`} 
                                onClick={(accordionOpen?(event) => props.addSpeciesToFilter(event, speciesInstance.speciesCode):()=>{})}
                            > 
                                <div className={typeof props.speciesCodeImagesDict[speciesInstance.speciesCode] === "string"?"":"hidden"}> 
                                    <img src={props.speciesCodeImagesDict[speciesInstance.speciesCode]}/> 
                                </div> 
                                <span className="common_name">{speciesInstance.comName} </span> 
                                <span className="scientific_name"> ({speciesInstance.sciName})</span> 
                            </div>
                        ))}
                    </div>
                    <button onClick={(event) => toggleAccordion(event)}>{(accordionOpen?"Collapse":"Expand")}</button>
                </div>
            </>}
        </Fragment>
    )
}

export default BirdSpeciesInResultsList;
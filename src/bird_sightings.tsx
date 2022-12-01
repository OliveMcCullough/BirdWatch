import { useEffect, useState } from "react";
import BirdSightingsMapDisplay from "./bird_sightings_map";
import { ObservationResult } from "./interfaces";

interface BirdSightingsProps {
    results: ObservationResult[];
    speciesFiltered: string[];
}

const addOrdinalIndicator = (dayNum: number) => {
    switch (dayNum % 10) {
        case 1:
            return dayNum + "st";
        break;
        case 2:
            return dayNum + "nd";
        break;
        case 3:
            return dayNum + "rd";
        break;
        default:
            return dayNum + "th";
        break;
    }
}

const formaliseDate = (YearMonthDayHoursMinutes:string) => {
    const date = new Date(YearMonthDayHoursMinutes);
    const monthOnlyOptions:Intl.DateTimeFormatOptions = { month: 'long'};
    const month = new Intl.DateTimeFormat('en-US', monthOnlyOptions).format(date);
    const day = addOrdinalIndicator(date.getDate());
    const time = date.toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'});

    return `${month} ${day} ${date.getFullYear()} at ${time}`;
}

const BirdSightings = (props: BirdSightingsProps) => {
    const [filteredResults, setFilteredResults] = useState<ObservationResult[]>([]);

    useEffect(() => {
        if(props.speciesFiltered.length == 0) {
            setFilteredResults(props.results)
        } else {
            const newFilteredResults = props.results.filter(result => props.speciesFiltered.includes(result.speciesCode));
            setFilteredResults(newFilteredResults)
        }
    }, [props.results, props.speciesFiltered])

    return (
        <div className="sightingsDisplay">
            <div className="binderRings"> </div>
            <div className="sightingsContent">
                <ul className="sightingsList">
                    {filteredResults.map(result => (
                    <li key={result.subId+result.speciesCode}> <span className="common_name">{result.comName}</span> <span className="scientific_name">({result.sciName})</span> <br/>
                    {(result.howMany?`${result.howMany}  spotted`:"Spotted")} around {result.locName} ({result.lat.toFixed(3)}, {result.lng.toFixed(3)}) on {formaliseDate(result.obsDt)} </li>
                    ))}
                </ul>
                <BirdSightingsMapDisplay filteredResults={filteredResults}></BirdSightingsMapDisplay>
            </div>
        </div>
    )
}

export default BirdSightings;
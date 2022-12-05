import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon, LatLngBoundsExpression } from "leaflet";
import 'leaflet/dist/leaflet.css';
import { ObservationResult, Coords } from './interfaces';
import { useEffect, useState } from 'react';

const icon = new Icon({
    iconUrl: "BirdMapIcon.png",
    iconSize: [29, 28],
    iconAnchor: [10, 28],
    popupAnchor: [0, -22],
})

interface BirdSightingsMapDisplayProps {
    filteredResults: ObservationResult[];
}

interface IconData {
    coordinates: Coords;
    datedContentSet: DatedContent[];
}

interface DatedContent {
    date: Date;
    content: string[];
}

const BirdSightingsMapDisplay = (props:BirdSightingsMapDisplayProps) => {

    const [iconDataSet, setIconDataSet] = useState<IconData[]>([]);
    const [bounds, setBounds] = useState<LatLngBoundsExpression|undefined>(undefined);

    // organise the data so that it can be displayed as the smallest possible amount of icons that exactly cover every set of coordinates birds have been spotted
    // the text content of each icon organised by datetime
    useEffect(() => {
        const newIconDataSet:IconData[] = [];
        props.filteredResults.forEach(result => {
            let sightingContent = `${(result.howMany?result.howMany:"")} ${result.comName} (${result.sciName})`;
            let sightingDate = new Date(result.obsDt);
            const existingCoordIndex = newIconDataSet.findIndex((iconData) => iconData.coordinates.lattitude === result.lat && iconData.coordinates.longitude === result.lng)
            if(existingCoordIndex === -1) {
                newIconDataSet.push({coordinates:{lattitude:result.lat, longitude: result.lng}, datedContentSet:[{date:sightingDate, content:[sightingContent]}]})
            } else {
                let datedContentSet = newIconDataSet[existingCoordIndex].datedContentSet;
                const existingDateIndex = datedContentSet.findIndex((datedContent) => datedContent.date.getTime() === sightingDate.getTime())
                if(existingDateIndex === -1) {
                    datedContentSet.push({date:sightingDate, content:[sightingContent]})
                } else {
                    datedContentSet[existingDateIndex].content.push(sightingContent);
                }
                datedContentSet.sort((dateContentA,dateContentB) => {
                    if (dateContentA.date > dateContentB.date) {
                        return -1;
                    } else if (dateContentA.date < dateContentB.date) {
                        return 1;
                    }
                    return 0;
                })
                newIconDataSet[existingCoordIndex].datedContentSet = datedContentSet;
            }
        });
        setIconDataSet(newIconDataSet);
    }, [props.filteredResults])

    // get the most extreme coordinates of the icon data set and deduce the center of the map
    // also set the coordinates as the bounds of the map
    useEffect(() => {
        if(iconDataSet.length > 0) {
            const lattitudes = iconDataSet.map((iconData) => iconData.coordinates.lattitude);
            const longitudes = iconDataSet.map((iconData) => iconData.coordinates.longitude);
            const minLat = Math.min.apply(null, lattitudes);
            const minLng = Math.min.apply(null, longitudes);
            const maxLat = Math.max.apply(null, lattitudes)
            const maxLng = Math.max.apply(null, longitudes);
            setBounds([[minLat,minLng],[maxLat,maxLng]]);
        }
    },[iconDataSet])

    return (
        <div className="birdSightingMapDisplay">
            {bounds && <MapContainer bounds={bounds} scrollWheelZoom={true}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {iconDataSet.map(iconData => (
                <Marker position={[iconData.coordinates.lattitude, iconData.coordinates.longitude]} icon={icon}>
                    {iconData && <Popup>
                        {iconData.datedContentSet.map((datedContent) => (<div> 
                            {datedContent.date.toLocaleDateString('en-GB', {})} {datedContent.date.toLocaleTimeString('en-GB', {})}
                            <ul>
                                {datedContent.content.map((sightingContent) => (<li>{sightingContent}</li>))}
                            </ul>
                        </div>))}
                        
                    </Popup>}
                </Marker>
            ))}

            </MapContainer>}
        </div>
    )
}

export default BirdSightingsMapDisplay;
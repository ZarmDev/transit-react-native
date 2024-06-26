import React, { useState, useEffect, useRef } from 'react';
import GtfsRealTimeBindings from 'gtfs-realtime-bindings';
import { Text } from 'react-native'

const language = 'en';

export default function ServiceAlerts() {
    const [data, setData] = useState("loading");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts", {});
                if (!response.ok) {
                    const error = new Error(`${response.url}: ${response.status} ${response.statusText}`);
                    throw error;
                }
                const buffer = await response.arrayBuffer();
                // Convert ArrayBuffer to Uint8Array
                const uint8Array = new Uint8Array(buffer);
                const feed = GtfsRealTimeBindings.transit_realtime.FeedMessage.decode(uint8Array);
                // Go to strange entity key in the object
                const processed = feed["entity"]
                // setData(feed)
                let d = "";
                for (var i = 0; i < processed.length; i++) {
                    // console.log(processed[i])
                    const id = processed[i]["id"]
                    // console.log(alert);
                    if (processed[i]["alert"] != undefined) {
                        const alert = processed[i]["alert"]
                        if (alert["descriptionText"] != undefined) {
                            const description = alert["descriptionText"]
                            const translation = description["translation"]
                            const text = translation[0]["text"]
                            // console.log(translation[0], 'a');
                            d += text + '\n';
                        }
                    }
                    d += '\n'
                }
                // console.log(d);
                setData(d);
                // console.log(processed);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };

        fetchData();
    }, []); // Dependencies array, if needed

    return (
        <Text>{data}</Text>
    );
}
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import GtfsRealTimeBindings from 'gtfs-realtime-bindings';
export function parseAndReturnFeed(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url, {
            method: 'GET',
            headers: {
            // ...
            },
        });
        if (!response.ok) {
            const error = new Error(`${response.url}: ${response.status} ${response.statusText}`);
            throw error;
        }
        const buffer = yield response.arrayBuffer();
        // Convert ArrayBuffer to Uint8Array
        const uint8Array = new Uint8Array(buffer);
        const feed = GtfsRealTimeBindings.transit_realtime.FeedMessage.decode(uint8Array);
        return feed;
    });
}
// not done
export function getTrainServiceAlerts(shouldIncludePlannedWork) {
    return __awaiter(this, void 0, void 0, function* () {
        // Partial is here so Typescript doesn't attack the compiler :( (To let the object be empty at first)
        var trainAlerts = {};
        const feed = yield parseAndReturnFeed("https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts");
        // Where all the data is. The other key is header, used for metadata
        const processed = feed["entity"];
        // writeToFile('save.txt', JSON.stringify(processed, null, 2))
        for (var i = 0; i < processed.length; i++) {
            // console.log(processed[i])
            const id = processed[i]["id"];
            // make sure the id is a current alert and not planned alert
            // console.log(id, !id.includes('lmm:alert'))
            if (!id.includes('lmm:alert')) {
                // console.log(id);
                break;
            }
            else {
                // console.log(id, true);
            }
            const alert = processed[i]["alert"];
            // make sure alert is not null/undefined
            if (alert) {
                const routesAffected = alert["informedEntity"];
                const header = alert["headerText"];
                if (header) {
                    const description = alert["descriptionText"];
                    const headerTextTranslation = header["translation"];
                    const descriptionTranslation = description == null ? null : description["translation"];
                    if (headerTextTranslation) {
                        // you can either use index 0 or 1 which either gives you the normal version or version in HTML
                        const headerText = headerTextTranslation[1]["text"];
                        if (routesAffected) {
                            // loop through each route affected
                            console.log(routesAffected, i);
                            for (var j = 0; j < routesAffected.length; j++) {
                                const routeId = routesAffected[j]['routeId'];
                                if (routeId) {
                                    var descriptionText = null;
                                    if (descriptionTranslation != null) {
                                        descriptionText = descriptionTranslation[1]["text"];
                                    }
                                    trainAlerts[routeId] = { "headerText": headerText, "descriptionText": descriptionText };
                                    // for (var i = 0; i < routesAffected.length; i++) {
                                    //     const routeId = routesAffected[i]['routeId']
                                    //     trainAlerts[routeId] = `${headerText} \n${descriptionText}`
                                    // }
                                }
                            }
                        }
                    }
                }
            }
        }
        return trainAlerts;
    });
}
export function unixTimestampToDateTime(unixTimestamp) {
    // generated by AI cuz im lazy
    const milliseconds = unixTimestamp * 1000; // Convert seconds to milliseconds
    const date = new Date(milliseconds);
    return date;
}
export function getTrainArrivals(line, targetStopID, date, direction) {
    return __awaiter(this, void 0, void 0, function* () {
        var arrivals = [];
        let source = "";
        if (["A", "C", "E"].includes(line)) {
            source = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace";
        }
        else if (["B", "D", "F", "M"].includes(line)) {
            source = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm";
        }
        else if (["G"].includes(line)) {
            source = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g";
        }
        else if (["J", "Z"].includes(line)) {
            source = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz";
        }
        else if (["N", "Q", "R", "W"].includes(line)) {
            source = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw";
        }
        else if (["L"].includes(line)) {
            source = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l";
        }
        else if (["1", "2", "3", "4", "5", "6", "7"].includes(line)) {
            source = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs";
        }
        else if (["SIR"].includes(line)) {
            source = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si";
        }
        const feed = yield parseAndReturnFeed(source);
        // writeToFile('save.txt', JSON.stringify(feed, null, 2))
        // console.log(feed);
        // what are entities? idk :/
        const entities = feed["entity"];
        // just to get both the north and south arrivals and combine them
        var numOfDirections = 1;
        if (direction === "") {
            numOfDirections = 2;
        }
        for (var i = 0; i < entities.length; i++) {
            // trip data for each train? not sure
            const tripUpdate = entities[i]["tripUpdate"];
            if (tripUpdate == null || tripUpdate == undefined) {
                continue;
            }
            const trip = tripUpdate["trip"];
            const tripID = trip["tripId"];
            const routeID = trip["routeId"];
            // not sure if this works for all lines... maybe not working for SIR
            // console.log(routeID, line)
            if (routeID != line) {
                continue;
            }
            // all the arrivals for each stop in stops.txt (google_transit folder)
            const stopTimeUpdate = tripUpdate["stopTimeUpdate"];
            // make sure it's not null/undefined
            if (stopTimeUpdate) {
                for (let j = 0; j < stopTimeUpdate.length; j++) {
                    if (stopTimeUpdate[j]) {
                        var stopID = stopTimeUpdate[j]["stopId"];
                        if (stopID) {
                            // the stopID looks like "R20N" and it can either be
                            // R20, R20S, R20N representing the direction the arrival times are bound
                            let currentDirection = direction;
                            if (currentDirection == "") {
                                currentDirection = "N";
                            }
                            for (var z = 0; z < numOfDirections; z++) {
                                // just a complicated way to make sure it checks both directions if you want both directions
                                if (direction == "" && z == 1) {
                                    if (currentDirection == "N") {
                                        currentDirection = "S";
                                    }
                                    else {
                                        currentDirection = "N";
                                    }
                                }
                                // console.log(stopID, (targetStopID + currentDirection))
                                if (stopID === (targetStopID + currentDirection)) {
                                    const arrivalObject = stopTimeUpdate[j]["arrival"];
                                    if (arrivalObject) {
                                        const time = Number(arrivalObject["time"]);
                                        if (time) {
                                            // using .valueOf() to not annoy typescript: https://stackoverflow.com/questions/36560806/the-left-hand-side-of-an-arithmetic-operation-must-be-of-type-any-number-or
                                            const unixToDate = unixTimestampToDateTime(time).valueOf();
                                            const currentDate = date.valueOf();
                                            let timeDifference = unixToDate - currentDate;
                                            timeDifference = Math.round(timeDifference / (1000 * 60));
                                            arrivals.push({
                                                "arrivalTime": timeDifference,
                                                "direction": currentDirection,
                                                "line": line
                                            });
                                            // arrivals.push(`${line} arrives in ${timeDifference} minutes at ${realStopName} in the direction of ${}`)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return arrivals;
    });
}
export function getTrainLineShapes(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var trainLines = [];
        var splitByLine = data.split('\n');
        // if it's not even, then one line will be cut off
        for (var i = 1; i < splitByLine.length - 2; i += 2) {
            var splitByComma = splitByLine[i].split(',');
            var splitByComma2 = splitByLine[i + 1].split(',');
            trainLines.push({
                coordinates: [
                    { latitude: parseFloat(splitByComma[2]), longitude: parseFloat(splitByComma[3]) },
                    { latitude: parseFloat(splitByComma2[2]), longitude: parseFloat(splitByComma2[3]) }
                ]
            });
        }
        return trainLines;
    });
}
// supply a stops.txt as data
export function getAllTrainStopCoordinates(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var trainstops = {};
        // We can use this data and combine it with the other functions in getAllData
        const splitByLine = data.split('\n');
        for (var x = 0; x < splitByLine.length; x++) {
            if (splitByLine[x] == '') {
                continue;
            }
            const splitByComma = splitByLine[x].split(',');
            const [stop_id, stop_name, stop_lat, stop_lon, location_type, parent_station] = splitByComma;
            // console.log(stop_id);
            // if the last character doesn't indicate direction (bad for performance)
            if (!["N", "S"].includes(stop_id.slice(stop_id.length - 1, stop_id.length))) {
                trainstops[stop_id] = {
                    "stopname": stop_name,
                    "coordinates": {
                        latitude: parseFloat(stop_lat),
                        longitude: parseFloat(stop_lon)
                    },
                    "parent_station": parent_station
                };
            }
        }
        return trainstops;
    });
}
export function getAllData() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
//# sourceMappingURL=index.js.map
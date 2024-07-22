import { View, Animated, PanResponder, StyleSheet, Dimensions } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
// import ServiceAlerts from '@/components/ServiceAlerts';
import * as FileSystem from 'expo-file-system';
import * as tH from './transitHelper'
import { unzip } from 'react-native-zip-archive'
import { WebView } from 'react-native-webview';
import { html } from './webviewcontent'

// async function downloadGoogleTransit() {
//   // URL of the ZIP file
//   const zipFileUrl = 'http://web.mta.info/developers/data/nyct/subway/google_transit.zip';
//   // Local path to save the downloaded ZIP file
//   const localZipFilePath = `${FileSystem.documentDirectory}folder.zip`;
//   // Local path to unzip the contents of the ZIP file
//   const localUnzipPath = `${FileSystem.documentDirectory}unzippedFolder/`;

//   try {
//     // Download the ZIP file
//     const { uri } = await FileSystem.downloadAsync(zipFileUrl, localZipFilePath);
//     console.log(`Downloaded ZIP file to: ${uri}`);

//     // Unzip the downloaded file
//     const unzipPath = await unzip(uri, localUnzipPath);
//     console.log(`Unzipped to: ${unzipPath}`);
//   } catch (error) {
//     console.error(error);
//   }
// }


async function downloadGoogleTransit() {
  // URL of the ZIP file
  const zipFileUrl = 'http://web.mta.info/developers/data/nyct/subway/google_transit.zip';
  // Local path to save the downloaded ZIP file
  const localZipFilePath = `${FileSystem.documentDirectory}google_transit.zip`;
  // Local path to unzip the contents of the ZIP file
  const localUnzipPath = `${FileSystem.documentDirectory}google_transit`;

  try {
    // Check if the folder already exists
    const folderInfo = await FileSystem.getInfoAsync(localUnzipPath);
    const zipInfo = await FileSystem.getInfoAsync(localZipFilePath);
    console.log(folderInfo.exists, folderInfo.isDirectory)
    if (folderInfo.exists && folderInfo.isDirectory) {
      console.log('Folder already exists. No need to download.');
      return;
    }

    // Declare uri variable outside of the if block
    let uri;

    // Download the ZIP file only if it doesn't exist and is a directory
    console.log(zipInfo.exists, zipInfo.isDirectory)
    // ERROR IS HERE!!!
    if (!zipInfo.exists && zipInfo.isDirectory) {
      const downloadResult = await FileSystem.downloadAsync(zipFileUrl, localZipFilePath);
      uri = downloadResult.uri;
      console.log(`Downloaded ZIP file to: ${uri}`);
    }

    // Ensure uri is defined before attempting to unzip
    if (uri) {
      console.log(uri, localUnzipPath);
      unzip(uri, localUnzipPath, 'UTF-8')
        .then((path) => {
          // Handle successful unzip
          console.log('yay unzipped file!', localUnzipPath)
        })
        .catch((error) => {
          // Handle errors
        });
    } else {
      console.log("URI is not defined. Unable to unzip the file.");
    }
  } catch (error) {
    console.error(error);
  }
}

// example data - will be overrided
// var trainLines = [
//   { coordinates: [{ latitude: 37.78825, longitude: -122.4324 }, { latitude: 37.75825, longitude: -122.4424 }], color: '#FF0000' },
// ];

// var trainStops = [
//   { latitude: 40.709166, longitude: -74.004901, title: 'New York City' }
// ];

// heavy use of AI
function DraggableContainer(props: any) {
  // Suggested by AI - good to keep in mind.
  // const position = useRef(new Animated.ValueXY()).current;
  const [removeAlerts, setRemoveAlerts] = useState(false);
  // Drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Calculate the new Y position
        let newG = gestureState.dy;
        let newY = evt.nativeEvent.pageY;

        // if the mouse y is near the height of the screen - the current height of the container
        var collisionArea = props.height;
        const range = 100;
        // console.log(newY > collisionArea - range, newY < collisionArea + range)
        if (!(newY > collisionArea - range && newY < collisionArea + range)) {
          return false
        }

        // Prevent container from going too far off
        let max = 100;
        if (newY < max) {
          newY = max;
        }

        let min = 800;
        if (newY > min) {
          newY = min;
        }

        setRemoveAlerts(true)

        // console.log(newY, 'newY ', newG, 'newG')
        // position.setValue({ x: 0, y: newG - 35});
        // newY -= 40;
        props.setHeight(Dimensions.get('window').height - newY)
      },
      onPanResponderRelease: () => {
        // empty... (when mouse released)
        setRemoveAlerts(false)
      },
    })
  ).current;

  return (
    <View>
      <Animated.View
        style={[
          styles.draggableContainer,
          {
            height: props.height,
            // transform: [{ translateY: position.y }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {removeAlerts ? <></> : <></>}
      </Animated.View>
    </View>
  );
};

const LeafletMap = () => {
  // var htmlContent = assets ? assets : null;
  const [htmlContent, setHtmlContent] = useState(`<h1>Loading...</h1>`);
  const [jsContent, setJsContent] = useState('');
  const [entries, setEntries] = useState([]);
  const [downloaded, setDownloaded] = useState(false);
  const uri = FileSystem.cacheDirectory + "google_transit/google_transit.zip";

  async function createDirectory(path) {
    try {
      await FileSystem.makeDirectoryAsync(path, { intermediates: true });
      console.log(`Directory created at ${path}`);
    } catch (error) {
      console.error('Error creating directory:', error);
    }
  }

  async function readCacheDirectory(setEntries) {
    const entries = await FileSystem.readDirectoryAsync(
      FileSystem.cacheDirectory + "google_transit"
    );
    setEntries(entries);
  }

  async function isFileAsync(uri) {
    const result = await FileSystem.getInfoAsync(uri);
    return result.exists && !result.isDirectory;
  }

  async function listDirectoryContents(targetPath) {
    try {
      const contents = await FileSystem.readDirectoryAsync(targetPath);
      console.log('Directory contents:', contents);
    } catch (error) {
      console.error('Error reading directory:', error);
    }
  }

  useEffect(() => {
    createDirectory(FileSystem.cacheDirectory + "google_transit")
    const zipUrl = "http://web.mta.info/developers/data/nyct/subway/google_transit.zip";

    isFileAsync(uri).then((isFile) => {
      if (isFile) {
        console.log("ZIP file already downloaded");
        setDownloaded(true);
      } else {
        FileSystem.downloadAsync(zipUrl, uri)
          .then(({ uri }) => {
            console.log("Finished downloading to", uri);
            setDownloaded(true);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });
  }, []);

  useEffect(() => {
    if (downloaded) {
      // where we want to put the unzipped folder
      const targetPath = FileSystem.cacheDirectory + "google_transit/";

      unzip(uri, targetPath, "UTF-8")
        .then((path) => {
          console.log(`unzip completed at ${path}`);
          readCacheDirectory(setEntries);
        })
        .catch((error) => {
          console.error(error);
        });
        listDirectoryContents(targetPath);
        FileSystem.readAsStringAsync(targetPath + "/shapes.txt")
          .then((data) => {
            // console.log('stops.txt' + data);
            // inject data into html at var trainLineFunc = await getTrainLineShapes();
            let lineSplit = html.split('\n')
            for (var i = 0; i < lineSplit.length; i++) {
              if (lineSplit[i].includes('var trainLineFunc')) {
                let location = lineSplit[i].indexOf('(');
                let firstPart = lineSplit[i].slice(0, location + 1)
                let secondPart = ');'
                // modify the line to have the data injected
                lineSplit[i] = `${firstPart}\`${data}\`${secondPart}`;
                console.log(firstPart, secondPart)
              }
            }
            // console.log(lineSplit.join('\n'))
            setHtmlContent(lineSplit.join('\n'))
          })
          .catch((error) => {
            console.log(error);
          });
    }
  }, [downloaded]);

  return <WebView originWhitelist={['*']} source={{ html: htmlContent }} style={{ flex: 1 }} />;
};

export default function App() {
  const [draggableHeight, setDraggableHeight] = useState(Dimensions.get('window').height * 0.5);
  const [mapHeight, setMapHeight] = useState(Dimensions.get('window').height * 0.5);

  useEffect(() => {
    setMapHeight(Dimensions.get('window').height - draggableHeight);
  }, [draggableHeight]);

  function handleTapOutsideView() {
    // console.log(draggableHeight, 'dh')
    setDraggableHeight(Dimensions.get('window').height * 0.2)
  }

  return (
    <View>
      <View style={{ height: mapHeight }}>
        <LeafletMap />
      </View>
      <DraggableContainer height={draggableHeight} setHeight={setDraggableHeight}></DraggableContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  // container: {
  //   flex: 1
  // },
  draggableContainer: {
    width: '100%',
    backgroundColor: 'skyblue',
    borderRadius: 10,
  },
});

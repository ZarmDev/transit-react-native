import { View, Animated, PanResponder, StyleSheet, Dimensions } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import React, { useState, useEffect, useRef } from 'react';

// just example data for now...

const trainLines = [
  { coordinates: [{ latitude: 37.78825, longitude: -122.4324 }, { latitude: 37.75825, longitude: -122.4424 }], color: '#FF0000' },
];

const trainStops = [
  { latitude: 40.709166, longitude: -74.004901, title: 'New York City' }
];


// heavy use of AI
function DraggableContainer(props: any) {
  // Suggested by AI - good to keep in mind.
  // const position = useRef(new Animated.ValueXY()).current;

  // Drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // Calculate the new Y position
        let newG = gestureState.dy;
        let newY = evt.nativeEvent.pageY;

        // Prevent container from going too far off
        let max = 100;
        if (newY < max) {
          newY = max;
        }

        let min = 800;
        if (newY > min) {
          newY = min;
        }

        console.log(newY, 'newY ', newG, 'newG')
        // position.setValue({ x: 0, y: newG - 35});
        // newY -= 40;
        props.setHeight(Dimensions.get('window').height - newY)
      },
      onPanResponderRelease: () => {
        // empty... (when mouse released)
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
      </Animated.View>
    </View>
  );
};

export default function App() {
  const [draggableHeight, setDraggableHeight] = useState(Dimensions.get('window').height * 0.5);
  const [mapHeight, setMapHeight] = useState(Dimensions.get('window').height *0.5);

  useEffect(() => {
    setMapHeight(Dimensions.get('window').height - draggableHeight);
    // console.log(mapHeight + draggableHeight, 'test')
    // console.log(draggableHeight, 'dh')
    // console.log(Dimensions.get('window').height, 'total')
  }, [draggableHeight]);
  
  function handleTapOutsideView() {
    console.log(draggableHeight, 'dh')
    setDraggableHeight(Dimensions.get('window').height * 0.2)
  }

  return (
    <View>
      <MapView style={{ height: mapHeight }}
        initialRegion={
          {
            latitude: 40.709166,
            longitude: -74.004901,
            // what is delta??!
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }
        }
        onPress={handleTapOutsideView}>
        {trainLines.map((line, index) => (
          <Polyline key={index} coordinates={line.coordinates} strokeColor={line.color} strokeWidth={6} />
        ))}
        {trainStops.map((stop, index) => (
          <Marker key={index} coordinate={{ latitude: stop.latitude, longitude: stop.longitude }} title={stop.title} />
        ))}
      </MapView>
      <DraggableContainer height={draggableHeight} setHeight={setDraggableHeight}></DraggableContainer>
      {/* <View style={{
        width: "100%",
        height: "40%",
        backgroundColor: 'skyblue',
        borderRadius: 10,
      }}></View> */}
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

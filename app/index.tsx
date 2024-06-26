import { View, Animated, PanResponder, StyleSheet, Dimensions } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import React, { useState, useEffect, useRef } from 'react';
import ServiceAlerts from '@/components/ServiceAlerts';

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
        {removeAlerts ? <></> : <ServiceAlerts></ServiceAlerts>}
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
    // console.log(draggableHeight, 'dh')
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

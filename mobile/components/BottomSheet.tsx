import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DISMISS_THRESHOLD = 80;

interface Props {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ visible, onClose, children }: Props) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const animateIn = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 3,
      speed: 14,
    }).start();
  };

  const animateOut = (cb?: () => void) => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(cb);
  };

  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      animateIn();
    }
  }, [visible]);

  const handleClose = () => {
    animateOut(onClose);
  };

  // PanResponder is attached ONLY to the drag handle so TextInputs below are not affected
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 4,
      onPanResponderMove: (_, { dy }) => {
        if (dy >= 0) translateY.setValue(dy);
      },
      onPanResponderRelease: (_, { dy, vy }) => {
        if (dy > DISMISS_THRESHOLD || vy > 0.8) {
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        }
      },
    })
  ).current;

  const overlayOpacity = translateY.interpolate({
    inputRange: [0, SCREEN_HEIGHT * 0.6],
    outputRange: [0.45, 0],
    extrapolate: "clamp",
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Dimmed backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.kvWrapper}
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          {/* Drag handle — PanResponder lives here */}
          <View style={styles.handleArea} {...panResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  kvWrapper: {
    flex: 1,
    justifyContent: "flex-end",
    pointerEvents: "box-none",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 16,
  },
  handleArea: {
    alignItems: "center",
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E0",
  },
});

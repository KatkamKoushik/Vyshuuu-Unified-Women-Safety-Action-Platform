import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';

export type IconName =
  | 'nav'
  | 'compass'
  | 'shield'
  | 'legal'
  | 'document'
  | 'vault'
  | 'lock'
  | 'unlock'
  | 'search'
  | 'gps'
  | 'target'
  | 'store'
  | 'venue'
  | 'camera'
  | 'photo'
  | 'walk'
  | 'alert'
  | 'warning'
  | 'check'
  | 'close'
  | 'star'
  | 'trash'
  | 'refresh'
  | 'sun'
  | 'moon'
  | 'phone'
  | 'sos'
  | 'attach'
  | 'email'
  | 'share'
  | 'info'
  | 'settings';

interface AppIconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 20,
  color = '#0284C7',
  style,
}) => {
  const containerStyle = [
    styles.container,
    { width: size, height: size },
    style,
  ];

  switch (name) {
    case 'nav':
    case 'compass': {
      // Sleek navigation arrow rotated 45 deg
      const arrowSize = size * 0.7;
      return (
        <View style={containerStyle}>
          <View
            style={{
              width: arrowSize,
              height: arrowSize,
              borderTopWidth: 2,
              borderRightWidth: 2,
              borderColor: color,
              transform: [{ rotate: '-45deg' }, { translateY: arrowSize * 0.15 }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: 2,
              height: arrowSize * 0.9,
              backgroundColor: color,
              transform: [{ rotate: '0deg' }],
            }}
          />
        </View>
      );
    }

    case 'shield': {
      // Elegant security shield
      const w = size * 0.75;
      const h = size * 0.85;
      return (
        <View style={containerStyle}>
          <View
            style={{
              width: w,
              height: h,
              borderWidth: 1.8,
              borderColor: color,
              borderTopLeftRadius: w * 0.25,
              borderTopRightRadius: w * 0.25,
              borderBottomLeftRadius: w * 0.5,
              borderBottomRightRadius: w * 0.5,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 2,
                height: h * 0.45,
                backgroundColor: color,
              }}
            />
          </View>
        </View>
      );
    }

    case 'legal':
    case 'document': {
      // Official document with folded corner & content lines
      const w = size * 0.7;
      const h = size * 0.85;
      return (
        <View style={containerStyle}>
          <View
            style={{
              width: w,
              height: h,
              borderWidth: 1.8,
              borderColor: color,
              borderRadius: 3,
              padding: 2,
              justifyContent: 'center',
              gap: 2.5,
            }}
          >
            <View style={{ width: '80%', height: 1.5, backgroundColor: color, borderRadius: 1 }} />
            <View style={{ width: '100%', height: 1.5, backgroundColor: color, borderRadius: 1 }} />
            <View style={{ width: '60%', height: 1.5, backgroundColor: color, borderRadius: 1 }} />
          </View>
        </View>
      );
    }

    case 'vault':
    case 'lock': {
      // Secure padlock
      const bodyW = size * 0.75;
      const bodyH = size * 0.52;
      const shackleW = size * 0.46;
      const shackleH = size * 0.44;
      return (
        <View style={containerStyle}>
          {/* Shackle */}
          <View
            style={{
              width: shackleW,
              height: shackleH,
              borderTopWidth: 2,
              borderLeftWidth: 2,
              borderRightWidth: 2,
              borderColor: color,
              borderTopLeftRadius: shackleW / 2,
              borderTopRightRadius: shackleW / 2,
              marginBottom: -1,
            }}
          />
          {/* Body */}
          <View
            style={{
              width: bodyW,
              height: bodyH,
              borderWidth: 1.8,
              borderColor: color,
              borderRadius: 3,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 2.5,
                height: 4,
                backgroundColor: color,
                borderRadius: 1,
              }}
            />
          </View>
        </View>
      );
    }

    case 'unlock': {
      // Unlocked padlock
      const bodyW = size * 0.75;
      const bodyH = size * 0.52;
      const shackleW = size * 0.46;
      const shackleH = size * 0.44;
      return (
        <View style={containerStyle}>
          {/* Open Shackle */}
          <View
            style={{
              width: shackleW,
              height: shackleH,
              borderTopWidth: 2,
              borderLeftWidth: 2,
              borderColor: color,
              borderTopLeftRadius: shackleW / 2,
              borderTopRightRadius: shackleW / 2,
              marginBottom: -1,
              alignSelf: 'flex-start',
              marginLeft: size * 0.15,
            }}
          />
          {/* Body */}
          <View
            style={{
              width: bodyW,
              height: bodyH,
              borderWidth: 1.8,
              borderColor: color,
              borderRadius: 3,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: 2.5,
                height: 4,
                backgroundColor: color,
                borderRadius: 1,
              }}
            />
          </View>
        </View>
      );
    }

    case 'search': {
      // Magnifying glass
      const glassSize = size * 0.58;
      const handleLen = size * 0.32;
      return (
        <View style={containerStyle}>
          <View
            style={{
              width: glassSize,
              height: glassSize,
              borderRadius: glassSize / 2,
              borderWidth: 1.8,
              borderColor: color,
              marginTop: -size * 0.1,
              marginLeft: -size * 0.1,
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: 2,
              height: handleLen,
              backgroundColor: color,
              transform: [{ rotate: '-45deg' }],
              bottom: size * 0.12,
              right: size * 0.18,
              borderRadius: 1,
            }}
          />
        </View>
      );
    }

    case 'gps':
    case 'target': {
      // Concentric GPS target
      const outerSize = size * 0.8;
      const innerSize = size * 0.35;
      return (
        <View style={containerStyle}>
          <View
            style={{
              width: outerSize,
              height: outerSize,
              borderRadius: outerSize / 2,
              borderWidth: 1.8,
              borderColor: color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: innerSize,
                height: innerSize,
                borderRadius: innerSize / 2,
                backgroundColor: color,
              }}
            />
          </View>
          {/* Crosshairs */}
          <View
            style={{
              position: 'absolute',
              width: outerSize + 4,
              height: 1.5,
              backgroundColor: color,
              opacity: 0.5,
            }}
          />
          <View
            style={{
              position: 'absolute',
              height: outerSize + 4,
              width: 1.5,
              backgroundColor: color,
              opacity: 0.5,
            }}
          />
        </View>
      );
    }

    case 'store':
    case 'venue': {
      // Storefront with awning
      const w = size * 0.8;
      return (
        <View style={containerStyle}>
          {/* Awning */}
          <View
            style={{
              width: w,
              height: size * 0.3,
              borderWidth: 1.8,
              borderColor: color,
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
              backgroundColor: color,
              opacity: 0.25,
            }}
          />
          {/* Store body */}
          <View
            style={{
              width: w * 0.85,
              height: size * 0.45,
              borderWidth: 1.8,
              borderTopWidth: 0,
              borderColor: color,
              borderBottomLeftRadius: 2,
              borderBottomRightRadius: 2,
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            {/* Doorway */}
            <View
              style={{
                width: w * 0.35,
                height: size * 0.25,
                backgroundColor: color,
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
              }}
            />
          </View>
        </View>
      );
    }

    case 'camera':
    case 'photo': {
      // Modern camera with lens
      const w = size * 0.85;
      const h = size * 0.62;
      const lens = size * 0.35;
      return (
        <View style={containerStyle}>
          {/* Camera top notch */}
          <View
            style={{
              width: size * 0.28,
              height: 3,
              backgroundColor: color,
              borderTopLeftRadius: 2,
              borderTopRightRadius: 2,
              marginBottom: -1,
            }}
          />
          {/* Camera Body */}
          <View
            style={{
              width: w,
              height: h,
              borderWidth: 1.8,
              borderColor: color,
              borderRadius: 4,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Center lens */}
            <View
              style={{
                width: lens,
                height: lens,
                borderRadius: lens / 2,
                borderWidth: 1.5,
                borderColor: color,
              }}
            />
          </View>
        </View>
      );
    }

    case 'walk': {
      // Dynamic pedestrian indicator
      const head = size * 0.22;
      return (
        <View style={containerStyle}>
          {/* Head */}
          <View
            style={{
              width: head,
              height: head,
              borderRadius: head / 2,
              backgroundColor: color,
              marginBottom: 2,
            }}
          />
          {/* Body & legs */}
          <View
            style={{
              width: 2,
              height: size * 0.38,
              backgroundColor: color,
              borderRadius: 1,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              width: size * 0.45,
              justifyContent: 'space-between',
              marginTop: -2,
            }}
          >
            <View
              style={{
                width: 2,
                height: size * 0.25,
                backgroundColor: color,
                transform: [{ rotate: '25deg' }],
              }}
            />
            <View
              style={{
                width: 2,
                height: size * 0.25,
                backgroundColor: color,
                transform: [{ rotate: '-25deg' }],
              }}
            />
          </View>
        </View>
      );
    }

    case 'alert':
    case 'warning': {
      // Alert triangle / badge
      return (
        <View style={containerStyle}>
          <View
            style={{
              width: size * 0.8,
              height: size * 0.8,
              borderWidth: 1.8,
              borderColor: color,
              borderRadius: 4,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: color,
                fontSize: size * 0.5,
                fontWeight: '900',
                marginTop: -1,
              }}
            >
              !
            </Text>
          </View>
        </View>
      );
    }

    case 'check': {
      // Crisp checkmark
      const checkW = size * 0.55;
      const checkH = size * 0.35;
      return (
        <View style={containerStyle}>
          <View
            style={{
              width: checkW,
              height: checkH,
              borderBottomWidth: 2.2,
              borderLeftWidth: 2.2,
              borderColor: color,
              transform: [{ rotate: '-45deg' }, { translateY: -size * 0.08 }],
            }}
          />
        </View>
      );
    }

    case 'close': {
      // Sharp X
      const barLen = size * 0.7;
      return (
        <View style={containerStyle}>
          <View
            style={{
              position: 'absolute',
              width: barLen,
              height: 2,
              backgroundColor: color,
              borderRadius: 1,
              transform: [{ rotate: '45deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: barLen,
              height: 2,
              backgroundColor: color,
              borderRadius: 1,
              transform: [{ rotate: '-45deg' }],
            }}
          />
        </View>
      );
    }

    case 'star': {
      // Crisp geometric 8-point star badge
      const sSize = size * 0.55;
      return (
        <View style={containerStyle}>
          <View
            style={{
              position: 'absolute',
              width: sSize,
              height: sSize,
              borderRadius: 2,
              backgroundColor: color,
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: sSize,
              height: sSize,
              borderRadius: 2,
              backgroundColor: color,
              transform: [{ rotate: '45deg' }],
            }}
          />
        </View>
      );
    }

    case 'trash': {
      // Clean trash bin
      const w = size * 0.65;
      const h = size * 0.6;
      return (
        <View style={containerStyle}>
          {/* Lid */}
          <View
            style={{
              width: w * 1.2,
              height: 2,
              backgroundColor: color,
              borderRadius: 1,
              marginBottom: 1.5,
            }}
          />
          {/* Bin */}
          <View
            style={{
              width: w,
              height: h,
              borderWidth: 1.8,
              borderColor: color,
              borderBottomLeftRadius: 3,
              borderBottomRightRadius: 3,
              borderTopWidth: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View style={{ width: 1.5, height: h * 0.5, backgroundColor: color }} />
          </View>
        </View>
      );
    }

    case 'refresh': {
      // Circular refresh loop
      const rSize = size * 0.7;
      return (
        <View style={containerStyle}>
          <View
            style={{
              width: rSize,
              height: rSize,
              borderRadius: rSize / 2,
              borderWidth: 1.8,
              borderColor: color,
              borderTopColor: 'transparent',
              transform: [{ rotate: '45deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: size * 0.12,
              right: size * 0.15,
              width: 0,
              height: 0,
              borderLeftWidth: 3,
              borderRightWidth: 3,
              borderBottomWidth: 5,
              borderStyle: 'solid',
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: color,
              transform: [{ rotate: '45deg' }],
            }}
          />
        </View>
      );
    }

    case 'sun': {
      // Radiant daylight sun
      const core = size * 0.45;
      return (
        <View style={containerStyle}>
          <View
            style={{
              width: core,
              height: core,
              borderRadius: core / 2,
              borderWidth: 1.8,
              borderColor: color,
              backgroundColor: color + '33',
            }}
          />
          {/* Radial ticks */}
          <View style={{ position: 'absolute', width: size * 0.8, height: 1.5, backgroundColor: color, opacity: 0.6 }} />
          <View style={{ position: 'absolute', height: size * 0.8, width: 1.5, backgroundColor: color, opacity: 0.6 }} />
        </View>
      );
    }

    case 'moon': {
      // Night crescent
      const r = size * 0.65;
      return (
        <View style={containerStyle}>
          <View
            style={{
              width: r,
              height: r,
              borderRadius: r / 2,
              borderWidth: 2,
              borderTopColor: color,
              borderLeftColor: color,
              borderBottomColor: color,
              borderRightColor: 'transparent',
              transform: [{ rotate: '-30deg' }],
            }}
          />
        </View>
      );
    }

    case 'phone': {
      // Clean handset
      return (
        <View style={containerStyle}>
          <View
            style={{
              width: size * 0.65,
              height: size * 0.65,
              borderWidth: 2,
              borderColor: color,
              borderRadius: 4,
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              transform: [{ rotate: '-45deg' }],
            }}
          />
        </View>
      );
    }

    case 'sos': {
      return (
        <View style={containerStyle}>
          <View
            style={{
              paddingHorizontal: 4,
              paddingVertical: 1,
              borderRadius: 3,
              backgroundColor: color,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: size * 0.42, fontWeight: '900' }}>
              SOS
            </Text>
          </View>
        </View>
      );
    }

    case 'attach': {
      // Paperclip
      return (
        <View style={containerStyle}>
          <View
            style={{
              width: size * 0.38,
              height: size * 0.72,
              borderWidth: 1.8,
              borderColor: color,
              borderRadius: size * 0.19,
              transform: [{ rotate: '45deg' }],
            }}
          />
        </View>
      );
    }

    case 'email': {
      // Envelope
      const w = size * 0.8;
      const h = size * 0.55;
      return (
        <View style={containerStyle}>
          <View
            style={{
              width: w,
              height: h,
              borderWidth: 1.8,
              borderColor: color,
              borderRadius: 2,
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: w * 0.65,
                height: h * 0.5,
                borderBottomWidth: 1.5,
                borderRightWidth: 1.5,
                borderColor: color,
                transform: [{ rotate: '45deg' }, { translateY: -h * 0.2 }],
              }}
            />
          </View>
        </View>
      );
    }

    case 'share': {
      // Share icon (3 nodes connected)
      const node = size * 0.22;
      return (
        <View style={containerStyle}>
          <View
            style={{
              position: 'absolute',
              left: 2,
              width: node,
              height: node,
              borderRadius: node / 2,
              backgroundColor: color,
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: 2,
              top: 2,
              width: node,
              height: node,
              borderRadius: node / 2,
              backgroundColor: color,
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: 2,
              bottom: 2,
              width: node,
              height: node,
              borderRadius: node / 2,
              backgroundColor: color,
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: size * 0.5,
              height: 1.5,
              backgroundColor: color,
              transform: [{ rotate: '-25deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: size * 0.5,
              height: 1.5,
              backgroundColor: color,
              transform: [{ rotate: '25deg' }],
            }}
          />
        </View>
      );
    }

    case 'info': {
      const outer = size * 0.75;
      return (
        <View style={containerStyle}>
          <View
            style={{
              width: outer,
              height: outer,
              borderRadius: outer / 2,
              borderWidth: 1.8,
              borderColor: color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color, fontSize: size * 0.45, fontWeight: '700' }}>i</Text>
          </View>
        </View>
      );
    }

    case 'settings': {
      const outer = size * 0.75;
      return (
        <View style={containerStyle}>
          <View
            style={{
              width: outer,
              height: outer,
              borderRadius: outer / 2,
              borderWidth: 2,
              borderColor: color,
              borderStyle: 'dashed',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                width: outer * 0.35,
                height: outer * 0.35,
                borderRadius: (outer * 0.35) / 2,
                backgroundColor: color,
              }}
            />
          </View>
        </View>
      );
    }

    default: {
      return (
        <View style={containerStyle}>
          <View
            style={{
              width: size * 0.6,
              height: size * 0.6,
              borderRadius: 2,
              backgroundColor: color,
            }}
          />
        </View>
      );
    }
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});

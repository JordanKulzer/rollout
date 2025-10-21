import React, { useLayoutEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Image,
  Dimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import * as FileSystem from "expo-file-system/legacy";
import * as mime from "react-native-mime-types";
import { supabase } from "../../lib/supabase";

const { width } = Dimensions.get("window");

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  const isFocused = useIsFocused(); // Ensures camera stops when switching tabs
  const navigation = useNavigation();

  useLayoutEffect(() => {
    // Hide tab bar if a photo is being previewed
    navigation.getParent()?.setOptions({
      tabBarStyle: photoUri ? { display: "none" } : undefined,
    });
  }, [navigation, photoUri]);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "white", marginBottom: 12 }}>
          We need your permission to use the camera
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Grant Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotoUri(photo.uri);
    }
  };

  const confirmPhoto = async () => {
    if (!photoUri) return;

    try {
      const fileExt = photoUri.split(".").pop();
      const fileName = `photo-${Date.now()}.${fileExt}`;
      const fileType = mime.lookup(fileExt) || "image/jpeg";

      // Read file as base64
      const base64Data = await FileSystem.readAsStringAsync(photoUri, {
        encoding: "base64",
      });

      // Convert base64 → ArrayBuffer (Supabase expects binary)
      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("photos")
        .upload(fileName, bytes.buffer, {
          contentType: fileType,
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      const photoUrl = publicUrlData.publicUrl;

      // Insert into posts
      const user = (await supabase.auth.getUser()).data.user;
      const { error: insertError } = await supabase.from("posts").insert([
        {
          user_id: user.id,
          photo_url: photoUrl,
          caption: "", // optional
        },
      ]);

      if (insertError) throw insertError;

      console.log("✅ Uploaded and saved post!");
      setPhotoUri(null);
      navigation.navigate("Home");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please try again.");
    }
  };

  const retakePhoto = () => setPhotoUri(null);
  const toggleCamera = () => setFacing(facing === "back" ? "front" : "back");

  // 🖼️ PREVIEW UI
  if (photoUri) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: photoUri }} style={styles.previewImage} />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradientOverlay}
        />

        <View style={styles.previewActions}>
          <TouchableOpacity style={styles.iconButton} onPress={retakePhoto}>
            <Icon name="refresh" size={34} color="white" />
            <Text style={styles.buttonLabel}>Retake</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, styles.confirmButton]}
            onPress={confirmPhoto}
          >
            <Icon name="checkmark-circle" size={34} color="#4CAF50" />
            <Text style={styles.buttonLabel}>Use Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 📸 CAMERA UI
  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
        />
      )}

      <LinearGradient
        colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.6)"]}
        style={StyleSheet.absoluteFill}
      />

      <TouchableOpacity style={styles.flipButton} onPress={toggleCamera}>
        <Icon name="camera-reverse-outline" size={32} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
        <View style={styles.outerCircle}>
          <View style={styles.innerCircle} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },
  permissionButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  flipButton: {
    position: "absolute",
    top: 50,
    right: 30,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 40,
    padding: 8,
  },
  captureButton: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
  outerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 5,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  innerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
  // PREVIEW
  previewContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "flex-end",
  },
  previewImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  previewActions: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingBottom: 50,
    backgroundColor: "transparent",
  },
  iconButton: {
    alignItems: "center",
  },
  confirmButton: {
    // visually distinct
  },
  buttonLabel: {
    color: "white",
    marginTop: 6,
    fontSize: 15,
    fontWeight: "500",
  },
});

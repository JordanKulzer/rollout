import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { TextInput, Button, Text, Snackbar } from "react-native-paper";
import { supabase } from "../../lib/supabase";

export default function SignupScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleSignup = async () => {
    try {
      setLoading(true);

      // 1️⃣ Create the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // 2️⃣ Create a matching profile entry
      if (data.user) {
        const { error: insertError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            username: email.split("@")[0],
            avatar_url: "", // placeholder, can update later
          },
        ]);

        if (insertError) {
          console.error("Error creating profile:", insertError);
          alert("Profile creation failed. Please try again.");
          return;
        }
      }

      setSnackbarVisible(true);
    } catch (err: any) {
      console.error("Signup error:", err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account ✨</Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
        keyboardType="email-address"
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleSignup}
        loading={loading}
        style={styles.button}
      >
        Sign Up
      </Button>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Log In</Text>
      </TouchableOpacity>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{ backgroundColor: "#4CAF50" }}
      >
        ✅ Account created! You’re now logged in.
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: { marginBottom: 12 },
  button: {
    marginTop: 8,
    borderRadius: 6,
  },
  link: { textAlign: "center", color: "#4CAF50", marginTop: 16 },
});

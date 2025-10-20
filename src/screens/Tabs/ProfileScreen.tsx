import React from "react";
import { View, Text, Button } from "react-native";
import { supabase } from "../../lib/supabase";

export default function ProfileScreen() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20 }}>Profile page</Text>
      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
}

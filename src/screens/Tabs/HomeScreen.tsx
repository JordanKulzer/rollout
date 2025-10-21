import React, { useEffect, useState } from "react";
import { View, FlatList, Image, RefreshControl } from "react-native";
import {
  Card,
  Text,
  Avatar,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

export default function HomeScreen() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const insets = useSafeAreaInsets(); // returns { top, bottom, left, right }

  const fetchPosts = async () => {
    setLoading(true);
    const user = (await supabase.auth.getUser()).data.user;

    const { data: following } = await supabase
      .from("follows")
      .select("followed_id")
      .eq("follower_id", user.id);

    const followingIds = following?.map((f) => f.followed_id) || [];

    // Include your own posts
    const visibleIds = [...followingIds, user.id];

    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles(username, avatar_url)")
      .in("user_id", visibleIds)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel("public:posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          setPosts((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );

  const renderItem = ({ item }: any) => (
    <Card style={{ marginVertical: 10, marginHorizontal: 12, elevation: 2 }}>
      <Card.Title
        title={item.profiles?.username || "Anonymous"}
        left={() => (
          <Avatar.Image
            size={40}
            source={{
              uri:
                item.profiles?.avatar_url || "https://i.pravatar.cc/150?img=10",
            }}
          />
        )}
      />
      <Card.Cover
        source={{ uri: item.photo_url }}
        style={{ borderRadius: 0, height: 250 }}
      />
      <Card.Content>
        <Text style={{ marginTop: 10, fontSize: 15 }}>
          {item.caption || "No caption"}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: insets.top }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

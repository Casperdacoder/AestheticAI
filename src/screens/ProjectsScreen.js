import React from 'react';
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { colors } from '../components/UI';
import { Ionicons } from '@expo/vector-icons';

const items = [1,2,3,4].map(i => ({
  id: String(i),
  title: `Design ${i}`,
  img: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&q=60'
}));

export default function ProjectsScreen({ navigation }) {
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ color: colors.teal, fontSize:22, fontWeight:'800', marginBottom:10 }}>My Designs</Text>
      <FlatList
        data={items}
        numColumns={2}
        keyExtractor={(it) => it.id}
        columnWrapperStyle={{ gap:12 }}
        ItemSeparatorComponent={() => <View style={{ height:12 }}/>}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={()=>navigation.navigate('DesignDetail', { item })} style={{ flex:1, backgroundColor:'#fff', borderRadius:12, overflow:'hidden', elevation:2 }}>
            <Image source={{ uri:item.img }} style={{ width:'100%', height:120 }} />
            <View style={{ padding:10 }}>
              <Text style={{ color:'#111' }}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        onPress={()=>navigation.navigate('Upload')}
        style={{ position:'absolute', right:20, bottom:24, width:60, height:60, borderRadius:30, backgroundColor: colors.teal, alignItems:'center', justifyContent:'center', elevation:4 }}
      >
        <Ionicons name="add" color="#fff" size={30}/>
      </TouchableOpacity>
    </View>
  );
}

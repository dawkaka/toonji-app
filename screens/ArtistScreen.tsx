import React,{useState, useEffect, useCallback,useRef} from 'react'
import {View, Text, ScrollView, Pressable, Image, Animated, StyleSheet, ActivityIndicator} from 'react-native'
import {LinearGradient} from 'expo-linear-gradient'
import  {FontAwesome,MaterialIcons, Ionicons} from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import axios from 'axios'

import {RootStackScreenProps} from '../types'
import {ThemedText, ThemedView} from '../components/Themed'
import LyricsCard from '../components/Lyricscard'
import {Achievement} from '../components/General'
import layout from '../constants/Layout'
import colors from '../constants/Colors'
import {BASEURL} from '../constants/Credentials'



const Height_Max =  50/100 * layout.window.height
const Height_Min = 53
const Scroll_Dist = Height_Max - Height_Min

export default function ArtistScreen({route, navigation}:RootStackScreenProps<'Artist'>) {
  const artist = route.params.userName
  const [isLoading, setIsloading] = useState(false)
  const [isEnd, setIsEnd] = useState(false)
  const [next, setNext] = useState(9)
  const [songs, setSongs] = useState([])
  const [userInfo, setUserInfo] = useState({name:'-',bio: '-', followers: '-', noSongs: '-',
                                            topFans: '-', points: '-'})

  const scrollY = useRef(new Animated.Value(0)).current
  const height = scrollY.interpolate({
    inputRange: [0,Scroll_Dist],
    outputRange: [Height_Max, Height_Min],
    extrapolate: 'clamp'
  })

  const imageOpacity = scrollY.interpolate({
    inputRange: [0,Scroll_Dist/2,Scroll_Dist],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp'
  })

  const nameSize =  scrollY.interpolate({
    inputRange: [0,Scroll_Dist * 2],
    outputRange: [1,  0.7],
    extrapolate: 'clamp',
  })

  const shiftX = scrollY.interpolate({
    inputRange: [0,Scroll_Dist * 2],
    outputRange: [0,  45],
    extrapolate: 'clamp',
  })
  const shiftI = scrollY.interpolate({
    inputRange: [0,Scroll_Dist * 2],
    outputRange: [0,  60],
    extrapolate: 'clamp',
  })

   useEffect(() => {
     axios.get(BASEURL + 'p/' + artist)
     .then(res => {
       setUserInfo(res.data)
     })
     .catch(err => {
       console.log(err)
     })

   },[])

   useEffect(() => {
     setIsloading(true)
     axios.get(BASEURL + 'p/songs/'+ artist + '/0')
     .then(res => {
       setSongs(res.data.songs)
       setIsloading(false)
       setIsEnd(res.data.isEnd)
       setNext(res.data.nextFetch)
     })
     .catch(err => {
       console.log(err)
       setIsloading(false)
     })
   },[])


   const fetchMore =  useCallback(()=>{
     setIsloading(true)
     axios.get(BASEURL + 'p/songs/'+ artist + '/' + next)
     .then(res => {
       setSongs(prev => prev.concat(res.data.songs))
       setIsloading(false)
       setIsEnd(res.data.isEnd)
       setNext(res.data.nextFetch)
     })
     .catch(err => {
       console.log(err)
       setIsloading(false)
     })

   },[])


  return (
    <View>
    <StatusBar  style = "light" backgroundColor = "black"/>
    <Animated.View style = {[{position:'absolute', zIndex:1},{height}]}>

    <Animated.View style = {[styles.imageGradient,{backgroundColor:'black'},{height}]}>
    </Animated.View>
    <Animated.Image source = {require('../assets/images/aotp.jpg')}
    style = {[styles.image,{height, opacity: imageOpacity}]} />

    <LinearGradient
      colors={['transparent','transparent', 'black']}
      style={[styles.imageGradient,{}]}>

    </LinearGradient>

    <Animated.View style = {[styles.nameContainer,{height}]}>
    <View style = {{flexBasis: '70%'}}>
    <Animated.Text style = {[styles.name,{transform:[{translateX: shiftX},{scale: nameSize}]}]}>
    {userInfo.name}

    {userInfo.name !== "-" && <Animated.View style = {{transform:[{translateX: shiftI},{scale: nameSize}]}}>
    <View style = {{position:'absolute',height: 13, width:13, top: 6, left: 6,
                    backgroundColor: 'white',borderRadius:50}}></View>
    <MaterialIcons name="verified" size={25} color=  {colors.mainColor} />
    </Animated.View>}

    </Animated.Text>
    </View>

    <View>
    <Pressable style={styles.button}>
     <Text style={styles.text}>follow</Text>
    </Pressable>
    </View>
    </Animated.View>
    <Pressable
     onPress = {()=> navigation.goBack() }
     style = {({pressed})=>[{opacity: pressed ? 0.5: 1}]}
    >
    <View style = {{marginTop: 3, padding: 7, backgroundColor:'rgba(0, 0, 0, 0.3)', borderRadius:50}}>
    <Ionicons name="ios-arrow-back-sharp" size={35} color={'white'} />
    </View>
    </Pressable>
    </Animated.View>

    <ScrollView contentContainerStyle = {styles.scrollContainer}
     scrollEventThrottle = {16}
     onScroll = {Animated.event([{ nativeEvent: {contentOffset: {y: scrollY}}}])}
    >
    <ThemedView style = {styles.achievementsContainer}>
    <Achievement top = {userInfo.noSongs} bottom = "songs"/>
    <Achievement top = {userInfo.points} bottom = "points"/>
    <Achievement top = {userInfo.followers} bottom = "followers"/>
    <Achievement top = {userInfo.topFans} bottom = "top fans"/>
    </ThemedView>

    <ThemedView style = {{padding: 20,marginHorizontal:5, borderRadius: 10}}>
    <ThemedText style = {{fontWeight: 'bold'}}>Bio</ThemedText>
    <View style = {{height: 3, width: 20, backgroundColor: colors.mainColor, marginBottom:10}}></View>
    <ThemedText>{userInfo.bio}</ThemedText>
    </ThemedView>

    <View style = {styles.songsContainer}>
    <ThemedText style = {{fontWeight: 'bold'}}>Songs</ThemedText>
    <View style = {{height: 3, width: 40, backgroundColor: colors.mainColor, marginBottom:10}}></View>
    {songs.map((a,indx) => <LyricsCard data = {a} key = {indx} />)}
    {(!isLoading && !isEnd) &&
      <Pressable onPress = {fetchMore}>
       <FontAwesome name = "refresh" size = {18} color = {colors.mainColor} />
       </Pressable>
     }
    {isLoading && <ActivityIndicator  color = {colors.mainColor} />}
    </View>

    </ScrollView>
    </View>
  )
}






const styles = StyleSheet.create({
   scrollContainer: {
     marginVertical: Height_Max,
     paddingBottom: Height_Max
   },
   image: {
     width: layout.window.width,
     position: 'absolute',
     top: 0,
     left: 0
   },
   imageGradient: {
     position: 'absolute',
     width: layout.window.width,
     top: 0,
     left: 0

   },
   nameContainer:  {
     position: 'absolute',
     top:0,
     left: 0,
     width: layout.window.width,
     flexDirection: 'row',
     justifyContent:'space-between',
     alignItems: 'flex-end',
     paddingHorizontal: 10,

   },
   name: {
     color: 'white',
     fontSize: 40,
     fontWeight: 'bold',
   },
   button: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 4,
    backgroundColor: colors.mainColor,
    marginBottom: 7
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
   achievementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    marginHorizontal: 5,
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 10
  },
  songsContainer: {
     marginTop: 20,
     alignItems: 'center',
     padding: 20,
  }
})